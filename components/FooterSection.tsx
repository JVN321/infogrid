"use client";

import React from "react";
import { PortalData } from "@/data/skeletonData";
import { Quote } from "lucide-react";

interface FooterSectionProps {
  footer: PortalData["footer"];
  isSkeleton?: boolean;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  footer,
  isSkeleton,
}) => {
  if (isSkeleton) {
    return (
      <footer className="mt-4 animate-pulse flex-shrink-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
          <div className="lg:col-span-7 h-28 bg-slate-200 rounded-2xl"></div>
          <div className="lg:col-span-5 h-28 bg-slate-200 rounded-2xl"></div>
        </div>
        <div className="h-10 bg-slate-300 rounded-xl"></div>
      </footer>
    );
  }

  return (
    <footer className="mt-4 sm:mt-6 flex-shrink-0">
      {/* Upper Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4 items-stretch">
        {/* Left: Quote Card */}
        <div className="lg:col-span-7 relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-50/90 via-sky-50/60 to-blue-100/50 p-4 sm:p-6 border border-blue-100/80 shadow-2xs overflow-hidden flex flex-col justify-center">
          <div className="relative z-10 flex items-start gap-3">
            <div className="text-blue-600 flex-shrink-0 pt-0.5">
              <Quote className="w-6 h-6 text-blue-500 fill-blue-100 rotate-180" />
            </div>
            <div>
              <blockquote className="text-slate-800 text-xs sm:text-sm md:text-base font-bold leading-relaxed tracking-tight">
                "{footer.quote}"
              </blockquote>
              <cite className="block text-blue-700 font-extrabold text-xs sm:text-sm mt-1 not-italic">
                — {footer.quoteAuthor}
              </cite>
            </div>
          </div>
        </div>

        {/* Right: Stay Connected Card */}
        <div className="lg:col-span-5 rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h4 className="text-xs sm:text-sm font-extrabold text-blue-950 tracking-wider uppercase leading-none">
              {footer.stayConnectedTitle}
            </h4>
            <p className="text-xs text-slate-500 font-semibold">
              {footer.stayConnectedSubtitle}
            </p>

            {/* Social Icons & Handle */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="#"
                className="w-7 h-7 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs"
                title="Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              <a
                href="#"
                className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs"
                title="LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              <a
                href="#"
                className="w-7 h-7 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs"
                title="Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z" />
                </svg>
              </a>
              <span className="text-xs font-bold text-slate-600 ml-1">
                {footer.handle}
              </span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl flex items-center justify-center overflow-hidden">
              <img src="/qr-code.png" alt="QR Code" className="w-full h-full object-contain scale-105" />
            </div>
          </div>
        </div>
      </div>

      {/* Solid Bottom Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white text-center py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide shadow-xs flex items-center justify-center gap-1">
        <span>{footer.bottomBannerText}</span>
      </div>
    </footer>
  );
};
