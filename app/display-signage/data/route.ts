import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { defaultSkeletonData, PortalData } from "@/data/skeletonData";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function computeDataVersion(news: any[], generalNews: any[], events: any[], achievements: any[], slides: any[]) {
  const getItemHash = (items: any[]) =>
    items
      .map((i) => `${i.id || ''}:${i.title || i.titleHighlight || ''}:${i.updatedAt ? new Date(i.updatedAt).getTime() : i.createdAt ? new Date(i.createdAt).getTime() : ''}`)
      .join("|");

  return [
    news.length, getItemHash(news),
    generalNews.length, getItemHash(generalNews),
    events.length, getItemHash(events),
    achievements.length, getItemHash(achievements),
    slides.length, getItemHash(slides),
  ].join("___");
}

function getGridEventUrl(evt: any) {
  if (!evt) return "#";
  if (evt.ctaLink && evt.ctaLink.trim() !== "") {
    return evt.ctaLink;
  }
  const eventId = evt.externalId || evt.id;
  return eventId ? `https://grid.mitsmediaclub.com/events/${eventId}` : "#";
}

export async function GET(req: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [news, generalNews, events, achievements, slides] = await Promise.all([
      prisma.newsItem.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.generalNewsItem.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.eventItem.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.achievementItem.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.heroSlide.findMany({ orderBy: { orderIndex: "asc" } }),
    ]);

    const dataVersion = computeDataVersion(news, generalNews, events, achievements, slides);

    // Filter out past and finished events completely
    const activeEvents = events.filter((evt) => {
      const cat = (evt.category || "").toLowerCase();
      if (cat.includes("closed") || cat.includes("finished") || cat.includes("completed") || cat.includes("ended")) {
        return false;
      }
      if (evt.date) {
        const evtDate = new Date(evt.date);
        if (!isNaN(evtDate.getTime()) && evtDate < today) {
          return false;
        }
      }
      return true;
    });

    const portalData: PortalData = {
      header: defaultSkeletonData.header,
      heroSlides: slides as any,
      news: news as any,
      generalNews: generalNews as any,
      featuredEvent: activeEvents.length > 0 ? {
        title: activeEvents[0].title,
        tagline: activeEvents[0].tagline || activeEvents[0].description || "",
        badge: activeEvents[0].badge || activeEvents[0].category || "Featured Event",
        dateRange: activeEvents[0].dateRange || activeEvents[0].date || "",
        venue: activeEvents[0].venue || "Campus",
        ctaText: activeEvents[0].ctaText || "Register Now",
        image: activeEvents[0].image || "",
        ctaLink: getGridEventUrl(activeEvents[0]),
      } : defaultSkeletonData.featuredEvent,
      upcomingEvents: activeEvents as any,
      achievements: achievements as any,
      footer: defaultSkeletonData.footer,
    };

    return NextResponse.json(
      { version: dataVersion, data: portalData },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error: any) {
    console.error("Error fetching signage data:", error);
    return NextResponse.json(
      { version: "error", data: defaultSkeletonData },
      { status: 500 }
    );
  }
}
