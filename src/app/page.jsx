'use client';

import React from 'react';
import Header from '../components/Header';
import HeroProductBanner from '../components/HeroProductBanner';
import CategoryTiles from '../components/CategoryTiles';
import FeaturedProducts from '../components/FeaturedProducts';
import TrustSection from '../components/TrustSection';
import QuoteSection from '../components/QuoteSection';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-brand-600 selection:text-white">
      {/* A. Header and Navigation */}
      <Header />

      <main className="flex-1 flex flex-col">
        {/* B. Spacious Hero Banner: Left = High-converting copy & CTAs; Right = Biomedical slider */}
        <HeroProductBanner />

        {/* C. Explore Categories: 6 image-based category cards */}
        <CategoryTiles />

        {/* D, E, F, G, H. Product Showcases & Authorized OEM Brands Carousel */}
        <FeaturedProducts />

        {/* I. Institutional Procurement Assurance (4 Information Cards) */}
        <TrustSection />

        {/* J. Request Official Price Quotation (Premium Dark Red Gradient CTA Banner) */}
        <QuoteSection />
      </main>

      {/* K. Footer */}
      <Footer />
    </div>
  );
}
