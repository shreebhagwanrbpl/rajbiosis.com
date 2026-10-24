import { PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/categories';

export default function sitemap() {
  const baseUrl = 'https://rajbiosis.com'; // Canonical production domain
  const currentDate = new Date().toISOString();

  // Core static public pages
  const staticRoutes = [
    { path: '', changeFrequency: 'daily', priority: 1.0 },
    { path: '/products', changeFrequency: 'daily', priority: 0.95 },
    { path: '/deals', changeFrequency: 'daily', priority: 0.9 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/profile', changeFrequency: 'weekly', priority: 0.6 },
  ].map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Deals specific tab URLs
  const dealRoutes = [
    { path: '/deals?tab=best-deals', priority: 0.85 },
    { path: '/deals?tab=special-offers', priority: 0.85 },
    { path: '/deals?tab=new-arrivals', priority: 0.85 },
  ].map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: route.priority,
  }));

  // Category pages
  const categoryRoutes = CATEGORIES.filter(c => c.id !== 'all').map((cat) => ({
    url: `${baseUrl}/category/${cat.id}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Product pages (High SEO priority)
  const productRoutes = PRODUCTS.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...staticRoutes, ...dealRoutes, ...categoryRoutes, ...productRoutes];
}
