import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProductCard from '../../../components/ProductCard';
import { CATEGORIES } from '../../../data/categories';
import { PRODUCTS } from '../../../data/products';
import { generateCategorySEO } from '../../../utils/seoGenerator';
import { ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, FileText, Info } from 'lucide-react';

export async function generateStaticParams() {
  return CATEGORIES.filter(c => c.id !== 'all').map(category => ({
    slug: category.id,
  }));
}

export async function generateMetadata({ params }) {
  const category = CATEGORIES.find(c => c.id === params.slug);
  if (!category) return { title: 'Category Not Found | Raj Biosis' };

  const categoryProducts = PRODUCTS.filter(p => p.category === category.id);
  const seo = generateCategorySEO(category, categoryProducts);

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    alternates: {
      canonical: `/category/${params.slug}`,
    },
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      url: `https://rajbiosis.com/category/${params.slug}`,
      type: 'website',
    },
  };
}

export default function CategoryPage({ params }) {
  const category = CATEGORIES.find(c => c.id === params.slug);
  if (!category) {
    notFound();
  }

  const categoryProducts = PRODUCTS.filter(p => p.category === category.id);
  const seo = generateCategorySEO(category, categoryProducts);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900 antialiased">
      {/* Schema.org Breadcrumb JSON-LD for Google */}
      {seo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.schemaBreadcrumbs) }}
        />
      )}

      <Header />

      {/* Breadcrumb & Category Hero Banner */}
      <div className="bg-white border-b border-neutral-200 py-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-2 text-xs text-neutral-600 font-medium mb-3">
            <Link href="/" className="hover:text-brand-600 transition">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-brand-600 transition">Catalogue</Link>
            <span>/</span>
            <span className="text-neutral-950 font-bold">{category.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block mb-1">
                Clinical Department Catalogue
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-950 tracking-tight">
                {category.name}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-700 font-medium max-w-2xl mt-1.5 leading-relaxed">
                {category.description}. Certified life support and medical engineering hardware with standard factory warranty and on-site biomedical engineer commissioning.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 bg-neutral-100 px-3.5 py-2 rounded-xl border border-neutral-200 self-start md:self-auto">
              <ShieldCheck size={16} className="text-brand-600" />
              <span>{categoryProducts.length} Verified Equipment Models</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Product Showcase */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* =========================================================================
            AUTO-GENERATED PROCUREMENT & TECHNICAL SEO BUYING GUIDE
            ========================================================================= */}
        {seo && seo.procurementGuide && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-600"></span>
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                Hospital Technical Buying Guide
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              {seo.procurementGuide.title}
            </h2>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              {seo.procurementGuide.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {seo.procurementGuide.keyCheckpoints.map((pt, idx) => {
                const [heading, desc] = pt.split(': ');
                return (
                  <div key={idx} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80">
                    <div className="flex items-start gap-2 text-xs font-bold text-neutral-900 mb-1">
                      <CheckCircle2 size={15} className="text-brand-600 shrink-0 mt-0.5" />
                      <span>{heading}</span>
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed pl-6">
                      {desc}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between text-xs text-neutral-500 gap-3">
              <span>All equipment models in this category are eligible for hospital GeM bids and direct institutional quotations.</span>
              <Link href="/contact" className="font-bold text-brand-600 hover:underline">
                Contact Procurement Specialist &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Category Navigation Pills */}
        <div className="pt-4 border-t border-neutral-200">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">
            Explore Other Clinical Departments:
          </h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter(c => c.id !== 'all' && c.id !== category.id).map((otherCat) => (
              <Link
                key={otherCat.id}
                href={`/category/${otherCat.id}`}
                className="px-3.5 py-2 bg-white hover:bg-neutral-100 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 transition"
              >
                {otherCat.name}
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
