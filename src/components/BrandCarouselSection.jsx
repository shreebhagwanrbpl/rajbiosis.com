'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  Award,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { BRAND_LOGOS } from '../data/brands';
import { getActiveDistrict } from '../utils/userProfile';

// Individual Brand Card with Elevated ("Uthi Huyi") Centered Focus & 100% Sharp Contrast
function FadeUpBrandCard({
  brand,
  index,
  smoothProgress,
  target,
  step,
  onCardClick
}) {
  // Smooth, gradual vertical lift ("Uthi huyi"): elevates upward by -10px smoothly as it enters center
  const y = useTransform(
    smoothProgress,
    [target - step * 0.8, target, target + step * 0.8],
    [0, -10, 0]
  );

  // Buttery scale pop: center card scales up to 1.12x for clear, soft focus
  const scale = useTransform(
    smoothProgress,
    [target - step * 1.5, target, target + step * 1.5],
    [0.96, 1.12, 0.96]
  );

  // Gentle, gradual active red border transition (NO harsh popping)
  const borderColor = useTransform(
    smoothProgress,
    [target - step * 0.7, target, target + step * 0.7],
    ['rgba(226, 232, 240, 0.95)', 'rgba(239, 68, 68, 0.95)', 'rgba(226, 232, 240, 0.95)']
  );

  // Elevated 3D shadow for floating lift effect on center card
  const boxShadow = useTransform(
    smoothProgress,
    [target - step * 0.7, target, target + step * 0.7],
    [
      '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      '0 20px 28px -6px rgba(239, 68, 68, 0.28), 0 10px 14px -4px rgba(0, 0, 0, 0.12)',
      '0 2px 4px 0 rgba(0, 0, 0, 0.05)'
    ]
  );

  // Elevate active card above neighboring cards
  const zIndex = useTransform(
    smoothProgress,
    [target - step * 0.6, target, target + step * 0.6],
    [10, 40, 10]
  );

  return (
    <motion.div
      onClick={() => onCardClick(index)}
      style={{
        y,
        scale,
        borderColor,
        boxShadow,
        zIndex
      }}
      className="w-44 sm:w-48 md:w-52 h-20 sm:h-22 md:h-24 rounded-2xl bg-white border-2 flex flex-col items-center justify-center p-2.5 sm:p-3 shrink-0 cursor-pointer relative will-change-transform opacity-100 transition-colors"
    >
      <div className="w-full flex-1 flex items-center justify-center overflow-hidden">
        <img
          src={brand.src}
          alt={brand.name}
          loading="lazy"
          className="max-h-9 sm:max-h-10 md:max-h-11 max-w-[120px] sm:max-w-[140px] w-auto h-auto object-contain drop-shadow-2xs"
        />
      </div>

      <div className="text-[10px] sm:text-[11px] font-bold text-slate-600 mt-0.5 truncate text-center w-full">
        {brand.name}
      </div>
    </motion.div>
  );
}

export default function BrandCarouselSection() {
  const targetRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(1200);
  const [activePercentage, setActivePercentage] = useState(0);
  const [activeDistrict, setActiveDistrict] = useState('Jaipur');
  const [mounted, setMounted] = useState(false);

  // Responsive Card Metrics (Spacious inter-card gap as requested)
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth < 768;
  const cardWidth = isMobile ? 176 : isTablet ? 192 : 208; // w-44 / w-48 / w-52
  const cardGap = isMobile ? 20 : 28; // Increased gap between logos (20px mobile / 28px desktop)
  const cardPitch = cardWidth + cardGap;
  const totalBrands = BRAND_LOGOS.length;
  const totalTrackWidth = totalBrands * cardWidth + (totalBrands - 1) * cardGap;

  useEffect(() => {
    setMounted(true);
    setActiveDistrict(getActiveDistrict());

    const updateWidth = () => setWindowWidth(window.innerWidth);
    updateWidth();
    window.addEventListener('resize', updateWidth);

    const handleDistrictChange = (e) => {
      if (e && e.detail) {
        setActiveDistrict(e.detail);
      }
    };

    window.addEventListener('active-district-changed', handleDistrictChange);
    return () => {
      window.removeEventListener('resize', updateWidth);
      window.removeEventListener('active-district-changed', handleDistrictChange);
    };
  }, []);

  // Framer Motion useScroll tied to section scroll
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end']
  });

  // Silky smooth, gentle spring with subtle inertia for ultra-smooth, slow mouse wheel response
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 55, // lower stiffness = much slower, gentler motion
    damping: 24,   // critical damping for buttery glide without bounce
    mass: 1.2,     // realistic smooth inertia
    restDelta: 0.0001
  });

  // Calculate track travel bounds:
  // Start: First card starts at the left container margin
  // End: Last card stops neatly at the right container margin (does NOT scroll into center!)
  const sideMargin = Math.max(16, (windowWidth - Math.min(windowWidth, 1440)) / 2 + (isMobile ? 16 : 32));
  const xStart = sideMargin;
  const xEnd = Math.min(0, windowWidth - sideMargin - totalTrackWidth);
  const travelDistance = Math.max(1, xStart - xEnd);

  const x = useTransform(smoothProgress, [0, 1], [xStart, xEnd]);

  // Center alignment math for each card to highlight as it passes the screen center
  const screenCenter = windowWidth / 2;
  const step = cardPitch / travelDistance;

  // Track live percentage
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setActivePercentage(Math.round(latest * 100));
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // Click card to scroll to that card
  const handleCardClick = (idx) => {
    if (!targetRef.current) return;
    const sectionTop = targetRef.current.offsetTop;
    const sectionScrollable = targetRef.current.offsetHeight - window.innerHeight;
    const cardTarget = (xStart - screenCenter + cardWidth / 2 + idx * cardPitch) / travelDistance;
    const clampedProgress = Math.max(0, Math.min(1, cardTarget));
    const targetScroll = sectionTop + clampedProgress * sectionScrollable;
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  // Step scroll button helper (< > arrows)
  const handleStepScroll = (direction) => {
    if (!targetRef.current) return;
    const stepDist = window.innerHeight * 0.35;
    const current = window.scrollY;
    window.scrollTo({
      top: direction === 'right' ? current + stepDist : current - stepDist,
      behavior: 'smooth'
    });
  };

  return (
    <section
      ref={targetRef}
      className="relative h-[380vh] sm:h-[450vh] bg-slate-50 border-y border-slate-200/80"
    >
      {/* Pinned Sticky Viewport: Compact height, centered with balanced top/bottom gaps */}
      <div className="sticky top-[72px] sm:top-[80px] h-[calc(62vh)] sm:h-[calc(66vh)] min-h-[420px] max-h-[520px] flex flex-col justify-center overflow-hidden select-none">
        
        {/* Compact, Grouped Container */}
        <div className="w-full flex flex-col justify-center">

          {/* 1. Header: Balanced top gap (mb-5 sm:mb-6) */}
          <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 mb-5 sm:mb-6 shrink-0">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 gap-4">
              
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-600 shrink-0" />
                  <span>Authorized OEM Brands</span>
                </h2>

                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
                  Scroll to explore • {activePercentage}%
                </span>
              </div>

              {/* Controls & Badges */}
              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 shadow-2xs">
                  <Award size={14} className="text-brand-600" />
                  <span>17+ Direct OEMs</span>
                </div>

                {/* Step Navigation Arrows */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleStepScroll('left')}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                    aria-label="Scroll backward"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepScroll('right')}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                    aria-label="Scroll forward"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-2xs group"
                >
                  <span>OEM Tender Enquiry</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

            </div>
          </div>

          {/* 2. Track: Wider inter-card gap (gap-5 sm:gap-7 / 20px-28px) */}
          <div className="relative w-full overflow-hidden py-6 sm:py-7">
            {/* Framer Motion GPU Horizontal Track */}
            <motion.div
              style={{ x }}
              className="flex items-center gap-5 sm:gap-7 will-change-transform"
            >
              {BRAND_LOGOS.map((brand, idx) => {
                const targetProgress = (xStart - screenCenter + cardWidth / 2 + idx * cardPitch) / travelDistance;
                return (
                  <FadeUpBrandCard
                    key={`brand-card-${brand.name}-${idx}`}
                    brand={brand}
                    index={idx}
                    smoothProgress={smoothProgress}
                    target={targetProgress}
                    step={step}
                    onCardClick={handleCardClick}
                  />
                );
              })}
            </motion.div>
          </div>

          {/* 3. Bottom Trust Strip: Balanced bottom gap (mt-5 sm:mt-6) */}
          <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 mt-5 sm:mt-6 shrink-0">
            <div className="pt-3 border-t border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700 flex-wrap text-[11px] sm:text-xs">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-800">100% Genuine OEM Equipment</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">Direct Manufacturer Warranties with NABL calibration certs</span>
              </div>
              
              <div className="flex items-center gap-2.5 font-bold text-slate-700 text-[11px] sm:text-xs">
                <span className="text-slate-600" suppressHydrationWarning>Fast {mounted ? activeDistrict : 'Jaipur'} Regional Depot Stock</span>
                <span className="text-slate-300">|</span>
                <a
                  href="tel:9983333469"
                  className="text-brand-600 hover:text-brand-700 flex items-center gap-1 transition"
                >
                  <PhoneCall size={12} />
                  <span>24x7 Hotline: 9983333469</span>
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
