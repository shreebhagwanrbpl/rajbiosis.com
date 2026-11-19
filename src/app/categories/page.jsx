'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { CATEGORIES } from '../../data/categories';
import { Search, ArrowRight, Layers, ShieldCheck, ChevronRight } from 'lucide-react';

export default function AllCategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const allCategories = useMemo(() => {
    return CATEGORIES.filter(c => c.id !== 'all');
  }, []);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return allCategories;
    const q = searchQuery.toLowerCase().trim();
    return allCategories.filter(c => c.name.toLowerCase().includes(q));
  }, [allCategories, searchQuery]);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900 antialiased">
      <Header />

      {/* Hero Header Strip with Integrated Breadcrumbs & Ambient Glow */}
      <div className="bg-gradient-to-b from-white via-slate-50/80 to-slate-100/90 border-b border-slate-200/90 py-7 sm:py-9 relative overflow-hidden">
        {/* Soft Ambient Glows */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-red-100/35 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 bottom-0 w-64 h-64 rounded-full bg-slate-200/30 blur-2xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-4">
            <Link href="/" className="hover:text-brand-600 transition">Home</Link>
            <ChevronRight size={12} className="text-slate-400" />
            <span className="text-slate-900 font-bold bg-white/90 px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
              All Categories
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-3 border border-brand-200/80 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>
                <Layers size={13} className="text-brand-600" />
                <span>{allCategories.length} Certified Biomedical &amp; Laboratory Divisions</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                All Equipment &amp; Reagents Categories
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
                Browse complete institutional healthcare categories, pathology diagnostic reagents, and surgical equipment. Select any category to explore all certified models and request direct factory quotations.
              </p>
            </div>

            {/* Instant Search Filter Input */}
            <div className="w-full md:w-80 relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${allCategories.length} categories (e.g. Test Strips, Analyzers)...`}
                className="w-full pl-10 pr-9 py-2.5 bg-white text-slate-900 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 focus:border-brand-600 outline-none transition shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Categories Grid */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-md mx-auto my-12 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-4">
              <Search size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900">No categories found</h3>
            <p className="text-xs text-slate-500 mt-1">
              No categories match &quot;{searchQuery}&quot;. Try a different search keyword.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition"
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredCategories.map((cat) => (
              <Link
                key={cat.slug || cat.id}
                href={`/category/${cat.slug || cat.id}`}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Category Image Box (Product-card style) */}
                  <div className="relative aspect-[16/10] bg-slate-50 border-b border-slate-100 overflow-hidden flex items-center justify-center p-3">
                    <img
                      src={cat.image || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80'}
                      alt={cat.name}
                      loading="lazy"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Products Count Badge */}
                    <span className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs font-mono">
                      {cat.itemCount} Devices
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block mb-1">
                      Division
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug line-clamp-1">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                      {cat.description || `Certified institutional equipment & supplies for ${cat.name}.`}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-600 group-hover:text-brand-700">
                    <span>Explore Products</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

