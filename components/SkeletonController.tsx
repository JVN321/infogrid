"use client";

import React from "react";
import Link from "next/link";
import { LayoutDashboard, Smartphone } from "lucide-react";

interface SkeletonControllerProps {
  is916View: boolean;
  setIs916View: (val: boolean) => void;
}

export const SkeletonController: React.FC<SkeletonControllerProps> = ({
  is916View,
  setIs916View,
}) => {
  return (
    <div className="fixed top-2 right-2 sm:top-3 sm:right-3 z-50 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/90 shadow-md text-xs">
      {/* Link to Admin Page */}
      <Link
        href="/admin"
        className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-full transition-all shadow-2xs"
        title="Open Admin Dashboard"
      >
        <LayoutDashboard className="w-3 h-3 text-blue-400" />
        <span>Admin</span>
      </Link>

      {/* Toggle 9:16 Frame Preview */}
      <button
        onClick={() => setIs916View(!is916View)}
        className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full transition-all ${
          is916View
            ? "bg-indigo-600 text-white shadow-2xs"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        }`}
        title="Toggle 9:16 Aspect Ratio Frame"
      >
        <Smartphone className="w-3 h-3" />
        <span>{is916View ? "9:16 Frame: ON" : "9:16 Mode"}</span>
      </button>
    </div>
  );
};
