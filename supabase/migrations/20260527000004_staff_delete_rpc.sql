-- Staff-initiated deletes: profile row + matching auth.users (Sourcery-style RPC, no edge function)

CREATE OR REPLACE FUNCTION staff_delete_member(target_member_id UUID)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_email CITEXT;
  sid uuid;
BEGIN
  IF NOT is_staff() THEN
    RAISE EXCEPTION 'Staff access required';
  END IF;

  sid := current_staff_id();
  IF sid IS NULL THEN
    RAISE EXCEPTION 'Staff record not found';
  END IF;

  SELECT email INTO member_email
  FROM members
  WHERE id = target_member_id;

  IF member_email IS NULL THEN
    RAISE EXCEPTION 'Member not found';
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
    'delete_member',
    'member',
    target_member_id,
    'Deleted member',
    jsonb_build_object('email', member_email),
    NULL
  );

  DELETE FROM members WHERE id = target_member_id;
  DELETE FROM auth.users WHERE email = member_email;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION staff_delete_staff(target_staff_id UUID)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  staff_email CITEXT;
  current_staff_id UUID;
  sid uuid;
BEGIN
  IF NOT is_staff() THEN
    RAISE EXCEPTION 'Staff access required';
  END IF;

  SELECT id INTO current_staff_id
  FROM staff
  WHERE email = auth.email();

  IF current_staff_id = target_staff_id THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;

  sid := current_staff_id();
  IF sid IS NULL THEN
    RAISE EXCEPTION 'Staff record not found';
  END IF;

  SELECT email INTO staff_email
  FROM staff
  WHERE id = target_staff_id;

  IF staff_email IS NULL THEN
    RAISE EXCEPTION 'Staff member not found';
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
    'delete_staff',
    'staff',
    target_staff_id,
    'Deleted staff member',
    jsonb_build_object('email', staff_email),
    NULL
  );

  DELETE FROM staff WHERE id = target_staff_id;
  DELETE FROM auth.users WHERE email = staff_email;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION staff_delete_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION staff_delete_staff(UUID) TO authenticated;

COMMENT ON FUNCTION staff_delete_member IS 'Staff: delete member row and Supabase Auth user by email';
COMMENT ON FUNCTION staff_delete_staff IS 'Staff: delete staff row and Supabase Auth user (not self)';
