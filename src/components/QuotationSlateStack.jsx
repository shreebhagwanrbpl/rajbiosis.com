'use client';

import React, { useState, useEffect } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function QuotationSlateStack({
  activeDistrict = 'Jaipur',
  scrollProgress = 0,
  isScrollControlled = true,
  onPageChange
}) {
  const [activePageIndex, setActivePageIndex] = useState(0); // 0 = Page 1, 1 = Page 2, 2 = Page 3, 3 = Page 4
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync with scroll progress if scroll-controlled
  useEffect(() => {
    if (!isScrollControlled) return;

    if (scrollProgress < 0.25) {
      setActivePageIndex(0);
    } else if (scrollProgress < 0.5) {
      setActivePageIndex(1);
    } else if (scrollProgress < 0.75) {
      setActivePageIndex(2);
    } else {
      setActivePageIndex(3);
    }
  }, [scrollProgress, isScrollControlled]);

  const handleNextPage = () => {
    setActivePageIndex((prev) => {
      const next = prev < 3 ? prev + 1 : 0;
      if (onPageChange) onPageChange(next);
      return next;
    });
  };

  const handlePrevPage = () => {
    setActivePageIndex((prev) => {
      const next = prev > 0 ? prev - 1 : 3;
      if (onPageChange) onPageChange(next);
      return next;
    });
  };

  const handleSelectPage = (index) => {
    setActivePageIndex(index);
    if (onPageChange) onPageChange(index);
  };

  // Helper to determine CSS transform and stacking for each page
  const getPageStyle = (pageIndex) => {
    if (pageIndex < activePageIndex) {
      // Page has flown away upwards!
      return {
        transform: 'translateY(-135%) rotate(-10deg) scale(0.92)',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: 50,
        transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
      };
    }
    if (pageIndex === activePageIndex) {
      // Active current page in front
      return {
        transform: 'translateY(0px) rotate(0deg) scale(1)',
        opacity: 1,
        pointerEvents: 'auto',
        zIndex: 40,
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      };
    }
    // Stacking behind
    const depth = pageIndex - activePageIndex;
    const translateY = depth * 6;
    const scale = 1 - depth * 0.025;
    const opacity = 1 - depth * 0.2;
    return {
      transform: `translateY(${translateY}px) scale(${scale})`,
      opacity: Math.max(0.35, opacity),
      pointerEvents: 'none',
      zIndex: 40 - depth * 10,
      transition: 'all 0.55s cubic-bezier(0.16, 1, 0.3, 1)'
    };
  };

  return (
    <div className="relative w-full max-w-[390px] sm:max-w-[420px] mx-auto select-none pt-4 pb-2">
      
      {/* 1. Page Indicator Pills & Controls */}
      <div className="flex items-center justify-between gap-1.5 mb-3 px-1 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          {[
            { id: 0, label: 'P.1 Cover' },
            { id: 1, label: 'P.2 Quote' },
            { id: 2, label: 'P.3 Terms' },
            { id: 3, label: 'P.4 Seal' }
          ].map((item) => {
            const isActive = activePageIndex === item.id;
            const isCompleted = activePageIndex > item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectPage(item.id)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-red-500'
                    : isCompleted
                    ? 'bg-white/20 text-emerald-300 hover:bg-white/30 backdrop-blur-xs'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20 backdrop-blur-xs'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 size={10} className="text-emerald-400" />
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-red-600' : 'bg-slate-400'}`} />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Step Flip Arrows */}
        <div className="flex items-center gap-0.5 shrink-0 bg-white/15 backdrop-blur-xs p-0.5 rounded-lg border border-white/20">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={activePageIndex === 0}
            className="p-1 rounded text-slate-200 hover:text-white hover:bg-white/20 disabled:opacity-40 transition cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft size={13} />
          </button>
          <span className="text-[10px] font-mono font-bold px-1 text-slate-200">
            {activePageIndex + 1}/4
          </span>
          <button
            type="button"
            onClick={handleNextPage}
            className="p-1 rounded text-slate-200 hover:text-white hover:bg-white/20 transition cursor-pointer"
            title={activePageIndex === 3 ? 'Back to Page 1' : 'Next Page'}
          >
            {activePageIndex === 3 ? <RotateCcw size={12} /> : <ChevronRight size={13} />}
          </button>
        </div>
      </div>

      {/* 2. THE TILTED CLIPBOARD CONTAINER (Exactly matching reference image!) */}
      <div className="relative transform rotate-[-4.5deg] sm:rotate-[-5.5deg] hover:rotate-[-3deg] transition-transform duration-500">
        
        {/* Realistic Metallic / Silver Clipboard Clamp at Top */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none drop-shadow-md">
          {/* Clamp Hanging Loop */}
          <div className="w-8 h-3.5 rounded-t-full border-2 border-slate-300 bg-slate-200/90 mb-[-1px]" />
          {/* Main Silver Metallic Clamp Plate */}
          <div className="w-28 sm:w-32 h-6 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 rounded-md border border-slate-400/80 shadow-md flex items-center justify-center relative">
            {/* Center Rivet */}
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-500 shadow-inner" />
            {/* Grip lines */}
            <div className="absolute left-3 w-4 h-0.5 bg-slate-400/60 rounded" />
            <div className="absolute right-3 w-4 h-0.5 bg-slate-400/60 rounded" />
          </div>
        </div>

        {/* 3D Floating Red Checkmark Badge at Bottom Right (As in reference image!) */}
        <div className="absolute -bottom-3.5 -right-3.5 z-50 pointer-events-none drop-shadow-xl animate-bounce-subtle">
          <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-red-600 via-red-500 to-rose-500 border-[3px] border-white shadow-2xl flex items-center justify-center text-white">
            <Check size={22} className="stroke-[3.5] drop-shadow-xs" />
          </div>
        </div>

        {/* Ambient Soft Red Glow behind the tilted clipboard */}
        <div className="absolute -inset-3 bg-gradient-to-r from-red-600/35 via-rose-500/25 to-amber-500/20 rounded-3xl blur-xl -z-10 pointer-events-none" />

        {/* The Document Stack: Height ~460px sm:~490px (Chhota & Compact) */}
        <div className="relative min-h-[460px] sm:min-h-[490px] w-full bg-slate-200/60 rounded-2xl p-1.5 shadow-2xl border border-slate-300/80">
          
          {/* ========================================================
              PAGE 1: OFFICIAL COVER LETTER (Compact)
             ======================================================== */}
          <div
            style={getPageStyle(0)}
            className="absolute inset-1.5 bg-white text-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-200 flex flex-col justify-between overflow-hidden"
          >
            {/* Diagonal Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <span className="text-3xl sm:text-4xl font-black text-slate-900/[0.035] tracking-widest uppercase rotate-[-28deg] select-none font-serif">
                RAJ BIOSIS
              </span>
            </div>

            <div className="relative z-10 space-y-2 text-[10px] sm:text-[10.5px]">
              {/* Header: Logo left, Maroon text right */}
              <div className="flex items-start justify-between pb-1.5 border-b border-slate-100 gap-2">
                <img
                  src="/logo.png"
                  alt="Raj Biosis"
                  className="h-8 sm:h-9 w-auto object-contain"
                />
                <div className="text-right">
                  <div className="text-xs sm:text-sm font-extrabold text-[#8B0000] tracking-tight font-serif uppercase leading-none">
                    RAJ BIOSIS PVT LTD
                  </div>
                  <div className="text-[8.5px] sm:text-[9.5px] text-[#8B0000] italic font-serif">
                    we make healthy world
                  </div>
                </div>
              </div>

              {/* Reference line */}
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 font-semibold">
                <span>Ref: RBPL/Q34514NOV26</span>
                <span>Dated: 14.11.2026</span>
              </div>

              {/* Customer To Address */}
              <div className="text-[9.5px] sm:text-[10px] text-slate-700 space-y-0.5">
                <div className="font-bold text-slate-900">To,</div>
                <div className="text-brand-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 inline-block">
                  [Medical Superintendent / Procurement Head]
                </div>
                <div className="text-slate-600">[Customer Hospital / Healthcare Facility]</div>
                <div className="text-slate-600 font-semibold" suppressHydrationWarning>
                  [{mounted ? activeDistrict : 'Jaipur'}, Rajasthan, 302021]
                </div>
              </div>

              {/* Subject */}
              <div className="font-bold text-slate-900 text-[10px] pt-0.5 underline">
                Sub: Quotation purchase of Lab &amp; Biomedical Equipment
              </div>

              {/* Body Text */}
              <div className="space-y-1.5 text-[9px] sm:text-[9.5px] text-slate-700 leading-relaxed">
                <p>Dear Sir,</p>
                <p>
                  At the outset, we wish to thank you for giving us an opportunity to explore a business opportunity with your esteemed organization. It&apos;s great pleasure to introduce to you our Instruments designed to significantly increase productivity and clinical performance in your medical facility.
                </p>
                <p>
                  We at <strong>RAJ BIOSIS PVT LTD.</strong> believe these instruments will be highly effective. Our biomedical engineers will make themselves available for any further technical consultation.
                </p>
                <p className="italic text-slate-500">
                  &ldquo;We want to see you succeed and when you succeed, we succeed.&rdquo;
                </p>
              </div>

              {/* Signature Block (Company details only, no personal owner name) */}
              <div className="pt-1 text-[9px] text-slate-800 space-y-0.5 leading-tight">
                <div className="text-slate-500">Yours faithfully,</div>
                <div className="font-extrabold text-slate-900">Authorized Signatory</div>
                <div className="text-slate-600">Institutional Sales &amp; Support Division</div>
                <div className="font-bold text-[#8B0000]">Raj Biosis Pvt Ltd.</div>
                <div className="text-slate-600">
                  1st Floor, F-4, Plot No. 16, D-Block, Tagore Nagar, Nr. 200 FT, Jaipur-302021
                </div>
                <div className="text-slate-700 font-mono font-semibold">Toll-Free: 9983333469</div>
              </div>
            </div>

            {/* Red Footer Line & Text */}
            <div className="relative z-10 pt-1.5 border-t border-[#8B0000]">
              <div className="text-center space-y-0.5 text-[7.5px] sm:text-[8px] text-slate-500">
                <div className="font-bold text-[#8B0000] uppercase">
                  RAJ BIOSIS PRIVATE LIMITED
                </div>
                <div>
                  1st Floor, F-4, Plot No. 16, D-Block, Tagore Nagar, Nr. 200 FT, Jaipur - 302021, Rajasthan
                </div>
                <div className="flex items-center justify-between text-[7px] text-slate-400 font-mono pt-0.5">
                  <span>Tel: 9983333469 • info@rajbiosis.com</span>
                  <span className="font-bold text-slate-600 bg-slate-100 px-1 rounded">Page 1 of 4</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              PAGE 2: OFFICIAL QUOTATION TABLE (Compact)
             ======================================================== */}
          <div
            style={getPageStyle(1)}
            className="absolute inset-1.5 bg-white text-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-200 flex flex-col justify-between overflow-hidden"
          >
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <span className="text-3xl sm:text-4xl font-black text-slate-900/[0.035] tracking-widest uppercase rotate-[-28deg] select-none font-serif">
                RAJ BIOSIS
              </span>
            </div>

            <div className="relative z-10 space-y-2 text-[10px]">
              {/* Header */}
              <div className="flex items-start justify-between pb-1.5 border-b border-slate-100 gap-2">
                <img
                  src="/logo.png"
                  alt="Raj Biosis"
                  className="h-8 sm:h-9 w-auto object-contain"
                />
                <div className="text-right">
                  <div className="text-xs sm:text-sm font-extrabold text-[#8B0000] tracking-tight font-serif uppercase leading-none">
                    RAJ BIOSIS PVT LTD
                  </div>
                  <div className="text-[8.5px] sm:text-[9.5px] text-[#8B0000] italic font-serif">
                    we make healthy world
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center pt-0.5">
                <span className="text-xs sm:text-sm font-black text-slate-900 tracking-wider uppercase underline">
                  QUOTATION
                </span>
              </div>

              {/* Ref & To */}
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 font-semibold">
                <span>Ref: RBPL/Q34514NOV26</span>
                <span>Dated: 14.11.2026</span>
              </div>

              <div className="text-[9.5px] text-slate-700">
                <span className="font-bold">To, </span>
                <span className="text-brand-800 font-bold bg-amber-50 px-1 py-0.5 rounded border border-amber-200/60">
                  [Hospital Procurement Division]
                </span>
                <span className="text-slate-500 ml-1" suppressHydrationWarning>[{mounted ? activeDistrict : 'Jaipur'}]</span>
              </div>

              {/* Table (Sanitized: NO prices, NO product leaks) */}
              <div className="border border-slate-900 rounded overflow-hidden text-[9px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-900 text-slate-900 font-bold text-center">
                      <th className="py-1 px-1 border-r border-slate-900 w-8">Sr.</th>
                      <th className="py-1 px-1 border-r border-slate-900 w-14">Code</th>
                      <th className="py-1 px-1.5 border-r border-slate-900 text-left">Description</th>
                      <th className="py-1 px-1 border-r border-slate-900 w-10">Qty</th>
                      <th className="py-1 px-1.5 w-16">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-900/40 text-center font-medium">
                      <td className="py-2.5 px-1 border-r border-slate-900">1</td>
                      <td className="py-2.5 px-1 border-r border-slate-900 font-mono text-slate-400">-</td>
                      <td className="py-2.5 px-1.5 border-r border-slate-900 text-left font-semibold text-slate-800">
                        [Hospital Equipment Specification as per RFQ]
                      </td>
                      <td className="py-2.5 px-1 border-r border-slate-900 font-mono">1 No</td>
                      <td className="py-2.5 px-1.5 font-mono text-slate-400">--.--</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold text-slate-900 text-[8.5px]">
                      <td colSpan={3} className="py-1.5 px-1.5 border-r border-slate-900 text-left">
                        (In Words: Official Proforma Issued on Verified Enquiry)
                      </td>
                      <td colSpan={2} className="py-1.5 px-1.5 text-right text-brand-700">
                        [Price on Request]
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Notices */}
              <div className="pt-1 text-[9px] text-slate-800 space-y-0.5">
                <div className="font-extrabold text-slate-900">For RAJ BIOSIS PVT. LTD.</div>
                <div className="text-slate-600 text-[8.5px]">Marketing/Technical Dept.</div>
                <div className="pt-1 space-y-0.5 text-[8.5px] font-bold text-[#8B0000]">
                  <div>➤ SEE OVERLEAF FOR TERMS &amp; CONDITIONS</div>
                  <div>➤ QUOTATION VALID FOR A PERIOD OF 30 DAYS</div>
                </div>
              </div>
            </div>

            {/* Red Footer Line */}
            <div className="relative z-10 pt-1.5 border-t border-[#8B0000]">
              <div className="text-center space-y-0.5 text-[7.5px] sm:text-[8px] text-slate-500">
                <div className="font-bold text-[#8B0000] uppercase">
                  RAJ BIOSIS PRIVATE LIMITED
                </div>
                <div>
                  1st Floor, F-4, Plot No. 16, D-Block, Tagore Nagar, Nr. 200 FT, Jaipur - 302021, Rajasthan
                </div>
                <div className="flex items-center justify-between text-[7px] text-slate-400 font-mono pt-0.5">
                  <span>Tel: 9983333469 • info@rajbiosis.com</span>
                  <span className="font-bold text-slate-600 bg-slate-100 px-1 rounded">Page 2 of 4</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              PAGE 3: TERMS AND CONDITIONS (Part 1 - Compact)
             ======================================================== */}
          <div
            style={getPageStyle(2)}
            className="absolute inset-1.5 bg-white text-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-200 flex flex-col justify-between overflow-hidden"
          >
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <span className="text-3xl sm:text-4xl font-black text-slate-900/[0.035] tracking-widest uppercase rotate-[-28deg] select-none font-serif">
                RAJ BIOSIS
              </span>
            </div>

            <div className="relative z-10 space-y-1.5 text-[9px] sm:text-[9.5px]">
              {/* Header */}
              <div className="flex items-start justify-between pb-1 border-b border-slate-100 gap-2">
                <img
                  src="/logo.png"
                  alt="Raj Biosis"
                  className="h-8 sm:h-9 w-auto object-contain"
                />
                <div className="text-right">
                  <div className="text-xs sm:text-sm font-extrabold text-[#8B0000] tracking-tight font-serif uppercase leading-none">
                    RAJ BIOSIS PVT LTD
                  </div>
                  <div className="text-[8.5px] sm:text-[9.5px] text-[#8B0000] italic font-serif">
                    we make healthy world
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center">
                <span className="text-[11px] font-black text-slate-900 tracking-wider uppercase underline">
                  TERMS AND CONDITIONS
                </span>
              </div>

              {/* Legal Points */}
              <div className="space-y-1.5 text-[8.5px] text-slate-700 leading-snug">
                <div>
                  <strong className="text-slate-900 uppercase">1. TITLE AND PAYMENT: </strong>
                  <span>All payments in favor of &lsquo;RAJ BIOSIS PVT LTD&rsquo; only by Cheque/DD payable at Jaipur. Cash payment not entertained. Delay beyond agreed credit period attracts 24% p.a. interest. RBPL retains ownership until full payment.</span>
                </div>

                <div>
                  <strong className="text-slate-900 uppercase">2. WARRANTY: </strong>
                  <span>12 Months warranty. In the event of unauthorized inspection, warranty stands void.</span>
                </div>

                <div>
                  <strong className="text-slate-900 uppercase">3. DELIVERY &amp; RISKS: </strong>
                  <span>Customer Service Department (CSD) at Head Office. RBPL insures transit only; upon delivery onus shifts to buyer.</span>
                </div>

                <div>
                  <strong className="text-slate-900 uppercase">4. CANCELLATION / RETURN: </strong>
                  <span>Orders cannot be cancelled normally. Minimum 10% cancellation charge applies. Reagents once sold not taken back.</span>
                </div>
              </div>
            </div>

            {/* Red Footer Line */}
            <div className="relative z-10 pt-1.5 border-t border-[#8B0000]">
              <div className="text-center space-y-0.5 text-[7.5px] sm:text-[8px] text-slate-500">
                <div className="font-bold text-[#8B0000] uppercase">
                  RAJ BIOSIS PRIVATE LIMITED
                </div>
                <div>
                  1st Floor, F-4, Plot No. 16, D-Block, Tagore Nagar, Nr. 200 FT, Jaipur - 302021, Rajasthan
                </div>
                <div className="flex items-center justify-between text-[7px] text-slate-400 font-mono pt-0.5">
                  <span>Tel: 9983333469 • info@rajbiosis.com</span>
                  <span className="font-bold text-slate-600 bg-slate-100 px-1 rounded">Page 3 of 4</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              PAGE 4: TERMS AND CONDITIONS (Part 2) & SEAL (Compact)
             ======================================================== */}
          <div
            style={getPageStyle(3)}
            className="absolute inset-1.5 bg-white text-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-200 flex flex-col justify-between overflow-hidden"
          >
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <span className="text-3xl sm:text-4xl font-black text-slate-900/[0.035] tracking-widest uppercase rotate-[-28deg] select-none font-serif">
                RAJ BIOSIS
              </span>
            </div>

            <div className="relative z-10 space-y-2 text-[9px] sm:text-[9.5px]">
              {/* Header */}
              <div className="flex items-start justify-between pb-1 border-b border-slate-100 gap-2">
                <img
                  src="/logo.png"
                  alt="Raj Biosis"
                  className="h-8 sm:h-9 w-auto object-contain"
                />
                <div className="text-right">
                  <div className="text-xs sm:text-sm font-extrabold text-[#8B0000] tracking-tight font-serif uppercase leading-none">
                    RAJ BIOSIS PVT LTD
                  </div>
                  <div className="text-[8.5px] sm:text-[9.5px] text-[#8B0000] italic font-serif">
                    we make healthy world
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center">
                <span className="text-[11px] font-black text-slate-900 tracking-wider uppercase underline">
                  TERMS AND CONDITIONS (CONTD.)
                </span>
              </div>

              {/* Terms Points */}
              <div className="space-y-1.5 text-[8.5px] sm:text-[9px] text-slate-700 leading-snug">
                <div>
                  <strong className="text-slate-900 uppercase">5. TAXES: </strong>
                  <span>All taxes, charges and levies shall be to buyer&apos;s account.</span>
                </div>
                <div>
                  <strong className="text-slate-900 uppercase">6. JURISDICTION: </strong>
                  <span>All goods sold are subject to <strong>Jaipur Jurisdiction</strong>.</span>
                </div>
                <div>
                  <strong className="text-slate-900 uppercase">7. FORCE MAJEURE: </strong>
                  <span>RBPL not responsible for events like war, floods, epidemics or strikes.</span>
                </div>
                <div>
                  <strong className="text-slate-900 uppercase">8. PAYMENT: </strong>
                  <span className="font-bold text-slate-900">100% Advance</span>
                </div>
                <div>
                  <strong className="text-slate-900 uppercase">9. OCTROI / ENTRY TAX: </strong>
                  <span>Extra as applicable.</span>
                </div>
              </div>

              {/* Official Round Stamped Seal Box */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div className="text-[7.5px] text-slate-500 space-y-0.5">
                  <div className="font-bold text-slate-800">ISO 13485:2016 Certified Facility</div>
                  <div>CDSCO Registered Medical Device Manufacturing</div>
                </div>

                <div className="border border-emerald-700/80 rounded-xl p-1.5 bg-emerald-50/70 rotate-[-2deg] text-center shadow-2xs">
                  <div className="text-[7px] font-black tracking-widest text-emerald-800 uppercase">
                    RAJ BIOSIS PVT LTD
                  </div>
                  <div className="text-[9px] font-black text-emerald-700 flex items-center justify-center gap-0.5 my-0.5">
                    <CheckCircle2 size={10} className="text-emerald-600" />
                    <span>VERIFIED PROFORMA</span>
                  </div>
                  <div className="text-[6.5px] font-mono text-emerald-800/80">
                    HEAD OFFICE • JAIPUR
                  </div>
                </div>
              </div>
            </div>

            {/* Red Footer Line */}
            <div className="relative z-10 pt-1.5 border-t border-[#8B0000]">
              <div className="text-center space-y-0.5 text-[7.5px] sm:text-[8px] text-slate-500">
                <div className="font-bold text-[#8B0000] uppercase">
                  RAJ BIOSIS PRIVATE LIMITED
                </div>
                <div>
                  1st Floor, F-4, Plot No. 16, D-Block, Tagore Nagar, Nr. 200 FT, Jaipur - 302021, Rajasthan
                </div>
                <div className="flex items-center justify-between text-[7px] text-slate-400 font-mono pt-0.5">
                  <span>Tel: 9983333469 • info@rajbiosis.com</span>
                  <span className="font-bold text-slate-600 bg-slate-100 px-1 rounded">Page 4 of 4</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Floating Action Button below the tilted clipboard */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={handleNextPage}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-[11px] font-bold transition border border-white/20 backdrop-blur-xs cursor-pointer shadow-sm"
        >
          <span>{activePageIndex === 3 ? '↺ Back to Page 1' : `Peel & Flip Page (${activePageIndex + 2} of 4) →`}</span>
        </button>
      </div>

    </div>
  );
}
