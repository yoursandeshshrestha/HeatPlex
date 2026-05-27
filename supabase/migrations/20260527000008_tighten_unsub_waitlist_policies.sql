-- Tighten public-facing insert policies to reduce abuse.

-- =============================================================================
-- UNSUBSCRIBES
-- =============================================================================

DROP POLICY IF EXISTS "Anyone can unsubscribe" ON public.unsubscribes;

-- Allow anonymous one-click unsubscribe, but restrict to that source.
CREATE POLICY "Anon can one-click unsubscribe"
  ON public.unsubscribes
  FOR INSERT
  TO anon
  WITH CHECK (source = 'one_click');

-- Allow authenticated users to unsubscribe themselves (covers staff/admin tools too).
CREATE POLICY "Authenticated can unsubscribe self"
  ON public.unsubscribes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (email = auth.email())
    OR is_staff()
  );

-- =============================================================================
-- WAITLIST ENTRIES
-- =============================================================================

DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist_entries;
DROP POLICY IF EXISTS "Staff can read waitlist" ON public.waitlist_entries;

-- Members can add themselves to the waitlist (by current member id), staff can too.
CREATE POLICY "Members can join waitlist"
  ON public.waitlist_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    member_id = current_member_id()
    OR is_staff()
  );

-- Staff can read/manage waitlist.
CREATE POLICY "Staff can manage waitlist"
  ON public.waitlist_entries
  FOR ALL
  USING (is_staff());

