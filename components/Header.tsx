"use client";

import React from "react";
import Image from "next/image";
import { HeaderInfo } from "@/data/skeletonData";

interface HeaderProps {
  data: HeaderInfo;
  isSkeleton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ data, isSkeleton }) => {

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


      </div>
    </header>
  );
};
