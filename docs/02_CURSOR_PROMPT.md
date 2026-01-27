# Careable Platform Improvement - Cursor AI Instructions

## 🎯 Mission
You are tasked with improving the Careable platform, an event management system for caregiver organizations supporting children with disabilities. This is a **CRITICAL PRODUCTION SYSTEM** with existing data in Supabase. Your changes must be backward-compatible and non-breaking.

## ⚠️ CRITICAL RULES - READ FIRST

### Rule #1: Always Read Before Writing
Before making ANY changes to a file or proposing new features:
1. **READ the existing implementation thoroughly**
2. **READ related files to understand the full context**
3. **READ all 7 existing migration scripts** in `supabase/migrations/` to understand the current schema
4. **READ the current `lib/supabase/types.ts` or `types/database.ts`** to understand existing types
5. Only THEN propose changes

### Rule #2: Database Changes Must Be Non-Breaking
- **NEVER drop columns** that contain data
- **ALWAYS use `ALTER TABLE ADD COLUMN IF NOT EXISTS`** for new columns
- **ALWAYS provide default values** for new NOT NULL columns
- **ALWAYS check foreign key relationships** before adding constraints
- **Test migration scripts mentally** against existing data scenarios
- Number new migrations sequentially (next is `0008_*.sql`)

### Rule #3: Preserve Existing Functionality
- The platform is **ALREADY IN BETA** with users
- Test any changes against existing user flows
- Maintain API contract compatibility
- Preserve all existing RLS (Row Level Security) policies
- Keep existing Clerk webhook integrations intact

### Rule #4: Mobile-First Implementation
- Participant/Caregiver and Volunteer views are **MOBILE-FIRST**
- Staff event creation is **DESKTOP-FIRST**
- Staff QR scanning is **MOBILE-FIRST** with **REAR CAMERA ONLY**
- Admin dashboard is **DESKTOP-ONLY**

---

## 📋 Project Context

### Current Tech Stack
- **Frontend**: Next.js 16.1.4 (App Router), React 19.2.3, TypeScript 5
- **Styling**: Tailwind CSS 4, Shadcn UI
- **Database**: Supabase (PostgreSQL with RLS)
- **Auth**: Clerk (with role-based metadata)
- **AI**: Google Gemini 2.0 Flash (for calendar extraction)
- **QR**: qrcode (generation), html5-qrcode (scanning)

### Current Database Schema (from existing migrations 0001-0007)
**Read all 7 migration files before proposing changes.** The schema includes:
- `profiles` table (users with roles: participant, caregiver, volunteer, staff, admin)
- `events` table (community events with capacity, accessibility flags)
- `registrations` table (event signups with QR ticket codes - SHA-256 hashed)

### Existing Route Structure
```
app/
├── (landing)/          # Public pages
├── (auth)/             # Sign-in, sign-up
├── (onboarding)/       # Role selection after signup
├── (participant)/      # Participant/Caregiver shared view
├── (volunteer)/        # Volunteer view
├── (staff)/            # Staff dashboard and tools
└── (admin)/            # Admin analytics
```

---

## 🎯 Improvement Tasks

## TASK 1: Fix AI Calendar Extraction Accuracy

**Current Issue**: The Gemini 2.0 Flash extraction sometimes works, sometimes doesn't. Accuracy is inconsistent.

**Location**: `app/(staff)/staff/api/calendar/extract/route.ts` or similar

**What to Do**:
1. **READ the current prompt** being sent to Gemini API
2. **READ the response parsing logic** to understand failure points
3. **Improve the prompt** with these enhancements:
   - Add explicit instruction to cross-reference color legends with venues
   - Request step-by-step reasoning before JSON output
   - Add format examples for ambiguous time formats (12h vs 24h)
   - Handle multi-day events explicitly
   - Add Singapore venue name normalization rules
4. **Add validation layer** before returning results to frontend
5. **Improve error messages** when extraction fails partially

**Success Criteria**:
- 95%+ extraction accuracy on test calendars
- Clear error messages when AI fails
- Graceful degradation (manual correction UI)

---

## TASK 2: Implement Caregiver-Participant Relationship

**Current Issue**: No way to link caregivers to the participants they manage.

**What to Do**:

### Step 2.1: Database Schema (Migration 0008)
```sql
-- READ existing migrations 0001-0007 first!
-- This is migration 0008_caregiver_participant_relationship.sql

-- Add participant name field to profiles (caregivers register on behalf of participants)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS participant_full_name TEXT,
ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en' CHECK (language_preference IN ('en', 'zh', 'ms')),
ADD COLUMN IF NOT EXISTS membership_type TEXT CHECK (membership_type IN ('ad_hoc', 'once_weekly', 'twice_weekly'));

-- Create junction table for caregiver-participant relationships
CREATE TABLE IF NOT EXISTS public.caregiver_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL, -- e.g., 'parent', 'guardian', 'sibling'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(caregiver_id, participant_id)
);

-- RLS policies for caregiver_participants
ALTER TABLE public.caregiver_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can view their managed participants"
ON public.caregiver_participants FOR SELECT
USING (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can add managed participants"
ON public.caregiver_participants FOR INSERT
WITH CHECK (caregiver_id = auth.uid());

-- Allow caregivers to view profiles of participants they manage
CREATE POLICY "Caregivers can view managed participant profiles"
ON public.profiles FOR SELECT
USING (
  id = auth.uid() 
  OR id IN (
    SELECT participant_id FROM public.caregiver_participants 
    WHERE caregiver_id = auth.uid()
  )
  OR role IN ('staff', 'admin')
);

-- Allow caregivers to register participants for events
CREATE POLICY "Caregivers can register managed participants"
ON public.registrations FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR user_id IN (
    SELECT participant_id FROM public.caregiver_participants 
    WHERE caregiver_id = auth.uid()
  )
);

COMMENT ON TABLE public.caregiver_participants IS 'Links caregivers to the participants they manage';
COMMENT ON COLUMN public.profiles.participant_full_name IS 'Full name of participant (used when caregiver registers on their behalf)';
```

### Step 2.2: Update Type Definitions
**READ** `lib/supabase/types.ts` or wherever types are defined.

Add types for:
```typescript
export interface CaregiverParticipant {
  id: string;
  caregiver_id: string;
  participant_id: string;
  relationship: string;
  created_at: string;
}

// Extend Profile type to include new fields
export interface Profile {
  // ... existing fields
  participant_full_name?: string;
  language_preference?: 'en' | 'zh' | 'ms';
  membership_type?: 'ad_hoc' | 'once_weekly' | 'twice_weekly';
}
```

### Step 2.3: Onboarding Flow Enhancement
**READ** the existing onboarding flow in `app/(onboarding)/` first.

Enhance the caregiver onboarding to ask:
1. "Are you registering for yourself or someone else?"
2. If "someone else", collect:
   - Participant's full name
   - Relationship (dropdown)
   - Special needs/accessibility requirements (optional)
3. Create participant profile and link via `caregiver_participants` table

---

## TASK 3: Fix QR Scanner Camera (CRITICAL)

**Current Issue**: QR scanner might be using front camera instead of rear camera.

**Location**: Find the QR scanning component (likely in `app/(staff)/staff/` or `components/`)

**What to Do**:
1. **READ the current html5-qrcode implementation**
2. **Verify camera constraints** are set to rear camera:
   ```typescript
   const config = {
     fps: 10,
     qrbox: { width: 250, height: 250 },
     facingMode: { exact: "environment" } // REAR camera
   };
   ```
3. **Add fallback** if "environment" fails (some devices):
   ```typescript
   // Fallback to non-exact constraint
   facingMode: "environment"
   ```
4. **Test on mobile device** or add user-facing camera toggle as backup

---

## TASK 4: Improve Registrations Table for Attendance Tracking

**What to Do**:

### Step 4.1: Database Schema Enhancement (part of Migration 0008)
```sql
-- Add attendance tracking fields
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS attendance_notes TEXT;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_registrations_check_in 
ON public.registrations(event_id, check_in_at) 
WHERE check_in_at IS NOT NULL;

COMMENT ON COLUMN public.registrations.checked_in_by IS 'Staff member who scanned the QR code';
COMMENT ON COLUMN public.registrations.attendance_notes IS 'Optional notes from staff during check-in';
```

### Step 4.2: Update QR Verification API
**READ** the existing QR verification endpoint (likely `/api/qr/verify` or similar).

Enhance to:
1. Record `checked_in_by` (staff user ID)
2. Record `check_in_at` timestamp
3. Return attendee info (name, event) for display on staff screen
4. Handle duplicate scan gracefully (show "already checked in")

---

## TASK 5: Implement Language Switching

**What to Do**:
1. **READ existing i18n setup** (if any) in the project
2. Set up `next-intl` or similar library
3. Create translation files:
   ```
   locales/
   ├── en.json
   ├── zh.json (Simplified Chinese)
   └── ms.json (Malay)
   ```
4. Translate key UI elements:
   - Navigation labels
   - Event discovery page
   - Registration flow
   - Profile page
5. Add language selector in Profile page (saves to `profiles.language_preference`)
6. Apply language preference on page load from user profile

**Priority Strings to Translate**:
- "Discover Events"
- "My Registrations"
- "Profile"
- "Register"
- "Show QR Code"
- "Event Details"
- Form labels and buttons

---

## TASK 6: Enhance Event Model for Staff Attribution

**What to Do**:

### Step 6.1: Schema Update (part of Migration 0008)
```sql
-- Track which staff member created each event
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'both' CHECK (target_audience IN ('participants', 'volunteers', 'both'));

-- Backfill created_by for existing events (set to first staff member or leave null)
-- Only if you can safely determine the creator

COMMENT ON COLUMN public.events.created_by IS 'Staff member who created this event';
COMMENT ON COLUMN public.events.image_url IS 'Optional event banner image URL';
COMMENT ON COLUMN public.events.target_audience IS 'Whether event is for participants, volunteers, or both';
```

### Step 6.2: Update Event Creation Forms
**READ** the event creation components.

Add:
- Automatically set `created_by` to current staff user's ID
- Optional image upload field
- Target audience selector (radio buttons: Participants / Volunteers / Both)

---

## TASK 7: Build Admin Analytics Dashboard (NEW)

**What to Do**:

### Step 7.1: Create Analytics Queries
Create `lib/analytics/` directory with query functions:

```typescript
// lib/analytics/attendance.ts
export async function getAttendanceMetrics(dateRange: { start: Date, end: Date }) {
  // Query registrations with check_in_at not null
  // Return: total events, total attendees, attendance rate %
}

export async function getTopStaff(limit: number = 10) {
  // Query events grouped by created_by
  // Return: staff profiles with event count and total attendance
}

export async function getTopParticipants(limit: number = 20) {
  // Query registrations grouped by user_id (participants only)
  // Return: participant profiles with attendance count
}

export async function getTopVolunteers(limit: number = 20) {
  // Query registrations grouped by user_id (volunteers only)
  // Return: volunteer profiles with attendance count
}

// lib/analytics/geography.ts
export async function getEventHotspots() {
  // Query events with location/coordinates
  // Group by venue or area
  // Return: locations with event count
}
```

### Step 7.2: Build Dashboard UI
Create `app/(admin)/admin/dashboard/page.tsx`:

**READ** existing Shadcn UI components available.

Use:
- `Card` for metric cards (total events, attendance rate, etc.)
- `Table` for leaderboards
- `BarChart` / `LineChart` from `recharts` for trends
- Date range picker for filtering

Dashboard sections:
1. **Key Metrics Row**: Total Events, Total Participants, Total Volunteers, Avg Attendance Rate
2. **Event Performance**: Bar chart of events per month
3. **Staff Leaderboard**: Top 10 staff by events created
4. **Participant Engagement**: Top 20 participants by attendance
5. **Volunteer Engagement**: Top 20 volunteers by attendance
6. **Geographic Distribution**: List of top venues (map visualization is Phase 2)

---

## TASK 8: Mobile UI Optimization

**What to Do**:
1. **READ all mobile-first pages**: Participant, Caregiver, Volunteer views
2. **Audit touch target sizes**: Ensure buttons are minimum 44x44px
3. **Test scrolling performance**: Infinite scroll or pagination on Discovery page
4. **Optimize images**: Lazy loading, responsive images
5. **PWA readiness**: Ensure offline QR code access works
6. **Test on real devices**: iPhone and Android with various screen sizes

**Key Pages to Optimize**:
- `app/(participant)/participant/discover/page.tsx` (or similar)
- `app/(participant)/participant/registrations/page.tsx`
- `app/(volunteer)/volunteer/discover/page.tsx`
- QR code display modals

---

## 🔍 Testing & Validation Checklist

After implementing changes, verify:

### Database Integrity
- [ ] Migration 0008 runs successfully on test database with existing data
- [ ] All RLS policies work correctly (test with different user roles)
- [ ] Foreign key constraints don't break existing records
- [ ] Indexes are created for query performance

### User Flows
- [ ] **Caregiver Flow**: Can register a participant and sign them up for events
- [ ] **Participant Flow**: Can discover events, register, and view QR codes
- [ ] **Volunteer Flow**: Can browse opportunities and register
- [ ] **Staff Flow**: Can create events via AI extraction and scan QR codes
- [ ] **Admin Flow**: Can view analytics dashboard

### AI Extraction
- [ ] Test with 5 different calendar formats
- [ ] Verify 95%+ accuracy on standard calendars
- [ ] Confirm error messages are clear
- [ ] Manual correction UI works

### QR System
- [ ] QR codes generate correctly
- [ ] Staff scanner uses rear camera on mobile
- [ ] Check-in records properly (timestamp + staff ID)
- [ ] Duplicate scan handling works

### Localization
- [ ] Language selector saves preference
- [ ] All three languages (EN/ZH/MS) load correctly
- [ ] No broken translations or missing keys

---

## 📝 Documentation Requirements

For each major change, update:
1. **PROJECT_SUMMARY.md** - Add new features to relevant sections
2. **README.md** - Update setup instructions if needed
3. **Code comments** - Document complex logic
4. **Migration file** - Add comments explaining schema changes

---

## 🚨 Red Flags to Avoid

### ❌ DON'T DO THESE:
1. **Drop existing columns** without data migration
2. **Change existing API endpoints** without versioning
3. **Remove or modify existing RLS policies** without understanding impact
4. **Break backward compatibility** with existing registrations
5. **Modify Clerk webhook handler** without testing user sync
6. **Change QR code generation algorithm** (existing codes must still work)
7. **Ignore existing TypeScript types** - always update them
8. **Skip reading migration files** before proposing schema changes

### ✅ DO THESE:
1. **Read before writing** - always understand existing code first
2. **Test migrations** on a copy of production data structure
3. **Preserve existing functionality** while adding new features
4. **Follow established patterns** in the codebase
5. **Use existing UI components** from Shadcn
6. **Maintain mobile-first approach** for user-facing views
7. **Add proper error handling** for all new features
8. **Document your changes** clearly

---

## 🎯 Success Criteria

The improvement is successful when:

1. ✅ **AI extraction accuracy reaches 95%+** on test calendars
2. ✅ **Caregiver-participant relationships work end-to-end** (onboarding → registration → QR code)
3. ✅ **QR scanner reliably uses rear camera** on mobile devices
4. ✅ **All three languages (EN/ZH/MS) are functional** with clean translations
5. ✅ **Admin dashboard displays accurate analytics** with no query errors
6. ✅ **Migration 0008 runs cleanly** on test database with existing data
7. ✅ **All existing user flows remain unbroken** after updates
8. ✅ **Mobile experience is smooth** with no layout issues or slow performance

---

## 🔄 Implementation Order

Follow this sequence to minimize risk:

1. **Phase 1 - Foundation** (Do First):
   - Read all existing code and migrations (Tasks 1-8 prep)
   - Create Migration 0008 SQL file (test on local DB)
   - Update type definitions

2. **Phase 2 - Core Features** (Do Second):
   - Fix AI calendar extraction prompt (Task 1)
   - Fix QR scanner camera constraint (Task 3)
   - Implement caregiver-participant relationship (Task 2)

3. **Phase 3 - Enhancements** (Do Third):
   - Improve registration tracking (Task 4)
   - Enhance event model (Task 6)
   - Language switching (Task 5)

4. **Phase 4 - Analytics** (Do Last):
   - Build admin dashboard (Task 7)
   - Mobile UI optimization pass (Task 8)

---

## 📞 When in Doubt

If you're unsure about:
- **Schema changes**: Read the existing migrations again and ask for clarification
- **Breaking changes**: Err on the side of caution - propose alternatives
- **Complex logic**: Add detailed comments explaining your reasoning
- **Database queries**: Test the SQL in a safe environment first
- **UI changes**: Follow existing patterns in the codebase

**Remember**: This is a production system with real users and real data. Safety and backward compatibility are paramount.

---

## Final Instruction

Start by reading:
1. All 7 migration files in `supabase/migrations/`
2. The database types file (`lib/supabase/types.ts` or similar)
3. The AI calendar extraction route/component
4. The QR scanning component
5. The existing onboarding flow

Only after reading these files should you begin proposing changes. When you make proposals, reference the specific files and line numbers you've read to demonstrate your understanding of the existing implementation.

Good luck! Build something that improves the lives of caregivers and families supporting children with disabilities. 🧡
