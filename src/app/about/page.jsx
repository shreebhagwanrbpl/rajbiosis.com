import React from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { ShieldCheck, HeartPulse, Award, Wrench, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../../data/products';

export const metadata = {
  title: 'About Raj Biosis Pvt. Ltd. | Biomedical Engineering & Hospital Systems',
  description: 'Learn about Raj Biosis Pvt. Ltd., India’s trusted manufacturer and supplier of critical care ventilators, patient monitors, digital radiography, and surgical equipment.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900 antialiased">
      <Header />

      {/* Hero Header */}
      <div className="bg-white border-b border-neutral-200 py-12 sm:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block mb-2">
              Company Overview & Engineering Philosophy
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight leading-tight mb-4">
              Pioneering Certified Biomedical Infrastructure Across India
            </h1>
            <p className="text-sm sm:text-base text-neutral-700 font-medium leading-relaxed">
              Raj Biosis Pvt. Ltd. was founded to bridge the gap between world-class biomedical engineering and accessible, direct-from-manufacturer hospital procurement. We engineer, calibrate, and supply life-critical medical devices directly to healthcare providers.
            </p>
          </div>
        </div>
      </div>

      {/* Main Body Grid */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-12">
        
        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <ShieldCheck size={22} />
            </div>
            <h3 className="text-base font-bold text-neutral-900">Regulatory Integrity</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Strict adherence to Central Drugs Standard Control Organisation (CDSCO) guidelines, AERB safety regulations for radiation units, and ISO 13485:2016 quality management protocols.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Award size={22} />
            </div>
            <h3 className="text-base font-bold text-neutral-900">Direct OEM Supply</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              By eliminating multi-tiered distributor margins, we ensure hospitals, medical colleges, and government institutions receive transparent pricing with authentic manufacturer warranties.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Wrench size={22} />
            </div>
            <h3 className="text-base font-bold text-neutral-900">Biomedical Engineering SLA</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Every equipment installation is executed by factory-trained biomedical engineers, complete with electrical safety verification (IEC 62353) and staff clinical training.
            </p>
          </div>
        </div>

        {/* Capabilities Section */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-neutral-200 shadow-xs space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Institutional Procurement & GeM Tender Support
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-neutral-600 leading-relaxed">
            <p>
              Raj Biosis actively supports government healthcare procurement through the Government e-Marketplace (GeM), providing complete technical compliance matrices, bilateral tender clauses, and comprehensive annual maintenance commitments (CAMC).
            </p>
            <p>
              From turnkey 20-bed Level-3 ICU setups to multi-speciality modular operating theatre video towers, our engineering divisions deliver end-to-end hardware, medical gas connectivity consultation, and life-cycle calibration.
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center gap-4">
            <Link
              href="/products"
              className="btn-primary-red py-2.5 px-6 text-xs font-bold"
            >
              <span>Explore Products ({PRODUCTS.length})</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/contact"
              className="btn-outline-neutral py-2.5 px-6 text-xs font-bold"
            >
              Contact Procurement Desk
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
