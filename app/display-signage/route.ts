import { prisma } from "@/lib/prisma";
import { defaultSkeletonData, PortalData, NewsItem, GeneralNewsItem, UpcomingEvent, AchievementItem } from "@/data/skeletonData";

export const dynamic = "force-dynamic";

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
  if (evt.ctaLink && evt.ctaLink.includes("grid.mitsmediaclub.com")) {
    return evt.ctaLink;
  }
  const eventId = evt.externalId || evt.id;
  return eventId ? `https://grid.mitsmediaclub.com/events/${eventId}` : "https://grid.mitsmediaclub.com/events";
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

function renderSignageHtml(data: PortalData): string {
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

  // News chunking (4 per page)
  const ITEMS_PER_PAGE = 4;
  const campusNews = data.news || [];
  const globalNews = data.generalNews || [];
  
  const campusPagesCount = Math.max(1, Math.ceil(campusNews.length / ITEMS_PER_PAGE));
  const globalPagesCount = Math.ceil(globalNews.length / ITEMS_PER_PAGE);

  const newsPages: { type: "campus" | "global"; items: (NewsItem | GeneralNewsItem)[]; label: string }[] = [];

  for (let i = 0; i < campusPagesCount; i++) {
    const slice = campusNews.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE);
    newsPages.push({ type: "campus", items: slice, label: "CAMPUS NEWS" });
  }
  for (let i = 0; i < globalPagesCount; i++) {
    const slice = globalNews.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE);
    newsPages.push({ type: "global", items: slice, label: "GLOBAL NEWS" });
  }

  // Events processing
  const maxFinishedEvents = 2;
  const upcoming = data.upcomingEvents || [];
  const openEvents = upcoming.filter((evt) => {
    const cat = (evt.category || "").toLowerCase();
    return !(cat.includes("closed") || cat.includes("finished") || cat.includes("completed") || cat.includes("ended"));
  });
  const finishedEvents = upcoming.filter((evt) => {
    const cat = (evt.category || "").toLowerCase();
    return cat.includes("closed") || cat.includes("finished") || cat.includes("completed") || cat.includes("ended");
  });
  const filteredUpcoming = [...openEvents, ...finishedEvents.slice(0, maxFinishedEvents)];

  const EVT_PER_PAGE = 3;
  const evtPagesCount = Math.max(1, Math.ceil(filteredUpcoming.length / EVT_PER_PAGE));
  const eventPages: { items: UpcomingEvent[]; featured: any }[] = [];

  for (let i = 0; i < evtPagesCount; i++) {
    const slice = filteredUpcoming.slice(i * EVT_PER_PAGE, (i + 1) * EVT_PER_PAGE);
    const primaryEvent = filteredUpcoming[i * EVT_PER_PAGE] || filteredUpcoming[0];
    const feat = primaryEvent ? {
      title: primaryEvent.title,
      tagline: primaryEvent.tagline || primaryEvent.description || "Registration Open",
      badge: primaryEvent.badge || primaryEvent.category || "Featured Event",
      dateRange: primaryEvent.dateRange || primaryEvent.date || "",
      venue: primaryEvent.venue || "Campus",
      image: primaryEvent.image || data.featuredEvent.image,
      ctaLink: getGridEventUrl(primaryEvent),
    } : { ...data.featuredEvent, ctaLink: getGridEventUrl(data.featuredEvent) };

    eventPages.push({ items: slice, featured: feat });
  }

  // Achievements chunking (4 per page)
  const achList = data.achievements || [];
  const achPagesCount = Math.max(1, Math.ceil(achList.length / ITEMS_PER_PAGE));
  const achPages: AchievementItem[][] = [];
  for (let i = 0; i < achPagesCount; i++) {
    achPages.push(achList.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));
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
<body>
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
        <section class="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-blue-50 via-sky-50/90 to-blue-100/70 border border-blue-100 shadow-2xs my-2 flex-shrink-0">
          <div class="grid grid-cols-12 gap-6 p-6 lg:p-8 items-center min-h-0 relative">
            ${slides.map((slide, idx) => `
              <div class="sig-hero-slide col-span-12 grid grid-cols-12 gap-6 items-center w-full ${idx === 0 ? "sig-visible" : "sig-hidden"}">
                <div class="col-span-6 z-10 flex flex-col justify-center space-y-2">
                  <span class="text-slate-500 font-semibold text-base tracking-tight">${escapeHtml(slide.welcomeText)}</span>
                  <h2 class="text-3xl lg:text-4xl font-extrabold text-blue-950 tracking-tight leading-tight">${escapeHtml(slide.titleHighlight)}</h2>
                  <div class="w-10 h-1 bg-blue-600 rounded-full my-1"></div>
                  <p class="text-slate-600 font-medium text-base leading-snug">${escapeHtml(slide.tagline)}</p>
                </div>
                <div class="col-span-6 relative z-10 flex-1">
                  <div class="relative w-full h-56 lg:h-64 rounded-2xl overflow-hidden shadow-md border-2 border-white">
                    <img src="${escapeHtml(slide.image)}" alt="${escapeHtml(slide.titleHighlight)}" class="w-full h-full object-cover object-center" />
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
          ${slides.length > 1 ? `
            <div class="absolute bottom-4 left-12 z-20 flex items-center gap-2">
              ${slides.map((_, idx) => `
                <span class="sig-hero-dot transition-all duration-300 rounded-full ${idx === 0 ? "sig-dot-active" : "sig-dot-inactive"}"></span>
              `).join("")}
            </div>
          ` : ""}
        </section>

        <!-- News Section -->
        <section class="my-3 flex-shrink-0">
          <div class="flex items-center justify-between gap-2 mb-3">
            <h3 id="sig-news-label" class="text-lg font-extrabold tracking-tight uppercase text-blue-950">
              ${escapeHtml(newsPages[0]?.label || "CAMPUS NEWS")}
            </h3>
          </div>

          <div class="relative min-h-[315px]">
            ${newsPages.map((page, pIdx) => `
              <div
                class="sig-news-page grid grid-cols-4 gap-4 transition-all duration-300"
                style="${pIdx === 0 ? "" : "display: none;"}"
                data-label="${escapeHtml(page.label)}"
              >
                ${page.items.map((item, idx) => `
                  <div class="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between h-[315px]">
                    <div class="flex flex-col flex-1 justify-start">
                      <div class="relative rounded-xl overflow-hidden mb-2.5 h-34 bg-slate-100 flex-shrink-0">
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
                      <div class="h-11 mb-1 flex items-start overflow-hidden flex-shrink-0">
                        <h4 class="font-extrabold text-blue-950 text-sm leading-snug line-clamp-2">${escapeHtml(item.title)}</h4>
                      </div>
                      <div class="h-10 overflow-hidden flex-shrink-0">
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

        <!-- Events Section -->
        <section class="my-2 flex-shrink-0">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <h3 class="text-base font-extrabold text-blue-950 tracking-tight uppercase">CAMPUS EVENTS</h3>
              <span class="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                ${openEvents.length} Open (${filteredUpcoming.length} Shown)
              </span>
            </div>
          </div>

          <div class="relative">
            ${eventPages.map((page, pIdx) => `
              <div
                class="sig-evt-page grid grid-cols-12 gap-3 items-stretch"
                style="${pIdx === 0 ? "" : "display: none;"}"
              >
                <!-- Left: Featured Event -->
                <div class="col-span-5 relative rounded-3xl overflow-hidden shadow-md flex flex-col justify-between p-5 min-h-[230px] border border-blue-900/30 bg-slate-900">
                  <img src="${escapeHtml(page.featured.image)}" alt="${escapeHtml(page.featured.title)}" class="absolute inset-0 w-full h-full object-cover object-center" />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-blue-950/80 to-blue-950/40"></div>
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
                <div class="col-span-7 flex flex-col justify-between space-y-2">
                  ${page.items.map((evt) => {
                    const colors = getDateColorClasses(evt.color);
                    return `
                      <div class="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2">
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

          <div class="relative">
            ${achPages.map((items, pIdx) => `
              <div
                class="sig-ach-page grid grid-cols-4 gap-4 transition-all duration-300"
                style="${pIdx === 0 ? "" : "display: none;"}"
              >
                ${items.map((item) => `
                  <div class="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                    <div>
                      <div class="relative rounded-xl overflow-hidden mb-2.5 aspect-16/10 bg-slate-100">
                        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" class="w-full h-full object-cover object-center" />
                      </div>
                      <h4 class="font-extrabold text-blue-950 text-base leading-snug mb-1">${escapeHtml(item.title)}</h4>
                      <p class="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-2">${escapeHtml(item.description)}</p>
                    </div>
                    <div class="text-blue-600 text-xs font-bold pt-2 border-t border-slate-100">${escapeHtml(item.date)}</div>
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

  <!-- Complete Inlined Vanilla JS for zero external request dependencies -->
  <script>
    (function () {
      "use strict";

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

      /* Hero Slideshow */
      (function () {
        var slides = document.querySelectorAll(".sig-hero-slide");
        var dots = document.querySelectorAll(".sig-hero-dot");
        if (!slides || slides.length <= 1) return;

        var current = 0;
        var total = slides.length;

        function goTo(idx) {
          slides[current].classList.remove("sig-visible");
          slides[current].classList.add("sig-hidden");
          if (dots[current]) {
            dots[current].classList.remove("sig-dot-active");
            dots[current].classList.add("sig-dot-inactive");
          }
          current = (idx + total) % total;
          slides[current].classList.remove("sig-hidden");
          slides[current].classList.add("sig-visible");
          if (dots[current]) {
            dots[current].classList.remove("sig-dot-inactive");
            dots[current].classList.add("sig-dot-active");
          }
        }

        setInterval(function () {
          goTo(current + 1);
        }, 6000);
      })();

      /* News Carousel */
      (function () {
        var pages = document.querySelectorAll(".sig-news-page");
        var label = document.getElementById("sig-news-label");
        if (!pages || pages.length <= 1) return;

        var current = 0;

        function goTo(idx) {
          pages[current].style.display = "none";
          current = (idx + pages.length) % pages.length;
          pages[current].style.display = "";
          var pageData = pages[current].getAttribute("data-label");
          if (label && pageData) label.textContent = pageData;
        }

        setInterval(function () {
          goTo(current + 1);
        }, 8000);
      })();

      /* Achievements Carousel */
      (function () {
        var pages = document.querySelectorAll(".sig-ach-page");
        if (!pages || pages.length <= 1) return;

        var current = 0;

        function goTo(idx) {
          pages[current].style.display = "none";
          current = (idx + pages.length) % pages.length;
          pages[current].style.display = "";
        }

        setInterval(function () {
          goTo(current + 1);
        }, 6000);
      })();

      /* Events Carousel */
      (function () {
        var pages = document.querySelectorAll(".sig-evt-page");
        if (!pages || pages.length <= 1) return;

        var current = 0;

        function goTo(idx) {
          pages[current].style.display = "none";
          current = (idx + pages.length) % pages.length;
          pages[current].style.display = "";
        }

        setInterval(function () {
          goTo(current + 1);
        }, 4500);
      })();

      /* Auto Refresh every 2 minutes */
      setTimeout(function () {
        window.location.reload();
      }, 120000);
    })();
  </script>
</body>
</html>`;
}

export async function GET() {
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

    const processedEvents = events.map((evt) => {
      if (evt.date) {
        const evtDate = new Date(evt.date);
        if (!isNaN(evtDate.getTime()) && evtDate < today) {
          return { ...evt, category: "Finished", ctaText: "View Event" };
        }
      }
      return evt;
    });

    const portalData: PortalData = {
      header: defaultSkeletonData.header,
      heroSlides: slides.length > 0 ? (slides as any) : defaultSkeletonData.heroSlides,
      news: news.length > 0 ? (news as any) : defaultSkeletonData.news,
      generalNews: generalNews.length > 0 ? (generalNews as any) : defaultSkeletonData.generalNews,
      featuredEvent: defaultSkeletonData.featuredEvent,
      upcomingEvents: processedEvents.length > 0 ? (processedEvents as any) : defaultSkeletonData.upcomingEvents,
      achievements: achievements.length > 0 ? (achievements as any) : defaultSkeletonData.achievements,
      footer: defaultSkeletonData.footer,
    };

    const htmlString = renderSignageHtml(portalData);

    return new Response(htmlString, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Error generating signage HTML:", error);

    const portalData = defaultSkeletonData;
    const htmlString = renderSignageHtml(portalData);

    return new Response(htmlString, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  }
}
