-- Remove public INSERT on members; signup creation is handled by edge functions (service role).

DROP POLICY IF EXISTS "Allow public signup" ON public.members;

-- Staff (authenticated) can insert members (e.g., admin tooling).
CREATE POLICY "Staff can insert members"
  ON public.members
  FOR INSERT
  TO authenticated
  WITH CHECK (is_staff());

