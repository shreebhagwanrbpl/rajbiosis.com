'use client';

import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  Activity, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Sliders, 
  Eye, 
  Sparkles,
  Info,
  Radio,
  RefreshCw,
  Gauge
} from 'lucide-react';

export default function BiomedicalHardwareScanner({ onOpenRfq }) {
  const [activeDevice, setActiveDevice] = useState('ventilator');
  const [activeMode, setActiveMode] = useState('subsystem'); // 'surface', 'subsystem', 'iot'
  const [selectedHotspot, setSelectedHotspot] = useState(0);

  const devices = {
    ventilator: {
      id: 'ventilator',
      name: 'RajBiosis-Vent Pro-X9',
      category: 'Turbine ICU Workstation',
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
      tagline: 'High-Frequency Pneumatic Turbine with Paramagnetic O2 Sensing',
      specs: {
        mtbf: '55,000 Hours',
        powerBackup: '6.5 Hours (Dual Li-Ion)',
        flowRate: 'Up to 240 L/min',
        o2CellType: 'Ultrasonic (Zero Consumable)'
      },
      hotspots: [
        {
          id: 0,
          title: 'High-Torque MagLev Micro-Turbine',
          category: 'Pneumatic Drive',
          subsystem: 'Internal Drive Subsystem',
          x: '38%',
          y: '48%',
          status: 'Optimal (42,000 RPM)',
          desc: 'Brushless magnetic levitation turbine delivers peak flow up to 240 L/min with response time < 10ms. Eliminates need for central high-pressure hospital air compressors.',
          telemetry: 'Speed: 41,850 RPM • Temp: 36.2°C • Latency: 8.4ms'
        },
        {
          id: 1,
          title: 'Paramagnetic Ultrasonic O2 Cell',
          category: 'Gas Sensing',
          subsystem: 'FiO2 Blender Unit',
          x: '64%',
          y: '32%',
          status: '100% Calibrated',
          desc: 'Solid-state ultrasonic oxygen sensor with lifetime warranty. Never depletes like conventional chemical galvanic cells, saving ₹45,000/year in consumable replacements.',
          telemetry: 'Accuracy: ±1.2% • Response: 98ms • Zero Chemical Drift'
        },
        {
          id: 2,
          title: 'Active Heated Expiratory Valve',
          category: 'Exhalation Unit',
          subsystem: 'Patient Circuit Interface',
          x: '28%',
          y: '68%',
          status: 'Heated at 40°C',
          desc: 'Autoclavable integrated heating element prevents moisture condensation in the flow sensor, maintaining baseline pressure (PEEP) stability down to ±0.2 cmH2O.',
          telemetry: 'Heating: Active 40.1°C • Sensor: Differential Pressure MEMS'
        },
        {
          id: 3,
          title: 'Dual Hot-Swap Smart Power Bank',
          category: 'Power Management',
          subsystem: 'DC/DC Energy Matrix',
          x: '75%',
          y: '72%',
          status: 'Health: 99.4%',
          desc: 'Redundant medical-grade Lithium Iron Phosphate (LiFePO4) battery packs with SMBus telemetry. Delivers over 6.5 hours of continuous ventilation during intra-hospital transport.',
          telemetry: 'Capacity: 14.8V 10.4Ah • Cycles: 24/2000 • Runtime: 390 min'
        }
      ]
    },
    laparoscopy: {
      id: 'laparoscopy',
      name: 'RajBiosis AuraSurg 4K UHD Tower',
      category: 'Minimally Invasive Surgery',
      image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1200&q=80',
      tagline: 'Dual Sony 4K CMOS Sensors with 300W Cold LED & Auto-Heating Insufflator',
      specs: {
        mtbf: '60,000 Hours LED',
        powerBackup: 'Online Medical Isolation UPS',
        flowRate: '50 L/min Heated CO2',
        o2CellType: '4K Ultra-HDR True Color'
      },
      hotspots: [
        {
          id: 0,
          title: 'Dual Sony 1/1.8" 4K CMOS Sensor Head',
          category: 'Imaging Engine',
          subsystem: 'Optical Head Unit',
          x: '35%',
          y: '35%',
          status: '3840 x 2160 @ 60 FPS',
          desc: 'Dual-sensor prism beam splitter captures natural tissue color fidelity (CRI > 95) with laser-guided autofocus and 40x optical zoom for precise micro-vessel visualization.',
          telemetry: 'Resolution: 4K UHD • Latency: < 12ms glass-to-glass • BT.2020'
        },
        {
          id: 1,
          title: '300W Solid-State Cold LED Light Engine',
          category: 'Photonics',
          subsystem: 'Illumination Subsystem',
          x: '62%',
          y: '45%',
          status: 'Output: 3,200 Lumens',
          desc: 'Pure daylight 5800K illumination without infrared heat dissipation. Instant electronic shutter dimming protects biological tissue from accidental thermal injury.',
          telemetry: 'LED Temp: 42°C • Optical Efficiency: 92% • Lifespan: 50,000h'
        },
        {
          id: 2,
          title: '50L/min Gas-Heated High Flow Insufflator',
          category: 'Pneumoperitoneum',
          subsystem: 'Pressure Regulator',
          x: '42%',
          y: '70%',
          status: 'Pneumo: 14 mmHg Auto',
          desc: 'Continuous real-time abdominal cavity pressure monitoring with integrated in-line gas heater prevents patient hypothermia and scope fogging during lengthy procedures.',
          telemetry: 'Flow: 45 L/min • Heating: 37°C • Relief Valve: Active Triple-Stage'
        }
      ]
    },
    carm: {
      id: 'carm',
      name: 'RajBiosis FluoroMaster 1000 C-Arm',
      category: 'Intraoperative Imaging',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
      tagline: 'High-Frequency 40kHz Monoblock Generator with Dynamic Flat Panel Detector',
      specs: {
        mtbf: '45,000 Scans',
        powerBackup: 'Active Energy Storage Unit',
        flowRate: 'Pulse Fluoro 1-30 FPS',
        o2CellType: '30x30cm a-Si Flat Panel'
      },
      hotspots: [
        {
          id: 0,
          title: 'Dynamic CsI a-Si Flat Panel Detector',
          category: 'Detector Matrix',
          subsystem: 'Digital Receptor',
          x: '30%',
          y: '30%',
          status: 'DQE: 75% @ 0 lp/mm',
          desc: 'Direct deposition Cesium Iodide (CsI) scintillator provides 16-bit grayscale depth with minimal dose requirement, reducing radiation exposure to surgical staff by up to 60%.',
          telemetry: 'Pixel Pitch: 154 µm • Grayscale: 16-bit • Active Area: 30x30cm'
        },
        {
          id: 1,
          title: '40 kHz High-Frequency Monoblock Generator',
          category: 'X-Ray Emission',
          subsystem: 'High-Voltage Unit',
          x: '68%',
          y: '65%',
          status: 'kV Range: 40-125 kV',
          desc: 'Microprocessor-controlled dual-focus rotating anode tube with high thermal heat capacity (300 kHU) ensures continuous fluoroscopy without thermal throttling during complex orthopedic cases.',
          telemetry: 'Max Current: 100 mA • Focal Spots: 0.3 / 0.6 mm • Thermal: 28%'
        },
        {
          id: 2,
          title: 'Laser Crosshair Positioning System',
          category: 'Guidance',
          subsystem: 'Optical Collimation',
          x: '50%',
          y: '45%',
          status: 'Aligned (Class 2 Laser)',
          desc: 'Dual-axis medical laser projectors enable precise anatomical alignment without preliminary X-ray test shots, strictly conforming to AERB ALARA radiation safety principles.',
          telemetry: 'Accuracy: ±0.5mm • Wavelength: 532nm Green • AERB Compliant'
        }
      ]
    }
  };

  const currentDev = devices[activeDevice];
  const activeSpot = currentDev.hotspots[selectedHotspot] || currentDev.hotspots[0];

  return (
    <section className="py-12 bg-gradient-to-b from-white via-slate-50 to-white border-b border-slate-200/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-2">
              <Eye size={13} className="text-sky-600 animate-pulse" />
              <span>Interactive Hardware Anatomy Studio</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Biomedical Architecture & X-Ray Diagnostics
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mt-1">
              Explore the precision engineering behind Raj Biosis certified equipment. Click component hotspots to inspect real-time internal sensors, pneumatic schematics, and MTBF reliability metrics.
            </p>
          </div>

          {/* Device Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl self-start md:self-auto border border-slate-300/70">
            <button
              onClick={() => { setActiveDevice('ventilator'); setSelectedHotspot(0); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeDevice === 'ventilator' 
                  ? 'bg-white text-blue-600 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ICU Ventilator X9
            </button>
            <button
              onClick={() => { setActiveDevice('laparoscopy'); setSelectedHotspot(0); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeDevice === 'laparoscopy' 
                  ? 'bg-white text-blue-600 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4K Laparoscopy Tower
            </button>
            <button
              onClick={() => { setActiveDevice('carm'); setSelectedHotspot(0); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeDevice === 'carm' 
                  ? 'bg-white text-blue-600 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              C-Arm Fluoroscopy
            </button>
          </div>
        </div>

        {/* Interactive Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Canvas: Interactive Device Anatomy (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-extrabold text-slate-800 tracking-wide uppercase">
                  {currentDev.name}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  [{currentDev.category}]
                </span>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                <button
                  onClick={() => setActiveMode('surface')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    activeMode === 'surface' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Exterior
                </button>
                <button
                  onClick={() => setActiveMode('subsystem')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1 ${
                    activeMode === 'subsystem' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Layers size={12} />
                  <span>Subsystems</span>
                </button>
                <button
                  onClick={() => setActiveMode('iot')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1 ${
                    activeMode === 'iot' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Activity size={12} />
                  <span>Live Telemetry</span>
                </button>
              </div>
            </div>

            {/* Interactive Image & Hotspots Stage */}
            <div className="relative w-full h-80 sm:h-96 my-4 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center group">
              <img
                src={currentDev.image}
                alt={currentDev.name}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  activeMode === 'subsystem' 
                    ? 'filter contrast-110 brightness-95 saturate-120' 
                    : activeMode === 'iot' 
                      ? 'filter contrast-105 brightness-100' 
                      : ''
                }`}
              />

              {/* Visual Grid Overlay for Engineering Look */}
              <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none"></div>

              {/* Mode Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200 text-[11px] font-bold text-slate-700 shadow-xs">
                {activeMode === 'surface' && <Eye size={12} className="text-slate-500" />}
                {activeMode === 'subsystem' && <Layers size={12} className="text-blue-500" />}
                {activeMode === 'iot' && <Radio size={12} className="text-emerald-500 animate-pulse" />}
                <span className="capitalize">{activeMode} Inspection Active</span>
              </div>

              {/* Interactive Clickable Hotspots */}
              {currentDev.hotspots.map((spot, idx) => (
                <button
                  key={spot.id}
                  onClick={() => setSelectedHotspot(idx)}
                  style={{ top: spot.y, left: spot.x }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group/pin transition-all duration-300 ${
                    selectedHotspot === idx ? 'scale-125 z-30' : 'hover:scale-110'
                  }`}
                  aria-label={spot.title}
                >
                  {/* Pulse Ring */}
                  <span className={`absolute -inset-2 rounded-full opacity-75 animate-ping ${
                    selectedHotspot === idx ? 'bg-sky-400' : 'bg-blue-400/50'
                  }`}></span>

                  {/* Core Pin */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-md border-2 ${
                    selectedHotspot === idx
                      ? 'bg-blue-600 text-white border-white ring-2 ring-blue-400'
                      : 'bg-white text-slate-800 border-blue-500 hover:bg-blue-50'
                  }`}>
                    {idx + 1}
                  </div>

                  {/* Modern Glassmorphic Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/pin:flex flex-col items-center whitespace-nowrap bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-2xl border border-slate-700/80 pointer-events-none z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{spot.title}</span>
                    </div>
                    <div className="text-[9px] text-slate-300 font-normal">{spot.category}</div>
                    <div className="w-2 h-2 bg-slate-900 border-r border-b border-slate-700/80 rotate-45 -mb-1 mt-0.5"></div>
                  </div>
                </button>
              ))}

              {/* Bottom Telemetry Overlay Bar */}
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-2.5 border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] font-mono text-slate-600 truncate">
                    {activeSpot.telemetry}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 shrink-0">
                  {activeSpot.status}
                </span>
              </div>
            </div>

            {/* Quick Specs Micro-Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Certified MTBF</span>
                <span className="text-xs font-black text-slate-800">{currentDev.specs.mtbf}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Internal Battery</span>
                <span className="text-xs font-black text-slate-800">{currentDev.specs.powerBackup}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Max Output / Flow</span>
                <span className="text-xs font-black text-slate-800">{currentDev.specs.flowRate}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Sensor Matrix</span>
                <span className="text-xs font-black text-slate-800">{currentDev.specs.o2CellType}</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Deep Subsystem Inspection Card (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {selectedHotspot + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {activeSpot.subsystem}
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={12} /> {activeSpot.status}
                </span>
              </div>

              {/* Title & Category */}
              <h3 className="text-xl font-extrabold text-slate-900 mb-2 leading-tight">
                {activeSpot.title}
              </h3>
              <div className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md mb-4 border border-slate-200">
                Category: {activeSpot.category}
              </div>

              {/* Engineering Description */}
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {activeSpot.desc}
              </p>

              {/* Biomedical Telemetry Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Activity size={14} className="text-sky-600" /> Live Sensor Feedback
                  </span>
                  <span className="text-[10px] text-emerald-600 font-mono">24-Bit ADC Synced</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed">
                  {activeSpot.telemetry}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={12} className="text-blue-500" /> IEC 60601-1-2 EMC
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" /> ISO 13485 Cleared
                  </span>
                </div>
              </div>

              {/* All Hotspots Selector List */}
              <div className="space-y-1.5 mb-6">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Select Subsystem Component:
                </span>
                {currentDev.hotspots.map((spot, idx) => (
                  <button
                    key={spot.id}
                    onClick={() => setSelectedHotspot(idx)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                      selectedHotspot === idx
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                        selectedHotspot === idx ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {idx + 1}
                      </span>
                      <span>{spot.title}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {spot.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => onOpenRfq && onOpenRfq()}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
              >
                <span>Request Technical Subsystem BOM</span>
              </button>
              <a
                href="#catalog-section"
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center"
              >
                View Full Model Specs
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
