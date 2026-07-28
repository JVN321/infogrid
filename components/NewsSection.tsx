"use client";

import React from "react";
import { NewsItem } from "@/data/skeletonData";
import { Newspaper, Calendar, ArrowRight } from "lucide-react";

interface NewsSectionProps {
  news: NewsItem[];
  isSkeleton?: boolean;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ news, isSkeleton }) => {
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

  return (
    <section className="my-3 sm:my-4 flex-shrink-0">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Newspaper className="w-4 h-4" />
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-blue-950 tracking-tight uppercase">
            CAMPUS NEWS
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

      {/* Grid of 4 News Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {isSkeleton
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-xs animate-pulse"
              >
                <div className="h-32 bg-slate-200 rounded-xl mb-3"></div>
                <div className="w-16 h-4 bg-slate-200 rounded-full mb-2"></div>
                <div className="h-4 w-4/5 bg-slate-300 rounded mb-2"></div>
                <div className="h-3 w-full bg-slate-200 rounded mb-1"></div>
              </div>
            ))
          : news.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail Image */}
                  <div className="relative rounded-xl overflow-hidden mb-2.5 aspect-16/10 bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Category Tag Badge */}
                  <div className="mb-1.5">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-md border tracking-wider uppercase ${getTagColorClass(
                        item.tagColor
                      )}`}
                    >
                      {item.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-extrabold text-blue-950 text-sm sm:text-base leading-snug mb-1 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h4>

                  {/* Description */}
                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-2.5">
                    {item.description}
                  </p>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium pt-2 border-t border-slate-100">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
};
