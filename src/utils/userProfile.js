// User profile and localized district utility helpers
import { DEFAULT_DISTRICT } from '../data/districts';
import { DEFAULT_COUNTRY_CODE } from '../data/internationalCodes';

export const USER_PROFILE_KEY = 'rajbiosis_user_profile';
export const USER_PROFILE_EVENT = 'user-profile-updated';
export const USER_INQUIRIES_KEY = 'rajbiosis_enquiries';
export const USER_INQUIRIES_EVENT = 'user-inquiries-updated';
export const USER_PROFILE_AUDIT_KEY = 'rajbiosis_profile_audit_log';
export const USER_PROFILE_AUDIT_EVENT = 'user-profile-audit-updated';

/**
 * Get sample default enquiries for realistic display when customer visits profile.
 * Represents all 4 key lifecycle stages:
/**
 * No dummy quotations - real inquiries will be added when customer requests them
 */
export function getDefaultSampleInquiries() {
  return [];
}

/**
 * Get current user inquiries safely from localStorage
 */
export function getUserInquiries() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USER_INQUIRIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading user inquiries:', err);
    return [];
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
      quoteNumber: inquiryData.quoteNumber || `RB-QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: inquiryData.status || 'Quotation Sent',
      statusNote: inquiryData.statusNote || 'Official quotation generated and delivered.',
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
    if (!raw) return null;
    return JSON.parse(raw);
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
  if (typeof window === 'undefined') return;
  try {
    const existing = getUserProfile() || {};
    
    // Track what changed (Previous vs New value) for database & admin sync
    const fieldsToTrack = [
      { key: 'fullName', label: 'Full Name' },
      { key: 'designation', label: 'Designation' },
      { key: 'phone', label: 'Mobile Number' },
      { key: 'countryCode', label: 'Country Code' },
      { key: 'email', label: 'Email Address' },
      { key: 'hospitalName', label: 'Hospital / Clinic Name' },
      { key: 'state', label: 'State' },
      { key: 'district', label: 'District' },
      { key: 'address', label: 'Delivery Street Address' },
      { key: 'pincode', label: 'Postal Pincode' }
    ];

    const changes = [];
    const isFirstCreation = !(existing && (existing.fullName || existing.phone));

    if (!isFirstCreation) {
      fieldsToTrack.forEach(({ key, label }) => {
        const oldVal = (existing[key] || '').toString().trim();
        const newVal = (profileData[key] || '').toString().trim();
        if (oldVal !== newVal) {
          changes.push({
            field: key,
            fieldLabel: label,
            oldValue: oldVal || '(empty)',
            newValue: newVal || '(empty)'
          });
        }
      });
    }

    let auditHistory = getProfileAuditLog();

    if (changes.length > 0) {
      const auditEntry = {
        id: `AUD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        timestamp: new Date().toISOString(),
        updatedBy: profileData.fullName || existing.fullName || 'Authorized Buyer',
        summary: `Updated ${changes.length} field(s)`,
        changes,
        previousSnapshot: { ...existing },
        newSnapshot: { ...profileData },
        syncStatus: 'ready_for_database_sync'
      };

      auditHistory = [auditEntry, ...auditHistory];
      localStorage.setItem(USER_PROFILE_AUDIT_KEY, JSON.stringify(auditHistory));
      window.dispatchEvent(new CustomEvent(USER_PROFILE_AUDIT_EVENT, { detail: auditHistory }));
      console.log('[Admin & Database Sync]: Profile updated. Change audit log:', auditEntry);
    } else if (isFirstCreation) {
      const initialEntry = {
        id: `AUD-INIT-${Date.now()}`,
        timestamp: new Date().toISOString(),
        updatedBy: profileData.fullName || 'Authorized Buyer',
        summary: 'Initial profile registered',
        changes: [
          { field: 'fullName', fieldLabel: 'Account Registered', oldValue: '(none)', newValue: profileData.fullName || 'User' }
        ],
        newSnapshot: { ...profileData },
        syncStatus: 'ready_for_database_sync'
      };
      auditHistory = [initialEntry, ...auditHistory];
      localStorage.setItem(USER_PROFILE_AUDIT_KEY, JSON.stringify(auditHistory));
      window.dispatchEvent(new CustomEvent(USER_PROFILE_AUDIT_EVENT, { detail: auditHistory }));
    }

    const updated = {
      ...existing,
      ...profileData,
      countryCode: profileData.countryCode || existing.countryCode || DEFAULT_COUNTRY_CODE,
      auditHistory,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updated));
    if (updated.district) {
      localStorage.setItem('rajbiosis_active_district', updated.district.trim());
    }

    window.dispatchEvent(new CustomEvent(USER_PROFILE_EVENT, { detail: updated }));
    return updated;
  } catch (err) {
    console.error('Error saving user profile:', err);
    return null;
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
  localStorage.removeItem('rajbiosis_active_district');
  window.dispatchEvent(new CustomEvent(USER_PROFILE_EVENT, { detail: null }));
}
