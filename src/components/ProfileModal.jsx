'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  UserCheck,
  Building2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  CreditCard,
  QrCode,
  Printer,
  Trash2,
  ArrowRight,
  Award,
  AlertCircle
} from 'lucide-react';

const STORAGE_KEY = 'rajbiosis_user_profile';

const AVATAR_OPTIONS = [
  { id: 'doc-male', label: 'Doctor / Physician', icon: '👨‍⚕️' },
  { id: 'doc-female', label: 'Doctor / Surgeon', icon: '👩‍⚕️' },
  { id: 'admin', label: 'Hospital Admin', icon: '👔' },
  { id: 'engineer', label: 'Biomedical Engineer', icon: '🔬' },
  { id: 'clinic', label: 'Clinic Director', icon: '🏥' },
  { id: 'specialist', label: 'Radiology / ICU Lead', icon: '🩺' }
];

const FACILITY_TYPES = [
  'Super Speciality Hospital (200+ Beds)',
  'Multi-Speciality Hospital (50-200 Beds)',
  'Critical Care / Trauma Center',
  'Diagnostic & Imaging Center',
  'Private Clinic / Nursing Home',
  'Government / Armed Forces Hospital',
  'Medical Equipment Dealer / Distributor'
];

const INTEREST_AREAS = [
  'ICU Ventilators & Critical Care',
  'Digital Radiography & X-Ray Systems',
  'Operating Theatre (OT) & Surgical Lights',
  'Diagnostic Ultrasound & Doppler',
  'Sterilization & Autoclaves',
  'Hospital Beds & Intensive Furniture'
];

export default function ProfileModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'hospital' | 'card'
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    designation: 'Chief Medical Officer (CMO)',
    phone: '',
    email: '',
    avatar: '👨‍⚕️',
    hospitalName: '',
    facilityType: 'Super Speciality Hospital (200+ Beds)',
    bedCapacity: '100 - 250 Beds',
    city: '',
    state: '',
    pincode: '',
    gstin: '',
    registrationNo: '',
    interests: ['ICU Ventilators & Critical Care', 'Digital Radiography & X-Ray Systems'],
    memberId: '',
    createdAt: ''
  });

  // Load existing profile from localStorage on open
  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setFormData((prev) => ({
            ...prev,
            ...parsed
          }));
          setHasExistingProfile(true);
        } catch (err) {
          console.error('Failed to parse stored user profile', err);
        }
      } else {
        setHasExistingProfile(false);
      }
      setSavedSuccess(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleInterest = (interest) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((i) => i !== interest)
          : [...prev.interests, interest]
      };
    });
  };

  // Quick fill sample data for quick preview & testing
  const handleFillSample = () => {
    setFormData({
      fullName: 'Dr. Rajesh K. Sharma',
      designation: 'Medical Director & Chief of Surgery',
      phone: '9820144552',
      email: 'dr.sharma@rajbiosis-hospitals.in',
      avatar: '👨‍⚕️',
      hospitalName: 'Apollo Care Super Speciality Hospital',
      facilityType: 'Super Speciality Hospital (200+ Beds)',
      bedCapacity: '250 - 500 Beds',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      gstin: '27AABCA1234F1Z8',
      registrationNo: 'MH-MED-2024-8891',
      interests: [
        'ICU Ventilators & Critical Care',
        'Digital Radiography & X-Ray Systems',
        'Operating Theatre (OT) & Surgical Lights'
      ],
      memberId: 'RB-MED-2026-7842',
      createdAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    });
  };

  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();

    if (!formData.fullName.trim()) {
      alert('कृपया अपना पूरा नाम दर्ज करें (Please enter your full name)');
      setActiveTab('personal');
      return;
    }

    const memberId = formData.memberId || `RB-MED-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAt = formData.createdAt || new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const updatedProfile = {
      ...formData,
      memberId,
      createdAt,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
    setFormData(updatedProfile);
    setHasExistingProfile(true);
    setSavedSuccess(true);

    // Notify other components & window
    window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: updatedProfile }));

    setTimeout(() => {
      setSavedSuccess(false);
    }, 3500);
  };

  const handleDeleteProfile = () => {
    if (window.confirm('क्या आप अपनी प्रोफ़ाइल हटाना चाहते हैं? (Are you sure you want to delete your saved profile?)')) {
      localStorage.removeItem(STORAGE_KEY);
      setHasExistingProfile(false);
      setFormData({
        fullName: '',
        designation: 'Chief Medical Officer (CMO)',
        phone: '',
        email: '',
        avatar: '👨‍⚕️',
        hospitalName: '',
        facilityType: 'Super Speciality Hospital (200+ Beds)',
        bedCapacity: '100 - 250 Beds',
        city: '',
        state: '',
        pincode: '',
        gstin: '',
        registrationNo: '',
        interests: ['ICU Ventilators & Critical Care'],
        memberId: '',
        createdAt: ''
      });
      window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: null }));
    }
  };

  // Calculate completion percentage
  const fields = [
    formData.fullName,
    formData.designation,
    formData.phone,
    formData.email,
    formData.hospitalName,
    formData.city,
    formData.gstin
  ];
  const filledCount = fields.filter((f) => !!f && f.trim() !== '').length;
  const completionPercent = Math.round((filledCount / fields.length) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 text-white p-4 sm:p-5 relative border-b border-blue-800/80">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center text-2xl shadow-md shadow-red-500/20 shrink-0 border border-red-400/30">
                {formData.avatar || '👨‍⚕️'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                    <ShieldCheck size={11} className="text-white" />
                    Verified Healthcare Procurement
                  </span>
                  {hasExistingProfile && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-100 border border-emerald-400/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                      Active Profile
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                  {hasExistingProfile ? 'Manage Healthcare Profile' : 'Create Hospital / Professional Profile'}
                </h2>
                <p className="text-xs text-blue-100 line-clamp-1">
                  {formData.hospitalName ? formData.hospitalName : 'Raj Biosis Life Systems • Direct OEM Procurement Hub'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition border border-white/20"
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Profile Completion Bar */}
          <div className="mt-4 pt-3 border-t border-blue-600/60 flex items-center justify-between text-xs text-blue-100 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-blue-200">Profile Readiness:</span>
              <span className="font-bold text-white font-mono">{completionPercent}%</span>
            </div>
            <div className="flex-1 max-w-[200px] bg-blue-900/40 h-2 rounded-full overflow-hidden border border-blue-500/30">
              <div
                className="bg-gradient-to-r from-amber-300 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              ></div>
            </div>
            <button
              type="button"
              onClick={handleFillSample}
              className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition underline underline-offset-2"
              title="Fill demo values to preview instantly"
            >
              <Sparkles size={12} /> Auto-Fill Demo Data
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 sm:px-6 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'personal'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User size={15} />
            <span>Doctor / Officer Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hospital')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'hospital'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 size={15} />
            <span>Hospital / Institution</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'card'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard size={15} />
            <span>Digital Procurement ID</span>
          </button>
        </div>

        {/* Success Alert Banner */}
        {savedSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center gap-2 text-emerald-800 text-xs sm:text-sm font-semibold animate-fade-in">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>प्रोफ़ाइल सफलतापूर्वक सहेजी गई! (Profile successfully saved! Ready for instant RFQ & orders)</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: PERSONAL & CONTACT */}
          {activeTab === 'personal' && (
            <div className="space-y-4 animate-fade-in">
              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Choose Avatar Persona
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleChange('avatar', item.icon)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition ${
                        formData.avatar === item.icon
                          ? 'border-red-600 bg-red-50/80 shadow-xs ring-1 ring-red-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-[10px] font-semibold text-slate-700 truncate w-full text-center">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name / पूरा नाम <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder="e.g. Dr. Rajesh Sharma"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none font-medium transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Designation / पद भूमिका <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.designation}
                    onChange={(e) => handleChange('designation', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none font-medium transition"
                  >
                    <option value="Chief Medical Officer (CMO)">Chief Medical Officer (CMO)</option>
                    <option value="Medical Superintendent / Director">Medical Superintendent / Director</option>
                    <option value="Head of Biomedical Engineering (BME)">Head of Biomedical Engineering (BME)</option>
                    <option value="Procurement & Purchase Manager">Procurement & Purchase Manager</option>
                    <option value="Critical Care / ICU Specialist">Critical Care / ICU Specialist</option>
                    <option value="Radiologist / Imaging Head">Radiologist / Imaging Head</option>
                    <option value="Clinic Owner / Practicing Doctor">Clinic Owner / Practicing Doctor</option>
                    <option value="Medical Equipment Distributor">Medical Equipment Distributor</option>
                  </select>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Direct Mobile / WhatsApp (फोन नंबर)
                  </label>
                  <div className="relative flex">
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 text-slate-600 text-xs font-semibold">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="9820144552"
                      className="w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-r-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none font-medium transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Email (ईमेल पता)
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="purchase@hospital.org"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none font-medium transition"
                    />
                  </div>
                </div>
              </div>

              {/* Quick tip */}
              <div className="p-3 bg-red-50/60 border border-red-200/80 rounded-xl flex items-start gap-2.5 text-xs text-red-950">
                <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <span>
                  Your contact information will automatically auto-fill into <strong>Request for Quotation (RFQ)</strong> and warranty registration sheets.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: HOSPITAL & INSTITUTION */}
          {activeTab === 'hospital' && (
            <div className="space-y-4 animate-fade-in">
              {/* Hospital Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hospital / Institution Name (अस्पताल का नाम) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.hospitalName}
                    onChange={(e) => handleChange('hospitalName', e.target.value)}
                    placeholder="e.g. Apollo Care Super Speciality Hospital"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none font-medium transition"
                  />
                </div>
              </div>

              {/* Facility Type & Bed Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Facility Category (संस्थान प्रकार)
                  </label>
                  <select
                    value={formData.facilityType}
                    onChange={(e) => handleChange('facilityType', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none font-medium transition"
                  >
                    {FACILITY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bed Capacity (बेड क्षमता)
                  </label>
                  <select
                    value={formData.bedCapacity}
                    onChange={(e) => handleChange('bedCapacity', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none font-medium transition"
                  >
                    <option value="10 - 50 Beds">10 - 50 Beds (Clinic / Nursing Home)</option>
                    <option value="50 - 100 Beds">50 - 100 Beds (Secondary Care)</option>
                    <option value="100 - 250 Beds">100 - 250 Beds (Multi-Speciality)</option>
                    <option value="250 - 500 Beds">250 - 500 Beds (Tertiary Care)</option>
                    <option value="500+ Beds">500+ Beds (Apex Medical Institute)</option>
                  </select>
                </div>
              </div>

              {/* City, State, Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City / शहर
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="e.g. Mumbai / Jaipur"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none font-medium transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    State / राज्य
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none font-medium transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pincode / पिन कोड
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                    placeholder="e.g. 400001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none font-medium transition"
                  />
                </div>
              </div>

              {/* GSTIN & Hospital Registration No */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    GSTIN (जीएसटी नंबर) <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                    placeholder="27AABCA1234F1Z8"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 uppercase font-mono focus:bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none font-medium transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Clinical Reg. No / लाइसेंस संख्या <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.registrationNo}
                    onChange={(e) => handleChange('registrationNo', e.target.value.toUpperCase())}
                    placeholder="e.g. MH-MED-2024-8891"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 uppercase font-mono focus:bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none font-medium transition"
                  />
                </div>
              </div>

              {/* Equipment Interests */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Clinical Equipment of Interest
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {INTEREST_AREAS.map((interest) => {
                    const isSelected = formData.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleToggleInterest(interest)}
                        className={`text-left px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-red-50/80 border-red-500 text-red-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{interest}</span>
                        {isSelected ? (
                          <CheckCircle2 size={14} className="text-red-600 shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-300"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIGITAL HEALTHCARE ID CARD PREVIEW */}
          {activeTab === 'card' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center sm:text-left">
                <h3 className="text-sm font-bold text-slate-900">Digital Healthcare Procurement Pass</h3>
                <p className="text-xs text-slate-500">
                  Official buyer credentials for Raj Biosis institutional procurement discounts & GeM tender support.
                </p>
              </div>

              {/* The Styled Smart Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-5 sm:p-6 shadow-xl border border-slate-700/80">
                {/* Background watermark effect */}
                <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                  <ShieldCheck size={240} />
                </div>
                <div className="absolute top-0 right-0 w-36 h-36 bg-red-600/10 rounded-full blur-2xl"></div>

                {/* Card Top Row */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-xs shadow-md">
                      RB
                    </div>
                    <div>
                      <div className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                        Raj Biosis Life Systems
                      </div>
                      <div className="text-[10px] text-red-400 font-medium">
                        Verified Procurement Partner
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                    ISO 13485 CERTIFIED
                  </span>
                </div>

                {/* Card Middle: Hospital & Officer */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="sm:col-span-2 space-y-2">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                        Hospital / Organization
                      </div>
                      <div className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                        {formData.hospitalName || 'Apollo Care Super Speciality Hospital'}
                      </div>
                      <div className="text-xs text-slate-300">
                        {formData.city || 'Mumbai'}, {formData.state || 'Maharashtra'}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <div className="text-2xl">{formData.avatar || '👨‍⚕️'}</div>
                      <div>
                        <div className="text-xs font-bold text-slate-100">
                          {formData.fullName || 'Dr. Rajesh K. Sharma'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {formData.designation || 'Chief Medical Officer'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Simulation */}
                  <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
                    <QrCode size={56} className="text-slate-200" />
                    <span className="text-[9px] font-mono text-slate-400 mt-1">SCAN FOR OEM VERIFY</span>
                  </div>
                </div>

                {/* Card Bottom: Member ID & Validity */}
                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <div>
                    <span>MEMBER ID: </span>
                    <span className="text-white font-bold">{formData.memberId || 'RB-MED-2026-7842'}</span>
                  </div>
                  <div>
                    <span>ISSUED: </span>
                    <span className="text-white font-semibold">
                      {formData.createdAt || '2026 Season'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Print / Save Card Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  <Printer size={13} />
                  <span>Print Healthcare ID Pass</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {hasExistingProfile && (
              <button
                type="button"
                onClick={handleDeleteProfile}
                className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition flex items-center justify-center gap-1.5 w-full sm:w-auto"
                title="Remove profile data from browser"
              >
                <Trash2 size={13} />
                <span>Delete Profile</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveProfile}
              className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 active:scale-95 rounded-xl shadow-md shadow-red-600/25 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <CheckCircle2 size={16} />
              <span>{hasExistingProfile ? 'Update Profile' : 'Save & Activate Profile'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
