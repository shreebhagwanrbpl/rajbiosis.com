'use client';

import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Activity, 
  Wifi, 
  ShieldCheck, 
  Heart, 
  Zap, 
  CheckCircle2, 
  RefreshCw,
  Building2,
  Clock,
  Sparkles
} from 'lucide-react';

export default function HospitalFleetIoTDashboard({ onOpenRfq }) {
  // Live dynamic telemetry state updating every 2.5 seconds
  const [telemetryTicks, setTelemetryTicks] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryTicks(prev => prev + 1);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const heartRate = 72 + (telemetryTicks % 5) - 2;
  const spo2 = 98 + (telemetryTicks % 2);
  const tidalVolume = 480 + ((telemetryTicks * 3) % 15) - 7;
  const peep = (8.0 + ((telemetryTicks % 3) * 0.1)).toFixed(1);

  const units = [
    {
      id: 'icu-04',
      hospital: 'Apollo Super Speciality Hospital, Bangalore',
      department: 'Critical Care ICU - Bed 04',
      device: 'RajBiosis-Vent Pro-X9 Workstation',
      badge: 'LIFE CRITICAL',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      status: 'STABLE VENTILATION',
      vitals: [
        { label: 'Tidal Vol (Vt)', value: `${tidalVolume} mL`, trend: 'Target: 480 mL' },
        { label: 'PEEP Pressure', value: `${peep} cmH2O`, trend: 'Target: 8.0' },
        { label: 'FiO2 Oxygen', value: '45%', trend: 'Auto-Blended' },
        { label: 'Internal Battery', value: '100% (AC Online)', trend: '6.5h Reserve' }
      ]
    },
    {
      id: 'ccu-01',
      hospital: 'Max Super Speciality Hospital, New Delhi',
      department: 'Cardiology CCU - Bed 01',
      device: 'CardioPulse 12X Pro Modular Monitor',
      badge: 'CONTINUOUS MONITORING',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      status: 'SINUS RHYTHM',
      vitals: [
        { label: 'Heart Rate', value: `${heartRate} bpm`, trend: 'Normal (60-100)' },
        { label: 'Blood Oxygen (SpO2)', value: `${spo2}%`, trend: 'Perfusion: 1.4' },
        { label: 'Blood Pressure', value: '122 / 80', trend: 'MAP: 94 mmHg' },
        { label: 'EtCO2 Capno', value: '38 mmHg', trend: 'Normal Slope' }
      ]
    },
    {
      id: 'ot-02',
      hospital: 'Fortis Memorial Research Institute, Gurugram',
      department: 'Modular Operating Theatre - OT 2',
      device: 'RajBiosis AuraSurg 4K UHD Tower',
      badge: 'ACTIVE PROCEDURE',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      status: 'LAPAROSCOPIC SURGERY',
      vitals: [
        { label: 'Insufflation Pressure', value: '14.1 mmHg', trend: 'Auto-Heating 37°C' },
        { label: 'CO2 Flow Rate', value: '12.4 L/min', trend: 'Capacity: 50 L/min' },
        { label: 'Cold LED Light', value: '92% Output', trend: '5800K Daylight' },
        { label: 'Video Latency', value: '8.2 ms', trend: '4K 60FPS Glass' }
      ]
    },
    {
      id: 'rad-01',
      hospital: 'Tata Memorial Centre, Mumbai',
      department: 'Emergency Trauma Imaging - Room 01',
      device: 'RajBiosis RayMaster 500 DR System',
      badge: 'READY ON STANDBY',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      status: 'PACS SYNCED',
      vitals: [
        { label: 'Detector Temp', value: '26.4°C', trend: 'Optimal CsI' },
        { label: 'Tube Anode HU', value: '18% Capacity', trend: 'Cooldown Normal' },
        { label: 'Flat Panel Battery', value: '96%', trend: 'Wireless 5GHz' },
        { label: 'DICOM 3.0 Link', value: 'ONLINE', trend: 'Direct PACS' }
      ]
    }
  ];

  return (
    <section className="py-12 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold mb-2">
              <Wifi size={13} className="text-teal-600 animate-pulse" />
              <span>RajBiosis-Sync™ IoT Central Command</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Live Hospital Telemetry & Remote Fleet Telematics
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mt-1">
              Every Raj Biosis certified device comes with native HL7 / FHIR connectivity and secure AES-256 cloud telemetry, providing real-time clinical monitoring and predictive maintenance.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs self-start md:self-auto text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-bold text-slate-700">Central Gateway:</span>
            <span className="font-mono text-emerald-600 font-bold">1,420 Units Online</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-mono">Packet Latency: 14ms</span>
          </div>
        </div>

        {/* Live Grid of 4 Hospital Units */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Top Institution Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 size={15} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[220px] sm:max-w-xs">
                      {unit.hospital}
                    </span>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${unit.badgeColor}`}>
                    {unit.badge}
                  </span>
                </div>

                {/* Device Title & Status */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {unit.device}
                    </h3>
                    <span className="text-xs text-slate-500 font-semibold">
                      {unit.department}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {unit.status}
                  </span>
                </div>

                {/* Vitals & Telemetry Matrix */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {unit.vitals.map((v, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {v.label}
                      </span>
                      <div className="text-sm font-black text-slate-800 font-mono mt-0.5">
                        {v.value}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
                        {v.trend}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Quick Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                  <Activity size={12} className="text-blue-500" />
                  HL7/FHIR v4.0.1 Encrypted Stream
                </span>
                <button
                  onClick={() => onOpenRfq && onOpenRfq()}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Request Ward Setup &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
