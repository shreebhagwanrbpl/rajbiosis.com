'use client';

import React, { useState, useEffect } from 'react';
import { Check, CheckCircle2 } from 'lucide-react';

export default function ProformaInvoiceSlate({
  scrollProgress = 0,
  isScrollControlled = true,
  onPageChange
}) {
  const [activePageIndex, setActivePageIndex] = useState(0); // 0 = Invoice, 1 = Terms 1, 2 = Terms 2

  // Sync with scroll progress for smooth, slow page transitions
  useEffect(() => {
    if (!isScrollControlled) return;

    // Generous, wide thresholds so each sheet stays readable for a long time
    if (scrollProgress < 0.38) {
      setActivePageIndex(0);
    } else if (scrollProgress < 0.72) {
      setActivePageIndex(1);
    } else {
      setActivePageIndex(2);
    }
  }, [scrollProgress, isScrollControlled]);

  const handleNextPage = () => {
    setActivePageIndex((prev) => {
      const next = prev < 2 ? prev + 1 : 0;
      if (onPageChange) onPageChange(next);
      return next;
    });
  };

  // Silky smooth, ultra-slow flying sheet physics (2.4s cubic-bezier for a majestic, gentle float)
  const getPageStyle = (pageIndex) => {
    if (pageIndex < activePageIndex) {
      // Sheet has gracefully floated away upwards ("bilkul slow")
      return {
        transform: 'translateY(-155%) rotate(-8deg) scale(0.94)',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: 50,
        transition: 'transform 2.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 2.0s cubic-bezier(0.16, 1, 0.3, 1)'
      };
    }
    if (pageIndex === activePageIndex) {
      // Active sheet in front
      return {
        transform: 'translateY(0px) rotate(0deg) scale(1)',
        opacity: 1,
        pointerEvents: 'auto',
        zIndex: 40,
        transition: 'transform 2.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 2.2s cubic-bezier(0.16, 1, 0.3, 1)'
      };
    }
    // Stacking behind
    const depth = pageIndex - activePageIndex;
    const translateY = depth * 6;
    const scale = 1 - depth * 0.03;
    const opacity = 1 - depth * 0.25;
    return {
      transform: `translateY(${translateY}px) scale(${scale})`,
      opacity: Math.max(0.4, opacity),
      pointerEvents: 'none',
      zIndex: 40 - depth * 10,
      transition: 'transform 2.0s cubic-bezier(0.16, 1, 0.3, 1), opacity 2.0s cubic-bezier(0.16, 1, 0.3, 1)'
    };
  };

  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[375px] mx-auto select-none pt-2 pb-1">
      
      {/* THE TILTED CLIPBOARD CONTAINER (Compact, Thoda Tedha, Silver Clamp, 3D Red Checkmark Badge) */}
      <div
        onClick={handleNextPage}
        className="relative transform rotate-[-4.5deg] sm:rotate-[-5.5deg] hover:rotate-[-2.5deg] transition-transform duration-700 cursor-pointer group"
        title="Scroll or click to smoothly peel page"
      >
        
        {/* Metallic Silver Clamp at Top */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none drop-shadow-md">
          {/* Clamp Hanging Loop */}
          <div className="w-7 h-3 rounded-t-full border-2 border-slate-300 bg-slate-200/95 mb-[-1px]" />
          {/* Main Silver Metallic Clamp Plate */}
          <div className="w-24 sm:w-28 h-5 bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 rounded-md border border-slate-400 shadow-sm flex items-center justify-center relative">
            <div className="w-2 h-2 rounded-full bg-slate-400 border border-slate-500 shadow-inner" />
            <div className="absolute left-2.5 w-3 h-0.5 bg-slate-400/70 rounded" />
            <div className="absolute right-2.5 w-3 h-0.5 bg-slate-400/70 rounded" />
          </div>
        </div>

        {/* 3D Floating Red Checkmark Badge at Bottom Right (As in reference image) */}
        <div className="absolute -bottom-3 -right-3 z-50 pointer-events-none drop-shadow-xl animate-bounce-subtle">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-red-600 via-red-500 to-rose-500 border-[2.5px] border-white shadow-xl flex items-center justify-center text-white ring-2 ring-black/10">
            <Check size={20} className="stroke-[3.5] drop-shadow-xs" />
          </div>
        </div>

        {/* Soft Ambient Red Glow behind the tilted clipboard */}
        <div className="absolute -inset-2 bg-gradient-to-r from-red-600/35 via-rose-500/25 to-amber-500/20 rounded-2xl blur-xl -z-10 pointer-events-none" />

        {/* Clipboard Backboard (Compact height ~415px to ~445px) */}
        <div className="relative min-h-[415px] sm:min-h-[445px] w-full bg-slate-200/80 rounded-2xl p-1 shadow-2xl border border-slate-300">
          
          {/* ========================================================
              PAGE 1: ORIGINAL PROFORMA INVOICE (100% Faithful to PDF)
             ======================================================== */}
          <div
            style={getPageStyle(0)}
            className="absolute inset-1 bg-white text-slate-800 rounded-xl p-3 sm:p-3.5 shadow-md border border-slate-200 flex flex-col justify-between overflow-hidden text-[8px] sm:text-[8.5px] leading-tight"
          >
            {/* Header: Logo, Company Info & Title */}
            <div className="flex items-start justify-between pb-1.5 border-b border-slate-200 gap-1.5">
              <div className="flex items-center gap-1.5 shrink-0">
                <img
                  src="/logo.png"
                  alt="Raj Biosis"
                  className="h-7 sm:h-8 w-auto object-contain"
                />
                <div>
                  <div className="text-[9px] sm:text-[10px] font-black text-slate-900 leading-none">
                    Raj Biosis Private Limited
                  </div>
                  <div className="text-[6.5px] text-slate-500 font-mono mt-0.5 leading-tight">
                    F-4, First Floor, D-Block, Plot No.16 Satya Colony, Tagor Nagar, on 200ft, Jaipur Rajasthan 302021 India
                  </div>
                  <div className="text-[6.5px] text-slate-600 font-mono">
                    Phone +91-998-3333-469 • info@rajbiosis.com
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[10px] sm:text-[11px] font-black text-slate-900 tracking-tight">
                  Proforma Invoice
                </div>
                <div className="text-[6.5px] font-mono text-slate-500">
                  GSTIN 08AAECR4942D1ZG
                </div>
              </div>
            </div>

            {/* Meta Grid (Table format exactly as in PDF) */}
            <div className="my-1 border border-slate-300 rounded text-[6.5px] sm:text-[7px] font-mono">
              <div className="grid grid-cols-2 divide-x divide-slate-300 border-b border-slate-300 bg-slate-50 p-0.5 px-1">
                <div>PerformaNo : <strong className="text-slate-900">RBPL/PI/26-27/0447</strong></div>
                <div className="pl-1">Place Of Supply : <strong className="text-slate-900">Rajasthan (08)</strong></div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-300 border-b border-slate-300 p-0.5 px-1">
                <div>Performa Date : <strong>02/05/2026</strong></div>
                <div className="pl-1">Country : <strong>India</strong></div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-300 p-0.5 px-1 bg-slate-50">
                <div>Expiry Date : <strong>31/07/2026</strong></div>
                <div className="pl-1">Delivery Term : <strong>7-8 days</strong></div>
              </div>
            </div>

            {/* Bill To & Ship To Box (Customer Details Blurred for Privacy) */}
            <div className="grid grid-cols-2 gap-1 border border-slate-300 rounded p-1 bg-white text-[6.5px] sm:text-[7px] my-0.5">
              <div>
                <div className="font-bold text-slate-900 border-b border-slate-200 pb-0.5 mb-0.5">Bill To</div>
                <div className="filter blur-[3px] select-none opacity-80">
                  <div className="font-bold text-slate-800">Mr. Vansh Sharma</div>
                  <div className="text-slate-600">New Colony Lalsot 303504 Rajasthan India</div>
                  <div className="text-slate-600">+91-8690120466</div>
                </div>
              </div>
              <div>
                <div className="font-bold text-slate-900 border-b border-slate-200 pb-0.5 mb-0.5">Ship To</div>
                <div className="filter blur-[3px] select-none opacity-80">
                  <div className="font-bold text-slate-800">New Colony</div>
                  <div className="text-slate-600">Lalsot 303504 Rajasthan India</div>
                  <div className="text-slate-600">+91-8690120466</div>
                </div>
              </div>
            </div>

            {/* Item Table (Product Price Amounts Blurred for Privacy) */}
            <div className="border border-slate-300 rounded overflow-hidden text-[6.5px] sm:text-[7px] my-0.5">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 font-bold text-center">
                    <th className="py-0.5 px-0.5 border-r border-slate-300 w-4">#</th>
                    <th className="py-0.5 px-1 border-r border-slate-300 text-left">Item &amp; Description</th>
                    <th className="py-0.5 px-0.5 border-r border-slate-300 w-8">Qty</th>
                    <th className="py-0.5 px-1 border-r border-slate-300 w-10">Rate</th>
                    <th className="py-0.5 px-1 w-10">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200 text-center font-medium">
                    <td className="py-1 px-0.5 border-r border-slate-300">1</td>
                    <td className="py-1 px-1 border-r border-slate-300 text-left font-bold text-slate-800">
                      GLUCO SPARK GLUCOSE METER
                      <span className="block text-[5.5px] text-slate-400 font-mono">HSN: 38220090</span>
                    </td>
                    <td className="py-1 px-0.5 border-r border-slate-300 font-mono">1.0 PCS</td>
                    <td className="py-1 px-1 border-r border-slate-300 font-mono">
                      <span className="filter blur-[3px] select-none opacity-80 inline-block">315.00</span>
                    </td>
                    <td className="py-1 px-1 font-mono font-bold">
                      <span className="filter blur-[3px] select-none opacity-80 inline-block">315.00</span>
                    </td>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-slate-900 text-[6.5px]">
                    <td colSpan={3} className="py-0.5 px-1 border-r border-slate-300 text-left">
                      Total In Words: <span className="filter blur-[3px] select-none opacity-80 inline-block">Rupees Three Hundred Thirty-One Only</span>
                    </td>
                    <td className="py-0.5 px-0.5 border-r border-slate-300 text-center">Total</td>
                    <td className="py-0.5 px-1 text-right font-mono pr-0.5 text-brand-700">
                      <span className="filter blur-[3px] select-none opacity-80 inline-block">₹331.00</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bank Details & Official Stamp Box (Original from PDF) */}
            <div className="grid grid-cols-12 gap-1 pt-1 border-t border-slate-200 items-center">
              
              {/* Bank Account Info */}
              <div className="col-span-8 text-[5.5px] sm:text-[6px] font-mono text-slate-600 space-y-0.5">
                <div className="font-bold text-slate-900">For Payment NEFT/RTGS /IMPS:</div>
                <div>A/c: <strong>Raj Biosis Private Limited</strong></div>
                <div>A/c No: <strong>677005500070</strong> • IFSC: <strong>ICIC0006770</strong></div>
                <div>ICICI Bank Ltd, Gopalpura Branch, Jaipur-302015</div>
              </div>

              {/* Round Stamp & Signature */}
              <div className="col-span-4 text-center flex flex-col items-center justify-center">
                <div className="text-[6px] font-bold text-slate-800 mb-0.5">For Raj Biosis Pvt Ltd</div>
                
                {/* Official Round Rubber Stamp */}
                <div className="relative w-12 h-12 rounded-full border-2 border-indigo-900/85 flex flex-col items-center justify-center p-0.5 rotate-[-5deg] bg-indigo-50/40 shadow-2xs">
                  <span className="text-[4.5px] font-black uppercase tracking-tighter text-indigo-950">
                    RAJ BIOSIS PVT LTD
                  </span>
                  <span className="text-[5.5px] font-black text-indigo-800 my-[-1px]">
                    ★ INDIA ★
                  </span>
                  <span className="text-[4px] font-mono font-bold text-indigo-900">
                    APPROVED
                  </span>
                </div>

                <div className="text-[5.5px] text-slate-500 font-medium mt-0.5">
                  Authorized Signature
                </div>
              </div>

            </div>

            {/* Bottom Sheet Indicator */}
            <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[6px] text-slate-400 font-mono">
              <span>Scroll down to peel sheet</span>
              <span className="font-bold text-slate-600 bg-slate-100 px-1 rounded">Sheet 1 of 3</span>
            </div>
          </div>

          {/* ========================================================
              PAGE 2: TERMS AND CONDITIONS (Part 1 - Original)
             ======================================================== */}
          <div
            style={getPageStyle(1)}
            className="absolute inset-1 bg-white text-slate-800 rounded-xl p-3 sm:p-3.5 shadow-md border border-slate-200 flex flex-col justify-between overflow-hidden text-[8px] sm:text-[8.5px] leading-tight"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-1 border-b border-slate-200 gap-1.5">
              <div className="flex items-center gap-1.5">
                <img src="/logo.png" alt="Raj Biosis" className="h-6 w-auto object-contain" />
                <span className="text-[9px] font-black text-slate-900">Raj Biosis Private Limited</span>
              </div>
              <span className="text-[7.5px] font-mono text-slate-500">GSTIN: 08AAECR4942D1ZG</span>
            </div>

            {/* Title */}
            <div className="text-center py-0.5">
              <span className="text-[10px] font-black text-slate-900 uppercase underline">
                TERMS AND CONDITIONS
              </span>
            </div>

            {/* Terms List (Original text from PDF) */}
            <div className="space-y-1.5 text-[7px] sm:text-[7.5px] text-slate-700 leading-snug">
              <div>
                <strong className="text-slate-900 uppercase">1. TITLE AND PAYMENT: </strong>
                <span>All payments shall be made in favor of &lsquo;RAJ BIOSIS PVT LTD&rsquo; only by Cheque/DD/NEFT/RTGS or Pay Order payable at Jaipur. Cash payment will not be entertained nor any receipt issued. Delay beyond agreed credit period attracts 24% p.a. interest. RBPL retains ownership until full payment is realized.</span>
              </div>

              <div>
                <strong className="text-slate-900 uppercase">2. WARRANTY: </strong>
                <span>Warranty of the instrument stands as per Warranty Card. Warranty excludes consumables like tubing, keypad, lamp etc. Tampering or unauthorized service cancels warranty.</span>
              </div>

              <div>
                <strong className="text-slate-900 uppercase">3. DELIVERY &amp; RISKS: </strong>
                <span>Party must intimate issues within 24 hours at rajbiosis@yahoo.in. RBPL insures transit only; upon delivery, safe guarding onus is on buyer.</span>
              </div>

              <div>
                <strong className="text-slate-900 uppercase">4. CANCELLATION / RETURN: </strong>
                <span>Orders cannot be cancelled normally. Minimum 10% to 20% cancellation charges apply. Reagents once sold not taken back.</span>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[6px] text-slate-400 font-mono">
              <span>Tagore Nagar, 200ft, Jaipur • Tel: 9983333469</span>
              <span className="font-bold text-slate-600 bg-slate-100 px-1 rounded">Sheet 2 of 3</span>
            </div>
          </div>

          {/* ========================================================
              PAGE 3: TERMS & JURISDICTION (Part 2) & SEAL (Original)
             ======================================================== */}
          <div
            style={getPageStyle(2)}
            className="absolute inset-1 bg-white text-slate-800 rounded-xl p-3 sm:p-3.5 shadow-md border border-slate-200 flex flex-col justify-between overflow-hidden text-[8px] sm:text-[8.5px] leading-tight"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-1 border-b border-slate-200 gap-1.5">
              <div className="flex items-center gap-1.5">
                <img src="/logo.png" alt="Raj Biosis" className="h-6 w-auto object-contain" />
                <span className="text-[9px] font-black text-slate-900">Raj Biosis Private Limited</span>
              </div>
              <span className="text-[7.5px] font-mono text-slate-500">Official Execution</span>
            </div>

            {/* Title */}
            <div className="text-center py-0.5">
              <span className="text-[10px] font-black text-slate-900 uppercase underline">
                TERMS &amp; JURISDICTION
              </span>
            </div>

            {/* Terms points (Original from PDF) */}
            <div className="space-y-1.5 text-[7px] sm:text-[7.5px] text-slate-700 leading-snug">
              <div>
                <strong className="text-slate-900 uppercase">5. TAXES: </strong>
                <span>All types of taxes or GST, charges and levies shall be to buyer&apos;s account.</span>
              </div>
              <div>
                <strong className="text-slate-900 uppercase">6. JURISDICTION: </strong>
                <span>All goods sold are subject to <strong>Jaipur Jurisdiction</strong>.</span>
              </div>
              <div>
                <strong className="text-slate-900 uppercase">7. FORCE MAJEURE: </strong>
                <span>RBPL not responsible for events like war, floods, epidemics, earthquakes or strikes.</span>
              </div>
              <div>
                <strong className="text-slate-900 uppercase">8. PAYMENT: </strong>
                <span className="font-bold text-slate-900">100% Advance or maximum 21 days Credit period as per T&amp;C.</span>
              </div>
              <div>
                <strong className="text-slate-900 uppercase">9. OCTROI / ENTRY TAX: </strong>
                <span>Octroi / Entry Tax / Waybill Extra.</span>
              </div>
            </div>

            {/* Official Stamped Seal Box */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div className="text-[6.5px] text-slate-500 space-y-0.5">
                <div className="font-bold text-slate-800">ISO 13485:2016 Certified</div>
                <div>CDSCO Registered Medical Device Facility</div>
              </div>

              <div className="border border-indigo-900/80 rounded-xl p-1 bg-indigo-50/60 rotate-[-2deg] text-center shadow-2xs">
                <div className="text-[6px] font-black tracking-widest text-indigo-950 uppercase">
                  RAJ BIOSIS PVT LTD
                </div>
                <div className="text-[7px] font-black text-indigo-800 flex items-center justify-center gap-0.5 my-0.5">
                  <CheckCircle2 size={8} className="text-indigo-600" />
                  <span>VERIFIED PROFORMA</span>
                </div>
                <div className="text-[5.5px] font-mono text-indigo-900/80">
                  HEAD OFFICE • JAIPUR
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[6px] text-slate-400 font-mono">
              <span>Tagore Nagar, 200ft, Jaipur • Tel: 9983333469</span>
              <span className="font-bold text-slate-600 bg-slate-100 px-1 rounded">Sheet 3 of 3</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
