'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { PhoneCall, Mail, MapPin, Clock, ShieldCheck, CheckCircle2, FileText, Send } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { PRODUCTS } from '../../data/products';

export default function ContactPage() {
  const [hospitalName, setHospitalName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('icu-critical-care');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hospitalName || !phone) {
      alert("Please provide the Hospital Name and Phone Number.");
      return;
    }
    setTicketId(`RB-ENQ-${Math.floor(100000 + Math.random() * 900000)}`);
    setSubmitted(true);
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
              <h2 className="text-base font-bold text-neutral-950">
                Institutional Support Desks
              </h2>

              <div className="space-y-4 text-xs text-neutral-700">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                    <PhoneCall size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-950 block text-xs">National Toll-Free Helpline</span>
                    <span className="text-sm font-black text-neutral-950">9983333469 </span>
                    <span className="text-[11px] text-neutral-600 font-medium block mt-0.5">Mon - Sat: 8:00 AM - 8:00 PM IST</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-950 block text-xs">Procurement Email</span>
                    <span className="text-neutral-900 font-bold">institutional@rajbiosis.com</span>
                    <span className="text-[11px] text-neutral-600 font-medium block mt-0.5">Formal RFP, GeM tenders & PO submissions</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-950 block text-xs">Headquarters & Central Warehouse</span>
                    <span className="text-neutral-800 font-medium">
                      Raj Biosis Pvt. Ltd.<br />
                      Biomedical Park, Phase II, Electronic City,<br />
                      Bengaluru, Karnataka - 560100, India
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex items-center gap-2 text-xs text-neutral-700 font-semibold">
                <ShieldCheck size={16} className="text-brand-600 shrink-0" />
                <span>CDSCO Registered Medical Device Importer & Manufacturer</span>
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
                    {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
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

                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn-primary-red py-3 px-8 text-xs font-bold w-full sm:w-auto"
                  >
                    <Send size={14} />
                    <span>Send Institutional Enquiry</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Submission Success Acknowledgment */
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Enquiry Submitted Successfully
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="font-semibold text-neutral-800">{hospitalName}</span>. Your enquiry reference number is <span className="font-mono font-bold text-brand-600">{ticketId}</span>. A Raj Biosis biomedical sales engineer will contact you within 24 hours.
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <Link
                    href="/products"
                    className="btn-outline-neutral text-xs py-2 px-5"
                  >
                    Return to Catalogue
                  </Link>
                  <button
                    onClick={() => { setSubmitted(false); setHospitalName(''); setPhone(''); }}
                    className="btn-primary-red text-xs py-2 px-5"
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
