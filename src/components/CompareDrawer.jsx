'use client';

import React, { useState } from 'react';
import { 
  X, 
  ArrowRightLeft, 
  Trash2, 
  Check, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Maximize2, 
  Minimize2 
} from 'lucide-react';

export default function CompareDrawer({ 
  comparedProducts, 
  onRemoveCompare, 
  onClearCompare, 
  isOpen, 
  onClose,
  onOpenRfq 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (comparedProducts.length === 0) return null;

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Collect all unique spec keys across compared products
  const allSpecKeys = Array.from(
    new Set(comparedProducts.flatMap(p => Object.keys(p.specs || {})))
  );

  return (
    <>
      {/* Sticky Bottom Pill / Bar when drawer is minimized */}
      {!isExpanded && (
        <div className="compare-bottom-bar animate-fade-in">
          <div className="container bar-content">
            <div className="bar-left">
              <div className="bar-icon-wrap">
                <ArrowRightLeft size={18} />
              </div>
              <div className="bar-text">
                <strong>Equipment Comparison Matrix ({comparedProducts.length}/3)</strong>
                <span className="items-preview">
                  {comparedProducts.map(p => p.name).join(' vs ')}
                </span>
              </div>
            </div>

            <div className="bar-actions">
              <button onClick={onClearCompare} className="bar-clear-btn">
                Clear
              </button>
              <button onClick={() => setIsExpanded(true)} className="btn btn-primary btn-sm">
                <Maximize2 size={14} /> Compare Side-by-Side
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Comparison Modal when expanded */}
      {isExpanded && (
        <div className="compare-modal-backdrop" onClick={() => setIsExpanded(false)}>
          <div className="compare-modal-container animate-fade-in" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="compare-header">
              <div className="compare-header-title">
                <ArrowRightLeft size={20} className="text-cyan" />
                <h3>Biomedical Equipment Side-by-Side Matrix</h3>
              </div>
              <div className="compare-header-actions">
                <button onClick={onClearCompare} className="btn btn-secondary btn-sm">
                  <Trash2 size={14} /> Clear All
                </button>
                <button onClick={() => setIsExpanded(false)} className="close-icon-btn">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="compare-table-wrapper">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th className="feature-col">Parameters</th>
                    {comparedProducts.map(prod => (
                      <th key={prod.id} className="product-col">
                        <div className="prod-col-header">
                          <button 
                            onClick={() => onRemoveCompare(prod.id)} 
                            className="remove-prod-btn" 
                            title="Remove from comparison"
                          >
                            <X size={14} />
                          </button>
                          <img src={prod.image} alt={prod.name} className="prod-col-img" />
                          <span className="prod-col-brand">{prod.brand}</span>
                          <h4 className="prod-col-title">{prod.name}</h4>
                          <div className="prod-col-price">{formatINR(prod.price)}</div>
                          <button 
                            onClick={() => {
                              onOpenRfq(prod);
                              setIsExpanded(false);
                            }} 
                            className="btn btn-rfq btn-sm w-full"
                          >
                            <FileText size={13} /> Request Quote
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Category */}
                  <tr>
                    <td className="row-label">Department / Unit</td>
                    {comparedProducts.map(prod => (
                      <td key={prod.id} className="row-val">
                        <span className="badge badge-primary">{prod.category}</span>
                      </td>
                    ))}
                  </tr>

                  {/* Certifications */}
                  <tr>
                    <td className="row-label">Regulatory Certifications</td>
                    {comparedProducts.map(prod => (
                      <td key={prod.id} className="row-val">
                        <div className="certs-cell">
                          {prod.certifications.map((c, i) => (
                            <span key={i} className="cert-micro-pill">
                              <CheckCircle2 size={11} className="text-emerald" /> {c}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Stock Status */}
                  <tr>
                    <td className="row-label">Availability / Lead Time</td>
                    {comparedProducts.map(prod => (
                      <td key={prod.id} className="row-val">
                        <span className="text-emerald font-semibold">{prod.stockStatus}</span>
                      </td>
                    ))}
                  </tr>

                  {/* Warranty */}
                  <tr>
                    <td className="row-label">Warranty & Engineering Support</td>
                    {comparedProducts.map(prod => (
                      <td key={prod.id} className="row-val font-semibold">
                        {prod.warranty}
                      </td>
                    ))}
                  </tr>

                  {/* Technical Specs Breakdown */}
                  {allSpecKeys.map(key => (
                    <tr key={key}>
                      <td className="row-label">{key}</td>
                      {comparedProducts.map(prod => (
                        <td key={prod.id} className="row-val">
                          {prod.specs[key] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Sticky Bottom Bar */
        .compare-bottom-bar {
          position: fixed;
          bottom: 1.25rem;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 960px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          color: white;
          padding: 0.85rem 1.5rem;
          border-radius: 9999px;
          border: 1.5px solid rgba(56, 189, 248, 0.4);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4), 0 0 20px rgba(14, 165, 233, 0.3);
          z-index: 900;
        }

        .bar-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .bar-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          overflow: hidden;
        }

        .bar-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .bar-text {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .bar-text strong {
          font-size: 0.85rem;
          color: #f8fafc;
        }

        .items-preview {
          font-size: 0.75rem;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bar-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .bar-clear-btn {
          color: #94a3b8;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .bar-clear-btn:hover {
          color: #ffffff;
        }

        /* Full Modal */
        .compare-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .compare-modal-container {
          background: #ffffff;
          border-radius: 20px;
          max-width: 1100px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 60px -15px rgba(0,0,0,0.4);
        }

        .compare-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.75rem;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .compare-header-title {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .compare-header-title h3 {
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
        }

        .compare-header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .close-icon-btn {
          color: #64748b;
          padding: 0.35rem;
          border-radius: 50%;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .compare-table-wrapper {
          overflow-x: auto;
          overflow-y: auto;
          padding: 1.5rem;
          flex: 1;
        }

        .compare-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }

        .feature-col {
          width: 220px;
          background: #f8fafc;
          padding: 1rem;
          text-align: left;
          font-weight: 700;
          color: #334155;
          border: 1px solid #e2e8f0;
          vertical-align: top;
        }

        .product-col {
          min-width: 240px;
          border: 1px solid #e2e8f0;
          padding: 1.25rem 1rem;
          vertical-align: top;
        }

        .prod-col-header {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.4rem;
        }

        .remove-prod-btn {
          position: absolute;
          top: -0.5rem;
          right: -0.25rem;
          background: #fee2e2;
          color: #ef4444;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .prod-col-img {
          width: 110px;
          height: 90px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          margin-bottom: 0.4rem;
        }

        .prod-col-brand {
          font-size: 0.72rem;
          font-weight: 700;
          color: #0284c7;
          text-transform: uppercase;
        }

        .prod-col-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.3;
          min-height: 2.4rem;
        }

        .prod-col-price {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }

        .row-label {
          background: #f8fafc;
          padding: 0.75rem 1rem;
          font-weight: 600;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .row-val {
          padding: 0.75rem 1rem;
          border: 1px solid #e2e8f0;
          color: #0f172a;
          vertical-align: middle;
        }

        .certs-cell {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }

        .cert-micro-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
          font-size: 0.72rem;
          background: #ecfdf5;
          color: #065f46;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .text-cyan {
          color: #0284c7;
        }

        .text-emerald {
          color: #10b981;
        }

        .font-semibold {
          font-weight: 600;
        }

        .w-full {
          width: 100%;
        }

        @media (max-width: 640px) {
          .compare-bottom-bar {
            width: 95%;
            padding: 0.65rem 1rem;
          }
          .items-preview {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
