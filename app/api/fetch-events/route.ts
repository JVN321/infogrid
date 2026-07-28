import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CONVEX_API_URL =
  process.env.CONVEX_EVENTS_API_URL || "https://convexapi.mitsmediaclub.com/api/events";
const CONVEX_AUTH_TOKEN =
  process.env.CONVEX_EVENTS_AUTH_TOKEN || "grid_events-OLCc90BjG8dwc291Po0ogbUvcbSLEGLb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const autoSync = searchParams.get("sync") === "true";

  try {
    // 1. Fetch raw events from Convex API with Authorization header
    const res = await fetch(CONVEX_API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${CONVEX_AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Convex API responded with status ${res.status}: ${res.statusText}`);
    }

    const responseJson = await res.json();
    let rawEvents: any[] = [];

    if (Array.isArray(responseJson)) {
      rawEvents = responseJson;
    } else if (responseJson && Array.isArray(responseJson.events)) {
      rawEvents = responseJson.events;
    } else if (responseJson && Array.isArray(responseJson.data)) {
      rawEvents = responseJson.data;
    } else {
      return NextResponse.json(
        { error: "Invalid response format from Convex events API", raw: responseJson },
        { status: 502 }
      );
    }

    // 2. Fetch existing externalIds from Prisma database for redundancy checking
    let existingExternalIds = new Set<string>();
    let isDbAvailable = false;

    try {
      const existingDbEvents = await prisma.eventItem.findMany({
        select: { externalId: true, title: true },
      });
      existingDbEvents.forEach((item) => {
        if (item.externalId) existingExternalIds.add(item.externalId);
        if (item.title) existingExternalIds.add(item.title.toLowerCase().trim());
      });
      isDbAvailable = true;
    } catch (e) {
      console.warn("Prisma DB not available during fetch-events check, using client-side deduplication.");
    }

    // 3. Map & Filter out duplicate/redundant events
    const colors: Array<"blue" | "green" | "purple" | "orange"> = [
      "blue",
      "green",
      "purple",
      "orange",
    ];

    const categoryBadgeBgs: Record<string, string> = {
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      green: "bg-emerald-50 text-emerald-700 border-emerald-200",
      purple: "bg-purple-50 text-purple-700 border-purple-200",
      orange: "bg-amber-50 text-amber-700 border-amber-200",
    };

    const newEventsToImport: any[] = [];
    let alreadyExistedCount = 0;

    for (let idx = 0; idx < rawEvents.length; idx++) {
      const raw = rawEvents[idx];
      const externalId = raw._id || `convex-${idx}`;
      const titleClean = (raw.title || "").trim();

      // Redundancy Check: Skip if externalId or title already exists in DB
      if (
        existingExternalIds.has(externalId) ||
        existingExternalIds.has(titleClean.toLowerCase())
      ) {
        alreadyExistedCount++;
        continue;
      }

      // Parse Date
      let day = "15";
      let month = "JUN";
      let formattedDateStr = "15 Jun 2026";
      let dateRangeStr = "15 June 2026";

      if (raw.date) {
        const d = new Date(raw.date);
        if (!isNaN(d.getTime())) {
          day = d.getDate().toString().padStart(2, "0");
          month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
          formattedDateStr = d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          dateRangeStr = d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
        }
      }

      // Time string format
      let timeStr = "02:00 PM onwards";
      if (raw.startTime) {
        timeStr = raw.endTime
          ? `${raw.startTime} - ${raw.endTime}`
          : `${raw.startTime} onwards`;
      }

      // Direct link to the event page on Grid
      const eventGridId = raw._id || externalId;
      const ctaLink = `https://grid.mitsmediaclub.com/events/${eventGridId}`;

      const colorChoice = colors[idx % colors.length];
      const categoryBadgeBg = categoryBadgeBgs[colorChoice];

      const mappedEvent = {
        externalId: externalId,
        badge: raw.isFeatured ? "Featured Event" : "Media Club Event",
        title: titleClean || "MITS Campus Event",
        tagline: raw.location ? `Venue: ${raw.location}` : "Join the campus community event",
        description: raw.description || "Official campus event hosted by MITS Media Club & Clubs.",
        dateRange: dateRangeStr,
        date: formattedDateStr,
        day: day,
        month: month,
        time: timeStr,
        venue: raw.location || "MITS Campus",
        category: (() => {
          if (raw.date) {
            const eventDate = new Date(raw.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Start of today
            // If the event is in the past (before today)
            if (eventDate < today) {
              return "Finished";
            }
          }
          return raw.isRegistrationRequired ? "Registration Open" : "Open Event";
        })(),
        color: colorChoice,
        categoryBadgeBg: categoryBadgeBg,
        image:
          raw.bannerUrl ||
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80",
        ctaText: "Register Now",
        ctaLink: ctaLink,
        isFeatured: Boolean(raw.isFeatured),
        isRegistrationRequired: Boolean(raw.isRegistrationRequired),
      };

      newEventsToImport.push(mappedEvent);
      // Mark added to prevent intra-batch duplicates
      existingExternalIds.add(externalId);
      existingExternalIds.add(titleClean.toLowerCase());
    }

    // 4. If autoSync=true and database is available, persist new events to Prisma
    let insertedDbCount = 0;
    if (autoSync && isDbAvailable && newEventsToImport.length > 0) {
      for (const evt of newEventsToImport) {
        try {
          await prisma.eventItem.create({
            data: evt,
          });
          insertedDbCount++;
        } catch (dbErr: any) {
          console.warn(`Failed to insert event ${evt.title}:`, dbErr.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      provider: "Convex MITS Media Club API (https://convexapi.mitsmediaclub.com/api/events)",
      totalRemoteEvents: rawEvents.length,
      newEventsCount: newEventsToImport.length,
      alreadyExistedCount: alreadyExistedCount,
      autoSyncedToDb: autoSync ? insertedDbCount : 0,
      events: newEventsToImport,
    });
  } catch (error: any) {
    console.error("Fetch Convex Events API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch events from Convex API",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
