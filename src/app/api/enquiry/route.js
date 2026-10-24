import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('[RBPL Enquiry Received]:', data);

    return NextResponse.json({
      success: true,
      message: 'Enquiry received successfully',
      data
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process enquiry' },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Raj Biosis Enquiry API is active'
  });
}
