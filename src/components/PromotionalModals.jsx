'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Tag, 
  Flame,
  Sparkles,
  Percent,
  CheckCircle2,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { PRODUCTS } from '../data/products';

// Real Handpicked New Arrivals (2026 Series) from actual products catalog
const NEW_ARRIVALS = [
  {
    ...(PRODUCTS.find(p => p.category === 'ECG Machine') || PRODUCTS[0]),
    badgeLabel: '2026 ECG System',
    featureDesc: 'High-precision 12-channel diagnostic ECG machine with colour LCD screen and thermal array printing.'
  },
  {
    ...(PRODUCTS.find(p => p.category === 'Biochemistry Analyzer') || PRODUCTS[1]),
    badgeLabel: '2026 Clinical Chemistry',
    featureDesc: 'Fully automated benchtop clinical chemistry analyzer with 200 tests/hour throughput and refrigerated reagent disk.'
  },
  {
    ...(PRODUCTS.find(p => p.category === 'Hematology Analyzer') || PRODUCTS[2]),
    badgeLabel: '2026 3-Part Hematology',
    featureDesc: 'Advanced 3-part differential automated hematology analyzer with 60 samples/hour throughput and dual chamber counting.'
  },
  {
    ...(PRODUCTS.find(p => p.category === 'Oxygen Concentrator') || PRODUCTS[3]),
    badgeLabel: '2026 Respiratory Care',
    featureDesc: 'Medical-grade hospital oxygen concentrator providing high-purity continuous oxygen flow with intelligent alarm systems.'
  },
  {
    ...(PRODUCTS.find(p => p.category === 'Microscope') || PRODUCTS[4]),
    badgeLabel: '2026 Laboratory Optics',
    featureDesc: 'High-resolution achromatic binocular optical microscope with coaxial coarse and fine focus and LED illumination.'
  }
];

// Real Handpicked Best Deals from actual products catalog
const BEST_DEALS = [
  {
    ...(PRODUCTS.find(p => p.category === 'Biochemistry Analyzer') || PRODUCTS[1]),
    discountPercent: 13,
    saveAmount: 70000,
    dealStock: 'Only 2 factory clearance units available'
  },
  {
    ...(PRODUCTS.find(p => p.category === 'Hematology Analyzer') || PRODUCTS[2]),
    discountPercent: 14,
    saveAmount: 50000,
    dealStock: 'Direct OEM dispatch in 24 hours'
  },
  {
    ...(PRODUCTS.find(p => p.category === 'ECG Machine') || PRODUCTS[0]),
    discountPercent: 11,
    saveAmount: 6000,
    dealStock: 'Ready stock for immediate hospital dispatch'
  },
  {
    ...(PRODUCTS.find(p => p.category === 'Oxygen Concentrator') || PRODUCTS[3]),
    discountPercent: 13,
    saveAmount: 9000,
    dealStock: 'Hospital suite standard model with 2-Yr Warranty'
  },
  {
    ...(PRODUCTS.find(p => p.category === 'Microscope') || PRODUCTS[4]),
    discountPercent: 22,
    saveAmount: 2500,
    dealStock: 'Ready stock for immediate laboratory dispatch'
  }
];

export default function PromotionalModals() {
  const router = useRouter();
  const pathname = usePathname();

  const [showNewArrivals, setShowNewArrivals] = useState(false);
  const [showBestDeals, setShowBestDeals] = useState(false);
  const [hasClosedNewArrivals, setHasClosedNewArrivals] = useState(false);
  const [hasShownBestDeals, setHasShownBestDeals] = useState(false);

  // 1. New Arrivals Carousel State
  const [arrivalIndex, setArrivalIndex] = useState(0);
  const [isArrivalPaused, setIsArrivalPaused] = useState(false);
  const arrivalTouchStartX = useRef(null);

  // 2. Best Deals Carousel State
  const [dealIndex, setDealIndex] = useState(0);
  const [isDealPaused, setIsDealPaused] = useState(false);
  const dealTouchStartX = useRef(null);

  // Initial Pop-up: Show New Arrivals when website opens (skip if dismissed or on profile/portal)
  useEffect(() => {
    if (pathname === '/profile' || pathname === '/portal') return;

    if (typeof window !== 'undefined') {
      try {
        if (sessionStorage.getItem('rb_dismissed_arrivals')) return;
      } catch (e) {}
    }

    const timer = setTimeout(() => {
      setShowNewArrivals(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Trigger Best Deals modal when user scrolls down to 35% of the page
  useEffect(() => {
    const handleScroll = () => {
      if (pathname === '/profile' || pathname === '/portal') return;
      if (hasShownBestDeals) return;

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const scrollPercent = (window.scrollY / docHeight) * 100;

      // Open Best Deals modal when user has scrolled to 35% of website depth
      if (scrollPercent >= 35) {
        setHasShownBestDeals(true);
        setShowNewArrivals(false); // smoothly close New Arrivals if still open
        setShowBestDeals(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasShownBestDeals]);

  // Global Custom Events
  useEffect(() => {
    const openArrivalsListener = () => {
      setShowBestDeals(false);
      setShowNewArrivals(true);
    };

    const openDealsListener = () => {
      setShowNewArrivals(false);
      setShowBestDeals(true);
    };

    window.addEventListener('open-new-arrivals', openArrivalsListener);
    window.addEventListener('open-best-deals', openDealsListener);

    return () => {
      window.removeEventListener('open-new-arrivals', openArrivalsListener);
      window.removeEventListener('open-best-deals', openDealsListener);
    };
  }, []);

  // Auto-advance New Arrivals Carousel (Continuous 2.5s smooth scroll)
  useEffect(() => {
    if (!showNewArrivals) return;

    const timer = setInterval(() => {
      setArrivalIndex((prev) => (prev + 1) % NEW_ARRIVALS.length);
    }, 2500);

    return () => clearInterval(timer);
  }, [showNewArrivals]);

  // Auto-advance Best Deals Carousel (Continuous 2.5s smooth scroll)
  useEffect(() => {
    if (!showBestDeals) return;

    const timer = setInterval(() => {
      setDealIndex((prev) => (prev + 1) % BEST_DEALS.length);
    }, 2500);

    return () => clearInterval(timer);
  }, [showBestDeals]);

  // Close Handlers
  const handleCloseNewArrivals = () => {
    setShowNewArrivals(false);
    setHasClosedNewArrivals(true);
  };

  const handleCloseBestDeals = () => {
    setShowBestDeals(false);
  };

  // Carousel Navigation: New Arrivals
  const prevArrival = (e) => {
    if (e) e.stopPropagation();
    setArrivalIndex((prev) => (prev === 0 ? NEW_ARRIVALS.length - 1 : prev - 1));
  };

  const nextArrival = (e) => {
    if (e) e.stopPropagation();
    setArrivalIndex((prev) => (prev + 1) % NEW_ARRIVALS.length);
  };

  // Carousel Navigation: Best Deals
  const prevDeal = (e) => {
    if (e) e.stopPropagation();
    setDealIndex((prev) => (prev === 0 ? BEST_DEALS.length - 1 : prev - 1));
  };

  const nextDeal = (e) => {
    if (e) e.stopPropagation();
    setDealIndex((prev) => (prev + 1) % BEST_DEALS.length);
  };

  const currentArrival = NEW_ARRIVALS[arrivalIndex];
  const currentDeal = BEST_DEALS[dealIndex];

  return (
    <>
      {/* ========================================================================= */}
      {/* MODAL 1: NEW ARRIVALS (Wide Horizontal Landscape Layout - Responsive)    */}
      {/* ========================================================================= */}
      {showNewArrivals && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={handleCloseNewArrivals}
        >
          <div 
            className="relative w-full max-w-2xl lg:max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh] my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Clean Responsive Header (Zero Wrapping or Breaking) */}
            <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Sparkles size={15} className="text-emerald-600 shrink-0" />
                <h3 className="text-xs sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
                  New Arrivals (2026 Series)
                </h3>
                <span className="bg-white border border-slate-200 text-slate-600 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-2xs whitespace-nowrap shrink-0 leading-none">
                  {arrivalIndex + 1} / {NEW_ARRIVALS.length}
                </span>
              </div>

              <button
                onClick={handleCloseNewArrivals}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-slate-200/80 border border-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center transition cursor-pointer shadow-2xs shrink-0"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto overscroll-contain flex-1">
              
              {/* Left Column: Product Image with Controls */}
              <div 
                className="md:col-span-6 bg-slate-50/80 p-3 sm:p-5 flex flex-col items-center justify-between relative border-b md:border-b-0 md:border-r border-slate-100 select-none"
                onTouchStart={(e) => {
                  arrivalTouchStartX.current = e.targetTouches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  if (!arrivalTouchStartX.current) return;
                  const dist = arrivalTouchStartX.current - e.changedTouches[0].clientX;
                  if (dist > 40) nextArrival();
                  else if (dist < -40) prevArrival();
                  arrivalTouchStartX.current = null;
                }}
              >
                {/* Overlaid Badges on Image */}
                <div className="w-full flex items-center justify-between gap-1 mb-2">
                  <div className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-xs flex items-center gap-1 shrink-0">
                    <Sparkles size={10} />
                    <span>{currentArrival.badgeLabel}</span>
                  </div>

                  <div className="bg-white/95 text-slate-700 border border-slate-200 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-2xs flex items-center gap-1 shrink-0">
                    <CheckCircle2 size={10} className="text-emerald-600 stroke-[3]" />
                    <span>CDSCO Certified</span>
                  </div>
                </div>

                {/* Product Image Stage */}
                <div 
                  key={`arrival-slide-${currentArrival.id}`}
                  onClick={() => {
                    handleCloseNewArrivals();
                    router.push(`/product/${currentArrival.id}`);
                  }}
                  className="w-full h-48 sm:h-60 md:h-68 flex items-center justify-center p-3 cursor-pointer group animate-in fade-in duration-300 relative my-auto"
                >
                  <img 
                    src={currentArrival.image} 
                    alt={currentArrival.name} 
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md" 
                  />

                  {/* Left Arrow on Image */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevArrival(e);
                    }}
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer z-10"
                    aria-label="Previous Arrival"
                  >
                    <ChevronLeft size={16} className="stroke-[2.5]" />
                  </button>

                  {/* Right Arrow on Image */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextArrival(e);
                    }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer z-10"
                    aria-label="Next Arrival"
                  >
                    <ChevronRight size={16} className="stroke-[2.5]" />
                  </button>
                </div>

                {/* Slide Dots Indicator */}
                <div className="flex items-center justify-center gap-1.5 mt-2 mb-1">
                  {NEW_ARRIVALS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setArrivalIndex(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        arrivalIndex === idx ? 'w-6 bg-emerald-600' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Right Column: Detailed Product Information & Call to Action */}
              <div 
                key={`info-${currentArrival.id}`}
                className="md:col-span-6 p-4 sm:p-6 flex flex-col justify-between bg-white animate-in fade-in duration-200"
              >
                <div>
                  {/* Brand & SKU */}
                  <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold text-slate-500 mb-1">
                    <span className="text-emerald-700 font-bold uppercase tracking-wider">{currentArrival.brand || 'Raj Biosis OEM'}</span>
                    <span className="font-mono text-slate-400">SKU: {currentArrival.sku}</span>
                  </div>

                  {/* Title */}
                  <h4 
                    onClick={() => {
                      handleCloseNewArrivals();
                      router.push(`/product/${currentArrival.id}`);
                    }}
                    className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug hover:text-red-600 transition cursor-pointer line-clamp-2"
                  >
                    {currentArrival.name}
                  </h4>

                  {/* Description / Key Specs */}
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                    {currentArrival.featureDesc || currentArrival.shortDesc}
                  </p>

                  {/* Feature Checkmarks */}
                  <div className="mt-2.5 space-y-1 text-[11px] sm:text-xs text-slate-700 font-medium">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>2 Years Comprehensive On-Site Warranty</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                      <span>Direct OEM Factory Assembly &amp; Testing Certified</span>
                    </div>
                  </div>

                  {/* Pricing Box (Strictly Price on Request) */}
                  <div className="mt-3 p-2.5 sm:p-3.5 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                          Institutional Pricing
                        </span>
                        <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                          Price Available on Request
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-block bg-emerald-100 text-emerald-800 font-extrabold text-[10px] sm:text-xs px-2.5 py-0.5 rounded-lg whitespace-nowrap">
                          2026 Direct OEM
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                          Dispatch in 24-48 Hours
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-2.5 border-t border-slate-100 flex flex-col gap-1.5">
                  <button
                    onClick={() => {
                      handleCloseNewArrivals();
                      router.push(`/product/${currentArrival.id}`);
                    }}
                    className="w-full py-2.5 sm:py-3 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-xs hover:shadow cursor-pointer"
                  >
                    <FileText size={14} className="shrink-0" />
                    <span>View Product &amp; Request Quote</span>
                    <ArrowRight size={14} className="shrink-0" />
                  </button>

                  <button
                    onClick={() => {
                      handleCloseNewArrivals();
                      router.push('/deals?tab=new-arrivals');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 text-center py-1 transition cursor-pointer"
                  >
                    Browse All New Arrivals in Catalogue &rarr;
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: BEST DEALS (Wide Horizontal Landscape Layout - Responsive)      */}
      {/* ========================================================================= */}
      {showBestDeals && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={handleCloseBestDeals}
        >
          <div 
            className="relative w-full max-w-2xl lg:max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh] my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Clean Responsive Header (Zero Wrapping or Breaking) */}
            <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <Flame size={15} className="fill-red-600 text-red-600 shrink-0" />
                <h3 className="text-xs sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
                  Today&apos;s Best Factory Deals
                </h3>
                <span className="bg-white border border-slate-200 text-slate-600 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-2xs whitespace-nowrap shrink-0 leading-none">
                  {dealIndex + 1} / {BEST_DEALS.length}
                </span>
              </div>

              <button
                onClick={handleCloseBestDeals}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-slate-200/80 border border-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center transition cursor-pointer shadow-2xs shrink-0"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto overscroll-contain flex-1">
              
              {/* Left Column: Product Image with Controls */}
              <div 
                className="md:col-span-6 bg-slate-50/80 p-3 sm:p-5 flex flex-col items-center justify-between relative border-b md:border-b-0 md:border-r border-slate-100 select-none"
                onTouchStart={(e) => {
                  dealTouchStartX.current = e.targetTouches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  if (!dealTouchStartX.current) return;
                  const dist = dealTouchStartX.current - e.changedTouches[0].clientX;
                  if (dist > 40) nextDeal();
                  else if (dist < -40) prevDeal();
                  dealTouchStartX.current = null;
                }}
              >
                {/* Overlaid Badges on Image */}
                <div className="w-full flex items-center justify-between gap-1 mb-2">
                  <div className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg shadow-xs flex items-center gap-1 shrink-0">
                    <Flame size={10} className="fill-white" />
                    <span>Special Clearance</span>
                  </div>

                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-2xs shrink-0">
                    Direct OEM Supply
                  </div>
                </div>

                {/* Product Image Stage */}
                <div 
                  key={`deal-slide-${currentDeal.id}`}
                  onClick={() => {
                    handleCloseBestDeals();
                    router.push(`/product/${currentDeal.id}`);
                  }}
                  className="w-full h-48 sm:h-60 md:h-68 flex items-center justify-center p-3 cursor-pointer group animate-in fade-in duration-300 relative my-auto"
                >
                  <img 
                    src={currentDeal.image} 
                    alt={currentDeal.name} 
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md" 
                  />

                  {/* Left Arrow on Image */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevDeal(e);
                    }}
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer z-10"
                    aria-label="Previous Deal"
                  >
                    <ChevronLeft size={16} className="stroke-[2.5]" />
                  </button>

                  {/* Right Arrow on Image */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextDeal(e);
                    }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer z-10"
                    aria-label="Next Deal"
                  >
                    <ChevronRight size={16} className="stroke-[2.5]" />
                  </button>
                </div>

                {/* Slide Dots Indicator */}
                <div className="flex items-center justify-center gap-1.5 mt-2 mb-1">
                  {BEST_DEALS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setDealIndex(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        dealIndex === idx ? 'w-6 bg-red-600' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                      }`}
                      aria-label={`Deal ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Right Column: Detailed Product Information & Call to Action */}
              <div 
                key={`deal-info-${currentDeal.id}`}
                className="md:col-span-6 p-4 sm:p-6 flex flex-col justify-between bg-white animate-in fade-in duration-200"
              >
                <div>
                  {/* Brand & SKU */}
                  <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold text-slate-500 mb-1">
                    <span className="text-red-600 font-bold uppercase tracking-wider">{currentDeal.brand || 'Raj Biosis OEM'}</span>
                    <span className="font-mono text-slate-400">SKU: {currentDeal.sku}</span>
                  </div>

                  {/* Title */}
                  <h4 
                    onClick={() => {
                      handleCloseBestDeals();
                      router.push(`/product/${currentDeal.id}`);
                    }}
                    className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug hover:text-red-600 transition cursor-pointer line-clamp-2"
                  >
                    {currentDeal.name}
                  </h4>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                    {currentDeal.shortDesc || `High quality certified hospital equipment from Raj Biosis.`}
                  </p>

                  {/* Feature Checkmarks */}
                  <div className="mt-2.5 space-y-1 text-[11px] sm:text-xs text-slate-700 font-medium">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>2 Years Comprehensive On-Site Warranty Included</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                      <span>CDSCO Certified &amp; ISO 13485 Compliant</span>
                    </div>
                  </div>

                  {/* Price & Savings Box (Strictly Price on Request) */}
                  <div className="mt-3 p-2.5 sm:p-3.5 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                          Institutional Clearance
                        </span>
                        <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                          Price Available on Request
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-block bg-emerald-100 text-emerald-800 font-extrabold text-[10px] sm:text-xs px-2.5 py-0.5 rounded-lg whitespace-nowrap">
                          Special Clearance Rate
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                          {currentDeal.dealStock}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-2.5 border-t border-slate-100 flex flex-col gap-1.5">
                  <button
                    onClick={() => {
                      handleCloseBestDeals();
                      router.push(`/product/${currentDeal.id}`);
                    }}
                    className="w-full py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-xs hover:shadow cursor-pointer"
                  >
                    <FileText size={14} className="shrink-0" />
                    <span>View Deal &amp; Request Quote</span>
                    <ArrowRight size={14} className="shrink-0" />
                  </button>

                  <button
                    onClick={() => {
                      handleCloseBestDeals();
                      router.push('/deals?tab=best-deals');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 text-center py-1 transition cursor-pointer"
                  >
                    Browse All Factory Deals &rarr;
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
}
