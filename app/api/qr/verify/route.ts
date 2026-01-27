import { auth } from '@clerk/nextjs/server';
import { verifyQrToken } from '@/lib/qrAttendance';
import { NextResponse } from 'next/server';

/**
 * POST /api/qr/verify
 * Verifies a QR token and marks attendance.
 * Restricted to staff and admins.
 * 
 * Request body:
 * - token: string (required) - The QR code token
 * - notes: string (optional) - Attendance notes
 */
export async function POST(req: Request) {
  try {
    const { userId, sessionClaims } = await auth();
    const userRole = sessionClaims?.metadata?.role;

    console.log('[QR Verify] Request received:', { userId, userRole });

    if (!userId) {
      console.log('[QR Verify] Unauthorized: No userId');
      return NextResponse.json({ 
        status: 'error',
        error: 'Unauthorized - Please sign in' 
      }, { status: 401 });
    }

    if (userRole !== 'staff' && userRole !== 'admin') {
      console.log('[QR Verify] Forbidden: User is not staff/admin, role:', userRole);
      return NextResponse.json({ 
        status: 'error',
        error: 'Forbidden: Only staff can verify attendance' 
      }, { status: 403 });
    }

    const body = await req.json();
    const { token, notes } = body;
    
    console.log('[QR Verify] Token received:', token?.substring(0, 20) + '...');

    if (!token) {
      console.log('[QR Verify] Bad request: No token provided');
      return NextResponse.json({ 
        status: 'error',
        error: 'Token is required' 
      }, { status: 400 });
    }

    // Pass staff userId and optional notes to track who performed the check-in
    const result = await verifyQrToken(token, userId, notes);
    console.log('[QR Verify] Verification result:', result);

    if (result.status === 'ok') {
      return NextResponse.json({
        status: 'ok',
        verified: true,
        attendeeName: result.attendeeName,
        role: result.role,
        registrationId: result.registrationId
      });
    }

    if (result.status === 'already_checked_in') {
      return NextResponse.json({
        status: 'error',
        verified: false,
        reason: 'already_checked_in',
        error: 'This attendee has already checked in.'
      }, { status: 409 });
    }

    console.log('[QR Verify] Invalid token');
    return NextResponse.json({
      status: 'error',
      verified: false,
      reason: 'invalid_token',
      error: 'Invalid or expired QR code. Please generate a new one.'
    }, { status: 401 });

  } catch (error: any) {
    console.error('[QR Verify] Error:', error);
    return NextResponse.json({ 
      status: 'error',
      error: 'Internal Server Error: ' + error.message 
    }, { status: 500 });
  }
}
