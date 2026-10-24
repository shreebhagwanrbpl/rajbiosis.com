'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, FileText, Truck, ShoppingCart, Tag, Check } from 'lucide-react';
import { getActiveDistrict, USER_PROFILE_EVENT } from '../utils/userProfile';
import { addToCart, openCartDrawer } from '../utils/cart';

export default function ProductCard({ product, onOpenQuote }) {
  const [district, setDistrict] = useState('Jaipur');
  const [justAdded, setJustAdded] = useState(false);

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

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
    openCartDrawer();
  };

  // Format price in Indian Rupee format
  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Get key technical highlights from specs (first 2 entries)
  const specHighlights = product.specs 
    ? Object.entries(product.specs).slice(0, 2) 
    : [];

  return (
    <div className="product-card group flex flex-col justify-between bg-white relative">
      <div>
        {/* Product Image Area with Wide Aspect Ratio (Shorter & Wider) */}
        <Link href={`/product/${product.id}`} className="block relative aspect-[16/10] sm:aspect-[16/9] max-h-[165px] bg-neutral-50 overflow-hidden p-2.5 border-b border-neutral-100">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Brand Badge */}
          {product.brand && (
            <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs text-neutral-600 text-[9px] font-semibold px-1.5 py-0.5 rounded border border-neutral-200">
              {product.brand}
            </div>
          )}

          {/* Quick Add To Cart Floating Button on Image */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 hover:bg-red-600 hover:text-white text-slate-700 shadow-2xs border border-slate-200 flex items-center justify-center transition-all duration-200 cursor-pointer"
            title="Add to Equipment Cart"
          >
            {justAdded ? <Check size={13} className="text-emerald-600" /> : <ShoppingCart size={13} />}
          </button>

          {/* Model / SKU Chip */}
          <div className="absolute bottom-2 left-2 bg-neutral-900/80 backdrop-blur-xs text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
            {product.sku}
          </div>

          {/* Negotiable Badge */}
          {product.isNegotiable && (
            <div className="absolute bottom-2 right-2 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs flex items-center gap-0.5">
              <Tag size={9} />
              <span>Negotiable</span>
            </div>
          )}
        </Link>

        {/* Content Body - Compact and Wide */}
        <div className="p-3 sm:p-3.5">
          {/* Category Tag */}
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">
              {product.category?.replace(/-/g, ' ')}
            </span>
            {product.isNegotiable && (
              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded">
                Bid Open
              </span>
            )}
          </div>

          {/* Product Name (2-line clamp, compact height) */}
          <h3 className="text-xs sm:text-sm font-bold text-neutral-900 leading-snug line-clamp-2 min-h-[2.1rem] group-hover:text-brand-600 transition-colors">
            <Link href={`/product/${product.id}`}>
              {product.name}
            </Link>
          </h3>

          {/* Localized District Fast Delivery Pill */}
          <div className="mt-1.5 flex items-center gap-1.5 text-[9px] sm:text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/90 px-2 py-0.5 rounded-md">
            <Truck size={11} className="text-brand-600 shrink-0" />
            <span className="truncate">
              Dispatch to <strong className="text-slate-900">{district}</strong> (24-48h)
            </span>
          </div>

          {/* Key Technical Highlights (Compact Specs) */}
          {specHighlights.length > 0 && (
            <div className="mt-2 pt-1.5 border-t border-neutral-100 space-y-0.5 text-[11px]">
              {specHighlights.slice(0, 2).map(([key, val], idx) => (
                <div key={idx} className="flex items-baseline justify-between gap-1 text-[10px] leading-tight">
                  <span className="text-neutral-400 font-medium truncate shrink-0">{key}:</span>
                  <span className="font-semibold text-neutral-700 text-right truncate">{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Area: Price & Clear Actions */}
      <div className="p-3 sm:p-3.5 pt-0">
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between mb-2">
          <div>
            <span className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider block leading-none">
              Pricing
            </span>
            <div className="text-xs font-bold text-slate-800 tracking-tight mt-0.5">
              Price on Request
            </div>
          </div>
          <span className="text-[9px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            OEM Direct
          </span>
        </div>

        {/* 3 Action Buttons: Specs, + Cart, Get Quote */}
        <div className="grid grid-cols-12 gap-1.5">
          <Link
            href={`/product/${product.id}`}
            className="col-span-3 inline-flex items-center justify-center py-1.5 px-1 text-[11px] font-semibold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg transition shadow-2xs text-center"
          >
            <span>Specs</span>
          </Link>

          <button
            type="button"
            onClick={handleAddToCart}
            className="col-span-4 inline-flex items-center justify-center gap-1 py-1.5 px-1 text-[11px] font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition shadow-2xs cursor-pointer text-center"
            title="Add equipment to cart"
          >
            {justAdded ? (
              <Check size={12} className="text-emerald-600" />
            ) : (
              <ShoppingCart size={12} className="text-slate-600" />
            )}
            <span>{justAdded ? 'Added' : '+ Cart'}</span>
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('open-product-enquiry', { detail: product }));
              }
            }}
            className="col-span-5 inline-flex items-center justify-center gap-1 py-1.5 px-1 text-[11px] font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 rounded-lg transition shadow-2xs cursor-pointer text-center"
          >
            <FileText size={12} />
            <span>Get Quote</span>
          </button>
        </div>
      </div>
    </div>
  );
}
