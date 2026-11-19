'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  PhoneCall,
  FileText,
  Menu,
  X,
  ChevronDown,
  HeartPulse,
  ArrowRight,
  Layers,
  Flame,
  Sparkles,
  Tag,
  Zap,
  User,
  ShieldCheck,
  MapPin,
  ShoppingCart,
  CheckCircle2,
  Camera,
  LogOut,
  Edit3,
  Building2,
  Mail,
  Phone,
  Trash2,
  Lock,
  Clock,
  Truck,
  Award,
  Heart,
  Radio,
  Scissors,
  Activity,
  Bed,
  ShieldAlert
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products';
import { fetchLiveProductsFromAdmin } from '../utils/adminSync';
import { getActiveDistrict, saveUserProfile, clearUserProfile, saveActiveDistrict } from '../utils/userProfile';
import { getCartCount, openCartDrawer, CART_UPDATED_EVENT } from '../utils/cart';
import { getWishlistCount, WISHLIST_UPDATED_EVENT } from '../utils/wishlist';
import { BRAND_LOGOS } from '../data/brands';
import { DEFAULT_COUNTRY_CODE } from '../data/internationalCodes';
import { RAJASTHAN_DISTRICTS } from '../data/districts';
import CountryCodeSelector from './CountryCodeSelector';

const QUICK_AVATARS = [
  { id: 'doc-m', icon: '👨‍⚕️', label: 'Doctor' },
  { id: 'doc-f', icon: '👩‍⚕️', label: 'Surgeon' },
  { id: 'admin', icon: '👔', label: 'Admin' },
  { id: 'engineer', icon: '🔬', label: 'Biomedical' },
  { id: 'clinic', icon: '🏥', label: 'Clinic' },
  { id: 'icu', icon: '🩺', label: 'Specialist' }
];

export default function Header({ onOpenQuoteModal }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [activeDistrict, setActiveDistrictState] = useState('Jaipur');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [liveProductList, setLiveProductList] = useState(PRODUCTS);
  const [topBarSettings, setTopBarSettings] = useState({
    enabled: true,
    showBestDeals: true,
    bestDealsText: 'Best Deals',
    bestDealsBadge: 'Up to 35% Off',
    bestDealsLink: '/deals?tab=best-deals',

    showSpecialOffers: true,
    specialOffersText: 'Special Offers',
    specialOffersBadge: 'HOT',
    specialOffersLink: '/deals?tab=special-offers',

    showNewArrivals: true,
    newArrivalsText: 'New Arrivals',
    newArrivalsBadge: '2026',
    newArrivalsLink: '/deals?tab=new-arrivals',

    showDeliveryHub: true,
    deliveryHubLabel: 'Delivering to:',

    showSupportHelpline: true,
    supportLabel: '24x7 Support:',
    supportPhone: '9983333469'
  });

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const categoriesTimeoutRef = useRef(null);

  const handleCategoriesEnter = () => {
    if (categoriesTimeoutRef.current) clearTimeout(categoriesTimeoutRef.current);
    setCategoriesOpen(true);
  };

  const handleCategoriesLeave = () => {
    if (categoriesTimeoutRef.current) clearTimeout(categoriesTimeoutRef.current);
    categoriesTimeoutRef.current = setTimeout(() => {
      setCategoriesOpen(false);
    }, 220);
  };

  useEffect(() => {
    fetchLiveProductsFromAdmin().then(data => {
      if (data && Array.isArray(data) && data.length > 0) {
        setLiveProductList(data);
      }
    }).catch(() => { });
  }, []);

  // Dynamic Top Announcement & Utility Bar Sync (Live from MultiTaskingAdmin & MongoDB)
  useEffect(() => {
    // 1. Initial cached state from localStorage for instantaneous 0ms paint
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('rajbiosis_top_bar_settings');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object') {
            setTopBarSettings(prev => ({ ...prev, ...parsed }));
          }
        }
      } catch (_) {}
    }

    // 2. Fetch fresh dynamic settings from API route
    const fetchTopBarSettings = async () => {
      try {
        const res = await fetch('/api/website/homepage?domain=rajbiosis.com');
        const json = await res.json();
        if (json.success && json.data?.topBarSettings) {
          const fresh = json.data.topBarSettings;
          setTopBarSettings(prev => ({ ...prev, ...fresh }));
          try {
            localStorage.setItem('rajbiosis_top_bar_settings', JSON.stringify(fresh));
          } catch (_) {}
        }
      } catch (err) {
        // Fallback to direct Admin Hub API if running locally
        try {
          const directRes = await fetch('http://localhost:3002/api/website/homepage?domain=rajbiosis.com');
          const directJson = await directRes.json();
          if (directJson.success && directJson.data?.topBarSettings) {
            const fresh = directJson.data.topBarSettings;
            setTopBarSettings(prev => ({ ...prev, ...fresh }));
            try {
              localStorage.setItem('rajbiosis_top_bar_settings', JSON.stringify(fresh));
            } catch (_) {}
          }
        } catch (_) {}
      }
    };
    fetchTopBarSettings();

    // 3. Real-time Cross-Tab BroadcastChannel listener (Instant wake-up upon admin save)
    let channel;
    if (typeof window !== 'undefined') {
      try {
        channel = new BroadcastChannel('rajbiosis_config_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'TOP_BAR_SETTINGS_UPDATED' && event.data.settings) {
            const updated = event.data.settings;
            setTopBarSettings(prev => ({ ...prev, ...updated }));
            try {
              localStorage.setItem('rajbiosis_top_bar_settings', JSON.stringify(updated));
            } catch (_) {}
          }
        };
      } catch (_) {}
    }

    return () => {
      if (channel) {
        try { channel.close(); } catch (_) {}
      }
    };
  }, []);

  // Sync user profile, active district, and cart count from localStorage
  useEffect(() => {
    setMounted(true);

    const syncCart = () => {
      setCartCount(getCartCount());
    };
    syncCart();

    const syncWishlist = () => {
      setWishlistCount(getWishlistCount());
    };
    syncWishlist();

    const syncProfile = () => {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('rajbiosis_user_profile');
          if (stored) {
            const parsed = JSON.parse(stored);
            setUserProfile(parsed);
            if (parsed.district) setActiveDistrictState(parsed.district);
          } else {
            setUserProfile(null);
            const dist = getActiveDistrict();
            setActiveDistrictState(dist);
          }
        } catch (e) {
          setUserProfile(null);
          setActiveDistrictState(getActiveDistrict());
        }
      }
    };

    syncProfile();

    // Aggressively prefetch core routes in background for instant zero-latency navigation
    try {
      router.prefetch('/profile');
      router.prefetch('/products');
      router.prefetch('/about');
      router.prefetch('/contact');
      router.prefetch('/wishlist');
      router.prefetch('/deals');
    } catch (_) { }

    const handleProfileUpdate = (e) => {
      if (e && e.detail) {
        setUserProfile(e.detail);
        if (e.detail.district) {
          setActiveDistrictState(e.detail.district);
        }
      } else {
        syncProfile();
      }
    };

    const handleOpenProfile = () => {
      router.push('/profile');
    };

    const handleOpenQuickForm = () => {
      router.push('/profile');
    };

    const handleDistrictChange = (e) => {
      if (e && e.detail) {
        setActiveDistrictState(e.detail);
      }
    };

    window.addEventListener('user-profile-updated', handleProfileUpdate);
    window.addEventListener('active-district-changed', handleDistrictChange);
    window.addEventListener('open-profile-modal', handleOpenProfile);
    window.addEventListener('open-profile-quick-form', handleOpenQuickForm);
    window.addEventListener(CART_UPDATED_EVENT, syncCart);
    window.addEventListener(WISHLIST_UPDATED_EVENT, syncWishlist);

    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
      window.removeEventListener('active-district-changed', handleDistrictChange);
      window.removeEventListener('open-profile-modal', handleOpenProfile);
      window.removeEventListener('open-profile-quick-form', handleOpenQuickForm);
      window.removeEventListener(CART_UPDATED_EVENT, syncCart);
      window.removeEventListener(WISHLIST_UPDATED_EVENT, syncWishlist);
    };
  }, [router]);

  const handleOpenDeals = (e) => {
    if (e) e.preventDefault();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-best-deals'));
    }
  };

  const handleOpenNewArrivals = (e) => {
    if (e) e.preventDefault();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-new-arrivals'));
    }
  };

  // Close search suggestions & category dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearching(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCategoriesOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsSearching(false);
        setCategoriesOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle instant search matching
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 1) {
      const q = query.toLowerCase();
      const filtered = liveProductList.filter(
        p => (p.name && p.name.toLowerCase().includes(q)) ||
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      ).slice(0, 6);
      setSearchResults(filtered);
      setIsSearching(true);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(false);
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm transition-all">
        {/* Action Bar: Dynamic Best Deals, Special Offers, New Arrivals, Regional Depot, 24x7 Helpline */}
        {topBarSettings.enabled !== false && (
          <div className="bg-slate-50 text-slate-700 text-[11px] sm:text-xs py-1.5 sm:py-2 border-b border-slate-200/80 shadow-2xs">
            <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">

              {/* Mobile Action Bar (< 640px): 100% Responsive, Zero Cutoff */}
              <div className="flex sm:hidden items-center justify-between gap-1.5 w-full">
                {topBarSettings.showBestDeals !== false && (
                  <Link
                    href={topBarSettings.bestDealsLink || "/deals?tab=best-deals"}
                    prefetch={true}
                    onMouseEnter={() => router.prefetch('/deals')}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] transition-all shadow-xs shrink-0 animate-pulse"
                    title="Click to view all best deals"
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                    </span>
                    <Flame size={11} className="fill-white text-white" />
                    <span>{topBarSettings.bestDealsText || 'Deals'}</span>
                    {topBarSettings.bestDealsBadge && (
                      <span className="bg-white/20 text-[9px] px-1 py-0.2 rounded font-mono font-bold">
                        {topBarSettings.bestDealsBadge}
                      </span>
                    )}
                  </Link>
                )}

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Delivery Hub Button */}
                  {topBarSettings.showDeliveryHub !== false && (
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('open-location-modal'));
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200 text-[10px] font-bold shadow-2xs group cursor-pointer"
                      title={`Active Regional Depot: ${mounted ? activeDistrict : 'Jaipur'}`}
                      suppressHydrationWarning
                    >
                      <MapPin size={10} className="text-brand-600 shrink-0" />
                      <span className="text-brand-700 font-extrabold max-w-[65px] truncate" suppressHydrationWarning>
                        {mounted ? activeDistrict : 'Jaipur'}
                      </span>
                      <span className="text-[8px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-mono">
                        &bull;
                      </span>
                    </button>
                  )}

                  {/* 24x7 Helpline Call */}
                  {topBarSettings.showSupportHelpline !== false && (
                    <a
                      href={`tel:${(topBarSettings.supportPhone || '9983333469').replace(/\D/g, '')}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white hover:bg-red-50 text-slate-800 hover:text-red-600 border border-slate-200 text-[10px] font-bold shadow-2xs transition-colors shrink-0 cursor-pointer"
                      title={`Direct Support: ${topBarSettings.supportPhone || '9983333469'}`}
                    >
                      <PhoneCall size={10} className="text-red-600 stroke-[2.5]" />
                      <span className="font-mono text-slate-900">{topBarSettings.supportPhone || '9983333469'}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Tablet & Desktop Action Bar (sm and up) */}
              <div className="hidden sm:flex items-center justify-between gap-4 overflow-x-auto scrollbar-none py-0.5">
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  {/* 1. Best Deals */}
                  {topBarSettings.showBestDeals !== false && (
                    <Link
                      href={topBarSettings.bestDealsLink || "/deals?tab=best-deals"}
                      prefetch={true}
                      onMouseEnter={() => router.prefetch('/deals')}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] sm:text-[11px] transition-all shadow-xs cursor-pointer shrink-0 animate-pulse hover:shadow-sm"
                      title="Click to view all best deals on our dedicated deals page"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      <Flame size={12} className="fill-white text-white" />
                      <span>{topBarSettings.bestDealsText || 'Best Deals'}</span>
                      {topBarSettings.bestDealsBadge && (
                        <span className="bg-white/20 text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold">
                          {topBarSettings.bestDealsBadge}
                        </span>
                      )}
                    </Link>
                  )}

                  {/* 2. Special Offers */}
                  {topBarSettings.showSpecialOffers !== false && (
                    <Link
                      href={topBarSettings.specialOffersLink || "/deals?tab=special-offers"}
                      prefetch={true}
                      onMouseEnter={() => router.prefetch('/deals')}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 font-bold text-[10px] sm:text-[11px] transition-all cursor-pointer shrink-0 animate-pulse shadow-2xs"
                      title="Click to view bulk & special offers"
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-80"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-600"></span>
                      </span>
                      <Tag size={12} className="text-amber-600" />
                      <span>{topBarSettings.specialOffersText || 'Special Offers'}</span>
                      {topBarSettings.specialOffersBadge && (
                        <span className="bg-amber-200/90 text-amber-950 text-[9px] px-1.5 py-0.5 rounded-full font-mono font-extrabold">
                          {topBarSettings.specialOffersBadge}
                        </span>
                      )}
                    </Link>
                  )}

                  {/* 3. New Arrivals */}
                  {topBarSettings.showNewArrivals !== false && (
                    <Link
                      href={topBarSettings.newArrivalsLink || "/deals?tab=new-arrivals"}
                      prefetch={true}
                      onMouseEnter={() => router.prefetch('/deals')}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300/80 font-bold text-[10px] sm:text-[11px] transition-all cursor-pointer shrink-0 animate-pulse shadow-2xs"
                      title="Click to view 2026 new arrivals"
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-80"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
                      </span>
                      <Sparkles size={12} className="text-emerald-600" />
                      <span>{topBarSettings.newArrivalsText || 'New Arrivals'}</span>
                      {topBarSettings.newArrivalsBadge && (
                        <span className="bg-emerald-200/90 text-emerald-950 text-[9px] px-1.5 py-0.5 rounded-full font-mono font-extrabold">
                          {topBarSettings.newArrivalsBadge}
                        </span>
                      )}
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* 4. Active District Delivery Hub Badge */}
                  {topBarSettings.showDeliveryHub !== false && (
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('open-location-modal'));
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-200/90 font-bold text-[10px] sm:text-[11px] transition-all cursor-pointer shrink-0 shadow-2xs group"
                      title={`Active Regional Depot: ${mounted ? activeDistrict : 'Jaipur'} (Click to change location or view branch office)`}
                      suppressHydrationWarning
                    >
                      <MapPin size={12} className="text-brand-600 shrink-0" />
                      <span className="text-slate-500 font-medium">{topBarSettings.deliveryHubLabel || 'Delivering to:'}</span>
                      <span className="text-brand-700 font-extrabold" suppressHydrationWarning>{mounted ? activeDistrict : 'Jaipur'}</span>
                      <span className="text-[9px] bg-slate-100 group-hover:bg-brand-50 text-slate-600 group-hover:text-brand-700 px-1.5 py-0.5 rounded font-mono font-semibold">
                        Change
                      </span>
                    </button>
                  )}

                  {/* 5. Helpline styled as a Premium Card */}
                  {topBarSettings.showSupportHelpline !== false && (
                    <a
                      href={`tel:${(topBarSettings.supportPhone || '9983333469').replace(/\D/g, '')}`}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white hover:bg-red-50 text-slate-800 hover:text-red-600 border border-slate-200 hover:border-red-300 shadow-2xs hover:shadow-xs transition-all font-semibold text-xs group cursor-pointer shrink-0"
                      title={`Call Direct Support: ${topBarSettings.supportPhone || '9983333469'}`}
                    >
                      <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
                        <PhoneCall size={11} className="stroke-[2.5]" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-medium">{topBarSettings.supportLabel || '24x7 Support:'}</span>
                        <span className="font-bold font-mono tracking-tight text-slate-900 group-hover:text-red-600">
                          {topBarSettings.supportPhone || '9983333469'}
                        </span>
                      </div>
                    </a>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Main Header Container */}
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 relative" ref={dropdownRef}>
          <div className="flex items-center justify-between h-14 sm:h-20 md:h-24 gap-2 sm:gap-4 py-1.5 sm:py-2">

            {/* Brand Identity: Official Logo Image (Responsive Size: Compact on mobile, grand on desktop) */}
            <Link href="/" prefetch={true} onMouseEnter={() => router.prefetch('/')} className="flex items-center shrink-0 group py-0.5">
              <img
                src="/logo.png"
                alt="Raj Biosis Private Limited"
                className="h-9 sm:h-14 md:h-18 lg:h-20 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden md:block flex-1 max-w-md relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery.trim().length > 1 && setIsSearching(true)}
                  placeholder="Search 1,169 products, reagents, SKU..."
                  className="w-full pl-10 pr-4 py-2 bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white text-xs sm:text-sm text-neutral-800 font-medium rounded-xl border border-neutral-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-neutral-400"
                />
              </form>

              {/* Instant Search Results Dropdown */}
              {isSearching && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden z-50">
                  <div className="p-2 border-b border-neutral-100 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Product Matches ({searchResults.length})
                  </div>
                  <div className="divide-y divide-neutral-100 max-h-72 overflow-y-auto">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        prefetch={true}
                        onMouseEnter={() => router.prefetch(`/product/${product.id}`)}
                        onClick={() => setIsSearching(false)}
                        className="p-2.5 hover:bg-neutral-50 flex items-center gap-3 transition"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 object-contain rounded-lg bg-neutral-100 p-1 border border-neutral-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-neutral-900 truncate">{product.name}</div>
                          <div className="text-xs text-neutral-500 font-mono">SKU: {product.sku}</div>
                        </div>
                        <div className="text-[11px] font-semibold text-neutral-500 shrink-0">
                          Price on Request
                        </div>
                      </Link>
                    ))}
                  </div>
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full py-2 bg-neutral-50 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 text-center border-t border-neutral-100 block"
                  >
                    View All Search Results &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              <Link
                href="/products"
                prefetch={true}
                onMouseEnter={() => router.prefetch('/products')}
                className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-neutral-700 hover:text-brand-600 hover:bg-neutral-100 transition"
              >
                All Products
              </Link>

              {/* Categories Link: Hover to reveal top 15 mega-panel, Click to go to /categories */}
              <div>
                <Link
                  href="/categories"
                  prefetch={true}
                  onMouseEnter={handleCategoriesEnter}
                  onMouseLeave={handleCategoriesLeave}
                  onClick={() => setCategoriesOpen(false)}
                  className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-1 cursor-pointer ${categoriesOpen
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-neutral-700 hover:text-brand-600 hover:bg-neutral-100'
                    }`}
                >
                  <span>Categories</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
                </Link>
              </div>

              <Link
                href="/about"
                prefetch={true}
                onMouseEnter={() => router.prefetch('/about')}
                className="px-3.5 py-2 rounded-lg text-xs font-bold text-neutral-700 hover:text-brand-600 hover:bg-neutral-100 transition"
              >
                About
              </Link>

              <Link
                href="/contact"
                prefetch={true}
                onMouseEnter={() => router.prefetch('/contact')}
                className="px-3.5 py-2 rounded-lg text-xs font-bold text-neutral-700 hover:text-brand-600 hover:bg-neutral-100 transition"
              >
                Contact
              </Link>
            </nav>

            {/* Right Action Hub: On mobile, ONLY Wishlist + Cart + Request Quote are shown */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Direct Profile Link: Hidden on mobile (< sm), visible on tablet & desktop (sm+) */}
              <Link
                href="/profile"
                prefetch={true}
                onMouseEnter={() => router.prefetch('/profile')}
                onClick={(e) => {
                  if (typeof window !== 'undefined' && window.location.pathname === '/profile') {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent('switch-to-profile-view'));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition shadow-2xs text-[#172033] hover:text-[#E8242A] bg-white hover:bg-slate-50 border-[#E2E8F0] cursor-pointer shrink-0"
                id="navbar-profile-btn"
                title={mounted && userProfile?.fullName ? `${userProfile.fullName} (${activeDistrict})` : 'Healthcare Profile'}
                suppressHydrationWarning
              >
                <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-100 border border-[#E2E8F0] text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {mounted && userProfile?.photo ? (
                    <img src={userProfile.photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={12} className="text-slate-600" />
                  )}
                </div>
                <span className="flex text-[#172033] font-semibold items-center gap-1" suppressHydrationWarning>
                  {mounted && userProfile?.fullName ? (
                    <>
                      <span className="font-bold truncate max-w-[85px] inline-block align-bottom">
                        {userProfile.fullName.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-[#E8242A] font-medium hidden md:inline">
                        • {activeDistrict}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>Profile</span>
                      <span className="text-[10px] text-[#E8242A] font-medium hidden md:inline">
                        ({mounted ? activeDistrict : 'Jaipur'})
                      </span>
                    </>
                  )}
                </span>
              </Link>

              {/* 1. Equipment Wishlist Button */}
              <Link
                href="/wishlist"
                prefetch={true}
                onMouseEnter={() => router.prefetch('/wishlist')}
                className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-slate-700 hover:text-red-600 bg-white hover:bg-slate-50 border border-slate-200 transition shadow-2xs group cursor-pointer shrink-0"
                title="Saved Equipment Wishlist"
                id="navbar-wishlist-btn"
              >
                <Heart
                  size={16}
                  className={`transition-colors ${mounted && wishlistCount > 0
                    ? 'fill-red-600 text-red-600'
                    : 'text-slate-700 group-hover:text-red-600'
                    }`}
                />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-[9px] font-black h-4 min-w-[16px] px-1 flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* 2. Shopping Cart Button with Dynamic Live Badge */}
              <button
                type="button"
                onClick={() => openCartDrawer()}
                className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition shadow-2xs group cursor-pointer shrink-0"
                title="View Selected Equipment & Cart"
                id="navbar-cart-btn"
              >
                <ShoppingCart size={16} className="text-slate-700 group-hover:text-red-600 transition-colors" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-[9px] font-black h-4 min-w-[16px] px-1 flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* 3. Direct Institutional Enquiry CTA - Request Quote */}
              <Link
                href="/contact"
                prefetch={true}
                onMouseEnter={() => router.prefetch('/contact')}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 transition shadow-xs shrink-0 cursor-pointer"
              >
                <FileText size={14} className="shrink-0" />
                <span>Request Quote</span>
              </Link>

              {/* Menu Button: Hidden on mobile (< sm), visible only on tablet (sm to lg) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="hidden sm:block lg:hidden p-1.5 sm:p-2 rounded-xl text-neutral-700 hover:bg-neutral-100 transition shrink-0 cursor-pointer"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar + Instant Results */}
          <div className="md:hidden pb-2.5 pt-0.5 relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.trim().length > 1 && setIsSearching(true)}
                placeholder="Search 1,169 products, reagents..."
                className="w-full pl-8 pr-7 py-1.5 bg-neutral-100/90 text-xs text-neutral-900 rounded-xl border border-neutral-200 focus:border-brand-500 focus:bg-white outline-none transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsSearching(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </form>

            {/* Instant Search Results Dropdown on Mobile */}
            {isSearching && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-neutral-200 shadow-xl overflow-hidden z-50">
                <div className="p-2 border-b border-neutral-100 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Matches ({searchResults.length})
                </div>
                <div className="divide-y divide-neutral-100 max-h-56 overflow-y-auto">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      prefetch={true}
                      onClick={() => setIsSearching(false)}
                      className="p-2 hover:bg-neutral-50 flex items-center gap-2.5 transition"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-8 h-8 object-contain rounded-lg bg-neutral-100 p-1 border border-neutral-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-neutral-900 truncate">{product.name}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">SKU: {product.sku}</div>
                      </div>
                    </Link>
                  ))}
                </div>
                <button
                  onClick={handleSearchSubmit}
                  className="w-full py-2 bg-neutral-50 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 text-center border-t border-neutral-100 block"
                >
                  View All Results &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Full-Wide Categories Mega-Panel (Top 15 Categories on Hover, View All Button) */}
          {categoriesOpen && (
            <div
              onMouseEnter={handleCategoriesEnter}
              onMouseLeave={handleCategoriesLeave}
              className="hidden lg:block absolute left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8 top-full mt-1.5 bg-white rounded-2xl border border-neutral-200/90 shadow-2xl p-4 sm:p-5 z-50 animate-scale-in"
            >
              {/* Top Bar with Counter & View All Button */}
              <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-600"></span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    Popular Categories &amp; Divisions
                  </span>

                </div>

                <Link
                  href="/categories"
                  prefetch={true}
                  onClick={() => setCategoriesOpen(false)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-xs cursor-pointer group"
                >
                  <span>View All {CATEGORIES.filter(c => c.id !== 'all').length} Categories</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Wide 5-Column Grid: Exactly Top 15 Categories (3 rows x 5 columns) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-2 text-xs">
                {CATEGORIES.filter(c => c.id !== 'all').slice(0, 15).map((cat) => (
                  <Link
                    key={cat.slug || cat.id}
                    href={`/category/${cat.slug || cat.id}`}
                    prefetch={true}
                    onMouseEnter={() => router.prefetch(`/category/${cat.slug || cat.id}`)}
                    onClick={() => setCategoriesOpen(false)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-brand-600 hover:bg-brand-50/50 border border-slate-100 hover:border-brand-200 transition truncate flex items-center justify-between group"
                    title={cat.name}
                  >
                    <span className="truncate group-hover:translate-x-0.5 transition-transform">{cat.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono ml-1.5 shrink-0 group-hover:text-brand-600">({cat.itemCount || 0})</span>
                  </Link>
                ))}
              </div>

              {/* Bottom Bar: Direct View All Call-to-Action */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px] font-medium hidden sm:inline">
                  Certified Clinical Healthcare &bull; OEM Laboratory Reagents
                </span>

              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-neutral-200 px-4 pt-2 pb-6 space-y-3">
            {/* Clean Light Mobile Profile Card */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {userProfile?.photo ? (
                      <img src={userProfile.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={14} className="text-slate-600" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {userProfile?.fullName || 'Hospital & User Profile'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {userProfile?.hospitalName || 'Verified Healthcare Procurement'}
                    </div>
                  </div>
                </div>
                <Link
                  href="/profile"
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold transition"
                >
                  {userProfile ? 'View' : 'Open'}
                </Link>
              </div>
            </div>

            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-2">Navigation</div>
            <Link
              href="/"
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
            >
              Home
            </Link>
            <Link
              href="/products"
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
            >
              All Products ({liveProductList.length})
            </Link>
            <Link
              href="/categories"
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-brand-600 bg-brand-50/60 hover:bg-brand-50 border border-brand-200/60"
            >
              <span>Explore All {CATEGORIES.filter(c => c.id !== 'all').length} Categories</span>
              <span className="text-xs font-mono font-bold">&rarr;</span>
            </Link>
            <Link
              href="/wishlist"
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
            >
              <div className="flex items-center gap-2">
                <Heart size={16} className={mounted && wishlistCount > 0 ? "fill-red-600 text-red-600" : "text-slate-600"} />
                <span>Saved Equipment Wishlist</span>
              </div>
              {mounted && wishlistCount > 0 && (
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <div className="pt-2 border-t border-neutral-100">
              <div className="flex items-center justify-between px-2 mb-1.5">
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Top Categories</div>
                <Link
                  href="/categories"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[11px] font-bold text-brand-600 hover:underline"
                >
                  View All &rarr;
                </Link>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {CATEGORIES.filter(c => c.id !== 'all').slice(0, 15).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.id}`}
                    prefetch={true}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center justify-between"
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="text-[10px] text-neutral-400 font-mono shrink-0 ml-2">({cat.itemCount})</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100 space-y-1">
              <Link
                href="/about"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
              >
                About Raj Biosis Pvt. Ltd.
              </Link>
              <Link
                href="/contact"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
              >
                Contact &amp; Institutional Sales
              </Link>
            </div>

            {/* Quick Support & Location in Drawer */}
            <div className="pt-3 border-t border-neutral-100 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('open-location-modal'));
                  }
                }}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold"
              >
                <MapPin size={13} className="text-brand-600" />
                <span className="truncate">{mounted ? activeDistrict : 'Jaipur'}</span>
              </button>
              <a
                href="tel:9983333469"
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-red-50 text-red-700 text-xs font-bold"
              >
                <PhoneCall size={13} className="text-red-600" />
                <span>9983333469</span>
              </a>
            </div>
          </div>
        )}
      </header>

    </>
  );
}
