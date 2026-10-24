'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, ChevronDown, Check, Edit3, List, Search, X } from 'lucide-react';
import { ALL_DISTRICTS, INDIAN_STATES } from '../data/districts';

export default function DistrictSelector({
  value = '',
  onChange,
  onStateChange,
  selectedState = '',
  required = false,
  placeholder = 'Search district across India...',
  className = '',
  label = 'District'
}) {
  const [isManual, setIsManual] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState(selectedState || '');
  const dropdownRef = useRef(null);

  // If initial value isn't in standard list and is set, allow manual mode
  useEffect(() => {
    if (value && !ALL_DISTRICTS.some(d => d.name.toLowerCase() === value.toLowerCase())) {
      setIsManual(true);
    }
  }, []);

  useEffect(() => {
    if (selectedState) {
      setFilterState(selectedState);
    }
  }, [selectedState]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter districts across all India
  const filteredDistricts = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ALL_DISTRICTS.filter(d => {
      if (filterState && d.state !== filterState) return false;
      if (!q) return true;
      return d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q);
    });
  }, [search, filterState]);

  const handleSelectDistrict = (item) => {
    onChange(item.name);
    if (onStateChange && item.state) {
      onStateChange(item.state);
    }
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <MapPin size={13} className="text-slate-500" />
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>

        {/* Toggle between Dropdown and Manual typing */}
        <button
          type="button"
          onClick={() => {
            setIsManual(!isManual);
            setIsOpen(false);
          }}
          className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition inline-flex items-center gap-1 cursor-pointer"
        >
          {isManual ? (
            <>
              <List size={12} />
              <span>Choose from list (All India)</span>
            </>
          ) : (
            <>
              <Edit3 size={12} />
              <span>Type manually</span>
            </>
          )}
        </button>
      </div>

      {isManual ? (
        /* Manual Text Input Mode */
        <div className="relative">
          <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter district / city name..."
            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl outline-none font-medium transition"
          />
        </div>
      ) : (
        /* Searchable All-India Dropdown Mode */
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full pl-8 pr-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 focus:border-slate-800 text-left text-xs text-slate-900 rounded-xl outline-none font-semibold flex items-center justify-between transition cursor-pointer shadow-2xs"
          >
            <MapPin size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <span className={value ? 'font-semibold text-slate-900' : 'text-slate-400'}>
              {value || placeholder}
            </span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden text-xs">
              {/* Search & State Filter Controls inside Dropdown */}
              <div className="p-2.5 border-b border-slate-100 bg-slate-50 space-y-2">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search any district in India..."
                    className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-slate-800"
                    autoFocus
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* State Quick Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  <button
                    type="button"
                    onClick={() => setFilterState('')}
                    className={`px-2 py-0.5 rounded-md font-semibold shrink-0 cursor-pointer transition ${
                      !filterState ? 'bg-slate-900 text-white' : 'bg-slate-200/80 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    All States
                  </button>
                  {INDIAN_STATES.slice(0, 10).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFilterState(filterState === st ? '' : st)}
                      className={`px-2 py-0.5 rounded-md font-medium shrink-0 cursor-pointer transition ${
                        filterState === st ? 'bg-slate-900 text-white' : 'bg-slate-200/80 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* District List: Scrollable All 700+ */}
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                {filteredDistricts.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-xs">
                    No district found matching "{search}".
                    <button
                      type="button"
                      onClick={() => {
                        setIsManual(true);
                        setIsOpen(false);
                      }}
                      className="block mx-auto mt-1 font-bold text-red-600 hover:underline"
                    >
                      Type "{search}" manually &rarr;
                    </button>
                  </div>
                ) : (
                  filteredDistricts.map((item) => (
                    <button
                      key={`${item.name}-${item.state}`}
                      type="button"
                      onClick={() => handleSelectDistrict(item)}
                      className={`w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                        item.name === value ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-800'
                      }`}
                    >
                      <div>
                        <span className="font-semibold">{item.name}</span>
                        <span className="text-[11px] text-slate-400 ml-1.5 font-normal">
                          &bull; {item.state}
                        </span>
                      </div>
                      {item.name === value && <Check size={14} className="text-red-600" />}
                    </button>
                  ))
                )}
              </div>

              {/* Footer Option to switch to manual */}
              <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Total: {filteredDistricts.length} districts</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsManual(true);
                    setIsOpen(false);
                  }}
                  className="font-semibold text-red-600 hover:underline"
                >
                  Type manually
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
