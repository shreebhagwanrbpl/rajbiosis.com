import { NextResponse } from 'next/server';
import { saveOtp } from '../../../../lib/otpStore';
import { sendOtpEmail } from '../../../../lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, district, role, purpose } = body;

    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required to receive the verification OTP.' },
        { status: 400 }
      );
    }

    // Generate secure random 6-digit numeric OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database & memory with 10 min expiry
    await saveOtp(cleanEmail, generatedOtp, {
      name: (name || '').trim(),
      role: role || 'customer',
      district: district || 'Jaipur',
      purpose: purpose || 'Account Verification & Quotations',
    });

    // Send real email from inquiry@rajbiosis.com
    await sendOtpEmail(
      cleanEmail,
      generatedOtp,
      name || 'Healthcare Professional',
      purpose || 'Quotation & Healthcare Profile Authentication'
    );

    return NextResponse.json({
      success: true,
      message: `Security verification OTP sent to ${cleanEmail} from inquiry@rajbiosis.com`,
      recipient: cleanEmail,
      sender: 'inquiry@rajbiosis.com',
      expiresInMinutes: 10,
    });
  } catch (error) {
    console.error('[API AUTH SEND-OTP] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to dispatch verification OTP. Please try again.' },
      { status: 500 }
    );
  }
}
