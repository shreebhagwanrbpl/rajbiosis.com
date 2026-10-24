'use client';

import React from 'react';
import { 
  HeartPulse, 
  Radio, 
  Scissors, 
  Activity, 
  Bed, 
  ShieldAlert, 
  LayoutGrid,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';

const iconMap = {
  LayoutGrid,
  HeartPulse,
  Radio,
  Scissors,
  Activity,
  Bed,
  ShieldAlert
};

export default function CategoryGrid({ selectedCategory, onSelectCategory }) {
  const handleCardClick = (catId) => {
    onSelectCategory(catId);
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-md inline-block mb-2">
              Clinical Specialties
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hospital Departments & Biomedical Inventory
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select a specialized care unit to browse certified ICU, OT, Diagnostic, and Infrastructure devices.
            </p>
          </div>

          <button
            onClick={() => handleCardClick('all')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-xl transition"
          >
            <span>View All Equipment ({CATEGORIES[0].itemCount})</span>
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.filter(c => c.id !== 'all').map(cat => {
            const IconComponent = iconMap[cat.icon] || HeartPulse;
            const isSelected = selectedCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => handleCardClick(cat.id)}
                className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-400/20'
                    : 'bg-slate-50/50 hover:bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200 flex items-center justify-center shadow-xs">
                      <IconComponent size={24} />
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-2xs">
                      {cat.itemCount} Devices
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition mb-1.5">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                  <span>Explore Department</span>
                  <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
