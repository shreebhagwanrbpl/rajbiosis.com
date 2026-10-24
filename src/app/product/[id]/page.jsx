import { PRODUCTS } from '../../../data/products';
import ProductDetailClient from './ProductDetailClient';
import { generateProductSEO } from '../../../utils/seoGenerator';

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({ params }) {
  const product = PRODUCTS.find((p) => p.id === params.id);
  if (!product) return { title: 'Product Not Found | Raj Biosis' };

  const seo = generateProductSEO(product);

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.keywords,
    alternates: {
      canonical: `/product/${params.id}`,
    },
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      url: `https://rajbiosis.com/product/${params.id}`,
      type: 'website',
      images: [{ url: product.image, alt: product.name }],
    },
  };
}

export default function ProductPage({ params }) {
  const product = PRODUCTS.find((p) => p.id === params.id);
  const seo = product ? generateProductSEO(product) : null;

  return (
    <>
      {/* Auto-Generated Schema.org JSON-LD Structured Data for Google Rich Snippets & FAQ */}
      {seo && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.schemaProduct) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.schemaFAQ) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.schemaBreadcrumbs) }}
          />
        </>
      )}

      <ProductDetailClient productId={params.id} />
    </>
  );
}
