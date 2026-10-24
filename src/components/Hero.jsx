'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Clock, 
  Building2, 
  Award, 
  CheckCircle2, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';

export default function Hero({ onSelectCategory, onOpenRfq }) {
  const [selectedDept, setSelectedDept] = useState('all');
  const [budgetTier, setBudgetTier] = useState('any');

  const handleFinderSubmit = (e) => {
    e.preventDefault();
    onSelectCategory(selectedDept);
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-glow-1"></div>
      <div className="hero-glow-2"></div>
      
      <div className="container hero-container">
        <div className="hero-content">
          {/* Eyebrow badge */}
          <div className="hero-eyebrow">
            <span className="eyebrow-pill">
              <Sparkles size={14} className="text-cyan" /> India's B2B Healthcare Infrastructure Platform
            </span>
            <span className="eyebrow-note">
              <ShieldCheck size={14} className="text-emerald" /> 100% Direct OEM Verified
            </span>
          </div>

          {/* Main Title */}
          <h1 className="hero-title">
            Advanced <span className="text-gradient">Biomedical & ICU</span> Equipment for Modern Hospitals
          </h1>

          {/* Subtitle */}
          <p className="hero-desc">
            Direct institutional procurement for Hospitals, Medical Colleges, and Diagnostic Centers. 
            Get guaranteed OEM calibration, NABH compliance certification, 24/7 biomedical engineer installation, 
            and transparent bulk institutional pricing.
          </p>

          {/* Institutional Trust Highlights */}
          <div className="hero-highlights">
            <div className="highlight-item">
              <CheckCircle2 size={16} className="text-emerald" />
              <span>US-FDA & CE Certified</span>
            </div>
            <div className="highlight-item">
              <CheckCircle2 size={16} className="text-emerald" />
              <span>AERB Approved X-Ray & C-Arm</span>
            </div>
            <div className="highlight-item">
              <CheckCircle2 size={16} className="text-emerald" />
              <span>Free Biomedical Installation</span>
            </div>
            <div className="highlight-item">
              <CheckCircle2 size={16} className="text-emerald" />
              <span>Institutional Credit / GST</span>
            </div>
          </div>

          {/* Smart Equipment Finder Widget */}
          <div className="smart-finder-card">
            <div className="finder-header">
              <div className="finder-title">
                <Filter size={16} className="text-cyan" />
                <span>Smart Hospital Procurement Finder</span>
              </div>
              <span className="finder-hint">Instant match across 2,800+ devices</span>
            </div>

            <form onSubmit={handleFinderSubmit} className="finder-form">
              <div className="finder-field">
                <label>Department / Specialty</label>
                <select 
                  value={selectedDept} 
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="finder-select"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.itemCount})
                    </option>
                  ))}
                </select>
              </div>

              <div className="finder-field">
                <label>Institutional Budget Range</label>
                <select 
                  value={budgetTier} 
                  onChange={(e) => setBudgetTier(e.target.value)}
                  className="finder-select"
                >
                  <option value="any">All Price Brackets</option>
                  <option value="under-1L">Under ₹1,00,000 (Monitors & Pumps)</option>
                  <option value="1L-5L">₹1,00,000 - ₹5,00,000 (Ventilators & Cautery)</option>
                  <option value="5L-15L">₹5,00,000+ (Imaging, DR X-Ray, C-Arm)</option>
                </select>
              </div>

              <div className="finder-btn-wrap">
                <button type="submit" className="btn btn-primary finder-submit-btn">
                  <span>Explore Equipment</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>

          {/* Metrics bar */}
          <div className="hero-metrics-grid">
            <div className="metric-box">
              <div className="metric-val">45,000+</div>
              <div className="metric-label">Hospitals & Clinics Supplied</div>
            </div>
            <div className="metric-box">
              <div className="metric-val">2,800+</div>
              <div className="metric-label">Certified Medical Devices</div>
            </div>
            <div className="metric-box">
              <div className="metric-val">180+ Cities</div>
              <div className="metric-label">On-Site Biomedical Engineers</div>
            </div>
            <div className="metric-box">
              <div className="metric-val">24-48 Hrs</div>
              <div className="metric-label">Critical ICU Emergency Dispatch</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-section {
          position: relative;
          background: linear-gradient(135deg, #090e1a 0%, #0f172a 60%, #13273e 100%);
          color: #ffffff;
          padding: 3.5rem 0 3rem 0;
          overflow: hidden;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .hero-glow-1 {
          position: absolute;
          top: -100px;
          right: 5%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.18) 0%, rgba(14, 165, 233, 0) 70%);
          pointer-events: none;
          filter: blur(40px);
        }

        .hero-glow-2 {
          position: absolute;
          bottom: -80px;
          left: 10%;
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0) 70%);
          pointer-events: none;
          filter: blur(40px);
        }

        .hero-container {
          position: relative;
          z-index: 2;
        }

        .hero-content {
          max-width: 950px;
          margin: 0 auto;
          text-align: center;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 1.25rem;
        }

        .eyebrow-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(14, 165, 233, 0.15);
          border: 1px solid rgba(14, 165, 233, 0.35);
          color: #7dd3fc;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .eyebrow-note {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #6ee7b7;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .hero-title {
          font-size: 2.85rem;
          font-weight: 800;
          line-height: 1.18;
          letter-spacing: -0.03em;
          margin-bottom: 1.25rem;
          color: #f8fafc;
        }

        .text-gradient {
          background: linear-gradient(135deg, #38bdf8 0%, #2dd4bf 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-desc {
          font-size: 1.05rem;
          color: #94a3b8;
          line-height: 1.6;
          max-width: 780px;
          margin: 0 auto 1.75rem auto;
        }

        .hero-highlights {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 2.25rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #cbd5e1;
        }

        .highlight-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        /* Smart Finder Card */
        .smart-finder-card {
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(16px);
          border: 1.5px solid rgba(56, 189, 248, 0.25);
          border-radius: 18px;
          padding: 1.25rem 1.5rem;
          box-shadow: 0 12px 36px -4px rgba(0, 0, 0, 0.5), 0 0 24px rgba(14, 165, 233, 0.15);
          margin-bottom: 2.75rem;
          text-align: left;
        }

        .finder-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.65rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .finder-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.88rem;
          font-weight: 700;
          color: #e2e8f0;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .finder-hint {
          font-size: 0.78rem;
          color: #64748b;
        }

        .finder-form {
          display: grid;
          grid-template-columns: 1.5fr 1.3fr auto;
          gap: 1rem;
          align-items: flex-end;
        }

        .finder-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .finder-field label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #94a3b8;
        }

        .finder-select {
          background: #1e293b;
          border: 1px solid #334155;
          color: #f8fafc;
          padding: 0.75rem 0.85rem;
          border-radius: 10px;
          font-size: 0.9rem;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .finder-select:focus {
          border-color: #38bdf8;
        }

        .finder-submit-btn {
          height: 48px;
          padding: 0 1.5rem;
          white-space: nowrap;
          border-radius: 10px;
        }

        /* Metrics Grid */
        .hero-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .metric-box {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .metric-val {
          font-size: 1.75rem;
          font-weight: 800;
          color: #38bdf8;
          letter-spacing: -0.02em;
        }

        .metric-label {
          font-size: 0.78rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .text-cyan {
          color: #38bdf8;
        }

        .text-emerald {
          color: #34d399;
        }

        @media (max-width: 900px) {
          .hero-title {
            font-size: 2.1rem;
          }
          .finder-form {
            grid-template-columns: 1fr;
          }
          .finder-submit-btn {
            width: 100%;
          }
          .hero-metrics-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
          }
        }

        @media (max-width: 600px) {
          .hero-title {
            font-size: 1.75rem;
          }
          .hero-metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
