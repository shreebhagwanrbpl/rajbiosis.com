'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight, 
  HeartPulse, 
  Activity, 
  Radio, 
  Sparkles, 
  Bed, 
  Layers, 
  ArrowRight 
} from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/categories';

export default function ProductCarouselHero({ onSelectCategory }) {
  // Pure image promotional banners for Raj Biosis (100% full image banners with no text clutter)
  const banners = [
    {
      id: "slide-1",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1600&q=85",
      alt: "Critical Care ICU Ventilators & Patient Monitoring Solutions - Raj Biosis",
      link: `/product/${PRODUCTS[0].id}`,
      caption: "RajBiosis-Vent Pro-X9 Workstation"
    },
    {
      id: "slide-2",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1600&q=85",
      alt: "Digital Radiography & High Frequency 500mA X-Ray DR Suite",
      link: `/product/${PRODUCTS[4].id}`,
      caption: "Fixed 500mA Digital Radiography System"
    },
    {
      id: "slide-3",
      image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1600&q=85",
      alt: "Advanced Operating Theatre, Dual Dome LED OT Lights & 4K Laparoscopy",
      link: `/product/${PRODUCTS[8].id}`,
      caption: "Integrated 4K Laparoscopic OT Suite"
    },
    {
      id: "slide-4",
      image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1600&q=85",
      alt: "SonoVision 4D Color Doppler Ultrasound Diagnostics",
      link: `/product/${PRODUCTS[5].id}`,
      caption: "SonoVision 4D Color Doppler Ultrasound"
    },
    {
      id: "slide-5",
      image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1600&q=85",
      alt: "Hospital Infrastructure & Motorized 5-Function ICU Electric Beds",
      link: `/product/${PRODUCTS[13].id}`,
      caption: "Motorized 5-Function ICU Electric Bed"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, banners.length]);

  const handleCategoryClick = (catId) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="bg-white pt-3 pb-6 border-b border-slate-200/80"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Full Image Banner Container - Pure Images, Zero Clutter */}
        <div className="relative w-full h-48 sm:h-72 md:h-96 lg:h-[420px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-md group">
          {/* Active Banner Image - 100% full image */}
          <Link 
            href={banners[currentIndex].link} 
            className="block w-full h-full cursor-pointer relative"
          >
            <img
              src={banners[currentIndex].image}
              alt={banners[currentIndex].alt}
              className="w-full h-full object-cover transition-all duration-700 transform group-hover:scale-[1.01]"
            />
          </Link>

          {/* Previous Arrow */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-lg flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-105 border border-slate-200 z-10"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Next Arrow */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setCurrentIndex((prev) => (prev + 1) % banners.length);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-lg flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-105 border border-slate-200 z-10"
            aria-label="Next Slide"
          >
            <ChevronRight size={22} />
          </button>

          {/* Clean Indicator Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-full z-10">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full h-2 ${
                  currentIndex === idx ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Quick Direct Link Label */}
          <Link
            href={banners[currentIndex].link}
            className="absolute bottom-3 right-3 hidden sm:flex items-center gap-1.5 bg-white/90 hover:bg-white backdrop-blur-xs text-slate-900 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm transition z-10"
          >
            <span>View Hardware Specs</span>
            <ArrowRight size={13} className="text-blue-600" />
          </Link>
        </div>

        {/* Quick Department Category Navigator Strip */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => handleCategoryClick('all')}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 border border-slate-200/90 whitespace-nowrap transition flex items-center gap-1.5 shrink-0"
          >
            <Layers size={13} className="text-blue-600" />
            <span>All Clinical Units ({PRODUCTS.length})</span>
          </button>

          {CATEGORIES.map((cat) => {
            const count = PRODUCTS.filter(p => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-white hover:border-blue-400 hover:text-blue-600 text-slate-700 border border-slate-200 whitespace-nowrap transition flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                <span>{cat.name}</span>
                <span className="text-[10px] font-mono font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
