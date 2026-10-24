'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { BRAND_LOGOS } from '../data/brands';

export default function BrandCarouselSection() {
  return (
    <section className="py-12 sm:py-16 bg-slate-100 border-y border-slate-200 overflow-hidden relative">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Authorized OEM Partners &amp; Global Brands</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Brands We Deal In &amp; Support
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              Direct-from-manufacturer procurement, authentic OEM warranties, genuine consumables, and factory-trained biomedical engineer service for multi-specialty hospitals and clinics across Rajasthan.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
              <Award size={16} className="text-brand-600" />
              <span>17+ Direct OEMs</span>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-2xs group"
            >
              <span>OEM Tender Enquiry</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Continuous Brand Ribbon / Patti (Single continuous strip on bg-slate-100) */}
        <div className="relative w-full bg-white rounded-2xl sm:rounded-3xl shadow-sm py-3.5 sm:py-4.5 px-3 overflow-hidden border border-slate-200/90">
          {/* Smooth Fade Gradients on left and right edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-white via-white/90 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-white via-white/90 to-transparent z-10" />

          {/* Marquee Track: Seamless flow along the patti */}
          <div className="animate-marquee flex items-center gap-8 sm:gap-12 py-1">
            {BRAND_LOGOS.map((brand, idx) => (
              <div
                key={`patti-brand-1-${idx}`}
                className="flex items-center gap-3 sm:gap-4 shrink-0 select-none group cursor-pointer"
                title={`Authorized Partner: ${brand.name}`}
              >
                <div className="h-10 sm:h-12 w-auto flex items-center justify-center">
                  <img
                    src={brand.src}
                    alt={brand.name}
                    className="max-h-10 sm:max-h-12 max-w-[130px] sm:max-w-[160px] w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-108"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight whitespace-nowrap group-hover:text-brand-600 transition-colors">
                  {brand.name}
                </span>
                {/* Hairline divider tick between brands on the continuous strip */}
                <div className="h-6 w-px bg-slate-200/90 ml-6 sm:ml-8 shrink-0" />
              </div>
            ))}

            {/* Duplicated for smooth infinite loop */}
            {BRAND_LOGOS.map((brand, idx) => (
              <div
                key={`patti-brand-2-${idx}`}
                className="flex items-center gap-3 sm:gap-4 shrink-0 select-none group cursor-pointer"
                title={`Authorized Partner: ${brand.name}`}
              >
                <div className="h-10 sm:h-12 w-auto flex items-center justify-center">
                  <img
                    src={brand.src}
                    alt={brand.name}
                    className="max-h-10 sm:max-h-12 max-w-[130px] sm:max-w-[160px] w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-108"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight whitespace-nowrap group-hover:text-brand-600 transition-colors">
                  {brand.name}
                </span>
                <div className="h-6 w-px bg-slate-200/90 ml-6 sm:ml-8 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges Strip Below the Carousel */}
        <div className="mt-7 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-slate-800">100% Genuine OEM Equipment</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">Direct Manufacturer Warranties with NABL calibration certs</span>
          </div>
          <div className="flex items-center gap-3 font-semibold text-slate-700">
            <span>Fast Rajasthan Regional Depot Stock</span>
            <span className="text-slate-300">|</span>
            <span className="text-brand-600 font-bold">24x7 Direct Hotline: 9983333469</span>
          </div>
        </div>

      </div>
    </section>
  );
}
