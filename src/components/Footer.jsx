'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HeartPulse, PhoneCall, Mail, MapPin, ShieldCheck, Building2, Compass, CheckCircle2, ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { getActiveDistrict } from '../utils/userProfile';
import { getOfficeForDistrict, HEAD_OFFICE } from '../data/offices';

export default function Footer() {
  const activeCategories = CATEGORIES.filter(c => c.id !== 'all');
  const [activeDistrict, setActiveDistrict] = useState('Jaipur');
  const [officeData, setOfficeData] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const initial = getActiveDistrict();
    setActiveDistrict(initial);
    setOfficeData(getOfficeForDistrict(initial));

    const handleDistrictChange = (e) => {
      const dist = e.detail || 'Jaipur';
      setActiveDistrict(dist);
      setOfficeData(getOfficeForDistrict(dist));
    };

    window.addEventListener('active-district-changed', handleDistrictChange);
    return () => {
      window.removeEventListener('active-district-changed', handleDistrictChange);
    };
  }, []);

  const isHeadOfficeOnly = !officeData || officeData.isHeadOfficeOnly;
  const localBranch = officeData?.local;

  return (
    <footer className="bg-white border-t border-neutral-200 text-neutral-600 text-xs">
      {/* Top Footer 4 Equal Columns */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* 1. Brand Identity & Overview */}
          <div className="space-y-4">
            <Link href="/" prefetch={true} className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Raj Biosis Pvt. Ltd."
                className="h-12 sm:h-14 w-auto object-contain"
              />
              <div>
                <div className="text-lg font-extrabold text-neutral-950 tracking-tight leading-none">
                  Raj Biosis <span className="text-brand-600 text-xs sm:text-sm font-bold">Pvt. Ltd.</span>
                </div>
                <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block mt-0.5">
                  Biomedical Life Systems
                </span>
              </div>
            </Link>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Raj Biosis Pvt. Ltd. is a leading manufacturer and distributor of clinical laboratory diagnostic reagents, rapid test kits, pathology equipment, and healthcare supplies for hospitals and diagnostic centres across India.
            </p>
          </div>

          {/* 2. Equipment Categories Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
              Equipment Categories
            </h4>
            <ul className="space-y-2">
              {activeCategories.slice(0, 6).map((cat) => (
                <li key={cat.slug || cat.id}>
                  <Link
                    href={`/category/${cat.slug || cat.id}`}
                    prefetch={true}
                    className="text-xs text-neutral-600 hover:text-brand-600 transition-colors block"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/categories" prefetch={true} className="text-brand-600 text-xs font-semibold hover:underline block">
                  All {activeCategories.length} Categories &rarr;
                </Link>
              </li>
              <li>
                <Link href="/products" prefetch={true} className="text-slate-700 text-xs font-semibold hover:underline block">
                  All Products Catalogue &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Procurement & Support Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
              Procurement & Support
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" prefetch={true} className="text-xs text-neutral-600 hover:text-brand-600 transition-colors block">
                  Request Institutional RFQ
                </Link>
              </li>
              <li>
                <Link href="/about" prefetch={true} className="text-xs text-neutral-600 hover:text-brand-600 transition-colors block">
                  About Raj Biosis Pvt. Ltd.
                </Link>
              </li>
              <li>
                <Link href="/contact" prefetch={true} className="text-xs text-neutral-600 hover:text-brand-600 transition-colors block">
                  Biomedical Engineering Service
                </Link>
              </li>
              <li>
                <Link href="/contact" prefetch={true} className="text-xs text-neutral-600 hover:text-brand-600 transition-colors block">
                  GeM Tender Compliance Desk
                </Link>
              </li>
              <li>
                <Link href="/contact" prefetch={true} className="text-xs text-neutral-600 hover:text-brand-600 transition-colors block">
                  Annual Maintenance (AMC / CMC)
                </Link>
              </li>
              <li>
                <Link href="/profile?tab=staff" prefetch={true} className="text-xs text-brand-600 font-bold hover:underline block flex items-center gap-1">
                  <span>Employee &amp; Admin Desk &rarr;</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Standards & Compliance */}
          <div className="space-y-3">
            <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
              Quality Standards
            </h4>
            <div className="space-y-2 text-xs text-neutral-600 leading-relaxed">
              <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="font-bold text-neutral-800 text-[11px] mb-0.5">ISO 13485:2016 Certified</div>
                Medical Device Quality Management System
              </div>
              <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="font-bold text-neutral-800 text-[11px] mb-0.5">CDSCO Registered</div>
                Medical Device Rules 2017 Compliance
              </div>
            </div>
          </div>

        </div>

        {/* Dedicated Full-Width Row: Side-by-Side Equal Office Address Cards (Does NOT collapse top columns) */}
        <div className="mt-8 pt-6 border-t border-neutral-200/80">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">

            {/* CARD 1: Regional Office Address (Or Local Hub) */}
            {!isHeadOfficeOnly && localBranch ? (
              <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200 text-xs space-y-2 flex flex-col justify-between" suppressHydrationWarning>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-600 shrink-0" />
                      <span>{localBranch.city} Main City Regional Office</span>
                    </div>
                    <span className="text-[10px] bg-red-100 text-brand-800 font-bold px-2 py-0.5 rounded-full shrink-0">
                      Main City Branch
                    </span>
                  </div>

                  <div className="text-neutral-700 text-xs leading-relaxed">
                    {localBranch.address}
                  </div>
                </div>

                <div className="pt-2 border-t border-red-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-800">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 font-semibold">
                      <PhoneCall size={12} className="text-brand-600 shrink-0" />
                      <span>{localBranch.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail size={12} className="text-brand-600 shrink-0" />
                      <span>{localBranch.email}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('open-location-modal'));
                      }
                    }}
                    className="text-[11px] font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 cursor-pointer transition"
                  >
                    <MapPin size={11} />
                    <span>View {localBranch.city} Central Map &rarr;</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 flex flex-col justify-between" suppressHydrationWarning>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-600 shrink-0" />
                      <span>Direct Factory Dispatch & Service Network</span>
                    </div>
                    <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded-full shrink-0">
                      Pan-Rajasthan
                    </span>
                  </div>
                  <div className="text-neutral-700 text-xs leading-relaxed">
                    Dedicated field biomedical engineers serving hospitals and diagnostic laboratories across all 50 Rajasthan districts with same-day emergency triage.
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-neutral-800 font-semibold">
                  <div className="flex items-center gap-1">
                    <PhoneCall size={12} className="text-brand-600 shrink-0" />
                    <span>24x7 Helpline: 9983333469</span>
                  </div>
                  <div className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                    <span>NABL Calibrated Equipment</span>
                  </div>
                </div>
              </div>
            )}

            {/* CARD 2: Corporate Headquarters in Jaipur (Always shown, equal 50% width) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 flex flex-col justify-between" suppressHydrationWarning>
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                    <Building2 size={14} className="text-brand-600 shrink-0" />
                    <span>Corporate Headquarters & Central Depot</span>
                  </div>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full shrink-0">
                    Jaipur HQ
                  </span>
                </div>

                <div className="text-neutral-700 text-xs leading-relaxed">
                  {HEAD_OFFICE.address}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-800 font-medium">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 font-semibold">
                    <PhoneCall size={12} className="text-brand-600 shrink-0" />
                    <span>Toll-Free: {HEAD_OFFICE.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail size={12} className="text-brand-600 shrink-0" />
                    <span>{HEAD_OFFICE.email}</span>
                  </div>
                </div>
                <div className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                  <span>{HEAD_OFFICE.sla}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Legal Copyright Bar */}
      <div className="border-t border-neutral-200 bg-neutral-50/60 py-5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} Raj Biosis Pvt. Ltd. All rights reserved. Registered Indian Medical Device Entity.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-neutral-800 transition">Quality Policy</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-neutral-800 transition">Institutional Terms</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-neutral-800 transition">Privacy &amp; Data Handling</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
