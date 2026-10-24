// Utility for District-Based Customer Leads Management for Employees & Admin
export const LEADS_STORAGE_KEY = 'rajbiosis_all_leads';
export const LEADS_EVENT = 'rajbiosis-leads-updated';
export const PORTAL_AUTH_KEY = 'rajbiosis_portal_session';
export const PORTAL_AUTH_EVENT = 'rajbiosis-portal-auth-updated';

// Realistic sample seed leads across Rajasthan districts for initial depot staff testing
const DEFAULT_SEED_LEADS = [
  {
    id: 'LEAD-JAI-101',
    quoteNumber: 'RB-QT-2026-8801',
    customerName: 'Dr. Suresh Meena',
    designation: 'HOD Critical Care',
    hospitalName: 'SMS Medical College & Hospital',
    customerPhone: '+91 98290 12345',
    customerEmail: 'suresh.meena@rajasthan.gov.in',
    district: 'Jaipur',
    state: 'Rajasthan',
    productName: 'RajBiosis-Vent Pro-X9 Turbine Mechanical Ventilator',
    productSku: 'RAJ-ICU-8801',
    qty: 2,
    unitPrice: 485000,
    expectedPrice: 440000,
    isNegotiable: true,
    grandTotal: 1086400,
    status: 'New Lead',
    statusNote: 'Requested urgent quotation with technical compliance sheet for Rajasthan state tender.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    notes: ['Customer requires delivery within 3 days at SMS Trauma Center.']
  },
  {
    id: 'LEAD-JAI-102',
    quoteNumber: 'RB-QT-2026-6042',
    customerName: 'Dr. Ananya Mathur',
    designation: 'Medical Superintendent',
    hospitalName: 'Narayana Multispeciality Hospital',
    customerPhone: '+91 94140 55678',
    customerEmail: 'dr.ananya@narayanahealth.org',
    district: 'Jaipur',
    state: 'Rajasthan',
    productName: 'CardioPulse Multi-Para Patient Monitor 12.1"',
    productSku: 'RAJ-ICU-604',
    qty: 5,
    unitPrice: 68500,
    expectedPrice: 62000,
    isNegotiable: false,
    grandTotal: 383600,
    status: 'Contacted',
    statusNote: 'Spoke with biomedical procurement in-charge. Demo requested for Monday.',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    notes: ['Biomedical engineer demo arranged for OT ward.']
  },
  {
    id: 'LEAD-JOD-201',
    quoteNumber: 'RB-QT-2026-5001',
    customerName: 'Dr. Vikram Rathore',
    designation: 'Chief Radiologist',
    hospitalName: 'AIIMS Jodhpur Trauma Center',
    customerPhone: '+91 98281 99012',
    customerEmail: 'radiology@aiimsjodhpur.edu.in',
    district: 'Jodhpur',
    state: 'Rajasthan',
    productName: 'RajScan Elite High-Frequency 500mA Digital X-Ray System',
    productSku: 'RAJ-RAD-500D',
    qty: 1,
    unitPrice: 1250000,
    expectedPrice: 1180000,
    isNegotiable: true,
    grandTotal: 1400000,
    status: 'Quotation Sent',
    statusNote: 'Formal AERB layout approval and OEM quotation sent to procurement committee.',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    notes: ['AERB room layout clearance documents shared.']
  },
  {
    id: 'LEAD-KOT-301',
    quoteNumber: 'RB-QT-2026-4402',
    customerName: 'Dr. Neeraj Singhal',
    designation: 'Director',
    hospitalName: 'Kota Heart & Multi-speciality Institute',
    customerPhone: '+91 97840 33441',
    customerEmail: 'director@kotaheart.com',
    district: 'Kota',
    state: 'Rajasthan',
    productName: 'DefiQuick Biphasic Defibrillator with Monitor & Pacer',
    productSku: 'RAJ-ICU-360B',
    qty: 3,
    unitPrice: 195000,
    expectedPrice: 180000,
    isNegotiable: true,
    grandTotal: 655200,
    status: 'New Lead',
    statusNote: 'Instant online quote generated. Waiting for regional executive callback.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    notes: ['Emergency room replacement units needed.']
  },
  {
    id: 'LEAD-UDA-401',
    quoteNumber: 'RB-QT-2026-7711',
    customerName: 'Dr. Arvind Joshi',
    designation: 'Head of Surgery',
    hospitalName: 'Geetanjali Medical College & Hospital',
    customerPhone: '+91 94133 88776',
    customerEmail: 'surgery@geetanjali.org',
    district: 'Udaipur',
    state: 'Rajasthan',
    productName: 'LumiLux Duo Dual-Dome LED Shadowless OT Light',
    productSku: 'RAJ-SURG-LED2',
    qty: 2,
    unitPrice: 185000,
    expectedPrice: null,
    isNegotiable: false,
    grandTotal: 414400,
    status: 'Order Confirmed',
    statusNote: 'PO issued. Factory calibration complete, dispatch scheduled.',
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    notes: ['Installation engineer assigned: Er. Mohit Sharma.']
  }
];

/**
 * Get all leads safely from localStorage (merging seed data on first run)
 */
export function getAllLeads() {
  if (typeof window === 'undefined') return DEFAULT_SEED_LEADS;
  try {
    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(DEFAULT_SEED_LEADS));
      return DEFAULT_SEED_LEADS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_SEED_LEADS;
  } catch (err) {
    console.error('Error reading all leads:', err);
    return DEFAULT_SEED_LEADS;
  }
}

/**
 * Add a new customer quote request into the centralized leads repository
 */
export function recordCustomerLead(leadData) {
  if (typeof window === 'undefined') return null;
  try {
    const currentLeads = getAllLeads();
    const newLead = {
      id: leadData.id || `LEAD-${Date.now().toString().slice(-6)}`,
      quoteNumber: leadData.quoteNumber || `RB-QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: leadData.customerName || leadData.fullName || 'Medical Client',
      designation: leadData.designation || 'Procurement In-charge',
      hospitalName: leadData.hospitalName || 'Hospital / Healthcare Center',
      customerPhone: leadData.customerPhone || leadData.phone || '',
      customerEmail: leadData.customerEmail || leadData.email || '',
      district: leadData.district || 'Jaipur',
      state: leadData.state || 'Rajasthan',
      productName: leadData.productName || 'Medical Equipment',
      productSku: leadData.productSku || 'RAJ-MED-GEN',
      qty: Number(leadData.qty || leadData.quantity || 1),
      unitPrice: Number(leadData.unitPrice || leadData.price || 0),
      expectedPrice: leadData.expectedPrice ? Number(leadData.expectedPrice) : null,
      isNegotiable: Boolean(leadData.isNegotiable),
      isMultiItem: Boolean(leadData.isMultiItem),
      cartProducts: leadData.cartProducts || null,
      grandTotal: Number(leadData.grandTotal || leadData.totalAmount || 0),
      status: 'New Lead',
      statusNote: leadData.statusNote || 'Customer requested official quotation via website portal.',
      createdAt: leadData.createdAt || new Date().toISOString(),
      notes: []
    };

    const updated = [newLead, ...currentLeads.filter(l => l.id !== newLead.id)];
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(LEADS_EVENT, { detail: updated }));
    return newLead;
  } catch (err) {
    console.error('Error recording customer lead:', err);
    return null;
  }
}

/**
 * Update lead status or add notes (used by Employee / Admin)
 */
export function updateLeadStatus(leadId, newStatus, optionalNote) {
  if (typeof window === 'undefined') return null;
  try {
    const leads = getAllLeads();
    const updated = leads.map(l => {
      if (l.id === leadId) {
        const notes = l.notes ? [...l.notes] : [];
        if (optionalNote && optionalNote.trim()) {
          notes.unshift(`[${new Date().toLocaleDateString('en-IN')}] ${optionalNote.trim()}`);
        }
        return {
          ...l,
          status: newStatus,
          statusNote: optionalNote || `Status updated to ${newStatus}`,
          notes,
          updatedAt: new Date().toISOString()
        };
      }
      return l;
    });

    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(LEADS_EVENT, { detail: updated }));
    return updated;
  } catch (err) {
    console.error('Error updating lead status:', err);
    return null;
  }
}

/**
 * Get leads specifically filtered for an assigned district
 */
export function getLeadsByDistrict(district) {
  const all = getAllLeads();
  if (!district || district.toLowerCase() === 'all') return all;
  const target = district.trim().toLowerCase();
  return all.filter(l => (l.district || '').trim().toLowerCase() === target);
}

/**
 * Portal Session Authentication Helpers
 */
export function getPortalSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PORTAL_AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePortalSession(sessionData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PORTAL_AUTH_KEY, JSON.stringify(sessionData));
    window.dispatchEvent(new CustomEvent(PORTAL_AUTH_EVENT, { detail: sessionData }));
  } catch (err) {
    console.error('Error saving portal session:', err);
  }
}

export function clearPortalSession() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PORTAL_AUTH_KEY);
    window.dispatchEvent(new CustomEvent(PORTAL_AUTH_EVENT, { detail: null }));
  } catch (err) {
    console.error('Error clearing portal session:', err);
  }
}
