import crypto from 'crypto';
import QRCode from 'qrcode';

/**
 * PORTABLE QR ATTENDANCE MODULE
 * 
 * This module handles the generation and verification of single-use QR codes.
 * It uses SHA-256 hashing to store tokens securely.
 */

// --- DATABASE INTERFACE (Placeholder) ---
// In a real app, replace this with your actual DB client (Prisma, Drizzle, etc.)
// The module assumes a 'signups' table exists with:
// - id
// - event_id
// - attendee_name (to confirm "this is the person")
// - qr_token_hash (unique)
// - checked_in_at (nullable timestamp)

/**
 * Replace this mock DB with your actual database client logic.
 */
const db = {
  signup: {
    update: async ({ where, data }: { where: { id: string }, data: any }) => {
      console.log(`[DB MOCK] Updating signup ${where.id}:`, data);
      return { id: where.id, attendee_name: "John Doe", ...data };
    },
    findUnique: async ({ where }: { where: { qr_token_hash: string } }) => {
      console.log(`[DB MOCK] Finding signup by hash: ${where.qr_token_hash}`);
      // Return null to simulate "not found" or an object to simulate "found"
      if (where.qr_token_hash) {
        return { 
          id: "signup_123", 
          event_id: "event_456", 
          attendee_name: "John Doe", // Mock name
          checked_in_at: null 
        };
      }
      return null;
    }
  }
};

interface IssueQrOptions {
  signupId: string;
  eventId: string;
  baseUrl?: string; // Optional URL prefix for the QR payload
}

interface IssueQrResult {
  qrPngBuffer: Buffer;
  qrBase64: string; // Added for easy email embedding
  verifyPayload: string;
}

/**
 * 1) ISSUE QR FOR SIGNUP
 * Generates a unique token, hashes it, stores the hash, and returns a QR PNG.
 */
export async function issueQrForSignup({ 
  signupId, 
  eventId, 
  baseUrl 
}: IssueQrOptions): Promise<IssueQrResult> {
  // 1. Generate 32 random bytes (opaque token)
  const token = crypto.randomBytes(32).toString('base64url');

  // 2. Compute SHA-256 hash of the token
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // 3. Store the hash in the signup record
  await db.signup.update({
    where: { id: signupId },
    data: { 
      qr_token_hash: tokenHash,
      event_id: eventId 
    }
  });

  // 4. Generate QR code payload
  const verifyPayload = baseUrl ? `${baseUrl}?token=${token}` : token;

  // 5. Generate QR code image (PNG buffer)
  const qrPngBuffer = await QRCode.toBuffer(verifyPayload, {
    type: 'png',
    margin: 1,
    width: 400
  });

  // 6. Generate base64 string for easy embedding
  const qrBase64 = `data:image/png;base64,${qrPngBuffer.toString('base64')}`;

  return {
    qrPngBuffer,
    qrBase64,
    verifyPayload
  };
}

interface VerifyQrOptions {
  token: string;
}

type VerifyQrResult = 
  | { status: 'ok'; signupId: string; attendeeName: string; eventId: string; checkedInAt: Date }
  | { status: 'invalid' | 'already_checked_in' };

/**
 * 2) VERIFY QR TOKEN
 * Validates the token, checks the database, and marks attendance.
 */
export async function verifyQrToken({ 
  token 
}: VerifyQrOptions): Promise<VerifyQrResult> {
  // 1. Basic sanity check
  if (!token || typeof token !== 'string') {
    return { status: 'invalid' };
  }

  // 2. Hash the incoming token
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // 3. Lookup signup by qr_token_hash
  const signup = await db.signup.findUnique({
    where: { qr_token_hash: tokenHash }
  });

  if (!signup) {
    return { status: 'invalid' };
  }

  // 4. Check if already checked in
  if (signup.checked_in_at) {
    return { status: 'already_checked_in' };
  }

  // 5. Mark attendance
  const now = new Date();
  await db.signup.update({
    where: { id: signup.id },
    data: { checked_in_at: now }
  });

  return {
    status: 'ok',
    signupId: signup.id,
    attendeeName: signup.attendee_name, // Return name to confirm identity
    eventId: signup.event_id,
    checkedInAt: now
  };
}
