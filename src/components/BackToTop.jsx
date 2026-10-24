'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to Top"
      className={`fixed z-40 flex items-center justify-center rounded-full transition-all duration-300 outline-none select-none ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      } bottom-20 sm:bottom-6 right-4 sm:right-6 w-11 h-11 sm:w-12 sm:h-12 bg-white hover:bg-red-600 text-red-600 hover:text-white shadow-md hover:shadow-xl border-2 border-red-500 hover:border-red-600 group active:scale-95 cursor-pointer`}
    >
      <ChevronUp 
        size={22} 
        className="stroke-[3] transition-transform duration-200 group-hover:-translate-y-0.5" 
      />
    </button>
  );
}
