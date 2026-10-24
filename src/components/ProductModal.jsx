'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Download, 
  FileText, 
  ShoppingCart, 
  CheckCircle2, 
  Layers, 
  Wrench, 
  Clock, 
  Award, 
  Building,
  Check
} from 'lucide-react';

export default function ProductModal({ 
  product, 
  onClose, 
  onOpenRfq, 
  onAddToCart 
}) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs', 'features', 'warranty'

  if (!product) return null;

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleDownloadBrochure = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 3000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="modal-grid">
          {/* Left Column: Image & Media */}
          <div className="modal-media-col">
            <div className="modal-img-wrap">
              <img src={product.image} alt={product.name} className="modal-img" />
              {product.badge && (
                <span className="modal-img-badge">{product.badge}</span>
              )}
            </div>

            {/* Regulatory Accreditation Bar */}
            <div className="modal-certs-card">
              <div className="certs-card-title">
                <ShieldCheck size={16} className="text-emerald" />
                <span>Verified Regulatory Accreditations</span>
              </div>
              <div className="modal-cert-tags">
                {product.certifications.map((c, i) => (
                  <span key={i} className="cert-pill">
                    <CheckCircle2 size={12} className="text-emerald" /> {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Download Spec Sheet / Brochure */}
            <div className="brochure-download-box">
              <div className="brochure-info">
                <FileText size={20} className="text-cyan" />
                <div>
                  <div className="brochure-title">Technical Brochure & OEM Data Sheet</div>
                  <div className="brochure-meta">PDF • 4.2 MB • Clinical Manual Included</div>
                </div>
              </div>
              <button 
                onClick={handleDownloadBrochure} 
                className="btn btn-secondary btn-sm brochure-btn"
              >
                {downloadSuccess ? (
                  <>
                    <Check size={14} className="text-emerald" /> Downloaded!
                  </>
                ) : (
                  <>
                    <Download size={14} /> Download PDF
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Information & Order Action */}
          <div className="modal-info-col">
            <div className="info-header">
              <div className="brand-sku-line">
                <span className="brand-name">{product.brand}</span>
                <span className="sku-num">SKU: {product.sku}</span>
                <span className="stock-pill">
                  <span className="pulse-dot"></span> {product.stockStatus}
                </span>
              </div>

              <h2 className="modal-title">{product.name}</h2>
              <p className="modal-desc">{product.shortDesc}</p>
            </div>

            {/* Pricing Box */}
            <div className="modal-pricing-box">
              <div className="price-row">
                <div className="price-main">
                  <span className="price-amount">{formatINR(product.price)}</span>
                  <span className="price-mrp">{formatINR(product.mrp)}</span>
                </div>
                <div className="gst-note">
                  Institutional Price • Exclusive of GST (12% / 18%)
                </div>
              </div>

              {/* Bulk discount table */}
              {product.bulkPricing && (
                <div className="bulk-table-wrap">
                  <div className="bulk-title">Bulk Rate Contract (Hospitals & Medical Colleges):</div>
                  <div className="bulk-chips-row">
                    {product.bulkPricing.map((tier, idx) => (
                      <div key={idx} className="bulk-chip">
                        <span className="tier-qty">{tier.minQty}{tier.maxQty ? ` - ${tier.maxQty}` : '+'} Units</span>
                        <strong className="tier-price">{formatINR(tier.pricePerUnit)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tabs Navigation */}
            <div className="modal-tabs">
              <button 
                onClick={() => setActiveTab('specs')}
                className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
              >
                Technical Specifications
              </button>
              <button 
                onClick={() => setActiveTab('features')}
                className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
              >
                Key Clinical Features
              </button>
              <button 
                onClick={() => setActiveTab('warranty')}
                className={`tab-btn ${activeTab === 'warranty' ? 'active' : ''}`}
              >
                Installation & Warranty
              </button>
            </div>

            {/* Tab Contents */}
            <div className="tab-content-area">
              {activeTab === 'specs' && (
                <table className="specs-table">
                  <tbody>
                    {Object.entries(product.specs).map(([key, val]) => (
                      <tr key={key}>
                        <td className="spec-label">{key}</td>
                        <td className="spec-value">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'features' && (
                <ul className="features-list">
                  {product.features?.map((feat, idx) => (
                    <li key={idx} className="feature-item">
                      <CheckCircle2 size={16} className="text-emerald" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === 'warranty' && (
                <div className="warranty-content">
                  <div className="warranty-highlight">
                    <Wrench size={20} className="text-cyan" />
                    <div>
                      <strong>Standard Warranty:</strong> {product.warranty}
                    </div>
                  </div>
                  <div className="warranty-bullets">
                    <p>• <strong>Pan-India On-Site Installation:</strong> Certified biomedical engineer arrives within 48 hours of delivery to unbox, calibrate, and test the equipment.</p>
                    <p>• <strong>Hospital Staff Clinical Training:</strong> Free orientation session for doctors, nurses, and biomedical staff with training certificate.</p>
                    <p>• <strong>Preventive Maintenance:</strong> Includes 4 free quarterly preventive maintenance visits per year during warranty period.</p>
                    <p>• <strong>Direct Factory Spares:</strong> 10-year guaranteed availability for genuine OEM parts and accessories.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="modal-actions-bar">
              <button 
                onClick={() => {
                  onOpenRfq(product);
                  onClose();
                }} 
                className="btn btn-rfq modal-rfq-btn"
              >
                <FileText size={18} />
                <span>Request Institutional Quotation (RFQ)</span>
              </button>

              <button 
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }} 
                className="btn btn-secondary modal-cart-btn"
              >
                <ShoppingCart size={18} />
                <span>Add to PO List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          overflow-y: auto;
        }

        .modal-container {
          background: #ffffff;
          border-radius: 20px;
          max-width: 980px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.3);
          border: 1px solid #e2e8f0;
        }

        .modal-close-btn {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: #f1f5f9;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          z-index: 10;
          transition: background 0.15s, color 0.15s;
        }

        .modal-close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .modal-grid {
          display: grid;
          grid-template-columns: 420px 1fr;
          gap: 2rem;
          padding: 2rem;
        }

        /* Media Column */
        .modal-media-col {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .modal-img-wrap {
          position: relative;
          width: 100%;
          height: 320px;
          background: #f8fafc;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .modal-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .modal-img-badge {
          position: absolute;
          top: 0.85rem;
          left: 0.85rem;
          background: #0284c7;
          color: white;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .modal-certs-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1rem;
        }

        .certs-card-title {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: #334155;
          margin-bottom: 0.65rem;
        }

        .modal-cert-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .cert-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.74rem;
          font-weight: 600;
          color: #065f46;
          background: #ecfdf5;
          padding: 0.2rem 0.55rem;
          border-radius: 4px;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .brochure-download-box {
          background: #f0f9ff;
          border: 1px dashed #7dd3fc;
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .brochure-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brochure-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #0369a1;
        }

        .brochure-meta {
          font-size: 0.72rem;
          color: #64748b;
        }

        .brochure-btn {
          width: 100%;
        }

        /* Info Column */
        .modal-info-col {
          display: flex;
          flex-direction: column;
        }

        .brand-sku-line {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
          font-size: 0.78rem;
        }

        .brand-name {
          font-weight: 800;
          color: #0284c7;
          text-transform: uppercase;
        }

        .sku-num {
          color: #94a3b8;
          font-family: monospace;
          font-weight: 600;
        }

        .stock-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: #065f46;
          background: #ecfdf5;
          padding: 0.15rem 0.5rem;
          border-radius: 9999px;
          border: 1px solid rgba(16, 185, 129, 0.25);
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          display: inline-block;
        }

        .modal-title {
          font-size: 1.55rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.25;
          margin-bottom: 0.5rem;
        }

        .modal-desc {
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 1.25rem;
        }

        /* Pricing Box */
        .modal-pricing-box {
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          padding: 1.15rem;
          margin-bottom: 1.25rem;
        }

        .price-row {
          margin-bottom: 0.85rem;
        }

        .price-main {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
          margin-bottom: 0.25rem;
        }

        .price-amount {
          font-size: 1.85rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .price-mrp {
          font-size: 1.05rem;
          color: #94a3b8;
          text-decoration: line-through;
        }

        .gst-note {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }

        .bulk-table-wrap {
          border-top: 1px solid #e2e8f0;
          padding-top: 0.75rem;
        }

        .bulk-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: #334155;
          margin-bottom: 0.45rem;
          text-transform: uppercase;
        }

        .bulk-chips-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .bulk-chip {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 0.35rem 0.65rem;
          font-size: 0.75rem;
        }

        .tier-qty {
          color: #64748b;
          font-size: 0.68rem;
        }

        .tier-price {
          color: #0d9488;
        }

        /* Tabs */
        .modal-tabs {
          display: flex;
          gap: 0.5rem;
          border-bottom: 1.5px solid #e2e8f0;
          margin-bottom: 1rem;
        }

        .tab-btn {
          padding: 0.65rem 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
          border-bottom: 2px solid transparent;
          margin-bottom: -1.5px;
          transition: all 0.2s;
        }

        .tab-btn:hover {
          color: #0284c7;
        }

        .tab-btn.active {
          color: #0284c7;
          border-bottom-color: #0284c7;
          font-weight: 700;
        }

        /* Tab Content */
        .tab-content-area {
          flex: 1;
          margin-bottom: 1.5rem;
          max-height: 220px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .specs-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.82rem;
        }

        .specs-table tr {
          border-bottom: 1px solid #f1f5f9;
        }

        .spec-label {
          padding: 0.5rem 0.5rem 0.5rem 0;
          color: #64748b;
          font-weight: 600;
          width: 40%;
        }

        .spec-value {
          padding: 0.5rem 0;
          color: #0f172a;
          font-weight: 600;
        }

        .features-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #334155;
          line-height: 1.4;
        }

        .warranty-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          font-size: 0.82rem;
          color: #475569;
        }

        .warranty-highlight {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          background: #f0fdfa;
          border: 1px solid rgba(13, 148, 136, 0.2);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          color: #0f172a;
        }

        .warranty-bullets {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          line-height: 1.5;
        }

        /* Actions Bar */
        .modal-actions-bar {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 0.75rem;
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .modal-rfq-btn {
          height: 48px;
        }

        .modal-cart-btn {
          height: 48px;
        }

        .text-cyan {
          color: #0284c7;
        }

        .text-emerald {
          color: #10b981;
        }

        @media (max-width: 860px) {
          .modal-grid {
            grid-template-columns: 1fr;
            padding: 1.25rem;
          }
          .modal-img-wrap {
            height: 240px;
          }
          .modal-actions-bar {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
