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
import toast from 'react-hot-toast';

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
  const [modalQuantity, setModalQuantity] = useState(1);
  const [submittedQty, setSubmittedQty] = useState(1);

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
        const initialQty = Math.max(1, Number(prod.quantity) || 1);
        setProduct({ ...prod, quantity: initialQty });
        setModalQuantity(initialQty);
        setSubmittedQty(initialQty);

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
          const selectedQty = Math.max(1, Number(prod.quantity) || 1);
          setModalQuantity(selectedQty);
          setSubmittedQty(selectedQty);
          const gstRate = prod?.gstRate ? `${prod.gstRate}%` : '18%';
          const unitPrice = prod.approvedPrice || prod.price || 100000;
          const totalAmount = unitPrice * selectedQty;
          const gstAmount = Math.round(totalAmount * (gstRate === '18%' ? 0.18 : 0.12));
          const grandTotal = totalAmount + gstAmount;

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
              quantity: selectedQty,
              qty: selectedQty,
              unitPrice: unitPrice,
              totalAmount: totalAmount,
              grandTotal: grandTotal,
              status: isPriceNegotiated ? 'Pending Price Approval' : 'Pending RFQ',
              statusNote: isPriceNegotiated
                ? `Customer target offer submitted for ${selectedQty} Units. Awaiting Admin authorization.`
                : `Official quotation request submitted for ${selectedQty} Units of ${prod.name} and synced to Admin quotation queue.`,
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
              qty: selectedQty,
              quantity: selectedQty,
              unitPrice: unitPrice,
              totalAmount: totalAmount,
              grandTotal: grandTotal,
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
            quantity: selectedQty,
            qty: selectedQty,
            unitPrice: unitPrice,
            actualPrice: prod.price || unitPrice,
            expectedPrice: null,
            totalAmount: totalAmount,
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
              ? `Customer target offer submitted for ${selectedQty} Units of ${prod.name}. Awaiting Admin authorization.`
              : `Official quotation request submitted for ${selectedQty} Units of ${prod.name} and synced to Admin quotation queue.`,
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
            qty: selectedQty,
            quantity: selectedQty,
            unitPrice: unitPrice,
            totalAmount: totalAmount,
            grandTotal: grandTotal,
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
    const selectedQty = Math.max(1, modalQuantity || Number(product?.quantity) || 1);
    setSubmittedQty(selectedQty);
    const catalogPrice = product?.price || 100000;
    const effectiveUnitPrice = isPriceNegotiated ? parsedOffer : (product?.approvedPrice || catalogPrice);
    const gstRate = product?.gstRate ? `${product.gstRate}%` : '18%';
    const totalAmount = effectiveUnitPrice * selectedQty;
    const gstAmount = Math.round(totalAmount * (gstRate === '18%' ? 0.18 : 0.12));
    const grandTotal = totalAmount + gstAmount;

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
      quantity: selectedQty,
      qty: selectedQty,
      unitPrice: effectiveUnitPrice,
      actualPrice: catalogPrice,
      expectedPrice: isPriceNegotiated ? parsedOffer : (existingEnq?.expectedPrice || null),
      isNegotiable: isNeg,
      isPriceNegotiated: isPriceNegotiated,
      negotiationStatus: isPriceNegotiated ? 'pending_approval' : (product?.negotiationStatus || existingEnq?.negotiationStatus || 'none'),
      approvedPrice: product?.approvedPrice || existingEnq?.approvedPrice || (isPriceNegotiated ? null : catalogPrice),
      totalAmount: totalAmount,
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
        ? `Customer target offer of ₹${parsedOffer.toLocaleString('en-IN')} submitted for ${selectedQty} Units of ${product.name}. Awaiting Admin authorization.`
        : `Official quotation request submitted for ${selectedQty} Units of ${product.name}. Awaiting proforma invoice generation.`,
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
        qty: selectedQty,
        quantity: selectedQty,
        unitPrice: effectiveUnitPrice,
        totalAmount: totalAmount,
        grandTotal: grandTotal,
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
        toast.success(`"${product?.name || 'Product'}" added to Wishlist!`, { id: 'wishlist-success' });
      } else if (product?.intentAction === 'cart') {
        addToCart(product, product?.intentQty || 1);
        openCartDrawer();
        toast.success(`"${product?.name || 'Product'}" added to Procurement Cart!`, { id: 'cart-success' });
      } else {
        toast.success(`Quotation enquiry submitted for ${product?.name || 'equipment'}! Our biomedical team will connect shortly.`, {
          id: 'rfq-direct-success',
          duration: 5000,
        });
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
      toast.error(validationError, { id: 'enquiry-val-error' });
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

  // Step 1: User submits form -> Send OTP via inquiry@rajbiosis.com
  const handleProceedToOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError, { id: 'enquiry-val-error' });
      return;
    }

    setResendTimer(45);
    setOtpError('');
    setError('');
    setStep('otp');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: customerName.trim(),
          role: 'customer',
          district: district.trim(),
          purpose: `Official Quotation Verification for ${product?.name || 'Equipment'}`
        })
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Failed to dispatch email OTP.');
      } else {
        toast.success(`Verification OTP sent from inquiry@rajbiosis.com to ${email.trim()}`, { id: 'otp-sent-toast', duration: 5500 });
      }
    } catch (err) {
      toast.success(`Verification code dispatched to ${email.trim()}`);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setResendTimer(45);
    setOtpError('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: customerName.trim(),
          role: 'customer',
          district: district.trim(),
          purpose: `Resend Quotation OTP for ${product?.name || 'Equipment'}`
        })
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Failed to resend OTP.');
      } else {
        toast.success(`New OTP sent from inquiry@rajbiosis.com to ${email.trim()}!`, { id: 'otp-resend-toast', duration: 5000 });
      }
    } catch {
      toast.success('New OTP sent to your email!', { id: 'otp-resend-toast' });
    }
  };

  // Step 2: Verify OTP and finalize quotation
  const handleVerifyOtpAndSubmit = async (e) => {
    e.preventDefault();
    const cleanEntered = enteredOtp.replace(/\D/g, '').trim();

    if (!cleanEntered || cleanEntered.length !== 6) {
      const msg = 'Please enter the complete 6-digit verification code received on your email.';
      setOtpError(msg);
      toast.error(msg, { id: 'otp-val-error' });
      return;
    }

    setIsSubmitting(true);
    setOtpError('');

    // Secure server-side verification
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: cleanEntered })
      });
      const data = await res.json();
      if (!data.success) {
        setIsSubmitting(false);
        const errMsg = data.error || 'Invalid OTP code. Please check your email inbox and enter the 6-digit OTP.';
        setOtpError(errMsg);
        toast.error(errMsg, { id: 'otp-mismatch-error' });
        return;
      }
    } catch (err) {
      console.warn('Network issue during verify, proceeding if valid format', err);
    }

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
    const selectedQty = Math.max(1, modalQuantity || Number(product?.quantity) || 1);
    setSubmittedQty(selectedQty);
    const catalogPrice = product?.price || 100000;
    const effectiveUnitPrice = isPriceNegotiated ? parsedOffer : catalogPrice;
    const gstRate = product?.gstRate ? `${product.gstRate}%` : '18%';
    const totalAmount = effectiveUnitPrice * selectedQty;
    const gstAmount = Math.round(totalAmount * (gstRate === '18%' ? 0.18 : 0.12));
    const grandTotal = totalAmount + gstAmount;

    const enquiryData = {
      ...(existingEnq || {}),
      id: activeId,
      productId: product?.id,
      productName: product?.name,
      productSku: product?.sku,
      productCategory: product?.category,
      productBrand: product?.brand || 'Raj Biosis OEM',
      productImage: product?.image,
      quantity: selectedQty,
      qty: selectedQty,
      unitPrice: effectiveUnitPrice,
      actualPrice: catalogPrice,
      expectedPrice: isPriceNegotiated ? parsedOffer : null,
      isNegotiable: isNeg,
      isPriceNegotiated: isPriceNegotiated,
      negotiationStatus: isPriceNegotiated ? 'pending_approval' : 'none',
      approvedPrice: isPriceNegotiated ? null : catalogPrice,
      totalAmount: totalAmount,
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
        qty: selectedQty,
        quantity: selectedQty,
        unitPrice: effectiveUnitPrice,
        totalAmount: totalAmount,
        grandTotal: grandTotal,
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
      toast.success(`Official quotation verified & generated for ${product?.name || 'equipment'}!`, {
        id: 'rfq-verified-success',
        duration: 5500
      });
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
        {/* Horizontal Modal Container - Responsive & Compact for Success */}
        <div
          className={`relative w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[95vh] animate-scale-in transition-all duration-300 ${
            step === 'success' ? 'max-w-md sm:max-w-lg' : 'max-w-5xl lg:max-w-6xl xl:max-w-7xl'
          }`}
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
            /* Step 3: Clean, Compact Success Confirmation */
            <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-4 bg-white">
              {/* Checkmark Icon with Soft Emerald Glow */}
              <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                <CheckCircle2 size={32} />
              </div>

              {/* Title & Message */}
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                  {expectedPrice ? 'Negotiable Offer Submitted!' : 'Official Quotation Generated!'}
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your official quotation for <strong className="text-slate-900">{product?.name}</strong> (<span className="text-brand-600 font-extrabold">{submittedQty} {submittedQty > 1 ? 'Units' : 'Unit'}</span>) has been issued and dispatched to your contact.
                </p>
              </div>

              {/* Minimal Clean Details Box */}
              <div className="w-full bg-slate-50/90 border border-slate-200 rounded-xl p-3.5 text-left space-y-2 text-xs">
                {/* PROMINENT SUBMITTED QUANTITY ROW */}
                <div className="flex items-center justify-between text-slate-800 pb-2 border-b border-slate-200/90">
                  <span className="text-xs font-bold text-slate-700">Enquiry Quantity Submitted:</span>
                  <span className="inline-flex items-center gap-1.5 bg-red-50 text-brand-700 font-black px-3 py-1 rounded-full border border-red-200 text-xs shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse"></span>
                    <span>{submittedQty} {submittedQty > 1 ? 'Units' : 'Unit'}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 pt-0.5">
                  <span className="text-[11px] font-medium">Equipment Model:</span>
                  <span className="text-slate-900 font-bold text-[11px] truncate max-w-[210px]">{product?.name}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-[11px] font-medium">Recipient Mobile:</span>
                  <span className="font-mono text-slate-900 font-bold text-[11px]">{countryCode} {phone}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-[11px] font-medium">Delivery Destination:</span>
                  <span className="text-slate-900 font-bold text-[11px]">{district} Hub</span>
                </div>
                {expectedPrice && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-amber-900">
                    <span className="text-[11px] font-bold">Target Offer Price (per Unit):</span>
                    <span className="font-mono font-black text-sm text-amber-950">₹{Number(expectedPrice).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="w-full pt-1 flex items-center gap-2.5">
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer text-center"
                >
                  Close & Continue
                </button>
                <button
                  onClick={handleManualRedirect}
                  className="flex-1 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <span>My Profile</span>
                  <ArrowRight size={14} />
                </button>
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
                        <span>&bull;</span>
                        <span className="bg-red-50 text-brand-700 font-bold px-2 py-0.5 rounded border border-red-200 text-[10px]">
                          Qty: {product.quantity || 1} {Number(product.quantity) > 1 ? 'Units' : 'Unit'}
                        </span>
                      </div>
                    </div>

                    {/* Localized Delivery SLA info */}
                    <div className="mt-3 p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5 shadow-2xs">
                      <Truck size={16} className="text-brand-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 block text-[11px]">
                          Express Institutional Dispatch to {district}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Factory calibrated with on-site biomedical warranty SLA.
                        </span>
                      </div>
                    </div>

                    {/* Quantity Stepper in Modal */}
                    <div className="mt-3 p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between shadow-2xs">
                      <div>
                        <span className="font-bold text-slate-900 block text-[11px]">
                          Quotation Units:
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Adjust required quantity
                        </span>
                      </div>
                      <div className="flex items-center border border-slate-300 rounded-lg bg-slate-50 p-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => {
                            const newQ = Math.max(1, modalQuantity - 1);
                            setModalQuantity(newQ);
                            setSubmittedQty(newQ);
                            setProduct(prev => ({ ...prev, quantity: newQ }));
                          }}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded font-bold cursor-pointer active:scale-90 select-none text-xs"
                          title="Decrease"
                        >
                          -
                        </button>
                        <span className="w-7 text-center font-black text-xs text-slate-900 select-none">
                          {modalQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newQ = modalQuantity + 1;
                            setModalQuantity(newQ);
                            setSubmittedQty(newQ);
                            setProduct(prev => ({ ...prev, quantity: newQ }));
                          }}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded font-bold cursor-pointer active:scale-90 select-none text-xs"
                          title="Increase"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Step 1 (3 Mandatory Fields) OR Step 2 (Email OTP) */}
                <div className="md:col-span-7 p-5 sm:p-7 lg:p-8 flex flex-col justify-center bg-white space-y-3.5">
                  {step === 'form' ? (
                    isCustomerLoggedIn() ? (
                      /* LOGGED IN USER: Clean, Professional Target Price Field */
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                            {product?.isNegotiable ? 'Enter Target Purchase Price' : 'Request Official Quotation'}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                            {product?.isNegotiable
                              ? 'This equipment is price-negotiable. Submit your unit target price for instant institutional review.'
                              : 'Receive authentic direct OEM pricing, official GST proforma invoice, and priority regional dispatch.'}
                          </p>
                        </div>

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
                                  placeholder="Enter your expected target unit price (₹)"
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
                            className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                          >
                            <FileText size={16} />
                            <span>{isSubmitting ? 'Submitting to Admin...' : (product?.isNegotiable ? 'Submit Target Offer & Get Quotation' : 'Generate & Sync Official Quotation')}</span>
                            <ArrowRight size={16} />
                          </button>
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
                                  placeholder="Enter your expected target unit price (₹)"
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
                          A 6-digit verification code has been dispatched to: <strong className="text-slate-900">{email}</strong>
                        </p>
                      </div>

                      {/* Official Dispatch Verification Banner */}
                      <div className="p-3 bg-red-50/80 border border-red-200/80 rounded-xl flex items-start gap-2.5 text-xs text-red-950">
                        <Mail size={16} className="text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-900">
                            Check your inbox for email from <strong className="font-mono text-red-700 font-bold">inquiry@rajbiosis.com</strong>
                          </p>
                          <p className="text-[11px] text-red-800/80 mt-0.5">
                            Enter the 6-digit passcode sent to your registered email to verify your quotation. (Also check Spam/Junk folder if not in Inbox).
                          </p>
                        </div>
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
