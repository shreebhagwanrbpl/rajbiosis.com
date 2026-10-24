'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Award, Wrench, Truck, FileCheck, PhoneCall } from 'lucide-react';

export default function TrustSection() {
  const trustPoints = [
    {
      icon: <ShieldCheck size={22} className="text-brand-600" />,
      title: 'CDSCO & ISO 13485 Registered',
      description: 'Manufactured and audited in strict accordance with ISO 13485:2016 medical device standards and Central Drugs Standard Control Organisation (CDSCO) guidelines.'
    },
    {
      icon: <Award size={22} className="text-brand-600" />,
      title: 'Factory-Accredited Pre-Calibration',
      description: 'Every equipment unit undergoes comprehensive pre-delivery electrical safety tests (IEC 62353) and precision metrology calibration with valid test certificates.'
    },
    {
      icon: <Wrench size={22} className="text-brand-600" />,
      title: 'Biomedical Engineer Installation',
      description: 'Certified biomedical engineers provide turnkey on-site unboxing, clinical setup, staff training, and comprehensive AMC/CMC lifecycle support.'
    },
    {
      icon: <Truck size={22} className="text-brand-600" />,
      title: 'Pan-India Hospital Delivery',
      description: 'Direct temperature-monitored logistical transit with transit insurance to Tier 1, 2, and 3 healthcare centres across India with rapid dispatch.'
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-neutral-50/70 border-b border-neutral-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider block mb-1">
            Quality & Compliance
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Institutional Procurement Assurance
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-normal mt-1">
            Raj Biosis Pvt. Ltd. supplies critical medical infrastructure directly to government hospitals, corporate healthcare chains, and independent nursing homes.
          </p>
        </div>

        {/* 4 Trust Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {trustPoints.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
