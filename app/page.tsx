"use client";

import React, { useState, useEffect } from "react";
import { defaultSkeletonData, PortalData } from "@/data/skeletonData";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { NewsSection } from "@/components/NewsSection";
import { EventsSection } from "@/components/EventsSection";
import { AchievementsSection } from "@/components/AchievementsSection";
import { FooterSection } from "@/components/FooterSection";
import { SkeletonController } from "@/components/SkeletonController";

export default function Home() {
  const [data, setData] = useState<PortalData>(defaultSkeletonData);
  const [isSkeleton, setIsSkeleton] = useState(false);
  const [is916View, setIs916View] = useState(false);

  useEffect(() => {
    // 1. Check LocalStorage sync
    const local = localStorage.getItem("infogrid_portal_data");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        setData((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Localstorage parse error", e);
      }
    }

    // 2. Fetch live data from Supabase DB via Prisma API if available
    async function syncFromApi() {
      try {
        const [newsRes, genNewsRes, achRes] = await Promise.all([
          fetch("/api/news"),
          fetch("/api/general-news"),
          fetch("/api/achievements"),
        ]);

        if (newsRes.ok && genNewsRes.ok && achRes.ok) {
          const newsData = await newsRes.json();
          const genNewsData = await genNewsRes.json();
          const achData = await achRes.json();

          if (Array.isArray(newsData) && newsData.length > 0) {
            setData((prev) => ({ ...prev, news: newsData }));
          }
          if (Array.isArray(genNewsData) && genNewsData.length > 0) {
            setData((prev) => ({ ...prev, generalNews: genNewsData }));
          }
          if (Array.isArray(achData) && achData.length > 0) {
            setData((prev) => ({ ...prev, achievements: achData }));
          }
        }
      } catch (err) {
        console.warn("API sync error, using local data", err);
      }
    }

    syncFromApi();
  }, []);

  const handleResetDefaults = () => {
    localStorage.removeItem("infogrid_portal_data");
    setData(defaultSkeletonData);
  };

  return (
    <div
      className={`min-h-screen bg-slate-900 text-slate-800 antialiased font-sans flex items-center justify-center p-0 sm:p-3 selection:bg-blue-600 selection:text-white ${
        is916View ? "h-screen max-h-screen overflow-hidden" : ""
      }`}
    >
      {/* Floating Toolbar for Live JSON Editing, Admin Navigation & 9:16 Mode */}
      <SkeletonController
        data={data}
        setData={setData}
        isSkeleton={isSkeleton}
        setIsSkeleton={setIsSkeleton}
        onReset={handleResetDefaults}
        is916View={is916View}
        setIs916View={setIs916View}
      />

      {/* Main College Dashboard Canvas */}
      <div
        className={`bg-[#f5f7fa] w-full flex flex-col justify-between transition-all duration-300 shadow-2xl ${
          is916View
            ? "max-w-[500px] h-[95vh] rounded-3xl border-4 border-slate-800 overflow-hidden"
            : "min-h-screen max-w-7xl rounded-none sm:rounded-3xl border-0"
        }`}
      >
        {/* College Portal Header */}
        <Header data={data.header} isSkeleton={isSkeleton} />

        {/* Main Content Area: Responsive spacing, full size, fluid flex fill */}
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
