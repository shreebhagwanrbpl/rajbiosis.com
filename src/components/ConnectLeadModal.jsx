'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ConnectLeadModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user already dismissed or already has a complete profile
    const alreadyShown = sessionStorage.getItem('rb_connect_lead_shown');
    const existingProfile = localStorage.getItem('rajbiosis_user_profile');

    if (existingProfile) {
      try {
        const parsed = JSON.parse(existingProfile);
        if (parsed.fullName && parsed.phone) {
          // User already has an active profile, don't show lead modal
          return;
        }
      } catch (e) {
        // continue
      }
    }

    if (!alreadyShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3500); // 3.5 seconds after load

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('rb_connect_lead_shown', 'true');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('कृपया अपना नाम दर्ज करें (Please enter your name)');
      return;
    }
    if (!mobile.trim() || mobile.trim().length < 10) {
      setError('कृपया 10 अंकों का मोबाइल नंबर दर्ज करें (Please enter a valid 10-digit mobile number)');
      return;
    }

    // Save temporary lead info to localStorage so /profile loads it automatically
    try {
      const existing = localStorage.getItem('rajbiosis_user_profile');
      let profileData = {};
      if (existing) {
        profileData = JSON.parse(existing);
      }
      profileData.fullName = name.trim();
      profileData.phone = mobile.trim();
      profileData.updatedAt = new Date().toISOString();

      localStorage.setItem('rajbiosis_user_profile', JSON.stringify(profileData));
      window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: profileData }));
    } catch (err) {
      console.error(err);
    }

    sessionStorage.setItem('rb_connect_lead_shown', 'true');
    setIsOpen(false);

    // Redirect to /profile with query parameters for seamless auto-fill
    router.push(`/profile?name=${encodeURIComponent(name.trim())}&phone=${encodeURIComponent(mobile.trim())}`);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          title="Dismiss"
        >
          <X size={18} />
        </button>

        {/* Header Icon & Title (Clean Light Style) */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
            <User size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 uppercase tracking-wide">
              <ShieldCheck size={12} />
              <span>Direct Hospital Connect</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Connect with Raj Biosis Team
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-5 leading-relaxed">
          Enter your name and contact to create your verified hospital profile, unlock institutional B2B pricing, and get direct manufacturer support.
        </p>

        {error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* 2-Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input 1: Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Name (आपका नाम / डॉक्टर का नाम) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="e.g. Dr. Rajesh Sharma"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none font-medium transition"
                autoFocus
              />
            </div>
          </div>

          {/* Input 2: Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mobile Number (मोबाइल नंबर) <span className="text-red-500">*</span>
            </label>
            <div className="relative flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 text-slate-600 text-xs font-semibold">
                +91
              </span>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                  setError('');
                }}
                placeholder="98201 44552"
                maxLength={10}
                className="w-full pl-3 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-r-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none font-medium transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 mt-2"
          >
            <span>Continue to Profile (प्रोफ़ाइल पूरी करें)</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleClose}
            className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition"
          >
            Skip for now &bull; अभी छोड़ें
          </button>
        </div>
      </div>
    </div>
  );
}
