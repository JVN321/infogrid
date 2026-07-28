"use client";

import React from "react";
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
  const getBadgeIcon = (type: AchievementItem["badgeType"]) => {
    switch (type) {
      case "trophy":
        return {
          icon: <Trophy className="w-4 h-4 text-amber-600" />,
          bg: "bg-amber-100 border-amber-300",
        };
      case "medal":
        return {
          icon: <Medal className="w-4 h-4 text-blue-600" />,
          bg: "bg-blue-100 border-blue-300",
        };
      case "ribbon":
        return {
          icon: <Award className="w-4 h-4 text-rose-600" />,
          bg: "bg-rose-100 border-rose-300",
        };
      case "star":
        return {
          icon: <Star className="w-4 h-4 text-sky-600" />,
          bg: "bg-sky-100 border-sky-300",
        };
      default:
        return {
          icon: <Trophy className="w-4 h-4 text-amber-600" />,
          bg: "bg-amber-100 border-amber-300",
        };
    }
  };

  return (
    <section className="my-3 sm:my-4 flex-shrink-0">
      {/* Section Header - View All Button Removed */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-extrabold text-blue-950 tracking-tight uppercase">
            ACHIEVEMENTS SHOWCASE
          </h3>
        </div>
      </div>

      {/* Grid of Achievement Cards - Non-interactive Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {isSkeleton
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-xs animate-pulse"
              >
                <div className="h-32 bg-slate-200 rounded-xl mb-3"></div>
                <div className="h-4 w-3/4 bg-slate-300 rounded mb-2"></div>
                <div className="h-3 w-full bg-slate-200 rounded mb-1"></div>
              </div>
            ))
          : achievements.map((item, idx) => {
              const badge = getBadgeIcon(item.badgeType);
              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between select-none"
                >
                  <div>
                    {/* Thumbnail Image */}
                    <div className="relative rounded-xl overflow-hidden mb-2.5 aspect-16/10 bg-slate-100">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    {/* Title */}
                    <h4 className="font-extrabold text-blue-950 text-sm sm:text-base leading-snug mb-1">
                      {item.title}
                    </h4>

                    {/* Description */}
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="text-blue-600 text-xs font-bold pt-2 border-t border-slate-100">
                    {item.date}
                  </div>
                </div>
              );
            })}
      </div>
    </section>
  );
};
