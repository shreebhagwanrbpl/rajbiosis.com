import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = await getDatabase();
    const collection = db.collection('quotations');

    if (id) {
      const item = await collection.findOne({ $or: [{ id }, { refNo: id }] });
      return NextResponse.json({ success: !!item, quotation: item });
    }

    const quotations = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({
      success: true,
      count: quotations.length,
      quotations: quotations || []
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message, quotations: [] }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const quoteId = body.id || ('RB-QT-' + Date.now());
    const now = new Date().toISOString();

    const quoteRecord = {
      ...body,
      id: quoteId,
      createdAt: body.createdAt || now,
      updatedAt: now
    };
    delete quoteRecord._id;

    const db = await getDatabase();
    const collection = db.collection('quotations');

    const cleanPhone = (quoteRecord.customerAddress2 || '').replace(/\D/g, '').slice(-10);
    const subject = (quoteRecord.subjectQuotation || '').trim();

    const existingMatch = await collection.findOne({
      $or: [
        { id: quoteId },
        ...(quoteRecord.refNo ? [{ refNo: quoteRecord.refNo }] : []),
        ...(cleanPhone && subject ? [{
          customerAddress2: { $regex: cleanPhone },
          subjectQuotation: subject
        }] : [])
      ]
    });

    const targetId = existingMatch ? existingMatch.id : quoteId;
    quoteRecord.id = targetId;

    const result = await collection.updateOne(
      { id: targetId },
      { $set: quoteRecord },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      id: quoteId,
      upsertedId: result.upsertedId
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
