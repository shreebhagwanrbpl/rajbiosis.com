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
  ShieldCheck
} from 'lucide-react';
import { PRODUCTS } from '../data/products';

// Handpicked New Arrivals (2026 Series)
const NEW_ARRIVALS = [
  {
    ...PRODUCTS.find(p => p.id === 'prod-xray-dr') || PRODUCTS[0],
    badgeLabel: '2026 Digital Radiography',
    featureDesc: '500mA High-Frequency X-Ray with 17x17 Wireless CsI Flat Panel Detector & AERB safety clearance.'
  },
  {
    ...PRODUCTS.find(p => p.id === 'prod-vent-x9') || PRODUCTS[1],
    badgeLabel: '2026 Turbine Ventilator',
    featureDesc: 'High-performance turbine mechanical ventilator for adult, pediatric and neonatal ICU care.'
  },
  {
    ...PRODUCTS.find(p => p.id === 'prod-ultra-4d') || PRODUCTS[2],
    badgeLabel: '2026 4D Color Ultrasound',
    featureDesc: 'Real-time 4D Color Doppler imaging with 3 multi-frequency transducers and AI speckle reduction.'
  },
  {
    ...PRODUCTS.find(p => p.id === 'prod-ot-light-duo') || PRODUCTS[4],
    badgeLabel: '2026 Shadowless OT Light',
    featureDesc: 'Dual-dome surgical LED surgical lights with 160,000 Lux illumination and laminar airflow design.'
  },
  {
    ...PRODUCTS.find(p => p.id === 'prod-mon-12x') || PRODUCTS[3],
    badgeLabel: '2026 ICU Multipara Monitor',
    featureDesc: '12.1-inch high-resolution touch display with 7-lead ECG, SpO2, NIBP, Dual Temp and Arrhythmia analysis.'
  }
];

// Handpicked Best Deals
const BEST_DEALS = [
  {
    ...PRODUCTS.find(p => p.id === 'prod-xray-dr') || PRODUCTS[0],
    discountPercent: 26,
    saveAmount: 430000,
    dealStock: 'Only 2 factory clearance units available'
  },
  {
    ...PRODUCTS.find(p => p.id === 'prod-vent-x9') || PRODUCTS[1],
    discountPercent: 25,
    saveAmount: 165000,
    dealStock: 'Direct OEM dispatch in 24 hours'
  },
  {
    ...PRODUCTS.find(p => p.id === 'prod-ultra-4d') || PRODUCTS[2],
    discountPercent: 26,
    saveAmount: 310000,
    dealStock: 'Includes 3 wideband transducers & 2-Yr Warranty'
  },
  {
    ...PRODUCTS.find(p => p.id === 'prod-defi-360') || PRODUCTS[3],
    discountPercent: 20,
    saveAmount: 50000,
    dealStock: 'Emergency suite standard model with pacing'
  },
  {
    ...PRODUCTS.find(p => p.id === 'prod-mon-12x') || PRODUCTS[4],
    discountPercent: 25,
    saveAmount: 23500,
    dealStock: 'Ready stock for immediate hospital dispatch'
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

  // Initial Pop-up: Show New Arrivals when website opens (skip on profile or portal)
  useEffect(() => {
    if (pathname === '/profile' || pathname === '/portal') return;

    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('rb_dismissed_arrivals');
        sessionStorage.removeItem('rb_dismissed_deals');
      } catch (e) {}
    }

    const timer = setTimeout(() => {
      setShowNewArrivals(true);
    }, 600);
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
      {/* MODAL 1: NEW ARRIVALS (Wide Horizontal Landscape Layout - Light Theme)  */}
      {/* ========================================================================= */}
      {showNewArrivals && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={handleCloseNewArrivals}
        >
          <div 
            className="relative w-full max-w-3xl lg:max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Clean Light Header (NO dark blue) */}
            <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Sparkles size={16} className="text-emerald-600" />
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  New Arrivals (2026 Medical Series)
                </h3>
                <span className="bg-white border border-slate-200 text-slate-600 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-2xs">
                  {arrivalIndex + 1} / {NEW_ARRIVALS.length}
                </span>
              </div>

              <button
                onClick={handleCloseNewArrivals}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-200/80 border border-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center transition cursor-pointer shadow-2xs"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Wide 2-Column Horizontal Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden">
              
              {/* Left Column: Big Product Showcase Image with Controls & Mini Carousel Strip */}
              <div 
                className="md:col-span-6 bg-slate-50/80 p-5 sm:p-6 flex flex-col items-center justify-between relative border-b md:border-b-0 md:border-r border-slate-100 select-none min-h-[300px] md:min-h-[400px]"
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
                <div className="absolute top-4 left-4 z-10 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1">
                  <Sparkles size={11} />
                  <span>{currentArrival.badgeLabel}</span>
                </div>

                <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-xs text-slate-700 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-2xs flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-emerald-600 stroke-[3]" />
                  <span>CDSCO Certified</span>
                </div>

                {/* Product Image Stage with smooth continuous slide transition */}
                <div 
                  key={`arrival-slide-${currentArrival.id}`}
                  onClick={() => {
                    handleCloseNewArrivals();
                    router.push(`/product/${currentArrival.id}`);
                  }}
                  className="w-full h-44 sm:h-52 md:h-56 flex items-center justify-center p-2 cursor-pointer group mt-5 animate-in fade-in slide-in-from-right-8 duration-300"
                >
                  <img 
                    src={currentArrival.image} 
                    alt={currentArrival.name} 
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm" 
                  />
                </div>

                {/* Left Arrow on Image */}
                <button
                  onClick={prevArrival}
                  className="absolute left-3 top-28 sm:top-32 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer z-10"
                  aria-label="Previous Arrival"
                >
                  <ChevronLeft size={17} className="stroke-[2.5]" />
                </button>

                {/* Right Arrow on Image */}
                <button
                  onClick={nextArrival}
                  className="absolute right-3 top-28 sm:top-32 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer z-10"
                  aria-label="Next Arrival"
                >
                  <ChevronRight size={17} className="stroke-[2.5]" />
                </button>

                {/* Mini Product Carousel Strip - Rotating smoothly */}
                <div className="w-full mt-2">
                  <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                    {NEW_ARRIVALS.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setArrivalIndex(idx);
                        }}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all cursor-pointer shrink-0 ${
                          arrivalIndex === idx 
                            ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-2 ring-emerald-400/50 scale-105' 
                            : 'bg-white border-slate-200/90 hover:border-slate-300 opacity-60 hover:opacity-100'
                        }`}
                        title={item.name}
                      >
                        <img src={item.image} alt={item.name} className="w-6 h-6 object-contain rounded bg-slate-50 p-0.5" />
                        <span className="hidden sm:inline text-[10px] font-bold text-slate-800 truncate max-w-[65px]">
                          {item.name.split(' ')[1] || item.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Slide Dots */}
                  <div className="flex items-center justify-center gap-1.5 mt-2">
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
              </div>

              {/* Right Column: Detailed Product Information & Call to Action */}
              <div 
                key={`info-${currentArrival.id}`}
                className="md:col-span-6 p-6 sm:p-7 flex flex-col justify-between bg-white animate-in fade-in duration-200"
              >
                <div>
                  {/* Brand & SKU */}
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
                    <span className="text-emerald-700 font-bold uppercase tracking-wider text-[11px]">{currentArrival.brand}</span>
                    <span className="font-mono text-slate-400 text-[11px]">SKU: {currentArrival.sku}</span>
                  </div>

                  {/* Title */}
                  <h4 
                    onClick={() => {
                      handleCloseNewArrivals();
                      router.push(`/product/${currentArrival.id}`);
                    }}
                    className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug hover:text-red-600 transition cursor-pointer"
                  >
                    {currentArrival.name}
                  </h4>

                  {/* Description / Key Specs */}
                  <p className="text-xs text-slate-600 line-clamp-3 mt-2 leading-relaxed">
                    {currentArrival.featureDesc || currentArrival.shortDesc}
                  </p>

                  {/* Feature Checkmarks */}
                  <div className="mt-3.5 space-y-1.5 text-xs text-slate-700 font-medium">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>2 Years Comprehensive On-Site Warranty</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                      <span>Direct OEM Factory Assembly & Testing Certified</span>
                    </div>
                  </div>

                  {/* Pricing Box */}
                  <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-400 line-through font-medium block">
                          MRP ₹{currentArrival.mrp.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-slate-900">
                          ₹{currentArrival.price.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="inline-block bg-emerald-100/90 text-emerald-800 font-extrabold text-xs px-2.5 py-1 rounded-lg">
                          2026 Factory Release
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1 font-medium">
                          Dispatch in 24-48 Hours
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      handleCloseNewArrivals();
                      router.push(`/product/${currentArrival.id}`);
                    }}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-xs hover:shadow cursor-pointer"
                  >
                    <span>View Specifications & Buy</span>
                    <ArrowRight size={15} />
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
      {/* MODAL 2: BEST DEALS (Wide Horizontal Landscape Layout - Light Theme)     */}
      {/* ========================================================================= */}
      {showBestDeals && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={handleCloseBestDeals}
        >
          <div 
            className="relative w-full max-w-3xl lg:max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Clean Light Header (NO dark blue) */}
            <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <Flame size={16} className="fill-red-600 text-red-600" />
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  Today's Best Factory Deals
                </h3>
                <span className="bg-white border border-slate-200 text-slate-600 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-2xs">
                  {dealIndex + 1} / {BEST_DEALS.length}
                </span>
              </div>

              <button
                onClick={handleCloseBestDeals}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-200/80 border border-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center transition cursor-pointer shadow-2xs"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Wide 2-Column Horizontal Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden">
              
              {/* Left Column: Big Product Showcase Image with Controls & Mini Carousel Strip */}
              <div 
                className="md:col-span-6 bg-slate-50/80 p-5 sm:p-6 flex flex-col items-center justify-between relative border-b md:border-b-0 md:border-r border-slate-100 select-none min-h-[300px] md:min-h-[400px]"
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
                <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1">
                  <Percent size={11} className="stroke-[3]" />
                  <span>{currentDeal.discountPercent}% OFF</span>
                </div>

                <div className="absolute top-4 right-4 z-10 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs">
                  Save ₹{currentDeal.saveAmount.toLocaleString('en-IN')}
                </div>

                {/* Product Image Stage with smooth continuous slide transition */}
                <div 
                  key={`deal-slide-${currentDeal.id}`}
                  onClick={() => {
                    handleCloseBestDeals();
                    router.push(`/product/${currentDeal.id}`);
                  }}
                  className="w-full h-44 sm:h-52 md:h-56 flex items-center justify-center p-2 cursor-pointer group mt-5 animate-in fade-in slide-in-from-right-8 duration-300"
                >
                  <img 
                    src={currentDeal.image} 
                    alt={currentDeal.name} 
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm" 
                  />
                </div>

                {/* Left Arrow on Image */}
                <button
                  onClick={prevDeal}
                  className="absolute left-3 top-28 sm:top-32 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer z-10"
                  aria-label="Previous Deal"
                >
                  <ChevronLeft size={17} className="stroke-[2.5]" />
                </button>

                {/* Right Arrow on Image */}
                <button
                  onClick={nextDeal}
                  className="absolute right-3 top-28 sm:top-32 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer z-10"
                  aria-label="Next Deal"
                >
                  <ChevronRight size={17} className="stroke-[2.5]" />
                </button>

                {/* Mini Product Carousel Strip - Rotating smoothly */}
                <div className="w-full mt-2">
                  <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                    {BEST_DEALS.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDealIndex(idx);
                        }}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all cursor-pointer shrink-0 ${
                          dealIndex === idx 
                            ? 'bg-red-50 border-red-500 shadow-xs ring-2 ring-red-400/50 scale-105' 
                            : 'bg-white border-slate-200/90 hover:border-slate-300 opacity-60 hover:opacity-100'
                        }`}
                        title={item.name}
                      >
                        <img src={item.image} alt={item.name} className="w-6 h-6 object-contain rounded bg-slate-50 p-0.5" />
                        <span className="hidden sm:inline text-[10px] font-bold text-slate-800 truncate max-w-[65px]">
                          {item.name.split(' ')[1] || item.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Slide Dots */}
                  <div className="flex items-center justify-center gap-1.5 mt-2">
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
              </div>

              {/* Right Column: Detailed Product Information & Call to Action */}
              <div 
                key={`deal-info-${currentDeal.id}`}
                className="md:col-span-6 p-6 sm:p-7 flex flex-col justify-between bg-white animate-in fade-in duration-200"
              >
                <div>
                  {/* Brand & SKU */}
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
                    <span className="text-red-600 font-bold uppercase tracking-wider text-[11px]">{currentDeal.brand}</span>
                    <span className="font-mono text-slate-400 text-[11px]">SKU: {currentDeal.sku}</span>
                  </div>

                  {/* Title */}
                  <h4 
                    onClick={() => {
                      handleCloseBestDeals();
                      router.push(`/product/${currentDeal.id}`);
                    }}
                    className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug hover:text-red-600 transition cursor-pointer"
                  >
                    {currentDeal.name}
                  </h4>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-3 mt-2 leading-relaxed">
                    {currentDeal.shortDesc}
                  </p>

                  {/* Feature Checkmarks */}
                  <div className="mt-3.5 space-y-1.5 text-xs text-slate-700 font-medium">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>2 Years Comprehensive On-Site Warranty Included</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                      <span>CDSCO Certified & AERB / ISO 13485 Compliant</span>
                    </div>
                  </div>

                  {/* Price & Savings Box */}
                  <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-400 line-through font-medium block">
                          MRP ₹{currentDeal.mrp.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-slate-900">
                          ₹{currentDeal.price.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="inline-block bg-emerald-100/90 text-emerald-800 font-extrabold text-xs px-2.5 py-1 rounded-lg">
                          Save ₹{currentDeal.saveAmount.toLocaleString('en-IN')}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1 font-medium">
                          {currentDeal.dealStock}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      handleCloseBestDeals();
                      router.push(`/product/${currentDeal.id}`);
                    }}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-xs hover:shadow cursor-pointer"
                  >
                    <span>View Full Specifications & Buy</span>
                    <ArrowRight size={15} />
                  </button>

                  <button
                    onClick={() => {
                      handleCloseBestDeals();
                      router.push('/deals?tab=best-deals');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 text-center py-1 transition cursor-pointer"
                  >
                    Browse All 18 Factory Deals &rarr;
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
