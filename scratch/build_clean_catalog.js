const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = 'mongodb://rajbiosis15_db_user:Rbpl302021@ac-xdnyrrg-shard-00-00.aneatej.mongodb.net:27017,ac-xdnyrrg-shard-00-01.aneatej.mongodb.net:27017,ac-xdnyrrg-shard-00-02.aneatej.mongodb.net:27017/company_master_cms?ssl=true&replicaSet=atlas-c27e2k-shard-0&authSource=admin&retryWrites=true&w=majority';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parsePrice(val) {
  if (typeof val === 'number') return val;
  const num = parseFloat(String(val || '').replace(/,/g, '').replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}

function cleanCategoryName(raw) {
  let name = String(raw || '').trim();
  // Capitalize properly if needed
  if (name === 'clinical-reagents') return 'Clinical Reagents';
  if (name === 'ivds-category') return 'In-Vitro Diagnostics (IVD)';
  if (name === 'pcr-machine') return 'PCR Machines & Molecular Diagnostics';
  if (name === 'corona-test') return 'Corona & Infectious Disease Test Kits';
  return name.split(/[\s-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

async function buildCatalog() {
  console.log('Connecting to MongoDB Atlas (SuperAdminRBPL company_master_cms)...');
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
  await client.connect();
  const db = client.db('company_master_cms');
  const catDocs = await db.collection('rbpl_products').find({}).toArray();

  const curatedProducts = [];
  const categoriesList = [];

  for (const c of catDocs) {
    const rawCatName = c.name || c.category || c._id;
    const formattedCatName = cleanCategoryName(rawCatName);
    const catSlug = slugify(formattedCatName);
    let allCatProducts = [];

    if (Array.isArray(c.subcategories)) {
      c.subcategories.forEach(sub => {
        if (Array.isArray(sub.products)) {
          sub.products.forEach(p => {
            const img = p.image || (p.images && p.images[0]);
            if (img && !img.includes('noimage') && !img.includes('placeholder')) {
              allCatProducts.push({ ...p, formattedCatName, catSlug });
            }
          });
        }
      });
    }

    if (allCatProducts.length > 0) {
      categoriesList.push({
        id: catSlug,
        slug: catSlug,
        name: formattedCatName,
        itemCount: allCatProducts.length,
        image: allCatProducts[0].image || (allCatProducts[0].images && allCatProducts[0].images[0]),
        description: `High-quality ${formattedCatName} certified for clinical laboratories, research centres, and hospitals.`
      });

      // Pick up to 16 distinct high-quality products per category
      const seen = new Set();
      let picked = 0;
      for (const p of allCatProducts) {
        const prodName = (p.name || p.title || '').trim();
        if (!prodName || seen.has(prodName.toLowerCase())) continue;
        seen.add(prodName.toLowerCase());

        const rawPrice = parsePrice(p.price);
        const price = rawPrice > 0 ? rawPrice : 1250;
        const mrp = Math.round(price * 1.35);
        const prodId = p.slug || slugify(prodName);

        const specsObj = {};
        if (p.model) specsObj['Model'] = p.model;
        if (p.capacity || p.size) specsObj['Packaging / Size'] = p.capacity || p.size;
        if (p.throughput) specsObj['Throughput / Test Time'] = p.throughput;
        if (p.usage) specsObj['Clinical Application'] = p.usage;
        if (p.instrument) specsObj['Analyzer Platform'] = p.instrument;
        if (p.parameters) specsObj['Parameters Covered'] = p.parameters;
        if (p.automation) specsObj['Automation Grade'] = p.automation;
        if (p.availability) specsObj['Supply Status'] = p.availability;
        if (Object.keys(specsObj).length === 0) {
          specsObj['Quality Standard'] = 'ISO 13485:2016 / CE Certified';
          specsObj['Application'] = 'Clinical Diagnostic & Hospital Use';
        }

        const featuresArr = [];
        if (p.parameters) featuresArr.push(`Diagnostic target: ${p.parameters}`);
        if (p.usage) featuresArr.push(`Validated for ${p.usage}`);
        if (p.instrument) featuresArr.push(`Engineered for ${p.instrument}`);
        featuresArr.push('High analytical sensitivity and batch-to-batch diagnostic consistency');
        featuresArr.push('Ready for immediate temperature-controlled dispatch across India');

        curatedProducts.push({
          id: prodId,
          sku: p.categoryProductId || ('RB-' + prodId.substring(0, 10).toUpperCase()),
          name: prodName,
          model: p.model || 'Standard Edition',
          brand: p.brand || 'Raj Biosis',
          category: catSlug,
          categoryName: formattedCatName,
          subCategory: p.subCategory || '',
          price: price,
          mrp: mrp,
          rating: 4.8,
          reviewsCount: Math.floor(18 + Math.random() * 45),
          stockStatus: 'In Stock (Dispatch in 24h)',
          stockCount: 35,
          badge: price > 5000 ? 'OEM Certified' : 'Clinical Grade',
          isNegotiable: true,
          certifications: ['CDSCO Approved', 'ISO 13485:2016', 'CE Certified', 'GMP Compliant'],
          warranty: '1 Year Comprehensive Quality Assurance + Calibration Certificate',
          image: p.image || (p.images && p.images[0]),
          shortDescription: p.desc || p.description || `${prodName} engineered for clinical laboratories and diagnostic accuracy.`,
          fullDescription: p.description || p.desc || `${prodName} manufactured and verified under strict medical diagnostic quality protocols.`,
          specs: specsObj,
          features: featuresArr,
          packageContents: [
            `1x ${prodName} pack`,
            '1x Product Instruction for Use (IFU)',
            '1x Quality Inspection & Calibration Certificate'
          ],
          pdf: p.pdf || ''
        });

        picked++;
        if (picked >= 16) break;
      }
    }
  }

  // Sort categories by itemCount descending
  categoriesList.sort((a, b) => b.itemCount - a.itemCount);

  console.log(`Extracted ${categoriesList.length} categories.`);
  console.log(`Extracted ${curatedProducts.length} curated live products.`);

  // Write to src/data/productsCache.json
  const cachePath = path.join(__dirname, '..', 'src', 'data', 'productsCache.json');
  fs.writeFileSync(cachePath, JSON.stringify(curatedProducts, null, 2), 'utf8');
  console.log(`Saved updated products cache to: ${cachePath}`);

  await client.close();
  console.log('Database connection closed.');
}

buildCatalog().catch(err => {
  console.error('Error building catalog:', err);
  process.exit(1);
});
