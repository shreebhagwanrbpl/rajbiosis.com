'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, HeartPulse, Radio, Scissors, Activity, Bed, ShieldAlert } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products';

export default function CategoryTiles() {
  const categoryImages = {
    'icu-critical-care': 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
    'radiology-imaging': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
    'surgical-ot': 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80',
    'diagnostic-lab': 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80',
    'hospital-furniture': 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80',
    'sterilization-dental': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80',
  };

  const categorySubtitles = {
    'icu-critical-care': 'Ventilators, Monitors & Defibrillators',
    'radiology-imaging': 'Digital X-Ray DR & 4D Ultrasound',
    'surgical-ot': 'Laparoscopy Towers & OT Tables',
    'diagnostic-lab': 'Auto Hematology & Clinical ECG',
    'hospital-furniture': 'Motorized ICU Beds & Crash Carts',
    'sterilization-dental': 'Class-B Autoclaves & Clean Benches',
  };

  const getIcon = (id) => {
    switch(id) {
      case 'icu-critical-care': return <HeartPulse size={18} />;
      case 'radiology-imaging': return <Radio size={18} />;
      case 'surgical-ot': return <Scissors size={18} />;
      case 'diagnostic-lab': return <Activity size={18} />;
      case 'hospital-furniture': return <Bed size={18} />;
      case 'sterilization-dental': return <ShieldAlert size={18} />;
      default: return <HeartPulse size={18} />;
    }
  };

  const activeCategories = CATEGORIES.filter(c => c.id !== 'all');
  // Loop categories 3 times for a seamless infinite auto-scroll marquee
  const loopedCategories = [...activeCategories, ...activeCategories, ...activeCategories];

  return (
    <section className="py-12 sm:py-16 bg-neutral-50/70 border-b border-neutral-200/80 overflow-hidden relative">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
        
        {/* Clean Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200/70">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-600 shrink-0" />
              <span>Explore Categories</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
              Specialized hospital departments &amp; medical engineering inventory
            </p>
          </div>

          <Link
            href="/products"
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group shrink-0"
          >
            <span>View All Categories</span>
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Infinite Smooth Auto-Scrolling Marquee Track */}
      <div className="relative w-full overflow-hidden select-none">
        {/* Left & Right Soft Edge Gradient Masks for Luxury Floating Look */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-neutral-50 via-neutral-50/80 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-28 bg-gradient-to-l from-neutral-50 via-neutral-50/80 to-transparent z-10" />

        <div
          className="animate-marquee flex items-center gap-5 py-3 hover:[animation-play-state:paused]"
          style={{ animationDuration: '38s' }}
        >
          {loopedCategories.map((cat, idx) => {
            const count = PRODUCTS.filter(p => p.category === cat.id).length;
            const img = categoryImages[cat.id] || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80';

            return (
              <Link
                key={`${cat.id}-${idx}`}
                href={`/category/${cat.id}`}
                className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden hover:border-brand-500 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between w-[250px] sm:w-[275px] shrink-0 p-3.5 shadow-2xs cursor-pointer"
              >
                {/* Visual Image Preview (Edge-to-Edge inside card) */}
                <div className="relative aspect-[16/10] bg-slate-100 rounded-2xl overflow-hidden mb-3">
                  <img
                    src={img}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity" />
                  
                  {/* Floating Unit Count Badge */}
                  <div className="absolute bottom-2.5 left-2.5 flex items-center">
                    <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono border border-white/10">
                      {count} Products
                    </span>
                  </div>
                </div>

                {/* Content: Department Icon + Name + Subtitle */}
                <div className="px-1">
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-red-50 text-brand-600 flex items-center justify-center shrink-0 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                      {getIcon(cat.id)}
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-brand-600 transition-colors leading-tight line-clamp-1">
                      {cat.name}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-500 font-normal line-clamp-1 pl-10">
                    {categorySubtitles[cat.id]}
                  </p>
                </div>

                {/* Micro Action Strip */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-brand-600 transition-colors px-1">
                  <span>Explore Equipment</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
