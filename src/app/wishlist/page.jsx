'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  FileText,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Tag,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Share2,
  Check,
  Layers,
  PhoneCall
} from 'lucide-react';
import {
  getWishlist,
  removeFromWishlist,
  clearWishlist,
  WISHLIST_UPDATED_EVENT
} from '../../utils/wishlist';
import { addToCart, openCartDrawer } from '../../utils/cart';
import { getActiveDistrict, USER_PROFILE_EVENT, requireCustomerAuth } from '../../utils/userProfile';
import { CATEGORIES } from '../../data/categories';

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [district, setDistrict] = useState('Jaipur');
  const [justAddedMap, setJustAddedMap] = useState({});
  const [copiedShare, setCopiedShare] = useState(false);
  const [activeOffer, setActiveOffer] = useState(null);

  useEffect(() => {
    const checkOffers = async () => {
      try {
        const prof = typeof window !== 'undefined' ? getUserProfile() : null;
        const ph = (prof?.phone || '').replace(/\D/g, '').slice(-10);
        const url = ph ? `/api/cart-wishlist?phone=${encodeURIComponent(ph)}&checkOffers=true` : `/api/cart-wishlist?checkOffers=true`;
        const res = await fetch(url).catch(() => null);
        if (res && res.ok) {
          const data = await res.json().catch(() => null);
          if (data?.success && data.activeOffer) {
            const off = data.activeOffer;
            if (!off.validTill || new Date(off.validTill) >= new Date()) {
              setActiveOffer(off);
            }
          }
        }
      } catch (e) {}
    };
    checkOffers();
  }, []);

  const isOfferEligible = (prod, off) => {
    if (!off || !off.active) return false;
    if (off.validTill && new Date(off.validTill) < new Date()) return false;
    if (off.productScope === 'all_catalog') return true;
    if (Array.isArray(off.selectedProductIds) && off.selectedProductIds.length > 0) {
      return off.selectedProductIds.includes(prod.id) || off.selectedProductIds.includes(prod.sku);
    }
    return true;
  };

  useEffect(() => {
    setMounted(true);
    setDistrict(getActiveDistrict());

    const syncList = () => {
      setItems(getWishlist());
    };
    syncList();

    const handleProfileUpdate = (e) => {
      if (e && e.detail && e.detail.district) {
        setDistrict(e.detail.district);
      } else {
        setDistrict(getActiveDistrict());
      }
    };

    const handleDistrictChange = (e) => {
      if (e && e.detail) {
        setDistrict(e.detail);
      }
    };

    window.addEventListener(WISHLIST_UPDATED_EVENT, syncList);
    window.addEventListener(USER_PROFILE_EVENT, handleProfileUpdate);
    window.addEventListener('active-district-changed', handleDistrictChange);

    return () => {
      window.removeEventListener(WISHLIST_UPDATED_EVENT, syncList);
      window.removeEventListener(USER_PROFILE_EVENT, handleProfileUpdate);
      window.removeEventListener('active-district-changed', handleDistrictChange);
    };
  }, []);

  const handleRemove = (productId) => {
    removeFromWishlist(productId);
  };

  const handleClearAll = () => {
    if (items.length === 0) return;
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to clear your entire equipment wishlist?')) {
      clearWishlist();
    }
  };

  const handleAddToCart = (product) => {
    if (!requireCustomerAuth('cart', product, 1)) {
      return;
    }
    addToCart(product, 1);
    setJustAddedMap(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setJustAddedMap(prev => ({ ...prev, [product.id]: false }));
    }, 2000);
    openCartDrawer();
  };

  const handleAddAllToCart = () => {
    if (items.length === 0) return;
    if (!requireCustomerAuth('cart', items[0], 1)) {
      return;
    }
    items.forEach(item => {
      addToCart(item, 1);
    });
    openCartDrawer();
  };

  const handleOpenQuote = (product) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-product-enquiry', { detail: product })
      );
    }
  };

  const handleShareWishlist = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  // Format currency
  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-brand-600 selection:text-white">
      <Header />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-red-600 transition">Home</Link>
          <ChevronRight size={13} className="text-slate-400" />
          <Link href="/products" className="hover:text-red-600 transition">Products</Link>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="text-slate-900 font-bold">Equipment Wishlist</span>
        </nav>

        {/* Page Header Bar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200/80">
              <Heart size={13} className="fill-red-600 text-red-600" />
              <span>Institutional Shortlist &bull; Hospital Procurement</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span>Saved Equipment Wishlist</span>
              {mounted && (
                <span className="text-xs sm:text-sm font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                  {items.length} {items.length === 1 ? 'Item' : 'Items'}
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Review your shortlisted biomedical equipment, compare specifications with your surgical team, and generate official direct-from-factory GST quotations.
            </p>
          </div>

          {/* District Depot & Top Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
            {/* Localized District Fast Dispatch Pill */}
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition"
              title="Click to change your delivery district"
            >
              <Truck size={14} className="text-brand-600" />
              <span>Dispatch Depot:</span>
              <strong className="text-brand-700 font-bold" suppressHydrationWarning>{mounted ? district : 'Jaipur'}</strong>
              <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                Change
              </span>
            </Link>

            {/* Header Action Buttons */}
            {mounted && items.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleShareWishlist}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Copy shareable link"
                >
                  {copiedShare ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                  <span>{copiedShare ? 'Link Copied!' : 'Share Shortlist'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddAllToCart}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <ShoppingCart size={14} />
                  <span>Move All to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearAll}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                  title="Clear Wishlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        {mounted && items.length > 0 ? (
          <div className="space-y-6">
            {/* Active Management Offer Banner */}
            {activeOffer && (
              <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 rounded-2xl shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                      {activeOffer.title || 'Management Special Offer'}
                    </span>
                    <p className="text-xs text-emerald-800">
                      {activeOffer.type === 'percentage' ? `${activeOffer.value}% OFF` : activeOffer.type === 'flat' ? `₹${Number(activeOffer.value).toLocaleString('en-IN')} OFF` : 'COMPLIMENTARY PRIVILEGE'} applied to eligible wishlist products!
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white font-mono shrink-0 shadow-2xs">
                  Active Offer
                </span>
              </div>
            )}
            {/* Equipment Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {items.map((product) => {
                const isJustAdded = justAddedMap[product.id];

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-red-300 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      {/* Image Area with Quick Remove & Negotiable Badges */}
                      <div className="relative aspect-[16/10] bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-center overflow-hidden">
                        <Link href={`/product/${product.id}`} className="w-full h-full flex items-center justify-center">
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>

                        {/* Brand Badge */}
                        {product.brand && (
                          <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                            {product.brand}
                          </div>
                        )}

                        {/* Top-Right Remove from Wishlist Button */}
                        <button
                          type="button"
                          onClick={() => handleRemove(product.id)}
                          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/95 hover:bg-red-50 text-red-600 border border-red-200 shadow-2xs flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                          title="Remove from Wishlist"
                        >
                          <Trash2 size={13} />
                        </button>

                        {/* SKU Chip */}
                        <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                          {product.sku}
                        </div>

                        {/* Negotiable Badge */}
                        {product.isNegotiable && (
                          <div className="absolute bottom-2.5 right-2.5 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs flex items-center gap-1">
                            <Tag size={10} />
                            <span>Negotiable</span>
                          </div>
                        )}
                      </div>

                      {/* Content Body */}
                      <div className="p-4 space-y-2.5">
                        {/* Category */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                            {product.category?.replace(/-/g, ' ')}
                          </span>
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            OEM Direct
                          </span>
                        </div>

                        {/* Product Title */}
                        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-red-600 transition-colors">
                          <Link href={`/product/${product.id}`}>
                            {product.name}
                          </Link>
                        </h3>

                        {/* Localized Dispatch Pill */}
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                          <Truck size={12} className="text-brand-600 shrink-0" />
                          <span className="truncate" suppressHydrationWarning>
                            Express Dispatch to <strong className="text-slate-900" suppressHydrationWarning>{district}</strong>
                          </span>
                        </div>

                        {/* Price Details with Live Offer Support */}
                        {isOfferEligible(product, activeOffer) && activeOffer.type === 'percentage' && activeOffer.value > 0 ? (
                          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                            <div>
                              <span className="text-[9px] font-semibold text-slate-400 line-through font-mono block">
                                MRP: {formatINR(product.price)}
                              </span>
                              <div className="text-sm font-black text-emerald-800 font-mono">
                                {formatINR(Math.round((product.price || 0) * (1 - Number(activeOffer.value || 0) / 100)))}
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-mono">
                              {activeOffer.value}% Special Off
                            </span>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                            <div>
                              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">
                                Authorized Price
                              </span>
                              <div className="text-sm font-black text-slate-900 font-mono">
                                {product.price ? formatINR(product.price) : 'Price on Request'}
                              </div>
                            </div>
                            {product.mrp && product.price && product.mrp > product.price && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                                Save {formatINR(product.mrp - product.price)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="p-4 pt-0 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Add To Cart Button */}
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          {isJustAdded ? (
                            <Check size={14} className="text-emerald-600" />
                          ) : (
                            <ShoppingCart size={14} className="text-slate-600" />
                          )}
                          <span>{isJustAdded ? 'Added!' : '+ Cart'}</span>
                        </button>

                        {/* Get Official Quotation Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenQuote(product)}
                          className="py-2.5 px-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <FileText size={14} />
                          <span>Get Quote</span>
                        </button>
                      </div>

                      <Link
                        href={`/product/${product.id}`}
                        className="block w-full py-1.5 text-center text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition"
                      >
                        View Full Specifications &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Summary & Procurement Help Bar */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-red-400 font-bold uppercase tracking-wider">
                  <ShieldCheck size={16} />
                  <span>Institutional Procurement Assurance</span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white">
                  Need a customized institutional quotation for all {items.length} shortlisted items?
                </h4>
                <p className="text-xs text-slate-300">
                  Our biomedical tender desk generates unified GST proforma invoices with turnkey hospital delivery across Rajasthan.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <a
                  href="tel:9983333469"
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <PhoneCall size={14} />
                  <span>9983333469</span>
                </a>
                <Link
                  href="/contact"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <FileText size={14} />
                  <span>Request Full Proforma</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State Display */
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-14 text-center shadow-xs space-y-6 max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-red-50 text-red-600 border border-red-200/80 mx-auto flex items-center justify-center shadow-2xs">
              <Heart size={36} className="fill-red-100 text-red-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Your Equipment Wishlist is Empty
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                You haven&apos;t shortlisted any medical equipment yet. Browse our authorized catalog of ICU ventilators, surgical suites, and imaging systems to save equipment for review or official quotation.
              </p>
            </div>

            {/* Quick CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/products"
                className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Layers size={16} />
                <span>Explore All Medical Equipment</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/deals?tab=best-deals"
                className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2"
              >
                <Sparkles size={16} className="text-amber-500" />
                <span>View Today&apos;s Best Deals</span>
              </Link>
            </div>

            {/* Popular Categories Shortcut */}
            <div className="pt-6 border-t border-slate-100">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                Popular Procurement Categories
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {CATEGORIES.filter(c => c.id !== 'all').slice(0, 4).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.id}`}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trust Badges Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Direct Factory Warranty</div>
              <div className="text-[11px] text-slate-500">2-Year comprehensive OEM guarantee</div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Regional Rajasthan Dispatch</div>
              <div className="text-[11px] text-slate-500" suppressHydrationWarning>Delivery &amp; biomedical SLA to {mounted ? district : 'Jaipur'}</div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">CDSCO &amp; ISO 13485 Registered</div>
              <div className="text-[11px] text-slate-500">100% genuine medical-grade devices</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

