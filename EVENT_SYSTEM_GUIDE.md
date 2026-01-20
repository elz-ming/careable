# Event Management System Guide

## Overview
This event management system allows staff to review and publish events, and enables users to sign up for events.

**Key Concept:** Each event automatically creates **2 signup forms** - one for Volunteers and one for Participants. Staff only need to create the event once, and the system handles creating both form types.

## File Structure

```
app/
├── api/
│   └── events/
│       └── batch/
│           └── route.ts          # API endpoint for batch event creation
├── components/
│   └── SignupForm.tsx            # Reusable signup form component
├── staff/
│   └── review/
│       ├── page.tsx              # Event review and editing page
│       └── success/
│           └── page.tsx          # Success confirmation page
└── signup/
    └── [eventId]/
        └── [type]/
            └── page.tsx          # Dynamic public signup page (volunteer/participant)
```

## How to Use

### 1. Review and Publish Events

Navigate to: `http://localhost:3000/staff/review`

Features:
- View events extracted from images (currently using mock data)
- Edit event details inline (name, date, time, location, type)
- Add new events with the "+ Add New Event" button
- Delete unwanted events
- Publish all events to the database

The page will:
- Send a POST request to `/api/events/batch`
- Log the events to the console (check your terminal)
- Redirect to a success page on completion

### 2. Public Event Signup

Navigate to: `http://localhost:3000/signup/[eventId]/[type]`

Examples:
- `http://localhost:3000/signup/1/volunteer` - Beach Clean (Volunteer form)
- `http://localhost:3000/signup/1/participant` - Beach Clean (Participant form)
- `http://localhost:3000/signup/2/volunteer` - AGM (Volunteer form)
- `http://localhost:3000/signup/2/participant` - AGM (Participant form)

Features:
- Beautiful event details display with date, time, location
- Each event has 2 signup forms (Volunteer & Participant)
- Easy switching between form types with a button
- **For Volunteer forms:** Extra "Shift Preferences" field
- Form validation and submission feedback

### 3. API Endpoint

Endpoint: `POST /api/events/batch`

Request body:
```json
[
  {
    "id": 1,
    "name": "Beach Clean",
    "date": "2024-10-12",
    "time": "08:00",
    "location": "East Coast Park",
    "type": "Volunteer"
  }
]
```

Response:
```json
{
  "success": true,
  "message": "Successfully processed 2 events",
  "count": 2
}
```

## Next Steps

### Database Integration
To connect to a real database (e.g., Prisma + PostgreSQL):

1. **Install Prisma:**
   ```bash
   npm install prisma @prisma/client
   npx prisma init
   ```

2. **Update the API route** (`app/api/events/batch/route.ts`):
   ```typescript
   import { prisma } from '@/lib/prisma';
   
   // Replace the TODO comment with:
   await prisma.event.createMany({ 
     data: events.map(e => ({
       name: e.name,
       date: new Date(e.date),
       time: e.time,
       location: e.location,
       type: e.type,
     }))
   });
   ```

3. **Update the signup page** (`app/signup/[eventId]/page.tsx`):
   ```typescript
   import { prisma } from '@/lib/prisma';
   
   async function getEvent(eventId: string) {
     return await prisma.event.findUnique({ 
       where: { id: parseInt(eventId) } 
     });
   }
   ```

### Add Signup Storage
Create a new API route to handle signup form submissions:

```typescript
// app/api/signups/route.ts
export async function POST(request: NextRequest) {
  const data = await request.json();
  const signup = await prisma.signup.create({ data });
  return NextResponse.json({ success: true, signup });
}
```

## Styling

All components use **Tailwind CSS** with:
- Gradient backgrounds
- Hover effects and transitions
- Responsive design (mobile-friendly)
- Form validation styling
- Loading states

## Key Features

✅ Next.js 14+ App Router
✅ Server Components (signup page)
✅ Client Components (review page, signup form)
✅ Dynamic routing
✅ TypeScript
✅ Tailwind CSS
✅ Form validation
✅ Loading states
✅ Error handling
✅ Responsive design

## Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit the review page:
   - Go to `http://localhost:3000/staff/review`
   - Edit some events
   - Click "Publish"
   - Check your terminal for the console.log output

3. Visit the signup pages:
   - Go to `http://localhost:3000/signup/1` (Volunteer - shows shift preferences)
   - Go to `http://localhost:3000/signup/2` (Participant - no shift preferences)
   - Fill out and submit the forms
