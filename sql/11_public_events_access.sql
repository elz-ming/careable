-- Allow public (unauthenticated) users to view active events
-- This enables the landing page to show upcoming events to visitors

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public can view active events" ON public.events;

-- Create policy to allow anyone (even unauthenticated) to view active events
CREATE POLICY "Public can view active events"
ON public.events FOR SELECT
USING (status = 'active');

-- Note: This only allows SELECT (read) access, not INSERT/UPDATE/DELETE
-- Only authenticated staff/admin can modify events through other policies
