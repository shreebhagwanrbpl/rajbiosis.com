'use client';

import { syncCartWishlistInteraction } from './cartWishlistSync';

const WISHLIST_STORAGE_KEY = 'rajbiosis_wishlist';
export const WISHLIST_UPDATED_EVENT = 'wishlist-updated';

/**
 * Get current wishlist items from localStorage
 */
export function getWishlist() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading wishlist', e);
    return [];
  }
}

/**
 * Save wishlist items to localStorage and notify listeners
 */
export function saveWishlist(items) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(WISHLIST_UPDATED_EVENT, { detail: items }));
  } catch (e) {
    console.error('Error saving wishlist', e);
  }
}

/**
 * Get total number of items in wishlist
 */
export function getWishlistCount() {
  const items = getWishlist();
  return items.length;
}

/**
 * Check if a product is in the wishlist
 */
export function isInWishlist(productId) {
  if (!productId) return false;
  const items = getWishlist();
  return items.some(item => item.id === productId);
}

/**
 * Add product to wishlist
 */
export function addToWishlist(product) {
  if (!product || !product.id) return getWishlist();
  const items = getWishlist();
  const existing = items.find(item => item.id === product.id);

  if (!existing) {
    items.unshift({
      id: product.id,
      sku: product.sku || `SKU-${product.id}`,
      name: product.name,
      category: product.category || 'medical-equipment',
      brand: product.brand || 'Raj Biosis OEM',
      price: product.price || 100000,
      mrp: product.mrp || (product.price ? Math.round(product.price * 1.25) : 125000),
      image: product.image,
      isNegotiable: Boolean(product.isNegotiable),
      warranty: product.warranty || '2 Years Comprehensive Warranty',
      shortDesc: product.shortDesc || '',
      specs: product.specs || {},
      addedAt: new Date().toISOString()
    });
    saveWishlist(items);
    syncCartWishlistInteraction('add_to_wishlist', product);
  }

  return items;
}

/**
 * Remove an item from the wishlist
 */
export function removeFromWishlist(productId) {
  const items = getWishlist();
  const removedItem = items.find(item => item.id === productId);
  const filtered = items.filter(item => item.id !== productId);
  saveWishlist(filtered);
  if (removedItem) {
    syncCartWishlistInteraction('remove_from_wishlist', removedItem);
  } else {
    syncCartWishlistInteraction('remove_from_wishlist', { id: productId });
  }
  return filtered;
}

/**
 * Toggle product in wishlist (adds if not present, removes if present)
 * Returns true if added, false if removed
 */
export function toggleWishlist(product) {
  if (!product || !product.id) return false;
  const inList = isInWishlist(product.id);
  if (inList) {
    removeFromWishlist(product.id);
    return false;
  } else {
    addToWishlist(product);
    return true;
  }
}

/**
 * Clear all items from the wishlist
 */
export function clearWishlist() {
  saveWishlist([]);
}

