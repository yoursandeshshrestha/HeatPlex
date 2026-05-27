-- Staff audit logging RPCs (append-only)

-- Helper: get current staff id from authenticated email
CREATE OR REPLACE FUNCTION current_staff_id()
RETURNS uuid
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.staff WHERE email = auth.email()
$$ LANGUAGE SQL;

-- Append-only audit log writer (staff only)
CREATE OR REPLACE FUNCTION append_audit_log(
  p_action_type text,
  p_target_type text,
  p_target_id uuid,
  p_summary text,
  p_before jsonb DEFAULT NULL,
  p_after jsonb DEFAULT NULL
)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sid uuid;
BEGIN
  IF NOT is_staff() THEN
    RAISE EXCEPTION 'Staff access required';
  END IF;

  sid := current_staff_id();
  IF sid IS NULL THEN
    RAISE EXCEPTION 'Staff record not found';
  END IF;

  INSERT INTO public.audit_log (
    staff_id,
    action_type,
    target_type,
    target_id,
    summary,
    before,
    after
  ) VALUES (
    sid,
    p_action_type,
    p_target_type,
    p_target_id,
    p_summary,
    p_before,
    p_after
  );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION current_staff_id() TO authenticated;
GRANT EXECUTE ON FUNCTION append_audit_log(text, text, uuid, text, jsonb, jsonb) TO authenticated;

COMMENT ON FUNCTION append_audit_log IS 'Staff-only: append an audit log row';

