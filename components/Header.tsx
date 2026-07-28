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
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-16 h-16 bg-slate-200 rounded-xl"></div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-slate-200 rounded-xl"></div>
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
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Department Logo */}
        <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
            <img
              src="/Departmentlogo.png"
              alt="Department Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Center: College Logo & Name */}
        <div className="flex flex-1 items-center justify-center gap-3 text-center sm:text-left w-full sm:w-auto">
          <div className="relative w-16 h-18 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
            <img
              src="/MuthootLogo.png"
              alt="Muthoot Logo"
              className="w-full h-full object-contain"
            />
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
        <div className="flex items-center justify-center sm:justify-end w-full sm:w-auto">
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
      </div>
    </header>
  );
};
