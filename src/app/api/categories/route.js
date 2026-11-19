import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  try {
    // 1. Fetch live products from local /api/products or file cache
    let products = [];
    const cachePath = path.join(process.cwd(), 'src', 'data', 'productsCache.json');
    if (fs.existsSync(cachePath)) {
      products = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    }

    // 2. Group by category
    const catMap = new Map();

    for (const p of products) {
      const rawCat = (p.categoryName || p.category || 'General Products').trim();
      if (!rawCat) continue;
      
      const slug = slugify(p.category || rawCat);
      if (!catMap.has(slug)) {
        catMap.set(slug, {
          id: slug,
          slug: slug,
          name: rawCat,
          count: 0,
          image: p.image || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
          sampleProducts: []
        });
      }

      const item = catMap.get(slug);
      item.count += 1;
      if (item.sampleProducts.length < 6) {
        item.sampleProducts.push(p);
      }
      // If item still has fallback image, upgrade it with product's real image
      if (p.image && (!item.image || item.image.includes('unsplash'))) {
        item.image = p.image;
      }
    }

    // Sort categories by product count descending
    const categories = Array.from(catMap.values()).sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      count: categories.length,
      categories: categories
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message,
      categories: []
    }, { status: 500 });
  }
}

