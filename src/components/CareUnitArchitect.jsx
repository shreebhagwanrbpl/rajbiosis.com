'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  Sliders, 
  FileText, 
  Layers, 
  ArrowRight,
  Zap,
  ShieldCheck,
  Calculator
} from 'lucide-react';
import { PRODUCTS } from '../data/products';

export default function CareUnitArchitect({ onOpenRfq }) {
  // Pre-configured care-unit blueprints
  const blueprints = [
    {
      id: "icu-10bed",
      name: "10-Bed Level-3 Critical Care ICU",
      department: "ICU & Life Support",
      capexRange: "₹38 Lakhs - ₹48 Lakhs",
      summary: "Complete high-acuity life support setup compliant with NABH Level-3 standards, continuous multipara telemetry, and central monitoring.",
      equipmentList: [
        { name: "Turbine Mechanical Ventilators", qty: "4 Units", model: "RajBiosis-Vent Pro-X9" },
        { name: "6-Parameter Multipara Monitors", qty: "10 Units", model: "CardioPulse 12.1\"" },
        { name: "Biphasic Defibrillator with Pacer", qty: "2 Units", model: "DefiQuick 360J" },
        { name: "Precision Syringe Infusion Pumps", qty: "16 Units", model: "PrecisionFlow Dual" },
        { name: "5-Function Motorized ICU Beds", qty: "10 Units", model: "ComfortCare Linak" },
        { name: "Emergency Crash Cart Trolleys", qty: "2 Units", model: "RajEmergency ABS" }
      ],
      infrastructureSpecs: {
        gasOutlets: "Dual O2 + Medical Air + Vacuum per bed",
        upsLoad: "15 kVA Dedicated True Online UPS",
        engineerSetup: "Included (48-hr Commissioning)"
      }
    },
    {
      id: "ot-modular",
      name: "Modular Surgical Operating Theatre (OT)",
      department: "Surgical & OT",
      capexRange: "₹24 Lakhs - ₹35 Lakhs",
      summary: "Advanced surgical suite for general, laparoscopic, orthopedic, and gynecological surgeries with shadowless lighting and vessel sealing.",
      equipmentList: [
        { name: "Dual-Dome LED Shadowless OT Lights", qty: "1 Set", model: "LumiLux Duo 160K Lux" },
        { name: "Electro-Hydraulic Surgical Table", qty: "1 Unit", model: "OmniFlex 300kg Load" },
        { name: "400W Vessel Sealer Cautery Unit", qty: "1 Unit", model: "ElectroSurg Max 400" },
        { name: "4K Ultra-HD Laparoscopy Tower", qty: "1 Setup", model: "UltraLap 4K UHD" },
        { name: "50L Class-B Autoclave Sterilizer", qty: "1 Unit", model: "SteamSteril 50L" }
      ],
      infrastructureSpecs: {
        gasOutlets: "Surgical Pendants & Gas Columns",
        upsLoad: "10 kVA Isolated Power Supply",
        engineerSetup: "Included (HEPA Laminar Clearance)"
      }
    },
    {
      id: "radiology-center",
      name: "Diagnostic Radiology & Imaging Wing",
      department: "Radiology & Imaging",
      capexRange: "₹28 Lakhs - ₹42 Lakhs",
      summary: "Turnkey digital radiography suite with flat panel digital X-Ray, color Doppler ultrasound, and radiation protection shielding assistance.",
      equipmentList: [
        { name: "500mA High-Frequency Digital X-Ray", qty: "1 System", model: "RajScan Elite 50kW" },
        { name: "Wireless 17x17 CsI Flat Panel Detector", qty: "1 Unit", model: "DirectRadiography DR" },
        { name: "4D Color Doppler Ultrasound Scanner", qty: "1 System", model: "SonoVision 4D + 3 Probes" },
        { name: "Lead Radiation Protection Aprons & Screens", qty: "4 Sets", model: "AERB Certified 0.5mm Pb" }
      ],
      infrastructureSpecs: {
        gasOutlets: "Standard Clinical Outlets",
        upsLoad: "60 kVA Line Conditioner / Stabilizer",
        engineerSetup: "Included (AERB Layout Clearance)"
      }
    }
  ];

  const [selectedBlueprintIdx, setSelectedBlueprintIdx] = useState(0);
  const activePlan = blueprints[selectedBlueprintIdx];

  return (
    <section id="solution-builder" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200/80 mb-2 uppercase tracking-wider">
              <Calculator size={13} className="text-amber-600" />
              <span>Turnkey Hospital Sizing Engine</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Hospital Care-Unit Architect
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Configure full turnkey equipment matrices based on hospital bed capacity, clinical specialties, and capex budgets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Blueprint Version:</span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
              NABH 5th Edition Ready
            </span>
          </div>
        </div>

        {/* Blueprint Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {blueprints.map((bp, idx) => (
            <button
              key={bp.id}
              onClick={() => setSelectedBlueprintIdx(idx)}
              className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                selectedBlueprintIdx === idx
                  ? 'bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-400/20'
                  : 'bg-slate-50/60 hover:bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 block mb-1">
                  {bp.department}
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-snug mb-1">
                  {bp.name}
                </h3>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-baseline justify-between">
                <span className="text-xs text-slate-500">Capex Estimate:</span>
                <span className="text-sm font-extrabold text-slate-900">{bp.capexRange}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Active Blueprint Detailed Matrix */}
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded">
                Verified Turnkey Package
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {activePlan.name} Equipment Blueprint
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                {activePlan.summary}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block font-semibold">Estimated Institutional Turnkey Capex:</span>
              <span className="text-2xl font-black text-blue-700">{activePlan.capexRange}</span>
            </div>
          </div>

          {/* Equipment Grid in this blueprint */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Included Biomedical Systems & Sizing:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activePlan.equipmentList.map((item, i) => (
                <div key={i} className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-blue-600 font-semibold">{item.model}</div>
                  </div>
                  <span className="text-xs font-extrabold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                    {item.qty}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Engineering & Utility Requirements */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white border border-slate-200 p-4 rounded-xl text-xs text-slate-700 mb-6">
            <div>
              <span className="font-bold text-slate-500 block mb-0.5">Medical Gas Pipeline (MGPS):</span>
              <span className="font-semibold text-slate-900">{activePlan.infrastructureSpecs.gasOutlets}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block mb-0.5">Critical Power / Electrical:</span>
              <span className="font-semibold text-slate-900">{activePlan.infrastructureSpecs.upsLoad}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block mb-0.5">Installation & Commissioning:</span>
              <span className="font-semibold text-emerald-700">{activePlan.infrastructureSpecs.engineerSetup}</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>Includes OEM installation, clinical electrical calibration, and staff training.</span>
            </div>

            <button
              onClick={() => onOpenRfq()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transition"
            >
              <FileText size={16} />
              <span>Request Turnkey Sizing Proposal (RFQ)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
