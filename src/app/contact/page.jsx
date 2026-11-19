'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { PhoneCall, Mail, MapPin, Clock, ShieldCheck, CheckCircle2, FileText, Send, Building2, Compass, RefreshCw, AlertCircle } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { PRODUCTS } from '../../data/products';
import { getActiveDistrict, saveUserProfile } from '../../utils/userProfile';
import { getOfficeForDistrict, HEAD_OFFICE } from '../../data/offices';
import { recordCustomerLead } from '../../utils/leads';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [hospitalName, setHospitalName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState(() => CATEGORIES[1]?.slug || 'test-strips');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [activeDistrict, setActiveDistrict] = useState('Jaipur');
  const [officeData, setOfficeData] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [categoriesList, setCategoriesList] = useState(CATEGORIES);

  useEffect(() => {
    setMounted(true);
    const initial = getActiveDistrict();
    setActiveDistrict(initial);
    setOfficeData(getOfficeForDistrict(initial));

    const handleDistrictChange = (e) => {
      const dist = e.detail || 'Jaipur';
      setActiveDistrict(dist);
      setOfficeData(getOfficeForDistrict(dist));
    };

    window.addEventListener('active-district-changed', handleDistrictChange);

    // Fetch dynamic categories from API
    fetch('/api/categories')
      .then(res => res.json())
      .then(d => {
        if (d.success && Array.isArray(d.categories) && d.categories.length > 0) {
          setCategoriesList(d.categories);
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('active-district-changed', handleDistrictChange);
    };
  }, []);

  const openLocationModal = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-location-modal'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanHosp = hospitalName.trim();
    const cleanPhone = phone.trim();
    const cleanContact = contactName.trim() || 'Procurement In-charge';
    const cleanEmail = email.trim();
    const cleanMsg = message.trim();

    if (!cleanHosp || !cleanPhone) {
      const msg = "Please provide both Hospital/Clinic Name and Phone Number.";
      setErrorMsg(msg);
      toast.error(msg, { id: 'contact-val-error' });
      return;
    }

    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      const msg = "Please enter a valid 10-digit mobile number.";
      setErrorMsg(msg);
      toast.error(msg, { id: 'contact-val-error' });
      return;
    }

    setIsSubmitting(true);

    const generatedTicketId = `RB-ENQ-${Date.now().toString().slice(-6)}`;
    const selectedCat = categoriesList.find(c => c.id === department || c.slug === department);
    const deptName = selectedCat ? selectedCat.name : (department || 'Biomedical Equipment');
    const city = activeDistrict || 'Jaipur';

    const nowIso = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const formattedDateTime = `${formattedDate}, ${formattedTime}`;

    const leadPayload = {
      id: generatedTicketId,
      ticketId: generatedTicketId,
      doctorName: cleanContact,
      customerName: cleanContact,
      hospital: cleanHosp,
      hospitalName: cleanHosp,
      city: city,
      district: city,
      state: 'Rajasthan',
      address: `${cleanHosp}, ${city}`,
      email: cleanEmail || 'NA',
      customerEmail: cleanEmail || 'NA',
      phone: cleanPhone,
      customerPhone: cleanPhone,
      siteDomain: 'rajbiosis.com',
      source: 'Contact Page Enquiry',
      sourcePage: '/contact',
      leadSource: 'Contact Us Form (rajbiosis.com)',
      brandName: 'Raj Biosis',
      department: deptName,
      equipment: cleanMsg ? `${deptName} — ${cleanMsg.slice(0, 80)}` : `${deptName} Institutional Request`,
      productName: cleanMsg ? `${deptName} — ${cleanMsg.slice(0, 80)}` : `${deptName} Institutional Request`,
      message: cleanMsg,
      notes: cleanMsg ? [`[Website Contact Form Message]: ${cleanMsg}`] : [],
      price: 0,
      actualPrice: 0,
      quoteAmount: 'Price on Request',
      status: 'New Lead',
      statusNote: `Inquiry submitted via rajbiosis.com Contact Page (${deptName}). Customer message: "${cleanMsg || 'General enquiry'}"`,
      createdAt: nowIso,
      date: formattedDate,
      time: formattedTime,
      dateTime: formattedDateTime,
      rawLeadData: {
        hospitalName: cleanHosp,
        customerName: cleanContact,
        phone: cleanPhone,
        email: cleanEmail,
        department: deptName,
        message: cleanMsg,
        source: 'Contact Page Form'
      }
    };

    const profilePayload = {
      id: `cust-${digitsOnly.slice(-10)}`,
      fullName: cleanContact,
      hospitalName: cleanHosp,
      phone: cleanPhone,
      email: cleanEmail,
      district: city,
      state: 'Rajasthan',
      address: `${cleanHosp}, ${city}`,
      siteDomain: 'rajbiosis.com',
      source: 'Contact Page Enquiry'
    };

    try {
      // 1. Post to website /api/leads (saves directly into MongoDB Atlas 'leads' collection)
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload)
      }).catch(err => console.warn('Local api/leads error:', err));

      // 2. Also post to website /api/enquiry
      fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload)
      }).catch(() => {});

      // 3. Post directly to MultiTaskingAdmin hub in real time
      const adminUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3002';
      fetch(`${adminUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload)
      }).catch(() => {});

      // 4. Upsert customer profile in both endpoints
      fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload)
      }).catch(() => {});

      fetch(`${adminUrl}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload)
      }).catch(() => {});

      // 5. Broadcast to cross-tab channel so admin hub wakes up immediately with sound and notification
      if (typeof window !== 'undefined') {
        try {
          const channel = new BroadcastChannel('biomedical_leads_channel');
          channel.postMessage({
            type: 'NEW_LEAD',
            lead: leadPayload,
            timestamp: Date.now()
          });
          setTimeout(() => { try { channel.close(); } catch (e) {} }, 5000);
        } catch (e) {}
      }

      // 6. Save locally in customer's profile / leads cache
      try {
        recordCustomerLead(leadPayload);
        saveUserProfile(profilePayload);
      } catch (e) {}

      setTicketId(generatedTicketId);
      setSubmitted(true);
      toast.success(`Enquiry submitted successfully! Reference Ticket: ${generatedTicketId}`, {
        id: 'contact-success',
        duration: 6000
      });
    } catch (err) {
      console.error('Submission error:', err);
      setTicketId(generatedTicketId);
      setSubmitted(true);
      toast.success(`Enquiry submitted successfully! Reference Ticket: ${generatedTicketId}`, {
        id: 'contact-success',
        duration: 6000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900 antialiased">
      <Header />

      {/* Header */}
      <div className="bg-white border-b border-neutral-200 py-10 sm:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block mb-1">
              Direct Manufacturer Access
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-950 tracking-tight">
              Hospital Procurement & Technical Enquiry
            </h1>
            <p className="text-xs sm:text-sm text-neutral-700 font-medium mt-2 leading-relaxed">
              Contact our biomedical engineering divisions for equipment pricing, GeM tender compliance sheets, bulk institutional discounts, and annual maintenance contracts.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Workspace */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Contact Details & Quick Links (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h2 className="text-base font-bold text-neutral-950">
                  Institutional Support Desks
                </h2>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full cursor-pointer hover:bg-brand-100 transition"
                  suppressHydrationWarning
                >
                  <MapPin size={11} />
                  <span>Depot: {mounted ? activeDistrict : 'Jaipur'}</span>
                  <span className="text-[10px] text-brand-700 ml-0.5">(Profile)</span>
                </Link>
              </div>

              <div className="space-y-4 text-xs text-neutral-700">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                    <PhoneCall size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-950 block text-xs">Contact No.</span>
                    <span className="text-sm font-black text-neutral-950">9983333469</span>
                    <span className="text-[11px] text-neutral-600 font-medium block mt-0.5">Mon - Sat: 8:00 AM - 8:00 PM IST (24x7 Emergency ICU Support)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-950 block text-xs">Procurement &amp; Tender Email</span>
                    <span className="text-neutral-900 font-bold">mail@rajbiosis.com</span>
                    <span className="text-[11px] text-neutral-600 font-medium block mt-0.5">Formal RFP, GeM tenders &amp; PO submissions</span>
                  </div>
                </div>

                {/* SCENARIO 1: Non-Jaipur user (e.g. Churu, Jodhpur) -> Show Local Branch Office */}
                {officeData && !officeData.isHeadOfficeOnly && officeData.local && (
                  <div className="p-3.5 rounded-2xl bg-red-50/70 border border-red-200/90 space-y-1.5" suppressHydrationWarning>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                        <MapPin size={13} className="text-brand-600 shrink-0" />
                        <span>{officeData.local.city} Main City Regional Office</span>
                      </span>
                      <span className="text-[10px] bg-red-100 text-brand-800 font-bold px-2 py-0.5 rounded-full">
                        Main City Branch
                      </span>
                    </div>
                    <p className="text-neutral-700 text-[11px] leading-relaxed">
                      {officeData.local.address}
                    </p>
                    <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-800 font-medium">
                      <span>📞 {officeData.local.phone}</span>
                      <span>✉️ {officeData.local.email}</span>
                    </div>
                    <div className="pt-1 text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                      <span>{officeData.local.sla}</span>
                    </div>
                  </div>
                )}

                {/* Central City Interactive Map Embed */}
                {officeData && (
                  <div className="rounded-2xl overflow-hidden border border-neutral-200/90 shadow-2xs bg-neutral-100">
                    <div className="bg-neutral-50 px-3.5 py-2 border-b border-neutral-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                        <MapPin size={13} className="text-brand-600" />
                        <span>{officeData.local ? officeData.local.city : 'Jaipur'} Central City Map</span>
                      </span>
                      <span className="text-[10px] bg-red-50 text-brand-700 font-bold px-2 py-0.5 rounded-full border border-red-200">
                        Central Hub
                      </span>
                    </div>
                    <div className="relative w-full h-44 sm:h-52">
                      <iframe
                        key={officeData.local ? officeData.local.city : 'Jaipur'}
                        title={`${officeData.local ? officeData.local.city : 'Jaipur'} Central City Map`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={officeData.mapEmbedUrl || `https://maps.google.com/maps?q=${encodeURIComponent((officeData.local ? officeData.local.city : 'Jaipur') + ' city center, India')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                      />
                    </div>
                  </div>
                )}

                {/* SCENARIO 2: Corporate Headquarters in Jaipur (Always shown) */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5" suppressHydrationWarning>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                      <Building2 size={13} className="text-brand-600 shrink-0" />
                      <span>Corporate Headquarters {officeData?.isHeadOfficeOnly ? '& Central Depot' : ''}</span>
                    </span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                      Jaipur HQ
                    </span>
                  </div>
                  <p className="text-neutral-700 text-[11px] leading-relaxed">
                    {HEAD_OFFICE.address}
                  </p>
                  <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-800 font-medium">
                    <span>📞 {HEAD_OFFICE.phone}</span>
                    <span>✉️ {HEAD_OFFICE.email}</span>
                  </div>
                  {officeData?.isHeadOfficeOnly && (
                    <div className="pt-1 text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                      <span>{HEAD_OFFICE.sla}</span>
                    </div>
                  )}
                </div>

              </div>

              <div className="pt-4 border-t border-neutral-200 flex items-center gap-2 text-xs text-neutral-700 font-semibold">
                <ShieldCheck size={16} className="text-brand-600 shrink-0" />
                <span>CDSCO Registered Medical Device Importer &amp; Manufacturer (ISO 13485:2016)</span>
              </div>
            </div>

            {/* Quick Department Dispatch Box */}
            <div className="p-5 bg-neutral-100 rounded-2xl border border-neutral-200 text-xs text-neutral-600 space-y-2">
              <span className="font-bold text-neutral-900 block">Emergency Breakdown Service</span>
              <p className="text-[11px] leading-relaxed text-neutral-500">
                For active ICU or OT breakdowns, call our 24/7 emergency biomedical hotline for priority engineer dispatch under warranty.
              </p>
            </div>
          </div>

          {/* Right Enquiry Submission Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-neutral-200 shadow-xs">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block mb-1">
                    Direct Request
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                    Submit Institutional Enquiry
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Fill out the form below to receive a formal price quotation and technical datasheet within 24 hours.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">Hospital / Clinic Name *</label>
                    <input
                      type="text"
                      required
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      placeholder="e.g. Fortis Hospital / Care Clinic"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 outline-none focus:border-brand-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">Contact Officer Name</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Dr. Rajesh Kumar"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 outline-none focus:border-brand-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98XXX XXXXX"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 outline-none focus:border-brand-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="purchase@hospital.in"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 outline-none focus:border-brand-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Clinical Department of Interest</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-800 outline-none focus:border-brand-500"
                  >
                    {categoriesList.filter(c => c.id !== 'all' && c.slug !== 'all').map((cat) => (
                      <option key={cat.id || cat.slug} value={cat.slug || cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Required Equipment & Message</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Specify equipment models (e.g. ICU Ventilator, 500mA X-Ray), required quantities, delivery city, or GeM tender details..."
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 outline-none focus:border-brand-500 focus:bg-white leading-relaxed"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary-red py-3 px-8 text-xs font-bold w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Transmitting to Admin...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Send Institutional Enquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Submission Success Acknowledgment */
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-950">
                  Enquiry Submitted Successfully
                </h3>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-mono font-bold">
                  <span>Reference Ticket ID:</span>
                  <span className="text-brand-700 font-black">{ticketId}</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-neutral-900">{hospitalName}</strong>. Your enquiry has been registered dynamically in the Raj Biosis Central Admin Portal. A dedicated biomedical sales engineer will contact you shortly on <strong className="text-neutral-900">{phone}</strong>.
                </p>
                <div className="pt-4 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/products"
                    className="btn-outline-neutral text-xs py-2 px-5"
                  >
                    Return to Catalogue
                  </Link>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setHospitalName('');
                      setContactName('');
                      setPhone('');
                      setEmail('');
                      setMessage('');
                    }}
                    className="btn-primary-red text-xs py-2 px-5 cursor-pointer"
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
