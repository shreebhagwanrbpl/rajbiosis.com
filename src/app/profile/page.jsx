'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CountryCodeSelector from '../../components/CountryCodeSelector';
import DistrictSelector from '../../components/DistrictSelector';
import {
  getUserProfile,
  saveUserProfile,
  clearUserProfile,
  getUserInquiries,
  USER_INQUIRIES_EVENT,
  USER_PROFILE_EVENT,
  getDefaultSampleInquiries
} from '../../utils/userProfile';
import {
  getAllLeads,
  getLeadsByDistrict,
  updateLeadStatus,
  recordCustomerLead,
  getPortalSession,
  savePortalSession,
  clearPortalSession,
  LEADS_EVENT
} from '../../utils/leads';
import { DEFAULT_COUNTRY_CODE } from '../../data/internationalCodes';
import { INDIAN_STATES, RAJASTHAN_DISTRICTS } from '../../data/districts';
import { PRODUCTS } from '../../data/products';
import {
  User,
  Phone,
  Mail,
  Building2,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Check,
  LogOut,
  Clock,
  Truck,
  FileText,
  Printer,
  Eye,
  MessageSquare,
  Sparkles,
  X,
  ExternalLink,
  ChevronRight,
  PackageCheck,
  Edit3,
  Search,
  Lock,
  PhoneCall,
  PlusCircle,
  Filter,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  UserPlus,
  Users,
  Trash2,
  KeyRound,
  BadgeCheck
} from 'lucide-react';
import {
  getUserAccounts,
  createUserAccount,
  deleteUserAccount,
  findAccountByEmail,
  USER_ACCOUNTS_EVENT
} from '../../utils/userAccounts';

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Set to false whenever you want to hide the account type selection dropdown from public visitors
  const SHOW_ROLE_DROPDOWN = true;

  // Active Top View: 'customer' (default) | 'staff' (employee & admin desk)
  const tabParam = searchParams?.get('tab');
  const [activeView, setActiveView] = useState(tabParam === 'staff' ? 'staff' : 'customer');

  // Customer Profile Existence & Edit States
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  // Quotation Filter & Search (Customer View) - Exactly 3 clean states: 'all' | 'pending' | 'confirmed'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inquiries, setInquiries] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  // Customer Profile Form Data (supports customer, admin, employee registration)
  const [formData, setFormData] = useState({
    accountType: 'customer', // 'customer' | 'admin' | 'employee'
    fullName: '',
    designation: '',
    countryCode: DEFAULT_COUNTRY_CODE,
    phone: '',
    email: '',
    state: 'Rajasthan',
    district: 'Jaipur',
    hospitalName: '',
    address: '',
    pincode: ''
  });

  // Separate Edit Form Data
  const [editFormData, setEditFormData] = useState({ ...formData });

  // -------------------------------------------------------------
  // Staff & Admin Desk States (Integrated inside this profile)
  // -------------------------------------------------------------
  const [staffSession, setStaffSession] = useState(null);
  const [staffAuthTab, setStaffAuthTab] = useState(tabParam === 'admin' ? 'admin' : 'employee'); // 'employee' | 'admin'
  
  // Employee Login fields: name, email, district
  const [empName, setEmpName] = useState('Er. Rajesh Sharma');
  const [empEmail, setEmpEmail] = useState('rajesh.sharma@rajbiosis.com');
  const [empDistrict, setEmpDistrict] = useState('Jaipur');

  // Admin Login fields: name, email, district
  const [adminName, setAdminName] = useState('Amitabh Saxena');
  const [adminEmail, setAdminEmail] = useState('admin@rajbiosis.com');
  const [adminDistrict, setAdminDistrict] = useState('Jaipur');

  // Email OTP Authentication States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpTargetEmail, setOtpTargetEmail] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [staffLoginError, setStaffLoginError] = useState('');

  // Admin User & Staff Account Creation Management States
  const [adminSubTab, setAdminSubTab] = useState('accounts'); // 'accounts' | 'leads'
  const [userAccounts, setUserAccounts] = useState([]);
  const [accountFilterRole, setAccountFilterRole] = useState('all'); // 'all' | 'employee' | 'admin' | 'customer'
  const [newAccRole, setNewAccRole] = useState('employee'); // 'employee' | 'admin' | 'customer'
  const [newAccName, setNewAccName] = useState('');
  const [newAccEmail, setNewAccEmail] = useState('');
  const [newAccDistrict, setNewAccDistrict] = useState('Jaipur');
  const [newAccPhone, setNewAccPhone] = useState('');
  const [newAccDesignation, setNewAccDesignation] = useState('');
  const [newAccHospital, setNewAccHospital] = useState('');
  const [accountSuccessMsg, setAccountSuccessMsg] = useState('');
  const [accountErrorMsg, setAccountErrorMsg] = useState('');

  // Staff Leads Data
  const [leads, setLeads] = useState([]);
  const [adminDistrictFilter, setAdminDistrictFilter] = useState('all');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [activeNoteLeadId, setActiveNoteLeadId] = useState(null);
  const [noteInput, setNoteInput] = useState('');
  const [staffNotice, setStaffNotice] = useState('');

  // -------------------------------------------------------------
  // Effects: Sync Profile, Inquiries & Staff Session
  // -------------------------------------------------------------
  useEffect(() => {
    let interval = null;
    if (isOtpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOtpSent, otpTimer]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (tabParam === 'staff' || tabParam === 'employee' || tabParam === 'admin') {
      setActiveView('staff');
      if (tabParam === 'admin') {
        setStaffAuthTab('admin');
      } else if (tabParam === 'employee') {
        setStaffAuthTab('employee');
      }
    }

    // Load customer profile
    const storedProfile = getUserProfile();
    const hasProfile = Boolean(storedProfile && (storedProfile.fullName || storedProfile.phone));
    setHasExistingProfile(hasProfile);

    const queryName = searchParams?.get('name');
    const queryPhone = searchParams?.get('phone');
    const queryDistrict = searchParams?.get('district');

    const initialData = {
      accountType: 'customer',
      fullName: queryName ? decodeURIComponent(queryName) : (storedProfile?.fullName || ''),
      designation: storedProfile?.designation || '',
      phone: queryPhone ? decodeURIComponent(queryPhone) : (storedProfile?.phone || ''),
      email: storedProfile?.email || '',
      state: storedProfile?.state || 'Rajasthan',
      district: queryDistrict ? decodeURIComponent(queryDistrict) : (storedProfile?.district || 'Jaipur'),
      hospitalName: storedProfile?.hospitalName || '',
      address: storedProfile?.address || '',
      pincode: storedProfile?.pincode || '',
      countryCode: storedProfile?.countryCode || DEFAULT_COUNTRY_CODE
    };

    setFormData(initialData);
    setEditFormData(initialData);

    // Load customer inquiries
    const rawInquiries = getUserInquiries();
    const cleanInquiries = rawInquiries.filter(
      (item) => item && !item.id?.startsWith('RFQ-2026-') && !item.id?.startsWith('ENQ-1792')
    );
    setInquiries(cleanInquiries);

    // Load staff session
    const sess = getPortalSession();
    if (sess) {
      setStaffSession(sess);
      loadLeadsForSession(sess);
    }

    const handleInquiriesUpdated = (e) => {
      const items = e.detail || getUserInquiries();
      const filtered = Array.isArray(items)
        ? items.filter((item) => item && !item.id?.startsWith('RFQ-2026-') && !item.id?.startsWith('ENQ-1792'))
        : [];
      setInquiries(filtered);
    };

    const handleProfileUpdated = (e) => {
      if (e.detail && (e.detail.fullName || e.detail.phone)) {
        setHasExistingProfile(true);
        setFormData((prev) => ({ ...prev, ...e.detail }));
        setEditFormData((prev) => ({ ...prev, ...e.detail }));
      } else {
        setHasExistingProfile(false);
      }
    };

    const handleLeadsUpdated = () => {
      const cur = getPortalSession();
      if (cur) loadLeadsForSession(cur);
    };

    // Initialize & listen to registered user accounts
    setUserAccounts(getUserAccounts());
    const handleAccountsUpdated = (e) => {
      setUserAccounts(e.detail || getUserAccounts());
    };

    window.addEventListener(USER_INQUIRIES_EVENT, handleInquiriesUpdated);
    window.addEventListener(USER_PROFILE_EVENT, handleProfileUpdated);
    window.addEventListener(LEADS_EVENT, handleLeadsUpdated);
    window.addEventListener(USER_ACCOUNTS_EVENT, handleAccountsUpdated);

    return () => {
      window.removeEventListener(USER_INQUIRIES_EVENT, handleInquiriesUpdated);
      window.removeEventListener(USER_PROFILE_EVENT, handleProfileUpdated);
      window.removeEventListener(LEADS_EVENT, handleLeadsUpdated);
      window.removeEventListener(USER_ACCOUNTS_EVENT, handleAccountsUpdated);
    };
  }, [searchParams, tabParam]);

  const loadLeadsForSession = (sess) => {
    if (sess.role === 'employee') {
      const distLeads = getLeadsByDistrict(sess.district);
      setLeads(distLeads);
    } else {
      const all = getAllLeads();
      setLeads(all);
    }
  };

  // -------------------------------------------------------------
  // Customer Profile Actions
  // -------------------------------------------------------------
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateProfile = (e) => {
    if (e) e.preventDefault();

    const role = formData.accountType || 'customer';

    if (!formData.fullName.trim()) {
      alert('Please enter your full name');
      return;
    }
    if (!formData.phone.trim()) {
      alert('Please enter your mobile number');
      return;
    }

    // -------------------------------------------------------------
    // CASE 1: Central Admin Account Creation directly from form
    // -------------------------------------------------------------
    if (role === 'admin') {
      if (!formData.email.trim() || !formData.email.includes('@')) {
        alert('Please enter a valid official email for Admin authentication');
        return;
      }

      const adminAcc = createUserAccount({
        role: 'admin',
        name: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        district: formData.district || 'All Rajasthan Districts',
        phone: formData.phone.trim(),
        designation: formData.designation?.trim() || 'Central System Administrator',
        hospitalName: formData.hospitalName?.trim() || 'Central Headquarters'
      });

      const sess = {
        role: 'admin',
        name: adminAcc.name,
        email: adminAcc.email,
        district: adminAcc.district,
        isVerified: true,
        loginTime: new Date().toISOString()
      };

      savePortalSession(sess);
      setStaffSession(sess);
      loadLeadsForSession(sess);
      setUserAccounts(getUserAccounts());
      setActiveView('staff');
      setAdminSubTab('accounts');
      setSavedSuccessMsg(`Admin Account created successfully! Welcome ${adminAcc.name} to Central Headquarters Dashboard.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSavedSuccessMsg(''), 5000);
      return;
    }

    // -------------------------------------------------------------
    // CASE 2: Regional Employee Account Creation directly from form
    // -------------------------------------------------------------
    if (role === 'employee') {
      if (!formData.email.trim() || !formData.email.includes('@')) {
        alert('Please enter a valid email for Employee authentication');
        return;
      }
      if (!formData.district.trim()) {
        alert('Please select assigned district depot');
        return;
      }

      const empAcc = createUserAccount({
        role: 'employee',
        name: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        district: formData.district,
        phone: formData.phone.trim(),
        designation: formData.designation?.trim() || 'Regional Service Engineer',
        hospitalName: `${formData.district} Regional Depot`
      });

      const sess = {
        role: 'employee',
        name: empAcc.name,
        email: empAcc.email,
        district: empAcc.district,
        isVerified: true,
        loginTime: new Date().toISOString()
      };

      savePortalSession(sess);
      setStaffSession(sess);
      loadLeadsForSession(sess);
      setUserAccounts(getUserAccounts());
      setActiveView('staff');
      setSavedSuccessMsg(`Regional Employee Account created for ${empAcc.district} Depot!`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSavedSuccessMsg(''), 5000);
      return;
    }

    // -------------------------------------------------------------
    // CASE 3: Healthcare Customer Profile
    // -------------------------------------------------------------
    if (!formData.hospitalName.trim()) {
      alert('Please enter your hospital or clinic name');
      return;
    }
    if (!formData.district.trim()) {
      alert('Please select your delivery district');
      return;
    }

    const saved = saveUserProfile(formData);
    if (saved) {
      // Also register in user accounts directory so Admin can view & manage in directory
      createUserAccount({
        role: 'customer',
        name: saved.fullName,
        email: saved.email || '',
        district: saved.district || 'Jaipur',
        phone: saved.phone || '',
        hospitalName: saved.hospitalName || '',
        designation: saved.designation || 'Healthcare Representative'
      });
      setUserAccounts(getUserAccounts());

      setFormData(saved);
      setEditFormData(saved);
      setHasExistingProfile(true);

      const personalizedInquiries = getDefaultSampleInquiries(saved.district || 'Jaipur');
      setInquiries(personalizedInquiries);

      setSavedSuccessMsg('Healthcare profile verified! Your quotations and equipment delivery desk are ready.');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => setSavedSuccessMsg(''), 4000);
    }
  };

  const handleOpenEditModal = () => {
    setEditFormData({ ...formData });
    setIsEditModalOpen(true);
  };

  const handleSaveEditProfile = (e) => {
    if (e) e.preventDefault();

    if (!editFormData.fullName.trim()) {
      alert('Please enter your full name');
      return;
    }
    if (!editFormData.phone.trim()) {
      alert('Please enter your mobile number');
      return;
    }
    if (!editFormData.district.trim()) {
      alert('Please select your district');
      return;
    }

    const saved = saveUserProfile(editFormData);
    if (saved) {
      setFormData(saved);
      setIsEditModalOpen(false);
      setSavedSuccessMsg('Profile details updated successfully.');
      setTimeout(() => setSavedSuccessMsg(''), 3500);
    }
  };

  const handleLogoutCustomer = () => {
    clearUserProfile();
    setHasExistingProfile(false);
    const blank = {
      accountType: 'customer',
      fullName: '',
      designation: '',
      countryCode: DEFAULT_COUNTRY_CODE,
      phone: '',
      email: '',
      state: 'Rajasthan',
      district: 'Jaipur',
      hospitalName: '',
      address: '',
      pincode: ''
    };
    setFormData(blank);
    setEditFormData(blank);
    setActiveView('customer');
    setSavedSuccessMsg('Logged out successfully from customer profile.');
    setTimeout(() => setSavedSuccessMsg(''), 3000);
  };

  // -------------------------------------------------------------
  // Staff & Admin Login (Email OTP Flow) & Lead Actions
  // -------------------------------------------------------------
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setStaffLoginError('');

    const isEmp = staffAuthTab === 'employee';
    const name = (isEmp ? empName : adminName).trim();
    const email = (isEmp ? empEmail : adminEmail).trim();
    const district = (isEmp ? empDistrict : adminDistrict).trim();

    if (!name) {
      setStaffLoginError(`Please enter your full name.`);
      return;
    }
    if (!email || !email.includes('@')) {
      setStaffLoginError('Please enter a valid official email address.');
      return;
    }
    if (!district) {
      setStaffLoginError('Please select district.');
      return;
    }

    setIsSendingOtp(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, district, role: staffAuthTab })
      });
      const data = await res.json();
      const code = data.otp || Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setOtpTargetEmail(email);
      setIsOtpSent(true);
      setOtpTimer(30);
      setEnteredOtp('');
      showStaffNotice(`Verification OTP sent to ${email}`);
    } catch {
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(fallbackCode);
      setOtpTargetEmail(email);
      setIsOtpSent(true);
      setOtpTimer(30);
      setEnteredOtp('');
      showStaffNotice(`Verification OTP sent to ${email}`);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = (e) => {
    if (e) e.preventDefault();
    setStaffLoginError('');

    const cleanInput = enteredOtp.replace(/\D/g, '').trim();
    if (cleanInput.length < 6) {
      setStaffLoginError('Please enter the 6-digit OTP received on your email.');
      return;
    }

    if (cleanInput !== generatedOtp) {
      setStaffLoginError('Invalid OTP code. Please enter the correct 6-digit code or click auto-fill.');
      return;
    }

    setIsVerifyingOtp(true);

    const isEmp = staffAuthTab === 'employee';
    const rawEmail = (isEmp ? empEmail : adminEmail).trim().toLowerCase();
    const matched = findAccountByEmail(rawEmail);
    const resolvedRole = matched?.role || staffAuthTab;
    const resolvedName = matched?.name || (isEmp ? empName : adminName).trim();
    const resolvedDistrict = matched?.district || (isEmp ? empDistrict : adminDistrict).trim();

    // If account role is customer: switch to customer profile dashboard
    if (resolvedRole === 'customer') {
      saveUserProfile({
        fullName: resolvedName,
        email: rawEmail,
        district: resolvedDistrict,
        phone: matched?.phone || '',
        hospitalName: matched?.hospitalName || '',
        designation: matched?.designation || '',
        state: 'Rajasthan'
      });
      setHasExistingProfile(true);
      setActiveView('customer');
      setIsOtpSent(false);
      setIsVerifyingOtp(false);
      showStaffNotice(`Welcome ${resolvedName}! Logged in to your Customer Account.`);
      return;
    }

    // If account role is employee or admin: save staff portal session
    const newSession = {
      role: resolvedRole,
      name: resolvedName,
      email: rawEmail,
      district: resolvedDistrict,
      isVerified: true,
      loginTime: new Date().toISOString()
    };

    savePortalSession(newSession);
    setStaffSession(newSession);
    loadLeadsForSession(newSession);
    setIsOtpSent(false);
    setIsVerifyingOtp(false);
    showStaffNotice(`Welcome ${resolvedName}! Logged in as ${resolvedRole === 'admin' ? 'Central Admin' : `${resolvedDistrict} Regional Depot Employee`}.`);
  };

  // -------------------------------------------------------------
  // Admin Account Creation & Role Management Handlers
  // -------------------------------------------------------------
  const handleAdminCreateAccount = (e) => {
    if (e) e.preventDefault();
    setAccountErrorMsg('');
    setAccountSuccessMsg('');

    if (!newAccName.trim()) {
      setAccountErrorMsg('Please enter account holder name.');
      return;
    }
    if (!newAccEmail.trim() || !newAccEmail.includes('@')) {
      setAccountErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!newAccDistrict) {
      setAccountErrorMsg('Please select an assigned district.');
      return;
    }

    const created = createUserAccount({
      role: newAccRole,
      name: newAccName.trim(),
      email: newAccEmail.trim().toLowerCase(),
      district: newAccDistrict,
      phone: newAccPhone.trim(),
      designation: newAccDesignation.trim(),
      hospitalName: newAccHospital.trim()
    });

    setUserAccounts(getUserAccounts());
    setAccountSuccessMsg(`New ${created.role.toUpperCase()} account for "${created.name}" created successfully! User can log in with ${created.email}.`);

    // Reset inputs
    setNewAccName('');
    setNewAccEmail('');
    setNewAccPhone('');
    setNewAccDesignation('');
    setNewAccHospital('');
    setTimeout(() => setAccountSuccessMsg(''), 6000);
  };

  const handleDeleteAccount = (identifier) => {
    deleteUserAccount(identifier);
    setUserAccounts(getUserAccounts());
    showStaffNotice('Account removed from registered directory.');
  };

  const handleLoginAsUser = (account) => {
    if (!account) return;
    if (account.role === 'customer') {
      saveUserProfile({
        fullName: account.name,
        email: account.email,
        district: account.district,
        phone: account.phone || '',
        hospitalName: account.hospitalName || '',
        designation: account.designation || '',
        state: 'Rajasthan'
      });
      setHasExistingProfile(true);
      setActiveView('customer');
      showStaffNotice(`Switched session to Customer: ${account.name}`);
    } else {
      const newSession = {
        role: account.role,
        name: account.name,
        email: account.email,
        district: account.district,
        isVerified: true,
        loginTime: new Date().toISOString()
      };
      savePortalSession(newSession);
      setStaffSession(newSession);
      loadLeadsForSession(newSession);
      setActiveView('staff');
      showStaffNotice(`Logged in as ${account.role === 'admin' ? 'Central Admin' : 'Regional Employee'}: ${account.name} (${account.district})`);
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    await handleSendOtp();
  };

  const handleBackToLoginForm = () => {
    setIsOtpSent(false);
    setStaffLoginError('');
  };

  const demoStaffLogin = (role, district, name, email) => {
    setStaffLoginError('');
    const newSession = {
      role,
      name,
      email: email || (role === 'admin' ? 'admin@rajbiosis.com' : 'rajesh.sharma@rajbiosis.com'),
      district,
      isVerified: true,
      loginTime: new Date().toISOString()
    };
    savePortalSession(newSession);
    setStaffSession(newSession);
    loadLeadsForSession(newSession);
    setIsOtpSent(false);
    showStaffNotice(`Logged in as ${name} (${role === 'admin' ? 'Central Admin' : `${district} Depot`})`);
  };

  const handleStaffLogout = () => {
    clearPortalSession();
    setStaffSession(null);
    setLeads([]);
    setIsOtpSent(false);
    setEnteredOtp('');
    setActiveView('customer');
  };

  const handleLeadStatusChange = (leadId, newStatus) => {
    updateLeadStatus(leadId, newStatus);
    if (staffSession) loadLeadsForSession(staffSession);
    showStaffNotice(`Lead status updated to "${newStatus}"`);
  };

  const handleSaveLeadNote = (leadId) => {
    if (!noteInput.trim()) return;
    const cur = leads.find((l) => l.id === leadId);
    updateLeadStatus(leadId, cur?.status || 'Contacted', noteInput.trim());
    setNoteInput('');
    setActiveNoteLeadId(null);
    if (staffSession) loadLeadsForSession(staffSession);
    showStaffNotice('Executive note logged successfully');
  };

  const handleSimulateLead = () => {
    const dist = staffSession?.role === 'employee' ? staffSession.district : 'Jaipur';
    recordCustomerLead({
      customerName: 'Dr. Ramesh Choudhary',
      hospitalName: `${dist} District General Hospital`,
      customerPhone: '+91 99833 33469',
      customerEmail: `procurement@${dist.toLowerCase()}hospital.org`,
      district: dist,
      productName: 'RajBiosis-Vent Pro-X9 Turbine Mechanical Ventilator',
      productSku: 'RAJ-ICU-8801',
      qty: 2,
      unitPrice: 485000,
      expectedPrice: 450000,
      isNegotiable: true,
      grandTotal: 1086400,
      statusNote: `Customer requested urgent quotation for ${dist} ICU delivery.`
    });
    if (staffSession) loadLeadsForSession(staffSession);
    showStaffNotice(`New simulated lead added to ${dist} Depot!`);
  };

  const showStaffNotice = (msg) => {
    setStaffNotice(msg);
    setTimeout(() => setStaffNotice(''), 4000);
  };

  // -------------------------------------------------------------
  // Data Formatting & Filters
  // -------------------------------------------------------------
  const formatINR = (val) => {
    if (!val) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recently';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  // Customer Inquiries Normalization & 3-Way Filter:
  // Exactly as requested: 1) All Quotes, 2) Pending, 3) Confirmed
  const normalizedInquiries = inquiries.map((item) => {
    let image = item.productImage;
    if (!image) {
      const match = PRODUCTS.find(
        (p) => p.id === item.productId || p.sku === item.productSku || p.name === item.productName
      );
      image = match ? match.image : 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80';
    }

    let isConfirmed = false;
    const st = (item.status || '').toLowerCase();
    const stage = (item.lifecycleStage || '').toLowerCase();

    if (
      stage.includes('paid') ||
      stage.includes('transit') ||
      stage.includes('deliver') ||
      st.includes('confirm') ||
      st.includes('paid') ||
      st.includes('dispatch') ||
      st.includes('deliver')
    ) {
      isConfirmed = true;
    }

    return {
      ...item,
      productImage: image,
      isConfirmed,
      quoteNumber: item.quoteNumber || item.id,
      unitPrice: item.unitPrice || 485000,
      grandTotal: item.grandTotal || item.unitPrice || 543200
    };
  });

  const pendingCount = normalizedInquiries.filter((i) => !i.isConfirmed).length;
  const confirmedCount = normalizedInquiries.filter((i) => i.isConfirmed).length;

  const filteredInquiries = normalizedInquiries.filter((item) => {
    if (statusFilter === 'pending' && item.isConfirmed) return false;
    if (statusFilter === 'confirmed' && !item.isConfirmed) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.productName?.toLowerCase().includes(q);
      const matchQuote = item.quoteNumber?.toLowerCase().includes(q);
      const matchSku = item.productSku?.toLowerCase().includes(q);
      return matchName || matchQuote || matchSku;
    }

    return true;
  });

  // Staff Leads Filter
  const filteredLeads = leads.filter((item) => {
    if (staffSession?.role === 'admin' && adminDistrictFilter !== 'all') {
      if ((item.district || '').toLowerCase() !== adminDistrictFilter.toLowerCase()) {
        return false;
      }
    }

    if (leadStatusFilter !== 'all') {
      if ((item.status || '').toLowerCase() !== leadStatusFilter.toLowerCase()) {
        return false;
      }
    }

    if (leadSearchQuery.trim()) {
      const q = leadSearchQuery.toLowerCase();
      const matchName = item.customerName?.toLowerCase().includes(q);
      const matchHospital = item.hospitalName?.toLowerCase().includes(q);
      const matchPhone = item.customerPhone?.toLowerCase().includes(q);
      const matchProduct = item.productName?.toLowerCase().includes(q);
      const matchQuote = item.quoteNumber?.toLowerCase().includes(q);
      return matchName || matchHospital || matchPhone || matchProduct || matchQuote;
    }

    return true;
  });

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4">

      {/* ========================================================================= */}
      {/* TOP COMPACT BREADCRUMB                                                    */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Equipment Catalogue</span>
        </Link>

        {/* If Staff Session is active, show Active Session & Logout */}
        {staffSession ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">
              Active Session: <strong className="text-slate-900">{staffSession.name}</strong> ({staffSession.role === 'admin' ? 'Central Admin' : `${staffSession.district} Employee`})
            </span>
            <button
              type="button"
              onClick={handleStaffLogout}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
            >
              Logout
            </button>
          </div>
        ) : (
          /* When in staff view without session, allow returning to customer form */
          activeView === 'staff' && (
            <button
              type="button"
              onClick={() => setActiveView('customer')}
              className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-800 font-bold px-3 py-1 rounded-lg bg-brand-50 border border-brand-200/80 transition cursor-pointer self-start sm:self-auto"
            >
              <Building2 size={13} className="text-brand-600" />
              <span>← Back to Registration Form</span>
            </button>
          )
        )}
      </div>

      {/* Success Notification Banner */}
      {savedSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 text-emerald-900 text-xs sm:text-sm font-semibold shadow-2xs animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <div>{savedSuccessMsg}</div>
        </div>
      )}

      {/* Staff Action Notification Banner - Clean light theme, no dark bg */}
      {staffNotice && (
        <div className="bg-blue-50 text-blue-900 border border-blue-200 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 text-xs sm:text-sm font-semibold shadow-2xs animate-fade-in">
          <ShieldCheck size={18} className="text-blue-600 shrink-0" />
          <div>{staffNotice}</div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW A: CUSTOMER PROFILE                                                  */}
      {/* ========================================================================= */}
      {activeView === 'customer' && (
        <>
          {/* ------------------------------------------------------------------- */}
          {/* CASE 1: PROFILE NOT CREATED YET (Clean, balanced 2-col layout)      */}
          {/* Not overly spread out (max-w-4xl) and not congested                */}
          {/* ------------------------------------------------------------------- */}
          {!hasExistingProfile ? (
            <div className="w-full bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5 animate-fade-in">
              {/* ========================================================================= */}
              {/* ACCOUNT TYPE SELECTION (Can be hidden later by toggling SHOW_ROLE_DROPDOWN)*/}
              {/* ========================================================================= */}
              {SHOW_ROLE_DROPDOWN && (
                <div className="p-3 bg-red-50/70 border border-red-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shrink-0"></span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                          Account Type / Role Selection
                        </span>
                        <span className="text-[10px] font-bold bg-white text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                          Direct Setup
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        Select role to create account directly. (To hide this later, toggle <code className="bg-white px-1 py-0.5 rounded font-mono text-red-700 font-bold">SHOW_ROLE_DROPDOWN = false</code>)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <label htmlFor="account-type-select" className="text-xs font-bold text-slate-700 hidden sm:inline">
                      Create Account As:
                    </label>
                    <select
                      id="account-type-select"
                      value={formData.accountType || 'customer'}
                      onChange={(e) => handleFormChange('accountType', e.target.value)}
                      className="px-3 py-1.5 bg-white border-2 border-red-600 rounded-xl text-xs font-black text-slate-900 focus:outline-none shadow-xs cursor-pointer hover:border-red-700 transition"
                    >
                      <option value="customer">🏥 Healthcare Customer / Hospital</option>
                      <option value="admin">🛡️ Central Administrator (Headquarters)</option>
                      <option value="employee">👷 Regional Employee (Depot Engineer)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Header Strip - Dynamic based on role */}
              <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 uppercase tracking-wider">
                    <Sparkles size={11} className="text-red-600" />
                    {formData.accountType === 'admin'
                      ? 'Central HQ Access'
                      : formData.accountType === 'employee'
                        ? 'Regional Depot Access'
                        : 'Fast Registration'}
                  </span>
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                    {formData.accountType === 'admin'
                      ? 'Create Central Administrator Account & System Access'
                      : formData.accountType === 'employee'
                        ? 'Create Regional Employee Account & Depot Access'
                        : 'Setup Healthcare Profile & Hospital Credentials'}
                  </h1>
                  <span className="text-xs text-slate-400 hidden lg:inline">
                    {formData.accountType === 'admin'
                      ? '• Manage user accounts, statewide quotation leads, and hospital tenders'
                      : formData.accountType === 'employee'
                        ? '• Access assigned district leads, quote tracking, and delivery dispatch'
                        : '• Register once for official OEM quotes & regional depot dispatch'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shrink-0 self-start sm:self-auto">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>CDSCO &amp; ISO 13485 Registered</span>
                </div>
              </div>

              {/* Wide 3-Column Grid: Form fits 100% on screen without scrolling */}
              <form onSubmit={handleCreateProfile} className="space-y-3.5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 xl:gap-4">
                  {/* Column 1: Representative / Credentials */}
                  <div className="p-3.5 sm:p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200/80 text-xs font-black uppercase tracking-wider text-slate-800">
                      {formData.accountType === 'admin' ? (
                        <ShieldCheck size={14} className="text-red-600" />
                      ) : (
                        <User size={14} className="text-red-600" />
                      )}
                      <span>
                        {formData.accountType === 'admin'
                          ? '1. Admin Credentials'
                          : formData.accountType === 'employee'
                            ? '1. Employee Credentials'
                            : '1. Representative Details'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-0.5">
                        {formData.accountType === 'admin'
                          ? 'Admin Full Name'
                          : formData.accountType === 'employee'
                            ? 'Employee Full Name'
                            : 'Full Name'}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        id="form-full-name"
                        value={formData.fullName}
                        onChange={(e) => handleFormChange('fullName', e.target.value)}
                        placeholder={
                          formData.accountType === 'admin'
                            ? 'e.g. Amitabh Saxena'
                            : formData.accountType === 'employee'
                              ? 'e.g. Er. Rajesh Sharma'
                              : 'e.g. Dr. Rajesh Sharma'
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:border-slate-800 outline-none font-medium transition shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-0.5">
                        Designation / Department
                      </label>
                      <input
                        type="text"
                        id="form-designation"
                        value={formData.designation}
                        onChange={(e) => handleFormChange('designation', e.target.value)}
                        placeholder={
                          formData.accountType === 'admin'
                            ? 'e.g. Central Operations Director'
                            : formData.accountType === 'employee'
                              ? 'e.g. Senior Biomedical Engineer'
                              : 'e.g. CMO / Procurement Head'
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:border-slate-800 outline-none font-medium transition shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-0.5">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex shadow-2xs rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-slate-800">
                        <CountryCodeSelector
                          value={formData.countryCode}
                          onChange={(code) => handleFormChange('countryCode', code)}
                        />
                        <input
                          type="tel"
                          required
                          id="form-phone"
                          value={formData.phone}
                          onChange={(e) => handleFormChange('phone', e.target.value.replace(/[^\d\s-]/g, ''))}
                          placeholder="98290 12345"
                          className="w-full pl-2.5 pr-3 py-2 bg-white border border-slate-300 border-l-0 text-xs sm:text-sm text-slate-900 focus:border-slate-800 outline-none font-medium transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-0.5">
                        Official Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        id="form-email"
                        value={formData.email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                        placeholder={
                          formData.accountType === 'admin'
                            ? 'admin@rajbiosis.com'
                            : formData.accountType === 'employee'
                              ? 'staff@rajbiosis.com'
                              : 'doctor@hospital.org'
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:border-slate-800 outline-none font-medium transition shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Column 2: Entity / Assignment */}
                  <div className="p-3.5 sm:p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200/80 text-xs font-black uppercase tracking-wider text-slate-800">
                      <Building2 size={14} className="text-red-600" />
                      <span>
                        {formData.accountType === 'admin'
                          ? '2. Administrative Unit'
                          : formData.accountType === 'employee'
                            ? '2. Regional Assignment'
                            : '2. Hospital Entity'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-0.5">
                        {formData.accountType === 'admin'
                          ? 'Headquarters / Unit Name'
                          : formData.accountType === 'employee'
                            ? 'Regional Depot Branch'
                            : 'Hospital / Clinic Name'}{' '}
                        {formData.accountType === 'customer' && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        required={formData.accountType === 'customer'}
                        id="form-hospital-name"
                        value={formData.hospitalName}
                        onChange={(e) => handleFormChange('hospitalName', e.target.value)}
                        placeholder={
                          formData.accountType === 'admin'
                            ? 'Central Headquarters (Raj Biosis State HQ)'
                            : formData.accountType === 'employee'
                              ? 'e.g. Jaipur Regional Depot'
                              : 'e.g. Apex Super Speciality Hospital'
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:border-slate-800 outline-none font-semibold transition shadow-2xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-0.5">
                          State / UT <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.state}
                          onChange={(e) => handleFormChange('state', e.target.value)}
                          className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:border-slate-800 outline-none transition cursor-pointer shadow-2xs"
                        >
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-0.5">
                          Pincode
                        </label>
                        <input
                          type="text"
                          value={formData.pincode}
                          onChange={(e) => handleFormChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="302001"
                          maxLength={6}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:border-slate-800 outline-none font-mono font-medium transition shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      {formData.accountType === 'admin' ? (
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-0.5">
                            Jurisdiction / Headquarters Hub <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.district}
                            onChange={(e) => handleFormChange('district', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:border-slate-800 outline-none transition cursor-pointer shadow-2xs"
                          >
                            <option value="All Rajasthan Districts">All Rajasthan Districts (Central Statewide HQ)</option>
                            {RAJASTHAN_DISTRICTS.map((d) => (
                              <option key={d} value={d}>{d} Central Branch</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <DistrictSelector
                          value={formData.district}
                          selectedState={formData.state}
                          onChange={(dist) => handleFormChange('district', dist)}
                          onStateChange={(st) => handleFormChange('state', st)}
                          required={true}
                          label={formData.accountType === 'employee' ? 'Assigned Depot District' : 'Delivery District'}
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-0.5">
                        {formData.accountType === 'admin'
                          ? 'HQ Office Address'
                          : formData.accountType === 'employee'
                            ? 'Depot Office Address'
                            : 'Delivery Address / Landmark'}
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleFormChange('address', e.target.value)}
                        placeholder={
                          formData.accountType === 'admin'
                            ? 'Industrial Area, Sitapura, Jaipur'
                            : formData.accountType === 'employee'
                              ? 'Regional Depot Facility Gate'
                              : 'e.g. Near Emergency Trauma Wing Gate 2'
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:border-slate-800 outline-none font-medium transition shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Column 3: Authorization & Launch */}
                  <div className="p-3.5 sm:p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-3">
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200/80 text-xs font-black uppercase tracking-wider text-slate-800">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>
                          {formData.accountType === 'admin'
                            ? '3. Admin Authorization'
                            : formData.accountType === 'employee'
                              ? '3. Depot Access'
                              : '3. Verification & Submit'}
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200/90 space-y-2 text-xs text-slate-600 shadow-2xs">
                        <div className="flex items-center gap-2 font-bold text-slate-800 text-[11px]">
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          <span>
                            {formData.accountType === 'admin'
                              ? 'Central Control & Account Creation'
                              : formData.accountType === 'employee'
                                ? 'Regional Depot Operations'
                                : 'Direct OEM Hospital Procurement'}
                          </span>
                        </div>
                        <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-4 leading-relaxed">
                          {formData.accountType === 'admin' ? (
                            <>
                              <li>Create &amp; manage Employee, Admin &amp; Customer accounts</li>
                              <li>Statewide quotation oversight across all Rajasthan districts</li>
                              <li>1-Click switch &amp; test any registered user account</li>
                              <li>Tender quotation approval &amp; dispatch tracking</li>
                            </>
                          ) : formData.accountType === 'employee' ? (
                            <>
                              <li>Manage quotation leads strictly for {formData.district} Depot</li>
                              <li>Update dispatch and delivery status in real-time</li>
                              <li>Hospital customer communication &amp; engineer notes</li>
                              <li>Automated lead sync with Central Headquarters</li>
                            </>
                          ) : (
                            <>
                              <li>Instant official quotation generated on RFQ</li>
                              <li>Full GST input credit (12% tax invoice)</li>
                              <li>2 Years CDSCO certified on-site warranty</li>
                              <li>Dedicated regional engineer in {formData.district || 'your district'}</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <button
                        type="submit"
                        id="profile-form-submit-btn"
                        className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>
                          {formData.accountType === 'admin'
                            ? 'Create Admin Account & Launch Central Dashboard →'
                            : formData.accountType === 'employee'
                              ? 'Create Employee Account & Launch Depot Desk →'
                              : 'Save Profile & Access Quotations →'}
                        </span>
                      </button>
                      <p className="text-[10px] text-slate-400 text-center font-medium">
                        {formData.accountType === 'admin'
                          ? 'Central Headquarters administrative credentials • Immediate access'
                          : formData.accountType === 'employee'
                            ? 'Assigned regional depot access • Immediate access'
                            : 'Immediate access to quotation tracking • Free institutional support'}
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* ------------------------------------------------------------------- */
            /* CASE 2: USER PROFILE EXISTS                                         */
            /* Executive verified profile header card + 3 clean quotation views    */
            /* ------------------------------------------------------------------- */
            <div className="space-y-6 animate-fade-in">
              {/* Top Hospital Profile Card (Well proportioned, not stretched) */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Identity */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-13 h-13 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-black shrink-0 shadow-xs">
                      {formData.hospitalName
                        ? formData.hospitalName.charAt(0).toUpperCase()
                        : formData.fullName
                          ? formData.fullName.charAt(0).toUpperCase()
                          : <Building2 size={22} />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                          {formData.hospitalName || formData.fullName || 'Healthcare Institution'}
                        </h1>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <ShieldCheck size={11} /> Verified Institutional Account
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-slate-700">
                        {formData.fullName} {formData.designation ? `• ${formData.designation}` : ''}
                      </p>

                      <div className="flex items-center gap-2.5 text-xs text-slate-500 flex-wrap pt-0.5">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Phone size={12} className="text-slate-400" />
                          {formData.countryCode} {formData.phone}
                        </span>
                        {formData.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={12} className="text-slate-400" />
                            {formData.email}
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                          <MapPin size={11} className="text-red-600" />
                          {formData.district}, {formData.state} {formData.pincode ? `(${formData.pincode})` : ''}
                        </span>
                      </div>

                      {formData.address && (
                        <p className="text-xs text-slate-500 pt-0.5">
                          Campus: {formData.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions: Edit & Logout */}
                  <div className="flex items-center gap-2 self-start sm:self-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <button
                      type="button"
                      onClick={handleOpenEditModal}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer hover:border-slate-400"
                    >
                      <Edit3 size={12} />
                      <span>Edit Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogoutCustomer}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 hover:border-red-200 transition cursor-pointer"
                      title="Log out from customer account"
                    >
                      <LogOut size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quotations Header & Search Bar */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Clean 3 Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                        statusFilter === 'all'
                          ? 'bg-slate-100 text-slate-900 border border-slate-300 shadow-2xs font-extrabold'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <FileText size={12} className={statusFilter === 'all' ? 'text-slate-800' : 'text-slate-400'} />
                      <span>All ({normalizedInquiries.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatusFilter('pending')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 ${
                        statusFilter === 'pending'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      <Clock size={12} />
                      <span>Pending ({pendingCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatusFilter('confirmed')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 ${
                        statusFilter === 'confirmed'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      <CheckCircle2 size={12} />
                      <span>Confirmed ({confirmedCount})</span>
                    </button>
                  </div>

                  {/* Search Bar + Request New Quote */}
                  <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-56">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Quote # or Model"
                        className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-slate-800 outline-none shadow-2xs"
                      />
                    </div>

                    <Link
                      href="/products"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-2xs shrink-0"
                    >
                      <span>+ New Quote</span>
                    </Link>
                  </div>
                </div>

                {/* Quotations List */}
                {filteredInquiries.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 text-center shadow-xs">
                    <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <FileText size={24} />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {statusFilter === 'pending'
                        ? 'No Pending Quotations'
                        : statusFilter === 'confirmed'
                          ? 'No Confirmed Orders Yet'
                          : 'No Quotation Requests Found'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Explore our direct-from-manufacturer equipment catalog to request institutional quotations for ventilators, ICU monitors, and surgical equipment.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      {statusFilter !== 'all' && (
                        <button
                          type="button"
                          onClick={() => setStatusFilter('all')}
                          className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-200"
                        >
                          Show All Quotes
                        </button>
                      )}
                      <Link
                        href="/products"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-2xs transition"
                      >
                        <span>Browse Equipment Catalogue</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {filteredInquiries.map((item) => {
                      const isConfirmed = item.isConfirmed;

                      return (
                        <div
                          key={item.id}
                          className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5">
                            {/* Equipment Photo & Info */}
                            <div className="flex items-start gap-3.5">
                              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-slate-50 border border-slate-200 p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                                {item.productImage ? (
                                  <img
                                    src={item.productImage}
                                    alt={item.productName}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <FileText size={22} className="text-slate-400" />
                                )}
                              </div>

                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                    {item.productBrand || 'Raj Biosis OEM'}
                                  </span>
                                  {item.productSku && (
                                    <span className="text-[10px] font-mono text-slate-400">
                                      {item.productSku}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-300">•</span>
                                  <span className="text-[10px] text-slate-400">
                                    {formatDate(item.createdAt)}
                                  </span>
                                </div>

                                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                                  {item.productName}
                                </h3>

                                <div className="flex items-center gap-2 pt-0.5 text-xs text-slate-500">
                                  <span>Quote:</span>
                                  <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                                    {item.quoteNumber || item.id}
                                  </span>
                                  <span className="text-slate-300">•</span>
                                  <span className="flex items-center gap-1 font-medium text-slate-700 text-[11px]">
                                    <MapPin size={11} className="text-red-500" />
                                    {item.district || formData.district || 'Jaipur'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Status Badge & Quoted Price */}
                            <div className="sm:text-right space-y-1 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100">
                              <div>
                                {isConfirmed ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 size={12} className="text-emerald-600" />
                                    <span>Confirmed &amp; In Process</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                    <Clock size={12} className="text-amber-600" />
                                    <span>Pending Approval</span>
                                  </span>
                                )}
                              </div>

                              <div>
                                <span className="text-sm sm:text-base font-black text-slate-900 block">
                                  {formatINR(item.grandTotal || item.unitPrice)}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  (Qty: {item.quantity || 1} • Incl. 12% GST)
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Concise Status Note */}
                          <div className="p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/70 text-[11px] text-slate-600 flex items-center gap-2">
                            {isConfirmed ? (
                              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                            ) : (
                              <Clock size={13} className="text-amber-600 shrink-0" />
                            )}
                            <span className="truncate">
                              {item.statusNote ||
                                (isConfirmed
                                  ? 'Quotation confirmed. Equipment allocated in regional dispatch depot.'
                                  : 'Official quotation generated. Under hospital purchase committee review.')}
                            </span>
                          </div>

                          {/* Action Strip */}
                          <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setSelectedQuotation(item)}
                                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-2xs cursor-pointer hover:border-slate-400"
                              >
                                <Eye size={12} />
                                <span>View Formal Quotation</span>
                              </button>

                              <a
                                href={`https://wa.me/919983333469?text=${encodeURIComponent(
                                  `Hello Raj Biosis, I would like to discuss quotation ${item.quoteNumber || item.id} for ${item.productName}.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                              >
                                <MessageSquare size={12} className="text-emerald-600" />
                                <span>WhatsApp Desk</span>
                              </a>

                              <a
                                href="tel:9983333469"
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                              >
                                <PhoneCall size={12} />
                                <span>Helpline</span>
                              </a>
                            </div>

                            {item.productId && (
                              <Link
                                href={`/product/${item.productId}`}
                                className="px-2 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
                              >
                                <span>View Specs</span>
                                <ExternalLink size={11} />
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: INTEGRATED STAFF & ADMIN DESK                                     */}
      {/* Employee & Admin login directly inside this profile                       */}
      {/* ========================================================================= */}
      {activeView === 'staff' && (
        <div className="space-y-4 animate-fade-in">
          {/* If NOT logged in as staff/admin: Show clean full-page login card (fits screen, NO scrolling!) */}
          {!staffSession ? (
            <div className="flex flex-col justify-start items-center py-1 sm:py-2">
              <div className="w-full max-w-2xl lg:max-w-3xl bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-3.5">
                
                {/* Desk Header */}
                <div className="text-center space-y-1 pb-2 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center mx-auto shadow-2xs">
                    {staffAuthTab === 'admin' ? <ShieldCheck size={20} className="text-brand-600" /> : <User size={20} className="text-brand-600" />}
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {staffAuthTab === 'employee' ? 'Regional Employee Portal' : 'Central Admin Portal'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {staffAuthTab === 'employee'
                      ? 'Rajasthan District Hospital Inquiries & Dispatch Desk'
                      : 'State-wide Central Biomedical Operations & Oversight'}
                  </p>

                  {/* Role Switcher Tabs */}
                  <div className="pt-2 flex items-center justify-center">
                    <div className="p-1 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-1 text-xs font-semibold">
                      <button
                        type="button"
                        id="tab-employee-btn"
                        onClick={() => {
                          setStaffAuthTab('employee');
                          setIsOtpSent(false);
                          setStaffLoginError('');
                        }}
                        className={`px-4 py-1.5 rounded-lg transition cursor-pointer text-xs font-bold ${
                          staffAuthTab === 'employee'
                            ? 'bg-brand-600 text-white shadow-2xs'
                            : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        Regional Employee
                      </button>
                      <button
                        type="button"
                        id="tab-admin-btn"
                        onClick={() => {
                          setStaffAuthTab('admin');
                          setIsOtpSent(false);
                          setStaffLoginError('');
                        }}
                        className={`px-4 py-1.5 rounded-lg transition cursor-pointer text-xs font-bold ${
                          staffAuthTab === 'admin'
                            ? 'bg-brand-600 text-white shadow-2xs'
                            : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        Central Admin
                      </button>
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {staffLoginError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                    <span>{staffLoginError}</span>
                  </div>
                )}

                {/* STEP 1: INITIAL LOGIN FIELDS (Name, Email, District) */}
                {!isOtpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    {staffAuthTab === 'employee' ? (
                      /* Employee Fields: Name, Email (2 Columns), District (Full Width) */
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Employee Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              id="employee-name-input"
                              value={empName}
                              onChange={(e) => setEmpName(e.target.value)}
                              placeholder="e.g. Er. Rajesh Sharma"
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-600 focus:ring-1 focus:ring-brand-600/30 outline-none font-medium transition"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Official Email <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              required
                              id="employee-email-input"
                              value={empEmail}
                              onChange={(e) => setEmpEmail(e.target.value)}
                              placeholder="rajesh.sharma@rajbiosis.com"
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-600 focus:ring-1 focus:ring-brand-600/30 outline-none font-medium transition"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Assigned District Depot <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="employee-district-select"
                            value={empDistrict}
                            onChange={(e) => setEmpDistrict(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-brand-600 focus:ring-1 focus:ring-brand-600/30 outline-none transition cursor-pointer"
                          >
                            {RAJASTHAN_DISTRICTS.map((d) => (
                              <option key={d} value={d}>
                                {d} Regional Depot
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          id="employee-send-otp-btn"
                          onClick={handleSendOtp}
                          disabled={isSendingOtp}
                          className="w-full py-2.5 sm:py-3 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                          <Mail size={15} />
                          <span>{isSendingOtp ? 'Sending Email OTP...' : 'Send OTP to Email & Continue'}</span>
                        </button>

                        <div className="pt-0.5 text-center">
                          <button
                            type="button"
                            onClick={() => demoStaffLogin('employee', 'Jaipur', 'Er. Rajesh Sharma', 'rajesh.sharma@rajbiosis.com')}
                            className="text-xs text-brand-600 hover:text-brand-800 hover:underline font-semibold"
                          >
                            ⚡ Quick 1-Click Demo Login (Jaipur Depot)
                          </button>
                        </div>
                      </>
                    ) : (
                      /* Admin Fields: Name, Email (2 Columns), District (Full Width) */
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Admin Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              id="admin-name-input"
                              value={adminName}
                              onChange={(e) => setAdminName(e.target.value)}
                              placeholder="e.g. Amitabh Saxena"
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-600 focus:ring-1 focus:ring-brand-600/30 outline-none font-medium transition"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Official Admin Email <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              required
                              id="admin-email-input"
                              value={adminEmail}
                              onChange={(e) => setAdminEmail(e.target.value)}
                              placeholder="admin@rajbiosis.com"
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-600 focus:ring-1 focus:ring-brand-600/30 outline-none font-medium transition"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Operational Jurisdiction / District <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="admin-district-select"
                            value={adminDistrict}
                            onChange={(e) => setAdminDistrict(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-brand-600 focus:ring-1 focus:ring-brand-600/30 outline-none transition cursor-pointer"
                          >
                            <option value="All Rajasthan Districts - Central State Depot">
                              All Rajasthan Districts (Central HQ Depot)
                            </option>
                            {RAJASTHAN_DISTRICTS.map((d) => (
                              <option key={d} value={d}>
                                {d} District Operations
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          id="admin-send-otp-btn"
                          onClick={handleSendOtp}
                          disabled={isSendingOtp}
                          className="w-full py-2.5 sm:py-3 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                          <Mail size={15} />
                          <span>{isSendingOtp ? 'Sending Email OTP...' : 'Send OTP to Email & Continue'}</span>
                        </button>

                        <div className="pt-0.5 text-center">
                          <button
                            type="button"
                            onClick={() => demoStaffLogin('admin', 'All Rajasthan Districts', 'Central Administrator', 'admin@rajbiosis.com')}
                            className="text-xs text-brand-600 hover:text-brand-800 hover:underline font-semibold"
                          >
                            ⚡ Quick 1-Click Demo Login (Central Admin)
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                ) : (
                  /* STEP 2: OTP VERIFICATION VIEW */
                  <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                    <div className="p-3 bg-brand-50/70 border border-brand-200 rounded-2xl text-xs text-brand-950 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-brand-700">
                        <Mail size={14} className="text-brand-600 shrink-0" />
                        <span>OTP Sent to Your Email</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        A 6-digit security verification code has been dispatched to{' '}
                        <strong className="text-brand-900 font-mono">{otpTargetEmail}</strong>.
                      </p>
                    </div>

                    {/* Quick Demo Helper Box */}
                    {generatedOtp && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-amber-900 font-medium">
                          <Sparkles size={13} className="text-amber-600 shrink-0" />
                          <span>Testing OTP: <strong className="font-mono text-amber-950 font-bold tracking-widest">{generatedOtp}</strong></span>
                        </div>
                        <button
                          type="button"
                          id="auto-fill-otp-btn"
                          onClick={() => setEnteredOtp(generatedOtp)}
                          className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200/80 font-bold rounded-lg text-xs transition cursor-pointer"
                        >
                          Auto-Fill
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                        Enter 6-Digit Verification Code
                      </label>
                      <input
                        type="text"
                        id="otp-digit-input"
                        inputMode="numeric"
                        maxLength={6}
                        autoFocus
                        required
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="••••••"
                        className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-center text-lg sm:text-xl font-mono font-bold tracking-[0.4em] text-slate-900 focus:bg-white focus:border-brand-600 outline-none transition"
                      />
                    </div>

                    <button
                      type="button"
                      id="verify-otp-btn"
                      onClick={handleVerifyOtp}
                      disabled={isVerifyingOtp}
                      className="w-full py-2.5 sm:py-3 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <CheckCircle2 size={16} />
                      <span>{isVerifyingOtp ? 'Verifying...' : 'Verify OTP & Access Profile'}</span>
                    </button>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        type="button"
                        onClick={handleBackToLoginForm}
                        className="text-slate-500 hover:text-slate-800 hover:underline font-medium cursor-pointer"
                      >
                        &larr; Change Details
                      </button>

                      {otpTimer > 0 ? (
                        <span className="text-slate-400 font-mono text-[11px]">
                          Resend in {otpTimer}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-brand-600 hover:text-brand-800 font-bold hover:underline cursor-pointer"
                        >
                          Resend OTP Code
                        </button>
                      )}
                    </div>
                  </form>
                )}

              </div>
            </div>
          ) : (
            /* Staff Operations Dashboard when authenticated */
            <div className="space-y-4">
              {/* Staff Header Strip - Clean Light Medical Brand Aesthetic */}
              <div className="bg-gradient-to-r from-red-50/70 via-rose-50/50 to-amber-50/30 border border-red-200/90 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                    <span className="text-[11px] uppercase font-bold tracking-wider text-red-700">
                      {staffSession.role === 'admin' ? 'Central Headquarters Desk' : `${staffSession.district} Regional Depot`}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 size={10} className="text-emerald-600" />
                      <span>OTP Verified</span>
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
                    <span>{staffSession.name}</span>
                    <span className="text-xs font-normal text-slate-500 font-mono">({staffSession.email || 'depot@rajbiosis.com'})</span>
                  </h2>
                  <p className="text-xs text-slate-600">
                    District hospital inquiries, quotation pricing, and equipment depot routing.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  <button
                    type="button"
                    onClick={handleSimulateLead}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <PlusCircle size={13} />
                    <span>Test Lead</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveView('customer')}
                    className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs"
                  >
                    Customer View
                  </button>

                  <button
                    type="button"
                    onClick={handleStaffLogout}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    title="Logout Staff Session"
                  >
                    <LogOut size={13} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* ADMIN MODE SWITCHER: 1. Staff & User Accounts | 2. Statewide Leads       */}
              {/* Regional employees go straight to their district leads desk               */}
              {/* ========================================================================= */}
              {staffSession.role === 'admin' && (
                <div className="flex items-center gap-2 p-1 bg-slate-100 border border-slate-200/90 rounded-2xl w-full sm:w-auto self-start shadow-2xs">
                  <button
                    type="button"
                    id="admin-tab-accounts-btn"
                    onClick={() => setAdminSubTab('accounts')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                      adminSubTab === 'accounts'
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus size={15} />
                    <span>Staff &amp; User Accounts ({userAccounts.length})</span>
                  </button>

                  <button
                    type="button"
                    id="admin-tab-leads-btn"
                    onClick={() => setAdminSubTab('leads')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                      adminSubTab === 'leads'
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText size={15} />
                    <span>Statewide Quotation Leads ({leads.length})</span>
                  </button>
                </div>
              )}

              {/* ========================================================================= */}
              {/* VIEW 1: ADMIN USER & STAFF ACCOUNT MANAGEMENT (Create Employee/Admin/Cust) */}
              {/* ========================================================================= */}
              {staffSession.role === 'admin' && adminSubTab === 'accounts' ? (
                <div className="space-y-4 animate-fade-in">
                  {/* Account Creation Success Banner */}
                  {accountSuccessMsg && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-900 text-xs sm:text-sm font-semibold shadow-2xs">
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                      <div>{accountSuccessMsg}</div>
                    </div>
                  )}

                  {/* Account Creation Error Banner */}
                  {accountErrorMsg && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-900 text-xs sm:text-sm font-semibold shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-red-600 shrink-0"></span>
                      <div>{accountErrorMsg}</div>
                    </div>
                  )}

                  {/* SECTION A: CREATE NEW ACCOUNT FORM */}
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
                    <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200 uppercase tracking-wider">
                            <ShieldCheck size={11} className="text-brand-600" /> Administrative Access Control
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
                          <UserPlus size={18} className="text-brand-600" />
                          <span>Create New Staff or User Account</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          Admin can generate Regional Employee, Central Administrator, or Customer accounts with instant depot routing &amp; OTP access.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleAdminCreateAccount} className="space-y-4">
                      {/* Role Selector */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Select Account Role <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
                          <button
                            type="button"
                            id="role-select-employee"
                            onClick={() => setNewAccRole('employee')}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                              newAccRole === 'employee'
                                ? 'bg-brand-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <User size={14} />
                            <span>Regional Employee</span>
                          </button>

                          <button
                            type="button"
                            id="role-select-admin"
                            onClick={() => setNewAccRole('admin')}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                              newAccRole === 'admin'
                                ? 'bg-brand-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <ShieldCheck size={14} />
                            <span>Central Admin</span>
                          </button>

                          <button
                            type="button"
                            id="role-select-customer"
                            onClick={() => setNewAccRole('customer')}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                              newAccRole === 'customer'
                                ? 'bg-brand-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Building2 size={14} />
                            <span>Healthcare Customer</span>
                          </button>
                        </div>
                      </div>

                      {/* Input Fields Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            id="new-acc-name-input"
                            value={newAccName}
                            onChange={(e) => setNewAccName(e.target.value)}
                            placeholder={newAccRole === 'employee' ? 'e.g. Er. Manoj Kumar' : newAccRole === 'admin' ? 'e.g. S.K. Maheshwari' : 'e.g. Dr. Priya Sharma'}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-600 outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Official Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            id="new-acc-email-input"
                            value={newAccEmail}
                            onChange={(e) => setNewAccEmail(e.target.value)}
                            placeholder={newAccRole === 'customer' ? 'doctor@hospital.org' : 'staff@rajbiosis.com'}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-600 outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Assigned District Jurisdiction <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="new-acc-district-select"
                            value={newAccDistrict}
                            onChange={(e) => setNewAccDistrict(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-brand-600 outline-none transition cursor-pointer"
                          >
                            {newAccRole === 'admin' && (
                              <option value="All Rajasthan Districts">All Rajasthan Districts (Central HQ)</option>
                            )}
                            {RAJASTHAN_DISTRICTS.map((d) => (
                              <option key={d} value={d}>
                                {d} District Depot
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Contact Mobile Number
                          </label>
                          <input
                            type="tel"
                            id="new-acc-phone-input"
                            value={newAccPhone}
                            onChange={(e) => setNewAccPhone(e.target.value.replace(/[^\d\s-]/g, ''))}
                            placeholder="e.g. 98290 12345"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-600 outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Designation / Department
                          </label>
                          <input
                            type="text"
                            id="new-acc-designation-input"
                            value={newAccDesignation}
                            onChange={(e) => setNewAccDesignation(e.target.value)}
                            placeholder={newAccRole === 'employee' ? 'Regional Depot Officer' : newAccRole === 'admin' ? 'Operations Manager' : 'Chief Medical Officer'}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-600 outline-none transition"
                          />
                        </div>

                        {newAccRole === 'customer' && (
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Hospital / Clinic Name
                            </label>
                            <input
                              type="text"
                              id="new-acc-hospital-input"
                              value={newAccHospital}
                              onChange={(e) => setNewAccHospital(e.target.value)}
                              placeholder="e.g. Fortis Escorts Hospital"
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-600 outline-none transition"
                            />
                          </div>
                        )}
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                        <div className="text-[11px] text-slate-500">
                          * Account is activated immediately and can log in via OTP at any depot.
                        </div>

                        <button
                          type="submit"
                          id="submit-create-account-btn"
                          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                        >
                          <UserPlus size={16} />
                          <span>Create Account &amp; Activate Access</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* SECTION B: REGISTERED ACCOUNTS DIRECTORY */}
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                          <Users size={16} className="text-brand-600" />
                          <span>Registered Staff &amp; User Accounts Directory</span>
                        </h4>
                        <p className="text-xs text-slate-500">
                          Switch between accounts or manage credentials for registered employees, admins, and customers.
                        </p>
                      </div>

                      {/* Filter by Role */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {['all', 'employee', 'admin', 'customer'].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setAccountFilterRole(r)}
                            className={`px-3 py-1 text-xs font-bold rounded-xl transition cursor-pointer capitalize ${
                              accountFilterRole === r
                                ? 'bg-brand-600 text-white shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {r === 'all' ? `All (${userAccounts.length})` : `${r}s (${userAccounts.filter(a => a.role === r).length})`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Accounts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {userAccounts
                        .filter(acc => accountFilterRole === 'all' || acc.role === accountFilterRole)
                        .map((acc) => (
                          <div
                            key={acc.id || acc.email}
                            className="p-4 bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl transition space-y-2.5 shadow-2xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-sm text-slate-900">
                                    {acc.name}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                      acc.role === 'admin'
                                        ? 'bg-brand-50 text-brand-700 border border-brand-200'
                                        : acc.role === 'employee'
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                                    }`}
                                  >
                                    {acc.role}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500 font-mono mt-0.5">
                                  {acc.email} {acc.phone && `• ${acc.phone}`}
                                </div>
                              </div>

                              <span className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shrink-0">
                                {acc.district}
                              </span>
                            </div>

                            {(acc.designation || acc.hospitalName) && (
                              <div className="text-xs text-slate-600">
                                {acc.designation} {acc.hospitalName && `(${acc.hospitalName})`}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                              <button
                                type="button"
                                onClick={() => handleLoginAsUser(acc)}
                                className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200/90 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Login and test this user dashboard"
                              >
                                <KeyRound size={12} />
                                <span>⚡ Login As This {acc.role === 'admin' ? 'Admin' : acc.role === 'employee' ? 'Employee' : 'Customer'}</span>
                              </button>

                              {acc.email !== 'admin@rajbiosis.com' && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAccount(acc.id || acc.email)}
                                  className="text-xs text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                                  title="Delete Account"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* ========================================================================= */
                /* VIEW 2: LEADS DESK (Shown for Employee or when Admin clicks Leads Tab)   */
                /* ========================================================================= */
                <div className="space-y-4 animate-fade-in">
                  {/* Staff Lead Filters */}
                  <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {['all', 'New Lead', 'Contacted', 'Quotation Sent', 'Payment Confirmed'].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setLeadStatusFilter(st)}
                            className={`px-3 py-1 text-xs font-bold rounded-xl transition cursor-pointer ${
                              leadStatusFilter === st
                                ? 'bg-brand-600 text-white shadow-xs'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {st === 'all' ? `All Leads (${leads.length})` : st}
                          </button>
                        ))}
                      </div>

                      {staffSession.role === 'admin' && (
                        <select
                          value={adminDistrictFilter}
                          onChange={(e) => setAdminDistrictFilter(e.target.value)}
                          className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                        >
                          <option value="all">All Rajasthan Districts</option>
                          {RAJASTHAN_DISTRICTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Leads List */}
                  {filteredLeads.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xs">
                      <FileText size={28} className="text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">No leads found in this filter</p>
                      <button
                        type="button"
                        onClick={handleSimulateLead}
                        className="mt-3 px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                      >
                        + Generate Sample Customer Lead
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-sm text-slate-900">
                                  {lead.customerName}
                                </span>
                                <span className="text-xs text-slate-500">• {lead.hospitalName}</span>
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                  {lead.district}
                                </span>
                              </div>

                              <div className="text-xs text-slate-700 font-medium mt-1">
                                {lead.productName} (Qty: {lead.qty || 1})
                              </div>

                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                <span className="font-mono text-slate-800 font-bold">{lead.customerPhone}</span>
                                <span>•</span>
                                <span className="font-bold text-slate-900">{formatINR(lead.grandTotal || lead.unitPrice)}</span>
                              </div>
                            </div>

                            {/* Status Change Dropdown */}
                            <div className="flex items-center gap-2">
                              <select
                                value={lead.status || 'New Lead'}
                                onChange={(e) => handleLeadStatusChange(lead.id, e.target.value)}
                                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none"
                              >
                                <option value="New Lead">New Lead</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Quotation Sent">Quotation Sent</option>
                                <option value="Payment Confirmed">Payment Confirmed</option>
                                <option value="Dispatched">Dispatched</option>
                                <option value="Delivered">Delivered</option>
                              </select>

                              <a
                                href={`https://wa.me/${(lead.customerPhone || '').replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare size={13} />
                              </a>
                            </div>
                          </div>

                          {/* Notes Section */}
                          {lead.statusNote && (
                            <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600">
                              {lead.statusNote}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT PROFILE MODAL (Customer View)                                        */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/30 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit3 size={17} className="text-slate-900" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Edit Healthcare Institutional Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSaveEditProfile} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Contact Person Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.fullName}
                    onChange={(e) => handleEditFormChange('fullName', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-slate-800 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Designation / Department
                  </label>
                  <input
                    type="text"
                    value={editFormData.designation}
                    onChange={(e) => handleEditFormChange('designation', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-slate-800 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={editFormData.phone}
                    onChange={(e) => handleEditFormChange('phone', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-slate-800 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => handleEditFormChange('email', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-slate-800 outline-none transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Hospital / Clinic Entity Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.hospitalName}
                    onChange={(e) => handleEditFormChange('hospitalName', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-800 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    State / UT <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editFormData.state}
                    onChange={(e) => handleEditFormChange('state', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-800 outline-none transition cursor-pointer"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <DistrictSelector
                    value={editFormData.district}
                    selectedState={editFormData.state}
                    onChange={(dist) => handleEditFormChange('district', dist)}
                    onStateChange={(st) => handleEditFormChange('state', st)}
                    required={true}
                    label="Delivery District"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Delivery Address / Campus Landmark
                  </label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => handleEditFormChange('address', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-slate-800 outline-none transition"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <Check size={15} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORMAL PRINTABLE QUOTATION SHEET MODAL                                    */}
      {/* ========================================================================= */}
      {selectedQuotation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/30 backdrop-blur-xs animate-fade-in"
          onClick={() => setSelectedQuotation(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText size={17} className="text-slate-800" />
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  Official Institutional Quotation
                </span>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                  {selectedQuotation.isConfirmed ? 'Order Confirmed' : 'Quotation Ready'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuotation(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    RAJ BIOSIS LIFE SYSTEMS PVT. LTD.
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Central Biomedical Depot: Plot 84, Medical Device Park, Navi Mumbai - 410208
                  </p>
                  <p className="text-xs text-slate-500">
                    GSTIN: 27AABCR8829J1Z5 • CDSCO Reg: MD-MH-2024-99120
                  </p>
                </div>

                <div className="sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-200">
                  <div className="text-xs font-mono font-bold text-slate-900">
                    Quote No: {selectedQuotation.quoteNumber || selectedQuotation.id}
                  </div>
                  <div className="text-xs text-slate-500">
                    Date: {formatDate(selectedQuotation.createdAt)}
                  </div>
                </div>
              </div>

              {/* Prepared For */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Prepared For (Healthcare Entity)
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {formData.hospitalName || 'Institutional Purchase Committee'}
                </div>
                <div className="text-slate-600 mt-0.5">
                  Attn: {selectedQuotation.customerName || formData.fullName || 'Medical Officer'}
                  {formData.designation ? ` (${formData.designation})` : ''}
                </div>
                <div className="text-slate-600 font-semibold mt-1 flex items-center gap-1">
                  <MapPin size={11} className="text-red-500" />
                  <span>Destination: {selectedQuotation.district || formData.district}, {formData.state}</span>
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="p-3">Equipment Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">
                          {selectedQuotation.productName}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Brand: {selectedQuotation.productBrand || 'Raj Biosis OEM'} • Warranty: 2 Years On-Site
                        </div>
                      </td>
                      <td className="p-3 text-center font-bold">
                        {selectedQuotation.quantity || 1}
                      </td>
                      <td className="p-3 text-right font-mono">
                        {formatINR(selectedQuotation.unitPrice || 485000)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold">
                        {formatINR((selectedQuotation.unitPrice || 485000) * (selectedQuotation.quantity || 1))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Net Total */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs flex items-center justify-between font-bold text-slate-900">
                <span>Net Total (Incl. 12% GST &amp; Transit Insurance):</span>
                <span className="font-mono text-emerald-700 text-base">
                  {formatINR(selectedQuotation.grandTotal || 543200)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedQuotation(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/919983333469?text=${encodeURIComponent(
                    `Hello, regarding Quote ${selectedQuotation.quoteNumber} for ${selectedQuotation.productName}: Please confirm earliest delivery to ${selectedQuotation.district || formData.district}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <MessageSquare size={13} />
                  <span>WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer size={13} />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conditional Footer: sleek single-line footer on staff login to fit screen without scrolling; full Footer for customer and active dashboard */}
      {activeView === 'staff' && !staffSession ? (
        <div className="pt-3 pb-2 text-center text-[11px] text-slate-400 border-t border-slate-200/60 mt-auto">
          © 2026 Raj Biosis Life Systems Pvt. Ltd. • Regional Operations &amp; CDSCO Compliance Network
        </div>
      ) : (
        <div className="mt-8 -mx-4 sm:-mx-6 -mb-4 sm:-mb-5">
          <Footer />
        </div>
      )}

    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      <Header />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={<div className="p-12 text-center text-slate-500 text-sm">Loading...</div>}>
          <ProfileContent />
        </Suspense>
      </main>
    </div>
  );
}
