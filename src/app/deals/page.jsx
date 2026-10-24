'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { PRODUCTS } from '../../data/products';
import { CATEGORIES } from '../../data/categories';
import { 
  Flame, 
  Sparkles, 
  Tag, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Percent, 
  Search,
  Filter,
  FileText,
  SlidersHorizontal
} from 'lucide-react';

function DealsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'best-deals';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['best-deals', 'special-offers', 'new-arrivals'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    router.push(`/deals?tab=${tab}`, { scroll: false });
  };

  // Format currency
  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Filter & calculate products based on active tab
  const productsList = useMemo(() => {
    let list = [...PRODUCTS];

    // Filter by category
    if (selectedCategory !== 'all') {
      list = list.filter(p => p.category === selectedCategory);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    // Tab logic - ensure all products remain available with specialized sorting
    if (activeTab === 'best-deals') {
      // Sort by highest absolute discount amount
      list.sort((a, b) => (b.mrp - b.price) - (a.mrp - a.price));
    } else if (activeTab === 'special-offers') {
      // Products with bulk volume tiers prioritized, all products available
      list.sort((a, b) => {
        const hasA = a.bulkPricing && a.bulkPricing.length > 1 ? 1 : 0;
        const hasB = b.bulkPricing && b.bulkPricing.length > 1 ? 1 : 0;
        if (hasA !== hasB) return hasB - hasA;
        return ((b.mrp - b.price) / b.mrp) - ((a.mrp - a.price) / a.mrp);
      });
    } else if (activeTab === 'new-arrivals') {
      // Prioritize 2026 new releases and top ratings
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  }, [activeTab, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      <Header />

      {/* Hero Banner with Live Savings Ticker */}
      <div className="bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200 py-8 sm:py-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <Link href="/" className="hover:text-red-600 transition">Home</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Factory Clearance & Deals</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100/90 text-red-700 text-xs font-bold mb-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                <span>Direct Manufacturer Clearance 2026</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {activeTab === 'best-deals' && 'Today’s Best Factory Deals'}
                {activeTab === 'special-offers' && 'Special Bulk & Institutional Offers'}
                {activeTab === 'new-arrivals' && '2026 New Arrival Equipment'}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl">
                Direct-from-manufacturer hospital life-support, diagnostic and surgical equipment with full 2 Years Comprehensive On-Site Warranty and CDSCO/ISO certification.
              </p>
            </div>

            {/* Quick Summary Pill */}
            <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs shrink-0">
              <div className="text-center px-2">
                <div className="text-xl sm:text-2xl font-black text-red-600">Up to 35%</div>
                <div className="text-[11px] font-semibold text-slate-500">Factory Discount</div>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="text-center px-2">
                <div className="text-xl sm:text-2xl font-black text-slate-900">{productsList.length}</div>
                <div className="text-[11px] font-semibold text-slate-500">Products on Deal</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Best Deals, Special Offers, New Arrivals) */}
          <div className="flex items-center gap-2 mt-8 border-b border-slate-200 overflow-x-auto scrollbar-none pb-px">
            <button
              onClick={() => handleTabChange('best-deals')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'best-deals'
                  ? 'border-red-600 text-red-600 bg-white/80 rounded-t-xl shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Flame size={16} className={activeTab === 'best-deals' ? 'fill-red-600 text-red-600 animate-pulse' : 'text-slate-400'} />
              <span>Best Deals</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${activeTab === 'best-deals' ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-700'}`}>
                Save Up to ₹4.3L
              </span>
            </button>

            <button
              onClick={() => handleTabChange('special-offers')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'special-offers'
                  ? 'border-red-600 text-red-600 bg-white/80 rounded-t-xl shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Tag size={16} className={activeTab === 'special-offers' ? 'text-red-600' : 'text-slate-400'} />
              <span>Special Bulk Offers</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${activeTab === 'special-offers' ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-700'}`}>
                Tiered Qty
              </span>
            </button>

            <button
              onClick={() => handleTabChange('new-arrivals')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'new-arrivals'
                  ? 'border-red-600 text-red-600 bg-white/80 rounded-t-xl shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Sparkles size={16} className={activeTab === 'new-arrivals' ? 'text-red-600' : 'text-slate-400'} />
              <span>New Arrivals (2026)</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${activeTab === 'new-arrivals' ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-700'}`}>
                Latest
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Deals Catalog Container */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {/* Search & Category Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none py-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Categories ({PRODUCTS.length})
            </button>

            {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter deals by product name..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-red-500 outline-none transition"
            />
          </div>
        </div>

        {/* Products Deal Cards Grid */}
        {productsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsList.map((product) => {
              const saveAmount = (product.mrp && product.price) ? (product.mrp - product.price) : 0;
              const discountPercent = product.mrp ? Math.round((saveAmount / product.mrp) * 100) : 0;

              return (
                <div 
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-red-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Top Image Box with High-Impact Badges */}
                    <Link 
                      href={`/product/${product.id}`}
                      className="block relative aspect-[4/3] bg-slate-50 p-4 border-b border-slate-100 overflow-hidden"
                    >
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Discount Tag */}
                      {discountPercent > 0 && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
                          <Percent size={11} className="stroke-[3]" />
                          <span>{discountPercent}% OFF</span>
                        </div>
                      )}

                      {/* Brand Label */}
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-md border border-slate-200">
                        {product.brand}
                      </div>

                      {/* Model SKU */}
                      <div className="absolute bottom-3 left-3 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                        {product.sku}
                      </div>
                    </Link>

                    {/* Content Section */}
                    <div className="p-5">
                      <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider mb-1">
                        {product.category.replace(/-/g, ' ')}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 min-h-[2.75rem] group-hover:text-red-600 transition-colors">
                        <Link href={`/product/${product.id}`}>
                          {product.name}
                        </Link>
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 min-h-[2rem]">
                        {product.shortDesc}
                      </p>

                      {/* Price & Savings Box */}
                      <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-slate-400 line-through font-medium">
                              MRP {formatINR(product.mrp)}
                            </div>
                            <div className="text-xl font-black text-slate-900 mt-0.5">
                              {formatINR(product.price)}
                            </div>
                          </div>

                          {saveAmount > 0 && (
                            <div className="text-right">
                              <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2 py-0.5 rounded">
                                Save {formatINR(saveAmount)}
                              </span>
                              <div className="text-[10px] text-slate-400 mt-1 font-medium">
                                Direct Factory Price
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Bulk Volume Perk if available */}
                        {product.bulkPricing && product.bulkPricing.length > 1 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200 text-[11px] text-slate-600 flex items-center gap-1 font-medium">
                            <Tag size={12} className="text-red-500 shrink-0" />
                            <span>Bulk Rate: From {formatINR(product.bulkPricing[product.bulkPricing.length - 1].pricePerUnit)}/unit on hospital orders</span>
                          </div>
                        )}
                      </div>

                      {/* Trust Highlights */}
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                        <span>Includes 2 Yrs Comprehensive Warranty</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-5 pt-0">
                    <Link
                      href={`/product/${product.id}`}
                      className="w-full py-2.5 bg-slate-900 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs group-hover:shadow"
                    >
                      <span>View Specifications & Buy</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Search size={22} />
            </div>
            <h4 className="text-base font-bold text-slate-800">No products match your filter</h4>
            <p className="text-xs text-slate-500 mt-1">Try selecting a different category or clearing your search term.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default function DealsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 text-sm font-semibold animate-pulse">Loading Deals Catalogue...</div>
      </div>
    }>
      <DealsContent />
    </Suspense>
  );
}
