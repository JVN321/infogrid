"use client";

import React from "react";
import { HeaderInfo } from "@/data/skeletonData";
import { Clock, Calendar } from "lucide-react";

interface HeaderProps {
  data: HeaderInfo;
  isSkeleton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ data, isSkeleton }) => {
  if (isSkeleton) {
    return (
      <header className="bg-white border-b border-slate-100 py-3 px-4 shadow-2xs animate-pulse flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-14 bg-slate-200 rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-4 w-44 bg-slate-200 rounded"></div>
              <div className="h-3 w-32 bg-slate-200 rounded"></div>
            </div>
          </div>
          <div className="w-28 h-9 bg-slate-200 rounded-lg"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-slate-200/80 py-2.5 px-4 sm:px-6 shadow-2xs flex-shrink-0 z-20">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Logo & College Name */}
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-14 flex-shrink-0 flex items-center justify-center bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-900 text-white rounded-lg shadow-xs border border-amber-400/40">
            <div className="flex flex-col items-center justify-center p-0.5 text-center">
              <span className="font-black text-lg tracking-tighter leading-none text-amber-300">
                M
              </span>
              <div className="w-7 h-[1.5px] bg-amber-400 my-0.5"></div>
              <span className="text-[7px] tracking-widest font-bold text-slate-200 uppercase">
                ESTD. 2000
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl md:text-2xl font-black text-blue-950 tracking-tight leading-none uppercase">
              {data.collegeName}
            </h1>
            <h2 className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wider leading-tight">
              {data.collegeSub}
            </h2>
            <span className="text-[11px] italic text-blue-600 font-semibold mt-0.5 hidden xs:inline">
              {data.motto}
            </span>
          </div>
        </div>

        {/* Right: Date & Live Time Box */}
        <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3 text-right">
          <div className="flex items-center gap-1.5 text-blue-950 font-extrabold text-sm sm:text-base leading-tight">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{data.liveTime}</span>
          </div>
          <div className="flex flex-col text-[10px] text-slate-600 font-semibold border-l border-slate-200 pl-2.5">
            <span>{data.liveDay}</span>
            <span>{data.liveDate}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
