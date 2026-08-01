import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { defaultSkeletonData, PortalData, NewsItem, GeneralNewsItem, UpcomingEvent, AchievementItem } from "@/data/skeletonData";

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

function getISTDateTime() {
  const now = new Date();
  const liveTime = now.toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const liveDay = now.toLocaleDateString("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
  });
  const liveDate = now.toLocaleDateString("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return { liveTime, liveDay, liveDate };
}

function getGridEventUrl(evt: any) {
  if (!evt) return "#";
  if (evt.ctaLink && evt.ctaLink.trim() !== "") {
    return evt.ctaLink;
  }
  const eventId = evt.externalId || evt.id;
  return eventId ? `https://grid.mitsmediaclub.com/events/${eventId}` : "#";
}

function getTagColorClass(color: string) {
  switch (color) {
    case "blue": return "bg-sky-100 text-sky-700 border-sky-200";
    case "green": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "darkgreen": return "bg-green-100 text-green-800 border-green-200";
    case "orange": return "bg-amber-100 text-amber-700 border-amber-200";
    case "purple": return "bg-purple-100 text-purple-700 border-purple-200";
    default: return "bg-blue-100 text-blue-700 border-blue-200";
  }
}

function getDateColorClasses(color: string) {
  switch (color) {
    case "blue":
      return { bg: "bg-blue-50 text-blue-700 border-blue-200", dayText: "text-blue-700", monthText: "text-blue-500" };
    case "green":
      return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dayText: "text-emerald-700", monthText: "text-emerald-500" };
    case "purple":
      return { bg: "bg-purple-50 text-purple-700 border-purple-200", dayText: "text-purple-700", monthText: "text-purple-500" };
    case "orange":
      return { bg: "bg-amber-50 text-amber-700 border-amber-200", dayText: "text-amber-700", monthText: "text-amber-500" };
    default:
      return { bg: "bg-blue-50 text-blue-700 border-blue-200", dayText: "text-blue-700", monthText: "text-blue-500" };
  }
}

function escapeHtml(str: string) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderSignageHtml(data: PortalData, dataVersion: string = "default"): string {
  const { liveTime, liveDay, liveDate } = getISTDateTime();

  const slides = data.heroSlides.length > 0 ? data.heroSlides : [
    {
      id: "default-1",
      welcomeText: "Welcome to",
      titleHighlight: "InfoGrid",
      tagline: "Stay informed. Stay inspired.",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    }
  ];

  // News chunking (4 per page) — hide sections with 0 items
  const ITEMS_PER_PAGE = 4;
  const campusNews = data.news || [];
  const globalNews = data.generalNews || [];
  const newsPages: { type: "campus" | "global"; items: (NewsItem | GeneralNewsItem)[]; label: string }[] = [];

  if (campusNews.length > 0) {
    const campusPagesCount = Math.ceil(campusNews.length / ITEMS_PER_PAGE);
    for (let i = 0; i < campusPagesCount; i++) {
      const slice = campusNews.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE);
      newsPages.push({ type: "campus", items: slice, label: "CAMPUS NEWS" });
    }
  }

  if (globalNews.length > 0) {
    const globalPagesCount = Math.ceil(globalNews.length / ITEMS_PER_PAGE);
    for (let i = 0; i < globalPagesCount; i++) {
      const slice = globalNews.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE);
      newsPages.push({ type: "global", items: slice, label: "GLOBAL NEWS" });
    }
  }

  // Events processing — active events first, then finished as fallback
  const openEvts = (data.upcomingEvents || []).filter((evt) => {
    const cat = (evt.category || "").toLowerCase();
    return !(cat.includes("closed") || cat.includes("finished") || cat.includes("completed") || cat.includes("ended"));
  });
  const finishedEvts = (data.upcomingEvents || []).filter((evt) => {
    const cat = (evt.category || "").toLowerCase();
    return cat.includes("closed") || cat.includes("finished") || cat.includes("completed") || cat.includes("ended");
  });
  // Show fallback (all events) if there are no active ones
  const isEvtFallback = openEvts.length === 0 && finishedEvts.length > 0;
  const displayEvents = isEvtFallback ? finishedEvts : openEvts;

  const evtPagesCount = displayEvents.length;
  const eventPages: { items: UpcomingEvent[]; featured: any }[] = [];

  for (let i = 0; i < evtPagesCount; i++) {
    const primaryEvent = displayEvents[i];
    const feat = primaryEvent ? {
      title: primaryEvent.title,
      tagline: primaryEvent.tagline || primaryEvent.description || (isEvtFallback ? "Recently Concluded" : "Registration Open"),
      badge: primaryEvent.badge || primaryEvent.category || "Featured Event",
      dateRange: primaryEvent.dateRange || primaryEvent.date || "",
      venue: primaryEvent.venue || "Campus",
      ctaText: primaryEvent.ctaText || (isEvtFallback ? "View Details" : "Register Now"),
      image: primaryEvent.image || data.featuredEvent.image,
      ctaLink: getGridEventUrl(primaryEvent),
    } : defaultSkeletonData.featuredEvent;

    const sliceCount = Math.min(3, displayEvents.length);
    const slice: UpcomingEvent[] = [];
    for (let k = 0; k < sliceCount; k++) {
      slice.push(displayEvents[(i + k) % displayEvents.length]);
    }

    eventPages.push({ items: slice, featured: feat });
  }

  // Achievements chunking (2 per page for better image visibility)
  const ACH_PER_PAGE = 2;
  const achList = data.achievements || [];
  const achPagesCount = Math.max(1, Math.ceil(achList.length / ACH_PER_PAGE));
  const achPages: AchievementItem[][] = [];
  for (let i = 0; i < achPagesCount; i++) {
    achPages.push(achList.slice(i * ACH_PER_PAGE, (i + 1) * ACH_PER_PAGE));
  }

  const collegeTitle = escapeHtml(data.header.collegeSub ? `${data.header.collegeName} ${data.header.collegeSub}` : data.header.collegeName);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>InfoGrid - Digital Signage</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    html, body {
      overflow: hidden !important;
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #0f172a;
      -webkit-text-size-adjust: 100%;
      touch-action: none;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }
    .sig-visible { opacity: 1; transform: scale(1); transition: all 0.5s ease-in-out; }
    .sig-hidden { opacity: 0; transform: scale(0.98); position: absolute; pointer-events: none; }
    .sig-dot-active { width: 1.75rem; height: 0.625rem; background-color: #2563eb; }
    .sig-dot-inactive { width: 0.625rem; height: 0.625rem; background-color: #bfdbfe; }
  </style>
</head>
<body data-version="${escapeHtml(dataVersion)}">
  <div style="width: 100vw; height: 100vh; overflow: hidden; background: #0f172a; display: flex; align-items: center; justify-content: center;">
    <!-- Canvas Wrapper - Fixed 1080x1920 portrait scaled to viewport -->
    <div
      id="sig-canvas-wrapper"
      style="width: 1080px; height: 1920px; transform-origin: top left; position: absolute; top: 0; left: 0; overflow: hidden;"
      class="bg-[#f5f7fa] flex flex-col shadow-2xl"
    >
      <!-- Header -->
      <header class="bg-white/95 border-b border-slate-200/80 px-6 py-3 shadow-xs flex-shrink-0 z-20 h-20 flex items-center">
        <div class="w-full mx-auto flex items-center justify-between gap-6">
          <div class="flex items-center gap-3.5 flex-shrink-0">
            <div class="relative w-12 h-12 flex items-center justify-center">
              <img src="/Departmentlogo.png" alt="Department Logo" class="max-w-full max-h-full object-contain" />
            </div>
            <div class="h-8 w-[1px] bg-slate-200/80 flex-shrink-0"></div>
            <div class="relative w-14 h-12 flex items-center justify-center">
              <img src="/MuthootLogo.png" alt="Muthoot Logo" class="max-w-full max-h-full object-contain" />
            </div>
          </div>
          <div class="flex flex-col justify-center items-center flex-1 min-w-0 text-center px-2">
            <h1 class="text-xl font-black text-blue-950 tracking-tight uppercase truncate text-center">
              ${collegeTitle}
            </h1>
          </div>
          <div class="flex items-center flex-shrink-0">
            <div class="bg-slate-50/80 px-3.5 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
              <div class="flex items-center gap-2 text-blue-950 font-extrabold text-base leading-none tabular-nums whitespace-nowrap">
                <span class="w-2 h-2 rounded-full bg-blue-600 animate-ping inline-block mr-1"></span>
                <span id="sig-clock-time">${escapeHtml(liveTime)}</span>
              </div>
              <div class="h-6 w-[1px] bg-slate-200 flex-shrink-0"></div>
              <div class="flex flex-col text-[10px] text-slate-600 font-bold leading-tight uppercase tracking-wider whitespace-nowrap">
                <span id="sig-clock-day">${escapeHtml(liveDay)}</span>
                <span id="sig-clock-date" class="text-slate-500 font-medium">${escapeHtml(liveDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col justify-between px-6 py-4 space-y-4 overflow-hidden">
        <!-- Hero Slideshow Section -->
        <section class="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-blue-50 via-sky-50/90 to-blue-100/70 border border-blue-100 shadow-2xs my-2 flex-shrink-0 h-[270px]">
          <div id="sig-hero-container" class="grid grid-cols-12 gap-6 p-6 lg:p-8 items-center h-full relative">
            ${slides.map((slide, idx) => `
              <div class="sig-hero-slide col-span-12 grid grid-cols-12 gap-6 items-center w-full h-full ${idx === 0 ? "sig-visible" : "sig-hidden"}">
                <div class="col-span-6 z-10 flex flex-col justify-center space-y-2">
                  <span class="text-slate-500 font-semibold text-base tracking-tight">${escapeHtml(slide.welcomeText)}</span>
                  <h2 class="text-3xl lg:text-4xl font-extrabold text-blue-950 tracking-tight leading-tight line-clamp-2 h-16 flex items-center">${escapeHtml(slide.titleHighlight)}</h2>
                  <div class="w-10 h-1 bg-blue-600 rounded-full my-1"></div>
                  <p class="text-slate-600 font-medium text-base leading-snug line-clamp-2 h-12">${escapeHtml(slide.tagline)}</p>
                </div>
                <div class="col-span-6 relative z-10 flex-1">
                  <div class="relative w-full h-52 lg:h-56 rounded-2xl overflow-hidden shadow-md border-2 border-white">
                    <img src="${escapeHtml(slide.image)}" alt="${escapeHtml(slide.titleHighlight)}" class="w-full h-full object-cover object-center" />
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
          <div id="sig-hero-dots-container" class="absolute bottom-4 left-12 z-20 flex items-center gap-2">
            ${slides.length > 1 ? slides.map((_, idx) => `
              <span class="sig-hero-dot transition-all duration-300 rounded-full ${idx === 0 ? "sig-dot-active" : "sig-dot-inactive"}"></span>
            `).join("") : ""}
          </div>
        </section>

        <!-- Events Section -->
        <section class="my-2 flex-shrink-0">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <h3 class="text-base font-extrabold text-blue-950 tracking-tight uppercase">EVENTS</h3>
              <span id="sig-events-badge" class="text-[11px] font-bold px-2 py-0.5 rounded-full border ${isEvtFallback ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-blue-600 bg-blue-50 border-blue-200'}">
                ${isEvtFallback ? `${displayEvents.length} Recent` : `${displayEvents.length} Active`}
              </span>
            </div>
          </div>

          <div id="sig-events-container" class="relative h-[275px] overflow-hidden">
            ${displayEvents.length === 0 ? `
              <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center my-2 h-[275px]">
                <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl mb-2">📅</div>
                <h4 class="font-extrabold text-blue-950 text-base mb-1">No Active Events Scheduled</h4>
                <p class="text-slate-500 text-xs max-w-sm">New campus events will appear here once published.</p>
              </div>
            ` : eventPages.map((page, pIdx) => `
              <div
                class="sig-evt-page grid grid-cols-12 gap-3 items-stretch h-[275px]"
                style="${pIdx === 0 ? "" : "display: none;"}"
              >
                <!-- Left: Featured Event -->
                <div class="col-span-5 relative rounded-3xl overflow-hidden shadow-md flex flex-col justify-between p-5 h-[275px] border border-blue-900/30 bg-slate-900">
                  <img src="${escapeHtml(page.featured.image)}" alt="${escapeHtml(page.featured.title)}" class="absolute inset-0 w-full h-full object-cover object-center opacity-80" />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-blue-950/45 to-transparent"></div>
                  <div class="relative z-10 flex items-start justify-between">
                    <span class="inline-block px-2.5 py-0.5 bg-blue-600/90 text-white text-[11px] font-bold rounded-full border border-blue-400/40">
                      ${escapeHtml(page.featured.badge)}
                    </span>
                  </div>
                  <div class="relative z-10 flex items-center gap-3 pt-3">
                    ${page.featured.ctaLink && page.featured.ctaLink !== "#" ? `
                      <div class="flex flex-col items-center bg-white/95 p-1 rounded-lg shadow-lg flex-shrink-0">
                        <div class="w-16 h-16 rounded-md overflow-hidden bg-white">
                          <img
                            src="https://api.qrserver.com/v1/create-qr-code/?margin=1&size=150x150&data=${encodeURIComponent(page.featured.ctaLink)}"
                            alt="Scan QR"
                            class="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    ` : ""}
                    <div class="space-y-1 min-w-0 flex-1">
                      <h4 class="text-lg font-black text-white tracking-tight uppercase leading-tight line-clamp-1">${escapeHtml(page.featured.title)}</h4>
                      <p class="text-blue-200 font-semibold text-xs line-clamp-1">${escapeHtml(page.featured.tagline)}</p>
                      <div class="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 pt-0.5">
                        <span>${escapeHtml(page.featured.dateRange)}</span>
                        <span>${escapeHtml(page.featured.venue)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Right: Upcoming Events List -->
                <div class="col-span-7 flex flex-col justify-between space-y-2 h-[275px]">
                  ${page.items.map((evt) => {
                    const colors = getDateColorClasses(evt.color);
                    return `
                      <div class="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2 h-[81px] flex-shrink-0">
                        <div class="flex items-center gap-2.5 min-w-0">
                          <div class="w-12 h-12 rounded-xl border flex flex-col items-center justify-center flex-shrink-0 shadow-2xs ${colors.bg}">
                            <span class="text-base font-black leading-none ${colors.dayText}">${escapeHtml(evt.day)}</span>
                            <span class="text-[8px] font-extrabold uppercase leading-none mt-0.5 ${colors.monthText}">${escapeHtml(evt.month)}</span>
                          </div>
                          <div class="min-w-0">
                            <h5 class="font-extrabold text-blue-950 text-sm leading-tight truncate">${escapeHtml(evt.title)}</h5>
                            <div class="flex items-center gap-2 text-slate-500 text-[11px] font-medium mt-0.5">
                              <span>${escapeHtml(evt.time)}</span>
                              <span>•</span>
                              <span class="truncate">${escapeHtml(evt.venue)}</span>
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center gap-2 flex-shrink-0">
                          <span class="px-2 py-0.5 text-[10px] font-bold rounded-lg border ${escapeHtml(evt.categoryBadgeBg)}">${escapeHtml(evt.category)}</span>
                        </div>
                      </div>
                    `;
                  }).join("")}
                  ${Array.from({ length: Math.max(0, 3 - page.items.length) }).map(() => `
                    <div class="h-[81px] flex-shrink-0 opacity-0 pointer-events-none"></div>
                  `).join("")}
                </div>
              </div>
            `).join("")}
          </div>
        </section>

        <!-- Achievements Section -->
        <section class="my-3 flex-shrink-0">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-extrabold text-blue-950 tracking-tight uppercase">ACHIEVEMENTS</h3>
          </div>

          <div id="sig-ach-container" class="relative h-[440px] overflow-hidden">
            ${achPages.map((items, pIdx) => `
              <div
                class="sig-ach-page grid grid-cols-2 gap-4 transition-all duration-300 h-[440px]"
                style="${pIdx === 0 ? "" : "display: none;"}"
              >
                ${items.map((item) => `
                  <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between h-[440px]">
                    <div class="flex flex-col flex-1 min-h-0">
                      <div class="relative rounded-xl overflow-hidden mb-3 aspect-[16/9] bg-white border border-slate-100 flex items-center justify-center h-[250px] w-full flex-shrink-0 p-1">
                        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" class="w-full h-full object-contain object-center" />
                      </div>
                      <h4 class="font-extrabold text-blue-950 text-base leading-snug mb-1 line-clamp-2 h-12 overflow-hidden flex-shrink-0">${escapeHtml(item.title)}</h4>
                      <p class="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-2 h-10 overflow-hidden flex-shrink-0">${escapeHtml(item.description)}</p>
                    </div>
                    <div class="text-blue-600 text-xs font-bold pt-3.5 pb-1 border-t border-slate-100 flex-shrink-0 flex items-center justify-between">${escapeHtml(item.date)}</div>
                  </div>
                `).join("")}
              </div>
            `).join("")}
          </div>
        </section>

        <!-- News Section -->
        <section class="my-3 flex-shrink-0">
          <div class="flex items-center justify-between gap-2 mb-3">
            <h3 id="sig-news-label" class="text-lg font-extrabold tracking-tight uppercase text-blue-950">
              ${escapeHtml(newsPages[0]?.label || "CAMPUS NEWS")}
            </h3>
          </div>

          <div id="sig-news-container" class="relative h-[365px] overflow-hidden">
            ${newsPages.length === 0 ? `
              <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center h-[365px]">
                <h4 class="font-extrabold text-blue-950 text-base mb-1">No News Available</h4>
              </div>
            ` : newsPages.map((page, pIdx) => `
              <div
                class="sig-news-page grid grid-cols-4 gap-4 transition-all duration-300 h-[365px]"
                style="${pIdx === 0 ? "" : "display: none;"}"
                data-label="${escapeHtml(page.label)}"
              >
                ${page.items.map((item) => `
                  <div class="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between h-[365px]">
                    <div class="flex flex-col flex-1 justify-start min-h-0">
                      <div class="relative rounded-xl overflow-hidden mb-2.5 h-[160px] w-full bg-slate-100 flex-shrink-0">
                        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" class="w-full h-full object-cover object-center" />
                      </div>
                      <div class="mb-1.5 h-5 flex items-center justify-between flex-shrink-0">
                        <span class="inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-md border tracking-wider uppercase ${getTagColorClass(item.tagColor)}">
                          ${escapeHtml(item.tag)}
                        </span>
                        ${(item as GeneralNewsItem).source ? `
                          <span class="text-[9px] font-bold text-slate-400 truncate max-w-[50%]">
                            ${escapeHtml((item as GeneralNewsItem).source || "")}
                          </span>
                        ` : ""}
                      </div>
                      <div class="h-12 mb-1 flex items-start overflow-hidden flex-shrink-0">
                        <h4 class="font-extrabold text-blue-950 text-sm leading-snug line-clamp-2">${escapeHtml(item.title)}</h4>
                      </div>
                      <div class="h-12 overflow-hidden flex-shrink-0">
                        <p class="text-slate-600 text-xs leading-relaxed line-clamp-2">${escapeHtml(item.description)}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-1.5 pt-2 border-t border-slate-100 flex-shrink-0">
                      <span class="text-slate-500 font-semibold text-xs">${escapeHtml(item.date)}</span>
                    </div>
                  </div>
                `).join("")}
              </div>
            `).join("")}
          </div>
        </section>

        <!-- Footer Section -->
        <footer class="mt-4 flex-shrink-0">
          <div class="grid grid-cols-12 gap-4 mb-4 items-stretch">
            <div class="col-span-7 rounded-3xl bg-gradient-to-br from-blue-50/90 via-sky-50/60 to-blue-100/50 p-6 border border-blue-100/80 shadow-2xs flex flex-col justify-center">
              <blockquote class="text-slate-800 text-base font-bold leading-relaxed tracking-tight">"${escapeHtml(data.footer.quote)}"</blockquote>
              <cite class="block text-blue-700 font-extrabold text-sm mt-1 not-italic">— ${escapeHtml(data.footer.quoteAuthor)}</cite>
            </div>

            <div class="col-span-5 rounded-3xl bg-white p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-4">
              <div class="space-y-1.5">
                <h4 class="text-sm font-extrabold text-blue-950 tracking-wider uppercase leading-none">${escapeHtml(data.footer.stayConnectedTitle)}</h4>
                <p class="text-xs text-slate-500 font-semibold">${escapeHtml(data.footer.stayConnectedSubtitle)}</p>
                <div class="text-xs font-bold text-slate-600 pt-1">${escapeHtml(data.footer.handle)}</div>
              </div>
              <div class="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-100">
                <img src="/qr-code.png" alt="QR Code" class="max-w-full max-h-full object-contain" />
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white text-center py-2.5 px-4 rounded-xl font-bold text-sm tracking-wide shadow-xs">
            <span>${escapeHtml(data.footer.bottomBannerText)}</span>
          </div>
        </footer>
      </main>
    </div>
  </div>

  <!-- Viewport Scaling Script for 9:16 Portrait Canvas (1080 x 1920) -->
  <script>
    (function() {
      var CANVAS_W = 1080;
      var CANVAS_H = 1920;
      function scaleCanvas() {
        var vw = window.innerWidth || document.documentElement.clientWidth || CANVAS_W;
        var vh = window.innerHeight || document.documentElement.clientHeight || CANVAS_H;
        var scale = Math.min(vw / CANVAS_W, vh / CANVAS_H);
        var wrapper = document.getElementById('sig-canvas-wrapper');
        if (wrapper) {
          wrapper.style.transform = 'scale(' + scale + ')';
          wrapper.style.marginLeft = ((vw - CANVAS_W * scale) / 2) + 'px';
          wrapper.style.marginTop = ((vh - CANVAS_H * scale) / 2) + 'px';
        }
      }
      scaleCanvas();
      window.addEventListener('resize', scaleCanvas);
      window.addEventListener('orientationchange', scaleCanvas);
    })();
  </script>

  <!-- Complete Vanilla JS Runtime for LG webOS Signage (In-place soft data diffing) -->
  <script>
    (function () {
      "use strict";

      function escapeHtml(str) {
        if (!str) return "";
        return String(str)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }

      function getTagColorClass(color) {
        switch (color) {
          case "blue": return "bg-sky-100 text-sky-700 border-sky-200";
          case "green": return "bg-emerald-100 text-emerald-700 border-emerald-200";
          case "darkgreen": return "bg-green-100 text-green-800 border-green-200";
          case "orange": return "bg-amber-100 text-amber-700 border-amber-200";
          case "purple": return "bg-purple-100 text-purple-700 border-purple-200";
          default: return "bg-blue-100 text-blue-700 border-blue-200";
        }
      }

      function getDateColorClasses(color) {
        switch (color) {
          case "blue":
            return { bg: "bg-blue-50 text-blue-700 border-blue-200", dayText: "text-blue-700", monthText: "text-blue-500" };
          case "green":
            return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dayText: "text-emerald-700", monthText: "text-emerald-500" };
          case "purple":
            return { bg: "bg-purple-50 text-purple-700 border-purple-200", dayText: "text-purple-700", monthText: "text-purple-500" };
          case "orange":
            return { bg: "bg-amber-50 text-amber-700 border-amber-200", dayText: "text-amber-700", monthText: "text-amber-500" };
          default:
            return { bg: "bg-blue-50 text-blue-700 border-blue-200", dayText: "text-blue-700", monthText: "text-blue-500" };
        }
      }

      function getGridEventUrl(evt) {
        if (!evt) return "#";
        if (evt.ctaLink && evt.ctaLink.trim() !== "") {
          return evt.ctaLink;
        }
        var eventId = evt.externalId || evt.id;
        return eventId ? "https://grid.mitsmediaclub.com/events/" + eventId : "#";
      }

      /* Realtime Clock */
      function updateClock() {
        var now = new Date();
        var timeEl = document.getElementById("sig-clock-time");
        var dayEl = document.getElementById("sig-clock-day");
        var dateEl = document.getElementById("sig-clock-date");

        if (timeEl) {
          timeEl.textContent = now.toLocaleTimeString("en-US", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          });
        }
        if (dayEl) {
          dayEl.textContent = now.toLocaleDateString("en-US", {
            timeZone: "Asia/Kolkata",
            weekday: "long",
          });
        }
        if (dateEl) {
          dateEl.textContent = now.toLocaleDateString("en-GB", {
            timeZone: "Asia/Kolkata",
            day: "numeric",
            month: "long",
            year: "numeric",
          });
        }
      }
      updateClock();
      setInterval(updateClock, 1000);

      /* Carousels State & Handlers */
      var heroState = { current: 0, timer: null };
      var newsState = { current: 0, timer: null };
      var evtState = { current: 0, timer: null };
      var achState = { current: 0, timer: null };

      function initHeroCarousel() {
        var slides = document.querySelectorAll(".sig-hero-slide");
        var dots = document.querySelectorAll(".sig-hero-dot");
        if (!slides || slides.length <= 1) return;

        function goTo(idx) {
          var slidesNow = document.querySelectorAll(".sig-hero-slide");
          var dotsNow = document.querySelectorAll(".sig-hero-dot");
          if (!slidesNow.length) return;
          heroState.current = (idx + slidesNow.length) % slidesNow.length;

          for (var i = 0; i < slidesNow.length; i++) {
            if (i === heroState.current) {
              slidesNow[i].classList.remove("sig-hidden");
              slidesNow[i].classList.add("sig-visible");
            } else {
              slidesNow[i].classList.remove("sig-visible");
              slidesNow[i].classList.add("sig-hidden");
            }
          }
          for (var d = 0; d < dotsNow.length; d++) {
            if (d === heroState.current) {
              dotsNow[d].classList.remove("sig-dot-inactive");
              dotsNow[d].classList.add("sig-dot-active");
            } else {
              dotsNow[d].classList.remove("sig-dot-active");
              dotsNow[d].classList.add("sig-dot-inactive");
            }
          }
        }

        if (heroState.timer) clearInterval(heroState.timer);
        heroState.timer = setInterval(function () {
          goTo(heroState.current + 1);
        }, 6000);
      }

      function initNewsCarousel() {
        var pages = document.querySelectorAll(".sig-news-page");
        var label = document.getElementById("sig-news-label");
        if (!pages || pages.length <= 1) return;

        function goTo(idx) {
          var pagesNow = document.querySelectorAll(".sig-news-page");
          if (!pagesNow.length) return;
          newsState.current = (idx + pagesNow.length) % pagesNow.length;

          for (var i = 0; i < pagesNow.length; i++) {
            pagesNow[i].style.display = (i === newsState.current) ? "" : "none";
          }
          if (label && pagesNow[newsState.current]) {
            var l = pagesNow[newsState.current].getAttribute("data-label");
            if (l) label.textContent = l;
          }
        }

        if (newsState.timer) clearInterval(newsState.timer);
        newsState.timer = setInterval(function () {
          goTo(newsState.current + 1);
        }, 8000);
      }

      function initEvtCarousel() {
        var pages = document.querySelectorAll(".sig-evt-page");
        if (!pages || pages.length <= 1) return;

        function goTo(idx) {
          var pagesNow = document.querySelectorAll(".sig-evt-page");
          if (!pagesNow.length) return;
          evtState.current = (idx + pagesNow.length) % pagesNow.length;

          for (var i = 0; i < pagesNow.length; i++) {
            pagesNow[i].style.display = (i === evtState.current) ? "" : "none";
          }
        }

        if (evtState.timer) clearInterval(evtState.timer);
        evtState.timer = setInterval(function () {
          goTo(evtState.current + 1);
        }, 4500);
      }

      function initAchCarousel() {
        var pages = document.querySelectorAll(".sig-ach-page");
        if (!pages || pages.length <= 1) return;

        function goTo(idx) {
          var pagesNow = document.querySelectorAll(".sig-ach-page");
          if (!pagesNow.length) return;
          achState.current = (idx + pagesNow.length) % pagesNow.length;

          for (var i = 0; i < pagesNow.length; i++) {
            pagesNow[i].style.display = (i === achState.current) ? "" : "none";
          }
        }

        if (achState.timer) clearInterval(achState.timer);
        achState.timer = setInterval(function () {
          goTo(achState.current + 1);
        }, 6000);
      }

      // Initial carousel attachment
      initHeroCarousel();
      initNewsCarousel();
      initEvtCarousel();
      initAchCarousel();

      /* -------------------------------------------------------------
       * DOM Patching Engine for Soft Background Updates (No Reload)
       * ------------------------------------------------------------- */
      function patchHero(slides) {
        var container = document.getElementById("sig-hero-container");
        var dotsContainer = document.getElementById("sig-hero-dots-container");
        if (!container) return;

        var slidesData = (slides && slides.length > 0) ? slides : [
          {
            id: "default-1",
            welcomeText: "Welcome to",
            titleHighlight: "InfoGrid",
            tagline: "Stay informed. Stay inspired.",
            image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80"
          }
        ];

        var html = "";
        for (var i = 0; i < slidesData.length; i++) {
          var s = slidesData[i];
          var isVis = (i === (heroState.current % slidesData.length));
          html += '<div class="sig-hero-slide col-span-12 grid grid-cols-12 gap-6 items-center w-full ' + (isVis ? 'sig-visible' : 'sig-hidden') + '">' +
            '<div class="col-span-6 z-10 flex flex-col justify-center space-y-2">' +
              '<span class="text-slate-500 font-semibold text-base tracking-tight">' + escapeHtml(s.welcomeText) + '</span>' +
              '<h2 class="text-3xl lg:text-4xl font-extrabold text-blue-950 tracking-tight leading-tight">' + escapeHtml(s.titleHighlight) + '</h2>' +
              '<div class="w-10 h-1 bg-blue-600 rounded-full my-1"></div>' +
              '<p class="text-slate-600 font-medium text-base leading-snug">' + escapeHtml(s.tagline) + '</p>' +
            '</div>' +
            '<div class="col-span-6 relative z-10 flex-1">' +
              '<div class="relative w-full h-56 lg:h-64 rounded-2xl overflow-hidden shadow-md border-2 border-white">' +
                '<img src="' + escapeHtml(s.image) + '" alt="' + escapeHtml(s.titleHighlight) + '" class="w-full h-full object-cover object-center" />' +
              '</div>' +
            '</div>' +
          '</div>';
        }
        container.innerHTML = html;

        if (dotsContainer) {
          var dotsHtml = "";
          if (slidesData.length > 1) {
            for (var d = 0; d < slidesData.length; d++) {
              var isActive = (d === (heroState.current % slidesData.length));
              dotsHtml += '<span class="sig-hero-dot transition-all duration-300 rounded-full ' + (isActive ? 'sig-dot-active' : 'sig-dot-inactive') + '"></span>';
            }
          }
          dotsContainer.innerHTML = dotsHtml;
        }

        initHeroCarousel();
      }

      function patchNews(campusNews, globalNews) {
        var container = document.getElementById("sig-news-container");
        var labelEl = document.getElementById("sig-news-label");
        if (!container) return;

        var ITEMS_PER_PAGE = 4;
        var campusList = campusNews || [];
        var globalList = globalNews || [];

        var newsPages = [];
        if (campusList.length > 0) {
          var campusPagesCount = Math.ceil(campusList.length / ITEMS_PER_PAGE);
          for (var c = 0; c < campusPagesCount; c++) {
            newsPages.push({ type: "campus", items: campusList.slice(c * ITEMS_PER_PAGE, (c + 1) * ITEMS_PER_PAGE), label: "CAMPUS NEWS" });
          }
        }
        if (globalList.length > 0) {
          var globalPagesCount = Math.ceil(globalList.length / ITEMS_PER_PAGE);
          for (var g = 0; g < globalPagesCount; g++) {
            newsPages.push({ type: "global", items: globalList.slice(g * ITEMS_PER_PAGE, (g + 1) * ITEMS_PER_PAGE), label: "GLOBAL NEWS" });
          }
        }

        if (newsPages.length === 0) {
          container.innerHTML = '<div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center h-[365px]"><h4 class="font-extrabold text-blue-950 text-base mb-1">No News Available</h4></div>';
          return;
        }

        var html = "";
        for (var p = 0; p < newsPages.length; p++) {
          var page = newsPages[p];
          var isVis = (p === (newsState.current % newsPages.length));
          html += '<div class="sig-news-page grid grid-cols-4 gap-4 transition-all duration-300" style="' + (isVis ? "" : "display: none;") + '" data-label="' + escapeHtml(page.label) + '">';
          for (var i = 0; i < page.items.length; i++) {
            var item = page.items[i];
            var tagClass = getTagColorClass(item.tagColor);
            var sourceText = item.source ? '<span class="text-[9px] font-bold text-slate-400 truncate max-w-[50%]">' + escapeHtml(item.source) + '</span>' : '';

            html += '<div class="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between h-[365px]">' +
              '<div class="flex flex-col flex-1 justify-start min-h-0">' +
                '<div class="relative rounded-xl overflow-hidden mb-2.5 h-[160px] w-full bg-slate-100 flex-shrink-0">' +
                  '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" class="w-full h-full object-cover object-center" />' +
                '</div>' +
                '<div class="mb-1.5 h-5 flex items-center justify-between flex-shrink-0">' +
                  '<span class="inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-md border tracking-wider uppercase ' + tagClass + '">' + escapeHtml(item.tag) + '</span>' +
                  sourceText +
                '</div>' +
                '<div class="h-12 mb-1 flex items-start overflow-hidden flex-shrink-0">' +
                  '<h4 class="font-extrabold text-blue-950 text-sm leading-snug line-clamp-2">' + escapeHtml(item.title) + '</h4>' +
                '</div>' +
                '<div class="h-12 overflow-hidden flex-shrink-0">' +
                  '<p class="text-slate-600 text-xs leading-relaxed line-clamp-2">' + escapeHtml(item.description) + '</p>' +
                '</div>' +
              '</div>' +
              '<div class="flex items-center gap-1.5 pt-2 border-t border-slate-100 flex-shrink-0">' +
                '<span class="text-slate-500 font-semibold text-xs">' + escapeHtml(item.date) + '</span>' +
              '</div>' +
            '</div>';
          }
          html += '</div>';
        }
        container.innerHTML = html;

        if (labelEl && newsPages.length > 0) {
          var activePage = newsPages[newsState.current % newsPages.length];
          labelEl.textContent = activePage.label;
        }

        initNewsCarousel();
      }

      function patchEvents(upcomingEvents, featuredEvent) {
        var container = document.getElementById("sig-events-container");
        var badgeEl = document.getElementById("sig-events-badge");
        if (!container) return;

        var allEvents = upcomingEvents || [];
        var openEvents = allEvents.filter(function (evt) {
          var cat = (evt.category || "").toLowerCase();
          return !(cat.includes("closed") || cat.includes("finished") || cat.includes("completed") || cat.includes("ended"));
        });
        var finishedEvts = allEvents.filter(function (evt) {
          var cat = (evt.category || "").toLowerCase();
          return cat.includes("closed") || cat.includes("finished") || cat.includes("completed") || cat.includes("ended");
        });
        var isFallback = openEvents.length === 0 && finishedEvts.length > 0;
        var displayEvents = isFallback ? finishedEvts : openEvents;

        if (badgeEl) {
          if (isFallback) {
            badgeEl.className = "text-[11px] font-bold px-2 py-0.5 rounded-full border text-amber-700 bg-amber-50 border-amber-200";
            badgeEl.textContent = displayEvents.length + " Recent";
          } else {
            badgeEl.className = "text-[11px] font-bold px-2 py-0.5 rounded-full border text-blue-600 bg-blue-50 border-blue-200";
            badgeEl.textContent = displayEvents.length + " Active";
          }
        }

        if (displayEvents.length === 0) {
          container.innerHTML = '<div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center my-2 min-h-[230px]"><div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl mb-2">📅</div><h4 class="font-extrabold text-blue-950 text-base mb-1">No Active Events Scheduled</h4><p class="text-slate-500 text-xs max-w-sm">New campus events will appear here once published.</p></div>';
          return;
        }

        var evtPagesCount = displayEvents.length;
        var eventPages = [];

        for (var i = 0; i < evtPagesCount; i++) {
          var primaryEvent = displayEvents[i];
          var feat = primaryEvent ? {
            title: primaryEvent.title,
            tagline: primaryEvent.tagline || primaryEvent.description || (isFallback ? "Recently Concluded" : "Registration Open"),
            badge: primaryEvent.badge || primaryEvent.category || "Featured Event",
            dateRange: primaryEvent.dateRange || primaryEvent.date || "",
            venue: primaryEvent.venue || "Campus",
            ctaText: primaryEvent.ctaText || (isFallback ? "View Details" : "Register Now"),
            image: primaryEvent.image || (featuredEvent ? featuredEvent.image : ""),
            ctaLink: getGridEventUrl(primaryEvent),
          } : featuredEvent;

          var sliceCount = Math.min(3, displayEvents.length);
          var slice = [];
          for (var k = 0; k < sliceCount; k++) {
            slice.push(displayEvents[(i + k) % displayEvents.length]);
          }

          eventPages.push({ items: slice, featured: feat });
        }

        var html = "";
        for (var p = 0; p < eventPages.length; p++) {
          var page = eventPages[p];
          var isVis = (p === (evtState.current % eventPages.length));
          var qrHtml = (page.featured.ctaLink && page.featured.ctaLink !== "#") ?
            '<div class="flex flex-col items-center bg-white/95 p-1 rounded-lg shadow-lg flex-shrink-0">' +
              '<div class="w-16 h-16 rounded-md overflow-hidden bg-white">' +
                '<img src="https://api.qrserver.com/v1/create-qr-code/?margin=1&size=150x150&data=' + encodeURIComponent(page.featured.ctaLink) + '" alt="Scan QR" class="w-full h-full object-contain" />' +
              '</div>' +
            '</div>' : '';

          html += '<div class="sig-evt-page grid grid-cols-12 gap-3 items-stretch h-[275px]" style="' + (isVis ? "" : "display: none;") + '">' +
            '<div class="col-span-5 relative rounded-3xl overflow-hidden shadow-md flex flex-col justify-between p-5 h-[275px] border border-blue-900/30 bg-slate-900">' +
              '<img src="' + escapeHtml(page.featured.image) + '" alt="' + escapeHtml(page.featured.title) + '" class="absolute inset-0 w-full h-full object-cover object-center opacity-80" />' +
              '<div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-blue-950/45 to-transparent"></div>' +
              '<div class="relative z-10 flex items-start justify-between">' +
                '<span class="inline-block px-2.5 py-0.5 bg-blue-600/90 text-white text-[11px] font-bold rounded-full border border-blue-400/40">' + escapeHtml(page.featured.badge) + '</span>' +
              '</div>' +
              '<div class="relative z-10 flex items-center gap-3 pt-3">' +
                qrHtml +
                '<div class="space-y-1 min-w-0 flex-1">' +
                  '<h4 class="text-lg font-black text-white tracking-tight uppercase leading-tight line-clamp-1">' + escapeHtml(page.featured.title) + '</h4>' +
                  '<p class="text-blue-200 font-semibold text-xs line-clamp-1">' + escapeHtml(page.featured.tagline) + '</p>' +
                  '<div class="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 pt-0.5">' +
                    '<span>' + escapeHtml(page.featured.dateRange) + '</span>' +
                    '<span>' + escapeHtml(page.featured.venue) + '</span>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="col-span-7 flex flex-col justify-between space-y-2 h-[275px]">';

          for (var e = 0; e < page.items.length; e++) {
            var evt = page.items[e];
            var colors = getDateColorClasses(evt.color);
            html += '<div class="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2 h-[81px] flex-shrink-0">' +
              '<div class="flex items-center gap-2.5 min-w-0">' +
                '<div class="w-12 h-12 rounded-xl border flex flex-col items-center justify-center flex-shrink-0 shadow-2xs ' + colors.bg + '">' +
                  '<span class="text-base font-black leading-none ' + colors.dayText + '">' + escapeHtml(evt.day) + '</span>' +
                  '<span class="text-[8px] font-extrabold uppercase leading-none mt-0.5 ' + colors.monthText + '">' + escapeHtml(evt.month) + '</span>' +
                '</div>' +
                '<div class="min-w-0">' +
                  '<h5 class="font-extrabold text-blue-950 text-sm leading-tight truncate">' + escapeHtml(evt.title) + '</h5>' +
                  '<div class="flex items-center gap-2 text-slate-500 text-[11px] font-medium mt-0.5">' +
                    '<span>' + escapeHtml(evt.time) + '</span>' +
                    '<span>•</span>' +
                    '<span class="truncate">' + escapeHtml(evt.venue) + '</span>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<div class="flex items-center gap-2 flex-shrink-0">' +
                '<span class="px-2 py-0.5 text-[10px] font-bold rounded-lg border ' + escapeHtml(evt.categoryBadgeBg) + '">' + escapeHtml(evt.category) + '</span>' +
              '</div>' +
            '</div>';
          }
          for (var dummy = page.items.length; dummy < 3; dummy++) {
            html += '<div class="h-[81px] flex-shrink-0 opacity-0 pointer-events-none"></div>';
          }
          html += '</div></div>';
        }
        container.innerHTML = html;

        initEvtCarousel();
      }

      function patchAchievements(achievements) {
        var container = document.getElementById("sig-ach-container");
        if (!container) return;

        var ITEMS_PER_PAGE = 2;
        var achList = achievements || [];
        var achPagesCount = Math.max(1, Math.ceil(achList.length / ITEMS_PER_PAGE));
        var achPages = [];
        for (var i = 0; i < achPagesCount; i++) {
          achPages.push(achList.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));
        }

        if (achList.length === 0) {
          container.innerHTML = '<div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center"><h4 class="font-extrabold text-blue-950 text-base mb-1">No Achievements Recorded</h4></div>';
          return;
        }

        var html = "";
        for (var p = 0; p < achPages.length; p++) {
          var items = achPages[p];
          var isVis = (p === (achState.current % achPages.length));
          html += '<div class="sig-ach-page grid grid-cols-2 gap-4 transition-all duration-300 h-[440px]" style="' + (isVis ? "" : "display: none;") + '">';
          for (var a = 0; a < items.length; a++) {
            var item = items[a];
            html += '<div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between h-[440px]">' +
              '<div class="flex flex-col flex-1 min-h-0">' +
                '<div class="relative rounded-xl overflow-hidden mb-3 aspect-[16/9] bg-white border border-slate-100 flex items-center justify-center h-[250px] w-full flex-shrink-0 p-1">' +
                  '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" class="w-full h-full object-contain object-center" />' +
                '</div>' +
                '<h4 class="font-extrabold text-blue-950 text-base leading-snug mb-1 line-clamp-2 h-12 overflow-hidden flex-shrink-0">' + escapeHtml(item.title) + '</h4>' +
                '<p class="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-2 h-10 overflow-hidden flex-shrink-0">' + escapeHtml(item.description) + '</p>' +
              '</div>' +
              '<div class="text-blue-600 text-xs font-bold pt-3.5 pb-1 border-t border-slate-100 flex-shrink-0 flex items-center justify-between">' + escapeHtml(item.date) + '</div>' +
            '</div>';
          }
          html += '</div>';
        }
        container.innerHTML = html;

        initAchCarousel();
      }

      function patchDOM(portalData) {
        if (!portalData) return;
        if (portalData.heroSlides) patchHero(portalData.heroSlides);
        if (portalData.news || portalData.generalNews) patchNews(portalData.news, portalData.generalNews);
        if (portalData.upcomingEvents || portalData.featuredEvent) patchEvents(portalData.upcomingEvents, portalData.featuredEvent);
        if (portalData.achievements) patchAchievements(portalData.achievements);
      }

      /* Silent Idle Background Sync (No Timers, No Visual Interruption) */
      function scheduleBackgroundFetch() {
        var delay = 90000; // 90 seconds silent background fetch
        if (typeof window.requestIdleCallback === "function") {
          setTimeout(function () {
            window.requestIdleCallback(syncDataInBackground, { timeout: 10000 });
          }, delay);
        } else {
          setTimeout(syncDataInBackground, delay);
        }
      }

      function syncDataInBackground() {
        try {
          var currentVer = document.body ? document.body.getAttribute("data-version") : null;
          fetch("/display-signage/data?t=" + new Date().getTime(), { cache: "no-store" })
            .then(function (res) { return res.json(); })
            .then(function (resData) {
              if (resData && resData.version && resData.version !== currentVer && resData.data) {
                document.body.setAttribute("data-version", resData.version);
                patchDOM(resData.data);
              }
            })
            .catch(function () {})
            .then(function () {
              scheduleBackgroundFetch();
            });
        } catch (e) {
          scheduleBackgroundFetch();
        }
      }

      scheduleBackgroundFetch();
    })();
  </script>
</body>
</html>`;
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

    // Sort events: active/open first, then finished — never hide all events
    const finishedEventsDb = events.filter((evt) => {
      const cat = (evt.category || "").toLowerCase();
      return cat.includes("closed") || cat.includes("finished") || cat.includes("completed") || cat.includes("ended");
    });
    const activeEventsDb = events.filter((evt) => {
      const cat = (evt.category || "").toLowerCase();
      return !(cat.includes("closed") || cat.includes("finished") || cat.includes("completed") || cat.includes("ended"));
    });
    const allEventsSorted = [...activeEventsDb, ...finishedEventsDb];

    const portalData: PortalData = {
      header: defaultSkeletonData.header,
      heroSlides: slides as any,
      news: news as any,
      generalNews: generalNews as any,
      featuredEvent: activeEventsDb.length > 0 ? {
        title: activeEventsDb[0].title,
        tagline: activeEventsDb[0].tagline || activeEventsDb[0].description || "",
        badge: activeEventsDb[0].badge || activeEventsDb[0].category || "Featured Event",
        dateRange: activeEventsDb[0].dateRange || activeEventsDb[0].date || "",
        venue: activeEventsDb[0].venue || "Campus",
        ctaText: activeEventsDb[0].ctaText || "Register Now",
        image: activeEventsDb[0].image || "",
        ctaLink: getGridEventUrl(activeEventsDb[0]),
      } : (allEventsSorted.length > 0 ? {
        title: allEventsSorted[0].title,
        tagline: allEventsSorted[0].tagline || allEventsSorted[0].description || "",
        badge: allEventsSorted[0].badge || allEventsSorted[0].category || "Recent Event",
        dateRange: allEventsSorted[0].dateRange || allEventsSorted[0].date || "",
        venue: allEventsSorted[0].venue || "Campus",
        ctaText: "View Details",
        image: allEventsSorted[0].image || "",
        ctaLink: getGridEventUrl(allEventsSorted[0]),
      } : defaultSkeletonData.featuredEvent),
      upcomingEvents: allEventsSorted as any,
      achievements: achievements as any,
      footer: defaultSkeletonData.footer,
    };

    const htmlString = renderSignageHtml(portalData, dataVersion);

    return new Response(htmlString, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error: any) {
    console.error("Error generating signage HTML:", error);

    const portalData = defaultSkeletonData;
    const htmlString = renderSignageHtml(portalData, "fallback");

    return new Response(htmlString, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  }
}
