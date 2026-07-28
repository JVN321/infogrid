"use client";

import React from "react";
import { NewsItem, GeneralNewsItem } from "@/data/skeletonData";
import { Newspaper, Calendar } from "lucide-react";

interface NewsSectionProps {
  news: NewsItem[];
  generalNews?: GeneralNewsItem[];
  isSkeleton?: boolean;
}

export const NewsSection: React.FC<NewsSectionProps> = ({
  news,
  isSkeleton,
}) => {
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

  const displayItems = news.slice(0, 4);

  return (
    <section className="my-3 sm:my-4 flex-shrink-0">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg text-white flex items-center justify-center shadow-xs bg-blue-600">
            <Newspaper className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-extrabold tracking-tight uppercase text-blue-950">
              CAMPUS NEWS
            </h3>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
              Local
            </span>
          </div>
        </div>
      </div>

      {/* Grid of News Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 transition-all duration-300 transform">
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
          : displayItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between select-none transition-all duration-300 h-[305px] sm:h-[315px] hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex flex-col flex-1 justify-start">
                  {/* Fixed Uniform Image Aspect Ratio Container */}
                  <div className="relative rounded-xl overflow-hidden mb-2.5 h-32 sm:h-34 bg-slate-100 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                    />
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
                  <span className="text-[10px] font-extrabold uppercase text-blue-600">
                    Campus
                  </span>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
};

