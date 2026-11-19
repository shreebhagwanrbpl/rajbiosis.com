'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProductCard from '../../../components/ProductCard';
import { PRODUCTS } from '../../../data/products';
import { fetchLiveProductsFromAdmin } from '../../../utils/adminSync';
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
  Tag,
  ArrowRight,
  Heart,
  Users,
  Activity,
  Building2,
  ChevronDown,
  Plus,
  Minus
} from 'lucide-react';
import { getActiveDistrict, USER_PROFILE_EVENT, autoDetectLocation, getUserProfile, getUserInquiries, requireCustomerAuth } from '../../../utils/userProfile';
import { addToCart, openCartDrawer, CART_UPDATED_EVENT } from '../../../utils/cart';
import { isInWishlist, toggleWishlist, WISHLIST_UPDATED_EVENT } from '../../../utils/wishlist';
import { fetchProductDemand } from '../../../utils/cartWishlistSync';

export default function ProductDetailClient({ productId }) {
  const [product, setProduct] = useState(() => {
    return PRODUCTS.find((p) => p.id === productId || p.sku === productId || p._id === productId) || null;
  });

  const [allProducts, setAllProducts] = useState(PRODUCTS);
  const [isLoadingProduct, setIsLoadingProduct] = useState(!product);

  useEffect(() => {
    let isMounted = true;
    async function checkLiveProduct() {
      try {
        const liveList = await fetchLiveProductsFromAdmin();
        if (isMounted && liveList && Array.isArray(liveList) && liveList.length > 0) {
          setAllProducts(liveList);
          const found = liveList.find(p => p.id === productId || p.sku === productId || p._id === productId);
          if (found) {
            setProduct(found);
          }
        }
      } catch (err) { }
      finally {
        if (isMounted) setIsLoadingProduct(false);
      }
    }
    checkLiveProduct();
    return () => { isMounted = false; };
  }, [productId]);

  const relatedProducts = product ? allProducts.filter(
    (p) => (p.category === product.category || (p.category && product.category && p.category.toLowerCase() === product.category.toLowerCase())) && p.id !== product.id
  ).slice(0, 4) : [];

  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'package' | 'warranty'
  const [quantity, setQuantity] = useState(1);
  const [brochureDownloaded, setBrochureDownloaded] = useState(false);
  const [district, setDistrict] = useState('Jaipur');
  const [quoteCompleted, setQuoteCompleted] = useState(false);
  const hasTriggeredQuoteRef = useRef(false);
  const [approvedPriceInfo, setApprovedPriceInfo] = useState(null);
  const [activeOffer, setActiveOffer] = useState(null);

  // Real-time check for active management special offers
  useEffect(() => {
    let isMounted = true;
    const checkActiveOffer = async () => {
      try {
        const prof = typeof window !== 'undefined' ? getUserProfile() : null;
        const ph = (prof?.phone || '').replace(/\D/g, '').slice(-10);
        const url = ph ? `/api/cart-wishlist?phone=${encodeURIComponent(ph)}&checkOffers=true` : `/api/cart-wishlist?checkOffers=true`;
        const res = await fetch(url).catch(() => null);
        if (res && res.ok) {
          const data = await res.json().catch(() => null);
          if (data?.success && data.activeOffer && isMounted) {
            const off = data.activeOffer;
            const notExpired = !off.validTill || new Date(off.validTill) >= new Date();
            if (notExpired) {
              if (off.productScope === 'all_catalog') {
                setActiveOffer(off);
              } else if (Array.isArray(off.selectedProductIds) && (off.selectedProductIds.includes(product.id) || off.selectedProductIds.includes(product.sku))) {
                setActiveOffer(off);
              } else if (off.productScope === 'cart_watchlist') {
                setActiveOffer(off);
              }
            } else {
              setActiveOffer(null);
            }
          } else if (isMounted) {
            setActiveOffer(null);
          }
        }
      } catch (err) {}
    };

    checkActiveOffer();
    const offerInterval = setInterval(checkActiveOffer, 4000);
    return () => {
      isMounted = false;
      clearInterval(offerInterval);
    };
  }, [product]);

  // Real-time polling for live Admin approval & counter-offer updates
  useEffect(() => {
    let isMounted = true;
    const checkApprovedRate = async () => {
      try {
        const prof = typeof window !== 'undefined' ? getUserProfile() : null;
        const phone = (prof?.phone || '').replace(/\D/g, '').slice(-10);
        const email = (prof?.email || '').trim().toLowerCase();

        // Check local inquiries first
        if (typeof window !== 'undefined') {
          const inquiries = getUserInquiries() || [];
          const matchedInq = inquiries.find(inq =>
            (inq.productId === product.id || inq.productSku === product.sku || inq.productName === product.name) &&
            (inq.negotiationStatus === 'approved' || inq.negotiationStatus === 'counter_offered' || inq.approvedPrice)
          );
          if (matchedInq && isMounted) {
            setApprovedPriceInfo({
              status: matchedInq.negotiationStatus || 'approved',
              approvedPrice: matchedInq.approvedPrice || matchedInq.unitPrice,
              actualPrice: matchedInq.actualPrice || product.price,
              expectedPrice: matchedInq.expectedPrice,
              adminNote: matchedInq.adminNote,
              quoteNumber: matchedInq.quoteNumber || matchedInq.id
            });
          }
        }

        // Poll MongoDB /api/leads for real-time live admin authorization
        if (phone || email) {
          const queryParam = phone ? `phone=${encodeURIComponent(phone)}` : `email=${encodeURIComponent(email)}`;
          const res = await fetch(`/api/leads?${queryParam}`).catch(() => null);
          if (res && res.ok) {
            const data = await res.json().catch(() => null);
            if (data?.success && Array.isArray(data.leads)) {
              const matchedLead = data.leads.find(l => {
                const eq = (l.equipment || l.productName || l.rawLeadData?.productName || '').trim().toLowerCase();
                const pName = (product.name || '').trim().toLowerCase();
                const pSku = (product.sku || '').trim().toLowerCase();
                const matchesProd = eq.includes(pName) || pName.includes(eq) || (l.productSku && l.productSku.toLowerCase() === pSku);
                return matchesProd && (l.negotiationStatus === 'approved' || l.negotiationStatus === 'counter_offered' || l.approvedPrice);
              });

              if (matchedLead && isMounted) {
                setApprovedPriceInfo({
                  status: matchedLead.negotiationStatus || 'approved',
                  approvedPrice: parseFloat(matchedLead.approvedPrice || matchedLead.price || 0),
                  actualPrice: parseFloat(matchedLead.actualPrice || product.price || 0),
                  expectedPrice: parseFloat(matchedLead.expectedPrice || 0),
                  adminNote: matchedLead.adminNote || '',
                  quoteNumber: matchedLead.id || matchedLead.quoteNumber || ''
                });
              }
            }
          }
        }
      } catch (err) { }
    };

    checkApprovedRate();
    const interval = setInterval(checkApprovedRate, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [product]);

  useEffect(() => {
    setDistrict(getActiveDistrict());

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('quote_completed') === 'true') {
        setQuoteCompleted(true);
      }
      if (params.get('open_quote') === 'true' && !hasTriggeredQuoteRef.current) {
        hasTriggeredQuoteRef.current = true;
        try {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        } catch (e) {}

        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent('open-product-enquiry', {
              detail: { ...product, initialStep: 'success', suppressLeadSync: true }
            })
          );
        }, 300);
      }
    }

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

    window.addEventListener(USER_PROFILE_EVENT, handleProfileUpdate);
    window.addEventListener('active-district-changed', handleDistrictChange);

    // If location is not yet saved, detect it silently once
    autoDetectLocation();

    return () => {
      window.removeEventListener(USER_PROFILE_EVENT, handleProfileUpdate);
      window.removeEventListener('active-district-changed', handleDistrictChange);
    };
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
    autoDetectLocation();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-product-enquiry', {
          detail: {
            ...product,
            quantity: quantity,
            approvedPrice: approvedPriceInfo?.approvedPrice,
            negotiationStatus: approvedPriceInfo?.status,
            actualPrice: approvedPriceInfo?.actualPrice,
            expectedPrice: approvedPriceInfo?.expectedPrice,
            adminNote: approvedPriceInfo?.adminNote,
            quoteNumber: approvedPriceInfo?.quoteNumber
          }
        })
      );
    }
  };

  const handleDownloadBrochure = () => {
    setBrochureDownloaded(true);
    setTimeout(() => setBrochureDownloaded(false), 3000);
  };

  const [justAdded, setJustAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setIsWishlisted(isInWishlist(product?.id));

    const handleWishlistChange = () => {
      setIsWishlisted(isInWishlist(product?.id));
    };

    window.addEventListener(WISHLIST_UPDATED_EVENT, handleWishlistChange);
    return () => {
      window.removeEventListener(WISHLIST_UPDATED_EVENT, handleWishlistChange);
    };
  }, [product?.id]);

  const [productDemand, setProductDemand] = useState({
    wishlistCount: 0,
    cartCount: 0,
    wishlistCustomers: [],
    cartCustomers: [],
    allCustomers: []
  });
  const [showDemandDetails, setShowDemandDetails] = useState(false);

  useEffect(() => {
    let active = true;
    const loadDemand = async () => {
      if (!product?.id) return;
      const data = await fetchProductDemand(product.id);
      if (active && data) {
        setProductDemand(data);
      }
    };
    loadDemand();

    const handleUpdate = () => {
      loadDemand();
    };

    window.addEventListener('cart-wishlist-interactions-updated', handleUpdate);
    window.addEventListener(CART_UPDATED_EVENT, handleUpdate);
    window.addEventListener(WISHLIST_UPDATED_EVENT, handleUpdate);

    return () => {
      active = false;
      window.removeEventListener('cart-wishlist-interactions-updated', handleUpdate);
      window.removeEventListener(CART_UPDATED_EVENT, handleUpdate);
      window.removeEventListener(WISHLIST_UPDATED_EVENT, handleUpdate);
    };
  }, [product?.id]);

  const handleToggleWishlist = () => {
    if (!isWishlisted && !requireCustomerAuth('wishlist', product)) {
      return;
    }
    const nowWishlisted = toggleWishlist(product);
    setIsWishlisted(nowWishlisted);
  };

  const handleAddToCart = () => {
    if (!requireCustomerAuth('cart', product, quantity)) {
      return;
    }
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
    openCartDrawer();
  };

  const gstRate = product?.gstRate ? `${product.gstRate}%` : '18%';

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-16 text-slate-400">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs font-semibold">Loading product specifications...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Package size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Product Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">
            The requested product model or SKU could not be located in our active catalogue.
          </p>
          <Link href="/products" className="btn-primary-red text-xs py-2.5 px-6 inline-flex items-center gap-2">
            <span>Browse Full Catalogue</span>
            <ArrowRight size={14} />
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      <Header />

      {/* Quotation Confirmed & Profile Verified Alert Banner */}
      {quoteCompleted && (
        <div className="bg-emerald-50 border-b border-emerald-200 py-3.5 px-4 animate-fade-in shadow-2xs">
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-emerald-950">
                  Profile Completed &amp; Quotation Successfully Connected!
                </h4>
                <p className="text-xs text-emerald-800">
                  Your official OEM quotation for <strong>{product.name}</strong> has been generated. Our regional depot engineer in <strong suppressHydrationWarning>{district}</strong> will contact you within 5 minutes.
                </p>
              </div>
            </div>
            <Link
              href="/profile"
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shrink-0 transition flex items-center gap-1 shadow-2xs self-start sm:self-center"
            >
              <span>View Quotation in Profile</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

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

              {/* Floating Wishlist Heart on Product Image (Prominent Red Background) */}
              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`absolute ${product.isNegotiable ? 'top-12' : 'top-3'} right-3 w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer z-20 hover:scale-110 active:scale-95 ${
                  isWishlisted
                    ? 'bg-red-600 text-white ring-2 ring-red-300 shadow-red-600/30'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                }`}
                title={isWishlisted ? "Remove from Equipment Wishlist" : "Save to Equipment Wishlist"}
                aria-label={isWishlisted ? "Remove from Equipment Wishlist" : "Save to Equipment Wishlist"}
              >
                <Heart
                  size={18}
                  className={`transition-all duration-200 text-white ${
                    isWishlisted ? 'fill-white scale-110' : 'stroke-[2.2]'
                  }`}
                />
              </button>
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

              {/* Pricing Box (Institutional Quote on Request) */}
              {approvedPriceInfo ? (
                <div className="mt-4 p-5 bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 rounded-2xl border-2 border-emerald-400 shadow-sm space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      <span>
                        {approvedPriceInfo.status === 'approved'
                          ? 'Authorized Institutional Rate Approved'
                          : 'Official Counter Quotation Ready'}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200 font-mono">
                      Quote Ref: {approvedPriceInfo.quoteNumber || 'Approved'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pt-1">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Institutional Purchase Rate
                      </span>
                      <div className="text-2xl sm:text-3xl font-black text-emerald-900 tracking-tight">
                        Official Quotation Generated
                      </div>
                      <p className="text-xs text-emerald-700 mt-1">
                        Your confidential institutional rate is attached to your quote sheet.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenQuoteModal}
                      className="py-3 px-5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileText size={16} />
                      <span>View Official Quotation</span>
                    </button>
                  </div>

                  {approvedPriceInfo.adminNote && (
                    <div className="text-xs text-emerald-900 bg-white/90 p-2.5 rounded-xl border border-emerald-200 font-medium">
                      <strong>Executive Note:</strong> &quot;{approvedPriceInfo.adminNote}&quot;
                    </div>
                  )}
                </div>
              ) : activeOffer ? (
                <div className="mt-4 p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl border-2 border-emerald-400 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                        {activeOffer.title || 'Special Management Privilege'}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-black bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                      SPECIAL PRIVILEGE
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pt-1">
                    <div>
                      <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
                        Institutional Campaign Rate
                      </span>
                      <div className="text-2xl sm:text-3xl font-black text-emerald-900 tracking-tight">
                        Price Available on Request
                      </div>
                    </div>

                    <div className="text-right text-xs text-emerald-800">
                      <span className="inline-block px-2.5 py-1 bg-white/90 text-emerald-800 font-bold rounded-lg border border-emerald-200 shadow-2xs">
                        {activeOffer.productScope === 'all_catalog' ? '🌐 Storewide Active' : '🎯 Approved for You'}
                      </span>
                      {activeOffer.validTill && (
                        <div className="text-[11px] font-mono text-emerald-700 mt-1">
                          Valid Till {new Date(activeOffer.validTill).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </div>
                  </div>

                  {activeOffer.perkText && (
                    <div className="text-xs text-emerald-900 bg-white/90 p-2.5 rounded-xl border border-emerald-200 font-semibold flex items-center gap-1.5">
                      <span>🎁</span>
                      <span>Includes Complimentary Perk: <strong>{activeOffer.perkText}</strong></span>
                    </div>
                  )}
                </div>
              ) : (
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
                      <span>Delivery in <strong className="text-slate-800" suppressHydrationWarning>{district}</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Clean Medical Equipment Description */}
              <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                {product.shortDesc}
              </p>

              {/* Professional Status Badges */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span suppressHydrationWarning>In Stock &bull; Ready for Dispatch</span>
                </div>
                {product.isNegotiable && (
                  <div className="flex items-center gap-1.5 font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                    <Tag size={13} className="text-amber-600" />
                    <span>Target Price Negotiation Open</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                  <Truck size={13} className="text-slate-400" />
                  <span suppressHydrationWarning>Regional Service: <strong className="text-slate-700">{district} Hub</strong></span>
                </div>
              </div>
            </div>

            {/* Primary Action Buttons - Clean & Professional B2B Actions */}
            <div className="pt-5 border-t border-slate-200/90 flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* Quantity Stepper (- / +) */}
              <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50/90 p-1 h-11 sm:h-12 shrink-0 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase px-2 hidden sm:inline select-none">Qty:</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 rounded-lg transition font-black cursor-pointer select-none active:scale-90"
                  title="Decrease Quantity"
                  aria-label="Decrease Quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-black text-sm text-slate-900 select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 rounded-lg transition font-black cursor-pointer select-none active:scale-90"
                  title="Increase Quantity"
                  aria-label="Increase Quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Primary: Get Official Quote */}
              <button
                type="button"
                onClick={handleOpenQuoteModal}
                className="flex-1 sm:flex-none py-3 px-5 sm:px-6 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer h-11 sm:h-12"
              >
                <FileText size={16} />
                <span>Request Official Quotation{quantity > 1 ? ` (${quantity} Units)` : ''}</span>
              </button>

              {/* Secondary: Add to Cart / RFQ */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 sm:flex-none py-3 px-4 sm:px-5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm h-11 sm:h-12"
              >
                {justAdded ? <Check size={16} className="text-emerald-400" /> : <ShoppingCart size={16} />}
                <span>{justAdded ? `Added ${quantity} Units` : 'Add to RFQ List'}</span>
              </button>

              {/* Technical Datasheet Download */}
              <button
                type="button"
                onClick={handleDownloadBrochure}
                className="flex-1 sm:flex-none py-3 px-3.5 sm:px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download size={15} />
                <span>{brochureDownloaded ? 'Datasheet Ready!' : 'Datasheet (PDF)'}</span>
              </button>

              {/* Helpline Call */}
              <a
                href="tel:9983333469"
                className="w-full sm:w-auto py-2.5 sm:py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition flex items-center justify-center gap-2 text-xs font-bold"
                title="Direct technical support helpline"
              >
                <PhoneCall size={15} className="text-brand-600" />
                <span>9983333469</span>
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
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer ${activeTab === 'specs'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab('package')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer ${activeTab === 'package'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              Package Contents
            </button>
            <button
              onClick={() => setActiveTab('warranty')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer ${activeTab === 'warranty'
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
                  className={`grid grid-cols-1 sm:grid-cols-3 py-3 px-4 text-xs sm:text-sm ${idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
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
