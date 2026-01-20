import { NextResponse } from 'next/server';
import { verifyQrToken } from '@/src/lib/qrAttendance';

/**
 * POST /api/qr/verify
 * 
 * Verifies a QR token and marks attendance.
 * 
 * Body: { token: string }
 */
export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'token is required' },
        { status: 400 }
      );
    }

    const result = await verifyQrToken({ token });

    if (result.status === 'ok') {
      return NextResponse.json({
        status: 'ok',
        verified: true,
        signupId: result.signupId,
        eventId: result.eventId,
      });
    }

    if (result.status === 'already_checked_in') {
      return NextResponse.json(
        { status: 'already_checked_in', error: 'This QR code has already been used.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { status: 'invalid', error: 'Invalid or expired QR token.' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('QR Verify Error:', error);
    return NextResponse.json(
      { error: 'Failed to verify QR code' },
      { status: 500 }
    );
  }
}
