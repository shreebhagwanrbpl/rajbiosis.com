'use client';

import React, { useState } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle2,
  Building2
} from 'lucide-react';

export default function CapexCalculator({ onOpenRfq }) {
  const [totalBeds, setTotalBeds] = useState(100);
  const [icuBeds, setIcuBeds] = useState(12);
  const [otCount, setOtCount] = useState(3);

  // Financial Calculations
  // Avg Capex estimate for ICU bed equipment: ₹3.8L each
  // Avg Capex estimate for general bed equipment (monitor, bed, pump): ₹1.2L each
  // Avg Capex for OT suite: ₹26L each
  const totalCapex = (icuBeds * 380000) + ((totalBeds - icuBeds) * 120000) + (otCount * 2600000);
  
  // Traditional distributor / broker markup is typically 22% - 28%
  const estimatedSavings = Math.round(totalCapex * 0.24);
  const annualAmcSavings = Math.round((totalCapex * 0.08) * 0.35); // 35% savings on AMC via direct OEM engineers

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text & Interactive Sliders (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 mb-2 uppercase tracking-wider">
                <Calculator size={13} className="text-emerald-600" />
                <span>Institutional Capex & ROI Sizing Engine</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Direct OEM Procurement Savings Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Calculate how much your hospital or medical college saves by eliminating 3rd-party distributor markups and procuring direct from Raj Biosis OEM with unified on-site engineering.
              </p>
            </div>

            {/* Sliders Container */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-5">
              {/* Slider 1: Total Hospital Beds */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
                  <span>Total Hospital Beds Capacity:</span>
                  <span className="text-blue-700 font-extrabold text-sm">{totalBeds} Beds</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={totalBeds}
                  onChange={(e) => setTotalBeds(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>20 Beds (Nursing Home)</span>
                  <span>500 Beds (Super Speciality)</span>
                </div>
              </div>

              {/* Slider 2: Critical Care ICU Beds */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
                  <span>Level-3 Critical Care ICU Beds:</span>
                  <span className="text-teal-700 font-extrabold text-sm">{icuBeds} ICU Beds</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="60"
                  step="2"
                  value={icuBeds}
                  onChange={(e) => setIcuBeds(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              {/* Slider 3: Operating Theatres */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
                  <span>Surgical Operating Theatres (OT):</span>
                  <span className="text-indigo-700 font-extrabold text-sm">{otCount} Modular OTs</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={otCount}
                  onChange={(e) => setOtCount(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Live Savings Display (6 Cols) */}
          <div className="lg:col-span-6 bg-gradient-to-br from-blue-50 via-teal-50/50 to-sky-50 rounded-3xl border border-blue-200/80 p-6 sm:p-10 shadow-lg space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-blue-200/60">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Institutional Financial Summary
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                ~24% Capex Saved
              </span>
            </div>

            {/* Big Estimated Savings Metric */}
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Estimated Hospital Capex Savings (vs Traditional Middlemen):
              </div>
              <div className="text-3xl sm:text-5xl font-black text-emerald-700 tracking-tight mt-1">
                {formatINR(estimatedSavings)}
              </div>
              <span className="text-xs text-slate-600 mt-1 block">
                Direct factory transfer pricing with 100% genuine warranty & zero distributor inflation.
              </span>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/90 p-4 rounded-xl border border-blue-200/60 shadow-2xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Annual AMC Savings</div>
                <div className="text-lg sm:text-xl font-extrabold text-blue-700 mt-0.5">
                  {formatINR(annualAmcSavings)}/yr
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Unified engineer network</div>
              </div>

              <div className="bg-white/90 p-4 rounded-xl border border-blue-200/60 shadow-2xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Delivery & Setup</div>
                <div className="text-lg sm:text-xl font-extrabold text-teal-700 mt-0.5">
                  7 - 14 Days
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Pan-India express logistics</div>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>100% Tax Deductible Institutional GST Invoicing with Input Credit.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>Free On-Site Biomedical Calibration & Staff Orientation Training.</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                onClick={() => onOpenRfq()}
                className="btn-primary-blue w-full py-3.5 text-sm shadow-md"
              >
                <FileText size={16} />
                <span>Export Sizing & Savings Proposal (RFQ)</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
