/**
 * Intelligent SEO & Structured Data Generator for Raj Biosis Biomedical Platform
 * Dynamically computes keyword-rich metadata, Schema.org JSON-LD, FAQs, and buying guides
 * based on actual product specifications, certifications, and categories.
 */

export function generateProductSEO(product) {
  if (!product) return null;

  const specHighlights = product.specs
    ? Object.entries(product.specs).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join('; ')
    : '';

  const certsList = product.certifications ? product.certifications.join(', ') : 'ISO 13485, CDSCO';
  const brandName = product.brand || 'Raj Biosis OEM';

  // 1. Dynamic Search-Optimized Meta Title (Under 65 chars, high CTR)
  const metaTitle = `${product.name} (SKU: ${product.sku}) - Price & Specs | Raj Biosis`;

  // 2. Dynamic High-Relevance Meta Description (Under 160 chars, rich in entities)
  const metaDescription = `Procure ${product.name} direct from OEM. ${product.shortDesc} Price: ₹${product.price.toLocaleString('en-IN')}. ${specHighlights}. Certified: ${certsList}. Pan-India hospital delivery.`;

  // 3. Automated SEO Keywords
  const keywords = [
    product.name,
    product.sku,
    product.category.replace(/-/g, ' '),
    `${product.name} price in India`,
    `${product.category.replace(/-/g, ' ')} equipment`,
    `${brandName} hospital systems`,
    'biomedical engineering India',
    'CDSCO certified medical devices',
    'hospital procurement GeM tender',
    'institutional medical quotation'
  ];

  // 4. Auto-Generated Clinical & Procurement FAQs
  const faqs = [
    {
      question: `What are the key technical specifications and clinical capabilities of ${product.name}?`,
      answer: `${product.name} (Model SKU: ${product.sku}) is engineered for hospital environments. Key specifications include: ${specHighlights || product.shortDesc}. It includes features such as: ${product.features ? product.features.join('. ') : 'Clinical grade precision and digital hospital integration'}.`
    },
    {
      question: `Is ${product.name} certified under CDSCO, ISO 13485, and NABH standards in India?`,
      answer: `Yes. ${product.name} is fully authenticated with ${certsList}. Every unit complies with the Medical Device Rules 2017 (CDSCO) and undergoes rigorous electrical safety leakage testing (IEC 62353) before dispatch.`
    },
    {
      question: `What warranty, calibration certificate, and maintenance SLA are provided?`,
      answer: `Each unit comes with ${product.warranty || 'a standard 2 Years Comprehensive On-Site Warranty'}. Raj Biosis includes pre-delivery factory NABL-accredited calibration certificates and provides dedicated biomedical engineer on-site commissioning and AMC/CMC support.`
    },
    {
      question: `How can healthcare institutions request institutional bulk pricing or GeM tender bids?`,
      answer: `Hospitals, nursing homes, and government tender bidders can submit an instant RFQ through the online quotation generator on this page or contact the institutional sales desk at 9983333469. Volume tiered pricing is available for quantities of 2 or more units.`
    }
  ];

  // 5. Schema.org JSON-LD Structured Data for Google Product & Rich Snippets
  const schemaProduct = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: [product.image],
    description: product.shortDesc,
    sku: product.sku,
    mpn: product.sku,
    brand: {
      '@type': 'Brand',
      name: brandName
    },
    offers: {
      '@type': 'Offer',
      url: `https://rajbiosis.com/product/${product.id}`,
      priceCurrency: 'INR',
      price: product.price,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Raj Biosis Pvt. Ltd.'
      }
    }
  };

  // 6. Schema.org FAQPage Structured Data for Google Rich Q&A Results
  const schemaFAQ = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  // 7. Schema.org BreadcrumbList
  const schemaBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://rajbiosis.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.category.replace(/-/g, ' ').toUpperCase(),
        item: `https://rajbiosis.com/category/${product.category}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `https://rajbiosis.com/product/${product.id}`
      }
    ]
  };

  return {
    metaTitle,
    metaDescription,
    keywords,
    faqs,
    schemaProduct,
    schemaFAQ,
    schemaBreadcrumbs
  };
}

export function generateCategorySEO(category, products = []) {
  if (!category) return null;

  const count = products.length;
  const sampleProducts = products.slice(0, 3).map(p => p.name).join(', ');

  const metaTitle = `${category.name} Medical Equipment | Raj Biosis Life Systems`;
  const metaDescription = `Procure certified ${category.name} direct from manufacturer. Featured models: ${sampleProducts}. CDSCO registered with NABL calibration & pan-India installation.`;

  // Comprehensive Auto-Generated Procurement Guide Content
  const procurementGuide = {
    title: `Institutional Procurement Guide: ${category.name}`,
    summary: `When procuring ${category.name.toLowerCase()} for hospital wards, ICUs, or surgical suites, biomedical directors and purchase committees must evaluate device reliability, regulatory certifications, and life-cycle maintenance terms.`,
    keyCheckpoints: [
      `CDSCO Registration & Quality Standards: Verify compliance with the Medical Device Rules 2017, ISO 13485:2016, and relevant IEC 60601 electrical safety requirements.`,
      `Factory Calibration & Traceability: Ensure each unit is supplied with valid NABL-accredited metrology calibration reports before clinical deployment.`,
      `On-Site Engineering Commissioning: Ensure biomedical engineers handle unboxing, calibration, staff orientation, and electrical grounding verification.`,
      `Long-term Spare Parts & AMC SLA: Demand minimum 8 to 10 years guaranteed spare parts availability with defined breakdown response times (< 4 hours in metropolitan areas).`
    ]
  };

  const schemaBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://rajbiosis.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Categories',
        item: 'https://rajbiosis.com/products'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: `https://rajbiosis.com/category/${category.id}`
      }
    ]
  };

  return {
    metaTitle,
    metaDescription,
    procurementGuide,
    schemaBreadcrumbs
  };
}
