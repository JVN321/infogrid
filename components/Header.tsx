"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { HeaderInfo } from "@/data/skeletonData";
import { Clock, Calendar } from "lucide-react";

interface HeaderProps {
  data: HeaderInfo;
  isSkeleton?: boolean;
}

function getISTDateTime() {
  const now = new Date();

  const liveTime = now.toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const liveDay = now.toLocaleDateString("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
  });

  const liveDate = now.toLocaleDateString("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return { liveTime, liveDay, liveDate };
}

export const Header: React.FC<HeaderProps> = ({ data, isSkeleton }) => {
  const [timeInfo, setTimeInfo] = useState({
    liveTime: data.liveTime || "",
    liveDay: data.liveDay || "",
    liveDate: data.liveDate || "",
  });

  useEffect(() => {
    // Initial sync on mount
    setTimeInfo(getISTDateTime());

    // Update every second in realtime
    const interval = setInterval(() => {
      setTimeInfo(getISTDateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (isSkeleton) {
    return (
      <header className="bg-white border-b border-slate-100 px-6 py-3 shadow-xs flex-shrink-0 animate-pulse h-20 flex items-center">
        <div className="w-full mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <div className="w-14 h-12 bg-slate-200 rounded-lg"></div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-5 w-72 bg-slate-200 rounded"></div>
            <div className="h-3 w-40 bg-slate-200 rounded"></div>
          </div>
          <div className="w-36 h-10 bg-slate-200 rounded-xl"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-3 shadow-xs flex-shrink-0 z-20 h-20 flex items-center">
      <div className="w-full mx-auto flex items-center justify-between gap-6">
        {/* Left: Combined Brand Logos */}
        <div className="flex items-center gap-3.5 flex-shrink-0">
          <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <Image
              src="/Departmentlogo.png"
              alt="Department Logo"
              fill
              sizes="48px"
              priority
              className="object-contain"
            />
          </div>
          <div className="h-8 w-[1px] bg-slate-200/80 flex-shrink-0" />
          <div className="relative w-14 h-12 flex-shrink-0 flex items-center justify-center">
            <Image
              src="/MuthootLogo.png"
              alt="Muthoot Logo"
              fill
              sizes="56px"
              priority
              className="object-contain"
            />
          </div>
        </div>

        {/* Center: College Name (Centered, uniform size, no motto) */}
        <div className="flex flex-col justify-center items-center flex-1 min-w-0 text-center px-2">
          <h1 className="text-base sm:text-lg md:text-xl font-black text-blue-950 tracking-tight uppercase truncate text-center">
            {data.collegeSub ? `${data.collegeName} ${data.collegeSub}` : data.collegeName}
          </h1>
        </div>

        {/* Right: Sleek Date & Live Time Widget */}
        <div className="flex items-center flex-shrink-0">
          <div className="bg-slate-50/80 px-3.5 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="flex items-center gap-2 text-blue-950 font-extrabold text-sm sm:text-base leading-none tabular-nums whitespace-nowrap">
              <Clock className="w-4 h-4 text-blue-600 animate-pulse flex-shrink-0" />
              <span>{timeInfo.liveTime}</span>
            </div>
            <div className="h-6 w-[1px] bg-slate-200 flex-shrink-0" />
            <div className="flex flex-col text-[10px] text-slate-600 font-bold leading-tight uppercase tracking-wider whitespace-nowrap">
              <span>{timeInfo.liveDay}</span>
              <span className="text-slate-500 font-medium">{timeInfo.liveDate}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
