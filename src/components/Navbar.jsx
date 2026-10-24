'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HeartPulse,
  Search,
  ShoppingCart,
  ArrowRightLeft,
  FileText,
  PhoneCall,
  ShieldCheck,
  Building2,
  Sparkles,
  Layers,
  ChevronDown,
  Menu,
  X,
  Sliders,
  ArrowRight,
  User
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';

export default function ModernNavbar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  compareCount,
  cartCount,
  onOpenCompare,
  onOpenCart,
  onOpenRfq
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 transition-all">
      {/* Sleek Top Telemetry Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white text-[11px] py-1.5 px-4 tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-sky-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
              Raj Biosis Life Systems
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-slate-300">Next-Gen Biomedical Engineering & Hospital Infrastructure</span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck size={13} /> ISO 13485 & CDSCO Certified
            </span>
            <span className="text-slate-600">•</span>
            <a href="tel:18004192467" className="hover:text-white transition flex items-center gap-1 font-semibold">
              <PhoneCall size={12} className="text-sky-400" /> 9983333469
            </a>
          </div>
        </div>
      </div>

      {/* Main Modern Navigation Hub */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24 md:h-26 gap-4 py-2">
          {/* Brand Identity: Official Logo Image Only */}
          <Link href="/" className="flex items-center shrink-0 group py-1">
            <img
              src="/logo.png"
              alt="Raj Biosis Private Limited"
              className="h-16 sm:h-20 md:h-[84px] w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>

          {/* Clean Modern Navigation Links (Completely different from standard e-commerce) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <a
              href="#equipment-showcase"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100/80 transition"
            >
              Clinical Suites
            </a>
            <a
              href="#solution-builder"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100/80 transition flex items-center gap-1.5"
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>Care-Unit Architect</span>
            </a>
            <a
              href="#catalog-section"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100/80 transition"
            >
              Equipment Matrix
            </a>
            <a
              href="#trust-framework"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100/80 transition"
            >
              OEM Calibration & AERB
            </a>
          </nav>

          {/* Right Action Hub */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Trigger */}
            <div className="relative">
              <div className="flex items-center bg-slate-100 hover:bg-slate-200/70 border border-slate-200/90 rounded-full px-3 py-1.5 transition text-xs text-slate-500 gap-2">
                <Search size={14} className="text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Quick search devices..."
                  className="bg-transparent border-none outline-none text-xs text-slate-800 w-28 sm:w-44 placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-700">
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Compare Matrix Trigger */}
            <button
              onClick={onOpenCompare}
              className="relative p-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition"
              title="Compare Specifications"
            >
              <ArrowRightLeft size={18} />
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </button>

            {/* PO Cart List */}
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-xl text-slate-700 hover:text-teal-600 hover:bg-slate-100 transition"
              title="Procurement Order List"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile Trigger */}
            <Link
              href="/profile"
              className="relative p-2 rounded-xl text-slate-700 hover:text-red-600 hover:bg-slate-100 transition"
              title="Hospital / Doctor Profile"
            >
              <User size={18} />
            </Link>

            {/* Request Quote CTA */}
            <button
              onClick={onOpenRfq}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm shadow-blue-500/20 hover:shadow-md transition-all active:scale-95"
            >
              <FileText size={14} />
              <span>Instant RFQ</span>
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 shadow-xl">
          <div className="space-y-1">
            <a
              href="#equipment-showcase"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Clinical Suites Spotlight
            </a>
            <a
              href="#solution-builder"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50"
            >
              Care-Unit Architect & Estimator
            </a>
            <a
              href="#catalog-section"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Full Equipment Matrix
            </a>
            <a
              href="#trust-framework"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              OEM Calibration Standards
            </a>
          </div>

          <button
            onClick={() => { onOpenRfq(); setMobileMenuOpen(false); }}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <FileText size={14} /> Request Institutional Quotation
          </button>
        </div>
      )}
    </header>
  );
}
