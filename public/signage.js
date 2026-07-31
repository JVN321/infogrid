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

  /* DOM Patching Engine for Soft Data Sync (No Reload) */
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

    var campusPagesCount = Math.max(1, Math.ceil(campusList.length / ITEMS_PER_PAGE));
    var globalPagesCount = Math.ceil(globalList.length / ITEMS_PER_PAGE);

    var newsPages = [];
    for (var c = 0; c < campusPagesCount; c++) {
      newsPages.push({ type: "campus", items: campusList.slice(c * ITEMS_PER_PAGE, (c + 1) * ITEMS_PER_PAGE), label: "CAMPUS NEWS" });
    }
    for (var g = 0; g < globalPagesCount; g++) {
      newsPages.push({ type: "global", items: globalList.slice(g * ITEMS_PER_PAGE, (g + 1) * ITEMS_PER_PAGE), label: "GLOBAL NEWS" });
    }

    if (newsPages.length === 0) {
      container.innerHTML = '<div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center h-[315px]"><h4 class="font-extrabold text-blue-950 text-base mb-1">No News Available</h4></div>';
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

        html += '<div class="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between h-[320px]">' +
          '<div class="flex flex-col flex-1 justify-start min-h-0">' +
            '<div class="relative rounded-xl overflow-hidden mb-2.5 h-[125px] w-full bg-slate-100 flex-shrink-0">' +
              '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" class="w-full h-full object-cover object-center" />' +
            '</div>' +
            '<div class="mb-1.5 h-5 flex items-center justify-between flex-shrink-0">' +
              '<span class="inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-md border tracking-wider uppercase ' + tagClass + '">' + escapeHtml(item.tag) + '</span>' +
              sourceText +
            '</div>' +
            '<div class="h-11 mb-1 flex items-start overflow-hidden flex-shrink-0">' +
              '<h4 class="font-extrabold text-blue-950 text-sm leading-snug line-clamp-2">' + escapeHtml(item.title) + '</h4>' +
            '</div>' +
            '<div class="h-10 overflow-hidden flex-shrink-0">' +
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

    var openEvents = (upcomingEvents || []).filter(function (evt) {
      var cat = (evt.category || "").toLowerCase();
      return !(cat.includes("closed") || cat.includes("finished") || cat.includes("completed") || cat.includes("ended"));
    });

    if (badgeEl) {
      badgeEl.textContent = openEvents.length + " Active";
    }

    if (openEvents.length === 0) {
      container.innerHTML = '<div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center my-2 min-h-[230px]"><div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl mb-2">📅</div><h4 class="font-extrabold text-blue-950 text-base mb-1">No Active Events Scheduled</h4><p class="text-slate-500 text-xs max-w-sm">New campus events will appear here once published.</p></div>';
      return;
    }

    var EVT_PER_PAGE = 3;
    var evtPagesCount = Math.max(1, Math.ceil(openEvents.length / EVT_PER_PAGE));
    var eventPages = [];

    for (var i = 0; i < evtPagesCount; i++) {
      var slice = openEvents.slice(i * EVT_PER_PAGE, (i + 1) * EVT_PER_PAGE);
      var primaryEvent = openEvents[i * EVT_PER_PAGE] || openEvents[0];
      var feat = primaryEvent ? {
        title: primaryEvent.title,
        tagline: primaryEvent.tagline || primaryEvent.description || "Registration Open",
        badge: primaryEvent.badge || primaryEvent.category || "Featured Event",
        dateRange: primaryEvent.dateRange || primaryEvent.date || "",
        venue: primaryEvent.venue || "Campus",
        ctaText: primaryEvent.ctaText || "Register Now",
        image: primaryEvent.image || (featuredEvent ? featuredEvent.image : ""),
        ctaLink: getGridEventUrl(primaryEvent),
      } : featuredEvent;

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

      html += '<div class="sig-evt-page grid grid-cols-12 gap-3 items-stretch" style="' + (isVis ? "" : "display: none;") + '">' +
        '<div class="col-span-5 relative rounded-3xl overflow-hidden shadow-md flex flex-col justify-between p-5 min-h-[230px] border border-blue-900/30 bg-slate-900">' +
          '<img src="' + escapeHtml(page.featured.image) + '" alt="' + escapeHtml(page.featured.title) + '" class="absolute inset-0 w-full h-full object-cover object-center" />' +
          '<div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-blue-950/80 to-blue-950/40"></div>' +
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
        '<div class="col-span-7 flex flex-col justify-between space-y-2">';

      for (var e = 0; e < page.items.length; e++) {
        var evt = page.items[e];
        var colors = getDateColorClasses(evt.color);
        html += '<div class="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2">' +
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
      html += '</div></div>';
    }
    container.innerHTML = html;

    initEvtCarousel();
  }

  function patchAchievements(achievements) {
    var container = document.getElementById("sig-ach-container");
    if (!container) return;

    var ITEMS_PER_PAGE = 4;
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
      html += '<div class="sig-ach-page grid grid-cols-4 gap-4 transition-all duration-300" style="' + (isVis ? "" : "display: none;") + '">';
      for (var a = 0; a < items.length; a++) {
        var item = items[a];
        html += '<div class="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">' +
          '<div>' +
            '<div class="relative rounded-xl overflow-hidden mb-2.5 aspect-16/10 bg-slate-100">' +
              '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" class="w-full h-full object-cover object-center" />' +
            '</div>' +
            '<h4 class="font-extrabold text-blue-950 text-base leading-snug mb-1">' + escapeHtml(item.title) + '</h4>' +
            '<p class="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-2">' + escapeHtml(item.description) + '</p>' +
          '</div>' +
          '<div class="text-blue-600 text-xs font-bold pt-2 border-t border-slate-100">' + escapeHtml(item.date) + '</div>' +
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

  /* Soft Data Sync Poller (Every 2 Minutes - NO PAGE RELOAD) */
  setInterval(function () {
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
        .catch(function () {
          /* Ignore network errors gracefully on webOS kiosk */
        });
    } catch (e) {}
  }, 120000);
})();
