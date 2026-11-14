'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  ShieldCheck,
  Truck,
  FileCheck,
  Building2,
  ArrowRight,
  FileText,
  Tag,
  KeyRound,
  Mail,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  getCart,
  updateCartQty,
  updateCartExpectedPrice,
  removeFromCart,
  clearCart,
  CART_UPDATED_EVENT,
  OPEN_CART_EVENT
} from '../utils/cart';
import {
  getUserProfile,
  saveUserProfile,
  getActiveDistrict,
  saveUserInquiry,
  isCustomerLoggedIn,
  setCustomerLoggedIn
} from '../utils/userProfile';
import { recordCustomerLead } from '../utils/leads';
import CountryCodeSelector from './CountryCodeSelector';
import DistrictSelector from './DistrictSelector';
import { DEFAULT_COUNTRY_CODE } from '../data/internationalCodes';

export default function CartDrawer() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [activeDistrict, setActiveDistrict] = useState('Jaipur');

  // Checkout / Quick Quote Step: 'cart' | 'contact_form' | 'otp' | 'success'
  const [quoteStep, setQuoteStep] = useState('cart');

  // Contact Form Fields (Mandatory)
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('Jaipur');
  const [customerName, setCustomerName] = useState('');
  const [formError, setFormError] = useState('');
  const [cartError, setCartError] = useState('');

  // OTP State
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteToken, setQuoteToken] = useState('');
  const [activeOffer, setActiveOffer] = useState(null);

  // Fetch active special offer for this customer / storewide
  const fetchOffers = async (overridePhone) => {
    try {
      const prof = typeof window !== 'undefined' ? getUserProfile() : null;
      const ph = (overridePhone || prof?.phone || phone || '').replace(/\D/g, '').slice(-10);
      const url = ph ? `/api/cart-wishlist?phone=${encodeURIComponent(ph)}&checkOffers=true` : `/api/cart-wishlist?checkOffers=true`;
      const res = await fetch(url).catch(() => null);
      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.success && data.activeOffer) {
          setActiveOffer(data.activeOffer);
        } else {
          setActiveOffer(null);
        }
      }
    } catch (err) {
      console.warn('Failed to load active offers:', err);
    }
  };

  const isItemEligibleForOffer = (item, offer) => {
    if (!offer || !offer.active) return false;
    if (offer.validTill && new Date(offer.validTill) < new Date()) return false;
    if (offer.productScope === 'all_catalog') return true;
    if (Array.isArray(offer.selectedProductIds) && offer.selectedProductIds.length > 0) {
      return offer.selectedProductIds.includes(item.id) || offer.selectedProductIds.includes(item.sku);
    }
    return true;
  };

  const getItemDiscountedPrice = (item, offer) => {
    if (!isItemEligibleForOffer(item, offer)) return item.price;
    if (offer.type === 'percentage') {
      const pct = Number(offer.value || 0);
      if (pct > 0 && item.price) {
        return Math.round(item.price * (1 - pct / 100));
      }
    }
    return item.price;
  };

  const calculateCartTotals = () => {
    const originalSubtotal = cartItems.reduce((acc, item) => acc + ((item.price || 0) * (item.qty || 1)), 0);
    let totalDiscount = 0;

    if (activeOffer && (!activeOffer.validTill || new Date(activeOffer.validTill) >= new Date())) {
      if (activeOffer.type === 'percentage') {
        const pct = Number(activeOffer.value || 0);
        cartItems.forEach(item => {
          if (isItemEligibleForOffer(item, activeOffer)) {
            const itemOriginalTotal = (item.price || 0) * (item.qty || 1);
            totalDiscount += Math.round(itemOriginalTotal * (pct / 100));
          }
        });
      } else if (activeOffer.type === 'flat') {
        const flatVal = Number(activeOffer.value || 0);
        totalDiscount = Math.min(flatVal, originalSubtotal);
      }
    }

    const netTotal = Math.max(0, originalSubtotal - totalDiscount);
    return { originalSubtotal, totalDiscount, netTotal };
  };

  // Auto redirect timer for incomplete profile
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  // Sync cart items on mount & on event
  useEffect(() => {
    const syncCart = () => {
      setCartItems(getCart());
      fetchOffers();
    };
    syncCart();

    const handleOpen = () => {
      syncCart();
      const dist = getActiveDistrict();
      setActiveDistrict(dist);
      setDistrict(dist);

      // Pre-fill profile info if exists
      const prof = getUserProfile();
      if (prof) {
        if (prof.phone) setPhone(prof.phone);
        if (prof.email) setEmail(prof.email);
        if (prof.countryCode) setCountryCode(prof.countryCode);
        if (prof.fullName) setCustomerName(prof.fullName);
        if (prof.district) {
          setActiveDistrict(prof.district);
          setDistrict(prof.district);
        }
      }

      setQuoteStep('cart');
      setFormError('');
      setOtpError('');
      setIsOpen(true);
    };

    window.addEventListener(CART_UPDATED_EVENT, syncCart);
    window.addEventListener(OPEN_CART_EVENT, handleOpen);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, syncCart);
      window.removeEventListener(OPEN_CART_EVENT, handleOpen);
    };
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle countdown on success - ONLY redirect if profile is incomplete!
  useEffect(() => {
    let timer = null;
    if (quoteStep === 'success') {
      const prof = typeof window !== 'undefined' ? getUserProfile() : null;
      const isComplete = Boolean(
        prof && (
          prof.isProfileComplete ||
          (prof.hospitalName && prof.hospitalName.trim() && prof.hospitalName.trim().toUpperCase() !== 'NA')
        )
      );

      // Only auto-redirect if hospital & billing details are NOT complete!
      if (!isComplete) {
        if (redirectCountdown > 0) {
          timer = setTimeout(() => {
            setRedirectCountdown(prev => prev - 1);
          }, 1000);
        } else {
          setIsOpen(false);
          router.push('/profile');
        }
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [quoteStep, redirectCountdown, router]);

  const handleClose = () => {
    setIsOpen(false);
    setQuoteStep('cart');
    setFormError('');
    setOtpError('');
  };

  const handleQtyChange = (id, newQty) => {
    updateCartQty(id, newQty);
  };

  const handleRemove = (id) => {
    removeFromCart(id);
  };

  const handleClear = () => {
    clearCart();
  };

  const handleExpectedPriceChange = (id, value) => {
    updateCartExpectedPrice(id, value);
  };

  const formatINR = (val) => {
    if (!val || isNaN(val)) return 'Price on Request';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Direct quote submission for already logged-in / verified customers without asking OTP
  const submitDirectlyForLoggedInUser = () => {
    setIsSubmitting(true);
    setFormError('');
    setOtpError('');
    setCartError('');

    const prof = getUserProfile() || {};
    const cleanPhone = (phone || prof.phone || '').trim();
    const cleanEmail = (email || prof.email || '').trim();
    const displayName = (customerName || prof.fullName || '').trim();
    const selectedDistrict = (district || prof.district || activeDistrict || 'Jaipur').trim();
    const currentCountryCode = countryCode || prof.countryCode || DEFAULT_COUNTRY_CODE;

    const totals = calculateCartTotals();
    const totalEst = totals.netTotal;

    const inquiryRecord = {
      id: `RFQ-CART-${Date.now().toString().slice(-6)}`,
      isMultiItem: true,
      itemsCount: cartItems.length,
      totalUnits: cartItems.reduce((acc, item) => acc + (item.qty || 1), 0),
      cartProducts: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        qty: item.qty || 1,
        unitPrice: item.price,
        isNegotiable: Boolean(item.isNegotiable),
        expectedPrice: item.expectedPrice || null,
        brand: item.brand,
        image: item.image
      })),
      productName: `Bulk Institutional Request (${cartItems.length} Products)`,
      productSku: `MULTI-${cartItems.length}-ITEMS`,
      productCategory: 'multi-procurement',
      productBrand: 'Multi-OEM Assortment',
      productImage: cartItems[0]?.image || '/logo.png',
      unitPrice: totalEst,
      totalAmount: totalEst,
      catalogMrpTotal: totals.originalSubtotal,
      specialDiscountAmount: totals.totalDiscount,
      appliedOffer: activeOffer ? {
        id: activeOffer.id,
        title: activeOffer.title,
        type: activeOffer.type,
        value: activeOffer.value,
        perkText: activeOffer.perkText
      } : null,
      gstRate: '12%',
      gstAmount: Math.round(totalEst * 0.12),
      grandTotal: Math.round(totalEst * 1.12),
      customerName: displayName || 'NA',
      customerPhone: `${currentCountryCode} ${cleanPhone}`,
      customerEmail: cleanEmail,
      district: selectedDistrict,
      status: 'Pending RFQ (Multi-Item)',
      statusNote: `Quotation for ${cartItems.length} equipment items registered with target price preferences for ${selectedDistrict}.`,
      deliveryEstimate: `24-48 Hours Express Dispatch from ${selectedDistrict} Regional Depot`,
      createdAt: new Date().toISOString()
    };

    try {
      saveUserInquiry(inquiryRecord);

      // Save to centralized leads for District Employee & Admin
      recordCustomerLead({
        ...inquiryRecord,
        customerName: displayName || prof.fullName || 'NA',
        hospitalName: prof.hospitalName || 'NA',
        customerPhone: `${currentCountryCode} ${cleanPhone}`,
        customerEmail: cleanEmail,
        district: selectedDistrict,
        productName: `Bulk Request (${cartItems.length} Products)`,
        productSku: `MULTI-${cartItems.length}-ITEMS`,
        qty: cartItems.reduce((acc, item) => acc + (item.qty || 1), 0),
        unitPrice: totalEst,
        grandTotal: Math.round(totalEst * 1.12),
        isMultiItem: true,
        cartProducts: cartItems
      });

      // Clear cart on successful quotation submission
      clearCart();
    } catch (err) {
      console.error('Error submitting multi-item quote', err);
    } finally {
      setIsSubmitting(false);
      setQuoteStep('success');
      setRedirectCountdown(5);
    }
  };

  const handleQuickQuoteClick = () => {
    const unpricedInCart = cartItems.find(
      i => i.isNegotiable && (!i.expectedPrice || parseFloat(String(i.expectedPrice).replace(/[^0-9.]/g, '')) <= 0)
    );
    if (unpricedInCart) {
      setCartError(`"${unpricedInCart.name}" is a price-negotiable item. Please enter your Target Price before proceeding.`);
      return;
    }
    setCartError('');

    const prof = getUserProfile();
    const loggedIn = isCustomerLoggedIn();

    if (loggedIn && prof && (prof.phone || prof.email)) {
      submitDirectlyForLoggedInUser();
      return;
    }

    setQuoteStep('contact_form');
  };

  // Step 1 -> Step 2: Validate Contact Info & Generate OTP
  const handleProceedToOtp = (e) => {
    e.preventDefault();
        const unpricedInCart = cartItems.find(i => i.isNegotiable && (!i.expectedPrice || parseFloat(String(i.expectedPrice).replace(/[^0-9.]/g, '')) <= 0));
    if (unpricedInCart) {
      setFormError(`"${unpricedInCart.name}" is a price-negotiable item. Please enter your Target / Expected Unit Price (₹) before proceeding.`);
      return;
    }
    const cleanDigits = phone.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 7) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!email || !email.includes('@')) {
      setFormError('Please enter a valid official email address.');
      return;
    }
    if (!district) {
      setFormError('Please select your delivery district.');
      return;
    }

    setFormError('');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setEnteredOtp('');
    setOtpError('');
    setQuoteStep('otp');
  };

  // Step 2 -> Step 3: Verify OTP & Submit Multi-Item Quotation
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      setOtpError('Please enter the 6-digit verification code.');
      return;
    }
    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setOtpError('Invalid OTP code. Please enter the code sent to your email.');
      return;
    }

    setIsSubmitting(true);
    setOtpError('');

    const totals = calculateCartTotals();
    const totalEst = totals.netTotal;

    const inquiryRecord = {
      id: `RFQ-CART-${Date.now().toString().slice(-6)}`,
      isMultiItem: true,
      itemsCount: cartItems.length,
      totalUnits: cartItems.reduce((acc, item) => acc + (item.qty || 1), 0),
      cartProducts: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        qty: item.qty || 1,
        unitPrice: item.price,
        isNegotiable: Boolean(item.isNegotiable),
        expectedPrice: item.expectedPrice || null,
        brand: item.brand,
        image: item.image
      })),
      productName: `Bulk Institutional Request (${cartItems.length} Products)`,
      productSku: `MULTI-${cartItems.length}-ITEMS`,
      productCategory: 'multi-procurement',
      productBrand: 'Multi-OEM Assortment',
      productImage: cartItems[0]?.image || '/logo.png',
      unitPrice: totalEst,
      totalAmount: totalEst,
      catalogMrpTotal: totals.originalSubtotal,
      specialDiscountAmount: totals.totalDiscount,
      appliedOffer: activeOffer ? {
        id: activeOffer.id,
        title: activeOffer.title,
        type: activeOffer.type,
        value: activeOffer.value,
        perkText: activeOffer.perkText
      } : null,
      gstRate: '12%',
      gstAmount: Math.round(totalEst * 0.12),
      grandTotal: Math.round(totalEst * 1.12),
      customerName: customerName || 'NA',
      customerPhone: `${countryCode} ${phone.trim()}`,
      customerEmail: email.trim(),
      district: district.trim(),
      status: 'Pending RFQ (Multi-Item)',
      statusNote: `Quotation for ${cartItems.length} equipment items registered with target price preferences for ${district}.`,
      deliveryEstimate: `24-48 Hours Express Dispatch from ${district} Regional Depot`,
      createdAt: new Date().toISOString()
    };

    try {
      saveUserInquiry(inquiryRecord);

      // Update user profile
      const prof = getUserProfile() || {};
      saveUserProfile({
        ...prof,
        fullName: customerName || prof.fullName || 'NA',
        phone: phone.trim(),
        countryCode: countryCode,
        email: email.trim(),
        district: district.trim()
      });

      // Save to centralized leads for District Employee & Admin
      recordCustomerLead({
        ...inquiryRecord,
        customerName: customerName || prof.fullName || 'NA',
        hospitalName: prof.hospitalName || 'NA',
        customerPhone: `${countryCode} ${phone.trim()}`,
        customerEmail: email.trim(),
        district: district.trim(),
        productName: `Bulk Request (${cartItems.length} Products)`,
        productSku: `MULTI-${cartItems.length}-ITEMS`,
        qty: cartItems.reduce((acc, item) => acc + (item.qty || 1), 0),
        unitPrice: totalEst,
        grandTotal: Math.round(totalEst * 1.12),
        isMultiItem: true,
        cartProducts: cartItems
      });

      // Clear cart on successful quotation submission
      clearCart();
    } catch (err) {
      console.error('Error submitting multi-item quote', err);
    } finally {
      setIsSubmitting(false);
      setQuoteStep('success');
      setCustomerLoggedIn(true);
      const prof = typeof window !== 'undefined' ? getUserProfile() : null;
      const isComplete = Boolean(
        prof && (
          prof.isProfileComplete ||
          (prof.hospitalName && prof.hospitalName.trim() && prof.hospitalName.trim().toUpperCase() !== 'NA')
        )
      );
      if (!isComplete) {
        setRedirectCountdown(5);
      }
    }
  };

  if (!isOpen) return null;

  const totalQuantity = cartItems.reduce((acc, item) => acc + (item.qty || 1), 0);
  const cartTotals = calculateCartTotals();

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-xl sm:max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cart Drawer Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
              <ShoppingCart size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Equipment Quotation Cart</span>
                {cartItems.length > 0 && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                    {cartItems.length} items &bull; {totalQuantity} units
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                Hospital Procurement &bull; Depot Delivery to {activeDistrict}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            title="Close Cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body Based on Step */}
        {quoteStep === 'success' ? (
          /* Success Screen */
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                  Quotation Confirmed &bull; Verified via Email OTP
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Multi-Product RFQ Dispatched!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Your official quotation draft and technical datasheets have been transmitted for all selected medical devices to <strong className="text-slate-900">{email}</strong>.
                </p>
              </div>

              {/* RFQ Token Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>RFQ Reference Token:</span>
                  <span className="font-mono text-slate-900 font-bold bg-white px-2.5 py-1 rounded border border-slate-200">
                    {quoteToken}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>Regional Delivery Depot:</span>
                  <span className="font-bold text-brand-700">{district} Hub</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>Contact Number:</span>
                  <span className="font-mono text-slate-900">{countryCode} {phone}</span>
                </div>
              </div>

              {/* Profile Completion Alert - ONLY show if hospital details are incomplete */}
              {(() => {
                const prof = typeof window !== 'undefined' ? getUserProfile() : null;
                const isComplete = Boolean(
                  prof && (
                    prof.isProfileComplete ||
                    (prof.hospitalName && prof.hospitalName.trim() && prof.hospitalName.trim().toUpperCase() !== 'NA')
                  )
                );

                if (isComplete) return null;

                return (
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                      <span className="flex items-center gap-1.5">
                        <Building2 size={15} className="text-amber-700" />
                        <span>Complete Hospital &amp; Billing Profile</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950 font-mono text-[11px] font-extrabold flex items-center gap-1">
                        <Clock size={11} />
                        <span>Auto-redirect in {redirectCountdown}s</span>
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Add your hospital name, department, designation, and GST details so the official institutional proforma invoice is ready.
                    </p>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        router.push('/profile');
                      }}
                      className="w-full mt-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Go to Profile Now</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                );
              })()}
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
              >
                Close Cart
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/profile');
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>View My Inquiries</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        ) : quoteStep === 'contact_form' ? (
          /* Step: Contact Info (Mobile, Email, District) */
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <button
                  onClick={() => setQuoteStep('cart')}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 mb-2 inline-flex items-center gap-1 cursor-pointer"
                >
                  &larr; Back to Cart Items
                </button>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Get Quotation Quickly
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Enter your mobile number and official email. We will verify your email with a 6-digit OTP code to submit your multi-item RFQ.
                </p>
              </div>

              <form onSubmit={handleProceedToOtp} className="space-y-3.5">
                {/* Full Name / Hospital (Optional on cart, prompted in profile) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name / Hospital Procurement (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Dr. Sharma / Apex Hospital"
                    className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 text-sm font-semibold rounded-xl border border-slate-300 focus:border-red-500 focus:bg-white outline-none transition"
                  />
                </div>

                {/* Mobile Number (Mandatory) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
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
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/[^\d\s-]/g, ''));
                        if (formError) setFormError('');
                      }}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full pl-3 pr-3.5 py-2.5 bg-slate-50 text-slate-900 text-sm font-semibold border border-l-0 border-slate-300 focus:border-red-500 focus:bg-white outline-none transition"
                    />
                  </div>
                </div>

                {/* Email Address (Mandatory) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Email Address <span className="text-red-600 font-bold">*</span>
                  </label>
                  <div className="relative flex items-center shadow-2xs rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-red-500/20">
                    <div className="pl-3 text-slate-400 bg-slate-50 py-2.5 border-y border-l border-slate-300">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (formError) setFormError('');
                      }}
                      placeholder="e.g. hospital@domain.com or doctor@gmail.com"
                      className="w-full pl-2.5 pr-3.5 py-2.5 bg-slate-50 text-slate-900 text-sm font-semibold border border-l-0 border-slate-300 focus:border-red-500 focus:bg-white outline-none transition"
                    />
                  </div>
                </div>

                {/* Delivery District (Mandatory) */}
                <div>
                  <DistrictSelector
                    value={district}
                    onChange={setDistrict}
                    required={true}
                    label="Delivery District & Regional Depot"
                  />
                </div>

                {/* Error */}
                {formError && (
                  <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{formError}</span>
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <KeyRound size={17} />
                  <span>Send OTP to Email &amp; Verify</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>
        ) : quoteStep === 'otp' ? (
          /* Step: OTP Verification for Cart */
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div>
                <button
                  onClick={() => setQuoteStep('contact_form')}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 mb-2 inline-flex items-center gap-1 cursor-pointer"
                >
                  &larr; Edit Mobile / Email
                </button>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold mb-2">
                  <KeyRound size={13} className="text-emerald-600" />
                  <span>Security Verification</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Enter 6-Digit Email OTP
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  We have dispatched a verification code to <strong className="text-slate-900">{email}</strong> to authenticate this quotation.
                </p>
              </div>

              {/* Dev Mock Banner */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-blue-600 shrink-0" />
                  <span>
                    Test Code: <strong className="font-mono text-sm tracking-widest text-blue-700 font-bold">{generatedOtp}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEnteredOtp(generatedOtp)}
                  className="text-[10px] bg-blue-600 text-white font-bold px-2.5 py-1 rounded-lg hover:bg-blue-700 transition cursor-pointer shrink-0"
                >
                  Auto-Fill
                </button>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Enter Verification Code <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={enteredOtp}
                    onChange={(e) => {
                      setEnteredOtp(e.target.value.replace(/\D/g, ''));
                      if (otpError) setOtpError('');
                    }}
                    placeholder="Enter 6-digit OTP"
                    className="w-full text-center tracking-[0.4em] font-mono text-xl sm:text-2xl font-black py-3 px-4 bg-slate-50 text-slate-900 border border-slate-300 rounded-xl focus:border-red-500 focus:bg-white outline-none transition"
                  />
                </div>

                {otpError && (
                  <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{otpError}</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || enteredOtp.length !== 6}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <CheckCircle2 size={18} />
                  <span>{isSubmitting ? 'Verifying...' : 'Verify OTP & Submit Quotation'}</span>
                  <ArrowRight size={17} />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Step: Cart Items View */
          <>
            {cartItems.length > 0 ? (
              <>
                {/* Items Scrollable List */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {/* Active Special Offer Banner if applied */}
                  {activeOffer && (
                    <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 rounded-2xl shadow-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                            <Sparkles size={16} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                                {activeOffer.title || 'Special Management Concession'}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-emerald-600 text-white shadow-2xs">
                                {activeOffer.type === 'percentage'
                                  ? `${activeOffer.value}% OFF`
                                  : activeOffer.type === 'flat'
                                  ? `₹${Number(activeOffer.value).toLocaleString('en-IN')} OFF`
                                  : 'COMPLIMENTARY PERK'}
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                              {activeOffer.productScope === 'all_catalog'
                                ? 'Applied storewide across all catalog equipment!'
                                : 'Applied to eligible items in your procurement cart!'}
                              {activeOffer.perkText && (
                                <span className="block font-bold text-emerald-900 mt-0.5">
                                  🎁 Privilege Perk: {activeOffer.perkText}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      {activeOffer.validTill && (
                        <div className="mt-2 pt-1.5 border-t border-emerald-200/60 flex items-center justify-between text-[10px] text-emerald-700 font-mono">
                          <span>Validity: Till {new Date(activeOffer.validTill).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span className="font-bold text-emerald-900">Official Executive Rate</span>
                        </div>
                      )}
                    </div>
                  )}
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 sm:p-4 bg-slate-50/80 hover:bg-white border border-slate-200 rounded-2xl transition space-y-3 shadow-2xs"
                    >
                      {/* Top Row: Thumbnail & Basic Info */}
                      <div className="flex items-start gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl bg-white border border-slate-200 p-1 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                              {item.brand || 'OEM Certified'}
                            </span>
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition cursor-pointer"
                              title="Remove Equipment"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                            {item.name}
                          </h4>

                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                            <span>SKU: {item.sku}</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle Row: Quantity Controls & Price */}
                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-3">
                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                          <button
                            onClick={() => handleQtyChange(item.id, (item.qty || 1) - 1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
                            title="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-xs text-slate-900">
                            {item.qty || 1}
                          </span>
                          <button
                            onClick={() => handleQtyChange(item.id, (item.qty || 1) + 1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
                            title="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Unit & Subtotal Estimate with Live Offer */}
                        <div className="text-right">
                          {isItemEligibleForOffer(item, activeOffer) && activeOffer.type === 'percentage' && activeOffer.value > 0 ? (
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold line-through font-mono">
                                MRP: {formatINR(item.price)}
                              </span>
                              <span className="text-xs font-black text-emerald-700 font-mono flex items-center justify-end gap-1">
                                <span>{formatINR(getItemDiscountedPrice(item, activeOffer))}</span>
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">
                                  -{activeOffer.value}%
                                </span>
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">Standard Unit Price</span>
                              <span className="text-xs font-bold text-slate-800">
                                {formatINR(item.price)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Negotiable Price Section (Admin Tagged or Flagged Products) */}
                      {item.isNegotiable && (
                        <div className="mt-2.5 p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-extrabold text-amber-900 flex items-center gap-1">
                              <Tag size={12} className="text-amber-600" />
                              <span>Price Negotiable Product</span>
                            </span>
                            <span className="text-[10px] font-bold bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-full font-mono">
                              B2B Target Bid
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-amber-900 shrink-0">
                              Your Expected Price: ₹
                            </span>
                            <input
                              type="number"
                              value={item.expectedPrice || ''}
                              onChange={(e) => handleExpectedPriceChange(item.id, e.target.value)}
                              placeholder="Enter expected target price (₹/unit)"
                              className="flex-1 px-3 py-1.5 bg-white text-slate-900 text-xs font-bold rounded-lg border border-amber-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                            />
                          </div>
                          <span className="text-[10px] text-amber-800 block">
                            Our biomedical desk will review your target bid for hospital procurement approval.
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Delivery Hub Badge */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="text-brand-600 shrink-0" />
                      <span>
                        Delivering to Regional Depot: <strong className="text-slate-900">{activeDistrict}</strong>
                      </span>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="text-brand-600 font-bold hover:underline"
                    >
                      Change Hub
                    </Link>
                  </div>
                </div>

                {/* Footer Actions with Live Financial Breakdown */}
                <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50/90 space-y-3 shrink-0">
                      {/* Financial Summary Card */}
                      <div className="bg-white rounded-xl p-3 border border-slate-200/80 space-y-1.5 text-xs shadow-2xs">
                        <div className="flex items-center justify-between text-slate-500 font-medium">
                          <span>Catalog MRP Subtotal:</span>
                          <span className="font-mono font-bold text-slate-800">{formatINR(cartTotals.originalSubtotal)}</span>
                        </div>
                        {cartTotals.totalDiscount > 0 && (
                          <div className="flex items-center justify-between text-emerald-700 font-bold">
                            <span className="flex items-center gap-1">
                              <Sparkles size={12} className="text-emerald-600" />
                              <span>Special Offer Concession:</span>
                            </span>
                            <span className="font-mono text-emerald-800">- {formatINR(cartTotals.totalDiscount)}</span>
                          </div>
                        )}
                        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-slate-900 font-extrabold text-sm">
                          <span>Estimated Net Total:</span>
                          <span className="font-mono text-emerald-900 text-base font-black">{formatINR(cartTotals.netTotal)}</span>
                        </div>
                      </div>

                  {/* Cart Error Notice */}
                  {cartError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{cartError}</span>
                    </div>
                  )}

                  {/* Get Quotation Quickly Button */}
                  <button
                    onClick={handleQuickQuoteClick}
                    className="w-full py-3.5 sm:py-4 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText size={18} />
                    <span>Get Quotation Quickly</span>
                    <ArrowRight size={17} />
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      onClick={handleClear}
                      className="text-slate-400 hover:text-red-600 font-semibold transition cursor-pointer text-[11px]"
                    >
                      Clear Entire Cart
                    </button>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <ShieldCheck size={13} className="text-emerald-600" />
                      <span>Authentic OEM Quotation Guarantee</span>
                    </span>
                  </div>
                </div>
              </>
            ) : (
              /* Empty Cart State */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center">
                  <ShoppingCart size={32} />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900">
                    Your Equipment Cart is Empty
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xs mt-1">
                    Select equipment from our catalogue to compare specifications, set expected target prices, and request a multi-product quotation.
                  </p>
                </div>
                <Link
                  href="/products"
                  onClick={() => setIsOpen(false)}
                  className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <span>Explore Medical Catalogue</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
