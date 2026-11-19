import productsCache from './productsCache.json';
import { slugifyCategory } from '../utils/categoryHelper';

function buildCategories() {
  const catMap = new Map();

  for (const p of productsCache) {
    const rawCat = (p.categoryName || p.category || 'General Equipment').trim();
    if (!rawCat) continue;

    const slug = slugifyCategory(p.category || rawCat);
    if (!catMap.has(slug)) {
      catMap.set(slug, {
        id: slug,
        slug: slug,
        name: rawCat,
        itemCount: 0,
        description: `High-quality ${rawCat} certified for clinical laboratories and hospitals.`,
        image: p.image || ''
      });
    }

    const item = catMap.get(slug);
    item.itemCount += 1;
    if (p.image && (!item.image || item.image.includes('placeholder'))) {
      item.image = p.image;
    }
  }

  const list = Array.from(catMap.values()).sort((a, b) => b.itemCount - a.itemCount);

  return [
    {
      id: "all",
      slug: "all",
      name: "All Equipment & Reagents",
      itemCount: productsCache.length,
      description: "Complete Raj Biosis healthcare, laboratory reagents and medical engineering catalogue."
    },
    ...list
  ];
}

export const CATEGORIES = buildCategories();

export const CERTIFICATIONS = ["US-FDA", "CE Certified", "ISO 13485", "CDSCO Registered", "GMP Certified"];
export const BRANDS = ["Raj Biosis", "Truechemie", "Transasia", "Erba", "Roche", "Abbott", "Merck"];
