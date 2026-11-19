'use client';

import React, { useState, useMemo, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import {
  Search,
  X,
  PackageOpen,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Loader2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { getActiveDistrict, USER_PROFILE_EVENT } from '../../utils/userProfile';
import { fetchLiveProductsFromAdmin } from '../../utils/adminSync';
import { slugifyCategory, extractCategoriesFromProducts } from '../../utils/categoryHelper';
import { PRODUCTS } from '../../data/products';

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('cat') || searchParams.get('category') || 'all';
  const dealParam = searchParams.get('deal') || searchParams.get('filter') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(dealParam === 'offers' || dealParam === 'best' ? 'discount' : 'featured');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [district, setDistrict] = useState('Jaipur');
  const [liveProducts, setLiveProducts] = useState(PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);

  // Instant Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState(16);
  const loadMoreRef = useRef(null);

  // Dynamic Header Height Measurement for Perfect Sticky Alignment
  const [headerHeight, setHeaderHeight] = useState(136);

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

  // Load products dynamically from Admin API
  useEffect(() => {
    let isMounted = true;
    async function loadAdminData() {
      setIsLoading(true);
      try {
        const adminData = await fetchLiveProductsFromAdmin();
        if (isMounted && adminData && Array.isArray(adminData) && adminData.length > 0) {
          setLiveProducts(adminData);
        }
      } catch (e) {
        console.warn('Failed to load dynamic products:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadAdminData();
    return () => { isMounted = false; };
  }, []);

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

  // Lock body scroll when categories drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(16);
  }, [searchQuery, selectedCategory, sortBy]);

  // Dynamically derive categories from loaded products
  const dynamicCategories = useMemo(() => {
    return extractCategoriesFromProducts(liveProducts);
  }, [liveProducts]);

  // Filter & Sort Pipeline
  const filteredProducts = useMemo(() => {
    let result = [...liveProducts];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        p => (p.name && p.name.toLowerCase().includes(q)) ||
             (p.title && p.title.toLowerCase().includes(q)) ||
             (p.sku && p.sku.toLowerCase().includes(q)) ||
             (p.brand && p.brand.toLowerCase().includes(q)) ||
             (p.category && p.category.toLowerCase().includes(q)) ||
             (p.shortDesc && p.shortDesc.toLowerCase().includes(q)) ||
             (p.desc && p.desc.toLowerCase().includes(q))
      );
    }

    // Category filter (support slug or exact name)
    if (selectedCategory && selectedCategory !== 'all') {
      const targetSlug = slugifyCategory(selectedCategory);
      result = result.filter(p => {
        const catSlug = slugifyCategory(p.category || '');
        return catSlug === targetSlug || p.category?.toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    // Sorting
    if (sortBy === 'name') {
      result.sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''));
    } else if (sortBy === 'category') {
      result.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
    }

    return result;
  }, [liveProducts, searchQuery, selectedCategory, sortBy]);

  const totalItems = filteredProducts.length;
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // Infinite scroll auto-loader
  useEffect(() => {
    if (visibleCount >= filteredProducts.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + 12, filteredProducts.length));
          }, 60);
        }
      },
      { rootMargin: '300px' }
    );

    const currentTarget = loadMoreRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [visibleCount, filteredProducts.length]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('featured');
    setVisibleCount(16);
    setSidebarOpen(false);
    setSidebarSearch('');
  };

  const handleSelectCategory = (catIdentifier) => {
    setSelectedCategory(catIdentifier);
    setSidebarOpen(false);
    setSidebarSearch('');
  };

  // Filter categories in drawer
  const filteredDrawerCategories = useMemo(() => {
    if (!sidebarSearch.trim()) return dynamicCategories;
    const q = sidebarSearch.toLowerCase().trim();
    return dynamicCategories.filter(cat => cat.name.toLowerCase().includes(q));
  }, [dynamicCategories, sidebarSearch]);

  const activeCategoryObj = dynamicCategories.find(
    c => c.id === selectedCategory || c.slug === selectedCategory || c.name.toLowerCase() === selectedCategory.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      <Header />

      {/* Sticky Top Control Bar (Flawless docking right underneath header) */}
      <div 
        className="sticky z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs py-2.5 sm:py-3 px-3 sm:px-6 lg:px-8 transition-all"
        style={{ top: `${headerHeight}px` }}
      >
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">

          {/* Left: "All Categories" Button + Showing Count */}
          <div className="flex items-center justify-between sm:justify-start gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-xs hover:shadow cursor-pointer shrink-0"
              title="Click to view and filter by 79 categories"
            >
              <LayoutGrid size={14} />
              <span>Browse Categories ({dynamicCategories.length})</span>
              <ChevronDown size={13} className="opacity-80" />
            </button>

            <div className="text-slate-600 text-[11px] sm:text-xs font-medium">
              Showing <span className="font-bold text-slate-950">{totalItems === 0 ? 0 : 1}</span> to <span className="font-bold text-slate-950">{Math.min(visibleCount, totalItems)}</span> of <span className="font-bold text-slate-950">{totalItems}</span> products
            </div>
          </div>

          {/* Right: Search Input Box + Sort Dropdown */}
          <div className="flex items-center gap-2.5 flex-1 sm:max-w-md md:max-w-lg justify-end">
            <div className="relative flex-1 min-w-[160px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, SKU, categories..."
                className="w-full pl-9 pr-7 py-2 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-xs text-slate-900 rounded-xl border border-slate-200 focus:border-brand-500 outline-none transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-2.5 py-2 font-semibold text-slate-800 text-xs outline-none focus:border-brand-500 cursor-pointer shrink-0"
            >
              <option value="featured">Featured First</option>
              <option value="name">Name (A-Z)</option>
              <option value="category">By Category</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-5">

        {/* Active Filter Pill Bar */}
        {(selectedCategory !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-500 font-medium">Active Filter:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-bold">
                <span>{activeCategoryObj?.name || selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="hover:text-brand-900 cursor-pointer"
                  title="Remove category filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                <span>Search: &quot;{searchQuery}&quot;</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-blue-900 cursor-pointer"
                  title="Remove search filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-brand-600 hover:underline font-bold text-xs ml-2 cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Product Grid */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500 text-xs font-semibold">
            <Loader2 size={28} className="animate-spin text-brand-600" />
            <span>Loading dynamic products from MultiTaskingAdmin...</span>
          </div>
        ) : visibleProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id || product.sku} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <PackageOpen size={30} />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No products found matching your criteria
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query or selecting a different category from the 79 available categories.
            </p>
            <button
              onClick={handleResetFilters}
              className="btn-primary-red text-xs py-2.5 px-6 cursor-pointer"
            >
              View All Products
            </button>
          </div>
        )}

        {/* Infinite Scroll Sentinel */}
        {visibleCount < totalItems && !isLoading && (
          <div
            ref={loadMoreRef}
            className="py-8 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs font-semibold"
          >
            <div className="flex items-center gap-2 text-brand-600">
              <Loader2 size={18} className="animate-spin" />
              <span>Loading more products...</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {totalItems - visibleCount} more items loading automatically
            </span>
          </div>
        )}

        {/* All Products Loaded Badge */}
        {visibleCount >= totalItems && totalItems > 0 && !isLoading && (
          <div className="pt-6 pb-2 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Showing all {totalItems} dynamic products from Raj Biosis</span>
            </div>
          </div>
        )}

      </div>

      {/* Slide-Over Categories Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 max-w-sm w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <LayoutGrid size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">79 Real Categories</h3>
                  <p className="text-[11px] text-slate-500">Derived live from product database</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
                aria-label="Close categories drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Category Search Input */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-200">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="Filter 79 categories..."
                  className="w-full pl-9 pr-7 py-2 bg-white text-xs text-slate-900 rounded-xl border border-slate-200 focus:border-brand-500 outline-none transition"
                />
                {sidebarSearch && (
                  <button
                    type="button"
                    onClick={() => setSidebarSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Clear category search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Categories List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              <button
                type="button"
                onClick={() => handleSelectCategory('all')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                  selectedCategory === 'all' && !searchQuery
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <LayoutGrid size={15} />
                  <span>All Products</span>
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  selectedCategory === 'all' && !searchQuery ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {liveProducts.length}
                </span>
              </button>

              <div className="pt-2 space-y-1.5">
                {filteredDrawerCategories.length > 0 ? (
                  filteredDrawerCategories.map((cat) => {
                    const isSelected = selectedCategory === cat.slug || selectedCategory === cat.name;
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => handleSelectCategory(cat.slug)}
                        className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? 'bg-brand-50 border-brand-300 text-brand-700 font-bold'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            {cat.image ? (
                              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <FolderOpen size={14} />
                              </div>
                            )}
                          </div>
                          <span className="text-xs truncate">{cat.name}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                          {cat.count}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    No categories found matching &quot;{sidebarSearch}&quot;.
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-slate-600 hover:text-brand-600 cursor-pointer"
              >
                Reset Filter
              </button>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="btn-primary-red py-1.5 px-4 text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-semibold text-slate-400">Loading dynamic catalogue...</div>}>
      <ProductsCatalogContent />
    </Suspense>
  );
}
