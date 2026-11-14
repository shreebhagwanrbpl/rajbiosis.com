import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cart-wishlist
 * - If query ?productId=... : returns stats and list of customers for a specific product
 * - If no query (Admin view) : returns aggregated products breakdown and recent activities
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const phone = searchParams.get('phone');
    const customerId = searchParams.get('customerId');
    const checkOffers = searchParams.get('checkOffers');

    const db = await getDatabase().catch(() => null);

    if (!db) {
      // Graceful offline fallback
      return NextResponse.json({
        success: true,
        source: 'local_fallback',
        wishlistCount: 0,
        cartCount: 0,
        customers: [],
        products: [],
        summary: { totalWishlist: 0, totalCart: 0, productsCount: 0, customersCount: 0 }
      });
    }

    // Check for Customer Offer or Storewide Broadcast Offer
    if (phone || customerId || checkOffers === 'true') {
      try {
        const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
        const customerCartsCol = db.collection('customer_carts');
        const storewideCol = db.collection('storewide_offers');

        const [custCart, storewideOffer] = await Promise.all([
          (cleanPhone || customerId)
            ? customerCartsCol.findOne({
                $or: [
                  ...(cleanPhone ? [{ phone: { $regex: cleanPhone } }] : []),
                  ...(customerId ? [{ customerId: customerId }] : [])
                ]
              })
            : null,
          storewideCol.findOne({ active: true })
        ]);

        let activeOffer = null;

        // Check customer specific offer first
        if (custCart && custCart.activeOffer) {
          const off = custCart.activeOffer;
          if (!off.validTill || new Date(off.validTill) >= new Date()) {
            activeOffer = off;
          }
        }

        // Fallback to storewide offer if no customer specific offer
        if (!activeOffer && storewideOffer) {
          if (!storewideOffer.validTill || new Date(storewideOffer.validTill) >= new Date()) {
            activeOffer = storewideOffer;
          }
        }

        return NextResponse.json({
          success: true,
          activeOffer: activeOffer,
          storewideOffer: storewideOffer,
          customerOffer: custCart?.activeOffer || null,
          customerCart: custCart || null
        });
      } catch (err) {
        console.warn('Error checking offers:', err.message);
      }
    }

        const collection = db.collection('cart_wishlist_interactions');

    if (productId) {
      // 1. Single product query
      const activeRecords = await collection
        .find({
          productId: productId,
          status: 'active'
        })
        .sort({ updatedAt: -1 })
        .toArray();

      const wishlistCustomers = [];
      const cartCustomers = [];

      activeRecords.forEach((rec) => {
        const custInfo = {
          id: rec.customerId,
          name: rec.customerName || 'NA',
          phone: rec.customerPhone || '',
          email: rec.customerEmail || '',
          hospital: rec.hospitalName || 'NA',
          district: rec.district || 'Jaipur',
          type: rec.type, // 'wishlist' | 'cart'
          qty: rec.qty || 1,
          updatedAt: rec.updatedAt || rec.createdAt,
          date: rec.date || new Date(rec.updatedAt || rec.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })
        };

        if (rec.type === 'wishlist') {
          wishlistCustomers.push(custInfo);
        } else if (rec.type === 'cart') {
          cartCustomers.push(custInfo);
        }
      });

      return NextResponse.json({
        success: true,
        source: 'mongodb',
        productId: productId,
        wishlistCount: wishlistCustomers.length,
        cartCount: cartCustomers.length,
        wishlistCustomers: wishlistCustomers,
        cartCustomers: cartCustomers,
        allCustomers: [...wishlistCustomers, ...cartCustomers]
      });
    }

    // 2. Admin Global Analytics Query (No productId specified)
    const allActive = await collection
      .find({ status: 'active' })
      .sort({ updatedAt: -1 })
      .toArray();

    // Group by productId
    const productsMap = new Map();
    const uniqueCustomerIds = new Set();
    let totalWishlist = 0;
    let totalCart = 0;

    allActive.forEach((rec) => {
      const pId = rec.productId;
      if (!pId) return;

      if (!productsMap.has(pId)) {
        productsMap.set(pId, {
          productId: pId,
          productName: rec.productName || 'Medical Equipment',
          productSku: rec.productSku || `SKU-${pId}`,
          productCategory: rec.productCategory || 'Biomedical',
          productPrice: rec.productPrice || null,
          productImage: rec.productImage || null,
          wishlistCount: 0,
          cartCount: 0,
          wishlistCustomers: [],
          cartCustomers: []
        });
      }

      const prod = productsMap.get(pId);
      const custObj = {
        id: rec.customerId,
        name: rec.customerName || 'NA',
        phone: rec.customerPhone || '',
        email: rec.customerEmail || '',
        hospital: rec.hospitalName || 'NA',
        district: rec.district || 'Jaipur',
        type: rec.type,
        qty: rec.qty || 1,
        updatedAt: rec.updatedAt || rec.createdAt,
        date: rec.date || new Date(rec.updatedAt || rec.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      };

      if (rec.customerId) uniqueCustomerIds.add(rec.customerId);
      if (rec.customerPhone) uniqueCustomerIds.add(rec.customerPhone);

      if (rec.type === 'wishlist') {
        prod.wishlistCount += 1;
        totalWishlist += 1;
        prod.wishlistCustomers.push(custObj);
      } else if (rec.type === 'cart') {
        prod.cartCount += 1;
        totalCart += 1;
        prod.cartCustomers.push(custObj);
      }
    });

    const productsList = Array.from(productsMap.values()).sort(
      (a, b) => (b.wishlistCount + b.cartCount) - (a.wishlistCount + a.cartCount)
    );

    const recentActivities = allActive.slice(0, 50).map((r) => ({
      id: r._id ? String(r._id) : r.id,
      productId: r.productId,
      productName: r.productName,
      productSku: r.productSku,
      productImage: r.productImage,
      type: r.type,
      customerName: r.customerName || 'NA',
      customerPhone: r.customerPhone,
      customerEmail: r.customerEmail,
      hospitalName: r.hospitalName,
      district: r.district,
      qty: r.qty || 1,
      updatedAt: r.updatedAt || r.createdAt
    }));

    return NextResponse.json({
      success: true,
      source: 'mongodb',
      summary: {
        totalWishlist: totalWishlist,
        totalCart: totalCart,
        productsCount: productsList.length,
        customersCount: uniqueCustomerIds.size
      },
      products: productsList,
      recentActivities: recentActivities
    });
  } catch (err) {
    console.error('Error fetching cart/wishlist analytics:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/cart-wishlist
 * Body: { action, product, customer, qty }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, product, customer, qty } = body;

    if (!action || !product || !product.id) {
      return NextResponse.json(
        { success: false, error: 'action and product.id are required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const dateFormatted = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timeFormatted = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const custId = customer?.id || (customer?.phone ? `cust-${customer.phone.replace(/\D/g, '')}` : `cust_guest_${customer?.district || 'Jaipur'}`);
    const custName = customer?.fullName || customer?.name || customer?.customerName || 'Verified Healthcare Client';
    const custPhone = customer?.phone || customer?.mobile || '';
    const custEmail = customer?.email || '';
    const custHospital = customer?.hospitalName || customer?.hospital || '';
    const custDistrict = customer?.district || customer?.city || 'Jaipur';

    const db = await getDatabase().catch(() => null);

    if (db) {
      const collection = db.collection('cart_wishlist_interactions');
      const customersCollection = db.collection('customers');

      const isWishlist = action === 'add_to_wishlist' || action === 'remove_from_wishlist';
      const isCart = action === 'add_to_cart' || action === 'remove_from_cart';
      const interactionType = isWishlist ? 'wishlist' : 'cart';
      const isAdd = action === 'add_to_wishlist' || action === 'add_to_cart';

      const filter = {
        customerId: custId,
        productId: product.id,
        type: interactionType
      };

      if (isAdd) {
        // Upsert active interaction
        await collection.updateOne(
          filter,
          {
            $set: {
              customerId: custId,
              customerName: custName,
              customerPhone: custPhone,
              customerEmail: custEmail,
              hospitalName: custHospital,
              district: custDistrict,
              productId: product.id,
              productName: product.name || product.title || 'Medical Equipment',
              productSku: product.sku || `SKU-${product.id}`,
              productCategory: product.category || 'Biomedical',
              productPrice: product.price || 100000,
              productImage: product.image || product.img || (Array.isArray(product.images) ? product.images[0] : null),
              type: interactionType,
              qty: Math.max(1, Number(qty || 1)),
              status: 'active',
              date: dateFormatted,
              time: timeFormatted,
              updatedAt: now
            },
            $setOnInsert: {
              createdAt: now
            }
          },
          { upsert: true }
        );

        // Also sync item to customer profile if customer exists
        if (custPhone || custEmail) {
          const fieldToPush = isWishlist ? 'wishlistItems' : 'cartItems';
          const itemPayload = {
            id: product.id,
            name: product.name || product.title || 'Medical Equipment',
            sku: product.sku || `SKU-${product.id}`,
            price: product.price || 100000,
            qty: qty || 1,
            addedAt: now
          };

          const custFilter = custPhone
            ? { phone: { $regex: custPhone.replace(/\D/g, '').slice(-10) } }
            : { email: custEmail };

          await customersCollection.updateOne(
            custFilter,
            {
              $addToSet: { [fieldToPush]: itemPayload },
              $set: { updatedAt: now, lastInteractionAt: now }
            }
          ).catch(() => {});
        }
      } else {
        // Remove: set status to 'removed'
        await collection.updateOne(
          filter,
          {
            $set: {
              status: 'removed',
              updatedAt: now
            }
          }
        );

        // Pull from customer document if available
        if (custPhone || custEmail) {
          const fieldToPull = isWishlist ? 'wishlistItems' : 'cartItems';
          const custFilter = custPhone
            ? { phone: { $regex: custPhone.replace(/\D/g, '').slice(-10) } }
            : { email: custEmail };

          await customersCollection.updateOne(
            custFilter,
            {
              $pull: { [fieldToPull]: { id: product.id } },
              $set: { updatedAt: now }
            }
          ).catch(() => {});
        }
      }

      // 3. DIRECT SYNC TO MULTITASKINGADMIN customer_carts COLLECTION & JSON
      try {
        const customerCartsCol = db.collection('customer_carts');
        const clean10Phone = (custPhone || '').replace(/\D/g, '').slice(-10);

        let custCartDoc = await customerCartsCol.findOne({
          $or: [
            { customerId: custId },
            ...(clean10Phone ? [{ phone: { $regex: clean10Phone } }] : [])
          ]
        });

        if (!custCartDoc) {
          custCartDoc = {
            customerId: custId,
            customerName: custName,
            hospitalName: custHospital,
            phone: custPhone,
            email: custEmail,
            district: custDistrict,
            siteDomain: 'rajbiosis.com',
            lastActive: 'Just now',
            updatedAt: now,
            cart: [],
            watchlist: []
          };
        } else {
          custCartDoc.customerName = custName || custCartDoc.customerName;
          custCartDoc.hospitalName = custHospital || custCartDoc.hospitalName;
          custCartDoc.phone = custPhone || custCartDoc.phone;
          custCartDoc.email = custEmail || custCartDoc.email;
          custCartDoc.district = custDistrict || custCartDoc.district;
          custCartDoc.lastActive = 'Just now';
          custCartDoc.updatedAt = now;
          custCartDoc.cart = custCartDoc.cart || [];
          custCartDoc.watchlist = custCartDoc.watchlist || [];
        }

        const prodItem = {
          productId: product.id,
          name: product.name || 'Medical Equipment',
          sku: product.sku || `SKU-${product.id}`,
          brand: product.brand || 'Raj Biosis OEM',
          category: product.category || 'Biomedical',
          price: Number(product.price) || 100000,
          mrp: Number(product.mrp || (Number(product.price || 100000) * 1.3)),
          image: product.image || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
          quantity: Math.max(1, Number(qty || 1)),
          addedAt: now,
          specs: product.specs || product.shortDesc || 'Institutional Certified Equipment',
          sourceSite: 'rajbiosis.com'
        };

        if (action === 'add_to_cart') {
          const exIdx = custCartDoc.cart.findIndex(i => i.productId === product.id);
          if (exIdx > -1) {
            custCartDoc.cart[exIdx].quantity = (custCartDoc.cart[exIdx].quantity || 1) + Number(qty || 1);
            custCartDoc.cart[exIdx].addedAt = now;
          } else {
            custCartDoc.cart.unshift(prodItem);
          }
        } else if (action === 'remove_from_cart') {
          custCartDoc.cart = custCartDoc.cart.filter(i => i.productId !== product.id);
        } else if (action === 'add_to_wishlist') {
          const exIdx = custCartDoc.watchlist.findIndex(i => i.productId === product.id);
          if (exIdx > -1) {
            custCartDoc.watchlist[exIdx].addedAt = now;
          } else {
            custCartDoc.watchlist.unshift({
              ...prodItem,
              stockStatus: product.stockStatus || 'In Stock'
            });
          }
        } else if (action === 'remove_from_wishlist') {
          custCartDoc.watchlist = custCartDoc.watchlist.filter(i => i.productId !== product.id);
        }

        // Save to MongoDB collection 'customer_carts'
        await customerCartsCol.updateOne(
          { $or: [{ customerId: custCartDoc.customerId }, ...(clean10Phone ? [{ phone: { $regex: clean10Phone } }] : [])] },
          { $set: custCartDoc },
          { upsert: true }
        );

        // Also update C:\Users\Admin\Documents\GitHub\New folder\MultiTaskingAdmin\src\data\customer_carts.json safely
        try {
          const fs = await import('fs');
          const adminCartPath = 'C:\\Users\\Admin\\Documents\\GitHub\\New folder\\MultiTaskingAdmin\\src\\data\\customer_carts.json';
          if (fs.existsSync(adminCartPath)) {
            const raw = fs.readFileSync(adminCartPath, 'utf8');
            let list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const fileIdx = list.findIndex(c => 
                (custCartDoc.customerId && c.customerId === custCartDoc.customerId) ||
                (clean10Phone && (c.phone || '').replace(/\D/g, '').includes(clean10Phone))
              );
              if (fileIdx > -1) {
                list[fileIdx] = { ...list[fileIdx], ...custCartDoc };
              } else {
                list.unshift(custCartDoc);
              }
              fs.writeFileSync(adminCartPath, JSON.stringify(list, null, 2), 'utf8');
            }
          }
        } catch (fsErr) {
          console.warn('File sync to admin json skipped:', fsErr.message);
        }

        // Also ping MultiTaskingAdmin on port 3002
        try {
          fetch('http://localhost:3002/api/cart-watchlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: action === 'add_to_wishlist' ? 'add_to_watchlist' : action,
              customerId: custCartDoc.customerId,
              phone: custCartDoc.phone,
              customerData: custCartDoc,
              product: prodItem,
              quantity: qty || 1
            }),
            signal: AbortSignal.timeout(1500)
          }).catch(() => {});
        } catch (pingErr) {}
      } catch (adminSyncErr) {
        console.warn('Error syncing to customer_carts admin:', adminSyncErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      action: action,
      productId: product.id,
      timestamp: now
    });
  } catch (err) {
    console.error('Error handling cart-wishlist interaction:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
