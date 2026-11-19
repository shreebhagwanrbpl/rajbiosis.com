import { PRODUCTS } from '../../../data/products';
import ProductDetailClient from './ProductDetailClient';
import { generateProductSEO } from '../../../utils/seoGenerator';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const product = PRODUCTS.find((p) => p.id === params.id || p.sku === params.id || p._id === params.id);
  if (!product) return { title: 'Product Details | Raj Biosis' };

  const seo = generateProductSEO(product);

  return {
    title: seo ? seo.metaTitle : `${product.name} | Raj Biosis`,
    description: seo ? seo.metaDescription : product.shortDesc || product.name,
    keywords: seo ? seo.keywords : `${product.name}, ${product.category}, Raj Biosis`,
    alternates: {
      canonical: `/product/${params.id}`,
    },
    openGraph: {
      title: seo ? seo.metaTitle : product.name,
      description: seo ? seo.metaDescription : product.name,
      url: `https://rajbiosis.com/product/${params.id}`,
      type: 'website',
      images: product.image ? [{ url: product.image, alt: product.name }] : [],
    },
  };
}

export default function ProductPage({ params }) {
  const product = PRODUCTS.find((p) => p.id === params.id || p.sku === params.id || p._id === params.id);
  const seo = product ? generateProductSEO(product) : null;

  return (
    <>
      {/* Auto-Generated Schema.org JSON-LD Structured Data for Google Rich Snippets & FAQ */}
      {seo && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.schemaProduct) }}
            suppressHydrationWarning
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.schemaFAQ) }}
            suppressHydrationWarning
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.schemaBreadcrumbs) }}
            suppressHydrationWarning
          />
        </>
      )}

      <ProductDetailClient productId={params.id} />
    </>
  );
}
