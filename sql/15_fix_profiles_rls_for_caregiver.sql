-- Migration 15: Fix RLS policies for caregiver role
-- Author: Careable Team
-- Date: January 2026
-- Description: Ensures caregivers can create and manage their own profiles

BEGIN;

-- ============================================================================
-- PART 1: Fix SELECT policy to include caregiver
-- ============================================================================

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
  OR requesting_user_role() IN ('admin', 'staff')
);

-- ============================================================================
-- PART 2: Fix INSERT policy to allow caregiver self-registration
-- ============================================================================

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (
  -- User creating their own profile (all roles including caregiver)
  requesting_user_id() = id 
  -- OR Caregiver creating a managed participant profile (with generated ID)
  OR (
    requesting_user_role() = 'caregiver' 
    AND role = 'participant'
    AND id LIKE 'participant_%'
  )
  -- OR Admin/Staff can create any profile
  OR requesting_user_role() IN ('admin', 'staff')
);

-- ============================================================================
-- PART 3: Fix UPDATE policy to include caregiver
-- ============================================================================

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (
  requesting_user_id() = id 
  OR managed_by = requesting_user_id()
  OR id IN (
    SELECT participant_id FROM public.caregiver_participants 
    WHERE caregiver_id = requesting_user_id()
  )
  OR requesting_user_role() IN ('admin', 'staff')
)
WITH CHECK (
  requesting_user_id() = id 
  OR managed_by = requesting_user_id()
  OR id IN (
    SELECT participant_id FROM public.caregiver_participants 
    WHERE caregiver_id = requesting_user_id()
  )
  OR requesting_user_role() IN ('admin', 'staff')
);

COMMIT;

-- ============================================================================
-- POST-MIGRATION NOTES
-- ============================================================================
-- This migration ensures caregivers have full access to:
-- 1. Create their own profile during onboarding
-- 2. View and update their own profile
-- 3. Create managed participant profiles
-- 4. View and update their managed participants' profiles
