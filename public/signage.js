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

  /* Smart Soft Refresh Check: Poll every 15 seconds for content changes */
  setInterval(function () {
    try {
      var currentVer = document.body ? document.body.getAttribute("data-version") : null;
      fetch("/display-signage?check=1&t=" + new Date().getTime(), { cache: "no-store" })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data && data.version && currentVer && data.version !== currentVer) {
            window.location.href = "/display-signage?t=" + new Date().getTime();
          }
        })
        .catch(function () {
          /* Ignore network errors gracefully on webOS kiosk */
        });
    } catch (e) {}
  }, 15000);
})();
