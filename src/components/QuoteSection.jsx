'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, PhoneCall, ArrowRight, ShieldCheck } from 'lucide-react';

export default function QuoteSection() {
  return (
    <section className="py-12 sm:py-16 bg-white border-b border-neutral-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden">

          <div className="relative z-10 max-w-3xl">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-widest block mb-2">
              Institutional Sales & Government GeM Tenders
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-3">
              Request an Official Institutional Price Quotation
            </h2>
            <p className="text-sm sm:text-base text-white/95 font-medium leading-relaxed mb-6 max-w-2xl">
              Get comprehensive technical compliance sheets, GST tax invoices, volume tier discounts, and warranty terms customized for your hospital department or government procurement tender.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors shadow-xs"
              >
                <FileText size={16} />
                <span>Submit Quotation Request</span>
                <ArrowRight size={15} />
              </Link>

              <a
                href="tel:18004192467"
                className="inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700 rounded-xl transition-colors"
              >
                <PhoneCall size={15} className="text-brand-400" />
                <span>Call Procurement Desk: 9983333469</span>
              </a>
            </div>
          </div>

          {/* Subtle Background Accent */}
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-brand-600/10 blur-3xl pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
