-- Allow anyone to create members during signup (both anon and authenticated)
CREATE POLICY "Allow public signup" ON public.members
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to read their own member record
CREATE POLICY "Members can read own record" ON public.members
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt()->>'email');
