'use client';

import React from 'react';
import Link from 'next/link';
import { HeartPulse, PhoneCall, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { CATEGORIES } from '../data/categories';

export default function Footer() {
  const activeCategories = CATEGORIES.filter(c => c.id !== 'all');

  return (
    <footer className="bg-white border-t border-neutral-200 text-neutral-600 text-xs">
      {/* Top Footer Columns */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand Info (2 Cols) */}
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

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2 text-neutral-700">
                <PhoneCall size={14} className="text-brand-600 shrink-0" />
                <span className="font-semibold">Toll-Free: 9983333469 </span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <Mail size={14} className="text-brand-600 shrink-0" />
                <span>institutional@rajbiosis.com</span>
              </div>
              <div className="flex items-start gap-2 text-neutral-700">
                <MapPin size={14} className="text-brand-600 shrink-0 mt-0.5" />
                <span>Raj Biosis Life Sciences Park, Phase II, Bengaluru - 560100, India</span>
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
            <Link href="/contact" className="hover:text-neutral-800 transition">Privacy & Data Handling</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
