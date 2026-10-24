'use client';

import React, { useState } from 'react';
import { 
  FileCheck2, 
  Copy, 
  Check, 
  Download, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  Printer, 
  Sliders, 
  ChevronRight,
  Award
} from 'lucide-react';

export default function TenderClauseGenerator() {
  const [selectedDevice, setSelectedDevice] = useState('ventilator');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('gem'); // 'gem', 'nabh', 'cmc'

  const tenderTemplates = {
    ventilator: {
      title: 'Advanced Micro-Turbine ICU Ventilator (Invasive & Non-Invasive)',
      modelRef: 'RajBiosis-Vent Pro-X9',
      gemCategory: 'Medical Ventilator for Intensive Care Unit (Q3/Q4 GeM)',
      standards: 'ISO 13485:2016, CDSCO MD-9, CE Medical Directive, IEC 60601-1, IEC 60601-1-2 EMC',
      technicalClauses: [
        '1.1 The unit must be turbine-based, microprocessor-controlled, capable of ventilating adult, pediatric, and neonatal patients without requiring external high-pressure medical air compressors.',
        '1.2 Peak flow delivery must be at least 240 L/min with active exhalation valve and automatic leak compensation up to 60 L/min.',
        '1.3 Tidal Volume range: 20 mL to 2500 mL in volume-controlled modes; PEEP range: 0 to 50 cmH2O.',
        '1.4 Ventilation Modes required: VCV, PCV, SIMV (V+P), PSV/CPAP, PRVC (Auto-regulating), Bi-Level/APRV, Non-Invasive Ventilation (NIV), High-Flow Oxygen Therapy (HFNC).',
        '1.5 Oxygen Monitoring: Non-depleting ultrasonic paramagnetic sensor with real-time FiO2 delivery display (21% to 100%) without consumable cell replacement.',
        '1.6 Graphic Display: Minimum 15.6-inch color touchscreen with simultaneous display of 3 waveforms (Pressure, Flow, Volume) and 2 clinical loops (P-V, F-V).',
        '1.7 Internal Battery: Dual hot-swappable medical lithium-ion packs offering minimum 6 hours of continuous autonomous ventilation during power failure or transport.'
      ],
      warrantyClause: '5 Years Comprehensive On-Site Manufacturer Warranty including all internal boards, turbine drive, flow sensors, and internal batteries. 98% minimum uptime guarantee with SLA response time < 4 hours in metro cities and < 8 hours across non-metro regions.',
      nabhClause: 'Equipment must provide HL7 / FHIR protocol compatibility for seamless bidirectional integration with hospital EHR/HIS systems. Must include digital calibration logs compliant with NABH Biomedical Engineering Standards Chapter 4.'
    },
    monitor: {
      title: 'High-End Modular Multi-Parameter Patient Monitor (ICU/OT)',
      modelRef: 'CardioPulse 12X Pro',
      gemCategory: 'Multi-Parameter Patient Monitor (GeM Custom Bid)',
      standards: 'ISO 13485, CE Class IIb, CDSCO Approved, IEC 60601-2-27 (ECG), IEC 60601-2-49',
      technicalClauses: [
        '1.1 Modular patient monitor with minimum 15-inch high-resolution anti-glare color display with multi-touch interface.',
        '1.2 Standard parameters: 12-lead diagnostic ECG with ST & Arrhythmia analysis, Impedance Respiration, Dual IBP, Dual Temperature, NIBP with overpressure protection, and Motion-Tolerant SpO2.',
        '1.3 Capnography: Side-stream or Mainstream EtCO2 with continuous numerical value and real-time capnogram curve display.',
        '1.4 Trend Storage: Minimum 120 hours of graphic and tabular trend memory for all monitored parameters with full disclosure wave review.',
        '1.5 Alarms: Multi-tier visible and audible alarms conforming to IEC 60601-1-8 standard with 360-degree top alarm indicator light.',
        '1.6 Connectivity: Built-in Wi-Fi and Ethernet with HL7/FHIR output for central nursing station telemetry.'
      ],
      warrantyClause: '5 Years Comprehensive Manufacturer Warranty + 5 Years Post-Warranty Comprehensive Annual Maintenance Contract (CAMC). Availability of spare parts guaranteed for minimum 10 years from installation.',
      nabhClause: 'Electrical leakage current must not exceed 10 µA under normal condition (CF type applied part). NABL calibration test certificate must be provided at the time of commissioning.'
    },
    laparoscopy: {
      title: 'Integrated 4K Ultra-HD Laparoscopy Surgical Video System',
      modelRef: 'RajBiosis AuraSurg 4K UHD',
      gemCategory: 'Surgical Laparoscopy Tower System (Full OT Package)',
      standards: 'ISO 13485, CE Directive 93/42/EEC, CDSCO Registered, IEC 60601-2-18 (Endoscopic Equipment)',
      technicalClauses: [
        '1.1 Video Processor: True native 4K UHD (3840 x 2160 pixels) @ 60 FPS progressive scan with BT.2020 wide color gamut.',
        '1.2 Camera Head: Dual-sensor 4K CMOS with ergonomic control buttons for optical zoom, focus, image capture, and video recording.',
        '1.3 Light Source: High-intensity solid-state cold LED light source equivalent to 300W Xenon with minimum 50,000 hours operating life.',
        '1.4 Insufflator: High-flow electronic CO2 insufflator with automatic gas heating (37°C) and maximum flow rate not less than 45 L/min with continuous abdominal pressure regulation.',
        '1.5 Surgical Display: Medical-grade 32-inch 4K UHD monitor with optically bonded anti-reflective protective glass and IPX2 drip-proof rating.'
      ],
      warrantyClause: '5 Years comprehensive warranty on camera head, light engine, and insufflator unit. Free replacement of optical light cable if optical transmission degrades by >20% within warranty period.',
      nabhClause: 'Hospital infection control compliance: Camera head and couplers must be fully immersible and compatible with low-temperature hydrogen peroxide plasma sterilization and CIDEX OPA.'
    },
    xray: {
      title: 'High Frequency 500mA Fixed Digital Radiography (DR) System',
      modelRef: 'RajBiosis RayMaster 500 DR',
      gemCategory: 'Fixed Digital Radiography X-Ray Machine (AERB Type Approved)',
      standards: 'AERB Type Approval Certificate, ISO 13485, CE Certified, BIS IS:7620 Medical Electrical Equipment',
      technicalClauses: [
        '1.1 Generator: High frequency (not less than 50 kHz) with power output rating of 50 kW or higher. Maximum tube current 500 mA at 125 kV.',
        '1.2 X-Ray Tube: Rotating anode dual-focus tube (focal spots 0.6 mm and 1.2 mm) with minimum anode heat storage capacity of 300 kHU.',
        '1.3 Digital Flat Panel Detector (FPD): 43 x 43 cm (17x17 inch) wireless or tethered CsI (Cesium Iodide) flat panel detector with pixel pitch ≤ 140 µm and 16-bit A/D conversion.',
        '1.4 Table & Stand: Heavy-duty 4-way floating tabletop with motorized electromagnetic brakes and counterbalanced vertical bucky stand for chest and extremity imaging.',
        '1.5 Acquisition Console: High-resolution DICOM 3.0 workstation with auto-stitching software, bone suppression, and direct PACS connectivity.'
      ],
      warrantyClause: '5 Years Comprehensive on Generator and Flat Panel Detector with AERB Quality Assurance (QA) testing included every 2 years by NABL-accredited biomedical engineers.',
      nabhClause: 'Installation room must comply with AERB radiation shielding norms (lead-lined doors and lead glass observation window). Raj Biosis provides turnkey radiation layout clearance assistance.'
    }
  };

  const currentTemplate = tenderTemplates[selectedDevice];

  const fullClauseText = `========================================================================
TECHNICAL TENDER SPECIFICATION & COMPLIANCE STATEMENT
Institution: ${currentTemplate.title}
Model Benchmark: ${currentTemplate.modelRef} | Raj Biosis Life Systems
Procurement Code: ${currentTemplate.gemCategory}
Regulatory Compliance: ${currentTemplate.standards}
========================================================================

SECTION 1: TECHNICAL CLAUSES & MANDATORY MINIMUM SPECIFICATIONS:
${currentTemplate.technicalClauses.join('\n')}

SECTION 2: WARRANTY, SERVICE SLA & UPTIME GUARANTEE:
${currentTemplate.warrantyClause}

SECTION 3: NABH / AERB / INSTITUTIONAL QUALITY COMPLIANCE:
${currentTemplate.nabhClause}

========================================================================
CERTIFIED BY RAJ BIOSIS LIFE SYSTEMS BIOMEDICAL ENGINEERING DIVISION
Govt GeM Registered Vendor | ISO 13485:2016 Certified Facility
========================================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullClauseText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section className="py-12 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Award size={13} className="text-emerald-600" />
              <span>Government GeM & Institutional Tender Assistant</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Instant GeM Tender Specification & Compliance Generator
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mt-1">
              Engineered for hospital procurement committees, biomedical directors, and tender bidders. Generate official, copy-pasteable technical compliance clauses conforming to GeM Q3/Q4, CDSCO, and NABH standards.
            </p>
          </div>

          {/* Quick Equipment Selector */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs self-start md:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedDevice('ventilator')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                selectedDevice === 'ventilator' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Turbine Ventilator
            </button>
            <button
              onClick={() => setSelectedDevice('monitor')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                selectedDevice === 'monitor' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ICU Monitor
            </button>
            <button
              onClick={() => setSelectedDevice('laparoscopy')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                selectedDevice === 'laparoscopy' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4K Laparoscopy
            </button>
            <button
              onClick={() => setSelectedDevice('xray')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                selectedDevice === 'xray' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              500mA Digital X-Ray
            </button>
          </div>
        </div>

        {/* Specification Document Box */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Document Header Bar */}
          <div className="bg-gradient-to-r from-slate-100 via-sky-50/50 to-slate-100 p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                  GeM Standard Spec Ref: {currentTemplate.modelRef}
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck size={13} /> {currentTemplate.standards.split(',')[0]}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {currentTemplate.title}
              </h3>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs ${
                  copied 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Tender Clause Copied!' : 'Copy GeM Clause'}</span>
              </button>

              <button
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    printWindow.document.write(`<pre style="font-family:monospace;padding:20px;white-space:pre-wrap;">${fullClauseText}</pre>`);
                    printWindow.document.close();
                    printWindow.print();
                  }
                }}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition border border-slate-200"
                title="Print Tender Compliance Document"
              >
                <Printer size={14} />
                <span className="hidden sm:inline">Print Spec Sheet</span>
              </button>
            </div>
          </div>

          {/* Document Content View */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Standards Bar */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
              <div>
                <span className="font-bold text-slate-700">Certified Regulatory Framework: </span>
                <span className="text-slate-600">{currentTemplate.standards}</span>
              </div>
              <div className="text-emerald-700 font-bold flex items-center gap-1 shrink-0">
                <Check size={14} /> 100% GeM Compliance Qualified
              </div>
            </div>

            {/* Clause Sections */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Section 1: Mandatory Technical Parameters
              </h4>
              <div className="space-y-2 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                {currentTemplate.technicalClauses.map((clause, idx) => (
                  <div key={idx} className="text-xs sm:text-sm text-slate-700 font-mono leading-relaxed flex items-start gap-2">
                    <span className="text-blue-600 font-bold shrink-0">•</span>
                    <span>{clause}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Warranty Clause Box */}
              <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-200/80">
                <h5 className="text-xs font-bold text-sky-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-sky-600" />
                  Warranty & CMC Clause (NABH Standard)
                </h5>
                <p className="text-xs text-sky-800 leading-relaxed font-sans">
                  {currentTemplate.warrantyClause}
                </p>
              </div>

              {/* Quality & Hospital Integration */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
                <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Building2 size={14} className="text-emerald-600" />
                  Institutional EHR / Safety Protocol
                </h5>
                <p className="text-xs text-emerald-800 leading-relaxed font-sans">
                  {currentTemplate.nabhClause}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
