# Portable QR Attendance Module

This module provides a secure, single-use QR code generation and verification system for event attendance.

## Features
- **Opaque Tokens**: Uses cryptographically random 32-byte tokens (not JWT).
- **Secure Storage**: Only stores the SHA-256 hash of the token in the database.
- **Single Use**: Verification fails if the token has already been scanned.
- **Portable**: Easy to plug into Next.js routes, background jobs, or other backend tools.

## Installation

1. Install dependencies:
   ```bash
   npm install qrcode
   npm install -D @types/qrcode
   ```

2. Copy `src/lib/qrAttendance.ts` to your project.
3. Update the `db` placeholder in `src/lib/qrAttendance.ts` with your database client (e.g., Prisma, Drizzle).

## How it Works

### 1. Generation (`issueQrForSignup`)
- Generates a random 32-byte token.
- Hashes it using SHA-256.
- Stores the hash in the `signups` table.
- Generates a QR code image (PNG) containing the raw token.
- Returns the PNG buffer and the raw token (only once).

### 2. Verification (`verifyQrToken`)
- Hashes the incoming token.
- Looks up the signup by the token hash.
- Checks if `checked_in_at` is already set.
- If valid, sets `checked_in_at` to the current time.

## API Endpoints

### POST `/api/qr/issue`
**Request Body:**
```json
{
  "signupId": "user_123",
  "eventId": "event_456"
}
```
**Response:**
```json
{
  "status": "ok",
  "qrCode": "data:image/png;base64,...",
  "token": "..."
}
```

### POST `/api/qr/verify`
**Request Body:**
```json
{
  "token": "..."
}
```
**Response (Success):**
```json
{
  "status": "ok",
  "verified": true,
  "signupId": "user_123",
  "eventId": "event_456"
}
```

## Integrating with Email
To send the QR code via email, use the `qrBase64` returned by `issueQrForSignup` directly in an image tag:

```typescript
import { issueQrForSignup } from '@/src/lib/qrAttendance';

const { qrBase64 } = await issueQrForSignup({ signupId, eventId });

// The qrBase64 is a data URI: "data:image/png;base64,..."
const htmlEmail = `<p>Show this QR code at the door:</p><img src="${qrBase64}" />`;
```

Or use the `qrPngBuffer` as an attachment:

await sendEmail({
  to: userEmail,
  subject: "Your Event Ticket",
  attachments: [
    {
      filename: 'ticket-qr.png',
      content: qrPngBuffer,
      cid: 'qr-code'
    }
  ],
  html: `<p>Show this QR code at the door:</p><img src="cid:qr-code" />`
});
```
