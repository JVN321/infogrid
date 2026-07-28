"use client";

import React, { useState, useEffect } from "react";
import { NewsItem, GeneralNewsItem } from "@/data/skeletonData";
import { Newspaper, Calendar, Globe } from "lucide-react";

interface NewsSectionProps {
  news: NewsItem[];
  generalNews?: GeneralNewsItem[];
  isSkeleton?: boolean;
}

export const NewsSection: React.FC<NewsSectionProps> = ({
  news,
  generalNews = [],
  isSkeleton,
}) => {
  const [mode, setMode] = useState<"campus" | "general">("campus");
  const [isFading, setIsFading] = useState(false);

  // Automatic transition toggle every 6 seconds with smooth fade
  useEffect(() => {
    if (isSkeleton) return;

    const interval = setInterval(() => {
      triggerModeSwitch();
    }, 6000);

    return () => clearInterval(interval);
  }, [isSkeleton, mode]);

  const triggerModeSwitch = (targetMode?: "campus" | "general") => {
    const nextMode = targetMode || (mode === "campus" ? "general" : "campus");
    if (nextMode === mode) return;

    setIsFading(true);
    setTimeout(() => {
      setMode(nextMode);
      setIsFading(false);
    }, 250); // half-way cross-fade duration
  };

  const getTagColorClass = (color: NewsItem["tagColor"]) => {
    switch (color) {
      case "blue":
        return "bg-sky-100 text-sky-700 border-sky-200";
      case "green":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "darkgreen":
        return "bg-green-100 text-green-800 border-green-200";
      case "orange":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "purple":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  // Uniform fallback normalization
  const currentItems = mode === "campus" ? news : (generalNews.length > 0 ? generalNews : news);
  const displayItems = currentItems.slice(0, 4);

  return (
    <section className="my-3 sm:my-4 flex-shrink-0">
      {/* Section Header with Dynamic Title & Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg text-white flex items-center justify-center shadow-xs transition-all duration-500 transform ${
              mode === "campus" ? "bg-blue-600 rotate-0" : "bg-purple-600 rotate-360"
            }`}
          >
            {mode === "campus" ? (
              <Newspaper className="w-4 h-4 transition-transform duration-300" />
            ) : (
              <Globe className="w-4 h-4 animate-pulse transition-transform duration-300" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <h3
              className={`text-base sm:text-lg font-extrabold tracking-tight uppercase transition-all duration-300 ${
                mode === "campus" ? "text-blue-950" : "text-purple-950"
              } ${isFading ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"}`}
            >
              {mode === "campus" ? "CAMPUS NEWS" : "GENERAL NEWS"}
            </h3>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider transition-colors duration-300 ${
                mode === "campus"
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-purple-100 text-purple-700 border border-purple-200"
              }`}
            >
              {mode === "campus" ? "Local" : "Global"}
            </span>
          </div>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-full text-xs shadow-inner">
          <button
            onClick={() => triggerModeSwitch("campus")}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all duration-300 ${
              mode === "campus"
                ? "bg-blue-600 text-white shadow-xs scale-105"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Campus News
          </button>
          <button
            onClick={() => triggerModeSwitch("general")}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all duration-300 ${
              mode === "general"
                ? "bg-purple-600 text-white shadow-xs scale-105"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            General News
          </button>
        </div>
      </div>

      {/* Grid of News Cards - Uniform Container & Smooth Fade Transition */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 transition-all duration-300 transform ${
          isFading ? "opacity-0 scale-[0.98] translate-y-1" : "opacity-100 scale-100 translate-y-0"
        }`}
      >
        {isSkeleton
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs animate-pulse h-[300px] flex flex-col justify-between"
              >
                <div>
                  <div className="h-36 bg-slate-200 rounded-xl mb-3"></div>
                  <div className="w-16 h-4 bg-slate-200 rounded-full mb-2"></div>
                  <div className="h-4 w-4/5 bg-slate-300 rounded mb-2"></div>
                  <div className="h-3 w-full bg-slate-200 rounded mb-1"></div>
                </div>
                <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
              </div>
            ))
          : displayItems.map((item, idx) => {
              const source = "source" in item ? (item as GeneralNewsItem).source : undefined;
              return (
                <div
                  key={`${item.id}-${idx}`}
                  className={`bg-white rounded-2xl p-3 sm:p-3.5 border shadow-xs flex flex-col justify-between select-none transition-all duration-300 h-[305px] sm:h-[315px] ${
                    mode === "campus"
                      ? "border-slate-200/80 hover:border-blue-300 hover:shadow-md"
                      : "border-purple-200/80 hover:border-purple-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex flex-col flex-1 justify-start">
                    {/* Fixed Uniform Image Aspect Ratio Container */}
                    <div className="relative rounded-xl overflow-hidden mb-2.5 h-32 sm:h-34 bg-slate-100 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                      />
                      {source && (
                        <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 text-[9px] font-extrabold bg-slate-950/80 text-white rounded-md backdrop-blur-xs shadow-xs">
                          {source}
                        </span>
                      )}
                    </div>

                    {/* Uniform Tag Row */}
                    <div className="mb-1.5 h-5 flex items-center justify-between flex-shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-md border tracking-wider uppercase ${getTagColorClass(
                          item.tagColor
                        )}`}
                      >
                        {item.tag}
                      </span>
                    </div>

                  {/* Fixed Height Uniform Title */}
                  <div className="h-10 sm:h-11 mb-1 flex items-start overflow-hidden flex-shrink-0">
                    <h4 className="font-extrabold text-blue-950 text-xs sm:text-sm leading-snug line-clamp-2">
                      {item.title}
                    </h4>
                  </div>

                  {/* Fixed Height Uniform Description */}
                  <div className="h-9 sm:h-10 overflow-hidden flex-shrink-0">
                    <p className="text-slate-600 text-[11px] sm:text-xs leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Fixed Uniform Date & Mode Footer */}
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium pt-2 border-t border-slate-100 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px]">{item.date}</span>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase ${
                      mode === "campus" ? "text-blue-600" : "text-purple-600"
                    }`}
                  >
                    {mode === "campus" ? "Campus" : "Global"}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
};
