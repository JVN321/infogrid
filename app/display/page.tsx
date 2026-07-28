"use client";

import React, { useState, useEffect } from "react";
import { defaultSkeletonData, PortalData } from "@/data/skeletonData";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { NewsSection } from "@/components/NewsSection";
import { EventsSection } from "@/components/EventsSection";
import { AchievementsSection } from "@/components/AchievementsSection";
import { FooterSection } from "@/components/FooterSection";

export default function DisplayPage() {
  const [data, setData] = useState<PortalData>(defaultSkeletonData);
  const [isSkeleton, setIsSkeleton] = useState(false);
  const [maxFinishedEvents, setMaxFinishedEvents] = useState<number>(2);

  useEffect(() => {
    // 1. Check LocalStorage settings & sync
    const settings = localStorage.getItem("infogrid_portal_settings");
    if (settings) {
      try {
        const parsedSettings = JSON.parse(settings);
        if (typeof parsedSettings.maxFinishedEvents === "number") {
          setMaxFinishedEvents(parsedSettings.maxFinishedEvents);
        }
      } catch (e) {}
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
    <div className="min-h-screen bg-slate-900 text-slate-800 antialiased font-sans flex items-center justify-center p-0 sm:p-3 selection:bg-blue-600 selection:text-white">
      {/* Main College Dashboard Canvas */}
      <div className="bg-[#f5f7fa] w-full min-h-screen max-w-7xl rounded-none sm:rounded-3xl border-0 flex flex-col justify-between transition-all duration-300 shadow-2xl overflow-hidden">
        {/* College Portal Header */}
        <Header data={data.header} isSkeleton={isSkeleton} />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col justify-between px-4 sm:px-6 lg:px-8 py-4 space-y-4 overflow-y-auto lg:overflow-y-visible">
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
  );
}
