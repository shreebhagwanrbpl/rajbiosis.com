'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import { PRODUCTS } from '../../data/products';
import { CATEGORIES } from '../../data/categories';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  PackageOpen,
  Filter,
  MapPin
} from 'lucide-react';
import { getActiveDistrict, USER_PROFILE_EVENT } from '../../utils/userProfile';

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('cat') || 'all';
  const dealParam = searchParams.get('deal') || searchParams.get('filter') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(dealParam === 'offers' || dealParam === 'best' ? 'discount' : 'featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [district, setDistrict] = useState('Jaipur');

  const ITEMS_PER_PAGE = 8; // High performance pagination for thousands of products

  useEffect(() => {
    setDistrict(getActiveDistrict());

    const handleProfileUpdate = (e) => {
      if (e && e.detail && e.detail.district) {
        setDistrict(e.detail.district);
      } else {
        setDistrict(getActiveDistrict());
      }
    };

    window.addEventListener(USER_PROFILE_EVENT, handleProfileUpdate);
    return () => window.removeEventListener(USER_PROFILE_EVENT, handleProfileUpdate);
  }, []);

  useEffect(() => {
    if (initialQuery) setSearchQuery(initialQuery);
    if (initialCategory) setSelectedCategory(initialCategory);
    if (dealParam === 'offers' || dealParam === 'best') setSortBy('discount');
  }, [initialQuery, initialCategory, dealParam]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  // Filter & Sort Pipeline
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) ||
             p.sku.toLowerCase().includes(q) ||
             (p.brand && p.brand.toLowerCase().includes(q)) ||
             p.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'discount') {
      result.sort((a, b) => ((b.mrp - b.price) / b.mrp) - ((a.mrp - a.price) / a.mrp));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [searchQuery, selectedCategory, sortBy]);

  // Pagination calculation
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('featured');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900 antialiased">
      <Header />

      {/* Breadcrumbs & Header Bar */}
      <div className="bg-white border-b border-neutral-200 py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
            <Link href="/" className="hover:text-brand-600 transition">Home</Link>
            <span>/</span>
            <span className="text-neutral-900 font-semibold">Equipment Catalogue</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                Biomedical Equipment Catalogue
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Showing {totalItems} verified hospital life-support, diagnostic, and surgical equipment items.
              </p>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className={`lg:hidden text-xs py-2 self-start flex items-center gap-1.5 px-3 rounded-xl border font-semibold transition ${
                mobileFilterOpen
                  ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                  : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              {mobileFilterOpen ? <X size={14} /> : <Filter size={14} />}
              <span>{mobileFilterOpen ? 'Close Filters' : 'Filters & Categories'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Sidebar: Filters & Categories (Desktop Sticky) */}
          <aside
            className={`lg:col-span-1 ${
              mobileFilterOpen ? 'block' : 'hidden'
            } lg:block lg:sticky lg:top-[156px] lg:self-start lg:max-h-[calc(100vh-175px)] lg:overflow-y-auto lg:overscroll-contain pr-1 space-y-6`}
          >
            
            {/* Search Input Box */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
              <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider block mb-2">
                Search Catalogue
              </label>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Device name, SKU..."
                  className="w-full pl-9 pr-8 py-2 bg-neutral-50 text-xs rounded-xl border border-neutral-200 focus:border-brand-500 focus:bg-white outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Clinical Categories
                </label>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-[11px] font-semibold text-brand-600 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                    selectedCategory === 'all'
                      ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[10px] font-mono text-neutral-400">({PRODUCTS.length})</span>
                </button>

                {CATEGORIES.filter(c => c.id !== 'all').map((cat) => {
                  const count = PRODUCTS.filter(p => p.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                        selectedCategory === cat.id
                          ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      <span className="text-[10px] font-mono text-neutral-400 shrink-0">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Procurement Information Box */}
            <div className="p-4 bg-neutral-100 rounded-2xl border border-neutral-200 text-xs text-neutral-700 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-neutral-950 text-xs">Need Institutional Tender Bids?</div>
                <span className="text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded">
                  {district} Hub
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-neutral-700 font-medium">
                Raj Biosis Pvt. Ltd. provides GeM-registered documentation, NABL calibration, and volume tier pricing directly for <strong className="text-neutral-900">{district}</strong> healthcare institutions.
              </p>
              <Link
                href="/contact"
                className="text-brand-600 font-bold hover:underline block text-xs"
              >
                Contact Institutional Sales &rarr;
              </Link>
            </div>

          </aside>

          {/* Right Product Grid Area (3 Cols) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Top Results & Sort Control Bar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-neutral-700 font-medium">
                Showing <span className="font-bold text-neutral-950">{totalItems === 0 ? 0 : startIndex + 1}</span> to <span className="font-bold text-neutral-950">{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</span> of <span className="font-bold text-neutral-950">{totalItems}</span> products
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-neutral-400 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 font-semibold text-neutral-800 text-xs outline-none focus:border-brand-500"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Product Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                  <PackageOpen size={30} />
                </div>
                <h3 className="text-base font-bold text-neutral-900">
                  No medical equipment found matching your criteria
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Try adjusting your search terms or clearing the selected category filter to see available equipment.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="btn-primary-red text-xs py-2 px-5"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-outline-neutral text-xs py-2 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                        currentPage === pageNum
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-outline-neutral text-xs py-2 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 flex items-center justify-center text-xs font-semibold text-neutral-400">Loading catalogue...</div>}>
      <ProductsCatalogContent />
    </Suspense>
  );
}
