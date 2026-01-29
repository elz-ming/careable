-- Migration 12: Add Participant-Caregiver Linking Fields
-- Author: Careable Team
-- Date: January 2026
-- Dependencies: Migration 08
-- Description: Adds fields to profiles for storing linking information between
--              participants and caregivers for account matching and emergency contact

BEGIN;

-- Add linking fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS caregiver_name TEXT,
ADD COLUMN IF NOT EXISTS caregiver_email TEXT;

COMMENT ON COLUMN public.profiles.caregiver_name 
  IS 'Name of caregiver (for participants) - used for account linking or emergency contact';
COMMENT ON COLUMN public.profiles.caregiver_email 
  IS 'Email of caregiver (for participants) - used to find and link existing caregiver accounts';

-- Add index for email lookups during linking
CREATE INDEX IF NOT EXISTS idx_profiles_caregiver_email 
  ON public.profiles(caregiver_email) 
  WHERE caregiver_email IS NOT NULL;

COMMIT;

-- ============================================================================
-- POST-MIGRATION NOTES
-- ============================================================================
-- This migration enables:
-- 1. Participants can provide caregiver info during onboarding
-- 2. Caregivers can provide participant email during onboarding
-- 3. System tries to match and link accounts automatically
-- 4. If no match found, information is stored as emergency contact
-- 5. Future manual linking can use this information
