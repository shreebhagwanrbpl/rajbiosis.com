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

  const openLocationModal = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-location-modal'));
    }
  };

  const isHeadOfficeOnly = !officeData || officeData.isHeadOfficeOnly;
  const localBranch = officeData?.local;

  return (
    <footer className="bg-white border-t border-neutral-200 text-neutral-600 text-xs">
      {/* Top Footer Columns */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand Info & Dynamic Local/Head Office (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
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

            <p className="text-xs text-neutral-600 leading-relaxed max-w-sm">
              Raj Biosis Pvt. Ltd. is a dedicated manufacturer and supplier of critical care, operating theatre, and diagnostic imaging equipment for hospitals and clinical facilities across India.
            </p>

            {/* Dynamic Office Address Card(s) Based on User Location */}
            <div className="pt-2 space-y-3">
              
              {/* Location Status Bar */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800" suppressHydrationWarning>
                  <MapPin size={13} className="text-brand-600 shrink-0" />
                  <span>Serving Your Location:</span>
                  <strong className="text-brand-700 font-bold">{mounted ? activeDistrict : 'Jaipur'}</strong>
                </div>
                <button
                  type="button"
                  onClick={openLocationModal}
                  className="text-brand-600 hover:text-brand-700 font-bold underline cursor-pointer text-[10px]"
                >
                  Change City
                </button>
              </div>

              {/* SCENARIO 1: User is outside Jaipur (e.g. Churu) -> Show Local Branch Office */}
              {!isHeadOfficeOnly && localBranch && (
                <div className="p-3 rounded-2xl bg-red-50/60 border border-red-200/90 text-xs space-y-1.5" suppressHydrationWarning>
                  <div className="flex items-center justify-between">
                    <div className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                      <span>{localBranch.city} Regional Service Station</span>
                    </div>
                    <span className="text-[10px] bg-red-100 text-brand-800 font-bold px-2 py-0.5 rounded-full">
                      Your Local Branch
                    </span>
                  </div>

                  <div className="text-neutral-700 text-[11px] leading-relaxed">
                    {localBranch.address}
                  </div>

                  <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-800 font-medium">
                    <div className="flex items-center gap-1">
                      <PhoneCall size={12} className="text-brand-600 shrink-0" />
                      <span>{localBranch.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail size={12} className="text-brand-600 shrink-0" />
                      <span>{localBranch.email}</span>
                    </div>
                  </div>

                  <div className="pt-1 text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                    <span>{localBranch.sla}</span>
                  </div>
                </div>
              )}

              {/* SCENARIO 2: Corporate Headquarters in Jaipur (Always shown) */}
              <div className={`p-3 rounded-2xl border text-xs space-y-1.5 ${isHeadOfficeOnly ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200/90'}`} suppressHydrationWarning>
                <div className="flex items-center justify-between">
                  <div className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                    <Building2 size={13} className="text-brand-600 shrink-0" />
                    <span>Corporate Headquarters {isHeadOfficeOnly ? '& Central Depot' : ''}</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                    Jaipur HQ
                  </span>
                </div>

                <div className="text-neutral-700 text-[11px] leading-relaxed">
                  {HEAD_OFFICE.address}
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-800 font-medium">
                  <div className="flex items-center gap-1">
                    <PhoneCall size={12} className="text-brand-600 shrink-0" />
                    <span>Toll-Free: {HEAD_OFFICE.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail size={12} className="text-brand-600 shrink-0" />
                    <span>{HEAD_OFFICE.email}</span>
                  </div>
                </div>

                {isHeadOfficeOnly && (
                  <div className="pt-1 text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                    <span>{HEAD_OFFICE.sla}</span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Categories Links (1 Col) */}
          <div className="space-y-3">
            <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
              Equipment Categories
            </h4>
            <ul className="space-y-2">
              {activeCategories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.id}`}
                    className="text-xs text-neutral-600 hover:text-brand-600 transition-colors block"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/products" className="text-brand-600 text-xs font-semibold hover:underline block">
                  All Products &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links (1 Col) */}
          <div className="space-y-3">
            <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
              Procurement & Support
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-xs text-neutral-600 hover:text-brand-600 transition-colors block">
                  Request Institutional RFQ
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-xs text-neutral-600 hover:text-brand-600 transition-colors block">
                  About Raj Biosis Pvt. Ltd.
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs text-neutral-600 hover:text-brand-600 transition-colors block">
                  Biomedical Engineering Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs text-neutral-600 hover:text-brand-600 transition-colors block">
                  GeM Tender Compliance Desk
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs text-neutral-600 hover:text-brand-600 transition-colors block">
                  Annual Maintenance (AMC / CMC)
                </Link>
              </li>
              <li>
                <Link href="/profile?tab=staff" className="text-xs text-brand-600 font-bold hover:underline block flex items-center gap-1">
                  <span>Employee &amp; Admin Desk &rarr;</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Standards & Compliance (1 Col) */}
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
