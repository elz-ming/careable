# Careable - Comprehensive Improvement Plan

**Generated**: January 27, 2026  
**Status**: Ready for Implementation  
**Priority**: Based on Critical Production Issues First

---

## 🔍 Current State Analysis

### ✅ What's Working
- ✅ Authentication via Clerk with role-based access
- ✅ Event management with AI calendar extraction (basic)
- ✅ QR code generation for registrations (SHA-256 hashed)
- ✅ Basic registration and event discovery
- ✅ Row Level Security (RLS) policies
- ✅ Mobile-responsive UI (needs optimization)

### ❌ Critical Issues Found

#### 🚨 **ISSUE 1: TypeScript Types Out of Sync** (CRITICAL)
**File**: `lib/supabase/model.ts`  
**Problem**: Missing fields added in migrations 05 and 06

**Current model.ts**:
```typescript
export interface Profile {
  // ... existing fields
  // ❌ MISSING: is_first_time (added in migration 06)
}

export interface Event {
  // ... existing fields
  // ❌ MISSING: status (added in migration 05)
}
```

**Impact**: TypeScript won't catch bugs related to these fields, potential runtime errors.

#### 🚨 **ISSUE 2: QR Scanner Not Using Rear Camera** (CRITICAL)
**File**: `app/staff/verify/page.tsx` (lines 23-27)  
**Problem**: No `facingMode` constraint specified

**Current code**:
```typescript
const scanner = new Html5QrcodeScanner(
  "reader",
  { 
    fps: 10, 
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0
    // ❌ MISSING: facingMode: "environment"
  },
  false
);
```

**Impact**: Scanner may use front-facing camera on mobile devices, making it difficult for staff to scan participant QR codes.

#### ⚠️ **ISSUE 3: No Caregiver-Participant Relationships**
**Problem**: Caregivers cannot register participants or view their registrations.

**Missing**:
- Database table linking caregivers to participants
- UI for managing participant profiles
- Registration flow for caregivers acting on behalf of participants

#### ⚠️ **ISSUE 4: Limited Attendance Tracking**
**File**: `lib/qrAttendance.ts`  
**Problem**: Check-ins don't record which staff member performed verification.

**Missing fields in `registrations` table**:
- `checked_in_by` (staff member ID)
- `attendance_notes` (optional notes during check-in)

#### ⚠️ **ISSUE 5: No Multi-Language Support**
**Problem**: Platform only supports English, but target audience includes Chinese and Malay speakers.

#### ⚠️ **ISSUE 6: No Analytics Dashboard**
**Problem**: No way for admins to track:
- Attendance trends
- Popular events
- Volunteer/participant engagement
- Staff productivity

---

## 📋 Implementation Roadmap

### Phase 1: Critical Fixes (Week 1) 🔴

#### TASK 1.1: Fix TypeScript Types
**Priority**: 🔴 CRITICAL  
**Effort**: 15 minutes  
**Risk**: Low

**Action Items**:
1. Update `lib/supabase/model.ts`:

```typescript
export type EventStatus = 'active' | 'cancelled' | 'completed';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  membership_type: string | null;
  managed_by: string | null;
  is_first_time: boolean; // ✅ ADD THIS
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  location: string;
  start_time: string;
  end_time: string;
  capacity: number;
  is_accessible: boolean;
  status: EventStatus; // ✅ ADD THIS
  created_at: string;
}
```

2. Run TypeScript check to verify no breaking changes:
```bash
npx tsc --noEmit
```

---

#### TASK 1.2: Fix QR Scanner Camera (CRITICAL)
**Priority**: 🔴 CRITICAL  
**Effort**: 30 minutes  
**Risk**: Low  
**File**: `app/staff/verify/page.tsx`

**Implementation**:

```typescript
// REPLACE lines 21-29 with:
const scanner = new Html5QrcodeScanner(
  "reader",
  { 
    fps: 10, 
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0,
    // ✅ ADD THIS: Forces rear camera on mobile
    facingMode: "environment",
    // ✅ ADD THIS: Better on mobile
    rememberLastUsedCamera: true,
  },
  false
);
```

**Testing**:
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Verify rear camera is used by default
- [ ] Verify fallback to front camera if rear unavailable

---

#### TASK 1.3: Improve AI Extraction Prompt Accuracy
**Priority**: 🔴 HIGH  
**Effort**: 2-3 hours  
**Risk**: Medium  
**File**: `app/(staff)/staff/lib/calendarExtractor.ts`

**Current Issues**:
- Inconsistent venue mapping from color legends
- Sometimes fails to parse multi-day events
- Time format confusion (12h vs 24h)

**Improvements to Prompt** (lines 91-112):

```typescript
const prompt = `You are a Senior Data Engineer specializing in Computer Vision and Document Extraction.
Your task is to extract event data from a caregiver organization's calendar image with 100% precision.

CRITICAL RULES:
1. **LEGEND MAPPING IS MANDATORY**: 
   - Locate the "Legend", "Meeting Venues", or "Locations" section (usually at bottom/side)
   - Create a COMPLETE map of every color/icon to its full venue address
   - Examples:
     * Red/🏢 = "MTC Eunos Office, Level 2, 3 Paya Lebar Road, Singapore 409007"
     * Blue/🏊 = "Yishun Swimming Complex, 1 Yishun Ave 3, Singapore 768837"
     * Green/🌳 = "Gardens by the Bay, 18 Marina Gardens Dr, Singapore 018953"
   
2. **TIME CONVERSION**:
   - Convert ALL times to 24-hour format
   - Examples:
     * "3-4pm" → start: "15:00", end: "16:00"
     * "10am-12.30pm" → start: "10:00", end: "12:30"
     * "9-11am" → start: "09:00", end: "11:00"
   - If time is ambiguous, default to morning (09:00)

3. **MULTI-DAY EVENTS**:
   - If an event spans multiple days, create SEPARATE entries for each day
   - Example: "Swimming Camp (Mon-Wed)" → 3 separate event objects

4. **VENUE EXTRACTION**:
   - Priority 1: Use the legend/color mapping
   - Priority 2: Extract from event title if venue explicitly stated
   - Priority 3: If unclear, set to "To Be Confirmed"
   - ALWAYS use full Singapore addresses with postal codes

5. **SINGAPORE-SPECIFIC NORMALIZATION**:
   - "MTC" = "MTC Eunos Office, Level 2, 3 Paya Lebar Road"
   - "SAFRA" locations: Always include branch (e.g., "SAFRA Yishun")
   - "Tampines East" = "Tampines East Community Centre"
   - Gardens/Parks: Use official names

STEP-BY-STEP EXTRACTION PROCESS:
1. HEADER ANALYSIS: 
   - Identify Month (e.g., "DEC", "DECEMBER") and Year (e.g., "2025")
   
2. LEGEND MAPPING (CRITICAL):
   - Read legend section COMPLETELY
   - Map every color/icon to venue
   - Write down your mappings in your reasoning

3. CALENDAR TYPE:
   - Identify if it's: monthly_grid, weekly_grid, or agenda_list
   
4. GRID EXTRACTION:
   - For each day with content:
     a. Extract date (YYYY-MM-DD format)
     b. Extract activity title EXACTLY as written
     c. Extract and CONVERT times to 24h format
     d. Map location using your legend mappings
     e. Check for wheelchair icon (♿) for accessibility
     f. Extract any "Things to bring" or notes

5. QUALITY CONTROL:
   - Count total events found
   - Verify all venues are mapped (none say "TBD" unless truly unknown)
   - Verify all times are 24h format
   - Verify dates are valid (no 2025-02-30)

OUTPUT FORMAT:
First, output your DETAILED reasoning showing:
- Your legend mappings
- How you identified the month/year
- How you processed each day
Then output: [RESULT_START]
{your JSON here}
[RESULT_END]

SCHEMA:
${JSON.stringify(zodToJsonSchema(CalendarExtractionSchema as any))}

Begin your step-by-step reasoning now:`;
```

**Validation Layer** (add after line 179):

```typescript
// ✅ ADD VALIDATION BEFORE YIELDING RESULTS
if (parsed.events) {
  // Validate and normalize each event
  parsed.events = parsed.events.map((e: any, idx: number) => {
    const errors = [];
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date_iso)) {
      errors.push(`Invalid date format: ${e.date_iso}`);
    }
    
    // Validate time format (24h)
    if (e.start_time && !/^\d{2}:\d{2}$/.test(e.start_time)) {
      errors.push(`Invalid start time format: ${e.start_time}`);
    }
    
    if (e.end_time && !/^\d{2}:\d{2}$/.test(e.end_time)) {
      errors.push(`Invalid end time format: ${e.end_time}`);
    }
    
    // Warn if location is generic
    if (e.location === 'TBD' || !e.location) {
      console.warn(`[Event ${idx + 1}] Location not specified for: ${e.title}`);
    }
    
    if (errors.length > 0) {
      console.error(`[Event ${idx + 1}] Validation errors:`, errors);
    }
    
    return {
      title: e.title || e.eventTitle || e.activity || "Untitled Event",
      date_iso: e.date_iso || e.date || e.occurrenceDate || "",
      start_time: e.start_time || e.startTime || null,
      end_time: e.end_time || e.endTime || null,
      location: e.location || e.venue || "To Be Confirmed",
      is_accessible: e.is_accessible ?? true,
      description: e.description || e.notes || null,
      sourceFile: filename,
      validationErrors: errors.length > 0 ? errors : undefined
    };
  });
}

console.log(`[${correlationId}] [AUDIT] Successfully parsed JSON. Found ${parsed.events?.length || 0} events.`);
yield { type: "json", content: parsed };
```

**Success Criteria**:
- [ ] 95%+ accuracy on 5 test calendar images
- [ ] All venues properly mapped from legends
- [ ] All times in 24h format
- [ ] Clear error messages for partial failures

---

### Phase 2: Database Schema Update (Week 1-2) 🟡

#### TASK 2.1: Create Migration 08 - Enhanced Schema
**Priority**: 🟡 HIGH  
**Effort**: 2 hours  
**Risk**: Medium (requires careful testing)

**Create file**: `sql/08_enhanced_schema_caregiver_attendance.sql`

```sql
-- Migration 08: Enhanced Schema for Caregiver Relationships and Attendance Tracking
-- Author: Careable Team
-- Date: January 2026
-- Dependencies: Migrations 01-07

BEGIN;

-- ============================================================================
-- PART 1: CAREGIVER-PARTICIPANT RELATIONSHIPS
-- ============================================================================

-- 1.1: Add participant metadata to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS participant_full_name TEXT,
ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en' 
  CHECK (language_preference IN ('en', 'zh', 'ms')),
ADD COLUMN IF NOT EXISTS special_needs TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT;

COMMENT ON COLUMN public.profiles.participant_full_name 
  IS 'Full name of participant (used when caregiver registers on their behalf)';
COMMENT ON COLUMN public.profiles.language_preference 
  IS 'UI language preference: en (English), zh (Chinese), ms (Malay)';
COMMENT ON COLUMN public.profiles.special_needs 
  IS 'Accessibility requirements or special needs notes';
COMMENT ON COLUMN public.profiles.emergency_contact 
  IS 'Emergency contact information for participants';

-- 1.2: Create caregiver-participant relationship table
CREATE TABLE IF NOT EXISTS public.caregiver_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL 
    CHECK (relationship IN ('parent', 'guardian', 'sibling', 'relative', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(caregiver_id, participant_id)
);

CREATE INDEX IF NOT EXISTS idx_caregiver_participants_caregiver 
  ON public.caregiver_participants(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_caregiver_participants_participant 
  ON public.caregiver_participants(participant_id);

COMMENT ON TABLE public.caregiver_participants 
  IS 'Links caregivers to the participants they manage (e.g., parents to children)';

-- 1.3: RLS policies for caregiver_participants
ALTER TABLE public.caregiver_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can view their managed participants"
ON public.caregiver_participants FOR SELECT
USING (
  caregiver_id = requesting_user_id() 
  OR requesting_user_role() IN ('admin', 'staff')
);

CREATE POLICY "Caregivers can add managed participants"
ON public.caregiver_participants FOR INSERT
WITH CHECK (caregiver_id = requesting_user_id());

CREATE POLICY "Caregivers can update their relationships"
ON public.caregiver_participants FOR UPDATE
USING (caregiver_id = requesting_user_id())
WITH CHECK (caregiver_id = requesting_user_id());

CREATE POLICY "Caregivers can remove their relationships"
ON public.caregiver_participants FOR DELETE
USING (caregiver_id = requesting_user_id());

-- 1.4: Update profile RLS to allow caregivers to view managed participants
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (
  requesting_user_id() = id 
  OR managed_by = requesting_user_id()
  OR id IN (
    SELECT participant_id FROM public.caregiver_participants 
    WHERE caregiver_id = requesting_user_id()
  )
);

-- 1.5: Update registration INSERT policy for caregiver registrations
DROP POLICY IF EXISTS "Users can register for events" ON public.registrations;
CREATE POLICY "Users can register for events"
ON public.registrations FOR INSERT
WITH CHECK (
  requesting_user_id() = user_id
  OR user_id IN (
    SELECT participant_id FROM public.caregiver_participants 
    WHERE caregiver_id = requesting_user_id()
  )
);

-- ============================================================================
-- PART 2: ENHANCED ATTENDANCE TRACKING
-- ============================================================================

-- 2.1: Add attendance tracking fields
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS checked_in_by TEXT REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS attendance_notes TEXT,
ADD COLUMN IF NOT EXISTS registration_source TEXT DEFAULT 'self' 
  CHECK (registration_source IN ('self', 'caregiver', 'staff'));

COMMENT ON COLUMN public.registrations.checked_in_by 
  IS 'Staff member who scanned the QR code and verified attendance';
COMMENT ON COLUMN public.registrations.attendance_notes 
  IS 'Optional notes from staff during check-in (e.g., late arrival, early departure)';
COMMENT ON COLUMN public.registrations.registration_source 
  IS 'Who registered: self (participant), caregiver, or staff';

-- 2.2: Add performance index for check-in queries
CREATE INDEX IF NOT EXISTS idx_registrations_check_in 
ON public.registrations(event_id, check_in_at) 
WHERE check_in_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_registrations_checked_in_by 
ON public.registrations(checked_in_by) 
WHERE checked_in_by IS NOT NULL;

-- ============================================================================
-- PART 3: ENHANCED EVENT MODEL
-- ============================================================================

-- 3.1: Add event metadata
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'both' 
  CHECK (target_audience IN ('participants', 'volunteers', 'both')),
ADD COLUMN IF NOT EXISTS min_age INTEGER CHECK (min_age >= 0),
ADD COLUMN IF NOT EXISTS max_age INTEGER CHECK (max_age >= min_age),
ADD COLUMN IF NOT EXISTS requires_guardian BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.events.image_url 
  IS 'Optional event banner/poster image URL (from storage)';
COMMENT ON COLUMN public.events.target_audience 
  IS 'Whether event is for participants, volunteers, or both';
COMMENT ON COLUMN public.events.min_age 
  IS 'Minimum age requirement (null = no restriction)';
COMMENT ON COLUMN public.events.max_age 
  IS 'Maximum age requirement (null = no restriction)';
COMMENT ON COLUMN public.events.requires_guardian 
  IS 'Whether event requires guardian/caregiver accompaniment';

-- ============================================================================
-- PART 4: ANALYTICS HELPER VIEWS (Read-only, Staff/Admin only)
-- ============================================================================

-- 4.1: Attendance summary view
CREATE OR REPLACE VIEW public.event_attendance_summary AS
SELECT 
  e.id AS event_id,
  e.title,
  e.start_time,
  e.location,
  e.capacity,
  COUNT(r.id) AS total_registrations,
  COUNT(r.check_in_at) AS total_attended,
  ROUND(
    CASE 
      WHEN COUNT(r.id) > 0 
      THEN (COUNT(r.check_in_at)::decimal / COUNT(r.id)::decimal) * 100 
      ELSE 0 
    END, 
    2
  ) AS attendance_rate_percent,
  e.created_by,
  p.full_name AS created_by_name
FROM public.events e
LEFT JOIN public.registrations r ON e.id = r.event_id
LEFT JOIN public.profiles p ON e.created_by = p.id
GROUP BY e.id, e.title, e.start_time, e.location, e.capacity, e.created_by, p.full_name;

COMMENT ON VIEW public.event_attendance_summary 
  IS 'Analytics view for event attendance metrics (staff/admin only)';

-- 4.2: User engagement view
CREATE OR REPLACE VIEW public.user_engagement_summary AS
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.role,
  COUNT(r.id) AS total_registrations,
  COUNT(r.check_in_at) AS total_attended,
  ROUND(
    CASE 
      WHEN COUNT(r.id) > 0 
      THEN (COUNT(r.check_in_at)::decimal / COUNT(r.id)::decimal) * 100 
      ELSE 0 
    END, 
    2
  ) AS attendance_rate_percent,
  MAX(r.check_in_at) AS last_attended_at
FROM public.profiles p
LEFT JOIN public.registrations r ON p.id = r.user_id
GROUP BY p.id, p.full_name, p.email, p.role;

COMMENT ON VIEW public.user_engagement_summary 
  IS 'Analytics view for user engagement metrics (staff/admin only)';

-- ============================================================================
-- PART 5: CLEANUP AND VERIFICATION
-- ============================================================================

-- 5.1: Update timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_caregiver_participants_updated_at ON public.caregiver_participants;
CREATE TRIGGER update_caregiver_participants_updated_at
BEFORE UPDATE ON public.caregiver_participants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;

-- ============================================================================
-- POST-MIGRATION VERIFICATION
-- ============================================================================
-- Run these queries to verify migration success:
--
-- 1. Check new columns exist:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name IN ('profiles', 'events', 'registrations', 'caregiver_participants');
--
-- 2. Check new policies exist:
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
--
-- 3. Check indexes:
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';
```

**Testing Checklist**:
- [ ] Migration runs successfully on test database
- [ ] No data loss from existing records
- [ ] All RLS policies work correctly
- [ ] New indexes improve query performance
- [ ] Views return correct data

---

#### TASK 2.2: Update TypeScript Types for New Schema
**File**: `lib/supabase/model.ts`

```typescript
// ✅ ADD THESE TYPES:

export type Relationship = 'parent' | 'guardian' | 'sibling' | 'relative' | 'other';
export type LanguagePreference = 'en' | 'zh' | 'ms';
export type RegistrationSource = 'self' | 'caregiver' | 'staff';
export type TargetAudience = 'participants' | 'volunteers' | 'both';

// ✅ UPDATE Profile interface:
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  membership_type: string | null;
  managed_by: string | null;
  is_first_time: boolean;
  participant_full_name: string | null; // NEW
  language_preference: LanguagePreference; // NEW
  special_needs: string | null; // NEW
  emergency_contact: string | null; // NEW
  created_at: string;
  updated_at: string;
}

// ✅ UPDATE Event interface:
export interface Event {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  location: string;
  start_time: string;
  end_time: string;
  capacity: number;
  is_accessible: boolean;
  status: EventStatus;
  image_url: string | null; // NEW
  target_audience: TargetAudience; // NEW
  min_age: number | null; // NEW
  max_age: number | null; // NEW
  requires_guardian: boolean; // NEW
  created_at: string;
}

// ✅ UPDATE Registration interface:
export interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  ticket_code: string;
  status: RegistrationStatus;
  check_in_at: string | null;
  checked_in_by: string | null; // NEW
  attendance_notes: string | null; // NEW
  registration_source: RegistrationSource; // NEW
  created_at: string;
}

// ✅ ADD NEW interface:
export interface CaregiverParticipant {
  id: string;
  caregiver_id: string;
  participant_id: string;
  relationship: Relationship;
  created_at: string;
  updated_at: string;
}

// ✅ ADD NEW composite types:
export type CaregiverParticipantWithProfile = CaregiverParticipant & {
  participant: Pick<Profile, 'full_name' | 'email' | 'special_needs' | 'participant_full_name'>;
};

export type RegistrationWithAttendance = Registration & {
  event: Pick<Event, 'title' | 'location' | 'start_time' | 'end_time'>;
  checked_in_by_profile: Pick<Profile, 'full_name'> | null;
};

// ✅ ADD analytics types:
export interface EventAttendanceSummary {
  event_id: string;
  title: string;
  start_time: string;
  location: string;
  capacity: number;
  total_registrations: number;
  total_attended: number;
  attendance_rate_percent: number;
  created_by: string;
  created_by_name: string | null;
}

export interface UserEngagementSummary {
  id: string;
  full_name: string | null;
  email: string;
  role: UserRole;
  total_registrations: number;
  total_attended: number;
  attendance_rate_percent: number;
  last_attended_at: string | null;
}
```

---

### Phase 3: Backend Features (Week 2-3) 🟢

#### TASK 3.1: Update QR Verification to Track Staff
**File**: `lib/qrAttendance.ts` (line 99-110)

```typescript
// ✅ UPDATE verifyQrToken function:
export async function verifyQrToken(
  token: string, 
  staffUserId: string // NEW PARAMETER
): Promise<VerifyResult> {
  const supabase = await createClient();

  if (!token || typeof token !== 'string') {
    return { status: 'invalid' };
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const { data: registration, error } = await supabase
    .from('registrations')
    .select(`
      id,
      check_in_at,
      status,
      profiles (
        full_name,
        role
      )
    `)
    .eq('ticket_code', tokenHash)
    .single();

  if (error || !registration) {
    console.log('Verification failed: Token not found or error', error);
    return { status: 'invalid' };
  }

  if (registration.check_in_at) {
    return { status: 'already_checked_in' };
  }

  // ✅ UPDATE: Include staffUserId in update
  const { error: updateError } = await supabase
    .from('registrations')
    .update({
      status: 'attended',
      check_in_at: new Date().toISOString(),
      checked_in_by: staffUserId // NEW
    })
    .eq('id', registration.id);

  if (updateError) {
    console.error('Error marking attendance:', updateError);
    throw new Error('Failed to update attendance status');
  }

  const profile = Array.isArray(registration.profiles) 
    ? registration.profiles[0] 
    : registration.profiles;

  return {
    status: 'ok',
    registrationId: registration.id,
    attendeeName: profile?.full_name || 'Attendee',
    role: profile?.role
  };
}
```

**Update API endpoint** `app/api/qr/verify/route.ts`:

```typescript
// ✅ ADD auth check and pass staffUserId:
import { auth } from '@clerk/nextjs/server';
import { verifyQrToken } from '@/lib/qrAttendance';

export async function POST(req: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { token } = await req.json();
    
    if (!token) {
      return Response.json({ error: 'Token required' }, { status: 400 });
    }

    const result = await verifyQrToken(token, userId); // PASS userId
    
    if (result.status === 'ok') {
      return Response.json({
        status: 'ok',
        attendeeName: result.attendeeName,
        role: result.role
      });
    } else if (result.status === 'already_checked_in') {
      return Response.json({
        status: 'error',
        error: 'Already checked in',
        reason: 'duplicate'
      });
    } else {
      return Response.json({
        status: 'error',
        error: 'Invalid QR code'
      });
    }
  } catch (error) {
    console.error('QR verification error:', error);
    return Response.json({
      status: 'error',
      error: 'Verification failed'
    }, { status: 500 });
  }
}
```

---

#### TASK 3.2: Create Caregiver Management Server Actions
**Create file**: `app/actions/caregiver.ts`

```typescript
'use server';

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import type { CaregiverParticipant, Relationship } from '@/lib/supabase/model';

/**
 * Link a participant to the current caregiver
 */
export async function linkParticipant(data: {
  participantId: string;
  relationship: Relationship;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createClient();

  const { data: link, error } = await supabase
    .from('caregiver_participants')
    .insert({
      caregiver_id: userId,
      participant_id: data.participantId,
      relationship: data.relationship
    })
    .select()
    .single();

  if (error) {
    console.error('Error linking participant:', error);
    return { error: 'Failed to link participant' };
  }

  return { success: true, data: link };
}

/**
 * Get all participants managed by current caregiver
 */
export async function getManagedParticipants() {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('caregiver_participants')
    .select(`
      id,
      participant_id,
      relationship,
      created_at,
      participant:profiles!caregiver_participants_participant_id_fkey (
        id,
        full_name,
        participant_full_name,
        email,
        special_needs
      )
    `)
    .eq('caregiver_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching managed participants:', error);
    return { error: 'Failed to fetch participants' };
  }

  return { success: true, data };
}

/**
 * Register a participant for an event (by caregiver)
 */
export async function registerParticipantForEvent(data: {
  participantId: string;
  eventId: string;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createClient();

  // Verify caregiver manages this participant
  const { data: link } = await supabase
    .from('caregiver_participants')
    .select('id')
    .eq('caregiver_id', userId)
    .eq('participant_id', data.participantId)
    .single();

  if (!link) {
    return { error: 'You do not manage this participant' };
  }

  // Generate ticket code
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Create registration
  const { data: registration, error } = await supabase
    .from('registrations')
    .insert({
      event_id: data.eventId,
      user_id: data.participantId,
      ticket_code: tokenHash,
      status: 'registered',
      registration_source: 'caregiver'
    })
    .select()
    .single();

  if (error) {
    console.error('Error registering participant:', error);
    return { error: 'Failed to register participant' };
  }

  return { success: true, data: registration };
}

/**
 * Remove participant link
 */
export async function unlinkParticipant(linkId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('caregiver_participants')
    .delete()
    .eq('id', linkId)
    .eq('caregiver_id', userId); // Ensure only owner can delete

  if (error) {
    console.error('Error unlinking participant:', error);
    return { error: 'Failed to unlink participant' };
  }

  return { success: true };
}
```

---

#### TASK 3.3: Create Analytics Server Actions
**Create file**: `lib/analytics/queries.ts`

```typescript
'use server';

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import type { EventAttendanceSummary, UserEngagementSummary } from '@/lib/supabase/model';

/**
 * Check if user is staff or admin
 */
async function requireStaffOrAdmin() {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const role = sessionClaims?.metadata?.role;
  if (role !== 'staff' && role !== 'admin') {
    throw new Error('Forbidden: Staff or Admin access required');
  }

  return userId;
}

/**
 * Get attendance metrics for date range
 */
export async function getAttendanceMetrics(dateRange?: {
  start: string;
  end: string;
}) {
  await requireStaffOrAdmin();
  const supabase = await createClient();

  let query = supabase
    .from('event_attendance_summary')
    .select('*');

  if (dateRange) {
    query = query
      .gte('start_time', dateRange.start)
      .lte('start_time', dateRange.end);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching attendance metrics:', error);
    return { error: 'Failed to fetch metrics' };
  }

  // Calculate aggregate metrics
  const totalEvents = data.length;
  const totalRegistrations = data.reduce((sum, e) => sum + e.total_registrations, 0);
  const totalAttended = data.reduce((sum, e) => sum + e.total_attended, 0);
  const avgAttendanceRate = totalRegistrations > 0 
    ? (totalAttended / totalRegistrations) * 100 
    : 0;

  return {
    success: true,
    data: {
      events: data,
      summary: {
        totalEvents,
        totalRegistrations,
        totalAttended,
        avgAttendanceRate: Math.round(avgAttendanceRate * 100) / 100
      }
    }
  };
}

/**
 * Get top staff members by events created
 */
export async function getTopStaff(limit: number = 10) {
  await requireStaffOrAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('event_attendance_summary')
    .select('created_by, created_by_name')
    .not('created_by', 'is', null);

  if (error) {
    console.error('Error fetching top staff:', error);
    return { error: 'Failed to fetch staff metrics' };
  }

  // Group by staff and count events
  const staffMap = new Map<string, { name: string; eventCount: number; totalAttendance: number }>();
  
  data.forEach((row: any) => {
    const key = row.created_by;
    if (!staffMap.has(key)) {
      staffMap.set(key, {
        name: row.created_by_name || 'Unknown',
        eventCount: 0,
        totalAttendance: 0
      });
    }
    const staff = staffMap.get(key)!;
    staff.eventCount += 1;
    staff.totalAttendance += row.total_attended || 0;
  });

  const topStaff = Array.from(staffMap.entries())
    .map(([id, stats]) => ({ staffId: id, ...stats }))
    .sort((a, b) => b.eventCount - a.eventCount)
    .slice(0, limit);

  return { success: true, data: topStaff };
}

/**
 * Get top participants by attendance
 */
export async function getTopParticipants(limit: number = 20) {
  await requireStaffOrAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_engagement_summary')
    .select('*')
    .eq('role', 'participant')
    .order('total_attended', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching top participants:', error);
    return { error: 'Failed to fetch participant metrics' };
  }

  return { success: true, data };
}

/**
 * Get top volunteers by attendance
 */
export async function getTopVolunteers(limit: number = 20) {
  await requireStaffOrAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_engagement_summary')
    .select('*')
    .eq('role', 'volunteer')
    .order('total_attended', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching top volunteers:', error);
    return { error: 'Failed to fetch volunteer metrics' };
  }

  return { success: true, data };
}

/**
 * Get event location hotspots
 */
export async function getEventHotspots() {
  await requireStaffOrAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select('location, status')
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching event hotspots:', error);
    return { error: 'Failed to fetch location data' };
  }

  // Group by location
  const locationMap = new Map<string, number>();
  data.forEach((event: any) => {
    const count = locationMap.get(event.location) || 0;
    locationMap.set(event.location, count + 1);
  });

  const hotspots = Array.from(locationMap.entries())
    .map(([location, count]) => ({ location, eventCount: count }))
    .sort((a, b) => b.eventCount - a.eventCount);

  return { success: true, data: hotspots };
}
```

---

### Phase 4: Frontend Features (Week 3-4) 🔵

#### TASK 4.1: Build Admin Analytics Dashboard
**Create file**: `app/(admin)/admin/dashboard/page.tsx`

```typescript
import { getAttendanceMetrics, getTopStaff, getTopParticipants, getTopVolunteers, getEventHotspots } from '@/lib/analytics/queries';
import { Card } from '@/components/ui/card';
import { Table } from '@/components/ui/table';

export default async function AdminDashboard() {
  const [metricsRes, staffRes, participantsRes, volunteersRes, hotspotsRes] = await Promise.all([
    getAttendanceMetrics(),
    getTopStaff(10),
    getTopParticipants(20),
    getTopVolunteers(20),
    getEventHotspots()
  ]);

  const metrics = metricsRes.success ? metricsRes.data : null;
  const topStaff = staffRes.success ? staffRes.data : [];
  const topParticipants = participantsRes.success ? participantsRes.data : [];
  const topVolunteers = volunteersRes.success ? volunteersRes.data : [];
  const hotspots = hotspotsRes.success ? hotspotsRes.data : [];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-[#2D1E17]">Analytics Dashboard</h1>
        <p className="text-[#6B5A4E] mt-2">Overview of platform performance and user engagement</p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border border-zinc-100 shadow-sm">
          <div className="text-sm text-[#6B5A4E] uppercase tracking-wide">Total Events</div>
          <div className="text-4xl font-bold text-[#2D1E17] mt-2">{metrics?.summary.totalEvents || 0}</div>
        </Card>

        <Card className="p-6 bg-white border border-zinc-100 shadow-sm">
          <div className="text-sm text-[#6B5A4E] uppercase tracking-wide">Registrations</div>
          <div className="text-4xl font-bold text-[#2D1E17] mt-2">{metrics?.summary.totalRegistrations || 0}</div>
        </Card>

        <Card className="p-6 bg-white border border-zinc-100 shadow-sm">
          <div className="text-sm text-[#6B5A4E] uppercase tracking-wide">Attendees</div>
          <div className="text-4xl font-bold text-[#2D1E17] mt-2">{metrics?.summary.totalAttended || 0}</div>
        </Card>

        <Card className="p-6 bg-white border border-zinc-100 shadow-sm">
          <div className="text-sm text-[#6B5A4E] uppercase tracking-wide">Attendance Rate</div>
          <div className="text-4xl font-bold text-[#E89D71] mt-2">{metrics?.summary.avgAttendanceRate.toFixed(1) || 0}%</div>
        </Card>
      </div>

      {/* Staff Leaderboard */}
      <Card className="p-6 bg-white border border-zinc-100 shadow-sm">
        <h2 className="text-xl font-bold text-[#2D1E17] mb-4">Top Staff Members</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B5A4E]">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B5A4E]">Name</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[#6B5A4E]">Events Created</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[#6B5A4E]">Total Attendance</th>
              </tr>
            </thead>
            <tbody>
              {topStaff.map((staff: any, idx: number) => (
                <tr key={staff.staffId} className="border-b border-zinc-50 hover:bg-[#FEF3EB] transition-colors">
                  <td className="py-3 px-4 text-[#2D1E17] font-bold">{idx + 1}</td>
                  <td className="py-3 px-4 text-[#2D1E17]">{staff.name}</td>
                  <td className="py-3 px-4 text-right text-[#2D1E17]">{staff.eventCount}</td>
                  <td className="py-3 px-4 text-right text-[#E89D71] font-semibold">{staff.totalAttendance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Participant & Volunteer Engagement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Participants */}
        <Card className="p-6 bg-white border border-zinc-100 shadow-sm">
          <h2 className="text-xl font-bold text-[#2D1E17] mb-4">Top Participants</h2>
          <div className="space-y-2">
            {topParticipants.slice(0, 10).map((user: any, idx: number) => (
              <div key={user.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#FEF3EB] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E89D71] text-white flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-medium text-[#2D1E17]">{user.full_name || 'Anonymous'}</div>
                    <div className="text-xs text-[#6B5A4E]">{user.total_attended} attended</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-[#E89D71]">{user.attendance_rate_percent.toFixed(0)}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Volunteers */}
        <Card className="p-6 bg-white border border-zinc-100 shadow-sm">
          <h2 className="text-xl font-bold text-[#2D1E17] mb-4">Top Volunteers</h2>
          <div className="space-y-2">
            {topVolunteers.slice(0, 10).map((user: any, idx: number) => (
              <div key={user.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#E8F3F0] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#86B1A4] text-white flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-medium text-[#2D1E17]">{user.full_name || 'Anonymous'}</div>
                    <div className="text-xs text-[#6B5A4E]">{user.total_attended} attended</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-[#86B1A4]">{user.attendance_rate_percent.toFixed(0)}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Event Hotspots */}
      <Card className="p-6 bg-white border border-zinc-100 shadow-sm">
        <h2 className="text-xl font-bold text-[#2D1E17] mb-4">Popular Venues</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotspots.slice(0, 9).map((spot: any, idx: number) => (
            <div key={idx} className="p-4 rounded-xl border border-zinc-100 hover:border-[#E89D71] transition-colors">
              <div className="text-sm text-[#6B5A4E]">{spot.location}</div>
              <div className="text-2xl font-bold text-[#E89D71] mt-1">{spot.eventCount} events</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
```

---

#### TASK 4.2: Build Caregiver Participant Management UI
**Create file**: `app/(participant)/caregiver/participants/page.tsx`

```typescript
import { getManagedParticipants } from '@/app/actions/caregiver';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export default async function CaregiverParticipantsPage() {
  const result = await getManagedParticipants();
  const participants = result.success ? result.data : [];

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2D1E17]">Managed Participants</h1>
          <p className="text-[#6B5A4E] mt-1">Children and individuals you care for</p>
        </div>
        <Link 
          href="/caregiver/participants/add"
          className="flex items-center gap-2 px-4 py-2 bg-[#E89D71] text-white rounded-xl font-semibold hover:bg-[#D88C61] transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Add Participant
        </Link>
      </div>

      {participants.length === 0 ? (
        <Card className="p-12 text-center bg-[#FEF3EB] border-0">
          <div className="w-16 h-16 bg-[#E89D71]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-[#E89D71]" />
          </div>
          <h3 className="text-lg font-bold text-[#2D1E17] mb-2">No participants yet</h3>
          <p className="text-[#6B5A4E] mb-6">Add a participant to register them for events</p>
          <Link 
            href="/caregiver/participants/add"
            className="inline-block px-6 py-3 bg-[#E89D71] text-white rounded-xl font-semibold hover:bg-[#D88C61] transition-colors"
          >
            Add Your First Participant
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {participants.map((link: any) => (
            <Card key={link.id} className="p-6 bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#2D1E17]">
                    {link.participant.participant_full_name || link.participant.full_name || 'Participant'}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-[#6B5A4E]">
                    <span className="capitalize">{link.relationship}</span>
                    {link.participant.special_needs && (
                      <span className="px-2 py-1 bg-[#FEF3EB] text-[#E89D71] rounded-lg text-xs font-medium">
                        Special needs noted
                      </span>
                    )}
                  </div>
                  {link.participant.special_needs && (
                    <div className="mt-3 p-3 bg-[#FEF3EB] rounded-lg text-sm text-[#6B5A4E]">
                      {link.participant.special_needs}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link 
                    href={`/caregiver/participants/${link.participant_id}/events`}
                    className="px-4 py-2 bg-[#E89D71] text-white rounded-lg font-medium hover:bg-[#D88C61] transition-colors text-sm"
                  >
                    Register for Events
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

#### TASK 4.3: Implement Language Switching
**Install library**: `next-intl`

```bash
npm install next-intl
```

**Create**: `lib/i18n/locales/en.json`, `zh.json`, `ms.json`

**Example** `locales/en.json`:
```json
{
  "nav": {
    "dashboard": "Dashboard",
    "events": "Events",
    "profile": "Profile",
    "myRegistrations": "My Registrations"
  },
  "events": {
    "discover": "Discover Events",
    "register": "Register",
    "showQR": "Show QR Code",
    "details": "Event Details",
    "capacity": "Capacity",
    "location": "Location",
    "when": "When"
  },
  "profile": {
    "language": "Language",
    "english": "English",
    "chinese": "中文",
    "malay": "Bahasa Melayu"
  }
}
```

**Configure** `next.config.ts`:
```typescript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  // ... existing config
};

export default withNextIntl(nextConfig);
```

**Add language selector** to profile page.

---

### Phase 5: Testing & Polish (Week 4) ✅

#### TASK 5.1: Mobile UI Optimization
- [ ] Test all mobile-first pages on real devices
- [ ] Ensure touch targets are 44x44px minimum
- [ ] Optimize image loading (lazy load)
- [ ] Test QR scanner on iOS and Android
- [ ] Verify offline QR code access

#### TASK 5.2: Comprehensive Testing
- [ ] Unit tests for server actions
- [ ] Integration tests for registration flow
- [ ] E2E tests for caregiver workflow
- [ ] Load testing for AI extraction
- [ ] Security audit of RLS policies

#### TASK 5.3: Documentation Updates
- [ ] Update PROJECT_SUMMARY.md
- [ ] Update README.md with new features
- [ ] Add inline code comments
- [ ] Create user guides for each role

---

## 📊 Priority Matrix

| Task | Priority | Effort | Risk | Impact |
|------|----------|--------|------|--------|
| Fix TypeScript Types | 🔴 Critical | Low | Low | High |
| Fix QR Camera | 🔴 Critical | Low | Low | High |
| Improve AI Prompt | 🔴 High | Medium | Medium | High |
| Migration 08 | 🟡 High | High | Medium | High |
| QR Attendance Tracking | 🟡 Medium | Low | Low | Medium |
| Caregiver Management | 🟢 Medium | Medium | Low | High |
| Analytics Dashboard | 🟢 Medium | Medium | Low | Medium |
| Language Switching | 🔵 Low | High | Low | Medium |
| Mobile Optimization | 🔵 Low | High | Low | Medium |

---

## ⚠️ Risk Mitigation

### Database Migration Risks
- **Backup database** before running migration 08
- **Test on staging environment** first
- **Have rollback script ready**
- **Monitor performance** after indexes created

### Breaking Changes
- Migration 08 is **backward compatible**
- New columns have default values
- Existing queries still work
- RLS policies are additive

### Performance Concerns
- New indexes may slow down writes slightly
- Views are read-only (no write overhead)
- Analytics queries should be cached
- Consider read replicas for analytics

---

## 📅 Timeline Estimate

**Week 1**: Critical fixes + Migration 08  
**Week 2**: Backend features (attendance tracking, caregiver actions)  
**Week 3**: Frontend features (analytics dashboard, caregiver UI)  
**Week 4**: Language switching + mobile optimization + testing  

**Total**: 4 weeks for complete implementation

---

## 🎯 Success Criteria

1. ✅ AI extraction accuracy ≥ 95%
2. ✅ QR scanner uses rear camera on all mobile devices
3. ✅ Caregivers can manage participants end-to-end
4. ✅ Staff can see who performed check-ins
5. ✅ Admin dashboard shows accurate metrics
6. ✅ All 3 languages work correctly
7. ✅ Mobile UI is smooth and responsive
8. ✅ All existing functionality remains unbroken
9. ✅ No data loss during migration
10. ✅ Test coverage ≥ 80%

---

## 📞 Next Steps

1. **Review this plan** with your team
2. **Prioritize** which phases to tackle first
3. **Set up staging environment** for testing
4. **Backup production database**
5. **Begin with Phase 1** (critical fixes)

---

**Document Version**: 1.0  
**Last Updated**: January 27, 2026  
**Prepared By**: AI Assistant based on CURSOR_PROMPT analysis

