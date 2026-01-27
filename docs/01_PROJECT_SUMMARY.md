# Careable - Project Summary

## 📋 Table of Contents
- [Overview](#overview)
- [Purpose and Mission](#purpose-and-mission)
- [Target Users](#target-users)
- [Key Features by Role](#key-features-by-role)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Database Schema](#database-schema)
- [Core Modules and Components](#core-modules-and-components)
- [Authentication and Authorization](#authentication-and-authorization)
- [AI Integration](#ai-integration)
- [QR Attendance System](#qr-attendance-system)
- [Setup and Installation](#setup-and-installation)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Security Considerations](#security-considerations)
- [Future Enhancements](#future-enhancements)

---

## Overview

**Careable** is a centralized event management and community support platform designed specifically for caregiver organizations supporting children with disabilities. The platform streamlines the entire lifecycle of community events—from AI-powered creation to QR-based attendance tracking—while providing role-specific experiences for staff, volunteers, participants, and caregivers.

### Project Status
- **Version**: 0.1.0 (Beta)
- **Framework**: Next.js 16.1.4 (App Router)
- **Deployment**: Ready for production
- **Last Updated**: January 2026

---

## Purpose and Mission

Careable addresses the unique challenges faced by caregiver organizations:

1. **Simplified Event Management**: Transform calendar images into structured events using AI
2. **Community Engagement**: Connect volunteers with opportunities to support families
3. **Accessibility First**: Ensure participants can easily discover and register for wellness activities
4. **Data-Driven Insights**: Track attendance and participation patterns
5. **Security & Privacy**: Implement row-level security and role-based access control

### Problem Statement
Caregiver organizations often manage events through scattered spreadsheets, printed calendars, and manual tracking systems. This leads to:
- Time-consuming data entry
- Registration bottlenecks
- Limited visibility for volunteers and participants
- Difficulty tracking attendance

### Solution
Careable provides an integrated platform where staff can upload calendar images, AI extracts the events, volunteers discover opportunities, and participants register seamlessly—all with secure QR-based attendance verification.

---

## Target Users

### 1. 🏢 **Staff Members**
- Event coordinators
- Operations managers
- Program directors

### 2. 🤝 **Volunteers**
- Community supporters
- Activity facilitators
- Event helpers

### 3. 👨‍👩‍👧‍👦 **Participants**
- Children with disabilities
- Their families

### 4. 🧡 **Caregivers**
- Parents managing registrations for their children
- Primary support persons

### 5. 🔐 **Administrators**
- System administrators
- Platform managers
- Security overseers

---

## Key Features by Role

### 🏢 Staff Portal

#### AI-Powered Event Extraction
- **Upload calendar images** in PNG, JPEG, WEBP, or PDF format
- **Gemini 2.0 Flash Vision** automatically extracts:
  - Event titles and descriptions
  - Dates and time ranges (with 12h to 24h conversion)
  - Venue addresses (mapped from legends/color codes)
  - Accessibility indicators
- **Real-time streaming**: Watch the AI reasoning process as it extracts data
- **Intelligent normalization**: Automatic venue mapping for Singapore locations
- **Retry logic**: Handles API rate limits with exponential backoff

#### Comprehensive Event Management
- Create, edit, and cancel events
- Set capacity limits and accessibility flags
- View events in card or table layouts
- Filter by status (upcoming, past, cancelled)
- Track registrations per event

#### QR Attendance Tracking
- Automatic generation of secure ticket codes
- SHA-256 hashed tokens for security
- Staff can verify attendance with QR scanning
- Check-in timestamps recorded

### 🤝 Volunteer Dashboard

#### Opportunity Discovery
- Browse real-time feed of "Latest Needs"
- Search and filter events by date, location, or type
- View detailed event information
- See registration capacity and current signups

#### Self-Service Scheduling
- Sign up for volunteer roles with one click
- View upcoming commitments
- Manage registration status
- Cancel if necessary

#### QR Code Access
- Receive unique QR code per registration
- Quick access for on-site verification
- View registration history

### 👨‍👩‍👧‍👦 Participant Portal

#### Event Discovery
- Beautiful, searchable landing page with featured events
- Filter by date, location, or activity type
- View event details including accessibility information
- See real-time capacity availability

#### Smart Registration Flow
- **One-click registration** for existing users
- **First-time user flow**: Prompted to provide full name for accurate record-keeping
- **Automatic ticket generation**: QR code issued upon successful registration
- **Registration confirmation**: Immediate feedback and access to event details

#### Wellness Tracking
- Dashboard showing upcoming events
- History of past participation
- Profile management
- Membership type tracking (Ad hoc, Once a week, Twice a week)

### 🧡 Caregiver Portal
- Register for events on behalf of managed participants
- View all events for children under care
- Track attendance history
- Manage multiple participant profiles

### 🔐 Admin Portal
- User role management
- System-wide settings
- Analytics and reporting dashboards
- Security audit logs

---

## Technology Stack

### Frontend
- **Next.js 16.1.4** (App Router, React Server Components)
- **React 19.2.3** (Latest with concurrent features)
- **TypeScript 5** (Type safety)
- **Tailwind CSS 4** (Utility-first styling)
- **Shadcn UI** (Accessible component library)
- **Lucide React** (Icon library)
- **React Hook Form** + **Zod** (Form validation)

### Backend
- **Next.js API Routes** (Server-side logic)
- **Supabase** (PostgreSQL database with RLS)
- **Clerk** (Authentication and user management)
- **Server-Only** (Server component protection)

### AI & ML
- **Google Gemini 2.0 Flash** (Vision + reasoning)
- **@google/generative-ai** (Gemini SDK)
- **Zod-to-JSON-Schema** (Schema validation)

### QR & Attendance
- **qrcode** (QR code generation)
- **html5-qrcode** (Client-side scanning)
- **Crypto (Node.js)** (SHA-256 hashing)

### Date & Time
- **date-fns 4.1.0** (Date formatting and parsing)

### Webhooks & Security
- **Svix** (Webhook verification for Clerk)
- **Row Level Security (RLS)** (Supabase policies)

---

## Architecture Overview

### Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                          │
│  (Next.js App Router + React Server Components)            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─── Public Routes: Landing, Sign-in, Sign-up
                 ├─── Auth Routes: Onboarding
                 ├─── Role-Based Routes:
                 │    ├─── /admin/* (Admin Portal)
                 │    ├─── /staff/* (Staff Portal)
                 │    ├─── /volunteer/* (Volunteer Portal)
                 │    ├─── /participant/* (Participant Portal)
                 │    └─── /caregiver/* (Caregiver Portal)
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│                   Next.js API Routes                        │
│  /api/webhooks/clerk      - User sync                       │
│  /api/qr/issue           - QR generation                   │
│  /api/qr/verify          - QR verification                 │
│  /staff/api/calendar/extract - AI extraction (SSE)        │
└────────────┬────────────────────────────────┬──────────────┘
             │                                │
             v                                v
┌─────────────────────┐          ┌──────────────────────────┐
│   Clerk Auth        │          │   Gemini AI API          │
│  - User management  │          │  - Vision analysis       │
│  - Role metadata    │          │  - Event extraction      │
│  - Session tokens   │          │  - Reasoning streams     │
└─────────────────────┘          └──────────────────────────┘
             │
             v
┌─────────────────────────────────────────────────────────────┐
│                   Supabase PostgreSQL                       │
│  - profiles (Users)                                         │
│  - events (Activities)                                      │
│  - registrations (Sign-ups)                                 │
│  - Row Level Security (RLS)                                 │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow: AI Event Extraction

```
1. Staff uploads calendar image (PNG/PDF) via form
   ↓
2. POST /staff/api/calendar/extract
   ↓
3. File uploaded to Gemini File API
   ↓
4. Gemini processes with vision model
   ↓
5. Server-Sent Events (SSE) stream reasoning + JSON
   ↓
6. Frontend receives chunks in real-time
   ↓
7. Parsed events displayed with "Import" actions
   ↓
8. Staff reviews and confirms events
   ↓
9. Events inserted into Supabase `events` table
```

### Data Flow: QR Attendance

```
1. User registers for event
   ↓
2. System generates cryptographic token (32 bytes)
   ↓
3. Token hashed with SHA-256
   ↓
4. Hash stored in `registrations.ticket_code`
   ↓
5. QR code generated with original token (not hash)
   ↓
6. User presents QR at event
   ↓
7. Staff scans QR code
   ↓
8. POST /api/qr/verify with token
   ↓
9. Server hashes token and looks up registration
   ↓
10. If valid, marks attendance:
    - status → 'attended'
    - check_in_at → current timestamp
```

---

## Database Schema

### Tables

#### 1. `profiles`
Stores user information synced from Clerk.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,              -- Matches Clerk User ID
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'participant' NOT NULL,
  membership_type TEXT,             -- e.g., 'Ad hoc', 'Once a week'
  managed_by UUID REFERENCES profiles(id), -- Caregiver → Participant link
  is_first_time BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Row Level Security (RLS)**:
- Users can view their own profile or profiles they manage
- Staff and Admins can view all profiles

#### 2. `events`
Stores community events and activities.

```sql
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0,
  is_accessible BOOLEAN DEFAULT TRUE,
  status event_status DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(title, start_time, location) -- Prevent duplicates
);
```

**Row Level Security (RLS)**:
- Anyone can view events
- Only Staff and Admins can create/update/delete events

#### 3. `registrations`
Tracks event sign-ups and attendance.

```sql
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  ticket_code TEXT UNIQUE NOT NULL,  -- SHA-256 hash of token
  status registration_status DEFAULT 'registered',
  check_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)          -- Prevent double registration
);
```

**Row Level Security (RLS)**:
- Users can view their own registrations or those they manage
- Staff can view and update all registrations
- Users can insert registrations for themselves

### Enums

```sql
CREATE TYPE user_role AS ENUM (
  'admin', 
  'staff', 
  'volunteer', 
  'caregiver', 
  'participant'
);

CREATE TYPE registration_status AS ENUM (
  'registered', 
  'attended', 
  'cancelled'
);

CREATE TYPE event_status AS ENUM (
  'upcoming', 
  'completed', 
  'cancelled'
);
```

### Schema Evolution

The project includes 7 migration files:
1. **01_supabase_schema.sql** - Initial tables and RLS
2. **02_auth_integration.sql** - Clerk sync integration
3. **03_fix_schema_and_roles.sql** - Role helper functions
4. **04_add_event_unique_constraint.sql** - Deduplication logic
5. **05_add_event_status.sql** - Event lifecycle management
6. **06_add_is_first_time_to_profiles.sql** - Onboarding flow
7. **07_fix_rls_for_registration.sql** - Fine-tuned permissions

---

## Core Modules and Components

### 1. Authentication & Authorization (`lib/clerk/roles.ts`)

```typescript
// Check if user has specific role
async function checkRole(role: UserRole): Promise<boolean>

// Update user role in Clerk metadata
async function updateUserRole(userId: string, role: UserRole)
```

**Roles Hierarchy**:
- `admin` → Full system access
- `staff` → Event management, user management
- `volunteer` → Event registration, schedule viewing
- `caregiver` → Participant management, event registration
- `participant` → Event registration, profile management

### 2. Database Access (`lib/supabase/`)

#### Client Types
- **`client.ts`** - Client-side Supabase client
- **`server.ts`** - Server-side client (cookies-based)
- **`admin.ts`** - Service role client (bypasses RLS)

#### Data Models (`lib/supabase/model.ts`)
```typescript
export type UserRole = 'admin' | 'staff' | 'volunteer' | 'caregiver' | 'participant';
export type RegistrationStatus = 'registered' | 'attended' | 'cancelled';

export interface Profile { ... }
export interface Event { ... }
export interface Registration { ... }
export type RegistrationWithEvent = Registration & { event: Event }
export type RegistrationWithUser = Registration & { profile: Profile }
```

#### Database Utilities (`lib/supabase/db.ts`)
Common queries wrapped as reusable functions:
- `getUserProfile(userId)`
- `getEventById(eventId)`
- `getRegistrationsForUser(userId)`
- `createRegistration(eventId, userId)`

### 3. AI Calendar Extraction (`app/(staff)/staff/lib/calendarExtractor.ts`)

**Key Functions**:

```typescript
// Streaming extraction with real-time reasoning
async function* extractCalendarEventsStream(input: ExtractionInput): AsyncGenerator

// Single-call extraction with structured JSON
async function extractCalendarEvents(input: ExtractionInput): Promise<CalendarExtraction>
```

**Zod Schemas**:
```typescript
export const ExtractedEventSchema = z.object({
  title: z.string(),
  date_iso: z.string(),          // YYYY-MM-DD
  start_time: z.string().nullable(), // HH:MM (24h)
  end_time: z.string().nullable(),   // HH:MM (24h)
  location: z.string().nullable(),
  is_accessible: z.boolean(),
  description: z.string().nullable()
});

export const CalendarExtractionSchema = z.object({
  meta: z.object({
    month: z.string(),
    year: z.number(),
    calendar_type: z.enum(["monthly_grid", "weekly_grid", "agenda_list", "unknown"])
  }),
  events: z.array(ExtractedEventSchema)
});
```

**Features**:
- Supports PNG, JPEG, WEBP, PDF
- Uploads to Gemini File API
- Polls file processing status
- Streams reasoning in plain text
- Extracts structured JSON between `[RESULT_START]` and `[RESULT_END]` markers
- Handles field name variations (e.g., `start_time` vs `startTime`)
- Converts 12h to 24h time format
- Maps venue colors/icons to full addresses
- Retry logic for 503 errors (exponential backoff)

### 4. QR Attendance System (`lib/qrAttendance.ts`)

**Security Design**:
- Token is **never stored** in database
- Only SHA-256 hash is stored
- QR code contains original token
- Verification re-hashes token and looks up

**Functions**:

```typescript
// Generate QR code for registration
async function issueQrForRegistration(registrationId: string): Promise<{
  token: string,
  qrBase64: string
}>

// Verify token and mark attendance
async function verifyQrToken(token: string): Promise<{
  status: 'ok' | 'invalid' | 'already_checked_in',
  registrationId?: string,
  attendeeName?: string,
  role?: string
}>
```

**Workflow**:
1. User registers → `issueQrForRegistration()` called
2. System generates 32-byte cryptographic token
3. Token hashed with SHA-256
4. Hash stored in `registrations.ticket_code`
5. QR code generated with original token (Base64 Data URI)
6. User scans QR at event
7. Staff app calls `verifyQrToken(token)`
8. Server hashes token and looks up registration
9. If valid and not checked in:
   - Update `status` to `'attended'`
   - Set `check_in_at` timestamp
   - Return success

### 5. Gemini AI Services (`lib/gemini/`)

#### Client Configuration (`lib/gemini/client.ts`)
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

export const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";
```

#### Services (`lib/gemini/services.ts`)
```typescript
// Generate event description from title + keywords
async function generateEventDescription(
  title: string, 
  keywords: string[]
): Promise<string>

// Placeholder for analytics
async function analyzeAttendanceTrends(data: any)
```

### 6. Server Actions (`app/actions/`)

**Participant Actions** (`app/actions/participant.ts`):
- `getParticipantEvents()` - Fetch upcoming events
- `registerForEvent(eventId)` - Create registration
- `cancelRegistration(registrationId)` - Cancel registration
- `getMyRegistrations()` - Fetch user's registrations

**Staff Actions** (`app/(staff)/staff/events/_actions.ts`):
- `createEvent(eventData)` - Create new event
- `updateEvent(eventId, eventData)` - Update existing event
- `deleteEvent(eventId)` - Delete event
- `importExtractedEvents(events[])` - Bulk import from AI extraction

**Onboarding Actions** (`app/(onboarding)/onboarding/_actions.ts`):
- `completeOnboarding({ role, membershipType })` - Set user role and create profile

---

## Authentication and Authorization

### Clerk Integration

**Webhook Sync** (`app/api/webhooks/clerk/route.ts`):
- Listens to `user.created` and `user.updated` events
- Syncs user data to Supabase `profiles` table
- Verifies webhook signatures with Svix

**Session Claims**:
```typescript
{
  userId: "user_abc123",
  sessionClaims: {
    metadata: {
      role: "staff" // or 'admin', 'volunteer', etc.
    }
  }
}
```

**Protected Routes**:
- Middleware checks role via `auth()` from `@clerk/nextjs/server`
- Layout components enforce role-based access
- Server actions validate permissions before mutations

### Onboarding Flow

1. User signs up via Clerk
2. Redirected to `/onboarding` page
3. Selects role (Admin, Staff, Volunteer, Participant)
4. If Participant:
   - Option to assign as Caregiver
   - Select membership type
5. Calls `completeOnboarding()` server action
6. Updates Clerk metadata via `updateUserMetadata()`
7. Creates/updates Supabase profile
8. Session reloaded
9. Redirected to `/{role}/dashboard`

---

## AI Integration

### Gemini 2.0 Flash Features

1. **Vision Analysis**: Extracts text, layout, and visual elements from calendar images
2. **Reasoning Streams**: Provides step-by-step explanation of extraction process
3. **Structured Output**: Returns JSON matching Zod schema
4. **Legend Mapping**: Understands venue legends and color coding
5. **Time Normalization**: Converts 12h to 24h format
6. **Date Inference**: Combines grid positions with month/year header

### Prompt Engineering

The extraction prompt follows a structured template:

```
You are a Senior Data Engineer specializing in Computer Vision and Document Extraction.
Your task is to extract event data from a caregiver organization's calendar image with 100% precision.

STEP-BY-STEP EXTRACTION PROCESS:
1. HEADER ANALYSIS: Identify Month and Year
2. LEGEND & VENUE MAPPING: Map colors/icons to full addresses
3. GRID EXTRACTION: Iterate through each day, extract title, time, location
4. QUALITY CONTROL: Return flat array of all events

OUTPUT FORMAT:
First, output your reasoning process in plain text.
Then, output [RESULT_START] followed by JSON matching the schema.
Finally, output [RESULT_END].
```

### Error Handling

- **503 Overloaded**: Exponential backoff (2s, 4s, 8s) with max 3 retries
- **File Processing**: Polls file status every 2 seconds
- **Invalid Response**: Logs warning and returns empty events array
- **Schema Mismatch**: Normalizes field names (e.g., `start_time` vs `startTime`)

---

## QR Attendance System

### Security Model

**Threat Model**:
- Prevent QR code reuse
- Prevent forgery of QR codes
- Protect against database leaks revealing valid tokens

**Solution**:
- Token is 32-byte random value (256 bits of entropy)
- Token never stored in database
- Only SHA-256 hash stored
- Even with database leak, attacker cannot reconstruct tokens

**Benefits**:
- Staff cannot manually check in users without scanning
- Users cannot share QR codes (unique per registration)
- System logs all check-ins with timestamps

### QR Code Generation

```typescript
// 1. Generate token
const token = crypto.randomBytes(32).toString('base64url');
// Example: "a7sFk9pQ2xLmN4vBzJcR8tWyH6uE3gDf1oP5iK0jM7n"

// 2. Hash token
const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
// Stored in database

// 3. Generate QR code
const qrBase64 = await QRCode.toDataURL(token, {
  margin: 1,
  width: 400
});
// Returns: "data:image/png;base64,iVBORw0KG..."
```

### Verification Flow

```typescript
// 1. Staff scans QR code (extracts token)
const scannedToken = "a7sFk9pQ2xLmN4vBzJcR8tWyH6uE3gDf1oP5iK0jM7n";

// 2. POST /api/qr/verify { token: scannedToken }

// 3. Server hashes token
const hash = crypto.createHash('sha256').update(scannedToken).digest('hex');

// 4. Lookup registration
const { data } = await supabase
  .from('registrations')
  .select('*, profiles(full_name, role)')
  .eq('ticket_code', hash)
  .single();

// 5. Check if already checked in
if (data.check_in_at) {
  return { status: 'already_checked_in' };
}

// 6. Mark attendance
await supabase
  .from('registrations')
  .update({ 
    status: 'attended', 
    check_in_at: new Date().toISOString() 
  })
  .eq('id', data.id);

// 7. Return success
return { 
  status: 'ok', 
  attendeeName: data.profiles.full_name,
  role: data.profiles.role
};
```

---

## Setup and Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Clerk account
- Google Cloud account (for Gemini API)

### Environment Variables

Create `.env.local` in root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Gemini AI
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-2.0-flash-exp
```

### Database Setup

Execute SQL scripts in order:

```bash
# 1. Base schema
psql -h your-db.supabase.co -U postgres -f sql/01_supabase_schema.sql

# 2. Clerk integration
psql -h your-db.supabase.co -U postgres -f sql/02_auth_integration.sql

# 3. Role helpers
psql -h your-db.supabase.co -U postgres -f sql/03_fix_schema_and_roles.sql

# 4. Unique constraints
psql -h your-db.supabase.co -U postgres -f sql/04_add_event_unique_constraint.sql

# 5. Event lifecycle
psql -h your-db.supabase.co -U postgres -f sql/05_add_event_status.sql

# 6. Onboarding flow
psql -h your-db.supabase.co -U postgres -f sql/06_add_is_first_time_to_profiles.sql

# 7. RLS fixes
psql -h your-db.supabase.co -U postgres -f sql/07_fix_rls_for_registration.sql
```

Or use Supabase SQL Editor and paste each file's contents.

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/your-org/careable.git
cd careable

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Open browser
# Navigate to http://localhost:3000
```

### Clerk Webhook Configuration

1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to events:
   - `user.created`
   - `user.updated`
4. Copy signing secret to `.env.local`

### Gemini API Setup

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create API key
3. Add to `.env.local` as `GEMINI_API_KEY`
4. (Optional) Set `GEMINI_MODEL` to specific version

---

## Project Structure

```
careable/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Admin portal
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── settings/
│   │   │   └── users/
│   │   └── layout.tsx            # Admin layout wrapper
│   │
│   ├── (auth)/                   # Authentication pages
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/page.tsx
│   │   └── sign-up/
│   │       └── [[...sign-up]]/page.tsx
│   │
│   ├── (landing)/                # Public landing page
│   │   └── page.tsx
│   │
│   ├── (onboarding)/             # Role selection flow
│   │   └── onboarding/
│   │       ├── _actions.ts       # Server actions
│   │       └── page.tsx
│   │
│   ├── (participant)/            # Participant/Caregiver portal
│   │   ├── participant/
│   │   │   ├── dashboard/
│   │   │   ├── events/
│   │   │   ├── messages/
│   │   │   └── profile/
│   │   ├── caregiver/
│   │   │   └── dashboard/
│   │   └── layout.tsx
│   │
│   ├── (staff)/                  # Staff portal
│   │   ├── staff/
│   │   │   ├── api/
│   │   │   │   └── calendar/extract/route.ts  # AI extraction API
│   │   │   ├── dashboard/
│   │   │   ├── events/
│   │   │   │   ├── _actions.ts
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── lib/
│   │   │   │   └── calendarExtractor.ts      # AI extraction logic
│   │   │   └── participants/
│   │   └── layout.tsx
│   │
│   ├── (volunteer)/              # Volunteer portal
│   │   ├── volunteer/
│   │   │   ├── dashboard/
│   │   │   ├── opportunities/
│   │   │   ├── profile/
│   │   │   └── schedule/
│   │   └── layout.tsx
│   │
│   ├── actions/                  # Shared server actions
│   │   └── participant.ts
│   │
│   ├── api/                      # API routes
│   │   ├── qr/
│   │   │   ├── issue/route.ts    # Generate QR codes
│   │   │   └── verify/route.ts   # Verify attendance
│   │   └── webhooks/
│   │       └── clerk/route.ts    # User sync webhook
│   │
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── favicon.ico
│
├── components/                   # Reusable components
│   ├── ui/                       # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── table.tsx
│   └── AttendanceQR.tsx          # QR scanning component
│
├── lib/                          # Core utilities
│   ├── clerk/
│   │   └── roles.ts              # Role management
│   ├── gemini/
│   │   ├── client.ts             # Gemini client setup
│   │   └── services.ts           # AI services
│   ├── supabase/
│   │   ├── admin.ts              # Service role client
│   │   ├── client.ts             # Browser client
│   │   ├── db.ts                 # Query helpers
│   │   ├── model.ts              # Type definitions
│   │   └── server.ts             # Server client
│   ├── qrAttendance.ts           # QR generation/verification
│   └── utils.ts                  # Shared utilities
│
├── sql/                          # Database migrations
│   ├── 01_supabase_schema.sql
│   ├── 02_auth_integration.sql
│   ├── 03_fix_schema_and_roles.sql
│   ├── 04_add_event_unique_constraint.sql
│   ├── 05_add_event_status.sql
│   ├── 06_add_is_first_time_to_profiles.sql
│   └── 07_fix_rls_for_registration.sql
│
├── types/                        # TypeScript types
│   └── globals.d.ts
│
├── docs/                         # Documentation
│   └── PROJECT_SUMMARY.md        # This file
│
├── .env.local                    # Environment variables (gitignored)
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
├── tsconfig.json
└── proxy.ts                      # Development proxy (if needed)
```

### Route Organization

**Route Groups** (in parentheses) allow shared layouts without affecting URLs:

- `(admin)` → Layout with admin sidebar
- `(auth)` → Layout without navigation
- `(landing)` → Public layout
- `(onboarding)` → Onboarding layout
- `(participant)` → Shared layout for participants and caregivers
- `(staff)` → Staff-specific layout
- `(volunteer)` → Volunteer-specific layout

---

## Development Workflow

### 1. Local Development

```bash
npm run dev
```

Navigate to:
- `http://localhost:3000` - Landing page
- `http://localhost:3000/sign-in` - Sign in
- `http://localhost:3000/onboarding` - Role selection

### 2. Testing Roles

After onboarding, you'll be redirected to:
- `http://localhost:3000/admin/dashboard` (Admin)
- `http://localhost:3000/staff/dashboard` (Staff)
- `http://localhost:3000/volunteer/dashboard` (Volunteer)
- `http://localhost:3000/participant/dashboard` (Participant)
- `http://localhost:3000/caregiver/dashboard` (Caregiver)

### 3. Testing AI Extraction

1. Sign in as Staff
2. Navigate to `/staff/events/new`
3. Upload a calendar image (PNG/JPEG/PDF)
4. Watch real-time extraction
5. Review and import events

### 4. Testing QR Attendance

1. Register for an event as Participant
2. View registration details (QR code displayed)
3. As Staff, navigate to event details
4. Scan QR code or manually enter token
5. Verify attendance marked

### 5. Linting and Type Checking

```bash
# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

### 6. Building for Production

```bash
npm run build
npm run start
```

---

## Security Considerations

### 1. Row Level Security (RLS)

All tables enforce RLS policies:

**Profiles**:
- Users can read their own profile
- Caregivers can read profiles they manage
- Staff/Admins can read all profiles

**Events**:
- Anyone can read events
- Only Staff/Admins can create/update/delete

**Registrations**:
- Users can read their own registrations
- Caregivers can read registrations for managed participants
- Staff can read and update all registrations
- Users can only insert registrations for themselves

### 2. Authentication

- **Clerk** handles auth (passwordless, social login)
- Session tokens are HTTP-only cookies
- Middleware protects routes based on role
- Server actions validate `auth()` before mutations

### 3. QR Code Security

- Tokens are **never stored in database**
- Only SHA-256 hashes stored
- Tokens are 32 bytes (256 bits entropy)
- Replay protection via `check_in_at` timestamp
- Staff cannot manually mark attendance (must scan)

### 4. API Security

- Webhook signatures verified with Svix
- API routes check authentication
- Rate limiting on AI extraction (Gemini API limits)
- File uploads limited to 10MB

### 5. Data Privacy

- Participant names only visible to:
  - Themselves
  - Their caregivers
  - Staff/Admins
- Email addresses not exposed in UI
- Attendance data only accessible to Staff

---

## Future Enhancements

### Short-Term (Next 3 Months)

1. **Enhanced QR Scanning**
   - Native mobile app for staff scanning
   - Batch check-in mode
   - Offline support with sync

2. **Messaging System**
   - In-app notifications
   - Email reminders for upcoming events
   - SMS opt-in for caregivers

3. **Analytics Dashboard**
   - Attendance trends
   - Popular event types
   - Volunteer participation metrics
   - Participant engagement scores

4. **Event Templates**
   - Recurring events (weekly, monthly)
   - Clone past events
   - Bulk import from CSV

### Mid-Term (6 Months)

1. **AI Enhancements**
   - Auto-generate event descriptions
   - Suggest optimal event times based on past attendance
   - Detect scheduling conflicts
   - Predict capacity needs

2. **Caregiver Portal Improvements**
   - Manage multiple children
   - Set preferences (dietary, accessibility)
   - View consolidated schedule
   - Export calendar (iCal format)

3. **Volunteer Management**
   - Skill tracking
   - Hour logging
   - Certification expiry alerts
   - Volunteer appreciation badges

4. **Mobile Apps**
   - React Native app for participants
   - Push notifications
   - Offline registration queuing

### Long-Term (12+ Months)

1. **Multi-Organization Support**
   - Tenant isolation
   - Shared event calendars
   - Cross-org volunteer pool

2. **Payment Integration**
   - Event fees (for optional activities)
   - Donation tracking
   - Financial reporting

3. **Advanced Analytics**
   - Machine learning for attendance prediction
   - Sentiment analysis from feedback
   - Custom report builder

4. **Accessibility Features**
   - Screen reader optimization
   - Voice navigation
   - High contrast themes
   - Multi-language support (Chinese, Malay, Tamil)

5. **Integration Ecosystem**
   - Google Calendar sync
   - Zoom/Teams integration for virtual events
   - WhatsApp bot for reminders
   - Government agency reporting (MSF, NCSS)

---

## Contributing

### Guidelines

1. **Code Style**: Follow existing TypeScript/React patterns
2. **Commits**: Use conventional commits (feat, fix, docs, chore)
3. **Testing**: Ensure changes don't break existing flows
4. **Documentation**: Update this file for architectural changes

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes
3. Test locally across all roles
4. Submit PR with description
5. Address review feedback
6. Merge after approval

---

## Support and Contact

For questions or support:
- **Email**: support@careable.sg
- **GitHub Issues**: [github.com/your-org/careable/issues](https://github.com/your-org/careable/issues)
- **Documentation**: [docs.careable.sg](https://docs.careable.sg)

---

## License

© 2026 Careable. Built with love for the community.

This project is proprietary software. All rights reserved.

---

**Last Updated**: January 27, 2026  
**Document Version**: 1.0  
**Project Version**: 0.1.0 (Beta)
