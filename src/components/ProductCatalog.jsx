'use client';

import React, { useState, useMemo } from 'react';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  ShieldCheck, 
  Search, 
  X, 
  Filter, 
  CheckCircle2, 
  ChevronDown 
} from 'lucide-react';
import ProductCard from './ProductCard';
import { CATEGORIES, CERTIFICATIONS, BRANDS } from '../data/categories';

export default function ProductCatalog({
  products,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onOpenRfq,
  onAddToCart,
  comparedProductIds,
  onToggleCompare
}) {
  const [selectedCerts, setSelectedCerts] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [maxPrice, setMaxPrice] = useState(1600000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const toggleCert = (cert) => {
    setSelectedCerts(prev => 
      prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]
    );
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedCerts([]);
    setSelectedBrands([]);
    setMaxPrice(1600000);
    setInStockOnly(false);
    setSearchQuery('');
  };

  const filteredProducts = useMemo(() => {
    return products.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSku = item.sku.toLowerCase().includes(q);
        const matchesBrand = item.brand.toLowerCase().includes(q);
        const matchesDesc = item.shortDesc.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesBrand && !matchesDesc) {
          return false;
        }
      }
      if (selectedCerts.length > 0) {
        const hasAllCerts = selectedCerts.every(c => item.certifications.includes(c));
        if (!hasAllCerts) return false;
      }
      if (selectedBrands.length > 0) {
        if (!selectedBrands.includes(item.brand)) return false;
      }
      if (item.price > maxPrice) {
        return false;
      }
      if (inStockOnly && !item.stockStatus.toLowerCase().includes('in stock')) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [products, selectedCategory, searchQuery, selectedCerts, selectedBrands, maxPrice, inStockOnly, sortBy]);

  const hasActiveFilters = selectedCategory !== 'all' || 
    selectedCerts.length > 0 || 
    selectedBrands.length > 0 || 
    maxPrice < 1600000 || 
    inStockOnly || 
    searchQuery.trim().length > 0;

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <section id="catalog-section" className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Catalog Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md inline-block mb-1.5">
              Verified Hospital Equipment Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Biomedical Tech & Diagnostic Systems
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Direct institutional supply with factory calibration certificates, CDSCO documentation, and GST invoicing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl shadow-xs"
            >
              <Filter size={14} /> Filters {hasActiveFilters && '(Active)'}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-white border border-slate-300 px-3 py-2 rounded-xl text-xs shadow-xs">
              <span className="text-slate-400 font-semibold">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="featured">Featured / Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Clinical Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Pills Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl mb-6 shadow-xs text-xs">
            <span className="font-bold text-slate-500">Active Filters:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md font-semibold">
                Dept: {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                <button onClick={() => setSelectedCategory('all')} className="hover:text-blue-900"><X size={12} /></button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md font-semibold">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-blue-900"><X size={12} /></button>
              </span>
            )}
            {selectedCerts.map(cert => (
              <span key={cert} className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-md font-semibold">
                {cert}
                <button onClick={() => toggleCert(cert)}><X size={12} /></button>
              </span>
            ))}
            {selectedBrands.map(brand => (
              <span key={brand} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1 rounded-md font-semibold">
                {brand}
                <button onClick={() => toggleBrand(brand)}><X size={12} /></button>
              </span>
            ))}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md font-semibold">
                Ready Stock Only
                <button onClick={() => setInStockOnly(false)}><X size={12} /></button>
              </span>
            )}

            <button
              onClick={resetFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
            >
              <RotateCcw size={12} /> Reset All
            </button>
          </div>
        )}

        {/* Main Grid: Sidebar + Product Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar (3 Cols) */}
          <aside className={`lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6 ${
            mobileFilterOpen ? 'block fixed inset-0 z-50 overflow-y-auto p-6' : 'hidden lg:block lg:sticky lg:top-[156px] lg:self-start lg:max-h-[calc(100vh-175px)] lg:overflow-y-auto'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 font-extrabold text-slate-900 text-sm">
                <SlidersHorizontal size={17} className="text-blue-600" />
                <span>Filters & Specifications</span>
              </div>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="text-xs font-bold text-blue-600 hover:underline">
                  Reset
                </button>
              )}
              {mobileFilterOpen && (
                <button onClick={() => setMobileFilterOpen(false)} className="lg:hidden p-1 text-slate-500">
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Department Categories */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Medical Specialty
              </div>
              <div className="space-y-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition text-left ${
                      selectedCategory === cat.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="text-[11px] text-slate-400 font-semibold shrink-0 ml-1">
                      {cat.itemCount}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Regulatory Certifications */}
            <div className="pt-4 border-t border-slate-100">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Certifications
              </div>
              <div className="space-y-2">
                {CERTIFICATIONS.map(cert => (
                  <label key={cert} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCerts.includes(cert)}
                      onChange={() => toggleCert(cert)}
                      className="rounded text-blue-600 focus:ring-blue-400 w-3.5 h-3.5"
                    />
                    <span>{cert}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="pt-4 border-t border-slate-100">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Equipment Brand
              </div>
              <div className="space-y-2">
                {BRANDS.map(brand => (
                  <label key={brand} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="rounded text-blue-600 focus:ring-blue-400 w-3.5 h-3.5"
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>



            {/* Ready Stock Checkbox */}
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-400 w-4 h-4"
                />
                <span>Ready Stock Immediate Dispatch Only</span>
              </label>
            </div>

            {/* Sidebar Promo Card (Light Medical Theme) */}
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-200/80 p-4 rounded-xl text-xs space-y-2">
              <div className="font-extrabold text-blue-900 uppercase tracking-wide">
                Hospital Rate Contracts
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Planning a new 50-bed ICU or Cath Lab expansion? Consult our senior biomedical engineers.
              </p>
              <button onClick={() => onOpenRfq()} className="btn-rfq-teal w-full text-xs py-2 shadow-xs">
                Request Rate Contract
              </button>
            </div>
          </aside>

          {/* Product Grid Area (9 Cols) */}
          <main className="lg:col-span-9 flex flex-col">
            {/* Results count bar */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pb-2 border-b border-slate-200">
              <div>
                Showing <strong className="text-slate-900 font-extrabold">{filteredProducts.length}</strong> certified biomedical systems
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold hidden sm:flex">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>All items include factory calibration test sheets</span>
              </div>
            </div>

            {/* Product Cards Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenRfq={onOpenRfq}
                    onAddToCart={onAddToCart}
                    isCompared={comparedProductIds.includes(product.id)}
                    onToggleCompare={onToggleCompare}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-3">
                <Search size={44} className="text-slate-300" />
                <h3 className="text-lg font-bold text-slate-800">No Medical Devices Found</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md">
                  Try clearing some filter criteria or search for terms like Ventilator, Monitor, C-Arm, ECG, or ICU Bed.
                </p>
                <button onClick={resetFilters} className="btn-primary-blue text-xs mt-2">
                  <RotateCcw size={14} /> Reset All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}
