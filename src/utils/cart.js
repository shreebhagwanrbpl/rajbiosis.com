'use client';

const CART_STORAGE_KEY = 'rajbiosis_cart';
export const CART_UPDATED_EVENT = 'cart-updated';
export const OPEN_CART_EVENT = 'open-cart';

/**
 * Get current cart items from localStorage
 */
export function getCart() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading cart', e);
    return [];
  }
}

/**
 * Save cart items to localStorage and notify listeners
 */
export function saveCart(items) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: items }));
  } catch (e) {
    console.error('Error saving cart', e);
  }
}

/**
 * Get total quantity of items in cart
 */
export function getCartCount() {
  const items = getCart();
  return items.reduce((total, item) => total + (item.qty || 1), 0);
}

/**
 * Add product to cart
 */
export function addToCart(product, qty = 1, expectedPrice = null) {
  const items = getCart();
  const existingIndex = items.findIndex(item => item.id === product.id);

  if (existingIndex > -1) {
    // Increase quantity of existing item
    items[existingIndex].qty = (items[existingIndex].qty || 1) + qty;
    if (expectedPrice !== null) {
      items[existingIndex].expectedPrice = expectedPrice;
    }
  } else {
    // Add new item
    items.push({
      id: product.id,
      sku: product.sku || `SKU-${product.id}`,
      name: product.name,
      category: product.category || 'medical-equipment',
      brand: product.brand || 'Raj Biosis OEM',
      price: product.price || 100000,
      image: product.image,
      qty: Math.max(1, qty),
      isNegotiable: Boolean(product.isNegotiable),
      expectedPrice: expectedPrice || (product.isNegotiable ? '' : null),
      warranty: product.warranty || '2 Years Comprehensive Warranty'
    });
  }

  saveCart(items);
  return items;
}

/**
 * Update quantity of a specific cart item
 */
export function updateCartQty(productId, qty) {
  const items = getCart();
  if (qty <= 0) {
    return removeFromCart(productId);
  }
  const updated = items.map(item => {
    if (item.id === productId) {
      return { ...item, qty: Math.max(1, qty) };
    }
    return item;
  });
  saveCart(updated);
  return updated;
}

/**
 * Update customer expected target price for negotiable products
 */
export function updateCartExpectedPrice(productId, expectedPrice) {
  const items = getCart();
  const updated = items.map(item => {
    if (item.id === productId) {
      return { ...item, expectedPrice };
    }
    return item;
  });
  saveCart(updated);
  return updated;
}

/**
 * Remove an item from the cart
 */
export function removeFromCart(productId) {
  const items = getCart();
  const filtered = items.filter(item => item.id !== productId);
  saveCart(filtered);
  return filtered;
}

/**
 * Clear all items from the cart
 */
export function clearCart() {
  saveCart([]);
}

/**
 * Trigger global cart drawer to open
 */
export function openCartDrawer() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OPEN_CART_EVENT));
  }
}
