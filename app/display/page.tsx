"use client";

import React, { useState, useEffect, useRef } from "react";
import { defaultSkeletonData, PortalData } from "@/data/skeletonData";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { NewsSection } from "@/components/NewsSection";
import { EventsSection } from "@/components/EventsSection";
import { AchievementsSection } from "@/components/AchievementsSection";
import { FooterSection } from "@/components/FooterSection";

// Fixed canvas dimensions — 9:16 portrait (e.g. 1080p display in portrait, or a standard TV/monitor)
// Change these two constants to target a different base resolution; everything else scales automatically.
const CANVAS_W = 1080;
const CANVAS_H = 1920;

export default function DisplayPage() {
  const [data, setData] = useState<PortalData>(defaultSkeletonData);
  const [isSkeleton, setIsSkeleton] = useState(false);
  const [maxFinishedEvents, setMaxFinishedEvents] = useState<number>(2);
  const [viewport, setViewport] = useState({ w: 0, h: 0, scale: 1 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Recompute scale whenever the window resizes so the canvas always fills the screen
  useEffect(() => {
    function computeScale() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scaleX = vw / CANVAS_W;
      const scaleY = vh / CANVAS_H;
      // Use the smaller scale so the full canvas always fits — no cropping
      setViewport({ w: vw, h: vh, scale: Math.min(scaleX, scaleY) });
    }
    computeScale();
    window.addEventListener("resize", computeScale);
    return () => window.removeEventListener("resize", computeScale);
  }, []);

  useEffect(() => {
    // 1. Check LocalStorage settings & sync
    const settings = localStorage.getItem("infogrid_portal_settings");
    if (settings) {
      try {
        const parsedSettings = JSON.parse(settings);
        if (typeof parsedSettings.maxFinishedEvents === "number") {
          setMaxFinishedEvents(parsedSettings.maxFinishedEvents);
        }
      } catch (e) { }
    }

    const local = localStorage.getItem("infogrid_portal_data");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.heroSlides) {
          delete parsed.heroSlides; // Force DB as the only source of truth for hero slides
        }
        setData((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Localstorage parse error", e);
      }
    }

    // 2. Fetch live data from DB via Prisma API if available
    async function syncFromApi() {
      try {
        const [newsRes, genNewsRes, eventsRes, achRes, slidesRes] = await Promise.all([
          fetch("/api/news"),
          fetch("/api/general-news"),
          fetch("/api/events"),
          fetch("/api/achievements"),
          fetch("/api/hero-slides"),
        ]);

        if (newsRes.ok && genNewsRes.ok && achRes.ok && slidesRes.ok) {
          const newsData = await newsRes.json();
          const genNewsData = await genNewsRes.json();
          const achData = await achRes.json();
          const slidesData = await slidesRes.json();

          if (Array.isArray(newsData) && newsData.length > 0) {
            setData((prev) => ({ ...prev, news: newsData }));
          }
          if (Array.isArray(genNewsData) && genNewsData.length > 0) {
            setData((prev) => ({ ...prev, generalNews: genNewsData }));
          }
          if (Array.isArray(achData) && achData.length > 0) {
            setData((prev) => ({ ...prev, achievements: achData }));
          }
          if (Array.isArray(slidesData) && slidesData.length > 0) {
            setData((prev) => ({ ...prev, heroSlides: slidesData }));
          } else {
            setData((prev) => ({
              ...prev,
              heroSlides: [
                {
                  id: "default-1",
                  welcomeText: "Welcome to",
                  titleHighlight: "InfoGrid",
                  tagline: "Stay informed. Stay inspired.",
                  image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
                  orderIndex: 0,
                },
              ],
            }));
          }
        }

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          if (Array.isArray(eventsData) && eventsData.length > 0) {
            setData((prev) => ({ ...prev, upcomingEvents: eventsData }));
          }
        }
      } catch (err) {
        console.warn("API sync error, using local data", err);
      }
    }

    // Initial sync
    syncFromApi();

    // Soft refresh background polling every 2 minutes
    const intervalId = setInterval(() => {
      syncFromApi();
    }, 120 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      {/* Prevent body-level scrollbars; only active on this page */}
      <style>{`html, body { overflow: hidden !important; margin: 0; padding: 0; }`}</style>
      {/*
       * Outer shell: fills the entire viewport with a dark background.
       * The scaled canvas is positioned absolutely inside and centered via margin math.
       */}
      <div
        style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {/*
       * Scaled canvas wrapper.
       * Width/height are fixed at CANVAS_W×CANVAS_H — these are the "design pixels".
       * transform-origin is top-left so the scale anchors correctly; the outer
       * flex centering handles visual placement.
       *
       * transform: scale() is a CSS-level zoom — every pixel, font, border, and
       * shadow inside is scaled uniformly. The layout is always identical to the
       * 1080p reference; only the physical screen size changes.
       */}
        <div
          ref={wrapperRef}
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            transformOrigin: "top left",
            transform: `scale(${viewport.scale})`,
            /* Shift the canvas so it stays centered after scaling from top-left */
            marginLeft: (viewport.w - CANVAS_W * viewport.scale) / 2,
            marginTop: (viewport.h - CANVAS_H * viewport.scale) / 2,
            position: "absolute",
            top: 0,
            left: 0,
            overflow: "hidden",
          }}
          className="bg-[#f5f7fa] flex flex-col shadow-2xl"
        >
          {/* College Portal Header */}
          <Header data={data.header} isSkeleton={isSkeleton} />

          {/* Main Content Area — no overflow scroll; everything fits the fixed canvas */}
          <main className="flex-1 flex flex-col justify-between px-6 py-4 space-y-4 overflow-hidden">
            {/* Welcome / Hero Banner Slider */}
            <HeroSection slides={data.heroSlides} isSkeleton={isSkeleton} />

            {/* Campus & General News Section */}
            <NewsSection
              news={data.news}
              generalNews={data.generalNews}
              isSkeleton={isSkeleton}
            />

            {/* Campus Events Section */}
            <EventsSection
              featured={data.featuredEvent}
              upcoming={data.upcomingEvents}
              maxFinishedEvents={maxFinishedEvents}
              isSkeleton={isSkeleton}
            />

            {/* Achievements Showcase Section */}
            <AchievementsSection
              achievements={data.achievements}
              isSkeleton={isSkeleton}
            />

            {/* Footer Quote & Social Connect Section */}
            <FooterSection footer={data.footer} isSkeleton={isSkeleton} />
          </main>
        </div>
      </div>
    </>
  );
}

