'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  CheckCircle2,
  X,
  Compass,
  Building2,
  PhoneCall,
  Search,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { requestBrowserLocation, applyUserDistrict } from '../utils/locationService';
import { getActiveDistrict } from '../utils/userProfile';
import { getOfficeForDistrict, HEAD_OFFICE } from '../data/offices';
import { ALL_DISTRICTS } from '../data/districts';

const POPULAR_HUBS = [
  { name: 'Jaipur', label: 'Jaipur (Head Office)', type: 'head' },
  { name: 'Churu', label: 'Churu (Regional Branch)', type: 'branch' },
  { name: 'Jodhpur', label: 'Jodhpur (Western Hub)', type: 'branch' },
  { name: 'Kota', label: 'Kota (Hadoti Hub)', type: 'branch' },
  { name: 'Bikaner', label: 'Bikaner (North Depot)', type: 'branch' },
  { name: 'Sikar', label: 'Sikar (Shekhawati Desk)', type: 'branch' },
  { name: 'Udaipur', label: 'Udaipur (Mewar Hub)', type: 'branch' },
  { name: 'Ajmer', label: 'Ajmer (Central Depot)', type: 'branch' }
];

export default function LocationPromptModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [activeDistrict, setActiveDistrict] = useState('Jaipur');
  const [isDetecting, setIsDetecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [officeData, setOfficeData] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Initialize and check whether user has already allowed location
  useEffect(() => {
    setMounted(true);
    const current = getActiveDistrict();
    setActiveDistrict(current);
    setOfficeData(getOfficeForDistrict(current));

    if (typeof window !== 'undefined') {
      const allowed = localStorage.getItem('rajbiosis_location_allowed');
      const dismissed = sessionStorage.getItem('rajbiosis_location_banner_dismissed');

      // If user hasn't explicitly allowed location yet and haven't dismissed this session:
      // Show friendly bottom prompt banner after 1.5 seconds, and auto-attempt browser permission
      if (!allowed && !dismissed) {
        const timer = setTimeout(() => {
          setIsBannerVisible(true);
          // Gently request browser geolocation
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                // If browser already had permission granted, auto-apply!
                requestBrowserLocation().then((res) => {
                  if (res.success) {
                    setIsBannerVisible(false);
                    showToast(`📍 Location automatically detected: ${res.district}`);
                  }
                });
              },
              () => {
                // User hadn't granted yet; the banner gives them clear context and 1-click button
              },
              { timeout: 3000, maximumAge: 600000 }
            );
          }
        }, 1200);

        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Listen to active-district-changed events from anywhere in the app
  useEffect(() => {
    const handleDistrictChange = (e) => {
      const dist = e.detail || 'Jaipur';
      setActiveDistrict(dist);
      setOfficeData(getOfficeForDistrict(dist));
    };

    const handleOpenModal = () => {
      setIsOpen(true);
      setIsBannerVisible(false);
    };

    window.addEventListener('active-district-changed', handleDistrictChange);
    window.addEventListener('open-location-modal', handleOpenModal);

    return () => {
      window.removeEventListener('active-district-changed', handleDistrictChange);
      window.removeEventListener('open-location-modal', handleOpenModal);
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4500);
  };

  // Handle GPS detection
  const handleAutoDetect = async () => {
    setIsDetecting(true);
    try {
      const res = await requestBrowserLocation();
      if (res.success) {
        setActiveDistrict(res.district);
        setOfficeData(getOfficeForDistrict(res.district));
        setIsBannerVisible(false);
        setIsOpen(false);
        showToast(`✓ Location set to ${res.district}. Local branch office & dispatch SLA loaded!`);
      } else {
        showToast(`📍 Please pick your city below (e.g. Jaipur or Churu)`);
        setIsOpen(true);
        setIsBannerVisible(false);
      }
    } catch (e) {
      setIsOpen(true);
      setIsBannerVisible(false);
    } finally {
      setIsDetecting(false);
    }
  };

  // Select a specific district
  const handleSelectDistrict = (districtName) => {
    applyUserDistrict(districtName, { method: 'manual' });
    setActiveDistrict(districtName);
    setOfficeData(getOfficeForDistrict(districtName));
    setIsOpen(false);
    setIsBannerVisible(false);
    showToast(`✓ Active city set to ${districtName}. Local depot & office address updated!`);
  };

  const handleDismissBanner = () => {
    setIsBannerVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('rajbiosis_location_banner_dismissed', 'true');
    }
  };

  // Filter districts
  const filteredDistricts = ALL_DISTRICTS.filter((d) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q);
  }).slice(0, 15);

  if (!mounted) return null;

  return (
    <>
      {/* 1. Global Confirmation Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[92%] sm:w-auto bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage('')}
            className="ml-auto text-slate-400 hover:text-white p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 2. Floating Location Request Banner (On initial visit) */}
      {isBannerVisible && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-[90] bg-white rounded-3xl p-5 shadow-2xl border border-red-100 ring-1 ring-black/5 animate-in slide-in-from-bottom-6 duration-300">
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-red-50 text-brand-600 flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                  Allow Location for Local Service
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Connect with your nearest Raj Biosis Depot & Branch Office
                </p>
              </div>
            </div>

            <button
              onClick={handleDismissBanner}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed mb-3.5">
            Allow location access to view local branch addresses (e.g. <strong>Churu Branch</strong> or <strong>Jaipur HQ</strong>), accurate hospital delivery estimates, and direct local biomedical engineer contacts.
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoDetect}
              disabled={isDetecting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-98 disabled:opacity-70"
            >
              {isDetecting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Detecting...</span>
                </>
              ) : (
                <>
                  <Compass size={14} />
                  <span>Allow &amp; Detect Location</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsBannerVisible(false);
                setIsOpen(true);
              }}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Choose City
            </button>
          </div>

          {/* Quick 1-Click City Selectors inside Banner */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quick test:</span>
            <button
              onClick={() => handleSelectDistrict('Jaipur')}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-[10px] font-semibold transition"
            >
              Jaipur (HQ)
            </button>
            <button
              onClick={() => handleSelectDistrict('Churu')}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-[10px] font-semibold transition"
            >
              Churu (Branch)
            </button>
            <button
              onClick={() => handleSelectDistrict('Jodhpur')}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-[10px] font-semibold transition"
            >
              Jodhpur
            </button>
          </div>
        </div>
      )}

      {/* 3. Comprehensive Location & Office Hub Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    Select Your Hospital Location
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Current active delivery depot: <span className="font-bold text-brand-600">{activeDistrict}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              
              {/* GPS Auto-Detect Button */}
              <button
                onClick={handleAutoDetect}
                disabled={isDetecting}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-brand-50 hover:bg-brand-100/80 border border-brand-200/80 text-brand-900 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-xs">
                    {isDetecting ? <RefreshCw size={16} className="animate-spin" /> : <Compass size={18} />}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-brand-700">
                      {isDetecting ? 'Detecting via GPS...' : 'Use Current Device Location'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Auto-detect city, local branch office &amp; regional dispatch SLA
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-brand-600 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Office Address Preview for Currently Active City */}
              {officeData && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Building2 size={14} className="text-brand-600" />
                      <span>Assigned Office Network for {activeDistrict}:</span>
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>

                  {/* If user is outside Jaipur, show Local Branch First */}
                  {!officeData.isHeadOfficeOnly && officeData.local && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900">
                          📍 {officeData.local.city} Regional Service Station:
                        </span>
                        <span className="text-[10px] font-bold text-brand-600">Local Branch</span>
                      </div>
                      <div className="text-slate-600 text-[11px] leading-relaxed">
                        {officeData.local.address}
                      </div>
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-700">
                        <span>📞 {officeData.local.phone}</span>
                        <span>✉️ {officeData.local.email}</span>
                      </div>
                    </div>
                  )}

                  {/* Always Show Corporate Headquarters in Jaipur */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/90 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900">
                        🏢 Corporate Headquarters (Jaipur):
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">Head Office</span>
                    </div>
                    <div className="text-slate-600 text-[11px] leading-relaxed">
                      {HEAD_OFFICE.address}
                    </div>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-700">
                      <span>📞 {HEAD_OFFICE.phone}</span>
                      <span>✉️ {HEAD_OFFICE.email}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Popular Hubs (1-Click Selector) */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-2">
                  Popular Regional Hubs &amp; Depots
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {POPULAR_HUBS.map((hub) => {
                    const isSelected = activeDistrict.toLowerCase() === hub.name.toLowerCase();
                    return (
                      <button
                        key={hub.name}
                        onClick={() => handleSelectDistrict(hub.name)}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          isSelected
                            ? 'bg-brand-50 border-brand-500 text-brand-900 ring-1 ring-brand-500'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold leading-tight flex items-center justify-between">
                          <span>{hub.name}</span>
                          {isSelected && <CheckCircle2 size={12} className="text-brand-600" />}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                          {hub.type === 'head' ? 'Central HQ' : 'Regional Branch'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search All 50+ Districts */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Search All 50+ Districts &amp; Cities
                </label>
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type district name (e.g. Churu, Sikar, Kota, Bikaner)..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Filtered Search Results */}
                {searchQuery.trim() && (
                  <div className="mt-2 border border-slate-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100 bg-white shadow-xs">
                    {filteredDistricts.length > 0 ? (
                      filteredDistricts.map((d) => (
                        <button
                          key={`${d.name}-${d.state}`}
                          onClick={() => handleSelectDistrict(d.name)}
                          className="w-full px-3.5 py-2.5 text-left hover:bg-brand-50 flex items-center justify-between transition cursor-pointer"
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-800">{d.name}</div>
                            <div className="text-[10px] text-slate-400">{d.state}</div>
                          </div>
                          <span className="text-[11px] text-brand-600 font-semibold">Select &rarr;</span>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-500">
                        No districts found for &ldquo;{searchQuery}&rdquo;.
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Rajasthan: 50 Districts Covered • ISO 13485 Registered</span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

