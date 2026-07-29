"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { NewsItem, GeneralNewsItem } from "@/data/skeletonData";
import { Calendar } from "lucide-react";

interface NewsSectionProps {
  news: NewsItem[];
  generalNews?: GeneralNewsItem[];
  isSkeleton?: boolean;
}

export const NewsSection: React.FC<NewsSectionProps> = ({
  news = [],
  generalNews = [],
  isSkeleton,
}) => {
  const ITEMS_PER_PAGE = 4;
  const [currentMode, setCurrentMode] = useState<"campus" | "global">("campus");
  const [currentPage, setCurrentPage] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const totalCampusPages = Math.ceil((news.length || 1) / ITEMS_PER_PAGE);
  const totalGlobalPages = Math.ceil((generalNews.length || 1) / ITEMS_PER_PAGE);

  useEffect(() => {
    if (isSkeleton || (news.length === 0 && generalNews.length === 0)) return;
    
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        if (currentMode === "campus") {
          if (currentPage + 1 < totalCampusPages) {
            setCurrentPage(currentPage + 1);
          } else if (generalNews.length > 0) {
            setCurrentMode("global");
            setCurrentPage(0);
          } else {
            setCurrentPage(0);
          }
        } else {
          if (currentPage + 1 < totalGlobalPages) {
            setCurrentPage(currentPage + 1);
          } else if (news.length > 0) {
            setCurrentMode("campus");
            setCurrentPage(0);
          } else {
            setCurrentPage(0);
          }
        }
        setIsFading(false);
      }, 300);
    }, 8000); // 8 seconds per slide

    return () => clearInterval(interval);
  }, [currentMode, currentPage, totalCampusPages, totalGlobalPages, news.length, generalNews.length, isSkeleton]);

  const getTagColorClass = (color: NewsItem["tagColor"]) => {
    switch (color) {
      case "blue": return "bg-sky-100 text-sky-700 border-sky-200";
      case "green": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "darkgreen": return "bg-green-100 text-green-800 border-green-200";
      case "orange": return "bg-amber-100 text-amber-700 border-amber-200";
      case "purple": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const currentItems = useMemo(() => {
    const list = currentMode === "campus" ? news : generalNews;
    const start = currentPage * ITEMS_PER_PAGE;
    return list.slice(start, start + ITEMS_PER_PAGE);
  }, [currentMode, currentPage, news, generalNews]);

  // If no items in either, we'll render empty campus news
  const isDisplayingGlobal = currentMode === "global" && generalNews.length > 0;

  return (
    <section className="my-3 sm:my-4 flex-shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-extrabold tracking-tight uppercase text-blue-950 transition-opacity duration-300">
            {isDisplayingGlobal ? "GLOBAL NEWS" : "CAMPUS NEWS"}
          </h3>
          <div className="flex items-center gap-1 ml-4">
            {(isDisplayingGlobal ? Array.from({ length: totalGlobalPages }) : Array.from({ length: totalCampusPages })).map((_, i) => (
              <span key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentPage ? "bg-blue-600 w-4" : "bg-blue-200"}`} />
            ))}
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 transition-all duration-300 transform ${isFading ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}>
        {isSkeleton
          ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs animate-pulse h-[300px] flex flex-col justify-between">
                <div>
                  <div className="h-36 bg-slate-200 rounded-xl mb-3"></div>
                  <div className="w-16 h-4 bg-slate-200 rounded-full mb-2"></div>
                  <div className="h-4 w-4/5 bg-slate-300 rounded mb-2"></div>
                  <div className="h-3 w-full bg-slate-200 rounded mb-1"></div>
                </div>
                <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
              </div>
            ))
          : currentItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between select-none transition-all duration-300 h-[305px] sm:h-[315px] hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex flex-col flex-1 justify-start">
                  <div className="relative rounded-xl overflow-hidden mb-2.5 h-32 sm:h-34 bg-slate-100 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="mb-1.5 h-5 flex items-center justify-between flex-shrink-0">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-md border tracking-wider uppercase ${getTagColorClass(item.tagColor)}`}>
                      {item.tag}
                    </span>
                    {(item as GeneralNewsItem).source && (
                      <span className="text-[9px] font-bold text-slate-400 truncate max-w-[50%]">
                        {(item as GeneralNewsItem).source}
                      </span>
                    )}
                  </div>
                  <div className="h-10 sm:h-11 mb-1 flex items-start overflow-hidden flex-shrink-0">
                    <h4 className="font-extrabold text-blue-950 text-xs sm:text-sm leading-snug line-clamp-2">
                      {item.title}
                    </h4>
                  </div>
                  <div className="h-9 sm:h-10 overflow-hidden flex-shrink-0">
                    <p className="text-slate-600 text-[11px] sm:text-xs leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500 font-semibold text-[10px] sm:text-xs">
                    {item.date}
                  </span>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
};
