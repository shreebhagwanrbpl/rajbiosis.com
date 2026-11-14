'use client';

import React from 'react';
import { ShieldCheck, Tag, Truck, Headphones } from 'lucide-react';

export default function TrustSection() {
  const trustPoints = [
    {
      icon: ShieldCheck,
      title: 'Genuine & Authentic Products',
      description: 'Manufactured and audited in strict accordance with ISO 13485:2016 and CDSCO medical device standards.'
    },
    {
      icon: Tag,
      title: 'Competitive Pricing',
      description: 'Direct-from-manufacturer pricing with volume tier discounts and customized institutional quotations.'
    },
    {
      icon: Truck,
      title: 'Reliable Supply Chain',
      description: 'Temperature-monitored pan-India logistical transit with comprehensive transit insurance and rapid dispatch.'
    },
    {
      icon: Headphones,
      title: 'After-Sales Support',
      description: 'Certified biomedical engineers provide on-site unboxing, clinical setup, staff training, and AMC/CMC support.'
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-neutral-50/70 border-b border-neutral-200/80">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-brand-700 border border-red-200 text-xs font-bold mb-2">
            <span>Quality &amp; Compliance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Institutional Procurement Assurance
          </h2>
        </div>

        {/* 4 Trust Pillars Grid with Airy Spacing & Premium Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {trustPoints.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-brand-300 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5 group-hover:bg-brand-600 group-hover:border-brand-600 transition-all duration-300">
                    <IconComponent
                      size={22}
                      className="text-brand-600 group-hover:text-white transition-colors duration-300"
                    />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
