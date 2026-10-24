import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, district, role } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Generate random 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log('==============================================');
    console.log(`[AUTH OTP DISPATCH] Role: ${role || 'employee'}`);
    console.log(`[AUTH OTP DISPATCH] Name: ${name}`);
    console.log(`[AUTH OTP DISPATCH] Email: ${email}`);
    console.log(`[AUTH OTP DISPATCH] District: ${district}`);
    console.log(`[AUTH OTP DISPATCH] Generated OTP: ${generatedOtp}`);
    console.log('==============================================');

    // Return success response with OTP for demonstration / test verification
    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${email}`,
      otp: generatedOtp,
      recipient: email,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to dispatch OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to dispatch verification OTP' },
      { status: 500 }
    );
  }
}
