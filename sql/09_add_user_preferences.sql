-- Migration 09: Add user preferences for UI customization
-- Adds font size and theme preferences to profiles table

-- Add preference columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark'));

-- Update existing records to have default values
UPDATE public.profiles
SET 
  font_size = COALESCE(font_size, 'medium'),
  theme = COALESCE(theme, 'light')
WHERE font_size IS NULL OR theme IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_preferences 
ON public.profiles(id, language_preference, font_size, theme);

COMMENT ON COLUMN public.profiles.font_size IS 'User font size preference: small, medium, or large';
COMMENT ON COLUMN public.profiles.theme IS 'User theme preference: light or dark';
COMMENT ON COLUMN public.profiles.language_preference IS 'User language: en (English), zh (Chinese), ms (Malay)';
