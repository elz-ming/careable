-- Add is_first_time column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_first_time BOOLEAN DEFAULT TRUE;

-- Ensure all existing users have it set correctly (optional, but good for consistency)
UPDATE public.profiles SET is_first_time = TRUE WHERE is_first_time IS NULL;
