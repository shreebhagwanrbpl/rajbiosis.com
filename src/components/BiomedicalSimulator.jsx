'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  HeartPulse, 
  Sliders, 
  Zap, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  FileText,
  Sparkles,
  Info
} from 'lucide-react';

export default function BiomedicalSimulator({ onOpenRfq }) {
  // Live Simulator State
  const [mode, setMode] = useState('VCV'); // 'VCV', 'PCV', 'HFNC'
  const [tidalVolume, setTidalVolume] = useState(480); // ml
  const [rate, setRate] = useState(16); // bpm
  const [peep, setPeep] = useState(8); // cmH2O
  const [fio2, setFio2] = useState(50); // %

  const canvasRef = useRef(null);

  // Animate live real-time biomedical waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw pressure-volume waveform
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#0284c7'; // medical sky blue

      const heightFactor = mode === 'PCV' ? 32 : (tidalVolume / 480) * 35;
      const freqFactor = (rate / 16) * 0.04;

      for (let x = 0; x < canvas.width; x++) {
        const t = (x + offset) * freqFactor;
        // Synthesize respiratory curve (inspiratory ramp + exponential expiration)
        const cycle = t % (Math.PI * 2);
        let yVal = 0;
        if (cycle < Math.PI * 0.8) {
          yVal = Math.sin(cycle / 0.8) * heightFactor;
        } else {
          const expTime = (cycle - Math.PI * 0.8) / (Math.PI * 1.2);
          yVal = Math.exp(-expTime * 4) * heightFactor * 0.4;
        }

        const y = canvas.height * 0.65 - yVal - (peep * 1.5);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      offset += 1.8;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode, tidalVolume, rate, peep, fio2]);

  // Derived Telemetry Values
  const minuteVentilation = ((tidalVolume * rate) / 1000).toFixed(1);
  const peakPressure = (peep + (mode === 'PCV' ? 18 : 14)).toFixed(0);

  return (
    <section className="py-14 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200/80 mb-2 uppercase tracking-wider">
              <Zap size={13} className="text-sky-600" />
              <span>Interactive Biomedical Engineering Studio</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Hardware Telemetry & Life-Support Simulator
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Experience the precision microcontroller control of Raj Biosis critical care systems. 
              Adjust ventilator parameters to simulate dynamic lung mechanics and real-time waveforms.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Simulated Device:</span>
            <span className="text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg">
              RajBiosis-Vent Pro-X9
            </span>
          </div>
        </div>

        {/* Interactive Simulator Shell */}
        <div className="bg-slate-50 rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Waveform & Live Telemetry (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              {/* Telemetry Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-extrabold text-slate-800 tracking-wide uppercase">
                    Live Turbine Pressure Telemetry (cmH₂O / Time)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                  <span>FiO₂: <strong className="text-blue-600">{fio2}%</strong></span>
                  <span>•</span>
                  <span>Mode: <strong className="text-teal-600">{mode}</strong></span>
                </div>
              </div>

              {/* Animated Waveform Canvas */}
              <div className="relative w-full h-48 sm:h-56 bg-slate-50/70 rounded-xl overflow-hidden border border-slate-200/80">
                <canvas 
                  ref={canvasRef} 
                  width={600} 
                  height={220} 
                  className="w-full h-full block"
                />

                {/* Floating Waveform Calibration Markers */}
                <div className="absolute top-2 left-3 text-[10px] font-mono text-slate-400">
                  PEAK: {peakPressure} cmH₂O
                </div>
                <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-400">
                  PEEP: {peep} cmH₂O
                </div>
              </div>

              {/* Live Patient Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Minute Vol (MV)</div>
                  <div className="text-lg font-black text-slate-900">{minuteVentilation} <span className="text-xs font-semibold text-slate-500">L/min</span></div>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Peak Press (PIP)</div>
                  <div className="text-lg font-black text-blue-700">{peakPressure} <span className="text-xs font-semibold text-slate-500">cmH₂O</span></div>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Resp Rate (f)</div>
                  <div className="text-lg font-black text-teal-700">{rate} <span className="text-xs font-semibold text-slate-500">BPM</span></div>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">SpO₂ Ready</div>
                  <div className="text-lg font-black text-emerald-700">99% <span className="text-xs font-semibold text-slate-500">Nellcor</span></div>
                </div>
              </div>
            </div>

            {/* Right Interactive Parameter Knobs (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders size={18} className="text-blue-600" />
                  <span>Clinical Ventilator Parameter Controls</span>
                </h3>
                <button
                  onClick={() => {
                    setMode('VCV');
                    setTidalVolume(480);
                    setRate(16);
                    setPeep(8);
                    setFio2(50);
                  }}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <RotateCcw size={12} /> Reset
                </button>
              </div>

              {/* Mode Switcher */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
                  Select Ventilation Mode:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['VCV', 'PCV', 'HFNC'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`py-2 rounded-xl text-xs font-extrabold transition ${
                        mode === m
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {m} Mode
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider 1: Tidal Volume */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                  <span>Tidal Volume (Vt):</span>
                  <span className="text-blue-700 font-extrabold text-sm">{tidalVolume} mL</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="800"
                  step="10"
                  value={tidalVolume}
                  onChange={(e) => setTidalVolume(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>200 mL (Pediatric)</span>
                  <span>800 mL (Adult)</span>
                </div>
              </div>

              {/* Slider 2: Respiratory Rate */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                  <span>Respiratory Rate:</span>
                  <span className="text-teal-700 font-extrabold text-sm">{rate} BPM</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="35"
                  step="1"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              {/* Slider 3: PEEP & FiO2 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                    <span>PEEP:</span>
                    <span className="text-blue-700 font-extrabold">{peep} cmH₂O</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="18"
                    step="1"
                    value={peep}
                    onChange={(e) => setPeep(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                    <span>FiO₂:</span>
                    <span className="text-sky-700 font-extrabold">{fio2}%</span>
                  </div>
                  <input
                    type="range"
                    min="21"
                    max="100"
                    step="5"
                    value={fio2}
                    onChange={(e) => setFio2(Number(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Direct Hardware Action */}
              <div className="pt-2">
                <button
                  onClick={() => onOpenRfq()}
                  className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-md flex items-center justify-center gap-2 transition"
                >
                  <FileText size={16} />
                  <span>Request Institutional ICU Rate Contract (RFQ)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
