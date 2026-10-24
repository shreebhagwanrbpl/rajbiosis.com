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

  const getIcon = (id) => {
    switch(id) {
      case 'icu-critical-care': return <HeartPulse size={18} className="text-brand-600" />;
      case 'radiology-imaging': return <Radio size={18} className="text-brand-600" />;
      case 'surgical-ot': return <Scissors size={18} className="text-brand-600" />;
      case 'diagnostic-lab': return <Activity size={18} className="text-brand-600" />;
      case 'hospital-furniture': return <Bed size={18} className="text-brand-600" />;
      case 'sterilization-dental': return <ShieldAlert size={18} className="text-brand-600" />;
      default: return <HeartPulse size={18} className="text-brand-600" />;
    }
  };

  const activeCategories = CATEGORIES.filter(c => c.id !== 'all');

  return (
    <section className="py-10 sm:py-14 bg-neutral-50/60 border-b border-neutral-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Browse All link */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block mb-1">
              Clinical Departments
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              Biomedical Equipment Categories
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>All Categories</span>
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 6 Category Tiles Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {activeCategories.map((cat) => {
            const count = PRODUCTS.filter(p => p.category === cat.id).length;
            const img = categoryImages[cat.id] || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80';

            return (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                className="group bg-white rounded-2xl border border-neutral-200/90 overflow-hidden hover:border-neutral-300 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
              >
                {/* Visual Image Preview */}
                <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                  <img
                    src={img}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[11px] font-semibold">
                    <span className="bg-neutral-900/80 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono">
                      {count} Units
                    </span>
                  </div>
                </div>

                {/* Text Content */}
                <div className="p-3.5 flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {getIcon(cat.id)}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-neutral-800 group-hover:text-brand-600 transition-colors leading-tight">
                      {cat.name}
                    </h3>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
