'use client';

import React from 'react';
import Header from '../components/Header';
import HeroProductBanner from '../components/HeroProductBanner';
import CategoryTiles from '../components/CategoryTiles';
import BrandCarouselSection from '../components/BrandCarouselSection';
import FeaturedProducts from '../components/FeaturedProducts';
import TrustSection from '../components/TrustSection';
import QuoteSection from '../components/QuoteSection';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900 antialiased selection:bg-brand-500 selection:text-white">
      {/* 1. Compact, Premium Header */}
      <Header />

      {/* 2. Distinctive, Product-First Hero Banner */}
      <HeroProductBanner />

      {/* 3. Product Categories in Image-Based Grid */}
      <CategoryTiles />

      {/* 4. Featured Products from Real Catalogue Data (with Brand Showcase between categories) */}
      <FeaturedProducts />

      {/* 5. Compact, Verified Institutional Trust Section */}
      <TrustSection />

      {/* 6. Concise Quotation & Enquiry CTA */}
      <QuoteSection />

      {/* 7. Clean, Useful Footer */}
      <Footer />
    </div>
  );
}
