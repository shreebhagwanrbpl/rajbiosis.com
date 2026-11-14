'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  FileText,
  CheckCircle2,
  Check,
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
  Building2,
  PhoneCall,
  Tag
} from 'lucide-react';
import CountryCodeSelector from './CountryCodeSelector';
import DistrictSelector from './DistrictSelector';
import { DEFAULT_COUNTRY_CODE } from '../data/internationalCodes';
import { getUserProfile, saveUserProfile, getActiveDistrict, getUserInquiries, saveUserInquiry, isCustomerLoggedIn, setCustomerLoggedIn } from '../utils/userProfile';
import { recordCustomerLead } from '../utils/leads';
import { addToWishlist, WISHLIST_UPDATED_EVENT } from '../utils/wishlist';
import { addToCart, openCartDrawer } from '../utils/cart';
import { BRAND_LOGOS } from '../data/brands';

const brandCol1 = [BRAND_LOGOS[0], BRAND_LOGOS[3], BRAND_LOGOS[6], BRAND_LOGOS[9], BRAND_LOGOS[12]];
const brandCol2 = [BRAND_LOGOS[1], BRAND_LOGOS[4], BRAND_LOGOS[7], BRAND_LOGOS[10], BRAND_LOGOS[13]];
const brandCol3 = [BRAND_LOGOS[2], BRAND_LOGOS[5], BRAND_LOGOS[8], BRAND_LOGOS[11], BRAND_LOGOS[14]];

export default function ProductEnquiryModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState(null);

  // Modal Flow Step: 'form' | 'otp' | 'success'
  const [step, setStep] = useState('form');

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('Jaipur');
  const [address, setAddress] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');

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

        // If returning from profile completion, only display success dialog without generating duplicate lead!
        if (prod.initialStep === 'success' || prod.suppressLeadSync) {
          setStep('success');
          setIsOpen(true);
          return;
        }

        const isNeg = Boolean(prod.isNegotiable === true || prod.isNegotiable === 'true' || prod.isNegotiable === 1 || prod.negotiable === true);
        const isPriceNegotiated = Boolean(isNeg && prod.expectedPrice && Number(prod.expectedPrice) > 0);

        // Pre-fill from existing user profile if available
        const profile = getUserProfile();
        const isLoggedIn = isCustomerLoggedIn();

        if (profile) {
          if (profile.fullName) setCustomerName(profile.fullName);
          if (profile.hospitalName) setHospitalName(profile.hospitalName);
          if (profile.phone) setPhone(profile.phone);
          if (profile.countryCode) setCountryCode(profile.countryCode);
          if (profile.email) setEmail(profile.email);
          if (profile.district) setDistrict(profile.district);
          if (profile.address) setAddress(profile.address);
        } else {
          const act = getActiveDistrict();
          setDistrict(act || 'Jaipur');
        }

        if (prod.expectedPrice) {
          setExpectedPrice(String(prod.expectedPrice));
        } else {
          setExpectedPrice('');
        }

        setError('');
        setOtpError('');
        setEnteredOtp('');

        // CRITICAL REQUIREMENT: If the product is price-negotiable, it CANNOT be submitted without entering price!
        // We MUST NOT bypass to success, even if user is logged in. User must see the form to enter their price.
        if (isNeg) {
          setStep('form');
          setIsOpen(true);
          return;
        }

        // NON-NEGOTIABLE PRODUCT: If customer is already verified / logged in, generate official quotation directly
        if (isLoggedIn && profile && (profile.phone || profile.email)) {
          if (prod.intentAction === 'wishlist') {
            addToWishlist(prod);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent(WISHLIST_UPDATED_EVENT));
            }
            return;
          }
          if (prod.intentAction === 'cart') {
            addToCart(prod, prod.intentQty || 1);
            openCartDrawer();
            return;
          }

          const cleanPhone = (profile.phone || '').trim();
          const cleanEmail = (profile.email || '').trim();
          const displayName = (profile.fullName || '').trim() || 'NA';
          const cleanHospital = (profile.hospitalName || '').trim();
          const selectedDistrict = (profile.district || getActiveDistrict() || 'Jaipur').trim();
          const cleanCountryCode = profile.countryCode || DEFAULT_COUNTRY_CODE;

          setCustomerName(displayName);
          setHospitalName(cleanHospital);
          setPhone(cleanPhone);
          setCountryCode(cleanCountryCode);
          setEmail(cleanEmail);
          setDistrict(selectedDistrict);
          if (profile.address) setAddress(profile.address);

          // Pricing & GST Calculation
          const gstRate = prod.category === 'radiology-imaging' ? '18%' : '12%';
          const unitPrice = prod.approvedPrice || prod.price || 100000;
          const gstAmount = Math.round(unitPrice * (gstRate === '18%' ? 0.18 : 0.12));
          const grandTotal = unitPrice + gstAmount;

          // Check if customer ALREADY has an inquiry for this product to prevent duplicate quotations
          const existingInquiries = getUserInquiries();
          const existing = (existingInquiries || []).find(
            inq => (inq.productId && inq.productId === prod.id) ||
              (inq.productSku && inq.productSku === prod.sku) ||
              (inq.productName && inq.productName === prod.name)
          );

          if (existing) {
            // REUSE EXISTING INQUIRY: UPDATE RFQ AND DISPATCH LEAD
            const freshLeadId = `RFQ-${Date.now().toString().slice(-6)}`;

            const updatedEnquiry = {
              ...existing,
              id: freshLeadId,
              customerName: displayName,
              hospitalName: cleanHospital || existing.hospitalName,
              customerPhone: `${cleanCountryCode} ${cleanPhone}`,
              customerEmail: cleanEmail,
              district: selectedDistrict,
              address: (profile.address || existing.address || '').trim(),
              status: isPriceNegotiated ? 'Pending Price Approval' : 'Pending RFQ',
              statusNote: isPriceNegotiated
                ? `Customer target offer submitted. Awaiting Admin authorization.`
                : `Official quotation request submitted for ${prod.name} and synced to Admin quotation queue.`,
              updatedAt: new Date().toISOString()
            };

            saveUserInquiry(updatedEnquiry);

            recordCustomerLead({
              ...updatedEnquiry,
              id: freshLeadId,
              customerName: displayName,
              hospitalName: cleanHospital || 'NA',
              customerPhone: updatedEnquiry.customerPhone,
              customerEmail: cleanEmail,
              district: selectedDistrict,
              productName: prod.name,
              productSku: prod.sku,
              qty: updatedEnquiry.quantity || 1,
              unitPrice: unitPrice,
              actualPrice: prod.price || unitPrice,
              expectedPrice: isPriceNegotiated ? prod.expectedPrice : null,
              approvedPrice: prod.approvedPrice || existing.approvedPrice || null,
              negotiationStatus: prod.negotiationStatus || existing.negotiationStatus || (isPriceNegotiated ? 'pending_approval' : 'none'),
              gstRate: gstRate,
              gstAmount: gstAmount,
              isNegotiable: Boolean(prod.isNegotiable),
              status: isPriceNegotiated ? 'Pending Price Approval' : 'Pending RFQ'
            });

            setStep('success');
            setIsProfileIncomplete(!cleanHospital || !profile.address);
            setIsOpen(true);
            return;
          }

          // Create inquiry record
          const enquiryData = {
            id: `RFQ-${Date.now().toString().slice(-6)}`,
            productId: prod.id,
            productName: prod.name,
            productSku: prod.sku,
            productCategory: prod.category,
            productBrand: prod.brand || 'Raj Biosis OEM',
            productImage: prod.image,
            quantity: 1,
            unitPrice: unitPrice,
            actualPrice: prod.price || unitPrice,
            expectedPrice: null,
            totalAmount: unitPrice,
            gstRate: gstRate,
            gstAmount: gstAmount,
            grandTotal: grandTotal,
            warranty: prod.warranty || '2 Years Comprehensive Warranty',
            customerName: displayName,
            countryCode: cleanCountryCode,
            customerPhone: `${cleanCountryCode} ${cleanPhone}`,
            customerEmail: cleanEmail,
            district: selectedDistrict,
            address: (profile.address || '').trim(),
            status: isPriceNegotiated ? 'Pending Price Approval' : 'Pending RFQ',
            statusNote: isPriceNegotiated
              ? `Customer target offer submitted for ${prod.name}. Awaiting Admin authorization.`
              : `Official quotation request submitted for ${prod.name} and synced to Admin quotation queue.`,
            deliveryEstimate: `24-48 Hours Express Dispatch to ${selectedDistrict}`,
            validTill: '30 Days from issue',
            createdAt: new Date().toISOString(),
            date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
            dateTime: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
          };

          saveUserInquiry(enquiryData);

          recordCustomerLead({
            ...enquiryData,
            customerName: displayName,
            hospitalName: cleanHospital || 'NA',
            customerPhone: enquiryData.customerPhone,
            customerEmail: cleanEmail,
            district: selectedDistrict,
            productName: prod.name,
            productSku: prod.sku,
            qty: 1,
            unitPrice: unitPrice,
            actualPrice: prod.price || unitPrice,
            expectedPrice: null,
            gstRate: gstRate,
            gstAmount: gstAmount,
            isNegotiable: Boolean(prod.isNegotiable),
            status: isPriceNegotiated ? 'Pending Price Approval' : 'Pending RFQ'
          });

          setStep('success');
          setIsProfileIncomplete(!cleanHospital || !profile.address);
          setIsOpen(true);
          return;
        }

        // FIRST TIME VISITOR: Show form
        setStep('form');
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

  // Ensure timer cleanup if any
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const handleClose = () => {
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    setIsOpen(false);
    setStep('form');
    setError('');
    setOtpError('');
  };

  const handleManualRedirect = () => {
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    handleClose();
    const returnUrl = product?.id
      ? `/product/${product.id}`
      : (typeof window !== 'undefined' ? window.location.pathname : '/products');
    const cleanCustomerName = customerName ? customerName.trim() : '';
    const cleanHospital = hospitalName ? hospitalName.trim() : '';
    const cleanPhone = phone ? phone.trim() : '';
    const cleanEmail = email ? email.trim() : '';
    const cleanDistrict = district ? district.trim() : 'Jaipur';

    if (cleanCustomerName || cleanPhone || cleanHospital || cleanEmail) {
      router.push(
        `/profile?from=quote&quote=pending_profile&name=${encodeURIComponent(cleanCustomerName)}&hospital=${encodeURIComponent(cleanHospital)}&phone=${encodeURIComponent(cleanPhone)}&email=${encodeURIComponent(cleanEmail)}&district=${encodeURIComponent(cleanDistrict)}&product=${encodeURIComponent(product?.name || '')}&productId=${encodeURIComponent(product?.id || '')}&returnUrl=${encodeURIComponent(returnUrl)}`
      );
    } else {
      router.push('/profile');
    }
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

  // Validate mandatory fields
  const validateForm = () => {
    const isWishlistOrCart = product?.intentAction === 'wishlist' || product?.intentAction === 'cart';
    const isNeg = Boolean(!isWishlistOrCart && (product?.isNegotiable === true || product?.isNegotiable === 'true' || product?.isNegotiable === 1 || product?.negotiable === true));
    if (isNeg) {
      const numExpected = parseFloat(String(expectedPrice || '').replace(/[^0-9.]/g, ''));
      if (!numExpected || numExpected <= 0 || isNaN(numExpected)) {
        return 'Please enter your Target / Expected Unit Price (₹) before submitting.';
      }
    }

    // If customer is already logged in, their profile credentials (mobile, email, district) are verified
    if (isCustomerLoggedIn()) {
      return '';
    }

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

  // Direct quote & negotiable offer submission for already logged in / verified customers
  const submitDirectlyForLoggedInUser = (parsedOffer) => {
    if (product?.intentAction === 'wishlist') {
      addToWishlist(product);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(WISHLIST_UPDATED_EVENT));
      }
      handleClose();
      return;
    }
    if (product?.intentAction === 'cart') {
      addToCart(product, product?.intentQty || 1);
      openCartDrawer();
      handleClose();
      return;
    }

    setIsSubmitting(true);
    setError('');

    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();
    const displayName = customerName.trim() || 'NA';
    const cleanHospital = hospitalName.trim();
    const selectedDistrict = district.trim() || 'Jaipur';
    const cleanCountryCode = countryCode || DEFAULT_COUNTRY_CODE;

    const isNeg = Boolean(product?.isNegotiable === true || product?.isNegotiable === 'true' || product?.isNegotiable === 1 || product?.negotiable === true);
    const isPriceNegotiated = Boolean(isNeg && parsedOffer && parsedOffer > 0);
    const catalogPrice = product?.price || 100000;
    const effectiveUnitPrice = isPriceNegotiated ? parsedOffer : (product?.approvedPrice || catalogPrice);
    const gstRate = product?.category === 'radiology-imaging' ? '18%' : '12%';
    const gstAmount = Math.round(effectiveUnitPrice * (gstRate === '18%' ? 0.18 : 0.12));
    const grandTotal = effectiveUnitPrice + gstAmount;

    // Check if customer ALREADY has an inquiry for this product to prevent duplicate quotations
    const existingInquiries = getUserInquiries();
    const existingEnq = (existingInquiries || []).find(
      inq => (inq.productId && inq.productId === product?.id) ||
        (inq.productSku && inq.productSku === product?.sku) ||
        (inq.productName && inq.productName === product?.name)
    );

    const activeId = `RFQ-${Date.now().toString().slice(-6)}`;

    const enquiryData = {
      ...(existingEnq || {}),
      id: activeId,
      productId: product?.id,
      productName: product?.name,
      productSku: product?.sku,
      productCategory: product?.category,
      productBrand: product?.brand || 'Raj Biosis OEM',
      productImage: product?.image,
      quantity: 1,
      unitPrice: effectiveUnitPrice,
      actualPrice: catalogPrice,
      expectedPrice: isPriceNegotiated ? parsedOffer : (existingEnq?.expectedPrice || null),
      isNegotiable: isNeg,
      isPriceNegotiated: isPriceNegotiated,
      negotiationStatus: isPriceNegotiated ? 'pending_approval' : (product?.negotiationStatus || existingEnq?.negotiationStatus || 'none'),
      approvedPrice: product?.approvedPrice || existingEnq?.approvedPrice || (isPriceNegotiated ? null : catalogPrice),
      totalAmount: effectiveUnitPrice,
      gstRate: gstRate,
      gstAmount: gstAmount,
      grandTotal: grandTotal,
      warranty: product?.warranty || '2 Years Comprehensive Warranty',
      customerName: displayName,
      countryCode: cleanCountryCode,
      customerPhone: `${cleanCountryCode} ${cleanPhone}`,
      customerEmail: cleanEmail,
      district: selectedDistrict,
      address: address.trim(),
      status: isPriceNegotiated ? 'Pending Price Approval' : 'Pending RFQ',
      statusNote: isPriceNegotiated
        ? `Customer target offer of ₹${parsedOffer.toLocaleString('en-IN')} submitted for ${product.name}. Awaiting Admin authorization.`
        : `Official quotation request submitted for ${product.name}. Awaiting proforma invoice generation.`,
      deliveryEstimate: `24-48 Hours Express Dispatch to ${selectedDistrict}`,
      validTill: '30 Days from issue',
      createdAt: existingEnq?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      dateTime: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
    };

    try {
      saveUserInquiry(enquiryData);

      recordCustomerLead({
        ...enquiryData,
        id: activeId,
        customerName: displayName,
        hospitalName: cleanHospital || 'NA',
        customerPhone: enquiryData.customerPhone,
        customerEmail: cleanEmail,
        district: selectedDistrict,
        productName: product.name,
        productSku: product.sku,
        qty: 1,
        unitPrice: effectiveUnitPrice,
        actualPrice: catalogPrice,
        expectedPrice: isPriceNegotiated ? parsedOffer : null,
        isNegotiable: isNeg,
        isPriceNegotiated: isPriceNegotiated,
        negotiationStatus: enquiryData.negotiationStatus,
        gstRate: gstRate,
        gstAmount: gstAmount,
        grandTotal: grandTotal,
        status: enquiryData.status,
        statusNote: enquiryData.statusNote
      });
    } catch (err) {
      console.error('Failed to submit direct inquiry', err);
    } finally {
      if (product?.intentAction === 'wishlist') {
        addToWishlist(product);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(WISHLIST_UPDATED_EVENT));
        }
      } else if (product?.intentAction === 'cart') {
        addToCart(product, product?.intentQty || 1);
        openCartDrawer();
      }
      setIsSubmitting(false);
      setStep('success');
      setIsProfileIncomplete(!cleanHospital || !address);
      setIsOpen(true);
    }
  };

  // Form submit handler: routes to direct submission if already logged in, else OTP flow
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const numExpected = parseFloat(String(expectedPrice || '').replace(/[^0-9.]/g, ''));
    const profile = getUserProfile();
    const isLoggedIn = isCustomerLoggedIn();

    if (isLoggedIn && profile && (profile.phone || profile.email)) {
      submitDirectlyForLoggedInUser(numExpected);
      return;
    }

    handleProceedToOtp(e);
  };

  // Step 1: User submits form -> Generate & send OTP
  const handleProceedToOtp = (e) => {
    if (e && e.preventDefault) e.preventDefault();
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
    const displayName = customerName.trim() || 'NA';

    // Check if inquiry already exists for this product to prevent duplicates
    const existingInquiries = getUserInquiries();
    const existingEnq = (existingInquiries || []).find(
      inq => (inq.productId && inq.productId === product?.id) ||
        (inq.productSku && inq.productSku === product?.sku) ||
        (inq.productName && inq.productName === product?.name)
    );

    const activeId = `RFQ-${Date.now().toString().slice(-6)}`;

    const isNeg = Boolean(product?.isNegotiable === true || product?.isNegotiable === 'true' || product?.isNegotiable === 1 || product?.negotiable === true);
    const parsedOffer = parseFloat(String(expectedPrice || '').replace(/[^0-9.]/g, ''));
    const isPriceNegotiated = Boolean(isNeg && parsedOffer && parsedOffer > 0);
    const catalogPrice = product?.price || 100000;
    const effectiveUnitPrice = isPriceNegotiated ? parsedOffer : catalogPrice;
    const gstRate = product?.category === 'radiology-imaging' ? '18%' : '12%';
    const gstAmount = Math.round(effectiveUnitPrice * (gstRate === '18%' ? 0.18 : 0.12));
    const grandTotal = effectiveUnitPrice + gstAmount;

    const enquiryData = {
      ...(existingEnq || {}),
      id: activeId,
      productId: product?.id,
      productName: product?.name,
      productSku: product?.sku,
      productCategory: product?.category,
      productBrand: product?.brand || 'Raj Biosis OEM',
      productImage: product?.image,
      quantity: 1,
      unitPrice: effectiveUnitPrice,
      actualPrice: catalogPrice,
      expectedPrice: isPriceNegotiated ? parsedOffer : null,
      isNegotiable: isNeg,
      isPriceNegotiated: isPriceNegotiated,
      negotiationStatus: isPriceNegotiated ? 'pending_approval' : 'none',
      approvedPrice: isPriceNegotiated ? null : catalogPrice,
      totalAmount: effectiveUnitPrice,
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
      status: isPriceNegotiated ? 'Pending Price Approval' : 'Pending RFQ',
      statusNote: isPriceNegotiated
        ? `Customer target offer of ₹${parsedOffer.toLocaleString('en-IN')} submitted. Pending Admin approval.`
        : `Official quotation request generated & verified via email OTP (${cleanEmail}) for ${district.trim()}.`,
      deliveryEstimate: `24-48 Hours Express Dispatch to ${district.trim()}`,
      validTill: '30 Days from issue',
      createdAt: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      dateTime: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
    };

    try {
      // Save enquiry to localStorage
      saveUserInquiry(enquiryData);

      // Check existing user profile
      const currentProfile = getUserProfile();
      const cleanCustomerName = customerName.trim();
      const cleanHospital = hospitalName.trim();

      // Mark customer as authenticated/logged in
      setCustomerLoggedIn(true);

      const updatedProfile = {
        fullName: cleanCustomerName || currentProfile?.fullName || displayName,
        hospitalName: cleanHospital || currentProfile?.hospitalName || '',
        countryCode: countryCode,
        phone: cleanPhone,
        email: cleanEmail,
        district: district.trim(),
        address: currentProfile?.address || address.trim(),
        isOtpVerified: true,
        isLoggedIn: true
      };

      saveUserProfile(updatedProfile);

      // CRITICAL: If initiated from Wishlist or Add to Cart, do NOT generate a quotation request or redirect to profile!
      // Simply save to customer Wishlist / Cart, sync to MongoDB customer_carts, and close modal cleanly.
      if (product?.intentAction === 'wishlist') {
        addToWishlist(product);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(WISHLIST_UPDATED_EVENT));
        }
        setIsSubmitting(false);
        handleClose();
        return;
      }

      if (product?.intentAction === 'cart') {
        addToCart(product, product?.intentQty || 1);
        openCartDrawer();
        setIsSubmitting(false);
        handleClose();
        return;
      }

      // Normal Get Quote Flow (Quotations & RFQ Lead Dispatch)
      recordCustomerLead({
        ...enquiryData,
        customerName: updatedProfile.fullName,
        hospitalName: updatedProfile.hospitalName || 'NA',
        customerPhone: enquiryData.customerPhone,
        customerEmail: enquiryData.customerEmail,
        district: district.trim(),
        productName: product.name,
        productSku: product.sku,
        qty: 1,
        unitPrice: effectiveUnitPrice,
        actualPrice: catalogPrice,
        expectedPrice: isPriceNegotiated ? parsedOffer : null,
        isNegotiable: isNeg,
        isPriceNegotiated: isPriceNegotiated,
        negotiationStatus: isPriceNegotiated ? 'pending_approval' : 'none',
        gstRate: gstRate,
        gstAmount: gstAmount,
        grandTotal: grandTotal,
        status: enquiryData.status,
        statusNote: enquiryData.statusNote
      });

      // Mark logged in and redirect immediately to /profile so user can fill remaining empty inputs
      setCustomerLoggedIn(true);
      setIsSubmitting(false);
      handleClose();
      router.push('/profile');
      return;
    } catch (err) {
      console.error('Failed to save enquiry', err);
    } finally {
      setIsSubmitting(false);
      setCustomerLoggedIn(true);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <>
      {/* Main Get Quote Modal */}
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
              <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {/* Left Side: Confirmation Message & Localized Details */}
                <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-5 bg-white">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold mb-3">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>{expectedPrice ? 'Target Price Offer Dispatched to Admin • Verified' : 'Mobile & Email Verified • Quotation Dispatched'}</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                      {expectedPrice ? 'Negotiable Price Quotation Generated!' : 'Official Quotation Generated!'}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                      Thank you. Your quotation request for <strong className="text-slate-900">{product.name}</strong> {expectedPrice ? <span>with target offer <strong className="text-amber-800">₹{Number(expectedPrice).toLocaleString('en-IN')}</strong></span> : ''} has been issued to mobile <strong className="text-slate-900">{countryCode} {phone}</strong> &amp; email <strong className="text-slate-900">{email}</strong> with regional dispatch mapped to <strong className="text-slate-900">{district} Hub</strong>.
                    </p>

                    {/* Clear Two-Way Differentiation: Client Recipient Details vs Company Office Details */}
                    <div className="mt-3.5 space-y-2.5">
                      {/* Box 0: Target Price Offer Confirmation (Synced to Admin) */}
                      {expectedPrice && (
                        <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-1 text-xs">
                          <div className="flex items-center justify-between border-b border-amber-200 pb-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                              <Tag size={13} className="text-amber-600" />
                              <span>Your Negotiated Target Offer (Synced to Admin)</span>
                            </span>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-950">
                              Pending Admin Review
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between pt-1">
                            <span className="text-slate-600 text-[11px] font-medium">Target Unit Price:</span>
                            <span className="font-mono text-amber-950 font-black text-sm">₹{Number(expectedPrice).toLocaleString('en-IN')}</span>
                          </div>
                          {product?.price && Number(product.price) > Number(expectedPrice) && (
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>Catalog MRP Reference:</span>
                              <span className="font-mono line-through">₹{Number(product.price).toLocaleString('en-IN')}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Box 1: Client / Institutional Recipient Details */}
                      <div className="p-3 bg-slate-50/90 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                            <User size={13} className="text-slate-600" />
                            <span>Quotation Issued To (Client)</span>
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Verified Client
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 pt-0.5">
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="text-[11px] font-medium">Client Mobile:</span>
                            <span className="font-mono text-slate-900 font-bold text-[11px]">{countryCode} {phone}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="text-[11px] font-medium">Client Email:</span>
                            <span className="font-mono text-slate-900 font-bold text-[11px] truncate max-w-[155px]" title={email}>{email}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600 sm:col-span-2 pt-0.5 border-t border-slate-100">
                            <span className="text-[11px] font-medium">Delivery Destination:</span>
                            <span className="text-slate-900 font-bold text-[11px]">{district}</span>
                          </div>
                        </div>
                      </div>

                      {/* Box 2: Raj Biosis Head Office & Official Contact Details */}
                      <div className="p-3 bg-red-50/40 border border-red-200/80 rounded-xl space-y-1.5 text-xs">
                        <div className="flex items-center justify-between border-b border-red-200/60 pb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-red-900 flex items-center gap-1.5">
                            <Building2 size={13} className="text-red-700" />
                            <span>Raj Biosis Pvt. Ltd. (Company Office)</span>
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                            Authorized OEM
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 pt-0.5">
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="text-[11px] font-medium flex items-center gap-1">
                              <PhoneCall size={11} className="text-red-600" />
                              <span>Company Helpline:</span>
                            </span>
                            <a href="tel:9983333469" className="font-mono text-red-700 font-black text-[11px] hover:underline">9983333469</a>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="text-[11px] font-medium flex items-center gap-1">
                              <Mail size={11} className="text-red-600" />
                              <span>Company Email:</span>
                            </span>
                            <a href="mailto:mail@rajbiosis.com" className="font-mono text-slate-900 font-bold text-[11px] hover:underline truncate max-w-[155px]">mail@rajbiosis.com</a>
                          </div>
                          <div className="flex items-start justify-between text-slate-600 sm:col-span-2 pt-0.5 border-t border-red-100/80">
                            <span className="text-[11px] font-medium shrink-0 mr-2 flex items-center gap-1">
                              <MapPin size={11} className="text-red-600" />
                              <span>Office Address:</span>
                            </span>
                            <span className="text-slate-800 font-medium text-[11px] text-right">
                              Raj Biosis Life Sciences Park, Phase II, Bengaluru - 560100
                            </span>
                          </div>
                        </div>
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

                    {/* 3-Track Auto-Scrolling Vertical Marquee (Up - Down - Up) - Large, Prominent Logos */}
                    <div className="relative overflow-hidden h-[330px] sm:h-[360px] rounded-2xl bg-slate-100/80 border border-slate-200/90 p-2.5 shadow-2xs">
                      {/* Top & Bottom gradient fades for infinite seamless transition */}
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-slate-100 via-slate-100/80 to-transparent z-10" />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-100 via-slate-100/80 to-transparent z-10" />

                      <div className="grid grid-cols-3 gap-2.5 h-full overflow-hidden">
                        {/* 1st Track: Scrolls UP */}
                        <div className="overflow-hidden">
                          <div className="flex flex-col gap-2.5 animate-vertical-up">
                            {[...brandCol1, ...brandCol1].map((brand, idx) => (
                              <div
                                key={`col1-${idx}`}
                                className="h-20 sm:h-22 bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 flex items-center justify-center shadow-xs hover:border-brand-500 hover:shadow-md transition-all shrink-0"
                                title={brand.name}
                              >
                                <img
                                  src={brand.src}
                                  alt={brand.name}
                                  className="h-10 sm:h-12 max-h-12 max-w-[120px] sm:max-w-[140px] w-auto object-contain"
                                  loading="lazy"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 2nd Track: Scrolls DOWN */}
                        <div className="overflow-hidden">
                          <div className="flex flex-col gap-2.5 animate-vertical-down">
                            {[...brandCol2, ...brandCol2].map((brand, idx) => (
                              <div
                                key={`col2-${idx}`}
                                className="h-20 sm:h-22 bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 flex items-center justify-center shadow-xs hover:border-brand-500 hover:shadow-md transition-all shrink-0"
                                title={brand.name}
                              >
                                <img
                                  src={brand.src}
                                  alt={brand.name}
                                  className="h-10 sm:h-12 max-h-12 max-w-[120px] sm:max-w-[140px] w-auto object-contain"
                                  loading="lazy"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 3rd Track: Scrolls UP */}
                        <div className="overflow-hidden">
                          <div className="flex flex-col gap-2.5 animate-vertical-up-slow">
                            {[...brandCol3, ...brandCol3].map((brand, idx) => (
                              <div
                                key={`col3-${idx}`}
                                className="h-20 sm:h-22 bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 flex items-center justify-center shadow-xs hover:border-brand-500 hover:shadow-md transition-all shrink-0"
                                title={brand.name}
                              >
                                <img
                                  src={brand.src}
                                  alt={brand.name}
                                  className="h-10 sm:h-12 max-h-12 max-w-[120px] sm:max-w-[140px] w-auto object-contain"
                                  loading="lazy"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
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
              <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {/* Left Column: Product Side */}
                <div className="md:col-span-5 p-4 sm:p-5 bg-slate-50/60 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="w-full h-28 sm:h-32 bg-white rounded-2xl border border-slate-200/90 p-2.5 flex items-center justify-center overflow-hidden shadow-2xs">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="mt-2 w-full">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 block mb-0.5">
                        Selected Medical Equipment
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {product.name}
                      </h4>

                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-xs text-slate-500 font-mono">
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
                    <div className="mt-2.5 p-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2 shadow-2xs">
                      <Truck size={15} className="text-brand-600 shrink-0" />
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
                  <div className="mt-2.5 pt-2 border-t border-slate-200/90 overflow-hidden">
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
                <div className="md:col-span-7 p-5 sm:p-7 lg:p-8 flex flex-col justify-center bg-white space-y-3.5">
                  {step === 'form' ? (
                    isCustomerLoggedIn() ? (
                      /* LOGGED IN USER: Waisa hi jaise normal me karte hai, sirf target price field (mobile wagerah kuchh nahi) */
                      <div className="space-y-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                          <span>Official Institutional Quotation Request</span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          {product?.isNegotiable ? 'Enter Your Target Purchase Price' : 'Request Instant Quotation'}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                          {product?.isNegotiable
                            ? 'Yeh equipment price-negotiable hai. Kripya apna target unit price enter karein to submit directly to Company Admin.'
                            : 'Confirm to receive authentic direct OEM pricing, GST proforma invoice, and priority regional dispatch.'}
                        </p>

                        {/* Customer Account Summary (Shows they are already logged in, no mobile/email inputs needed) */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                              <Check size={14} className="text-emerald-700" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block text-xs sm:text-sm">{customerName || 'NA'}</span>
                              <span className="text-[11px] text-slate-500">{countryCode} {phone} &bull; {district}</span>
                            </div>
                          </div>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            Verified Client
                          </span>
                        </div>

                        {/* ONLY THE PRICE FIELD (If Negotiable - Excluded for Wishlist & Cart) */}
                        <form onSubmit={handleFormSubmit} className="space-y-4 pt-1">
                          {Boolean(product?.isNegotiable && !product?.intentAction) && (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-bold text-slate-800">
                                  Your Target / Negotiable Unit Price (₹) <span className="text-red-600 font-bold">*</span>
                                </label>
                                {product.price && (
                                  <span className="text-xs text-slate-500 font-mono">
                                    Catalog MRP: ₹{Number(product.price).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                              <div className="relative flex shadow-2xs rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-red-500/20">
                                <div className="pl-4 pr-1 text-slate-500 bg-slate-50 py-2.5 border-y border-l border-slate-300 font-bold text-sm">
                                  ₹
                                </div>
                                <input
                                  type="number"
                                  required
                                  min="1"
                                  autoFocus
                                  value={expectedPrice}
                                  onChange={(e) => {
                                    setExpectedPrice(e.target.value);
                                    if (error) setError('');
                                  }}
                                  placeholder={`Enter your target price (Catalog: ₹${(product.price || 0).toLocaleString('en-IN')})`}
                                  className="w-full pl-2.5 pr-4 py-2.5 bg-slate-50 text-slate-900 text-sm font-bold border border-l-0 border-slate-300 focus:border-red-500 focus:bg-white outline-none transition"
                                />
                              </div>
                            </div>
                          )}

                          {error && (
                            <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5 animate-fade-in bg-red-50 p-2.5 rounded-xl border border-red-200">
                              <AlertCircle size={15} className="shrink-0" />
                              <span>{error}</span>
                            </p>
                          )}

                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                          >
                            <FileText size={16} />
                            <span>{isSubmitting ? 'Submitting to Admin...' : (product?.isNegotiable ? 'Submit Target Offer & Get Quotation' : 'Generate & Sync Official Quotation')}</span>
                            <ArrowRight size={16} />
                          </button>

                          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
                            <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                            <span>Verified Medical Account &bull; Regional OEM Hub</span>
                          </div>
                        </form>
                      </div>
                    ) : (
                      /* GUEST / FIRST TIME VISITOR: Standard form with clean Price field if negotiable */
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold mb-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                          <span>
                            {product?.intentAction === 'wishlist'
                              ? 'Equipment Wishlist • Fast Profile Verification'
                              : product?.intentAction === 'cart'
                                ? 'Procurement Cart • Fast Profile Verification'
                                : 'Instant Official Quotation & Fast Profile Setup'}
                          </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          {product?.intentAction === 'wishlist'
                            ? 'Save to Equipment Wishlist'
                            : product?.intentAction === 'cart'
                              ? 'Add to Procurement Cart'
                              : 'Request Instant Quotation'}
                        </h3>

                        <form onSubmit={handleFormSubmit} className="mt-3 space-y-2.5 sm:space-y-3">
                          {/* Name Grid */}
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1">
                              Your Full Name
                            </label>
                            <input
                              type="text"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="e.g. Dr. Rajesh Sharma"
                              className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 text-xs sm:text-sm font-semibold border border-slate-300 rounded-xl focus:border-red-500 focus:bg-white outline-none transition"
                            />
                          </div>

                          {/* 1. International Mobile Number (Mandatory) */}
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1">
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
                                className="w-full pl-3.5 pr-4 py-2.5 bg-slate-50 text-slate-900 text-xs sm:text-sm font-semibold border border-l-0 border-slate-300 focus:border-red-500 focus:bg-white outline-none transition"
                              />
                            </div>
                          </div>

                          {/* 2. Official Email Address (Mandatory) */}
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1">
                              Official Email Address <span className="text-red-600 font-bold">*</span>
                            </label>
                            <div className="relative flex items-center shadow-2xs rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-red-500/20">
                              <div className="pl-3.5 pr-1 text-slate-400 bg-slate-50 py-2.5 border-y border-l border-slate-300">
                                <Mail size={16} />
                              </div>
                              <input
                                type="email"
                                required
                                value={email}
                                onChange={handleEmailChange}
                                placeholder="e.g. doctor@hospital.org or procurement@gmail.com"
                                className="w-full pl-2.5 pr-4 py-2.5 bg-slate-50 text-slate-900 text-xs sm:text-sm font-semibold border border-l-0 border-slate-300 focus:border-red-500 focus:bg-white outline-none transition"
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              Official quotation PDF and technical sheet will be linked to your account.
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

                          {/* Price Negotiation Field (Only for Get Quote; excluded for Wishlist and Cart) */}
                          {Boolean(product?.isNegotiable && !product?.intentAction) && (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-bold text-slate-800">
                                  Your Target / Negotiable Price (₹ per unit) <span className="text-red-600 font-bold">*</span>
                                </label>
                                {product.price && (
                                  <span className="text-[11px] text-slate-500 font-mono">
                                    Catalog MRP: ₹{Number(product.price).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                              <div className="relative flex shadow-2xs rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-red-500/20">
                                <div className="pl-3.5 pr-1 text-slate-500 bg-slate-50 py-2.5 border-y border-l border-slate-300 font-bold text-sm">
                                  ₹
                                </div>
                                <input
                                  type="number"
                                  required
                                  min="1"
                                  value={expectedPrice}
                                  onChange={(e) => {
                                    setExpectedPrice(e.target.value);
                                    if (error) setError('');
                                  }}
                                  placeholder={`Enter your target price (Catalog: ₹${(product.price || 0).toLocaleString('en-IN')})`}
                                  className="w-full pl-2.5 pr-4 py-2.5 bg-slate-50 text-slate-900 text-xs sm:text-sm font-semibold border border-l-0 border-slate-300 focus:border-red-500 focus:bg-white outline-none transition"
                                />
                              </div>
                            </div>
                          )}

                          {/* Error Notice */}
                          {error && (
                            <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5 animate-fade-in bg-red-50 p-2.5 rounded-xl border border-red-200">
                              <AlertCircle size={15} className="shrink-0" />
                              <span>{error}</span>
                            </p>
                          )}

                          {/* Submit Button */}
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-75"
                          >
                            <KeyRound size={16} />
                            <span>
                              {product?.intentAction === 'wishlist'
                                ? 'Verify Mobile via OTP & Add to Wishlist'
                                : product?.intentAction === 'cart'
                                  ? 'Verify Mobile via OTP & Add to Cart'
                                  : (product?.isNegotiable ? 'Verify Mobile & Submit Price Offer' : 'Verify Mobile via OTP & Continue')}
                            </span>
                            <ArrowRight size={16} />
                          </button>

                          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
                            <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                            <span>Instant 6-digit OTP verification ensures secure delivery</span>
                          </div>
                        </form>
                      </div>
                    )
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
                          <span>
                            {isSubmitting
                              ? 'Verifying...'
                              : product?.intentAction === 'wishlist'
                                ? 'Verify OTP & Add to Wishlist'
                                : product?.intentAction === 'cart'
                                  ? 'Verify OTP & Add to Cart'
                                  : 'Verify OTP & Issue Official Quotation'}
                          </span>
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
    </>
  );
}
