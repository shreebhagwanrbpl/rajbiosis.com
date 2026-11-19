'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Tag, Heart, ShoppingCart, Check, Plus, Minus } from 'lucide-react';
import { isInWishlist, toggleWishlist, WISHLIST_UPDATED_EVENT } from '../utils/wishlist';
import { requireCustomerAuth } from '../utils/userProfile';
import { addToCart, openCartDrawer } from '../utils/cart';

export default function ProductCard({ product, onOpenQuote, className = '' }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setIsWishlisted(isInWishlist(product.id));

    const handleWishlistUpdate = () => {
      setIsWishlisted(isInWishlist(product.id));
    };

    window.addEventListener(WISHLIST_UPDATED_EVENT, handleWishlistUpdate);
    return () => {
      window.removeEventListener(WISHLIST_UPDATED_EVENT, handleWishlistUpdate);
    };
  }, [product.id]);

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isWishlisted && !requireCustomerAuth('wishlist', product)) {
      return;
    }
    const nowWishlisted = toggleWishlist(product);
    setIsWishlisted(nowWishlisted);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireCustomerAuth('cart', product, quantity)) {
      return;
    }
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
    openCartDrawer();
  };

  const handleOpenQuote = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-product-enquiry', {
          detail: {
            ...product,
            quantity: quantity
          }
        })
      );
    }
  };

  const handleCardClick = (e) => {
    // If click originated from interactive child like Get Quote, Cart, or Wishlist, don't trigger navigation
    if (e.target.closest('button')) return;
    router.push(`/product/${product.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => router.prefetch(`/product/${product.id}`)}
      className={`product-card group flex flex-col justify-between bg-white relative h-full cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 rounded-2xl border border-slate-200/90 overflow-hidden select-none ${className}`}
    >
      <div>
        {/* Product Image Area - Full-Width Edge-to-Edge with Zero Gaps on Left/Right */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] h-48 sm:h-52 w-full bg-slate-50 overflow-hidden border-b border-slate-100 flex items-center justify-center p-2">
          <img
            src={product.image || 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=500&q=80'}
            alt={product.name || product.title}
            loading="lazy"
            className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=500&q=80';
            }}
          />

          {/* Wishlist Heart Floating Button on Image */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer z-30 hover:scale-110 active:scale-95 ${
              isWishlisted
                ? 'bg-red-600 text-white ring-2 ring-red-300 shadow-red-600/30'
                : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-red-600 border border-slate-200'
            }`}
            title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
            aria-label={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
          >
            <Heart
              size={15}
              className={`transition-all duration-200 ${
                isWishlisted ? 'fill-white text-white scale-110' : 'stroke-[2.2]'
              }`}
            />
          </button>

          {/* Negotiable Badge */}
          {product.isNegotiable && (
            <div className="pointer-events-none absolute bottom-2 right-2.5 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs flex items-center gap-0.5">
              <Tag size={9} />
              <span>Negotiable</span>
            </div>
          )}
        </div>

        {/* Content Body - Clean, Spacious & Uncluttered (Dispatch Pill removed as requested) */}
        <div className="p-4 sm:p-4.5">
          {/* Category Tag */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">
              {product.category?.replace(/-/g, ' ')}
            </span>
            {product.isNegotiable && (
              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                Bid Open
              </span>
            )}
          </div>

          {/* Product Name (Bold, 2-line clamp) */}
          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
        </div>
      </div>

      {/* Footer Area: Price & Action Buttons */}
      <div className="p-4 sm:p-4.5 pt-0">
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between mb-3">
          <div>
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block leading-none">
              Pricing
            </span>
            <div className="text-xs font-bold text-slate-900 tracking-tight mt-0.5">
              Price on Request
            </div>
          </div>
          <span className="text-[9px] font-bold text-brand-700 bg-red-50 border border-red-200/60 px-2 py-0.5 rounded-full">
            Official Quote
          </span>
        </div>

        {/* Actions Row: Quantity Selector (-/+) + Add to Cart + Get Quote */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quantity Selector (- / +) */}
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="flex items-center border border-slate-200/90 rounded-xl bg-slate-50/90 h-10 px-1 shrink-0 shadow-2xs"
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuantity((q) => Math.max(1, q - 1));
              }}
              className="w-6 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 rounded-md transition font-black cursor-pointer active:scale-90"
              title="Decrease Quantity"
              aria-label="Decrease Quantity"
            >
              <Minus size={12} />
            </button>
            <span className="w-5 text-center font-bold text-xs text-slate-900 select-none">
              {quantity}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuantity((q) => q + 1);
              }}
              className="w-6 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 rounded-md transition font-black cursor-pointer active:scale-90"
              title="Increase Quantity"
              aria-label="Increase Quantity"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Add to Cart: Icon Only Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all shadow-2xs shrink-0 cursor-pointer ${
              justAdded
                ? 'bg-emerald-50 border-emerald-300 text-emerald-600 scale-95'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900 active:scale-95'
            }`}
            title={justAdded ? `Added ${quantity} to Cart` : 'Add to Cart'}
            aria-label="Add to Cart"
          >
            {justAdded ? (
              <Check size={16} className="text-emerald-600" />
            ) : (
              <ShoppingCart size={16} />
            )}
          </button>

          {/* Get Quote: Primary Action Button */}
          <button
            type="button"
            onClick={handleOpenQuote}
            className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 h-10 px-2 sm:px-3 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.98] rounded-xl transition-all shadow-xs cursor-pointer text-center group/btn truncate"
          >
            <FileText size={14} className="shrink-0" />
            <span className="truncate">Get Quote</span>
          </button>
        </div>
      </div>
    </div>
  );
}
