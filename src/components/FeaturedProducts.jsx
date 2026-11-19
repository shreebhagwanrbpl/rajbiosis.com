'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import BrandCarouselSection from './BrandCarouselSection';
import { PRODUCTS } from '../data/products';
import { fetchLiveProductsFromAdmin } from '../utils/adminSync';
import { slugifyCategory, extractCategoriesFromProducts } from '../utils/categoryHelper';

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
    <div className="relative group/carousel w-full">
      {/* Left Arrow Button (Floating overlay) */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="absolute -left-2 sm:-left-3.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-lg flex items-center justify-center text-slate-700 hover:bg-white hover:text-slate-900 hover:scale-105 active:scale-95 transition cursor-pointer z-20"
          aria-label="Previous products"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      {/* Cards Scroll Track - 100% full width on mobile with smooth swipe */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-3.5 sm:gap-5 overflow-x-auto scroll-smooth scrollbar-none py-2 px-1 w-full"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {products.map((product) => (
          <div
            key={product.id || product.sku}
            className="w-[82vw] max-w-[290px] sm:w-[calc(50%-10px)] sm:max-w-none lg:w-[calc(33.333%-14px)] shrink-0 flex flex-col"
            style={{ scrollSnapAlign: 'start' }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Right Arrow Button (Floating overlay) */}
      <button
        type="button"
        onClick={() => handleScroll('right')}
        className={`absolute -right-2 sm:-right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full border shadow-lg flex items-center justify-center transition cursor-pointer z-20 ${
          isAtEnd
            ? 'bg-brand-600 border-brand-700 text-white hover:bg-brand-700 hover:scale-105 active:scale-95 shadow-brand-600/30'
            : 'bg-white/95 backdrop-blur-xs border-slate-200/90 text-slate-700 hover:bg-white hover:text-slate-900 hover:scale-105 active:scale-95'
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

  if (!products || products.length === 0) return null;

  return (
    <section className={`py-12 sm:py-16 md:py-20 border-b border-slate-200/80 ${bgClass}`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
          
          {/* Info Column */}
          <div
            className={`lg:col-span-3 xl:col-span-3 space-y-3.5 ${
              isImageRight ? 'order-1' : 'order-1 lg:order-2'
            }`}
          >
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

          {/* Products Carousel Column */}
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
  const [liveProducts, setLiveProducts] = useState(PRODUCTS);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await fetchLiveProductsFromAdmin();
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          setLiveProducts(data);
        }
      } catch (e) {
        // Fallback to cache PRODUCTS
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Dynamically extract top categories with at least 3 products
  const dynamicCategories = extractCategoriesFromProducts(liveProducts).slice(0, 4);

  return (
    <div>
      {/* 1. First Top Category Showcase */}
      {dynamicCategories[0] && (
        <DepartmentSection
          title={dynamicCategories[0].name}
          description={`Comprehensive range of certified ${dynamicCategories[0].name} for clinical laboratories and diagnostic centres.`}
          link={`/category/${dynamicCategories[0].slug}`}
          products={dynamicCategories[0].products}
          imagePosition="right"
          bgClass="bg-white"
        />
      )}

      {/* 2. Second Top Category Showcase */}
      {dynamicCategories[1] && (
        <DepartmentSection
          title={dynamicCategories[1].name}
          description={`High-accuracy ${dynamicCategories[1].name} with certified shelf-life and proven sensitivity.`}
          link={`/category/${dynamicCategories[1].slug}`}
          products={dynamicCategories[1].products}
          imagePosition="left"
          bgClass="bg-slate-50/70"
        />
      )}

      {/* 3. Authorized OEM Brands Showcase */}
      <BrandCarouselSection />

      {/* 4. Third Top Category Showcase */}
      {dynamicCategories[2] && (
        <DepartmentSection
          title={dynamicCategories[2].name}
          description={`Standard hospital and laboratory ${dynamicCategories[2].name} ready for immediate dispatch.`}
          link={`/category/${dynamicCategories[2].slug}`}
          products={dynamicCategories[2].products}
          imagePosition="right"
          bgClass="bg-white"
        />
      )}

      {/* 5. Fourth Top Category Showcase */}
      {dynamicCategories[3] && (
        <DepartmentSection
          title={dynamicCategories[3].name}
          description={`Specialized medical supplies and ${dynamicCategories[3].name} manufactured to rigorous standards.`}
          link={`/category/${dynamicCategories[3].slug}`}
          products={dynamicCategories[3].products}
          imagePosition="left"
          bgClass="bg-slate-50/70"
        />
      )}

      {/* Bottom Action Bar: Full Catalogue Direct Link */}
      <section className="py-12 bg-white text-center border-b border-slate-200/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="btn-outline-neutral py-3.5 px-8 text-xs sm:text-sm font-bold inline-flex items-center gap-2 group hover:bg-slate-900 hover:text-white transition-all shadow-xs"
          >
            <span>Browse Complete Equipment &amp; Reagents Catalogue ({liveProducts.length} Products)</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
