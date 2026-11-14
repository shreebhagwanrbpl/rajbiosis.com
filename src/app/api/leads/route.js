import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const email = searchParams.get('email');

    const db = await getDatabase();
    const collection = db.collection('leads');

    let query = {};
    const conditions = [];

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      if (cleanPhone) conditions.push({ phone: { $regex: cleanPhone } });
    }

    if (email) {
      const cleanEmail = email.trim();
      if (cleanEmail) conditions.push({ email: { $regex: `^${cleanEmail}$`, $options: 'i' } });
    }

    if (conditions.length > 0) {
      query = { $or: conditions };
    }

    const rawLeads = await collection.find(query).sort({ createdAt: -1 }).toArray();

    // Deduplicate leads by id
    const seenIds = new Set();
    const leads = [];
    for (const lead of rawLeads) {
      const cleanId = lead.id || String(lead._id);
      if (seenIds.has(cleanId)) continue;
      seenIds.add(cleanId);
      leads.push(lead);
    }

    return NextResponse.json({
      success: true,
      count: leads.length,
      leads: leads
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const leadId = body.id || ('RFQ-' + Math.floor(100000 + Math.random() * 900000));
    const now = new Date().toISOString();

    const newLead = {
      ...body,
      id: leadId,
      createdAt: body.createdAt || now,
      updatedAt: now,
      date: body.date || 'Just now',
      status: body.status || 'Pending RFQ'
    };
    const { createdAt, _id, ...fieldsToSet } = newLead;

    const db = await getDatabase();
    const collection = db.collection('leads');

    // Atomic Upsert by exact lead ID: ensures each new quotation request creates a distinct lead
    const updateResult = await collection.updateOne(
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

    return NextResponse.json({
      success: true,
      source: 'mongodb',
      updated: Boolean(updateResult.matchedCount > 0),
      lead: newLead
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const id = body.id || body._id;
    const quoteNum = body.quoteNumber || body.rawLeadData?.quoteNumber;
    if (!id && !quoteNum) {
      return NextResponse.json({ success: false, error: 'Lead ID or Quote Number required' }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection('leads');
    const now = new Date().toISOString();

    const { _id, id: leadId, ...fieldsToUpdate } = body;

    const orConditions = [];
    if (_id) {
      try {
        const { ObjectId } = await import('mongodb');
        orConditions.push({ _id: new ObjectId(_id) });
      } catch (e) {
        orConditions.push({ _id: _id });
      }
    }
    if (id) {
      orConditions.push({ id });
      orConditions.push({ 'rawLeadData.id': id });
      orConditions.push({ 'rawLeadData.quoteNumber': id });
      orConditions.push({ quoteNumber: id });
    }
    if (quoteNum) {
      orConditions.push({ quoteNumber: quoteNum });
      orConditions.push({ 'rawLeadData.quoteNumber': quoteNum });
    }

    const query = orConditions.length > 0 ? { $or: orConditions } : { id };

    const updatePayload = {
      ...fieldsToUpdate,
      ...(fieldsToUpdate.status ? { 'rawLeadData.status': fieldsToUpdate.status } : {}),
      ...(fieldsToUpdate.quotationRef ? { 'rawLeadData.quotationRef': fieldsToUpdate.quotationRef } : {}),
      ...(fieldsToUpdate.isQuotationCreated ? { 'rawLeadData.isQuotationCreated': true } : {}),
      updatedAt: now
    };

    const result = await collection.updateOne(query, { $set: updatePayload });

    return NextResponse.json({
      success: true,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
