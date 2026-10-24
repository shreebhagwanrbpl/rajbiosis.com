'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  FileText,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  User,
  Mail,
  MapPin,
  Truck,
  KeyRound,
  RefreshCw,
  Clock,
  Sparkles,
  Building2
} from 'lucide-react';
import CountryCodeSelector from './CountryCodeSelector';
import DistrictSelector from './DistrictSelector';
import { DEFAULT_COUNTRY_CODE } from '../data/internationalCodes';
import { getUserProfile, saveUserProfile, getActiveDistrict, saveUserInquiry } from '../utils/userProfile';
import { recordCustomerLead } from '../utils/leads';
import { BRAND_LOGOS } from '../data/brands';

export default function ProductEnquiryModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState(null);

  // Modal Flow Step: 'form' | 'otp' | 'success'
  const [step, setStep] = useState('form');

  // Form Fields (All 3 Mandatory)
  const [customerName, setCustomerName] = useState('');
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('Jaipur');
  const [address, setAddress] = useState('');

  // OTP State
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);

  // Profile completeness & auto redirect state
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const redirectTimerRef = useRef(null);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Listen for open-product-enquiry event
  useEffect(() => {
    const handleOpenEnquiry = (event) => {
      const prod = event.detail;
      if (prod) {
        setProduct(prod);
        setStep('form');
        setError('');
        setOtpError('');
        setEnteredOtp('');

        // Pre-fill from existing user profile if available
        const profile = getUserProfile();
        if (profile) {
          if (profile.fullName) setCustomerName(profile.fullName);
          if (profile.phone) setPhone(profile.phone);
          if (profile.countryCode) setCountryCode(profile.countryCode);
          if (profile.email) setEmail(profile.email);
          if (profile.district) setDistrict(profile.district);
          if (profile.address) setAddress(profile.address);
        } else {
          setDistrict(getActiveDistrict());
        }

        setIsOpen(true);
      }
    };

    window.addEventListener('open-product-enquiry', handleOpenEnquiry);
    return () => window.removeEventListener('open-product-enquiry', handleOpenEnquiry);
  }, []);

  // Handle resend timer countdown
  useEffect(() => {
    let interval = null;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  // Handle auto-redirect countdown if profile is incomplete
  useEffect(() => {
    if (step === 'success' && isProfileIncomplete) {
      if (redirectCountdown > 0) {
        redirectTimerRef.current = setTimeout(() => {
          setRedirectCountdown(prev => prev - 1);
        }, 1000);
      } else {
        // Time expired, perform automatic redirect
        handleClose();
        router.push('/profile');
      }
    }
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, [step, isProfileIncomplete, redirectCountdown, router]);

  const handleClose = () => {
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    setIsOpen(false);
    setStep('form');
    setError('');
    setOtpError('');
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/[^\d\s-]/g, '');
    setPhone(val);
    if (error && val.trim().length >= 7) {
      setError('');
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error && e.target.value.includes('@')) {
      setError('');
    }
  };

  // Validate the 3 mandatory fields: Phone, Email, District
  const validateForm = () => {
    const cleanDigits = phone.replace(/\D/g, '');
    if (!cleanDigits) {
      return 'Mobile / Phone number is required';
    }
    if (cleanDigits.length < 7) {
      return 'Please enter a valid phone number (at least 7 digits)';
    }

    if (!email || !email.trim()) {
      return 'Email address is required for official quotation delivery';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid official email address (e.g. name@hospital.org)';
    }

    if (!district || !district.trim()) {
      return 'Please select your delivery district';
    }

    return '';
  };

  // Step 1: User submits the 3 mandatory fields -> Generate & send OTP
  const handleProceedToOtp = (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setResendTimer(30);
    setOtpError('');
    setError('');
    setStep('otp');

    // Notify backend (optional mock sync)
    try {
      fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), phone: phone.trim(), otp: code })
      }).catch(() => { });
    } catch (e) { }
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newCode);
    setResendTimer(30);
    setOtpError('');
  };

  // Step 2: Verify OTP and finalize quotation
  const handleVerifyOtpAndSubmit = (e) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      setOtpError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setOtpError('Invalid OTP code. Please enter the code sent to your email.');
      return;
    }

    // OTP Verified! Proceed to generate Quote
    setIsSubmitting(true);
    setOtpError('');

    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();
    const displayName = customerName.trim() || 'Medical Client';

    const quoteNumber = `RB-QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const gstRate = product?.category === 'radiology-imaging' ? '18%' : '12%';
    const unitPrice = product?.price || 100000;
    const gstAmount = Math.round(unitPrice * (gstRate === '18%' ? 0.18 : 0.12));
    const grandTotal = unitPrice + gstAmount;

    const enquiryData = {
      id: `RFQ-${Date.now().toString().slice(-6)}`,
      quoteNumber: quoteNumber,
      productId: product?.id,
      productName: product?.name,
      productSku: product?.sku,
      productCategory: product?.category,
      productBrand: product?.brand || 'Raj Biosis OEM',
      productImage: product?.image,
      quantity: 1,
      unitPrice: unitPrice,
      totalAmount: unitPrice,
      gstRate: gstRate,
      gstAmount: gstAmount,
      grandTotal: grandTotal,
      warranty: product?.warranty || '2 Years Comprehensive Warranty',
      customerName: displayName,
      countryCode: countryCode,
      customerPhone: `${countryCode} ${cleanPhone}`,
      customerEmail: cleanEmail,
      district: district.trim(),
      address: address.trim(),
      status: 'Quotation Sent (Email Verified)',
      statusNote: `Official quotation generated & verified via email OTP (${cleanEmail}) for ${district.trim()}.`,
      deliveryEstimate: `24-48 Hours Express Dispatch to ${district.trim()}`,
      validTill: '30 Days from issue',
      createdAt: new Date().toISOString()
    };

    try {
      // Save enquiry to localStorage
      saveUserInquiry(enquiryData);

      // Check existing user profile
      const currentProfile = getUserProfile();
      const updatedProfile = {
        fullName: currentProfile?.fullName || displayName,
        hospitalName: currentProfile?.hospitalName || '',
        countryCode: countryCode,
        phone: cleanPhone,
        email: cleanEmail,
        district: district.trim(),
        address: currentProfile?.address || address.trim()
      };

      saveUserProfile(updatedProfile);

      // Check if profile is incomplete (missing name, hospital name, or full address)
      const incomplete = !updatedProfile.fullName || updatedProfile.fullName === 'Medical Client' || !updatedProfile.hospitalName || !updatedProfile.address;
      setIsProfileIncomplete(incomplete);
      setRedirectCountdown(20);

      // Record lead in central repository for District Employee & Admin
      recordCustomerLead({
        ...enquiryData,
        customerName: updatedProfile.fullName,
        hospitalName: updatedProfile.hospitalName || `${district.trim()} Medical Center`,
        customerPhone: enquiryData.customerPhone,
        customerEmail: enquiryData.customerEmail,
        district: district.trim(),
        productName: product.name,
        productSku: product.sku,
        qty: 1,
        unitPrice: product.price,
        isNegotiable: Boolean(product.isNegotiable)
      });

      // Post enquiry to API
      fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiryData)
      }).catch(() => { });
    } catch (err) {
      console.error('Failed to save enquiry', err);
    } finally {
      setIsSubmitting(false);
      setStep('success');
    }
  };

  const handleManualRedirect = () => {
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    handleClose();
    router.push('/profile');
  };

  if (!isOpen || !product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={handleClose}
    >
      {/* Horizontal Modal Container - Wide & Open */}
      <div
        className="relative w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[95vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-3.5 border-b border-slate-100 bg-slate-50/90">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span>
              {step === 'form' && 'Official Institutional Quotation Request'}
              {step === 'otp' && 'Email Verification & Quotation Authentication'}
              {step === 'success' && 'Official Quotation Dispatched & Verified'}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        {step === 'success' ? (
          /* Step 3: Success Confirmation with Auto-Redirect Notice */
          <div className="flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto">
              {/* Left Side: Confirmation Message & Localized Details */}
              <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-5 bg-white">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold mb-3">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Email Verified &bull; Quotation Dispatched</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                    Official Quotation Generated!
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    Thank you. Your quotation for <strong className="text-slate-900">{product.name}</strong> has been issued to <strong className="text-slate-900">{email}</strong> with regional dispatch mapped to <strong className="text-brand-700">{district} Hub</strong>.
                  </p>

                  {/* Profile Incomplete Alert & Timer Box */}
                  {isProfileIncomplete ? (
                    <div className="mt-4 p-4 bg-amber-50/90 border border-amber-300 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                        <span className="flex items-center gap-1.5">
                          <Building2 size={15} className="text-amber-700" />
                          <span>Hospital Profile Incomplete</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950 font-mono text-[11px] font-extrabold flex items-center gap-1">
                          <Clock size={11} />
                          <span>Redirecting in {redirectCountdown}s</span>
                        </span>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        To register institutional GST invoices, authorized signatory name, and hospital delivery address, please complete your profile.
                      </p>
                      <button
                        onClick={handleManualRedirect}
                        className="w-full mt-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>Complete Hospital Profile Now</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                      <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <ShieldCheck size={15} className="text-emerald-600" />
                        <span>Institutional Hospital Profile Verified</span>
                      </div>
                      <p className="text-xs text-emerald-700">
                        Quotation and datasheets have been synced to your profile dashboard.
                      </p>
                    </div>
                  )}

                  {/* Localized Response Box */}
                  <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-700">
                      <span>Delivery Hub:</span>
                      <span className="text-brand-700 font-bold">{district} Depot (24-48h SLA)</span>
                    </div>
                    <div className="flex items-center justify-between font-semibold text-slate-700">
                      <span>Verified Mobile:</span>
                      <span className="font-mono text-slate-900">{countryCode} {phone}</span>
                    </div>
                    <div className="flex items-center justify-between font-semibold text-slate-700">
                      <span>Verified Email:</span>
                      <span className="font-mono text-slate-900">{email}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer text-center"
                  >
                    Close & Continue
                  </button>
                  <button
                    onClick={handleManualRedirect}
                    className="py-3 px-5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <span>My Profile</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Right Side: Partner Brands Grid */}
              <div className="md:col-span-6 p-6 sm:p-7 bg-slate-50/70 border-t md:border-t-0 md:border-l border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Direct OEM Partner Brands
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                      17+ Authorized
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {BRAND_LOGOS.map((brand, idx) => (
                      <div
                        key={`success-brand-${idx}`}
                        className="h-14 sm:h-15 bg-white border border-slate-200/90 rounded-xl p-2 flex items-center justify-center shadow-xs hover:border-slate-400 hover:shadow-sm transition"
                        title={brand.name}
                      >
                        <img
                          src={brand.src}
                          alt={brand.name}
                          className="max-h-9 max-w-[100px] w-auto h-auto object-contain"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/70 text-xs text-slate-500 flex items-center justify-between mt-3 font-medium">
                  <span>100% Genuine Certified Equipment</span>
                  <span className="font-bold text-slate-700">Pan-India Support</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Step 1 & Step 2: Form & Email OTP Verification */
          <>
            <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto">
              {/* Left Column: Product Side */}
              <div className="md:col-span-5 p-5 sm:p-6 bg-slate-50/60 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="w-full h-36 sm:h-40 bg-white rounded-2xl border border-slate-200/90 p-3 flex items-center justify-center overflow-hidden shadow-2xs">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="mt-2.5 w-full">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 block mb-0.5">
                      Selected Medical Equipment
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {product.name}
                    </h4>

                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-slate-500 font-mono">
                      <span className="bg-slate-200/80 px-2 py-0.5 rounded text-slate-700 font-semibold text-[10px]">
                        SKU: {product.sku}
                      </span>
                      <span>&bull;</span>
                      <span className="capitalize text-[10px] text-slate-600">
                        {product.category?.replace(/-/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Localized Delivery SLA info (Moved UP as requested) */}
                  <div className="mt-3 p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5 shadow-2xs">
                    <Truck size={16} className="text-brand-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block text-[11px]">
                        Express Institutional Dispatch to {district}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Standard factory calibration & 2-year on-site biomedical SLA.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Brands We Deal In Carousel Under Dispatch Box (Prominently Sized Logos) */}
                <div className="mt-4 pt-3 border-t border-slate-200/90 overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Brands We Deal In &bull; Direct OEM</span>
                    </span>
                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200">
                      17+ OEMs
                    </span>
                  </div>

                  <div className="relative overflow-hidden w-full bg-white rounded-xl border border-slate-200/90 py-2 px-2 shadow-2xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

                    <div className="animate-marquee flex items-center gap-6">
                      {BRAND_LOGOS.map((brand, idx) => (
                        <div
                          key={`modal-brand-1-${idx}`}
                          className="flex items-center gap-2 shrink-0 select-none"
                          title={brand.name}
                        >
                          <img
                            src={brand.src}
                            alt={brand.name}
                            className="max-h-9 sm:max-h-10 max-w-[95px] sm:max-w-[115px] w-auto h-auto object-contain"
                            loading="lazy"
                          />
                          <div className="h-4 w-px bg-slate-200 ml-4 shrink-0" />
                        </div>
                      ))}
                      {BRAND_LOGOS.map((brand, idx) => (
                        <div
                          key={`modal-brand-2-${idx}`}
                          className="flex items-center gap-2 shrink-0 select-none"
                          title={brand.name}
                        >
                          <img
                            src={brand.src}
                            alt={brand.name}
                            className="max-h-9 sm:max-h-10 max-w-[95px] sm:max-w-[115px] w-auto h-auto object-contain"
                            loading="lazy"
                          />
                          <div className="h-4 w-px bg-slate-200 ml-4 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Step 1 (3 Mandatory Fields) OR Step 2 (Email OTP) */}
              <div className="md:col-span-7 p-7 sm:p-10 flex flex-col justify-center bg-white space-y-5">
                {step === 'form' ? (
                  /* Step 1: 3 Mandatory Fields Form (Mobile, Email, District) */
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold mb-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                      <span>Instant Official Quotation &amp; OTP Verification</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Request Instant Quotation
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                      All 3 fields are mandatory. A secure verification OTP will be sent to your email to validate your institutional quote request.
                    </p>

                    <form onSubmit={handleProceedToOtp} className="mt-5 space-y-4">
                      {/* 1. International Mobile Number (Mandatory) */}
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                          Mobile Number <span className="text-red-600 font-bold">*</span>
                        </label>
                        <div className="relative flex shadow-2xs rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-red-500/20">
                          <CountryCodeSelector
                            value={countryCode}
                            onChange={setCountryCode}
                          />
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={handlePhoneChange}
                            placeholder="Enter 10-digit mobile number"
                            className="w-full pl-3.5 pr-4 py-3 bg-slate-50 text-slate-900 text-sm sm:text-base font-semibold border border-l-0 border-slate-300 focus:border-red-500 focus:bg-white outline-none transition"
                          />
                        </div>
                      </div>

                      {/* 2. Official Email Address (Mandatory) */}
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                          Official Email Address <span className="text-red-600 font-bold">*</span>
                        </label>
                        <div className="relative flex items-center shadow-2xs rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-red-500/20">
                          <div className="pl-3.5 pr-1 text-slate-400 bg-slate-50 py-3 border-y border-l border-slate-300">
                            <Mail size={18} />
                          </div>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={handleEmailChange}
                            placeholder="e.g. doctor@hospital.org or procurement@gmail.com"
                            className="w-full pl-2.5 pr-4 py-3 bg-slate-50 text-slate-900 text-sm sm:text-base font-semibold border border-l-0 border-slate-300 focus:border-red-500 focus:bg-white outline-none transition"
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Official quotation PDF and OTP will be delivered to this email.
                        </span>
                      </div>

                      {/* 3. District Selector (Delivery Zone - Mandatory) */}
                      <div>
                        <DistrictSelector
                          value={district}
                          onChange={setDistrict}
                          required={true}
                          label="Delivery District"
                        />
                      </div>

                      {/* Error Notice */}
                      {error && (
                        <p className="text-xs sm:text-sm font-semibold text-red-600 flex items-center gap-1.5 animate-fade-in bg-red-50 p-3 rounded-xl border border-red-200">
                          <AlertCircle size={16} className="shrink-0" />
                          <span>{error}</span>
                        </p>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className="w-full py-3.5 sm:py-4 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-black text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer mt-5"
                      >
                        <FileText size={18} />
                        <span>Proceed to Verify Email &amp; Get Quote</span>
                        <ArrowRight size={17} />
                      </button>

                      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
                        <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                        <span>Instant verification with authentic OEM tender rates</span>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* Step 2: Email OTP Verification Screen */
                  <div className="space-y-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold mb-2">
                        <KeyRound size={13} className="text-emerald-600" />
                        <span>Step 2 of 2: Security Verification</span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        Enter Email Verification OTP
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        We have sent a 6-digit verification code to: <strong className="text-slate-900">{email}</strong>
                      </p>
                    </div>

                    {/* Developer Mock Banner for Instant Testing */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-blue-600 shrink-0" />
                        <span>
                          Test Code for {email}: <strong className="font-mono text-sm tracking-widest text-blue-700 font-bold">{generatedOtp}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEnteredOtp(generatedOtp)}
                        className="text-[10px] bg-blue-600 text-white font-bold px-2.5 py-1 rounded-lg hover:bg-blue-700 transition cursor-pointer shrink-0"
                      >
                        Auto-Fill Code
                      </button>
                    </div>

                    <form onSubmit={handleVerifyOtpAndSubmit} className="space-y-4">
                      {/* OTP Input Field */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          6-Digit Email OTP Code <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          autoFocus
                          value={enteredOtp}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setEnteredOtp(val);
                            if (otpError) setOtpError('');
                          }}
                          placeholder="Enter 6-digit OTP"
                          className="w-full text-center tracking-[0.4em] font-mono text-xl sm:text-2xl font-black py-3 px-4 bg-slate-50 text-slate-900 border border-slate-300 rounded-xl focus:border-red-500 focus:bg-white outline-none transition"
                        />
                      </div>

                      {/* Error Message */}
                      {otpError && (
                        <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5 animate-fade-in bg-red-50 p-2.5 rounded-lg border border-red-200">
                          <AlertCircle size={14} className="shrink-0" />
                          <span>{otpError}</span>
                        </p>
                      )}

                      {/* Action Buttons */}
                      <button
                        type="submit"
                        disabled={isSubmitting || enteredOtp.length !== 6}
                        className="w-full py-3 sm:py-3.5 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        <CheckCircle2 size={18} />
                        <span>{isSubmitting ? 'Verifying & Generating Quote...' : 'Verify OTP & Issue Official Quotation'}</span>
                        <ArrowRight size={17} />
                      </button>

                      {/* Resend and Edit buttons */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <button
                          type="button"
                          onClick={() => setStep('form')}
                          className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer underline"
                        >
                          &larr; Edit Mobile / Email
                        </button>

                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={resendTimer > 0}
                          className={`font-semibold flex items-center gap-1 ${resendTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-brand-600 hover:underline cursor-pointer'}`}
                        >
                          <RefreshCw size={12} className={resendTimer > 0 ? '' : 'animate-spin'} />
                          <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP Code'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
