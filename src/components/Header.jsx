'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ShoppingCart
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products';
import { getActiveDistrict } from '../utils/userProfile';
import { getCartCount, openCartDrawer, CART_UPDATED_EVENT } from '../utils/cart';
import { BRAND_LOGOS } from '../data/brands';

export default function Header({ onOpenQuoteModal }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [activeDistrict, setActiveDistrictState] = useState('Jaipur');
  const [cartCount, setCartCount] = useState(0);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Sync user profile, active district, and cart count from localStorage
  useEffect(() => {
    const syncCart = () => {
      setCartCount(getCartCount());
    };
    syncCart();

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

    window.addEventListener('user-profile-updated', handleProfileUpdate);
    window.addEventListener('open-profile-modal', handleOpenProfile);
    window.addEventListener(CART_UPDATED_EVENT, syncCart);

    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
      window.removeEventListener('open-profile-modal', handleOpenProfile);
      window.removeEventListener(CART_UPDATED_EVENT, syncCart);
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

  // Close search suggestions & dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearching(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCategoriesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle instant search matching
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 1) {
      const q = query.toLowerCase();
      const filtered = PRODUCTS.filter(
        p => p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      ).slice(0, 5);
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm transition-all">
      {/* Action Bar: Best Deals, Special Offers, New Arrivals, Regional Depot, 24x7 Helpline */}
      <div className="bg-slate-50 text-slate-700 text-[11px] sm:text-xs py-2 border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none py-0.5">

          {/* 1. Best Deals with Blinking Pulse Badge (Inset slightly from left) */}
          <Link
            href="/deals?tab=best-deals"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] sm:text-[11px] transition-all shadow-xs cursor-pointer shrink-0 animate-pulse hover:shadow-sm"
            title="Click to view all best deals on our dedicated deals page"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <Flame size={12} className="fill-white text-white" />
            <span>Best Deals</span>
            <span className="hidden sm:inline bg-white/20 text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold">
              Up to 35% Off
            </span>
          </Link>

          {/* 2. Special Offers with Blinking Badge */}
          <Link
            href="/deals?tab=special-offers"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 font-bold text-[10px] sm:text-[11px] transition-all cursor-pointer shrink-0 animate-pulse shadow-2xs"
            title="Click to view bulk & special offers"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-600"></span>
            </span>
            <Tag size={12} className="text-amber-600" />
            <span>Special Offers</span>
            <span className="hidden sm:inline bg-amber-200/90 text-amber-950 text-[9px] px-1.5 py-0.5 rounded-full font-mono font-extrabold">
              HOT
            </span>
          </Link>

          {/* 3. New Arrivals with Blinking Badge */}
          <Link
            href="/deals?tab=new-arrivals"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300/80 font-bold text-[10px] sm:text-[11px] transition-all cursor-pointer shrink-0 animate-pulse shadow-2xs"
            title="Click to view 2026 new arrivals"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
            </span>
            <Sparkles size={12} className="text-emerald-600" />
            <span>New Arrivals</span>
            <span className="hidden sm:inline bg-emerald-200/90 text-emerald-950 text-[9px] px-1.5 py-0.5 rounded-full font-mono font-extrabold">
              2026
            </span>
          </Link>

          {/* 4. Active District Delivery Hub Badge */}
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-200/90 font-bold text-[10px] sm:text-[11px] transition-all cursor-pointer shrink-0 shadow-2xs group"
            title={`Active Regional Depot: ${activeDistrict} (Click to change district)`}
          >
            <MapPin size={12} className="text-brand-600 shrink-0" />
            <span className="text-slate-500 font-medium hidden sm:inline">Delivering to:</span>
            <span className="text-brand-700 font-extrabold">{activeDistrict}</span>
            <span className="text-[9px] bg-slate-100 group-hover:bg-brand-50 text-slate-600 group-hover:text-brand-700 px-1.5 py-0.5 rounded font-mono font-semibold">
              Change
            </span>
          </Link>

          {/* Admin Portal Access */}
          <Link
            href="/profile?tab=admin"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200/90 font-bold text-[10px] sm:text-[11px] transition-all cursor-pointer shrink-0 shadow-2xs"
            title="Authorized Administrator Access"
          >
            <ShieldCheck size={12} className="text-brand-600 shrink-0" />
            <span>Admin Portal</span>
          </Link>

          {/* 5. Helpline styled as a Premium Card (Aligned with Request Quote) */}
          <a
            href="tel:9983333469"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white hover:bg-red-50 text-slate-800 hover:text-red-600 border border-slate-200 hover:border-red-300 shadow-2xs hover:shadow-xs transition-all font-semibold text-xs group cursor-pointer shrink-0"
            title="Call Direct Support: 9983333469"
          >
            <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <PhoneCall size={11} className="stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">24x7 Support:</span>
              <span className="font-bold font-mono tracking-tight text-slate-900 group-hover:text-red-600">9983333469</span>
            </div>
          </a>

        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24 md:h-26 gap-4 py-2">

          {/* Brand Identity: Official Logo Image Only (Prominently Sized) */}
          <Link href="/" className="flex items-center shrink-0 group py-1">
            <img
              src="/logo.png"
              alt="Raj Biosis Private Limited"
              className="h-16 sm:h-20 md:h-[84px] w-auto object-contain transition-transform duration-200 group-hover:scale-105"
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
                placeholder="Search equipment by name, SKU (e.g. Ventilator, X-Ray)..."
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
              className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-neutral-700 hover:text-brand-600 hover:bg-neutral-100 transition"
            >
              All Products
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-neutral-700 hover:text-brand-600 hover:bg-neutral-100 transition flex items-center gap-1"
              >
                <span>Categories</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoriesOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-xl border border-neutral-200 shadow-lg py-2 z-50">
                  {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.id}`}
                      onClick={() => setCategoriesOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-neutral-700 hover:text-brand-600 hover:bg-neutral-50 flex items-center justify-between transition"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[11px] text-neutral-400 font-mono">({cat.itemCount})</span>
                    </Link>
                  ))}
                  <div className="border-t border-neutral-100 mt-1 pt-1">
                    <Link
                      href="/products"
                      onClick={() => setCategoriesOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-brand-600 hover:bg-brand-50 block"
                    >
                      Browse Entire Catalogue &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/about"
              className="px-3.5 py-2 rounded-lg text-xs font-bold text-neutral-700 hover:text-brand-600 hover:bg-neutral-100 transition"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="px-3.5 py-2 rounded-lg text-xs font-bold text-neutral-700 hover:text-brand-600 hover:bg-neutral-100 transition"
            >
              Contact
            </Link>
          </nav>

          {/* Right Action Hub: Clean Profile Link + Cart + Quote + Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Minimalist Light Profile Link */}
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition shadow-2xs"
              title="My Profile & Hospital Credentials"
              id="navbar-profile-btn"
            >
              <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                {userProfile?.fullName ? (
                  userProfile.fullName.charAt(0).toUpperCase()
                ) : (
                  <User size={12} className="text-slate-600" />
                )}
              </div>
              <span className="text-slate-800 font-semibold flex items-center gap-1">
                {userProfile?.fullName ? (
                  <>
                    <span className="font-bold truncate max-w-[90px] inline-block align-bottom">
                      {userProfile.fullName.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-brand-600 font-medium hidden sm:inline">
                      • {activeDistrict}
                    </span>
                  </>
                ) : (
                  <>
                    <span>Profile</span>
                    <span className="text-[10px] text-brand-600 font-medium hidden sm:inline">
                      ({activeDistrict})
                    </span>
                  </>
                )}
              </span>
            </Link>

            {/* Shopping Cart Button with Dynamic Live Badge */}
            <button
              type="button"
              onClick={() => openCartDrawer()}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition shadow-2xs group cursor-pointer"
              title="View Selected Equipment & Cart"
              id="navbar-cart-btn"
            >
              <div className="relative flex items-center justify-center">
                <ShoppingCart size={17} className="text-slate-700 group-hover:text-red-600 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-red-600 text-white rounded-full text-[10px] font-black h-4.5 min-w-[18px] px-1 flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-bold">Cart</span>
            </button>

            {/* Direct Institutional Enquiry CTA */}
            <Link
              href="/contact"
              className="btn-primary-red"
            >
              <FileText size={15} />
              <span>Request Quote</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-neutral-700 hover:bg-neutral-100 transition"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search medical equipment..."
              className="w-full pl-9 pr-4 py-2 bg-neutral-100 text-xs text-neutral-900 rounded-xl border border-neutral-200 focus:border-brand-500 outline-none"
            />
          </form>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-neutral-200 px-4 pt-2 pb-6 space-y-3">
          {/* Clean Light Mobile Profile Card */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                  {userProfile?.fullName ? (
                    userProfile.fullName.charAt(0).toUpperCase()
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
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
          >
            Home
          </Link>
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
          >
            All Products ({PRODUCTS.length})
          </Link>

          <div className="pt-2 border-t border-neutral-100">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-2 mb-1">Categories</div>
            {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center justify-between"
              >
                <span>{cat.name}</span>
                <span className="text-[10px] text-neutral-400 font-mono">({cat.itemCount})</span>
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-neutral-100 space-y-1">
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
            >
              About Raj Biosis Pvt. Ltd.
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
            >
              Contact & Institutional Sales
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
