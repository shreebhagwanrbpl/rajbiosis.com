'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe2, Check } from 'lucide-react';
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from '../data/internationalCodes';

export default function CountryCodeSelector({
  value = DEFAULT_COUNTRY_CODE,
  onChange,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  const selected = COUNTRY_CODES.find(c => c.code === value) || COUNTRY_CODES[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = COUNTRY_CODES.filter(c =>
    c.country.toLowerCase().includes(search.toLowerCase()) ||
    c.code.includes(search)
  );

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-full inline-flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200/90 text-slate-800 text-xs sm:text-sm font-bold border border-slate-300 rounded-l-xl transition outline-none cursor-pointer select-none"
        title="Select Country Calling Code"
      >
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="font-mono">{selected.code}</span>
        <ChevronDown size={13} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden py-1 text-xs">
          <div className="p-2 border-b border-slate-100 bg-slate-50">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country or code..."
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-500"
              autoFocus
            />
          </div>
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
            {filtered.map((item) => (
              <button
                key={`${item.code}-${item.country}`}
                type="button"
                onClick={() => {
                  onChange(item.code);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                  item.code === value ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base">{item.flag}</span>
                  <span className="truncate">{item.country}</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500 shrink-0 ml-2">
                  <span>{item.code}</span>
                  {item.code === value && <Check size={12} className="text-brand-600" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
