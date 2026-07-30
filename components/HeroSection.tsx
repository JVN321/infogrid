"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { HeroSlide } from "@/data/skeletonData";

interface HeroSectionProps {
  slides: HeroSlide[];
  isSkeleton?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  slides,
  isSkeleton,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const changeSlide = (newIndex: number) => {
    if (newIndex === currentSlide) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentSlide(newIndex);
      setIsFading(false);
    }, 250);
  };

  useEffect(() => {
    if (isSkeleton || slides.length <= 1) return;
    const interval = setInterval(() => {
      changeSlide((currentSlide + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length, isSkeleton, currentSlide]);

  if (isSkeleton || !slides || slides.length === 0) {
    return (
      <div className="w-full bg-blue-50/60 rounded-2xl border border-blue-100 p-4 sm:p-6 my-2 animate-pulse flex-shrink-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-6 space-y-3">
            <div className="h-4 w-28 bg-slate-200 rounded"></div>
            <div className="h-8 w-3/4 bg-slate-300 rounded"></div>
            <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
          </div>
          <div className="lg:col-span-6 h-40 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const slide = slides[currentSlide] || slides[0];

  return (
    <section className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-blue-50 via-sky-50/90 to-blue-100/70 border border-blue-100 shadow-2xs my-2 flex-shrink-0 transition-all">
      <div className="grid grid-cols-12 gap-6 p-6 lg:p-8 items-center min-h-0">
        {/* Left Content */}
        <div
          className={`col-span-6 z-10 flex flex-col justify-center space-y-2 transition-all duration-300 transform ${
            isFading ? "opacity-0 translate-y-1 scale-[0.98]" : "opacity-100 translate-y-0 scale-100"
          }`}
        >
          <span className="text-slate-500 font-semibold text-base tracking-tight">
            {slide.welcomeText}
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-blue-950 tracking-tight leading-tight">
            {slide.titleHighlight}
          </h2>
          <div className="w-10 h-1 bg-blue-600 rounded-full my-1"></div>
          <p className="text-slate-600 font-medium text-base leading-snug">
            {slide.tagline}
          </p>

          {/* Slider Pagination Controls */}
          <div className="flex items-center gap-2 pt-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => changeSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentSlide
                    ? "w-7 h-2.5 bg-blue-600 shadow-2xs"
                    : "w-2.5 h-2.5 bg-blue-200 hover:bg-blue-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Banner Image */}
        <div
          className={`col-span-6 relative z-10 flex-1 transition-all duration-300 transform ${
            isFading ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
        >
          <div className="relative w-full h-36 sm:h-48 md:h-56 lg:h-64 rounded-2xl overflow-hidden shadow-md border-2 border-white group">
            <Image
              src={slide.image}
              alt={slide.titleHighlight}
              fill
              priority={currentSlide === 0}
              loading="eager"
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
