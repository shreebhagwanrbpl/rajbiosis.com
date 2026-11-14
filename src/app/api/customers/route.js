import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const email = searchParams.get('email');
    const search = searchParams.get('search');

    const db = await getDatabase();
    const collection = db.collection('customers');

    let query = {};
    const conditions = [];

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      if (cleanPhone) conditions.push({ phone: { $regex: cleanPhone } });
    }
    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail) conditions.push({ email: { $regex: cleanEmail, $options: 'i' } });
    }
    if (search) {
      const s = search.trim();
      conditions.push({ fullName: { $regex: s, $options: 'i' } });
      conditions.push({ hospitalName: { $regex: s, $options: 'i' } });
      conditions.push({ phone: { $regex: s } });
      conditions.push({ email: { $regex: s, $options: 'i' } });
    }

    if (conditions.length > 0) {
      query = { $or: conditions };
    }

    const customers = await collection.find(query).sort({ updatedAt: -1, createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      source: 'mongodb',
      count: customers.length,
      customers: customers || []
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message, customers: [] }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const phone = (body.phone || body.mobile || '').trim();
    const email = (body.email || '').trim().toLowerCase();

    if (!body.fullName && !phone && !email) {
      return NextResponse.json({ success: false, error: 'Full name and phone/email required' }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection('customers');

    const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';
    const now = new Date().toISOString();

    const incoming = body.profileDetails || body;
    const filterConditions = [];
    if (body.id) filterConditions.push({ id: body.id });
    if (cleanPhone) filterConditions.push({ phone: { $regex: cleanPhone } });
    if (email) filterConditions.push({ email: email });

    let existing = null;
    if (filterConditions.length > 0) {
      existing = await collection.findOne({ $or: filterConditions });
    }

    let customerRecord;
    if (existing) {
      customerRecord = {
        ...existing,
        ...incoming,
        id: existing.id || body.id || ('cust-' + (cleanPhone || Date.now())),
        updatedAt: now,
        lastAction: 'Profile Updated in MongoDB',
        lastActionAt: now
      };
      delete customerRecord._id;
      await collection.updateOne({ _id: existing._id }, { $set: customerRecord });
      customerRecord._id = existing._id;
    } else {
      customerRecord = {
        ...incoming,
        id: body.id || ('cust-' + (cleanPhone || Date.now())),
        siteDomain: body.siteDomain || 'rajbiosis.com',
        brandName: 'Raj Biosis',
        createdAt: now,
        updatedAt: now,
        lastAction: 'New Customer Created in MongoDB',
        lastActionAt: now
      };
      delete customerRecord._id;
      const res = await collection.insertOne(customerRecord);
      customerRecord._id = res.insertedId;
    }

    return NextResponse.json({
      success: true,
      source: 'mongodb',
      customer: customerRecord
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
