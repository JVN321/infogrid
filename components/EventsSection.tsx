"use client";

import React from "react";
import { FeaturedEvent, UpcomingEvent } from "@/data/skeletonData";
import { Calendar, ArrowRight, Clock, MapPin, Sparkles } from "lucide-react";

interface EventsSectionProps {
  featured: FeaturedEvent;
  upcoming: UpcomingEvent[];
  isSkeleton?: boolean;
}

export const EventsSection: React.FC<EventsSectionProps> = ({
  featured,
  upcoming,
  isSkeleton,
}) => {
  const getDateColorClasses = (color: UpcomingEvent["color"]) => {
    switch (color) {
      case "blue":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          dayText: "text-blue-700",
          monthText: "text-blue-500",
        };
      case "green":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dayText: "text-emerald-700",
          monthText: "text-emerald-500",
        };
      case "purple":
        return {
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          dayText: "text-purple-700",
          monthText: "text-purple-500",
        };
      case "orange":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dayText: "text-amber-700",
          monthText: "text-amber-500",
        };
      default:
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          dayText: "text-blue-700",
          monthText: "text-blue-500",
        };
    }
  };

  return (
    <section className="my-3 sm:my-4 flex-shrink-0">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-blue-950 tracking-tight uppercase">
            CAMPUS EVENTS
          </h3>
        </div>
        <a
          href="#"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors group"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      {/* 2 Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Column: Featured Event Card Banner */}
        <div className="lg:col-span-5 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-md group flex flex-col justify-between p-4 sm:p-6 min-h-[220px] sm:min-h-[260px] border border-blue-900/30">
          <img
            src={featured.image}
            alt={featured.title}
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-blue-950/80 to-blue-950/40"></div>

          {/* Top Badge */}
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-blue-600/90 text-white text-xs font-bold rounded-full backdrop-blur-xs shadow-xs border border-blue-400/40">
              {featured.badge}
            </span>
          </div>

          {/* Bottom Details */}
          <div className="relative z-10 space-y-2">
            <h4 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight uppercase leading-tight">
              {featured.title}
            </h4>
            <p className="text-blue-200 font-semibold text-xs sm:text-sm">
              {featured.tagline}
            </p>

            <div className="space-y-1 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>{featured.dateRange}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{featured.venue}</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={featured.ctaLink}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all group/btn"
              >
                <span>{featured.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Events List */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-2">
          {isSkeleton
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex items-center justify-between animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                    <div className="space-y-1.5">
                      <div className="h-4 w-36 bg-slate-300 rounded"></div>
                      <div className="h-3 w-28 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            : upcoming.map((evt) => {
                const colors = getDateColorClasses(evt.color);
                return (
                  <div
                    key={evt.id}
                    className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Date Badge Box */}
                      <div
                        className={`w-12 h-12 sm:w-13 sm:h-13 rounded-xl border flex flex-col items-center justify-center flex-shrink-0 shadow-2xs ${colors.bg}`}
                      >
                        <span
                          className={`text-base sm:text-lg font-black leading-none ${colors.dayText}`}
                        >
                          {evt.day}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold uppercase leading-none mt-0.5 ${colors.monthText}`}
                        >
                          {evt.month}
                        </span>
                      </div>

                      {/* Event Details */}
                      <div>
                        <h5 className="font-extrabold text-blue-950 text-xs sm:text-sm leading-snug group-hover:text-blue-600 transition-colors">
                          {evt.title}
                        </h5>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-slate-500 text-xs font-medium mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {evt.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {evt.venue}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Event Tag */}
                    <div className="self-start sm:self-center">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${evt.categoryBadgeBg}`}
                      >
                        {evt.category}
                      </span>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

      {/* Sub-footer Note */}
      <div className="text-center mt-2.5 text-xs sm:text-sm font-semibold text-blue-600 flex items-center justify-center gap-1.5">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span>More events coming soon. Stay tuned! 📣</span>
      </div>
    </section>
  );
};
