import React from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import CategoryPageView from './CategoryPageView';
import { CATEGORIES } from '../../../data/categories';
import { PRODUCTS } from '../../../data/products';
import { generateCategorySEO } from '../../../utils/seoGenerator';
import { slugifyCategory } from '../../../utils/categoryHelper';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const targetSlug = slugifyCategory(params.slug);
  const category = CATEGORIES.find(c => c.slug === targetSlug || c.id === targetSlug) || {
    id: params.slug,
    name: params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: `Browse verified ${params.slug.replace(/-/g, ' ')} from Raj Biosis.`
  };

  const categoryProducts = PRODUCTS.filter(p => slugifyCategory(p.category || '') === targetSlug || slugifyCategory(p.categoryName || '') === targetSlug);
  const seo = generateCategorySEO(category, categoryProducts);

  return {
    title: `${category.name} | Raj Biosis Catalogue`,
    description: seo?.metaDescription || category.description,
    alternates: {
      canonical: `/category/${params.slug}`,
    },
    openGraph: {
      title: `${category.name} | Raj Biosis Catalogue`,
      description: seo?.metaDescription || category.description,
      url: `https://rajbiosis.com/category/${params.slug}`,
      type: 'website',
    },
  };
}

export default function CategoryPage({ params }) {
  const targetSlug = slugifyCategory(params.slug);
  const category = CATEGORIES.find(c => c.slug === targetSlug || c.id === targetSlug) || {
    id: params.slug,
    name: params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: `High-quality ${params.slug.replace(/-/g, ' ')} manufactured and distributed by Raj Biosis.`
  };

  const categoryProducts = PRODUCTS.filter(p => {
    return slugifyCategory(p.category || '') === targetSlug || 
           slugifyCategory(p.categoryName || '') === targetSlug || 
           (p.category && p.category.toLowerCase() === category.name.toLowerCase()) ||
           (p.categoryName && p.categoryName.toLowerCase() === category.name.toLowerCase());
  });

  const otherCategories = CATEGORIES.filter(c => c.id !== 'all' && c.slug !== targetSlug).slice(0, 16);

  const seo = generateCategorySEO(category, categoryProducts);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900 antialiased">
      {/* Schema.org Breadcrumb JSON-LD */}
      {seo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.schemaBreadcrumbs) }}
          suppressHydrationWarning
        />
      )}

      <Header />

      {/* Main Interactive Category Page View */}
      <CategoryPageView
        category={category}
        products={categoryProducts}
        otherCategories={otherCategories}
      />

      <Footer />
    </div>
  );
}
