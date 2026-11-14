'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import BrandCarouselSection from './BrandCarouselSection';
import { PRODUCTS } from '../data/products';

function ProductCarousel({ products, link, title }) {
  const router = useRouter();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 15);
    setIsAtEnd(scrollLeft >= scrollWidth - clientWidth - 25);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [products]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

    if (direction === 'right') {
      // If products end on the right, smoothly slide into that category page
      if (scrollLeft >= scrollWidth - clientWidth - 25) {
        router.push(link);
        return;
      }
      scrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
    } else {
      scrollRef.current.scrollBy({ left: -clientWidth, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative flex items-center gap-2 sm:gap-3 w-full">
      {/* Left Arrow Button */}
      <button
        type="button"
        onClick={() => handleScroll('left')}
        disabled={!canScrollLeft}
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200/90 shadow-md flex items-center justify-center text-slate-700 transition cursor-pointer shrink-0 z-10 ${
          !canScrollLeft
            ? 'opacity-35 cursor-not-allowed'
            : 'hover:bg-slate-50 hover:text-slate-900 hover:scale-105 active:scale-95'
        }`}
        aria-label="Previous products"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Cards Scroll Track - Exactly 3 Cards in View with Zero Clipping */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto scroll-smooth scrollbar-none py-3 px-1 w-full"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {/* The 6 Featured Products in this Category */}
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[86%] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] shrink-0 flex flex-col"
            style={{ scrollSnapAlign: 'start' }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Right Arrow Button - When at end, clicking smoothly navigates to the category page */}
      <button
        type="button"
        onClick={() => handleScroll('right')}
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border shadow-md flex items-center justify-center transition cursor-pointer shrink-0 z-10 ${
          isAtEnd
            ? 'bg-brand-600 border-brand-700 text-white hover:bg-brand-700 hover:scale-105 active:scale-95 shadow-brand-600/30'
            : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:scale-105 active:scale-95'
        }`}
        title={isAtEnd ? `View All ${title} Products` : "Next products"}
        aria-label={isAtEnd ? `View All ${title} Products` : "Next products"}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function DepartmentSection({
  title,
  description,
  link,
  products,
  imagePosition = 'right',
  bgClass = 'bg-white'
}) {
  const isImageRight = imagePosition === 'right';

  return (
    <section className={`py-12 sm:py-16 md:py-20 border-b border-slate-200/80 ${bgClass}`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
          
          {/* Info Column (Compact & Clean) */}
          <div
            className={`lg:col-span-3 xl:col-span-3 space-y-3.5 ${
              isImageRight ? 'order-1' : 'order-1 lg:order-2'
            }`}
          >
            {/* Red Accent Dash */}
            <div className="w-8 h-1 bg-brand-600 rounded-full" />
            
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-sm">
              {description}
            </p>

            <div className="pt-2">
              <Link
                href={link}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white text-xs sm:text-sm font-bold transition-all shadow-2xs group"
              >
                <span>View All Products</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Products Carousel Column (Wider Stage) */}
          <div
            className={`lg:col-span-9 xl:col-span-9 min-w-0 ${
              isImageRight ? 'order-2' : 'order-2 lg:order-1'
            }`}
          >
            <ProductCarousel products={products} link={link} title={title} />
          </div>

        </div>
      </div>
    </section>
  );
}

export default function FeaturedProducts() {
  // Exactly 6 authentic biomedical products per department
  const icuProducts = PRODUCTS.filter(p => p.category === 'icu-critical-care').slice(0, 6);
  const otProducts = PRODUCTS.filter(p => p.category === 'surgical-ot').slice(0, 6);
  const radiologyProducts = PRODUCTS.filter(p => p.category === 'radiology-imaging').slice(0, 6);
  const labAndInfraProducts = PRODUCTS.filter(p =>
    ['diagnostic-lab', 'hospital-furniture', 'sterilization-dental'].includes(p.category)
  ).slice(0, 6);

  return (
    <div>
      {/* 1. ICU & Critical Care: Info on LEFT, Products on RIGHT (6 Products + Category Slide) */}
      <DepartmentSection
        title="ICU & Critical Care"
        description="Life-saving equipment and monitoring solutions for intensive care units."
        link="/category/icu-critical-care"
        products={icuProducts}
        imagePosition="right"
        bgClass="bg-white"
      />

      {/* 2. Surgical & OT Suite: Products on LEFT, Info on RIGHT (Alternated!) */}
      <DepartmentSection
        title="Surgical & OT Suite"
        description="Advanced surgical equipment and operation theatre solutions."
        link="/category/surgical-ot"
        products={otProducts}
        imagePosition="left"
        bgClass="bg-slate-50/70"
      />

      {/* 3. Authorized OEM Brands Showcase */}
      <BrandCarouselSection />

      {/* 4. Radiology & Diagnostic Imaging: Info on LEFT, Products on RIGHT (Alternated!) */}
      <DepartmentSection
        title="Radiology & Diagnostic Imaging"
        description="High-precision digital radiography, Doppler ultrasound, and diagnostic imaging systems."
        link="/category/radiology-imaging"
        products={radiologyProducts}
        imagePosition="right"
        bgClass="bg-white"
      />

      {/* 5. Laboratory & Ward Infrastructure: Products on LEFT, Info on RIGHT (Alternated!) */}
      <DepartmentSection
        title="Laboratory & Ward Infrastructure"
        description="Reliable pathology automation, clinical diagnostics, and hospital ward infrastructure."
        link="/category/diagnostic-lab"
        products={labAndInfraProducts}
        imagePosition="left"
        bgClass="bg-slate-50/70"
      />

      {/* Bottom Action Bar: Full Catalogue Direct Link */}
      <section className="py-12 bg-white text-center border-b border-slate-200/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="btn-outline-neutral py-3.5 px-8 text-xs sm:text-sm font-bold inline-flex items-center gap-2 group hover:bg-slate-900 hover:text-white transition-all shadow-xs"
          >
            <span>Browse Complete Equipment Catalogue ({PRODUCTS.length} Devices)</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
