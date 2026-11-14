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

// Individual Brand Card with Centered "Fade Up" and Zoom Focus Effect
function FadeUpBrandCard({
  brand,
  index,
  totalBrands,
  smoothProgress,
  onCardClick
}) {
  const target = index / (totalBrands - 1);
  const step = 1 / (totalBrands - 1);

  // Smooth opacity: center is 1.0, 1 step away is 0.75, 2 steps away is 0.40, edges fade to 0.12
  const opacity = useTransform(
    smoothProgress,
    [target - step * 2.8, target - step * 2, target - step, target, target + step, target + step * 2, target + step * 2.8],
    [0.12, 0.40, 0.75, 1, 0.75, 0.40, 0.12]
  );

  // Smooth scale: center "fades up" & elevates to 1.10x, sides scale down to 0.88x
  const scale = useTransform(
    smoothProgress,
    [target - step * 2, target - step, target, target + step, target + step * 2],
    [0.88, 0.96, 1.10, 0.96, 0.88]
  );

  // Highlight red border for the active focused center card (matching user reference screenshot)
  const borderColor = useTransform(
    smoothProgress,
    [target - step * 0.45, target, target + step * 0.45],
    ['rgba(226, 232, 240, 0.85)', 'rgba(239, 68, 68, 0.90)', 'rgba(226, 232, 240, 0.85)']
  );

  // Elevated shadow on center card
  const boxShadow = useTransform(
    smoothProgress,
    [target - step * 0.45, target, target + step * 0.45],
    [
      '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      '0 16px 24px -6px rgba(239, 68, 68, 0.18), 0 8px 12px -4px rgba(0, 0, 0, 0.06)',
      '0 1px 3px 0 rgba(0, 0, 0, 0.04)'
    ]
  );

  // Elevate active card above neighboring cards
  const zIndex = useTransform(
    smoothProgress,
    [target - step * 0.48, target, target + step * 0.48],
    [10, 40, 10]
  );

  return (
    <motion.div
      onClick={() => onCardClick(index)}
      style={{
        opacity,
        scale,
        borderColor,
        boxShadow,
        zIndex
      }}
      className="w-44 sm:w-48 md:w-52 h-22 sm:h-24 md:h-26 rounded-2xl bg-white border-2 flex flex-col items-center justify-center p-2.5 sm:p-3 shrink-0 cursor-pointer relative will-change-transform transition-colors"
      title={`Authorized Partner: ${brand.name} (Click to focus)`}
    >
      <div className="w-full flex-1 flex items-center justify-center overflow-hidden">
        <img
          src={brand.src}
          alt={brand.name}
          loading="lazy"
          className="max-h-10 sm:max-h-11 md:max-h-12 max-w-[125px] sm:max-w-[145px] w-auto h-auto object-contain drop-shadow-2xs"
        />
      </div>

      <div className="text-[10px] font-semibold text-slate-500 mt-0.5 truncate text-center w-full">
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

  // Responsive Card Metrics (Compact size as requested)
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth < 768;
  const cardWidth = isMobile ? 176 : isTablet ? 192 : 208; // w-44 / w-48 / w-52
  const cardGap = isMobile ? 14 : 20; // gap-3.5 / gap-5
  const cardPitch = cardWidth + cardGap;
  const totalBrands = BRAND_LOGOS.length;

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

  // Silky smooth spring for natural mouse wheel response
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 34,
    restDelta: 0.001
  });

  // Calculate horizontal translation so EACH CARD centers sequentially in viewport
  const x = useTransform(smoothProgress, (val) => {
    const centerOffset = windowWidth / 2 - cardWidth / 2;
    const totalDistance = (totalBrands - 1) * cardPitch;
    return centerOffset - val * totalDistance;
  });

  // Track live percentage
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setActivePercentage(Math.round(latest * 100));
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // Click card to center it
  const handleCardClick = (idx) => {
    if (!targetRef.current) return;
    const sectionTop = targetRef.current.offsetTop;
    const sectionScrollable = targetRef.current.offsetHeight - window.innerHeight;
    const targetScroll = sectionTop + (idx / (totalBrands - 1)) * sectionScrollable;
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  // Step scroll button helper (< > arrows)
  const handleStepScroll = (direction) => {
    if (!targetRef.current) return;
    const step = window.innerHeight * 0.65;
    const current = window.scrollY;
    window.scrollTo({
      top: direction === 'right' ? current + step : current - step,
      behavior: 'smooth'
    });
  };

  return (
    <section
      ref={targetRef}
      className="relative h-[200vh] sm:h-[220vh] bg-slate-50 border-y border-slate-200/80"
    >
      {/* Pinned Sticky Viewport: Remains fixed while vertical scroll animates cards with "Fade Up" centered effect */}
      <div className="sticky top-[72px] sm:top-[80px] min-h-[calc(100vh-72px)] sm:min-h-[calc(100vh-80px)] flex flex-col justify-between py-4 sm:py-6 overflow-hidden select-none">
        
        {/* 1. Header (Compact & Clean) */}
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 mb-2 shrink-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 gap-4">
            
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-600 shrink-0" />
                <span>Authorized OEM Brands</span>
              </h2>

              <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
                Scroll to focus • {activePercentage}%
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
                  title="Scroll backward"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleStepScroll('right')}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                  title="Scroll forward"
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

        {/* 2. Coverflow Centered Track (Compact height, "Faded Up" centered focus!) */}
        <div className="relative w-full overflow-hidden flex items-center my-auto py-5 sm:py-6">
          
          {/* Edge Gradient Fades for Infinite Depth */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-36 bg-gradient-to-r from-slate-50 via-slate-50/95 to-transparent z-30" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-36 bg-gradient-to-l from-slate-50 via-slate-50/95 to-transparent z-30" />

          {/* Framer Motion GPU Horizontal Track */}
          <motion.div
            style={{ x }}
            className="flex items-center gap-3.5 sm:gap-5 will-change-transform"
          >
            {BRAND_LOGOS.map((brand, idx) => (
              <FadeUpBrandCard
                key={`fade-up-brand-${idx}`}
                brand={brand}
                index={idx}
                totalBrands={totalBrands}
                smoothProgress={smoothProgress}
                onCardClick={handleCardClick}
              />
            ))}
          </motion.div>

        </div>

        {/* 3. Bottom Trust Strip */}
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 shrink-0">
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
    </section>
  );
}