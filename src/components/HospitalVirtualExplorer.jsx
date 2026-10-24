'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  HeartPulse, 
  Radio, 
  Scissors, 
  Activity, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  FileText,
  ChevronRight
} from 'lucide-react';
import { PRODUCTS } from '../data/products';

export default function HospitalVirtualExplorer({ onOpenRfq }) {
  const hospitalUnits = [
    {
      id: "unit-icu",
      name: "Level-3 Critical Care ICU",
      icon: HeartPulse,
      badge: "High-Acuity Unit",
      tagline: "Life support & vital telemetry matrix",
      devices: [
        { product: PRODUCTS[0], role: "Primary Life Support Ventilator", qty: "4 Beds" },
        { product: PRODUCTS[1], role: "Multi-Para Patient Telemetry", qty: "10 Beds" },
        { product: PRODUCTS[2], role: "Emergency Biphasic Defibrillator", qty: "2 Units" },
        { product: PRODUCTS[13], role: "Motorized 5-Function ICU Bed", qty: "10 Units" }
      ],
      turnkeyEstimate: "₹42,50,000"
    },
    {
      id: "unit-ot",
      name: "Modular Hybrid Operating Theatre",
      icon: Scissors,
      badge: "Surgical Block",
      tagline: "Minimally invasive & vessel sealing station",
      devices: [
        { product: PRODUCTS[10], role: "4K UHD Laparoscopy Tower System", qty: "1 Tower" },
        { product: PRODUCTS[7], role: "400W Vessel Sealer Cautery Unit", qty: "1 Console" },
        { product: PRODUCTS[8], role: "Dual-Dome LED Shadowless OT Light", qty: "1 Set" },
        { product: PRODUCTS[9], role: "Hydraulic Universal Surgical Table", qty: "1 Table" }
      ],
      turnkeyEstimate: "₹28,80,000"
    },
    {
      id: "unit-radiology",
      name: "Diagnostic Radiology & Imaging Wing",
      icon: Radio,
      badge: "Radiation Unit",
      tagline: "High-frequency radiography & 4D Doppler",
      devices: [
        { product: PRODUCTS[4], role: "500mA High-Frequency Digital X-Ray", qty: "1 Suite" },
        { product: PRODUCTS[5], role: "4D Color Doppler Ultrasound Scanner", qty: "1 System" },
        { product: PRODUCTS[6], role: "9-Inch High Frequency C-Arm Unit", qty: "1 Unit" }
      ],
      turnkeyEstimate: "₹36,80,000"
    },
    {
      id: "unit-pathology",
      name: "Automated Clinical Pathology Lab",
      icon: Activity,
      badge: "Diagnostic Core",
      tagline: "Laser scatter cell counters & biochemistry",
      devices: [
        { product: PRODUCTS[11], role: "5-Part Differential Hematology Analyzer", qty: "1 Analyzer" },
        { product: PRODUCTS[12], role: "12-Channel Resting ECG Machine", qty: "2 Units" },
        { product: PRODUCTS[15], role: "50L Class-B Autoclave Sterilizer", qty: "1 Unit" }
      ],
      turnkeyEstimate: "₹18,50,000"
    }
  ];

  const [activeUnitId, setActiveUnitId] = useState(hospitalUnits[0].id);
  const activeUnit = hospitalUnits.find(u => u.id === activeUnitId) || hospitalUnits[0];

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 mb-2 uppercase tracking-wider">
            <Building2 size={13} className="text-blue-600" />
            <span>Interactive Hospital Infrastructure Navigator</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Virtual Hospital Care-Unit Explorer
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Navigate through hospital clinical zones to inspect certified biomedical systems deployed in each department.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {hospitalUnits.map(unit => {
            const Icon = unit.icon;
            const isSelected = activeUnitId === unit.id;

            return (
              <button
                key={unit.id}
                onClick={() => setActiveUnitId(unit.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-400/20'
                    : 'bg-white/70 hover:bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {unit.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {unit.name}
                  </h3>
                  <span className="text-[11px] text-blue-600 font-semibold block mt-1">
                    Est: {unit.turnkeyEstimate}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Active Clinical Zone
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                {activeUnit.name} Deployment Architecture
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {activeUnit.tagline} • Standardized for NABH & CDSCO compliance.
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block font-semibold">Turnkey Room Package:</span>
              <span className="text-2xl font-black text-teal-700">{activeUnit.turnkeyEstimate}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {activeUnit.devices.map((dev, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:bg-white hover:border-blue-300 hover:shadow-md transition group">
                <div>
                  <div className="relative w-full h-36 rounded-xl overflow-hidden bg-white mb-3 border border-slate-200/80 p-2">
                    <img 
                      src={dev.product.image} 
                      alt={dev.product.name} 
                      className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute top-3 left-3 bg-white/95 text-[10px] font-extrabold text-blue-700 px-2 py-0.5 rounded shadow-2xs">
                      {dev.qty}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block mb-0.5">
                    {dev.role}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 mb-1">
                    {dev.product.name}
                  </h4>
                  <div className="text-xs font-mono text-slate-400">
                    SKU: {dev.product.sku}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">
                    {formatINR(dev.product.price)}
                  </span>
                  <Link
                    href={`/product/${dev.product.id}`}
                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                  >
                    <span>Inspect</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Includes 100% on-site biomedical engineer commissioning, electrical leakage tests, and user training.</span>
            </div>

            <button
              onClick={() => onOpenRfq()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
            >
              <FileText size={15} />
              <span>Request Complete {activeUnit.name} Quotation</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
