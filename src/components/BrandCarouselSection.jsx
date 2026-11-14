'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  ShieldCheck,
  Award,
  ArrowRight,
  ArrowLeft,
  ChevronsRight,
  Sparkles,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { BRAND_LOGOS } from '../data/brands';

export default function BrandCarouselSection() {
  const targetRef = useRef(null);
  const trackRef = useRef(null);
  const [scrollRange, setScrollRange] = useState(0);
  const [activePercentage, setActivePercentage] = useState(0);

  // Measure track scrollable distance on mount and on window resize
  useEffect(() => {
    const calculateRange = () => {
      if (trackRef.current) {
        const totalWidth = trackRef.current.scrollWidth;
        const visibleWidth = window.innerWidth;
        // Total horizontal translate needed so last card ends with comfortable margin
        const distance = Math.max(0, totalWidth - visibleWidth + 120);
        setScrollRange(distance);
      }
    };

    calculateRange();
    window.addEventListener('resize', calculateRange);
    const t1 = setTimeout(calculateRange, 250);
    const t2 = setTimeout(calculateRange, 800);
    return () => {
      window.removeEventListener('resize', calculateRange);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Framer Motion useScroll tied to the sticky section's scroll height
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end']
  });

  // Smooth spring easing for natural mouse wheel response
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 38,
    restDelta: 0.001
  });

  // Dynamic horizontal translation driven by vertical page scroll
  const x = useTransform(smoothProgress, (val) => {
    return -val * scrollRange;
  });

  // Track percentage for live progress indicator
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setActivePercentage(Math.round(latest * 100));
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // Clickable buttons allowing users to step-scroll if preferred
  const handleStepScroll = (direction) => {
    if (!targetRef.current) return;
    const step = window.innerHeight * 0.8;
    const current = window.scrollY;
    window.scrollTo({
      top: direction === 'right' ? current + step : current - step,
      behavior: 'smooth'
    });
  };

  const currentBrandIndex = Math.min(
    BRAND_LOGOS.length,
    Math.max(1, Math.ceil((activePercentage / 100) * BRAND_LOGOS.length))
  );

  return (
    <section
      ref={targetRef}
      className="relative h-[270vh] sm:h-[320vh] bg-slate-100 border-y border-slate-200"
    >
      {/* Pinned Sticky Viewport: Remains fixed while vertical scroll translates horizontal logos */}
      <div className="sticky top-[72px] sm:top-[80px] h-[calc(100vh-72px)] sm:h-[calc(100vh-80px)] flex flex-col justify-between py-5 sm:py-7 overflow-hidden select-none">
        
        {/* 1. Header (Compact, informative, with step navigation & progress) */}
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-1.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Authorized OEM Partners &amp; Global Brands</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Brands We Deal In &amp; Support
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Direct-from-manufacturer procurement, authentic OEM warranties, and factory-trained biomedical service across Rajasthan.
              </p>
            </div>

            {/* Controls & Badges */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              {/* Progress Pill Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  OEM {currentBrandIndex} of {BRAND_LOGOS.length}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-brand-600">{activePercentage}%</span>
              </div>

              {/* Step Navigation Arrows */}
              <div className="hidden sm:flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleStepScroll('left')}
                  disabled={activePercentage <= 2}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                  title="Scroll backward"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleStepScroll('right')}
                  disabled={activePercentage >= 98}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                  title="Scroll forward"
                >
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Tender Enquiry CTA */}
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-2xs group"
              >
                <span>OEM Tender Enquiry</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Sleek Scroll Progress Bar with Visual Hint */}
          <div className="mt-3.5 flex items-center gap-3">
            <div className="flex-1 bg-slate-200/90 h-1.5 rounded-full overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-600 via-emerald-500 to-brand-600 rounded-full"
                style={{ scaleX: smoothProgress, transformOrigin: 'left' }}
              />
            </div>
            <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 shrink-0">
              <span>Scroll down to slide brands</span>
              <ChevronsRight size={13} className="text-brand-600 animate-pulse" />
            </div>
          </div>
        </div>

        {/* 2. Main Horizontal Scrolling Brands Track (No auto-scroll; 100% scroll-driven) */}
        <div className="relative w-full overflow-hidden my-auto py-2">
          {/* Subtle edge fades for modern aesthetic */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-slate-100 via-slate-100/80 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-slate-100 via-slate-100/80 to-transparent z-10" />

          {/* Framer Motion GPU-accelerated horizontal transform container */}
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex items-center gap-5 sm:gap-7 px-4 sm:px-8 lg:px-12 w-max"
          >
            {BRAND_LOGOS.map((brand, idx) => (
              <div
                key={`brand-card-${idx}`}
                className="w-72 sm:w-80 md:w-88 h-48 sm:h-56 shrink-0 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border-2 border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-brand-500/50 transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
              >
                {/* Top Card Badge: Number & Tier */}
                <div className="flex items-center justify-between w-full text-[11px]">
                  <span className="font-mono font-bold text-slate-400 group-hover:text-brand-600 transition-colors">
                    #{String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-50 group-hover:bg-brand-50 group-hover:text-brand-700 text-slate-600 font-bold text-[10px] uppercase tracking-wider border border-slate-200/80 group-hover:border-brand-200 transition-colors">
                    {brand.tier || 'Direct OEM'}
                  </span>
                </div>

                {/* Prominent Large Logo Box (Significantly enlarged as requested) */}
                <div className="h-28 sm:h-32 w-full flex items-center justify-center p-2 sm:p-3 overflow-hidden">
                  <img
                    src={brand.src}
                    alt={brand.name}
                    className="max-h-20 sm:max-h-24 md:max-h-26 max-w-[200px] sm:max-w-[240px] w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-2xs filter group-hover:brightness-105"
                    loading="lazy"
                  />
                </div>

                {/* Bottom Card Footer: Brand Name, Specialty & Action Indicator */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-brand-600 transition-colors truncate">
                      {brand.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {brand.specialty || 'Authorized Biomedical Equipment'}
                    </p>
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-slate-100 group-hover:bg-brand-600 group-hover:text-white flex items-center justify-center text-slate-400 shrink-0 transition-all shadow-2xs">
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* 3. Bottom Trust Badges & Hotline Strip */}
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="pt-3 border-t border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 flex-wrap text-[11px] sm:text-xs">
              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
              <span className="font-bold text-slate-800">100% Genuine OEM Equipment</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">Direct Manufacturer Warranties with NABL calibration certs</span>
            </div>
            <div className="flex items-center gap-2.5 font-bold text-slate-700 text-[11px] sm:text-xs">
              <span className="text-slate-600">Fast Rajasthan Regional Depot Stock</span>
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
