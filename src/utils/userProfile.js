import { syncProfileToAdmin } from './adminSync';
// User profile and localized district utility helpers
import { DEFAULT_DISTRICT } from '../data/districts';
import { DEFAULT_COUNTRY_CODE } from '../data/internationalCodes';
import { PRODUCTS } from '../data/products';

export const USER_PROFILE_KEY = 'rajbiosis_user_profile';
export const USER_PROFILE_EVENT = 'user-profile-updated';
export const USER_INQUIRIES_KEY = 'rajbiosis_enquiries';
export const USER_INQUIRIES_EVENT = 'user-inquiries-updated';
export const USER_PROFILE_AUDIT_KEY = 'rajbiosis_profile_audit_log';
export const USER_PROFILE_AUDIT_EVENT = 'user-profile-audit-updated';

export const DEFAULT_HOSPITAL_PROFILE = {
  fullName: 'Dr. Rajesh Sharma',
  designation: 'CMO / Procurement Head',
  hospitalName: 'Apex Super Speciality Hospital',
  countryCode: DEFAULT_COUNTRY_CODE || '+91',
  phone: '98290 12345',
  email: 'doctor@hospital.org',
  state: 'Rajasthan',
  district: 'Jaipur',
  pincode: '302001',
  address: 'Near Emergency Trauma Wing Gate 2',
  isOtpVerified: true,
  isLoggedIn: true
};

/**
 * Get sample default enquiries for realistic display when customer visits profile.
 */
export function getDefaultSampleInquiries(district = 'Jaipur') {
  const p1 = PRODUCTS[0];
  const p2 = PRODUCTS[1];
  if (!p1) return [];

  return [
    {
      id: 'RFQ-880124',
      quoteNumber: 'RB-QT-2026-8801',
      productId: p1.id,
      productName: p1.name,
      productSku: p1.sku,
      productCategory: p1.categoryName || p1.category,
      productBrand: p1.brand || 'Raj Biosis',
      productImage: p1.image,
      quantity: 5,
      unitPrice: p1.price || 1250,
      actualPrice: p1.price || 1250,
      totalAmount: (p1.price || 1250) * 5,
      gstRate: '18%',
      gstAmount: Math.round(((p1.price || 1250) * 5) * 0.18),
      grandTotal: Math.round(((p1.price || 1250) * 5) * 1.18),
      status: 'Quotation Sent (Instant Authorized)',
      statusNote: 'Authorized digital proforma quotation generated with certified SLA and priority depot dispatch.',
      deliveryEstimate: `24-48 Hours Express Dispatch to ${district}`,
      validTill: '30 Days from issue',
      createdAt: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    },
    ...(p2 ? [{
      id: 'RFQ-604112',
      quoteNumber: 'RB-QT-2026-6041',
      productId: p2.id,
      productName: p2.name,
      productSku: p2.sku,
      productCategory: p2.categoryName || p2.category,
      productBrand: p2.brand || 'Raj Biosis',
      productImage: p2.image,
      quantity: 10,
      unitPrice: p2.price || 850,
      actualPrice: p2.price || 850,
      totalAmount: (p2.price || 850) * 10,
      gstRate: '18%',
      gstAmount: Math.round(((p2.price || 850) * 10) * 0.18),
      grandTotal: Math.round(((p2.price || 850) * 10) * 1.18),
      status: 'Dispatched (Regional Hub)',
      statusNote: `Consignment in transit from Jaipur Central Depot to ${district}.`,
      deliveryEstimate: 'Arriving Tomorrow by 2:00 PM',
      validTill: 'Delivered',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      date: new Date(Date.now() - 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    }] : [])
  ];
}

/**
 * Get current user inquiries safely from localStorage
 */
export function getUserInquiries() {
  if (typeof window === 'undefined') return getDefaultSampleInquiries();
  try {
    const raw = localStorage.getItem(USER_INQUIRIES_KEY);
    if (!raw) return getDefaultSampleInquiries();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return getDefaultSampleInquiries();
    }
    return parsed;
  } catch (err) {
    console.error('Error reading user inquiries:', err);
    return getDefaultSampleInquiries();
  }
}

/**
 * Save a new inquiry or quotation request to customer history
 */
export function saveUserInquiry(inquiryData) {
  if (typeof window === 'undefined') return null;
  try {
    const current = getUserInquiries();
    const newEntry = {
      ...inquiryData,
      id: inquiryData.id || `RFQ-${Date.now().toString().slice(-6)}`,
      status: inquiryData.status || 'Pending RFQ',
      statusNote: inquiryData.statusNote || 'Official quotation request registered.',
      createdAt: inquiryData.createdAt || new Date().toISOString()
    };
    const updated = [newEntry, ...current.filter((item) => item.id !== newEntry.id)];
    localStorage.setItem(USER_INQUIRIES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(USER_INQUIRIES_EVENT, { detail: updated }));
    return newEntry;
  } catch (err) {
    console.error('Error saving user inquiry:', err);
    return null;
  }
}

/**
 * Update an inquiry status
 */
export function updateInquiryStatus(id, newStatus, newNote) {
  if (typeof window === 'undefined') return;
  try {
    const current = getUserInquiries();
    const updated = current.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus,
          statusNote: newNote || item.statusNote,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });
    localStorage.setItem(USER_INQUIRIES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(USER_INQUIRIES_EVENT, { detail: updated }));
    return updated;
  } catch (err) {
    console.error('Error updating inquiry status:', err);
  }
}

/**
 * Clear all inquiries
 */
export function clearUserInquiries() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_INQUIRIES_KEY);
  window.dispatchEvent(new CustomEvent(USER_INQUIRIES_EVENT, { detail: [] }));
}

/**
 * Get current saved user profile from localStorage safely
 */
export function getUserProfile() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.fullName || parsed.phone)) {
        return parsed;
      }
    }
    return null;
  } catch (err) {
    console.error('Error reading user profile:', err);
    return null;
  }
}

/**
 * Get the currently active district.
 * Defaults to profile district if set, or stored active district, or DEFAULT_DISTRICT ('Jaipur').
 */
export function getActiveDistrict() {
  const profile = getUserProfile();
  if (profile && profile.district && profile.district.trim()) {
    return profile.district.trim();
  }
  if (typeof window !== 'undefined') {
    const explicit = localStorage.getItem('rajbiosis_active_district');
    if (explicit && explicit.trim()) return explicit.trim();
  }
  return DEFAULT_DISTRICT;
}

/**
 * Save active district and notify listeners across header and components
 */
export function saveActiveDistrict(districtName) {
  if (typeof window === 'undefined' || !districtName) return;
  try {
    localStorage.setItem('rajbiosis_active_district', districtName.trim());
    window.dispatchEvent(new CustomEvent('active-district-changed', { detail: districtName.trim() }));
  } catch (e) {}
}

export const CUSTOMER_LOGGED_IN_KEY = 'rajbiosis_customer_logged_in';

/**
 * Check if the customer is already logged in / verified via OTP
 */
export function isCustomerLoggedIn() {
  if (typeof window === 'undefined') return false;
  try {
    const profile = getUserProfile();
    if (!profile) return false;

    const flag = localStorage.getItem(CUSTOMER_LOGGED_IN_KEY);
    if (flag === 'true') return true;
    if (profile.isOtpVerified || profile.isLoggedIn) return true;
    if (profile.phone && profile.phone.trim() && profile.email && profile.email.trim()) {
      return true;
    }
  } catch (err) {
    console.error('Error checking customer login status:', err);
  }
  return false;
}

/**
 * Set customer logged in state in localStorage
 */
export function setCustomerLoggedIn(status = true) {
  if (typeof window === 'undefined') return;
  try {
    if (status) {
      localStorage.setItem(CUSTOMER_LOGGED_IN_KEY, 'true');
    } else {
      localStorage.removeItem(CUSTOMER_LOGGED_IN_KEY);
    }
  } catch (err) {}
}

/**
 * Require customer authentication before proceeding with Wishlist or Cart action.
 * If customer is not logged in, opens the exact same Get Quote / OTP verification modal.
 */
export function requireCustomerAuth(action, product, qty = 1) {
  if (typeof window === 'undefined') return false;
  if (isCustomerLoggedIn()) {
    return true;
  }
  window.dispatchEvent(
    new CustomEvent('open-product-enquiry', {
      detail: {
        ...product,
        intentAction: action,
        intentQty: qty
      }
    })
  );
  return false;
}

export const LOCATION_DETECTED_KEY = 'rajbiosis_detected_location';

let cachedLocationPromise = null;

/**
 * Auto-detect user's district and state using IP reverse geocoding.
 * Only hits the API once: once stored in localStorage, it NEVER hits the API again.
 */
export async function autoDetectLocation(force = false) {
  if (typeof window === 'undefined') return null;

  // 1. Check if already stored in localStorage - return immediately with 0 network calls!
  if (!force) {
    try {
      const stored = localStorage.getItem(LOCATION_DETECTED_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.city) return parsed;
      }
      const active = localStorage.getItem('rajbiosis_active_district');
      if (active && active.trim() && active !== DEFAULT_DISTRICT) {
        return { city: active.trim(), state: 'Rajasthan' };
      }
    } catch (e) {}
  }

  // 2. Prevent multiple simultaneous requests in flight
  if (cachedLocationPromise) {
    return cachedLocationPromise;
  }

  // 3. First time execution only: hit the API once, save to localStorage permanently
  cachedLocationPromise = (async () => {
    try {
      const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en');
      if (!res.ok) return null;
      const data = await res.json();
      const city = data.city || data.locality || '';
      const state = data.principalSubdivision || '';
      if (city) {
        const loc = { city, state };
        try {
          localStorage.setItem(LOCATION_DETECTED_KEY, JSON.stringify(loc));
          saveActiveDistrict(city);
        } catch (e) {}
        return loc;
      }
    } catch (err) {
      console.warn('IP location detection skipped:', err);
    } finally {
      cachedLocationPromise = null;
    }
    return null;
  })();

  return cachedLocationPromise;
}

/**
 * Get profile audit log records for admin and database synchronization
 */
export function getProfileAuditLog() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USER_PROFILE_AUDIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading profile audit log:', err);
    return [];
  }
}

/**
 * Record simulated or verified 100% advance payment for a quotation
 */
export function recordAdvancePayment(quoteId, utrNumber) {
  if (typeof window === 'undefined') return null;
  try {
    const current = getUserInquiries();
    const updated = current.map((item) => {
      if (item.id === quoteId || item.quoteNumber === quoteId) {
        return {
          ...item,
          status: 'Payment Confirmed - In Production',
          lifecycleStage: 'paid_production',
          paymentStatus: 'paid',
          paymentTerms: '100% Advance Settled',
          utrNumber: utrNumber || `UTR-${Date.now().toString().slice(-8)}`,
          paymentDate: new Date().toISOString(),
          statusNote: `100% Advance payment verified (${utrNumber || 'RTGS Confirmed'}). Equipment released for final burn-in & factory calibration.`,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });
    localStorage.setItem(USER_INQUIRIES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(USER_INQUIRIES_EVENT, { detail: updated }));
    return updated;
  } catch (err) {
    console.error('Error recording advance payment:', err);
    return null;
  }
}

/**
 * Save or update user profile in localStorage, compute field changes for DB/Admin audit,
 * and notify all listeners.
 */
export function saveUserProfile(profileData) {
  if (typeof window === 'undefined') return null;
  try {
    const existing = getUserProfile() || {};

    // Strip out heavy/recursive metadata from updated profile
    const { auditHistory: _existingAudit, ...cleanExisting } = existing;
    const { auditHistory: _dataAudit, ...cleanData } = profileData || {};

    const updated = {
      ...cleanExisting,
      ...cleanData,
      countryCode: cleanData.countryCode || cleanExisting.countryCode || DEFAULT_COUNTRY_CODE || '+91',
      updatedAt: new Date().toISOString()
    };

    // 1. Save core user profile to localStorage safely
    try {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updated));
    } catch (quotaErr) {
      console.warn('LocalStorage quota issue detected, clearing audit logs and retrying:', quotaErr);
      try {
        localStorage.removeItem(USER_PROFILE_AUDIT_KEY);
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updated));
      } catch (fatalStorageErr) {
        console.error('Critical storage error:', fatalStorageErr);
      }
    }

    if (updated.district) {
      try {
        localStorage.setItem('rajbiosis_active_district', updated.district.trim());
        window.dispatchEvent(new CustomEvent('active-district-changed', { detail: updated.district.trim() }));
      } catch (e) {}
    }

    if ((updated.phone && updated.phone.trim()) || (updated.email && updated.email.trim())) {
      try { setCustomerLoggedIn(true); } catch (e) {}
    }

    // 2. Safe Audit Log (Lightweight flat snapshot, strings only, zero recursion)
    try {
      const fieldsToTrack = [
        'fullName', 'designation', 'phone', 'countryCode', 'email',
        'hospitalName', 'state', 'district', 'address', 'pincode'
      ];
      const changes = [];
      const isFirstCreation = !(cleanExisting && (cleanExisting.fullName || cleanExisting.phone));

      if (!isFirstCreation) {
        fieldsToTrack.forEach((key) => {
          const oldVal = (cleanExisting[key] || '').toString().trim();
          const newVal = (cleanData[key] || '').toString().trim();
          if (oldVal !== newVal) {
            changes.push({
              field: key,
              oldValue: oldVal || '(empty)',
              newValue: newVal || '(empty)'
            });
          }
        });
      }

      if (changes.length > 0 || isFirstCreation) {
        const flatSnapshot = (source) => {
          const res = {};
          fieldsToTrack.forEach((k) => {
            if (source[k] !== undefined && source[k] !== null) {
              res[k] = String(source[k]);
            }
          });
          return res;
        };

        const auditEntry = {
          id: 'AUD-' + Date.now(),
          timestamp: new Date().toISOString(),
          updatedBy: cleanData.fullName || cleanExisting.fullName || 'User',
          summary: isFirstCreation ? 'Initial profile registered' : 'Updated ' + changes.length + ' field(s)',
          changes,
          previousSnapshot: flatSnapshot(cleanExisting),
          newSnapshot: flatSnapshot(cleanData),
          syncStatus: 'ready'
        };

        let auditHistory = getProfileAuditLog();
        auditHistory = [auditEntry, ...auditHistory].slice(0, 10);
        try {
          localStorage.setItem(USER_PROFILE_AUDIT_KEY, JSON.stringify(auditHistory));
          window.dispatchEvent(new CustomEvent(USER_PROFILE_AUDIT_EVENT, { detail: auditHistory }));
        } catch (e) {}
      }
    } catch (auditErr) {
      console.warn('Audit logging skipped safely:', auditErr);
    }

    // 3. Dispatch profile event & background sync to Admin
    try {
      window.dispatchEvent(new CustomEvent(USER_PROFILE_EVENT, { detail: updated }));
    } catch (evtErr) {
      console.warn('Profile event dispatch error:', evtErr);
    }

    try {
      syncProfileToAdmin(updated);
    } catch (syncErr) {}

    return updated;
  } catch (err) {
    console.error('Error saving user profile:', err);
    return {
      ...(profileData || {}),
      updatedAt: new Date().toISOString()
    };
  }
}

/**
 * Set active district explicitly (even before profile is fully created)
 */
export function setActiveDistrict(district) {
  if (typeof window === 'undefined') return;
  const clean = district ? district.trim() : DEFAULT_DISTRICT;
  localStorage.setItem('rajbiosis_active_district', clean);

  const existing = getUserProfile();
  if (existing) {
    existing.district = clean;
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(existing));
    window.dispatchEvent(new CustomEvent(USER_PROFILE_EVENT, { detail: existing }));
  } else {
    window.dispatchEvent(new CustomEvent(USER_PROFILE_EVENT, { detail: { district: clean } }));
  }
}

/**
 * Clear user profile and log logout event for admin / database sync
 */
export function clearUserProfile() {
  if (typeof window === 'undefined') return;
  const existing = getUserProfile();
  if (existing && (existing.fullName || existing.phone)) {
    try {
      const auditLog = getProfileAuditLog();
      const logoutEntry = {
        id: `AUD-LOGOUT-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'USER_LOGOUT',
        updatedBy: existing.fullName || 'User',
        phone: `${existing.countryCode || '+91'} ${existing.phone || ''}`,
        hospital: existing.hospitalName || '',
        district: existing.district || '',
        summary: `User logged out: ${existing.fullName || 'User'} (${existing.hospitalName || 'Hospital'})`,
        syncStatus: 'ready_for_admin_sync'
      };
      localStorage.setItem(USER_PROFILE_AUDIT_KEY, JSON.stringify([logoutEntry, ...auditLog]));
      window.dispatchEvent(new CustomEvent(USER_PROFILE_AUDIT_EVENT, { detail: [logoutEntry, ...auditLog] }));
      console.log('[Admin Sync]: User logged out event recorded:', logoutEntry);
    } catch (e) {
      console.error('Error recording logout event:', e);
    }
  }

  localStorage.removeItem(USER_PROFILE_KEY);
  localStorage.removeItem(CUSTOMER_LOGGED_IN_KEY);
  localStorage.removeItem('rajbiosis_active_district');
  window.dispatchEvent(new CustomEvent(USER_PROFILE_EVENT, { detail: null }));
}
