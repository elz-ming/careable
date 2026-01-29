-- Migration 13: Fix RLS to allow caregivers to create managed participant profiles
-- Author: Careable Team
-- Date: January 2026
-- Dependencies: Migration 08
-- Description: Allows caregivers to insert participant profiles during onboarding

BEGIN;

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Caregivers can create managed participants" ON public.profiles;

-- Recreate INSERT policy to allow:
-- 1. Users to create their own profile
-- 2. Caregivers to create managed participant profiles
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (
  -- User creating their own profile
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

COMMIT;

-- ============================================================================
-- POST-MIGRATION NOTES
-- ============================================================================
-- This migration enables:
-- 1. Caregivers can now create managed participant profiles during onboarding
-- 2. These profiles have generated IDs starting with 'participant_'
-- 3. Normal users can still only create their own profiles
-- 4. Admin/staff maintain full access
