'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroProductBanner() {
  const slides = [
    {
      id: 1,
      image: '/banners/banner-1.jpg',
      link: '/products',
      alt: 'Raj Biosis - ERBA H-360 & EC-90 Hematology and Electrolyte Analyzers',
    },
    {
      id: 2,
      image: '/banners/banner-2.jpg',
      link: '/products',
      alt: 'Raj Biosis - Finecare FIA Meter II Plus SE & Plus Diagnostic Systems',
    },
    {
      id: 3,
      image: '/banners/banner-3.jpg',
      link: '/products',
      alt: 'Raj Biosis - SNIBE MAGLUMI Complete Immunoassay Solutions',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Auto-slide every 5.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const handlePrev = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  // Mobile Touch Swipe Handling
  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section 
      className="bg-white py-2 sm:py-2.5 border-b border-neutral-200"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sleek Panoramic Banner Container (Slightly reduced height for better screen fit) */}
        <div 
          className="relative w-full aspect-[3.35/1] sm:aspect-[3.45/1] max-h-[365px] rounded-2xl overflow-hidden bg-slate-50 border border-neutral-200 shadow-sm group select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          
          {/* Slides with Cross-Fade Transition */}
          {slides.map((slide, idx) => (
            <Link
              key={slide.id}
              href={slide.link}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out block ${
                currentIndex === idx 
                  ? 'opacity-100 z-10 pointer-events-auto' 
                  : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-fill block"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            </Link>
          ))}

          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white text-neutral-800 shadow-md flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-105 border border-neutral-200 z-30 active:scale-95 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={18} className="sm:w-5 sm:h-5 stroke-[2.5]" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white text-neutral-800 shadow-md flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-105 border border-neutral-200 z-30 active:scale-95 cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight size={18} className="sm:w-5 sm:h-5 stroke-[2.5]" />
          </button>

          {/* Slide Counter Badge (Top Right so it never overlaps the bottom ribbon) */}
          <div className="absolute top-2.5 sm:top-3.5 right-3 sm:right-5 bg-neutral-900/75 backdrop-blur-xs text-white text-[9px] sm:text-[11px] font-mono font-bold px-2 sm:px-2.5 py-0.5 rounded-md border border-white/20 z-30">
            {currentIndex + 1} / {slides.length}
          </div>

          {/* Clean Indicator Dots */}
          <div className="absolute bottom-2.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-neutral-900/40 backdrop-blur-xs px-2.5 sm:px-3 py-1 rounded-full z-30">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full h-1 sm:h-1.5 cursor-pointer ${
                  currentIndex === idx 
                    ? 'w-5 sm:w-6 bg-white' 
                    : 'w-1 sm:w-1.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
