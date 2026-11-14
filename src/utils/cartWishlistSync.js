'use client';

import { getUserProfile, getActiveDistrict } from './userProfile';

const LOCAL_INTERACTIONS_KEY = 'rajbiosis_local_interactions';

/**
 * Get active client identity (registered user or persistent regional guest)
 */
export function getClientIdentity() {
  if (typeof window === 'undefined') {
    return {
      id: 'server_client',
      fullName: 'Medical Client',
      phone: '',
      email: '',
      hospitalName: '',
      district: 'Jaipur',
      isGuest: true
    };
  }

  try {
    const profile = getUserProfile();
    if (profile && (profile.phone || profile.email || profile.fullName)) {
      const cleanPhone = (profile.phone || '').replace(/\D/g, '').slice(-10);
      return {
        id: profile.id || `cust-${cleanPhone || profile.email || Date.now()}`,
        fullName: profile.fullName || 'Medical Client',
        phone: profile.phone || '',
        email: profile.email || '',
        hospitalName: profile.hospitalName || '',
        district: profile.district || getActiveDistrict(),
        isGuest: false
      };
    }

    // Persistent guest identity
    let guestId = localStorage.getItem('rajbiosis_client_uuid');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      localStorage.setItem('rajbiosis_client_uuid', guestId);
    }
    const dist = getActiveDistrict();

    return {
      id: guestId,
      fullName: `Healthcare Client (${dist})`,
      phone: '',
      email: '',
      hospitalName: `${dist} Healthcare Procurement`,
      district: dist,
      isGuest: true
    };
  } catch (err) {
    return {
      id: 'guest_fallback',
      fullName: 'Healthcare Client',
      phone: '',
      email: '',
      hospitalName: '',
      district: 'Jaipur',
      isGuest: true
    };
  }
}

/**
 * Sync Wishlist or Cart interaction to MongoDB Atlas and local cache
 * @param {'add_to_wishlist' | 'remove_from_wishlist' | 'add_to_cart' | 'remove_from_cart'} action 
 * @param {object} product 
 * @param {number} qty 
 */
export async function syncCartWishlistInteraction(action, product, qty = 1) {
  if (typeof window === 'undefined' || !product || !product.id) return;

  const customer = getClientIdentity();

  // 1. Update local storage interactions cache for instant offline access
  try {
    const raw = localStorage.getItem(LOCAL_INTERACTIONS_KEY);
    let interactions = raw ? JSON.parse(raw) : [];

    const isWishlist = action === 'add_to_wishlist' || action === 'remove_from_wishlist';
    const type = isWishlist ? 'wishlist' : 'cart';
    const isAdd = action === 'add_to_wishlist' || action === 'add_to_cart';

    if (isAdd) {
      const existingIdx = interactions.findIndex(
        i => i.customerId === customer.id && i.productId === product.id && i.type === type
      );
      const entry = {
        customerId: customer.id,
        customerName: customer.fullName,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        hospitalName: customer.hospitalName,
        district: customer.district,
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        productPrice: product.price,
        productImage: product.image,
        type: type,
        qty: qty,
        status: 'active',
        updatedAt: new Date().toISOString()
      };

      if (existingIdx > -1) {
        interactions[existingIdx] = entry;
      } else {
        interactions.unshift(entry);
      }
    } else {
      // Remove
      interactions = interactions.filter(
        i => !(i.customerId === customer.id && i.productId === product.id && i.type === type)
      );
    }

    localStorage.setItem(LOCAL_INTERACTIONS_KEY, JSON.stringify(interactions));
    window.dispatchEvent(new CustomEvent('cart-wishlist-interactions-updated'));
  } catch (err) {
    console.error('Error updating local interactions cache:', err);
  }

  // 2. Sync to MongoDB Atlas backend endpoint
  try {
    fetch('/api/cart-wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: action,
        product: {
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          category: product.category,
          image: product.image
        },
        customer: customer,
        qty: qty
      }),
      keepalive: true
    }).catch(() => {});
  } catch (e) {}
}

/**
 * Fetch live customer interactions and demand counts for a specific product
 */
export async function fetchProductDemand(productId) {
  if (!productId) return { wishlistCount: 0, cartCount: 0, wishlistCustomers: [], cartCustomers: [] };

  try {
    const res = await fetch(`/api/cart-wishlist?productId=${encodeURIComponent(productId)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    }).catch(() => null);

    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (data && data.success) {
        return {
          wishlistCount: data.wishlistCount || 0,
          cartCount: data.cartCount || 0,
          wishlistCustomers: data.wishlistCustomers || [],
          cartCustomers: data.cartCustomers || [],
          allCustomers: data.allCustomers || []
        };
      }
    }
  } catch (err) {}

  // Fallback to local cache
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_INTERACTIONS_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        const forProd = list.filter(i => i.productId === productId && i.status === 'active');
        const wish = forProd.filter(i => i.type === 'wishlist');
        const cart = forProd.filter(i => i.type === 'cart');
        return {
          wishlistCount: wish.length,
          cartCount: cart.length,
          wishlistCustomers: wish,
          cartCustomers: cart,
          allCustomers: forProd
        };
      }
    } catch (e) {}
  }

  return { wishlistCount: 0, cartCount: 0, wishlistCustomers: [], cartCustomers: [] };
}

/**
 * Fetch full admin overview of all products with interested customers
 */
export async function fetchAdminCartWishlistOverview() {
  try {
    const res = await fetch('/api/cart-wishlist', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    }).catch(() => null);

    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (data && data.success) {
        return data;
      }
    }
  } catch (err) {}

  return {
    success: false,
    summary: { totalWishlist: 0, totalCart: 0, productsCount: 0, customersCount: 0 },
    products: [],
    recentActivities: []
  };
}

