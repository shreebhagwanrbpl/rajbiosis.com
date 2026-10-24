'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  HeartPulse, 
  Activity, 
  Radio, 
  Scissors, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Layers, 
  Wrench,
  Zap,
  Building2,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { PRODUCTS } from '../data/products';

export default function ClinicalSuiteHero({ onOpenRfq }) {
  // 4 Core High-Impact Clinical Specialty Suites
  const suites = [
    {
      id: "icu-suite",
      title: "Smart ICU 4.0 Critical Care Life Support",
      categoryName: "ICU & Critical Care",
      primaryProduct: PRODUCTS[0], // RajBiosis-Vent Pro-X9 Turbine Mechanical Ventilator
      secondaryProduct: PRODUCTS[1], // CardioPulse Monitor
      description: "Next-generation integrated turbine life-support and 6-parameter continuous telemetry for adult, pediatric, and neonatal critical care.",
      stats: [
        { label: "Turbine MTBF", val: "30,000 Hrs" },
        { label: "Battery Runtime", val: "4.5 Hours" },
        { label: "HFNC Flow Rate", val: "Up to 80 L/min" },
        { label: "Regulatory", val: "US-FDA & CE" }
      ],
      themeColor: "from-blue-600 to-sky-500",
      pillBadge: "Flagship Life Support Unit"
    },
    {
      id: "ot-suite",
      title: "Hybrid OT & 4K Minimally Invasive Surgery",
      categoryName: "Surgical & Operating Theatre",
      primaryProduct: PRODUCTS[10], // 4K Laparoscopy Tower
      secondaryProduct: PRODUCTS[7], // ElectroSurg Max 400W Cautery
      description: "Ultra-HD 4K laparoscopy visualization paired with microprocessor impedance-controlled 400W tissue vessel sealing.",
      stats: [
        { label: "Sensor Resolution", val: "3840 x 2160 4K" },
        { label: "Vessel Sealing", val: "Up to 7mm Lumen" },
        { label: "LED Illumination", val: "160,000 Lux" },
        { label: "Table Load", val: "300 kg Capacity" }
      ],
      themeColor: "from-teal-600 to-emerald-500",
      pillBadge: "Precision Surgical Suite"
    },
    {
      id: "radiology-suite",
      title: "High-Frequency 500mA Digital Radiography",
      categoryName: "Radiology & Imaging",
      primaryProduct: PRODUCTS[4], // Digital X-Ray DR System
      secondaryProduct: PRODUCTS[5], // Ultrasound 4D
      description: "High-frequency inverter radiography with 17x17 Wireless CsI Flat Panel Detector and turnkey AERB site clearance advisory.",
      stats: [
        { label: "Inverter Output", val: "50 kW / 500mA" },
        { label: "Detector Matrix", val: "3072 x 3072 px" },
        { label: "Dose Reduction", val: "Up to 70% Lower" },
        { label: "Accreditation", val: "AERB Approved" }
      ],
      themeColor: "from-indigo-600 to-blue-500",
      pillBadge: "Diagnostic Imaging Suite"
    },
    {
      id: "pathology-suite",
      title: "High-Throughput Clinical Laboratory Systems",
      categoryName: "Diagnostic & Lab Systems",
      primaryProduct: PRODUCTS[11], // 5-Part Hematology Analyzer
      secondaryProduct: PRODUCTS[12], // 12-Channel ECG Machine
      description: "Automated 5-part differential laser scatter hematology processing 60 samples/hour with bi-directional hospital LIS export.",
      stats: [
        { label: "Sample Throughput", val: "60 Tests/Hour" },
        { label: "Parameters", val: "28 Parameters" },
        { label: "Micro-Volume", val: "Only 15 µL Blood" },
        { label: "Integration", val: "HL7 HIS Protocol" }
      ],
      themeColor: "from-cyan-600 to-teal-500",
      pillBadge: "Automated Clinical Lab"
    }
  ];

  const [activeSuiteIdx, setActiveSuiteIdx] = useState(0);
  const currentSuite = suites[activeSuiteIdx];

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <section id="equipment-showcase" className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200/90 py-10 lg:py-16 overflow-hidden">
      {/* Background Soft Modern Lighting */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-sky-100/40 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-1/4 w-[450px] h-[450px] bg-teal-100/30 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modern Section Header */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 mb-3 uppercase tracking-wider">
            <Sparkles size={13} className="text-blue-600" />
            <span>Interactive Biomedical Hardware Studio</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            Engineered for <span className="bg-gradient-to-r from-blue-600 via-sky-600 to-teal-500 bg-clip-text text-transparent">High-Acuity Healthcare</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Explore turnkey biomedical hardware suites configured for NABH accredited hospitals, critical care ICUs, and advanced surgical theatres.
          </p>
        </div>

        {/* Clinical Suite Selector Tabs (Completely Unique Interface!) */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-3 mb-8">
          {suites.map((suite, idx) => (
            <button
              key={suite.id}
              onClick={() => setActiveSuiteIdx(idx)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-2 shrink-0 ${
                activeSuiteIdx === idx
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeSuiteIdx === idx ? 'bg-sky-400' : 'bg-slate-300'}`}></span>
              <span>{suite.categoryName}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Interactive Suite Card Showcase */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10 lg:p-12 transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Hardware Media & Spotlight (6 Cols) */}
            <div className="lg:col-span-6 relative">
              <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center p-4 group">
                <img
                  src={currentSuite.primaryProduct.image}
                  alt={currentSuite.primaryProduct.name}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                />

                {/* Floating Hotspot Tag */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                    {currentSuite.pillBadge}
                  </span>
                  <span className="text-xs font-extrabold text-slate-900">
                    {currentSuite.primaryProduct.brand}
                  </span>
                </div>

                {/* Regulatory Chip */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 shadow-sm text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-emerald-600" />
                    <span>IEC 60601 Electrical Safety Tested</span>
                  </span>
                  <span className="text-[11px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    Factory Calibrated
                  </span>
                </div>
              </div>
            </div>

            {/* Right Information & Technical Telemetry (6 Cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md inline-block mb-2">
                  {currentSuite.categoryName} Specialization
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                  {currentSuite.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mt-2">
                  {currentSuite.description}
                </p>
              </div>

              {/* Hardware Performance Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200/90 p-4 rounded-2xl">
                {currentSuite.stats.map((stat, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
                      {stat.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Featured Device Price & Procurement CTA */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Featured Core System ({currentSuite.primaryProduct.name.split(' ')[0]})
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      {formatINR(currentSuite.primaryProduct.price)}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      {formatINR(currentSuite.primaryProduct.mrp)}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    100% Tax Deductible Institutional GST Invoicing
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/product/${currentSuite.primaryProduct.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition"
                  >
                    <span>Hardware Specs</span>
                    <ArrowRight size={15} />
                  </Link>

                  <button
                    onClick={() => onOpenRfq(currentSuite.primaryProduct)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
                  >
                    <FileText size={15} />
                    <span>Get RFQ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
