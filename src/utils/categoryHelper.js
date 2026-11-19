// Helper for extracting dynamic categories from products in rajbiosis.com

export function slugifyCategory(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function extractCategoriesFromProducts(products = []) {
  if (!Array.isArray(products) || products.length === 0) return [];

  const catMap = new Map();

  for (const p of products) {
    const rawCat = (p.categoryName || p.category || 'General Equipment').trim();
    if (!rawCat) continue;

    const slug = slugifyCategory(p.category || rawCat);
    if (!catMap.has(slug)) {
      catMap.set(slug, {
        id: slug,
        slug: slug,
        name: rawCat,
        count: 0,
        image: p.image || '',
        products: []
      });
    }

    const item = catMap.get(slug);
    item.count += 1;
    if (item.products.length < 8) {
      item.products.push(p);
    }
    if (p.image && (!item.image || item.image.includes('placeholder') || item.image.includes('unsplash'))) {
      item.image = p.image;
    }
  }

  return Array.from(catMap.values()).sort((a, b) => b.count - a.count);
}

