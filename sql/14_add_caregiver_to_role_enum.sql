-- Migration 14: Add 'caregiver' to user_role enum
-- Author: Careable Team
-- Date: January 2026
-- Description: Adds 'caregiver' as a valid role in the user_role enum

BEGIN;

-- Add 'caregiver' to the user_role enum type
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'caregiver';

COMMIT;

-- ============================================================================
-- POST-MIGRATION NOTES
-- ============================================================================
-- This migration adds 'caregiver' as a valid role alongside:
-- - participant
-- - volunteer
-- - staff
-- - admin
--
-- Note: ALTER TYPE ADD VALUE cannot be rolled back
