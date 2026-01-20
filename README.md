This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Calendar Event Extractor

A portable event-extraction module for Next.js (App Router) using Google Gemini API.

### Features
- Extracts structured JSON events from images (PNG, JPEG, WebP), PDFs, and PPTX files.
- Portable core logic in `src/lib/calendarExtractor.ts`.
- Next.js API route wrapper in `app/api/calendar/extract/route.ts`.
- **Vercel Ready**: No local binary dependencies (LibreOffice not required).
- **Native PPTX Support**: Uses Gemini's native document understanding for PowerPoint files.
- Structured output using Zod and Gemini's JSON Schema.

### Prerequisites
- Node.js 18+
- Google Gemini API Key

### Vercel Deployment Notes
- **File Size Limit**: Vercel Serverless Functions have a **4.5MB request body limit**. The API route is configured to enforce this. For larger files, consider using Vercel Blob.
- **No External Binaries**: This module relies entirely on the Gemini API for processing, making it compatible with Vercel's ephemeral environment.

### Installation

1. Install dependencies:
```bash
npm install @google/generative-ai zod zod-to-json-schema
```

2. Set environment variables in `.env.local`:
```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

### Usage

#### Library usage
```typescript
import { extractCalendarEvents } from "@/src/lib/calendarExtractor";

const result = await extractCalendarEvents({
  buffer: fileBuffer,
  filename: "calendar.pdf",
  mimeType: "application/pdf"
});
console.log(result.events);
```

#### API usage
Send a `POST` request to `/api/calendar/extract` with a `multipart/form-data` body containing the `file` field.

**Example with curl:**
```bash
curl -X POST -F "file=@/path/to/your/calendar.png" http://localhost:3000/api/calendar/extract
```

#### Example Response
```json
{
  "meta": {
    "source_filename": "calendar.png",
    "source_mime": "image/png",
    "calendar_type": "monthly_grid"
  },
  "events": [
    {
      "event_name": "Team Sync",
      "date_iso": "2026-01-20",
      "date_text": "Jan 20",
      "start_time": "10:00",
      "end_time": "11:00",
      "location": "Meeting Room A",
      "notes": "Weekly catchup",
      "source_text": "10am Team Sync"
    }
  ]
}
```

### Supported File Types
- Images: `png`, `jpeg`, `jpg`, `webp`
- PDF: `pdf`
- PowerPoint: `pptx` (Supported natively by Gemini)

### Architecture
- `src/lib/calendarExtractor.ts`: Core logic for file handling, Gemini upload, and extraction.
- `app/api/calendar/extract/route.ts`: Thin API wrapper for the extractor with Vercel limit checks.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
