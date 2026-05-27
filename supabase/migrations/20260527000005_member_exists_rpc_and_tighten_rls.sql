-- Tighten members SELECT policy and provide a safe anon callable email check.
--
-- Previously, the "Members can read own profile" policy allowed anonymous reads:
--   OR auth.email() IS NULL
-- That effectively made the full members table readable to unauthenticated users.

-- =============================================================================
-- Safe public function: member_exists(email) -> boolean
-- =============================================================================

CREATE OR REPLACE FUNCTION public.member_exists(candidate_email text)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.members
    WHERE email = lower(candidate_email)::citext
  );
$$ LANGUAGE SQL;

GRANT EXECUTE ON FUNCTION public.member_exists(text) TO anon, authenticated;

COMMENT ON FUNCTION public.member_exists(text)
IS 'Public: returns whether a member email exists (no row data exposed)';

-- =============================================================================
-- Tighten members SELECT policy (remove anonymous reads)
-- =============================================================================

DROP POLICY IF EXISTS "Members can read own profile" ON public.members;

CREATE POLICY "Members can read own profile"
  ON public.members
  FOR SELECT
  USING (
    email = auth.email()
    OR is_staff()
  );

