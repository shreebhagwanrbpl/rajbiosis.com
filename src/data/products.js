// Dynamic Products Catalogue for Raj Biosis Storefront
// Sourced directly from MultiTaskingAdmin Central Hub & MongoDB
import productsCache from './productsCache.json';

export const PRODUCTS = Array.isArray(productsCache) ? productsCache : [];

export default PRODUCTS;
