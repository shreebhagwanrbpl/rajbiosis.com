'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Building2, 
  CheckCircle2, 
  Download, 
  Printer, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  RotateCcw 
} from 'lucide-react';

export default function RfqModal({ 
  product, 
  allProducts,
  onClose 
}) {
  const [step, setStep] = useState(1); // 1: Form, 2: Quotation Sheet Preview
  const [selectedProdId, setSelectedProdId] = useState(product ? product.id : (allProducts[0]?.id || ''));
  const [quantity, setQuantity] = useState(1);
  const [amcOption, setAmcOption] = useState('1yr'); // 'none', '1yr', '3yr'
  const [needInstallation, setNeedInstallation] = useState(true);
  
  // Hospital Form Data
  const [formData, setFormData] = useState({
    hospitalName: 'Apollo Care Super Speciality Hospital',
    gstin: '27AABCA1234F1Z8',
    contactPerson: 'Dr. Rajesh Sharma (Medical Director)',
    phone: '+91 98201 44552',
    email: 'procurement@apollocare.org',
    city: 'Mumbai, Maharashtra',
    pincode: '400001',
    urgency: 'Within 7 Days'
  });

  // Sync with user profile if saved in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('rajbiosis_user_profile');
        if (stored) {
          const profile = JSON.parse(stored);
          setFormData((prev) => ({
            ...prev,
            hospitalName: profile.hospitalName || prev.hospitalName,
            gstin: profile.gstin || prev.gstin,
            contactPerson: profile.fullName
              ? `${profile.fullName}${profile.designation ? ` (${profile.designation})` : ''}`
              : prev.contactPerson,
            phone: profile.phone
              ? (profile.phone.startsWith('+91') ? profile.phone : `+91 ${profile.phone}`)
              : prev.phone,
            email: profile.email || prev.email,
            city: profile.district || profile.city
              ? `${profile.district || profile.city}${profile.state ? `, ${profile.state}` : ''}`
              : prev.city,
            pincode: profile.pincode || prev.pincode
          }));
        }
      } catch (err) {
        console.error('Failed to load user profile in RFQ modal', err);
      }
    }
  }, []);

  const [quoteRef] = useState(`RAJ-RFQ-${Math.floor(100000 + Math.random() * 900000)}`);
  const [quoteDate] = useState(new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }));

  const activeProduct = allProducts.find(p => p.id === selectedProdId) || product || allProducts[0];

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Pricing calculations
  const unitPrice = activeProduct ? activeProduct.price : 100000;
  const baseTotal = unitPrice * quantity;
  
  // AMC Rate
  const amcCost = amcOption === '1yr' 
    ? Math.round(baseTotal * 0.08) 
    : amcOption === '3yr' 
      ? Math.round(baseTotal * 0.18) 
      : 0;

  // Medical Equipment GST rate (12% standard or 18% for high-tech imaging)
  const gstRate = activeProduct?.category === 'radiology-imaging' ? 0.18 : 0.12;
  const gstAmount = Math.round((baseTotal + amcCost) * gstRate);
  const grandTotal = baseTotal + amcCost + gstAmount;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="rfq-icon-box">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="modal-title">Institutional Request for Quotation (RFQ)</h3>
              <p className="modal-subtitle">Generate official B2B quotation for hospital purchase committees</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Step 1: Input Form */}
        {step === 1 && (
          <div className="modal-body-content">
            <div className="rfq-grid-2col">
              {/* Left Column: Hospital / Buyer Info */}
              <div className="rfq-col">
                <h4 className="rfq-section-title">
                  <Building2 size={16} className="text-cyan" />
                  <span>1. Healthcare Institution Credentials</span>
                </h4>

                <div className="form-group">
                  <label>Hospital / Clinic / Diagnostic Lab Name *</label>
                  <input
                    type="text"
                    value={formData.hospitalName}
                    onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
                    placeholder="e.g. Max Multi-Speciality Hospital"
                    className="form-input"
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Hospital GSTIN / PAN *</label>
                    <input
                      type="text"
                      value={formData.gstin}
                      onChange={(e) => setFormData({...formData, gstin: e.target.value})}
                      placeholder="e.g. 27AAAAA0000A1Z5"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Procurement Urgency</label>
                    <select
                      value={formData.urgency}
                      onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                      className="form-input"
                    >
                      <option value="Immediate (48h)">Immediate Emergency (48h)</option>
                      <option value="Within 7 Days">Within 7 Days</option>
                      <option value="Within 30 Days">Within 30 Days</option>
                      <option value="Annual Budgeting">Annual Capex Budgeting</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Medical Director / Purchase In-charge</label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                      placeholder="Name & Designation"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Institutional Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+91 Phone"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Institutional Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="procurement@hospital.org"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Delivery City & State</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="City, State"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Equipment & Options */}
              <div className="rfq-col">
                <h4 className="rfq-section-title">
                  <ShieldCheck size={16} className="text-emerald" />
                  <span>2. Equipment Configuration & AMC Package</span>
                </h4>

                <div className="form-group">
                  <label>Select Biomedical Equipment *</label>
                  <select
                    value={selectedProdId}
                    onChange={(e) => setSelectedProdId(e.target.value)}
                    className="form-input"
                  >
                    {allProducts.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.brand}) - {formatINR(p.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Required Quantity (Units)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Comprehensive AMC Protection</label>
                    <select
                      value={amcOption}
                      onChange={(e) => setAmcOption(e.target.value)}
                      className="form-input"
                    >
                      <option value="none">Standard Warranty Only (Free)</option>
                      <option value="1yr">1-Year Comprehensive AMC (+8%)</option>
                      <option value="3yr">3-Year Gold Full-Spares AMC (+18%)</option>
                    </select>
                  </div>
                </div>

                <div className="checkbox-wrap">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={needInstallation}
                      onChange={(e) => setNeedInstallation(e.target.checked)}
                      className="custom-check"
                    />
                    <span>Include Certified Biomedical Engineer Installation & Training (Free of Charge)</span>
                  </label>
                </div>

                {/* Estimate Summary Box */}
                <div className="estimate-summary-box">
                  <div className="est-title">Estimated Institutional Total:</div>
                  <div className="est-line">
                    <span>Base Equipment Price ({quantity}x):</span>
                    <strong>{formatINR(baseTotal)}</strong>
                  </div>
                  {amcCost > 0 && (
                    <div className="est-line">
                      <span>Comprehensive AMC Addon:</span>
                      <strong>{formatINR(amcCost)}</strong>
                    </div>
                  )}
                  <div className="est-line">
                    <span>Estimated GST ({(gstRate * 100).toFixed(0)}%):</span>
                    <strong>{formatINR(gstAmount)}</strong>
                  </div>
                  <div className="est-line total">
                    <span>Net Institutional Quotation Value:</span>
                    <span className="est-grand">{formatINR(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="modal-footer">
              <button onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button 
                onClick={() => setStep(2)} 
                className="btn btn-primary generate-btn"
              >
                <span>Generate Official Quotation Sheet</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Generated Formal Quotation Sheet */}
        {step === 2 && (
          <div className="modal-body-content">
            <div className="quote-sheet-preview printable-area">
              {/* Quote Sheet Header */}
              <div className="sheet-top">
                <div className="sheet-brand">
                  <h2>Raj <span className="text-cyan">Biosis</span> Healthcare Systems Ltd.</h2>
                  <p>Central Biomedical Depot: Plot 84, Medical Device Park, Navi Mumbai - 410208</p>
                  <p>GSTIN: 27AABCR8829J1Z5 • CDSCO License: MD-MH-2024-99120</p>
                </div>
                <div className="sheet-meta">
                  <div className="quote-id-badge">FORMAL QUOTATION</div>
                  <div className="quote-meta-row"><strong>Ref No:</strong> {quoteRef}</div>
                  <div className="quote-meta-row"><strong>Date:</strong> {quoteDate}</div>
                  <div className="quote-meta-row"><strong>Validity:</strong> 30 Days</div>
                </div>
              </div>

              {/* Buyer Block */}
              <div className="sheet-buyer-block">
                <div className="buyer-title">PREPARED FOR:</div>
                <div className="buyer-name">{formData.hospitalName}</div>
                <div className="buyer-detail">GSTIN: {formData.gstin}</div>
                <div className="buyer-detail">Attn: {formData.contactPerson}</div>
                <div className="buyer-detail">Location: {formData.city} • Ph: {formData.phone}</div>
              </div>

              {/* Itemized Table */}
              <table className="sheet-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Model SKU</th>
                    <th>Qty</th>
                    <th>Unit Price (INR)</th>
                    <th>Subtotal (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>{activeProduct.name}</strong>
                      <div className="sheet-item-sub">
                        Brand: {activeProduct.brand} • Certs: {activeProduct.certifications.join(', ')}
                      </div>
                      <div className="sheet-item-sub">
                        Warranty: {activeProduct.warranty}
                      </div>
                    </td>
                    <td>{activeProduct.sku}</td>
                    <td>{quantity}</td>
                    <td>{formatINR(unitPrice)}</td>
                    <td>{formatINR(baseTotal)}</td>
                  </tr>

                  {amcCost > 0 && (
                    <tr>
                      <td>
                        <strong>Comprehensive AMC Support Package</strong>
                        <div className="sheet-item-sub">
                          {amcOption === '1yr' ? '1 Year Full Coverage' : '3 Years Gold Multi-Year Coverage'}
                        </div>
                      </td>
                      <td>AMX-AMC-SVC</td>
                      <td>1</td>
                      <td>{formatINR(amcCost)}</td>
                      <td>{formatINR(amcCost)}</td>
                    </tr>
                  )}

                  {needInstallation && (
                    <tr>
                      <td>
                        <strong>Certified Biomedical Engineer Installation & Training</strong>
                        <div className="sheet-item-sub">On-site clinical calibration & electrical safety testing</div>
                      </td>
                      <td>AMX-INST-00</td>
                      <td>1</td>
                      <td>Included (₹0)</td>
                      <td>₹0</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Financial Breakdown */}
              <div className="sheet-financials">
                <div className="sheet-notes">
                  <strong>Terms & Conditions:</strong>
                  <ol>
                    <li>Delivery timeline: {formData.urgency} from receipt of institutional purchase order.</li>
                    <li>Payment terms: 30% advance with Purchase Order, 70% against delivery and satisfactory installation.</li>
                    <li>Institutional GST invoice with full input tax credit eligibility provided.</li>
                    <li>AERB / CDSCO regulatory compliance documentation supplied with consignment.</li>
                  </ol>
                </div>

                <div className="sheet-totals">
                  <div className="total-row">
                    <span>Taxable Base Value:</span>
                    <span>{formatINR(baseTotal + amcCost)}</span>
                  </div>
                  <div className="total-row">
                    <span>Applicable GST ({(gstRate * 100).toFixed(0)}%):</span>
                    <span>{formatINR(gstAmount)}</span>
                  </div>
                  <div className="total-row grand">
                    <span>Net Institutional Total:</span>
                    <span>{formatINR(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Signoff block */}
              <div className="sheet-signoff">
                <div className="sign-col">
                  <div className="sign-line"></div>
                  <div className="sign-label">Prepared by: Institutional Sales Desk</div>
                  <div className="sign-sub">Raj Biosis Biomedical Ltd.</div>
                </div>
                <div className="sign-col right">
                  <div className="sign-seal">
                    <ShieldCheck size={28} className="text-cyan" />
                    <span>VERIFIED OEM QUOTATION</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions for Quote Sheet */}
            <div className="modal-footer">
              <button onClick={() => setStep(1)} className="btn btn-secondary">
                <RotateCcw size={15} /> Edit Details
              </button>
              <button onClick={handlePrint} className="btn btn-primary">
                <Printer size={16} /> Print Official Quotation Sheet
              </button>
              <button onClick={onClose} className="btn btn-rfq">
                <CheckCircle2 size={16} /> Submit to Hospital Committee
              </button>
            </div>
          </div>
        )}
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

        .modal-card {
          background: #ffffff;
          border-radius: 20px;
          max-width: 950px;
          width: 100%;
          max-height: 92vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.35);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.75rem;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .modal-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .rfq-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #0d9488;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
        }

        .modal-subtitle {
          font-size: 0.8rem;
          color: #64748b;
        }

        .modal-close-btn {
          color: #64748b;
          background: #e2e8f0;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-body-content {
          padding: 1.75rem;
        }

        .rfq-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 1.5rem;
        }

        .rfq-col {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .rfq-section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.5rem;
          padding-bottom: 0.4rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .form-group label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #475569;
        }

        .form-input {
          padding: 0.65rem 0.85rem;
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.88rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          border-color: #0284c7;
          background: #ffffff;
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .checkbox-wrap {
          margin-top: 0.25rem;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #334155;
          cursor: pointer;
        }

        .custom-check {
          accent-color: #0284c7;
          margin-top: 0.15rem;
        }

        .estimate-summary-box {
          background: #f0fdfa;
          border: 1.5px solid #99f6e4;
          border-radius: 12px;
          padding: 1rem;
          margin-top: 0.5rem;
        }

        .est-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: #0f766e;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .est-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          color: #334155;
          margin-bottom: 0.3rem;
        }

        .est-line.total {
          border-top: 1px solid #ccfbf1;
          padding-top: 0.5rem;
          margin-top: 0.4rem;
          font-weight: 700;
        }

        .est-grand {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f766e;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.85rem;
          border-top: 1px solid #e2e8f0;
          padding-top: 1.25rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }

        /* Formal Sheet Preview */
        .quote-sheet-preview {
          background: #ffffff;
          border: 2px solid #cbd5e1;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          margin-bottom: 1rem;
        }

        .sheet-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 1rem;
          margin-bottom: 1.25rem;
        }

        .sheet-brand h2 {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
        }

        .sheet-brand p {
          font-size: 0.74rem;
          color: #64748b;
        }

        .sheet-meta {
          text-align: right;
        }

        .quote-id-badge {
          display: inline-block;
          background: #0284c7;
          color: white;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          margin-bottom: 0.35rem;
          letter-spacing: 0.05em;
        }

        .quote-meta-row {
          font-size: 0.78rem;
          color: #334155;
        }

        .sheet-buyer-block {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.85rem;
          margin-bottom: 1.25rem;
        }

        .buyer-title {
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 0.25rem;
        }

        .buyer-name {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
        }

        .buyer-detail {
          font-size: 0.78rem;
          color: #475569;
        }

        .sheet-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.5rem;
          font-size: 0.82rem;
        }

        .sheet-table th {
          background: #f1f5f9;
          padding: 0.65rem 0.85rem;
          text-align: left;
          font-weight: 700;
          color: #334155;
          border: 1px solid #e2e8f0;
        }

        .sheet-table td {
          padding: 0.75rem 0.85rem;
          border: 1px solid #e2e8f0;
          vertical-align: top;
        }

        .sheet-item-sub {
          font-size: 0.72rem;
          color: #64748b;
          margin-top: 0.2rem;
        }

        .sheet-financials {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .sheet-notes {
          font-size: 0.72rem;
          color: #64748b;
          line-height: 1.45;
        }

        .sheet-notes ol {
          padding-left: 1.15rem;
          margin-top: 0.35rem;
        }

        .sheet-totals {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          color: #475569;
        }

        .total-row.grand {
          border-top: 2px solid #0f172a;
          padding-top: 0.5rem;
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
        }

        .sheet-signoff {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .sign-col {
          width: 250px;
        }

        .sign-line {
          border-bottom: 1px solid #64748b;
          margin-bottom: 0.4rem;
        }

        .sign-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #0f172a;
        }

        .sign-sub {
          font-size: 0.7rem;
          color: #64748b;
        }

        .sign-seal {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: 2px dashed #0284c7;
          border-radius: 8px;
          padding: 0.5rem 0.85rem;
          font-size: 0.72rem;
          font-weight: 800;
          color: #0284c7;
        }

        .text-cyan {
          color: #0284c7;
        }

        .text-emerald {
          color: #10b981;
        }

        @media (max-width: 820px) {
          .rfq-grid-2col {
            grid-template-columns: 1fr;
          }
          .sheet-financials {
            grid-template-columns: 1fr;
          }
        }

        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
