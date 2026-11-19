import { getDatabase } from './mongodb';

// High-speed in-memory fallback cache (survives requests in same Node runtime)
global._otpStore = global._otpStore || new Map();

/**
 * Save OTP for an email address with 10-minute expiry
 */
export async function saveOtp(email, otp, meta = {}) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const record = {
    email: cleanEmail,
    otp: String(otp).trim(),
    expiresAt,
    used: false,
    attempts: 0,
    createdAt: new Date(),
    meta,
  };

  // 1. Save in memory cache
  global._otpStore.set(cleanEmail, record);

  // 2. Save in MongoDB (async, non-blocking)
  try {
    const db = await getDatabase();
    if (db) {
      await db.collection('otp_verifications').updateOne(
        { email: cleanEmail },
        { $set: record },
        { upsert: true }
      );
    }
  } catch (err) {
    console.warn('[OTP STORE] MongoDB write failed, using memory store:', err.message);
  }

  return record;
}

/**
 * Verify OTP for an email address
 */
export async function verifyOtp(email, enteredOtp) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanInput = String(enteredOtp || '').replace(/\D/g, '').trim();

  if (!cleanEmail || !cleanInput || cleanInput.length !== 6) {
    return {
      success: false,
      error: 'Please enter a valid 6-digit numeric verification code.',
    };
  }

  // 1. Try from memory store first
  let record = global._otpStore.get(cleanEmail);

  // 2. If not found in memory, try MongoDB
  if (!record) {
    try {
      const db = await getDatabase();
      if (db) {
        record = await db.collection('otp_verifications').findOne({ email: cleanEmail });
      }
    } catch (err) {
      console.warn('[OTP STORE] MongoDB read failed:', err.message);
    }
  }

  if (!record) {
    return {
      success: false,
      error: 'No active verification code found for this email. Please request a new OTP.',
    };
  }

  // Check if expired
  const now = new Date();
  const expiryDate = new Date(record.expiresAt);
  if (now > expiryDate) {
    global._otpStore.delete(cleanEmail);
    return {
      success: false,
      error: 'This verification code has expired. Please request a new code.',
    };
  }

  // Check if already used
  if (record.used) {
    return {
      success: false,
      error: 'This code has already been used. Please request a new verification code.',
    };
  }

  // Check attempts
  if ((record.attempts || 0) >= 5) {
    return {
      success: false,
      error: 'Too many incorrect attempts. Please request a new verification code.',
    };
  }

  // Compare OTP
  if (record.otp !== cleanInput) {
    record.attempts = (record.attempts || 0) + 1;
    global._otpStore.set(cleanEmail, record);
    return {
      success: false,
      error: 'Invalid verification code. Please check your email inbox (and Spam/Junk) and enter the 6-digit code.',
    };
  }

  // Mark as used
  record.used = true;
  global._otpStore.set(cleanEmail, record);

  try {
    const db = await getDatabase();
    if (db) {
      await db.collection('otp_verifications').updateOne(
        { email: cleanEmail },
        { $set: { used: true, verifiedAt: new Date() } }
      );
    }
  } catch (err) {
    // non-fatal
  }

  return {
    success: true,
    message: 'Verification successful.',
  };
}
