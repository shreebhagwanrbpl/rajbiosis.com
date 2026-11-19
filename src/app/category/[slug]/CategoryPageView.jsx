'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '../../../components/ProductCard';
import { 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  PackageOpen, 
  Home, 
  ChevronRight, 
  Search, 
  SlidersHorizontal,
  FileText,
  Layers,
  Truck,
  Sparkles
} from 'lucide-react';

export default function CategoryPageView({ category, products, otherCategories = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [headerHeight, setHeaderHeight] = useState(120);

  // Dynamically track exact header height so sticky toolbar locks right underneath the navbar
  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerEl = document.querySelector('header');
      if (headerEl) {
        setHeaderHeight(headerEl.offsetHeight);
      }
    };
    updateHeaderHeight();
    const timer = setTimeout(updateHeaderHeight, 150);
    window.addEventListener('resize', updateHeaderHeight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Filter by search query within category
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.shortDesc && p.shortDesc.toLowerCase().includes(q)) ||
        (p.desc && p.desc.toLowerCase().includes(q))
      );
    }

    // Sort options
    if (sortBy === 'name') {
      list.sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''));
    } else if (sortBy === 'sku') {
      list.sort((a, b) => (a.sku || '').localeCompare(b.sku || ''));
    }

    return list;
  }, [products, searchQuery, sortBy]);

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Category Hero Banner (Clean, Minimal & Professional) */}
      <div className="bg-gradient-to-b from-white via-slate-50/70 to-slate-100/80 border-b border-slate-200 py-3.5 sm:py-4 relative">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs & Back Navigation */}
          <div className="flex items-center justify-between gap-3 mb-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Link href="/" className="hover:text-brand-600 transition flex items-center gap-1">
                <Home size={13} className="opacity-70" />
                <span>Home</span>
              </Link>
              <ChevronRight size={12} className="text-slate-400" />
              <Link href="/categories" className="hover:text-brand-600 transition">
                Categories
              </Link>
              <ChevronRight size={12} className="text-slate-400" />
              <span className="text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-200/80 text-[11px] truncate max-w-[200px] sm:max-w-none">
                {category.name}
              </span>
            </div>

            <Link
              href="/categories"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline transition"
            >
              <ArrowLeft size={12} />
              <span>All Categories</span>
            </Link>
          </div>

          {/* Clean Minimal Title & Details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
                <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                  Biomedical Division
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 tracking-tight">
                {category.name}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
                {category.description || `Certified healthcare equipment and reagents with direct factory supply.`}
              </p>
            </div>

            {/* Compact Trust Pills */}
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 shrink-0">
              <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span>CDSCO Certified</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
                <CheckCircle2 size={12} className="text-blue-600" />
                <span>OEM Direct Supply</span>
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Sticky Toolbar */}
      <div 
        className="sticky z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all"
        style={{ top: `${headerHeight}px` }}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          
          {/* Simple Clean Product Count */}
          <div className="text-xs text-slate-700 font-medium">
            <span className="font-extrabold text-slate-950">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'Product' : 'Products'}
            {searchQuery && (
              <span className="text-slate-400 ml-1.5 font-normal">
                (filtered from {products.length})
              </span>
            )}
          </div>

          {/* Search Input & Sort Options */}
          <div className="flex items-center gap-2 flex-1 sm:max-w-md justify-end">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search in ${category.name}...`}
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 focus:bg-white text-xs text-slate-900 rounded-xl border border-slate-200 focus:border-brand-500 outline-none transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                  title="Clear filter"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700 text-xs outline-none focus:border-brand-500 cursor-pointer shrink-0"
            >
              <option value="featured">Featured First</option>
              <option value="name">Name (A-Z)</option>
              <option value="sku">SKU Code</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Products Grid */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-10">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id || product.sku} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <PackageOpen size={30} />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {searchQuery ? `No products match "${searchQuery}"` : 'No products found in this category'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery 
                ? 'Try a different search keyword or clear the search filter to see all category items.'
                : 'Please browse our full catalogue to explore all 1,169 verified healthcare devices and reagents.'
              }
            </p>
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-2 btn-primary-red text-xs py-2 px-5 cursor-pointer"
              >
                <span>Clear Search Filter</span>
              </button>
            ) : (
              <Link
                href="/products"
                className="inline-flex items-center gap-2 btn-primary-red text-xs py-2 px-5"
              >
                <span>View Full Catalogue</span>
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        )}

        {/* Explore Other Categories Section */}
        {otherCategories.length > 0 && (
          <div className="pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={14} className="text-brand-600" />
                <span>Explore Other Healthcare Categories:</span>
              </h3>
              <Link
                href="/categories"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
              >
                <span>View All 79</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {otherCategories.map((otherCat) => (
                <Link
                  key={otherCat.slug || otherCat.id}
                  href={`/category/${otherCat.slug || otherCat.id}`}
                  className="px-3 py-1.5 bg-white hover:bg-brand-50 hover:border-brand-200 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:text-brand-600 transition flex items-center gap-1.5 shadow-2xs"
                >
                  <span>{otherCat.name}</span>
                  {otherCat.itemCount ? (
                    <span className="text-[10px] text-slate-400 font-mono">({otherCat.itemCount})</span>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

