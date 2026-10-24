'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProductCard from '../../../components/ProductCard';
import { PRODUCTS } from '../../../data/products';
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Download,
  PhoneCall,
  Package,
  Wrench,
  Check,
  Truck,
  MapPin,
  ShoppingCart,
  Tag
} from 'lucide-react';
import { getActiveDistrict, USER_PROFILE_EVENT } from '../../../utils/userProfile';
import { addToCart, openCartDrawer } from '../../../utils/cart';

export default function ProductDetailClient({ productId }) {
  const product = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];
  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'package' | 'warranty'
  const [brochureDownloaded, setBrochureDownloaded] = useState(false);
  const [district, setDistrict] = useState('Jaipur');

  useEffect(() => {
    setDistrict(getActiveDistrict());

    const handleProfileUpdate = (e) => {
      if (e && e.detail && e.detail.district) {
        setDistrict(e.detail.district);
      } else {
        setDistrict(getActiveDistrict());
      }
    };

    window.addEventListener(USER_PROFILE_EVENT, handleProfileUpdate);
    return () => window.removeEventListener(USER_PROFILE_EVENT, handleProfileUpdate);
  }, []);

  // Format currency
  const formatINR = (val) => {
    if (!val) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleOpenQuoteModal = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-product-enquiry', { detail: product })
      );
    }
  };

  const handleDownloadBrochure = () => {
    setBrochureDownloaded(true);
    setTimeout(() => setBrochureDownloaded(false), 3000);
  };

  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
    openCartDrawer();
  };

  const gstRate = product.category === 'radiology-imaging' ? '18%' : '12%';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      <Header />

      {/* Clean Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200 py-3">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <Link href="/" className="hover:text-red-600 transition flex items-center gap-1 font-medium">
              <ArrowLeft size={13} /> Home
            </Link>
            <span>/</span>
            <Link href={`/category/${product.category}`} className="hover:text-red-600 capitalize">
              {product.category?.replace(/-/g, ' ')}
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-none">
              {product.name}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>CDSCO & ISO 13485 Registered</span>
          </div>
        </div>
      </div>

      {/* Main Product Showcase Section */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 w-full space-y-10">
        {/* Top Product Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          {/* Left Media (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50/70 border border-slate-200 p-6 flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
              <span className="absolute top-3 left-3 bg-white text-slate-700 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                SKU: {product.sku}
              </span>
              {product.isNegotiable && (
                <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-2xs flex items-center gap-1">
                  <Tag size={11} /> Price Negotiable
                </span>
              )}
            </div>

            {/* Quick Badges Strip */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-slate-600">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                Direct OEM Supply
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                NABL Calibrated
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                Pan-India SLA
              </div>
            </div>
          </div>

          {/* Right Core Details & Actions (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
            <div>
              {/* Category & Manufacturer */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                  {product.category?.replace(/-/g, ' ')}
                </span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-xs font-semibold text-slate-600">
                  {product.brand || 'Raj Biosis Life Systems'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Pricing Box (No numerical rates, pure B2B) */}
              <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Institutional Pricing
                  </span>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Price Available on Request
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-lg border border-emerald-200">
                    Direct OEM & Tender Rates
                  </span>
                  <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center justify-end gap-1">
                    <Truck size={12} className="text-brand-600" />
                    <span>Free Delivery & Onsite Setup in <strong className="text-slate-800">{district}</strong></span>
                  </div>
                </div>
              </div>

              {/* Negotiable Target Price Alert */}
              {product.isNegotiable && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
                  <Tag size={16} className="text-amber-600 shrink-0" />
                  <span>
                    <strong>Price Negotiable Equipment:</strong> You can add this item to your Cart and enter your <strong>Target / Expected Unit Price (₹)</strong> to submit for institutional review.
                  </span>
                </div>
              )}

              {/* Description */}
              <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.shortDesc}
              </p>

              {/* Stock / Availability Status with District */}
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50/80 border border-emerald-200 px-3 py-1.5 rounded-xl w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>In Stock &bull; Dispatches to {district} within 24-48 Hours with NABL Engineer Commissioning</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="py-3 px-5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {justAdded ? <Check size={16} className="text-emerald-400" /> : <ShoppingCart size={16} />}
                <span>{justAdded ? 'Added to Cart!' : 'Add to Cart / RFQ'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenQuoteModal}
                className="btn-primary-red py-3 px-6 text-xs sm:text-sm flex-1 sm:flex-none justify-center cursor-pointer shadow-sm active:scale-95"
              >
                <FileText size={16} />
                <span>Get Quote for {district}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadBrochure}
                className="btn-outline-neutral py-3 px-5 text-xs sm:text-sm flex-1 sm:flex-none justify-center cursor-pointer"
              >
                <Download size={16} />
                <span>{brochureDownloaded ? 'Datasheet Ready!' : 'Product Datasheet'}</span>
              </button>

              <a
                href="tel:9983333469"
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition flex items-center gap-2 text-xs font-semibold"
                title="Call 9983333469 for technical support"
              >
                <PhoneCall size={16} className="text-red-600" />
                <span className="hidden sm:inline">9983333469</span>
              </a>
            </div>
          </div>
        </div>

        {/* Structured Technical Specifications & Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {/* Tabs Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-4 mb-6">
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'specs'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab('package')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'package'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Package Contents
            </button>
            <button
              onClick={() => setActiveTab('warranty')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'warranty'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Warranty & Service SLA
            </button>
          </div>

          {/* Tab 1: Clean Specifications Table */}
          {activeTab === 'specs' && product.specs && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
              {Object.entries(product.specs).map(([label, val], idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-1 sm:grid-cols-3 py-3 px-4 text-xs sm:text-sm ${
                    idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
                  }`}
                >
                  <span className="font-semibold text-slate-500 sm:col-span-1">{label}</span>
                  <span className="font-bold text-slate-900 sm:col-span-2 mt-1 sm:mt-0 font-mono text-xs">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Standard Box Inclusions */}
          {activeTab === 'package' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block">
                  Standard Factory Inclusions for {product.name}:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 pt-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span>Main System Console with Integrated Power Supply</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span>Adult & Pediatric Patient Accessories Kit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span>Hospital Grade Medical Power Cable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span>Factory Metrology Calibration Certificate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span>Original CDSCO Quality Verification Document</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span>Comprehensive Technical Service & Operator Manual</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Warranty & Service SLA */}
          {activeTab === 'warranty' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-900 text-sm block mb-1">Standard Warranty</span>
                <p className="text-slate-600 leading-relaxed">
                  {product.warranty ||
                    '2 Years Comprehensive On-site Warranty covering all electronic control boards, sensors, and power assemblies.'}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-900 text-sm block mb-1">Electrical Safety & Testing</span>
                <p className="text-slate-600 leading-relaxed">
                  Electrical safety inspection (IEC 60601-1 / IEC 62353) and NABL-traceable calibration report issued before factory dispatch.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-900 text-sm block mb-1">AMC / Spare Parts Commitment</span>
                <p className="text-slate-600 leading-relaxed">
                  Guaranteed spare parts availability for 10 years with scheduled preventive maintenance visits by certified biomedical engineers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Similar / Related Equipment Section */}
        {relatedProducts.length > 0 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Related Biomedical Equipment
                </h3>
                <p className="text-xs text-slate-500">
                  Other products commonly procured in this clinical category
                </p>
              </div>
              <Link
                href={`/category/${product.category}`}
                className="text-xs font-bold text-red-600 hover:text-red-700"
              >
                Browse Category &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((relProd) => (
                <ProductCard key={relProd.id} product={relProd} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
