import { NextResponse } from 'next/server';
import { issueQrForSignup } from '@/src/lib/qrAttendance';

/**
 * POST /api/qr/issue
 * 
 * Generates a unique QR code for a specific signup.
 * 
 * Body: { signupId: string, eventId: string }
 */
export async function POST(request: Request) {
  try {
    const { signupId, eventId } = await request.json();

    if (!signupId || !eventId) {
      return NextResponse.json(
        { error: 'signupId and eventId are required' },
        { status: 400 }
      );
    }

    // Optional: In a real app, you might want to pass a base URL
    // const baseUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify`;
    
    const { qrBase64, verifyPayload } = await issueQrForSignup({
      signupId,
      eventId,
    });

    return NextResponse.json({
      status: 'ok',
      qrCode: qrBase64, // Ready for <img src="...">
      token: verifyPayload, 
    });
  } catch (error: any) {
    console.error('QR Issue Error:', error);
    return NextResponse.json(
      { error: 'Failed to issue QR code' },
      { status: 500 }
    );
  }
}
