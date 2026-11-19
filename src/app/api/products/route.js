import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3002';
const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'rajbiosis.com';

// In-memory cache for ultra-fast responses
let memoryCache = {
  products: null,
  timestamp: 0
};
const CACHE_TTL_MS = 15000; // 15 seconds fresh cache, then re-fetches from Admin

function getFileCache() {
  try {
    const cachePath = path.join(process.cwd(), 'src', 'data', 'productsCache.json');
    if (fs.existsSync(cachePath)) {
      const data = fs.readFileSync(cachePath, 'utf8');
      const list = JSON.parse(data);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch (e) {
    // ignore
  }
  return [];
}

function saveFileCache(products) {
  try {
    const cachePath = path.join(process.cwd(), 'src', 'data', 'productsCache.json');
    fs.writeFileSync(cachePath, JSON.stringify(products, null, 2), 'utf8');
  } catch (e) {
    // ignore
  }
}

async function fetchProductsFromAdmin() {
  const now = Date.now();
  if (memoryCache.products && (now - memoryCache.timestamp < CACHE_TTL_MS)) {
    return memoryCache.products;
  }

  try {
    const targetUrl = `${ADMIN_API_URL}/api/products?companyId=rajbiosis&website=${SITE_DOMAIN}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.products) && data.products.length > 0) {
        memoryCache.products = data.products;
        memoryCache.timestamp = now;
        // Asynchronously persist to file cache
        saveFileCache(data.products);
        return data.products;
      }
    }
  } catch (err) {
    console.warn('[Products API] Admin API unreachable, using local cache:', err.message);
  }

  // Fallback to memory cache if exists
  if (memoryCache.products && memoryCache.products.length > 0) {
    return memoryCache.products;
  }

  // Fallback to disk cache
  const diskProducts = getFileCache();
  if (diskProducts.length > 0) {
    memoryCache.products = diskProducts;
    memoryCache.timestamp = now;
    return diskProducts;
  }

  return [];
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get('category') || searchParams.get('cat');
    const searchParam = searchParams.get('q') || searchParams.get('search');
    const idParam = searchParams.get('id');
    const skuParam = searchParams.get('sku');

    const allProducts = await fetchProductsFromAdmin();

    // If single ID requested
    if (idParam) {
      const single = allProducts.find(p => p.id === idParam || p.sku === idParam || p._id === idParam);
      return NextResponse.json({
        success: !!single,
        product: single || null
      });
    }

    // If single SKU requested
    if (skuParam) {
      const single = allProducts.find(p => p.sku?.toLowerCase() === skuParam.toLowerCase());
      return NextResponse.json({
        success: !!single,
        product: single || null
      });
    }

    let filtered = allProducts;

    // Filter by category (case-insensitive & slug-friendly)
    if (categoryParam && categoryParam !== 'all') {
      const targetCat = categoryParam.toLowerCase().replace(/[\s_-]+/g, '-').trim();
      filtered = filtered.filter(p => {
        const pCatSlug = (p.category || '').toLowerCase().replace(/[\s_-]+/g, '-').trim();
        const pCatNameSlug = (p.categoryName || '').toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').trim();
        return pCatSlug === targetCat || pCatNameSlug === targetCat || pCatSlug.includes(targetCat) || targetCat.includes(pCatSlug);
      });
    }

    // Filter by search query
    if (searchParam && searchParam.trim()) {
      const q = searchParam.toLowerCase().trim();
      filtered = filtered.filter(p => {
        return (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.desc && p.desc.toLowerCase().includes(q))
        );
      });
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      totalCount: allProducts.length,
      products: filtered
    });
  } catch (err) {
    console.error('[Products API Error]:', err);
    return NextResponse.json({
      success: false,
      error: err.message,
      products: []
    }, { status: 500 });
  }
}
