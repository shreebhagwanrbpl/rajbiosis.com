// Central Admin Hub Synchronization Client for Raj Biosis Website
export const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3002';
export const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'rajbiosis.com';

/**
 * Fetch live products assigned to this website domain from MultiTaskingAdmin Hub or local MongoDB
 */
export async function fetchLiveProductsFromAdmin() {
  if (typeof window === 'undefined') return null;
  if (!ADMIN_API_URL) return null;

  try {
    const fetchPromise = fetch(`${ADMIN_API_URL}/api/products?website=${SITE_DOMAIN}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve(null), 1500);
    });

    const res = await Promise.race([
      fetchPromise.catch(() => null),
      timeoutPromise
    ]);

    if (!res || !res.ok) return null;
    const data = await res.json().catch(() => null);
    if (data && data.success && Array.isArray(data.products)) {
      return data.products;
    }
  } catch (err) {
    // Fail-safe fallback when Admin hub is offline
  }
  return null;
}

// In-memory cache to deduplicate rapid duplicate sync calls within 30 seconds
const syncedLeadCache = new Map();

/**
 * Sync newly recorded customer quote / lead to MongoDB Atlas and Admin Leads & Quotations
 */
export async function syncLeadToAdmin(lead) {
  if (!lead) return;
  try {
    const leadId = lead.id || `RFQ-${Date.now()}`;
    const phone = (lead.customerPhone || lead.phone || '').trim();
    const equipment = (lead.productName || '').trim();
    const dedupKey = `${leadId}_${phone}_${equipment}`;
    const now = Date.now();

    // Deduplication check: if synced in the last 30 seconds, skip duplicate
    if (syncedLeadCache.has(dedupKey) && (now - syncedLeadCache.get(dedupKey) < 30000)) {
      console.log('[AdminSync] Lead sync skipped (already synced recently):', dedupKey);
      return;
    }
    syncedLeadCache.set(dedupKey, now);

    // Clean up cache entries older than 2 minutes
    for (const [k, ts] of syncedLeadCache.entries()) {
      if (now - ts > 120000) syncedLeadCache.delete(k);
    }

    // 1. Check profile completeness: ALL 8 fields must be non-empty
    const hosp = (lead.hospitalName || lead.hospital || '').trim();
    const isGenericHosp = !hosp || [
      'clinic / hospital', 'healthcare facility', 'general hospital', 'hospital',
      'customer hospital / lab', 'customer hospital / diagnostic lab'
    ].some(g => hosp.toLowerCase() === g || hosp.toLowerCase().includes('healthcare institution'));
    const doc = (lead.customerName || lead.fullName || '').trim();
    const phClean = phone.replace(/\D/g, '');
    const em = (lead.customerEmail || lead.email || '').trim();
    const st = (lead.state || '').trim();
    const dist = (lead.district || '').trim();
    const addr = (lead.address || '').trim();
    const pin = (lead.pincode || '').toString().trim();

    const isProfileComplete = Boolean(
      !isGenericHosp &&
      hosp.length >= 3 &&
      doc.length >= 2 &&
      doc.toLowerCase() !== 'medical client' &&
      phClean.length >= 10 &&
      em.length >= 5 &&
      em.includes('@') &&
      st.length >= 2 &&
      dist.length >= 2 &&
      dist.toLowerCase() !== 'india' &&
      addr.length >= 3 &&
      pin.length >= 4
    );

    // Formatted date and time
    const syncNow = new Date();
    const syncDateStr = syncNow.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const syncTimeStr = syncNow.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const syncDateTimeStr = `${syncDateStr}, ${syncTimeStr}`;

    // Negotiation values
    const catalogBase = Number(lead.actualPrice || lead.catalogPrice || lead.price || 485000);
    const offerPrice = lead.expectedPrice ? Number(lead.expectedPrice) : null;
    const isNegotiated = Boolean(lead.isNegotiable && offerPrice && offerPrice > 0);

    // Payload for Leads Pipeline
    const leadPayload = {
      id: leadId,
      doctorName: lead.customerName || lead.fullName || 'NA',
      hospital: lead.hospitalName || 'NA',
      city: lead.district || 'NA',
      address: lead.address || 'NA',
      email: lead.customerEmail || lead.email || 'NA',
      phone: phone || 'NA',
      siteDomain: SITE_DOMAIN,
      brandName: 'Raj Biosis',
      equipment: equipment || (lead.cartProducts ? `${lead.cartProducts.length} Equipment Package` : 'Biomedical Equipment'),
      price: isNegotiated ? offerPrice : catalogBase,
      actualPrice: catalogBase,
      expectedPrice: offerPrice,
      isPriceNegotiated: isNegotiated,
      isNegotiable: Boolean(lead.isNegotiable),
      negotiationStatus: isNegotiated ? 'pending_approval' : (lead.negotiationStatus || 'none'),
      approvedPrice: isNegotiated ? null : (lead.approvedPrice || catalogBase),
      adminCounterPrice: lead.adminCounterPrice || null,
      adminNote: lead.adminNote || null,
      quoteAmount: lead.grandTotal ? `₹${Number(lead.grandTotal).toLocaleString('en-IN')}` : `₹${(isNegotiated ? offerPrice : catalogBase).toLocaleString('en-IN')}`,
      status: isNegotiated ? 'Pending Price Approval' : (lead.status && !lead.status.toLowerCase().includes('quotation sent') ? lead.status : 'Pending RFQ'),
      isProfileComplete: isProfileComplete,
      date: lead.date && lead.date !== 'Just now' ? lead.date : syncDateStr,
      time: lead.time || syncTimeStr,
      dateTime: lead.dateTime || syncDateTimeStr,
      createdAt: lead.createdAt || syncNow.toISOString(),
      rawLeadData: lead
    };

    // 1. Save directly to MongoDB Atlas via Website /api/leads endpoint
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadPayload),
      keepalive: true
    }).catch(() => {});

    // 2. ALSO send directly to MultiTaskingAdmin on port 3002 in real-time so Admin queue updates instantly
    if (typeof window !== 'undefined' && ADMIN_API_URL && !ADMIN_API_URL.includes(window.location.host)) {
      fetch(`${ADMIN_API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload),
        keepalive: true
      }).catch(() => {});
    }

    // NOTE: Quotations are NOT automatically created here.
    // Quotations are only created when an administrator or sales employee explicitly
    // clicks "Make Quotation" in MultiTaskingAdmin.
  } catch (err) {
    console.warn('[AdminSync] Background sync exception:', err);
  }
}

/**
 * Sync customer profile creation or update to MongoDB Atlas and Admin
 */
export async function syncProfileToAdmin(profile) {
  if (!profile || (!profile.fullName && !profile.phone)) return;
  try {
    const payload = {
      id: profile.id || `cust-${String(profile.phone || Date.now()).replace(/\D/g, '').slice(-10)}`,
      fullName: profile.fullName || 'Medical Client',
      hospitalName: profile.hospitalName || 'Clinic / Hospital',
      phone: (profile.phone || '').trim(),
      email: (profile.email || '').trim(),
      district: profile.district || 'Jaipur',
      state: profile.state || 'Rajasthan',
      designation: profile.designation || 'Healthcare Representative',
      address: profile.address || '',
      pincode: profile.pincode || '',
      siteDomain: SITE_DOMAIN,
      brandName: 'Raj Biosis',
      profileDetails: profile
    };

    // 1. Save customer profile directly into MongoDB Atlas via /api/customers (or Admin hub fallback)
    fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {
      if (typeof window !== 'undefined' && ADMIN_API_URL && !ADMIN_API_URL.includes(window.location.host)) {
        fetch(`${ADMIN_API_URL}/api/customers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(() => {});
      }
    });
  } catch (err) {
    console.warn('[AdminSync] Profile sync exception:', err);
  }
}
