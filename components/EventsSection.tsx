"use client";

import React, { useState, useEffect } from "react";
import { FeaturedEvent, UpcomingEvent } from "@/data/skeletonData";
import { Calendar, Clock, MapPin, Sparkles, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

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
  const ITEMS_PER_PAGE = 3;
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalPages = Math.ceil(upcoming.length / ITEMS_PER_PAGE) || 1;

  // Auto-slide looping effect
  useEffect(() => {
    if (isPaused || upcoming.length <= ITEMS_PER_PAGE) return;

    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, upcoming.length, totalPages]);

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

  const visibleEvents = upcoming.slice(
    currentPage * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const getGridEventUrl = (evt: UpcomingEvent) => {
    if (evt.ctaLink && evt.ctaLink.includes("grid.mitsmediaclub.com")) {
      return evt.ctaLink;
    }
    const eventId = evt.externalId || evt.id;
    return `https://grid.mitsmediaclub.com/events/${eventId}`;
  };

  return (
    <section className="my-2 sm:my-3 flex-shrink-0">
      {/* Section Header with Carousel Navigation Controls */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-blue-950 tracking-tight uppercase">
            CAMPUS EVENTS
          </h3>
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            {upcoming.length} Total
          </span>
        </div>

        {/* Slideshow Loop Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevPage}
              className="p-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors"
              title="Previous events"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-[11px] font-semibold text-slate-500 px-1">
              {currentPage + 1} / {totalPages}
            </span>

            <button
              onClick={handleNextPage}
              className="p-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors"
              title="Next events"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2 Column Split Layout - Constrained Height for 9:16 Screens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* Left Column: Featured Event Card Banner */}
        <div className="lg:col-span-5 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-md flex flex-col justify-between p-3.5 sm:p-5 min-h-[190px] sm:min-h-[220px] border border-blue-900/30 select-none group">
          <img
            src={featured.image}
            alt={featured.title}
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-blue-950/80 to-blue-950/40"></div>

          {/* Top Badge */}
          <div className="relative z-10">
            <span className="inline-block px-2.5 py-0.5 bg-blue-600/90 text-white text-[11px] font-bold rounded-full backdrop-blur-xs shadow-xs border border-blue-400/40">
              {featured.badge}
            </span>
          </div>

          {/* Bottom Details */}
          <div className="relative z-10 space-y-1.5">
            <h4 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase leading-tight line-clamp-1">
              {featured.title}
            </h4>
            <p className="text-blue-200 font-semibold text-xs line-clamp-1">
              {featured.tagline}
            </p>

            <div className="flex items-center gap-3 text-[11px] text-slate-300 pt-0.5">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-400" />
                <span>{featured.dateRange}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-400" />
                <span className="line-clamp-1">{featured.venue}</span>
              </div>
            </div>

            <div className="pt-1">
              <a
                href={featured.ctaLink && featured.ctaLink !== "#" ? featured.ctaLink : "https://grid.mitsmediaclub.com/events"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                <span>{featured.ctaText || "View on Grid"}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Events Looping Carousel Container */}
        <div
          className="lg:col-span-7 flex flex-col justify-between space-y-2"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {isSkeleton ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex items-center justify-between animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-slate-200 rounded-xl"></div>
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-36 bg-slate-300 rounded"></div>
                    <div className="h-3 w-28 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            visibleEvents.map((evt, idx) => {
              const colors = getDateColorClasses(evt.color);
              const eventUrl = getGridEventUrl(evt);
              const uniqueKey = evt.externalId || evt.id ? `${evt.externalId || evt.id}-${idx}` : `evt-${currentPage}-${idx}`;

              return (
                <a
                  key={uniqueKey}
                  href={eventUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white hover:bg-slate-50/80 transition-all duration-300 rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2 group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Date Badge Box */}
                    <div
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex flex-col items-center justify-center flex-shrink-0 shadow-2xs ${colors.bg}`}
                    >
                      <span className={`text-sm sm:text-base font-black leading-none ${colors.dayText}`}>
                        {evt.day}
                      </span>
                      <span className={`text-[8px] font-extrabold uppercase leading-none mt-0.5 ${colors.monthText}`}>
                        {evt.month}
                      </span>
                    </div>

                    {/* Event Details */}
                    <div className="min-w-0">
                      <h5 className="font-extrabold text-blue-950 text-xs sm:text-sm leading-tight truncate group-hover:text-blue-600 transition-colors">
                        {evt.title}
                      </h5>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-slate-500 text-[11px] font-medium mt-0.5">
                        <span className="flex items-center gap-1 flex-shrink-0">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {evt.time}
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{evt.venue}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Event Action & Category */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-lg border ${evt.categoryBadgeBg}`}
                    >
                      {evt.category}
                    </span>
                    <span className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-400 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </a>
              );
            })
          )}
        </div>
      </div>

      {/* Sub-footer Note with Page Dots */}
      <div className="flex items-center justify-between mt-2 text-[11px] font-semibold text-blue-600">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Click any event card to view on Grid Portal 🚀</span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  currentPage === idx ? "w-4 bg-blue-600" : "w-1.5 bg-blue-200"
                }`}
                title={`Go to page ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
