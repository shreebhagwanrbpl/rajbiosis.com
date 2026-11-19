'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
  FileText,
  PhoneCall,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { getActiveDistrict } from '../utils/userProfile';
import ProformaInvoiceSlate from './ProformaInvoiceSlate';

export default function QuoteSection() {
  const [district, setDistrict] = useState('Jaipur');
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const containerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    setDistrict(getActiveDistrict());

    const handleDistrictChange = (e) => {
      if (e && e.detail) {
        setDistrict(e.detail);
      }
    };

    window.addEventListener('active-district-changed', handleDistrictChange);
    return () => {
      window.removeEventListener('active-district-changed', handleDistrictChange);
    };
  }, []);

  // Framer Motion useScroll tied to section container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Silky smooth, gentle spring physics for slow and deliberate scroll response
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50, // very gentle pull for slow, graceful scroll response
    damping: 24,   // smooth deceleration
    mass: 1.2,     // realistic smooth inertia
    restDelta: 0.0005
  });

  // Track smoothed progress to drive page peeling
  useEffect(() => {
    const unsubscribe = smoothProgress.on('change', (latest) => {
      setScrollProgress(latest);
    });
    return () => unsubscribe();
  }, [smoothProgress]);

  return (
    <section
      ref={containerRef}
      className="relative bg-white border-b border-neutral-200/80"
      style={{ height: '360vh' }} // Generous pinning track so the page fly-off feels slow, graceful, and smooth
    >
      {/* Pinned Sticky Stage (Clean, Compact, Minimal) */}
      <div className="sticky top-14 sm:top-16 min-h-[calc(100vh-4rem)] flex items-center py-6 sm:py-8 overflow-hidden">
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-gradient-to-r from-red-950 via-slate-950 to-red-950 rounded-3xl p-5 sm:p-7 lg:p-9 text-white relative overflow-hidden shadow-2xl border border-red-900/40">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">

              {/* Left Column: Heading, Subtitle & Action CTAs (Clean, without progress bar) */}
              <div className="lg:col-span-7 space-y-3.5">
                
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-900/60 border border-red-700/60 text-red-300 text-[11px] sm:text-xs font-bold uppercase tracking-widest">
                  <ShieldCheck size={13} className="text-red-400" />
                  <span>Institutional Sales &amp; Hospital Procurement</span>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                  Official Institutional Price Quotation
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-xl">
                  Authorized digital proforma quotation on Raj Biosis Pvt. Ltd. letterhead with 12-month warranty, CDSCO registration, and ISO 13485:2016 verified compliance terms.
                </p>

                {/* Action CTAs */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-2xl transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] group cursor-pointer"
                  >
                    <FileText size={15} />
                    <span>Submit Quotation Request</span>
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <a
                    href="tel:9983333469"
                    className="inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl transition-all backdrop-blur-xs cursor-pointer"
                  >
                    <PhoneCall size={14} className="text-red-400" />
                    <span>Toll-Free: 9983333469</span>
                  </a>
                </div>

                {/* Dynamic District Tag */}
                <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 font-medium" suppressHydrationWarning>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-red-400 shrink-0" />
                    <span>Customized for: <strong className="text-white font-bold">{mounted ? district : 'Jaipur'}, Rajasthan</strong></span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    <span>ISO 13485:2016 &amp; CDSCO Audited Facility</span>
                  </div>
                </div>

              </div>

              {/* Right Column: The Compact Tilted Clipboard with Fly-Off Sheets */}
              <div className="lg:col-span-5 flex justify-center items-center">
                <ProformaInvoiceSlate
                  activeDistrict={mounted ? district : 'Jaipur'}
                  scrollProgress={scrollProgress}
                  isScrollControlled={true}
                />
              </div>

            </div>

            {/* Ambient Subtle Red Glow Accents */}
            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-80 h-80 rounded-full bg-red-600/15 blur-3xl pointer-events-none" />
            <div className="absolute left-1/2 -top-24 w-72 h-72 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

          </div>

        </div>
      </div>
    </section>
  );
}