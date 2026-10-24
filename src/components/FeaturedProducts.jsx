'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, HeartPulse, Radio, Scissors, Activity, Bed, Building2, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';
import BrandCarouselSection from './BrandCarouselSection';
import { PRODUCTS } from '../data/products';
import { CATEGORIES, BRANDS } from '../data/categories';

export default function FeaturedProducts() {
  // Category subsets from actual real catalogue data
  const icuProducts = PRODUCTS.filter(p => p.category === 'icu-critical-care').slice(0, 4);
  const otProducts = PRODUCTS.filter(p => p.category === 'surgical-ot').slice(0, 4);
  const radiologyProducts = PRODUCTS.filter(p => p.category === 'radiology-imaging').slice(0, 4);
  const labAndInfraProducts = [
    ...PRODUCTS.filter(p => p.category === 'diagnostic-lab').slice(0, 2),
    ...PRODUCTS.filter(p => p.category === 'hospital-furniture').slice(0, 1),
    ...PRODUCTS.filter(p => p.category === 'sterilization-dental').slice(0, 1),
  ];

  // Clinical Applications / Use-cases
  const useCases = [
    { name: 'Critical Care & Life Support', count: 4, link: '/category/icu-critical-care', icon: <HeartPulse size={15} /> },
    { name: 'Minimally Invasive Surgery (OT)', count: 4, link: '/category/surgical-ot', icon: <Scissors size={15} /> },
    { name: 'Diagnostic Imaging & Radiology', count: 4, link: '/category/radiology-imaging', icon: <Radio size={15} /> },
    { name: 'Clinical Laboratory Testing', count: 3, link: '/category/diagnostic-lab', icon: <Activity size={15} /> },
    { name: 'Emergency Resuscitation & Crash Carts', count: 3, link: '/products?q=Emergency', icon: <Sparkles size={15} /> },
    { name: 'Hospital Ward & ICU Infrastructure', count: 2, link: '/category/hospital-furniture', icon: <Bed size={15} /> },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 py-10 sm:py-14 bg-white border-b border-neutral-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-14 sm:space-y-18">

        {/* =========================================================================
            SECTION 1: ICU & CRITICAL CARE EQUIPMENT (4 Products)
            ========================================================================= */}
        <section>
          {/* Category Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-neutral-200/80 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                  Category: ICU & Critical Care
                </span>
                <span className="text-xs text-neutral-400">•</span>
                <span className="text-xs text-neutral-500 font-medium">Life-Support Systems</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                ICU & Critical Care Equipment
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal mt-1 max-w-xl leading-relaxed">
                Micro-turbine mechanical ventilators, multi-parameter vital signs monitors, biphasic defibrillators, and micro infusion syringe pumps.
              </p>
            </div>

            <Link
              href="/category/icu-critical-care"
              className="text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group self-start sm:self-auto shrink-0"
            >
              <span>View All 4 ICU Products</span>
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* 4 Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {icuProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>


        {/* =========================================================================
            SECTION 2: SURGICAL & OPERATING THEATRE SUITE (4 Products)
            ========================================================================= */}
        <section>
          {/* Category Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-neutral-200/80 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                  Category: Surgical & OT Equipment
                </span>
                <span className="text-xs text-neutral-400">•</span>
                <span className="text-xs text-neutral-500 font-medium">Operating Room Solutions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                Surgical & Operating Theatre Suite
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal mt-1 max-w-xl leading-relaxed">
                4K Ultra-HD laparoscopy camera towers, shadowless dual-dome LED surgical lights, 400W electrosurgical units, and hydraulic OT tables.
              </p>
            </div>

            <Link
              href="/category/surgical-ot"
              className="text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group self-start sm:self-auto shrink-0"
            >
              <span>View All 4 OT Products</span>
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* 4 Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {otProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>

      {/* Large Authorized OEM Partner Brands Carousel (Rendered after 2 clinical categories) */}
      <BrandCarouselSection />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-14 sm:space-y-18">
        {/* =========================================================================
            SECTION 3: RADIOLOGY & DIAGNOSTIC IMAGING (3 Products)
            ========================================================================= */}
        <section>
          {/* Category Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-neutral-200/80 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                  Category: Radiology & Imaging
                </span>
                <span className="text-xs text-neutral-400">•</span>
                <span className="text-xs text-neutral-500 font-medium">AERB Radiation Compliant</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                Radiology & Diagnostic Imaging Systems
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal mt-1 max-w-xl leading-relaxed">
                High-frequency 500mA fixed digital X-ray DR systems, 4D color Doppler ultrasound scanners, and high-frequency surgical C-Arm fluoroscopy.
              </p>
            </div>

            <Link
              href="/category/radiology-imaging"
              className="text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group self-start sm:self-auto shrink-0"
            >
              <span>View All 4 Radiology Systems</span>
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Products Grid (4 items in 4-col responsive) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {radiologyProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>


        {/* =========================================================================
            SECTION 4: DIAGNOSTIC LAB & HOSPITAL INFRASTRUCTURE (4 Products)
            ========================================================================= */}
        <section>
          {/* Category Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-neutral-200/80 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                  Category: Diagnostics & Hospital Ward
                </span>
                <span className="text-xs text-neutral-400">•</span>
                <span className="text-xs text-neutral-500 font-medium">Pathology & Ward Facilities</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                Diagnostic Laboratory & Hospital Infrastructure
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal mt-1 max-w-xl leading-relaxed">
                Automated 5-part hematology analyzers, 12-channel ECG machines, 5-function electric ICU beds, and Class-B autoclave sterilizers.
              </p>
            </div>

            <Link
              href="/category/diagnostic-lab"
              className="text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group self-start sm:self-auto shrink-0"
            >
              <span>View Diagnostics & Ward</span>
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* 4 Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {labAndInfraProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>


        {/* =========================================================================
            SECTION 5: SHOP BY BIOMEDICAL APPLICATION & USE-CASE (Pills Grid)
            ========================================================================= */}
        <section className="bg-neutral-50/70 p-6 sm:p-8 rounded-3xl border border-neutral-200">
          <div className="flex items-end justify-between mb-5">
            <div>
              <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider block mb-1">
                Clinical Workflow
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                Procure by Hospital Application & Clinical Use
              </h3>
            </div>
            <Link href="/products" className="text-xs font-semibold text-neutral-600 hover:text-brand-600 hidden sm:inline">
              View All Departments &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {useCases.map((uc, idx) => (
              <Link
                key={idx}
                href={uc.link}
                className="bg-white p-3.5 rounded-2xl border border-neutral-200/90 hover:border-brand-400 hover:shadow-xs transition group flex flex-col justify-between"
              >
                <div className="w-8 h-8 rounded-xl bg-neutral-100 text-brand-600 flex items-center justify-center mb-2.5 group-hover:bg-brand-50 transition-colors">
                  {uc.icon}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-neutral-800 group-hover:text-brand-600 transition-colors leading-snug">
                    {uc.name}
                  </h4>
                  <span className="text-[11px] text-neutral-500 font-medium block mt-1">
                    {uc.count} Certified Units
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>


        {/* =========================================================================
            BOTTOM ACTION BAR: FULL CATALOGUE DIRECT LINK
            ========================================================================= */}
        <div className="text-center pt-4">
          <Link
            href="/products"
            className="btn-outline-neutral py-3 px-8 text-xs sm:text-sm font-bold inline-flex items-center gap-2 group"
          >
            <span>Browse Complete Equipment Catalogue ({PRODUCTS.length} Devices)</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </div>
  );
}
