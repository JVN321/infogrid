"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AchievementItem } from "@/data/skeletonData";
import { Trophy, Medal, Award, Star } from "lucide-react";

interface AchievementsSectionProps {
  achievements: AchievementItem[];
  isSkeleton?: boolean;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  achievements,
  isSkeleton,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const ITEMS_PER_PAGE = 2;
  const totalPages = Math.ceil(achievements.length / ITEMS_PER_PAGE) || 1;

  const changePage = (newPage: number) => {
    if (newPage === currentPage) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentPage(newPage);
      setIsFading(false);
    }, 250);
  };

  useEffect(() => {
    if (isSkeleton || achievements.length <= ITEMS_PER_PAGE) return;
    const interval = setInterval(() => {
      changePage((currentPage + 1) % totalPages);
    }, 6000);
    return () => clearInterval(interval);
  }, [achievements.length, isSkeleton, currentPage, totalPages]);

  const displayItems =
    achievements.length <= ITEMS_PER_PAGE
      ? achievements
      : Array.from({ length: ITEMS_PER_PAGE }).map((_, j) => {
          const startIndex = currentPage * ITEMS_PER_PAGE;
          return achievements[(startIndex + j) % achievements.length];
        });

  return (
    <section className="my-3 sm:my-4 flex-shrink-0">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-extrabold text-blue-950 tracking-tight uppercase">
            ACHIEVEMENTS
          </h3>
        </div>

        {/* Page Dots indicator if more than 1 page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => changePage(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentPage === idx ? "w-4 bg-amber-500" : "w-1.5 bg-amber-200"
                }`}
                title={`Go to page ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Grid of Achievement Cards */}
      <div
        className={`grid grid-cols-2 gap-4 h-[440px] transition-all duration-300 transform ${
          isFading ? "opacity-0 scale-[0.98] translate-y-1" : "opacity-100 scale-100 translate-y-0"
        }`}
      >
        {isSkeleton
          ? Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs animate-pulse h-[440px]"
              >
                <div className="h-60 bg-slate-200 rounded-xl mb-3"></div>
                <div className="h-4 w-3/4 bg-slate-300 rounded mb-2"></div>
                <div className="h-3 w-full bg-slate-200 rounded mb-1"></div>
              </div>
            ))
          : displayItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between select-none h-[440px]"
              >
                <div className="flex flex-col flex-1 min-h-0">
                  {/* 16:9 Thumbnail Image Container (736x414 aspect ratio) - Fit with clean white fill */}
                  <div className="relative rounded-xl overflow-hidden mb-3 aspect-[16/9] w-full bg-white border border-slate-100 flex items-center justify-center h-[250px] flex-shrink-0 p-1">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-contain object-center"
                    />
                  </div>

                  {/* Title */}
                  <h4 className="font-extrabold text-blue-950 text-base sm:text-lg leading-snug mb-1 line-clamp-2 overflow-hidden flex-shrink-0">
                    {item.title}
                  </h4>

                  {/* Description */}
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-2 overflow-hidden flex-shrink-0">
                    {item.description}
                  </p>
                </div>

                {/* Date with increased padding */}
                <div className="text-blue-600 text-xs sm:text-sm font-bold pt-3.5 pb-1 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
};
