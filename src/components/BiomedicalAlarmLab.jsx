'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Bell, 
  BellOff, 
  ShieldAlert, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  Play, 
  Square,
  Clock,
  Info
} from 'lucide-react';

export default function BiomedicalAlarmLab() {
  const [activeAlarm, setActiveAlarm] = useState(null); // 'high', 'medium', 'low', null
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSilenced, setIsSilenced] = useState(false);
  const [silenceCountdown, setSilenceCountdown] = useState(0);
  const [volume, setVolume] = useState(0.2); // safe default
  const audioCtxRef = useRef(null);
  const intervalRef = useRef(null);

  // Initialize Web Audio Context safely on user action
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Play a single synthesized medical beep tone
  const playTone = (freq, duration, delay = 0) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    setTimeout(() => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Harmonic medical beep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Envelope: soft attack, quick release (IEC standard musical chime)
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration + 0.05);
      } catch (e) {
        console.error('Audio playback error', e);
      }
    }, delay);
  };

  // Play IEC 60601-1-8 standard bursts
  const triggerAlarmBurst = (type) => {
    if (isSilenced) return;

    if (type === 'high') {
      // 5-pulse high priority burst (C5, E5, G5, E5, G5)
      playTone(523.25, 0.12, 0);
      playTone(659.25, 0.12, 160);
      playTone(783.99, 0.12, 320);
      playTone(659.25, 0.12, 480);
      playTone(783.99, 0.22, 640);
    } else if (type === 'medium') {
      // 3-pulse medium priority burst (C5, E5, G5)
      playTone(523.25, 0.18, 0);
      playTone(659.25, 0.18, 220);
      playTone(783.99, 0.25, 440);
    } else if (type === 'low') {
      // 1-pulse low priority advisory chime
      playTone(587.33, 0.35, 0);
    }
  };

  // Start continuous alarm simulation loop
  const handleStartAlarm = (type) => {
    if (isPlaying && activeAlarm === type) {
      handleStopAlarm();
      return;
    }

    handleStopAlarm();
    setActiveAlarm(type);
    setIsPlaying(true);
    setIsSilenced(false);
    setSilenceCountdown(0);

    // Play first burst immediately
    triggerAlarmBurst(type);

    // Set recurring burst interval per medical standard
    const repeatInterval = type === 'high' ? 2500 : type === 'medium' ? 5000 : 8000;
    intervalRef.current = setInterval(() => {
      triggerAlarmBurst(type);
    }, repeatInterval);
  };

  const handleStopAlarm = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setActiveAlarm(null);
  };

  // Silence button (simulates 120-second medical audio pause)
  const handleSilence = () => {
    setIsSilenced(true);
    setSilenceCountdown(120);
  };

  // Silence countdown timer
  useEffect(() => {
    let timer;
    if (isSilenced && silenceCountdown > 0) {
      timer = setInterval(() => {
        setSilenceCountdown((prev) => {
          if (prev <= 1) {
            setIsSilenced(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSilenced, silenceCountdown]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  return (
    <section className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-50 via-sky-50/30 to-blue-50/20 rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
                <Radio size={13} className="text-blue-600 animate-pulse" />
                <span>IEC 60601-1-8 Acoustic Annunciator Studio</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Interactive Biomedical Audio & Visual Alarm Simulator
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
                Test the harmonized clinical tones and multi-tier flashing LED annunciators engineered into all Raj Biosis life support systems to minimize hospital alarm fatigue.
              </p>
            </div>

            {/* Audio Volume & Global Silence */}
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 px-2 text-xs font-semibold text-slate-600">
                {volume === 0 ? <VolumeX size={16} className="text-slate-400" /> : <Volume2 size={16} className="text-blue-600" />}
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 accent-blue-600 cursor-pointer"
                  title="Simulator Volume"
                />
              </div>

              {isPlaying && (
                <button
                  onClick={handleSilence}
                  disabled={isSilenced}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    isSilenced
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <BellOff size={14} />
                  <span>{isSilenced ? `Silenced (${silenceCountdown}s)` : 'Audio Pause 120s'}</span>
                </button>
              )}

              {isPlaying && (
                <button
                  onClick={handleStopAlarm}
                  className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold flex items-center gap-1 transition"
                >
                  <Square size={13} />
                  <span>Stop</span>
                </button>
              )}
            </div>
          </div>

          {/* Alarm Interactive Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            {/* 1. High Priority (Red) */}
            <div className={`bg-white rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden ${
              activeAlarm === 'high' && isPlaying
                ? 'border-red-400 shadow-md ring-2 ring-red-200'
                : 'border-slate-200 hover:border-slate-300'
            }`}>
              {/* Flashing Annunciator Bar */}
              <div className={`h-2 -mt-5 -mx-5 mb-4 transition-all duration-300 ${
                activeAlarm === 'high' && isPlaying
                  ? isSilenced 
                    ? 'bg-amber-400' 
                    : 'bg-red-600 animate-pulse'
                  : 'bg-slate-100'
              }`} />

              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  Priority 1: Life Critical
                </span>
                <span className="text-[10px] font-mono text-slate-400">IEC 5-Tone</span>
              </div>

              <h4 className="font-extrabold text-slate-900 text-base mb-1">
                High Priority (Apnea / Asystole)
              </h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Triggered upon airway occlusion, low tidal volume &lt;100mL, or ventricular fibrillation. 5-pulse tone sequence repeating every 2.5s.
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-600">
                  Visual: <span className="font-bold text-red-600">Flashing Red (2 Hz)</span>
                </div>
                <button
                  onClick={() => handleStartAlarm('high')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    activeAlarm === 'high' && isPlaying
                      ? 'bg-red-600 text-white'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  {activeAlarm === 'high' && isPlaying ? <Square size={13} /> : <Play size={13} />}
                  <span>{activeAlarm === 'high' && isPlaying ? 'Stop Test' : 'Test Sound'}</span>
                </button>
              </div>
            </div>

            {/* 2. Medium Priority (Yellow/Amber) */}
            <div className={`bg-white rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden ${
              activeAlarm === 'medium' && isPlaying
                ? 'border-amber-400 shadow-md ring-2 ring-amber-200'
                : 'border-slate-200 hover:border-slate-300'
            }`}>
              {/* Flashing Annunciator Bar */}
              <div className={`h-2 -mt-5 -mx-5 mb-4 transition-all duration-300 ${
                activeAlarm === 'medium' && isPlaying
                  ? isSilenced 
                    ? 'bg-slate-300' 
                    : 'bg-amber-500 animate-pulse'
                  : 'bg-slate-100'
              }`} />

              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Priority 2: Prompt Action
                </span>
                <span className="text-[10px] font-mono text-slate-400">IEC 3-Tone</span>
              </div>

              <h4 className="font-extrabold text-slate-900 text-base mb-1">
                Medium Priority (Low O2 Gas)
              </h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Triggered when central pipeline gas falls below 2.8 bar or respiratory rate exceeds set patient safety thresholds. 3-pulse sequence.
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-600">
                  Visual: <span className="font-bold text-amber-600">Flashing Amber (0.5 Hz)</span>
                </div>
                <button
                  onClick={() => handleStartAlarm('medium')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    activeAlarm === 'medium' && isPlaying
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  {activeAlarm === 'medium' && isPlaying ? <Square size={13} /> : <Play size={13} />}
                  <span>{activeAlarm === 'medium' && isPlaying ? 'Stop Test' : 'Test Sound'}</span>
                </button>
              </div>
            </div>

            {/* 3. Low Priority (Cyan/Blue) */}
            <div className={`bg-white rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden ${
              activeAlarm === 'low' && isPlaying
                ? 'border-sky-400 shadow-md ring-2 ring-sky-200'
                : 'border-slate-200 hover:border-slate-300'
            }`}>
              {/* Flashing Annunciator Bar */}
              <div className={`h-2 -mt-5 -mx-5 mb-4 transition-all duration-300 ${
                activeAlarm === 'low' && isPlaying ? 'bg-sky-500' : 'bg-slate-100'
              }`} />

              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  Priority 3: Advisory
                </span>
                <span className="text-[10px] font-mono text-slate-400">IEC 1-Tone</span>
              </div>

              <h4 className="font-extrabold text-slate-900 text-base mb-1">
                Low Priority (Infusion Complete)
              </h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Advisory notification for completed syringe infusion doses, routine filter inspection, or AC power switchover to internal battery.
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-600">
                  Visual: <span className="font-bold text-sky-600">Steady Cyan LED</span>
                </div>
                <button
                  onClick={() => handleStartAlarm('low')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    activeAlarm === 'low' && isPlaying
                      ? 'bg-sky-600 text-white'
                      : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                  }`}
                >
                  {activeAlarm === 'low' && isPlaying ? <Square size={13} /> : <Play size={13} />}
                  <span>{activeAlarm === 'low' && isPlaying ? 'Stop Test' : 'Test Sound'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
