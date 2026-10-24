'use client';

import React, { useState, useEffect, useRef } from 'react';

/**
 * GlobalTooltip
 * Automatically intercepts any element with a `title` or `data-tooltip` attribute 
 * across the entire website and transforms it into a sleek, modern, glassmorphic 
 * tooltip with instant response, subtle arrow, and zero layout shift.
 */
export default function GlobalTooltip() {
  const [tooltip, setTooltip] = useState({
    visible: false,
    text: '',
    x: 0,
    y: 0,
    placement: 'top' // 'top' | 'bottom'
  });

  const activeElementRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Only in browser
    if (typeof window === 'undefined') return;

    const handleMouseOver = (e) => {
      const target = e.target.closest('[title], [data-tooltip]');
      if (!target) return;

      // Check if inside SVG with nested title elements
      if (target.tagName.toLowerCase() === 'svg' && !target.hasAttribute('title') && !target.hasAttribute('data-tooltip')) {
        return;
      }

      const text = target.getAttribute('data-tooltip') || target.getAttribute('title');
      if (!text || !text.trim()) return;

      // Suppress native browser ugly tooltip by stashing title
      if (target.hasAttribute('title')) {
        target.setAttribute('data-orig-title', text);
        target.removeAttribute('title');
      }

      activeElementRef.current = target;

      // Calculate position
      updatePosition(target, text);
    };

    const updatePosition = (target, text) => {
      const rect = target.getBoundingClientRect();
      const padding = 8;
      const tooltipHeightApprox = 34;

      // Determine placement: prefer top unless near top of screen
      let placement = 'top';
      let y = rect.top - padding;

      if (rect.top < tooltipHeightApprox + padding + 10) {
        placement = 'bottom';
        y = rect.bottom + padding;
      }

      // Center horizontally on target element, clamped within screen margins
      const centerX = rect.left + rect.width / 2;
      const clampedX = Math.max(16, Math.min(window.innerWidth - 16, centerX));

      setTooltip({
        visible: true,
        text: text,
        x: clampedX,
        y: y,
        placement: placement
      });
    };

    const handleMouseOut = (e) => {
      const target = e.target.closest('[data-orig-title], [data-tooltip]');
      if (target) {
        // Restore native title for accessibility
        if (target.hasAttribute('data-orig-title')) {
          target.setAttribute('title', target.getAttribute('data-orig-title'));
          target.removeAttribute('data-orig-title');
        }
      }

      activeElementRef.current = null;
      setTooltip((prev) => ({ ...prev, visible: false }));
    };

    const handleScrollOrClick = () => {
      if (activeElementRef.current && activeElementRef.current.hasAttribute('data-orig-title')) {
        activeElementRef.current.setAttribute('title', activeElementRef.current.getAttribute('data-orig-title'));
        activeElementRef.current.removeAttribute('data-orig-title');
      }
      activeElementRef.current = null;
      setTooltip((prev) => ({ ...prev, visible: false }));
    };

    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseout', handleMouseOut, { passive: true });
    window.addEventListener('scroll', handleScrollOrClick, { passive: true });
    window.addEventListener('click', handleScrollOrClick, { passive: true });

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('scroll', handleScrollOrClick);
      window.removeEventListener('click', handleScrollOrClick);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!tooltip.visible || !tooltip.text) return null;

  return (
    <div
      role="tooltip"
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`,
        transform: tooltip.placement === 'top' 
          ? 'translate(-50%, -100%)' 
          : 'translate(-50%, 0)',
        pointerEvents: 'none',
        zIndex: 99999
      }}
      className="animate-in fade-in zoom-in-95 duration-150 select-none max-w-xs sm:max-w-sm"
    >
      <div className="relative bg-slate-900/95 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xl border border-slate-700/80 ring-1 ring-white/10 tracking-wide text-center leading-snug">
        <span>{tooltip.text}</span>

        {/* Dynamic Arrow Pointer */}
        {tooltip.placement === 'top' ? (
          <div 
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-slate-700/80 rotate-45" 
          />
        ) : (
          <div 
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-l border-t border-slate-700/80 rotate-45" 
          />
        )}
      </div>
    </div>
  );
}
