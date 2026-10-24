'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Grid, 
  LayoutGrid, 
  FileText, 
  PhoneCall, 
  X, 
  ChevronRight, 
  HeartPulse, 
  Radio, 
  Scissors, 
  Activity, 
  Bed, 
  ShieldAlert,
  Sparkles,
  User,
  ShoppingCart
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { getCartCount, openCartDrawer, CART_UPDATED_EVENT } from '../utils/cart';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [categoriesDrawerOpen, setCategoriesDrawerOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Close drawer on route change
  useEffect(() => {
    setCategoriesDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (categoriesDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [categoriesDrawerOpen]);

  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const checkProfile = () => {
      if (typeof window !== 'undefined') {
        const p = localStorage.getItem('rajbiosis_user_profile');
        setHasProfile(!!p);
      }
    };
    checkProfile();

    const syncCart = () => {
      setCartCount(getCartCount());
    };
    syncCart();

    window.addEventListener('user-profile-updated', checkProfile);
    window.addEventListener(CART_UPDATED_EVENT, syncCart);
    return () => {
      window.removeEventListener('user-profile-updated', checkProfile);
      window.removeEventListener(CART_UPDATED_EVENT, syncCart);
    };
  }, []);

  const categoryIcons = {
    'icu-critical-care': <HeartPulse size={20} className="text-red-500" />,
    'radiology-imaging': <Radio size={20} className="text-blue-500" />,
    'surgical-ot': <Scissors size={20} className="text-emerald-500" />,
    'diagnostic-lab': <Activity size={20} className="text-amber-500" />,
    'hospital-furniture': <Bed size={20} className="text-indigo-500" />,
    'sterilization-dental': <ShieldAlert size={20} className="text-cyan-500" />,
  };

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
      action: null,
    },
    {
      label: 'Products',
      href: '/products',
      icon: Grid,
      isActive: pathname === '/products',
      action: null,
    },
    {
      label: 'Categories',
      href: '#',
      icon: LayoutGrid,
      isActive: categoriesDrawerOpen,
      action: (e) => {
        e.preventDefault();
        setCategoriesDrawerOpen(!categoriesDrawerOpen);
      },
    },
    {
      label: 'Cart',
      href: '#',
      icon: ShoppingCart,
      isActive: false,
      badge: cartCount > 0 ? String(cartCount) : null,
      action: (e) => {
        e.preventDefault();
        openCartDrawer();
      },
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: User,
      isActive: pathname === '/profile',
      action: null,
    },
  ];

  return (
    <>
      {/* Native App-Style Bottom Tab Bar (Visible on mobile/tablet screens only) */}
      <nav 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-neutral-200/90 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] pb-[max(env(safe-area-inset-bottom,0px),8px)] pt-1 px-2"
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-5 items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const content = (
              <div className="flex flex-col items-center justify-center py-1 relative">
                <div className="relative">
                  <Icon 
                    size={20} 
                    className={`transition-transform duration-200 ${
                      item.isActive 
                        ? 'text-brand-600 scale-110 stroke-[2.5]' 
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`} 
                  />
                  {item.badge && (
                    <span className="absolute -top-1 -right-3 px-1 py-0.2 bg-brand-600 text-[8px] font-bold text-white rounded-full leading-tight shadow-xs animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span 
                  className={`text-[10px] mt-1 font-medium transition-colors ${
                    item.isActive 
                      ? 'text-brand-600 font-bold' 
                      : 'text-neutral-500'
                  }`}
                >
                  {item.label}
                </span>
                {item.isActive && (
                  <span className="w-1 h-1 bg-brand-600 rounded-full mt-0.5"></span>
                )}
              </div>
            );

            if (item.action) {
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex flex-col items-center justify-center p-1 rounded-xl transition active:scale-95 focus:outline-none"
                  aria-label={item.label}
                >
                  {content}
                </button>
              );
            }

            if (item.isExternal) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center justify-center p-1 rounded-xl transition active:scale-95 focus:outline-none"
                  aria-label={item.label}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center p-1 rounded-xl transition active:scale-95 focus:outline-none"
                aria-label={item.label}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* App-like Slide-Up Categories Bottom Sheet */}
      {categoriesDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Translucent Backdrop */}
          <div 
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setCategoriesDrawerOpen(false)}
          />

          {/* Bottom Sheet Modal Container */}
          <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[82vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-300 border-t border-neutral-200">
            {/* Sheet Drag Pill */}
            <div className="w-12 h-1.5 bg-neutral-300 rounded-full mx-auto mt-3 mb-1" />

            {/* Sheet Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Equipment Categories</h3>
                  <p className="text-[11px] text-neutral-500">Raj Biosis Certified Medical Inventory</p>
                </div>
              </div>
              <button 
                onClick={() => setCategoriesDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition"
                aria-label="Close sheet"
              >
                <X size={16} />
              </button>
            </div>

            {/* Categories List (Scrollable) */}
            <div className="p-4 space-y-2 overflow-y-auto overscroll-contain">
              {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.id}`}
                  onClick={() => setCategoriesDrawerOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/70 transition group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs border border-neutral-200/60 group-hover:scale-105 transition-transform">
                      {categoryIcons[cat.id] || <Activity size={20} className="text-brand-600" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900 group-hover:text-brand-600 transition-colors">
                        {cat.name}
                      </div>
                      <div className="text-[10px] text-neutral-500 line-clamp-1">
                        {cat.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-mono font-bold text-neutral-400 bg-neutral-200/60 px-2 py-0.5 rounded-full">
                      {cat.itemCount}
                    </span>
                    <ChevronRight size={14} className="text-neutral-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition" />
                  </div>
                </Link>
              ))}

              {/* View Complete Catalogue Link */}
              <div className="pt-2">
                <Link
                  href="/products"
                  onClick={() => setCategoriesDrawerOpen(false)}
                  className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
                >
                  <span>Browse All Biomedical Catalogue</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
