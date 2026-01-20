-- 1. Add INSERT policy for registrations (allow users to register themselves)
DROP POLICY IF EXISTS "Users can register for events" ON public.registrations;
CREATE POLICY "Users can register for events"
ON public.registrations FOR INSERT
WITH CHECK (requesting_user_id() = user_id);

-- 2. Add SELECT policy for staff on registrations (allow staff to see all registrations for check-in)
DROP POLICY IF EXISTS "Staff can view all registrations" ON public.registrations;
CREATE POLICY "Staff can view all registrations"
ON public.registrations FOR SELECT
USING (requesting_user_role() IN ('admin', 'staff'));

-- 3. Add UPDATE policy for profiles (allow users to update their own profile)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (requesting_user_id() = id)
WITH CHECK (requesting_user_id() = id);

-- 4. Add DELETE policy for registrations (allow users to cancel their own registration)
DROP POLICY IF EXISTS "Users can cancel own registration" ON public.registrations;
CREATE POLICY "Users can cancel own registration"
ON public.registrations FOR DELETE
USING (requesting_user_id() = user_id);
