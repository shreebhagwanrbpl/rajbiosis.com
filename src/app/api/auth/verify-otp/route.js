import { NextResponse } from 'next/server';
import { verifyOtp } from '../../../../lib/otpStore';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanOtp = (otp || '').toString().trim();

    if (!cleanEmail) {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400 }
      );
    }

    if (!cleanOtp) {
      return NextResponse.json(
        { success: false, error: 'Please enter the 6-digit OTP code received on your email.' },
        { status: 400 }
      );
    }

    const result = await verifyOtp(cleanEmail, cleanOtp);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email address verified successfully!',
      email: cleanEmail,
    });
  } catch (error) {
    console.error('[API AUTH VERIFY-OTP] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    );
  }
}
