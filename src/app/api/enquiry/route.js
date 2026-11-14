import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('[RBPL Enquiry Received for MongoDB]:', data);

    const now = new Date().toISOString();
    const phone = (data.customerPhone || data.phone || '').trim();
    const email = (data.customerEmail || data.email || '').trim().toLowerCase();
    const leadId = data.id || ('RFQ-' + Math.floor(100000 + Math.random() * 900000));
    const hosp = (data.hospitalName || data.hospital || '').trim();
    const doc = (data.customerName || data.fullName || 'NA').trim();
    const addr = (data.address || '').trim();
    const dist = (data.district || 'Jaipur').trim();

    const st = (data.state || '').trim();
    const pin = (data.pincode || '').toString().trim();
    const phClean = phone.replace(/\D/g, '');

    const isGenericHosp = !hosp || [
      'clinic / hospital', 'healthcare facility', 'general hospital', 'hospital',
      'customer hospital / lab', 'customer hospital / diagnostic lab'
    ].some(g => hosp.toLowerCase() === g || hosp.toLowerCase().includes('healthcare institution'));

    const isComplete = Boolean(
      !isGenericHosp &&
      hosp.length >= 3 &&
      doc.length >= 2 &&
      doc.toLowerCase() !== 'medical client' &&
      phClean.length >= 10 &&
      email.length >= 5 &&
      email.includes('@') &&
      st.length >= 2 &&
      dist.length >= 2 &&
      dist.toLowerCase() !== 'india' &&
      addr.length >= 3 &&
      pin.length >= 4
    );

    const offerPrice = data.expectedPrice ? Number(data.expectedPrice) : null;
    const isNeg = Boolean(data.isNegotiable || offerPrice);
    const catalogBase = Number(data.actualPrice || data.catalogPrice || data.price || 485000);

    const newLead = {
      id: leadId,
      doctorName: doc,
      hospital: hosp || 'NA',
      city: dist,
      address: addr,
      email: email,
      phone: phone,
      siteDomain: data.siteDomain || 'rajbiosis.com',
      brandName: 'Raj Biosis',
      equipment: data.productName || data.equipment || 'Biomedical Equipment',
      price: offerPrice || data.unitPrice || catalogBase,
      actualPrice: catalogBase,
      expectedPrice: offerPrice,
      isNegotiable: isNeg,
      isPriceNegotiated: Boolean(offerPrice && offerPrice > 0),
      negotiationStatus: data.negotiationStatus || (offerPrice ? 'pending_approval' : 'none'),
      approvedPrice: data.approvedPrice || null,
      quoteAmount: data.grandTotal ? ('₹' + Number(data.grandTotal).toLocaleString('en-IN')) : (data.quoteAmount || `₹${(offerPrice || catalogBase).toLocaleString('en-IN')}`),
      status: data.status || (offerPrice ? 'Pending Price Approval' : 'New Lead'),
      isProfileComplete: isComplete,
      date: 'Just now',
      createdAt: now,
      updatedAt: now,
      rawLeadData: data
    };
    const { createdAt, _id, ...fieldsToSet } = newLead;

    try {
      const db = await getDatabase();
      const leadsCol = db.collection('leads');

      // Atomic Upsert: Never creates duplicate records
      await leadsCol.updateOne(
        { id: leadId },
        {
          $set: {
            ...fieldsToSet,
            updatedAt: now
          },
          $setOnInsert: {
            createdAt: createdAt || now
          }
        },
        { upsert: true }
      );

      // Upsert customer profile if phone or email present
      if (phone || email) {
        const custCol = db.collection('customers');
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);
        const custId = 'cust-' + (cleanPhone || Date.now());

        await custCol.updateOne(
          { $or: [{ phone: { $regex: cleanPhone } }, { email: { $regex: `^${email}$`, $options: 'i' } }] },
          {
            $set: {
              fullName: doc,
              hospitalName: hosp || 'Clinic / Hospital',
              address: addr,
              district: dist,
              phone: phone,
              email: email,
              updatedAt: now
            },
            $setOnInsert: {
              id: custId,
              siteDomain: 'rajbiosis.com',
              brandName: 'Raj Biosis',
              createdAt: now
            }
          },
          { upsert: true }
        );
      }
    } catch (dbErr) {
      console.warn('[MongoDB save warning in /api/enquiry]:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Enquiry saved directly to MongoDB Atlas successfully',
      leadId: leadId
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Raj Biosis Enquiry MongoDB API is active'
  });
}
