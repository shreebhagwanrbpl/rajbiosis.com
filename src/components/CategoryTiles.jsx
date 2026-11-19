'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Activity, Sparkles, FolderOpen } from 'lucide-react';
import { CATEGORIES } from '../data/categories';

export default function CategoryTiles() {
  const [categories, setCategories] = useState(() => {
    return CATEGORIES.filter(c => c.id !== 'all').slice(0, 14);
  });

  useEffect(() => {
    let isMounted = true;
    async function loadLiveCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories.slice(0, 14));
          }
        }
      } catch (e) {
        // Fallback to static CATEGORIES
      }
    }
    loadLiveCategories();
    return () => { isMounted = false; };
  }, []);

  if (!categories || categories.length === 0) return null;

  // Loop categories twice for a seamless infinite auto-scroll marquee
  const loopedCategories = [...categories, ...categories];

  return (
    <section className="py-12 sm:py-16 bg-neutral-50/70 border-b border-neutral-200/80 overflow-hidden relative">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
        
        {/* Clean Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-3 border-b border-neutral-200/70">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-600 shrink-0" />
              <span>Explore Categories</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
              Laboratory reagents, diagnostic kits &amp; clinical healthcare supplies
            </p>
          </div>

          <Link
            href="/categories"
            prefetch={true}
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group self-start sm:self-auto shrink-0"
          >
            <span>View All Categories</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Infinite Smooth Auto-Scrolling Marquee Track */}
      <div className="relative w-full overflow-hidden select-none">
        {/* Left & Right Soft Edge Gradient Masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-neutral-50 via-neutral-50/80 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-28 bg-gradient-to-l from-neutral-50 via-neutral-50/80 to-transparent z-10" />

        <div
          className="animate-marquee flex items-center gap-5 py-3 hover:[animation-play-state:paused]"
          style={{ animationDuration: '40s' }}
        >
          {loopedCategories.map((cat, idx) => {
            const count = cat.count || cat.itemCount || 0;
            const img = cat.image || 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80';

            return (
              <Link
                key={`${cat.slug || cat.id}-${idx}`}
                href={`/category/${cat.slug || cat.id}`}
                prefetch={true}
                className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden hover:border-brand-500 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between w-[250px] sm:w-[275px] shrink-0 p-3.5 shadow-2xs cursor-pointer"
              >
                {/* Visual Image Preview */}
                <div className="relative aspect-[16/10] bg-slate-50 rounded-2xl overflow-hidden mb-3 flex items-center justify-center p-2">
                  <img
                    src={img}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  
                  {/* Floating Unit Count Badge */}
                  <div className="absolute bottom-2.5 left-2.5 flex items-center">
                    <span className="bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono border border-white/10 shadow-xs">
                      {count} Products
                    </span>
                  </div>
                </div>

                {/* Content: Icon + Name */}
                <div className="px-1">
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-red-50 text-brand-600 flex items-center justify-center shrink-0 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                      <Activity size={16} />
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-brand-600 transition-colors leading-tight line-clamp-1">
                      {cat.name}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-500 font-normal line-clamp-1 pl-10">
                    Verified quality &amp; direct stock
                  </p>
                </div>

                {/* Micro Action Strip */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-brand-600 transition-colors px-1">
                  <span>Explore Products</span>
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
