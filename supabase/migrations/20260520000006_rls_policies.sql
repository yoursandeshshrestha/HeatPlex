-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - Supabase Auth
-- =============================================================================
-- Uses Supabase Auth with auth.email() for access control

-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineers ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineer_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandates ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gas_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE send_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE unsubscribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_validation_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE commusoft_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_drift_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Get current member ID from authenticated user email
CREATE OR REPLACE FUNCTION current_member_id()
RETURNS uuid AS $$
  SELECT id FROM public.members WHERE email = auth.email()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if current user is staff
CREATE OR REPLACE FUNCTION is_staff()
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM public.staff WHERE email = auth.email())
$$ LANGUAGE SQL SECURITY DEFINER;

-- =============================================================================
-- POLICIES FOR USER PROFILES
-- =============================================================================

-- MEMBERS: Can read own profile, staff can read all, anyone can check if email exists (for login)
CREATE POLICY "Members can read own profile"
    ON members FOR SELECT
    USING (
        email = auth.email()
        OR is_staff()
        OR auth.email() IS NULL -- Allow unauthenticated reads for login check
    );

-- MEMBERS: Authenticated users can read their own record by JWT email claim
CREATE POLICY "Members can read own record"
    ON members FOR SELECT
    TO authenticated
    USING (email = auth.jwt()->>'email');

-- MEMBERS: Can update own profile, staff can update all
CREATE POLICY "Members can update own profile"
    ON members FOR UPDATE
    USING (email = auth.email() OR is_staff());

-- MEMBERS: Public signup - anon and authenticated users can create new member rows
CREATE POLICY "Allow public signup"
    ON members FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- STAFF: Only staff can read staff data
CREATE POLICY "Staff can read staff data"
    ON staff FOR SELECT
    USING (is_staff());

-- STAFF: Only staff can update staff data
CREATE POLICY "Staff can update staff data"
    ON staff FOR UPDATE
    USING (is_staff());

-- =============================================================================
-- POLICIES FOR MEMBER DATA
-- =============================================================================

-- BOOKINGS: Members can read/manage own bookings, staff can access all
CREATE POLICY "Members can read own bookings"
    ON bookings FOR SELECT
    USING (
        member_id = current_member_id()
        OR is_staff()
    );

CREATE POLICY "Members can create own bookings"
    ON bookings FOR INSERT
    WITH CHECK (
        member_id = current_member_id()
        OR is_staff()
    );

CREATE POLICY "Members can update own bookings"
    ON bookings FOR UPDATE
    USING (
        member_id = current_member_id()
        OR is_staff()
    );

CREATE POLICY "Staff can delete bookings"
    ON bookings FOR DELETE
    USING (is_staff());

-- JOBS: Members can read own jobs, staff can access all
CREATE POLICY "Members can read own jobs"
    ON member_jobs FOR SELECT
    USING (
        member_id = current_member_id()
        OR is_staff()
    );

-- CERTIFICATES: Members can read own certificates, staff can access all
CREATE POLICY "Members can read own certificates"
    ON gas_certificates FOR SELECT
    USING (
        member_id = current_member_id()
        OR is_staff()
    );

-- PAYMENTS: Members can read own payments, staff can access all
CREATE POLICY "Members can read own payments"
    ON payments FOR SELECT
    USING (
        member_id = current_member_id()
        OR is_staff()
    );

-- SAVINGS: Members can read own savings, staff can access all
CREATE POLICY "Members can read own savings"
    ON savings_events FOR SELECT
    USING (
        member_id = current_member_id()
        OR is_staff()
    );

-- MANDATES: Members can read own mandates, staff can access all
CREATE POLICY "Members can read own mandates"
    ON mandates FOR SELECT
    USING (
        member_id = current_member_id()
        OR is_staff()
    );

-- SUBSCRIPTIONS: Members can read own subscriptions, staff can access all
CREATE POLICY "Members can read own subscriptions"
    ON subscriptions FOR SELECT
    USING (
        member_id = current_member_id()
        OR is_staff()
    );

-- JOB COMPLETIONS: Members can read own job completions, staff can access all
CREATE POLICY "Members can read own job completions"
    ON job_completions FOR SELECT
    USING (
        member_id = current_member_id()
        OR is_staff()
    );

-- =============================================================================
-- POLICIES FOR REFERENCE DATA (PUBLIC READ)
-- =============================================================================

-- ENGINEERS: Public read access for active engineers
CREATE POLICY "Active engineers are publicly readable"
    ON engineers FOR SELECT
    USING (active = true);

-- TEMPLATES: Public read access for active templates
CREATE POLICY "Active templates are publicly readable"
    ON templates FOR SELECT
    USING (active = true);

-- =============================================================================
-- POLICIES FOR INTERNAL/SYSTEM DATA (STAFF ONLY)
-- =============================================================================

-- ENGINEER COMMISSIONS: Staff only
CREATE POLICY "Staff can manage engineer commissions"
    ON engineer_commissions FOR ALL
    USING (is_staff());

-- SEQUENCE ENROLLMENTS: Staff only
CREATE POLICY "Staff can manage sequence enrollments"
    ON sequence_enrollments FOR ALL
    USING (is_staff());

-- SCHEDULED STEPS: Staff only
CREATE POLICY "Staff can manage scheduled steps"
    ON scheduled_steps FOR ALL
    USING (is_staff());

-- SEND LOG: Staff only
CREATE POLICY "Staff can read send log"
    ON send_log FOR SELECT
    USING (is_staff());

-- UNSUBSCRIBES: Anyone can unsubscribe, staff can read
CREATE POLICY "Anyone can unsubscribe"
    ON unsubscribes FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Staff can read unsubscribes"
    ON unsubscribes FOR SELECT
    USING (is_staff());

-- EMAIL VALIDATION CACHE: Staff only
CREATE POLICY "Staff can manage email validation cache"
    ON email_validation_cache FOR ALL
    USING (is_staff());

-- COMMUSOFT OUTBOX: Staff only
CREATE POLICY "Staff can manage commusoft outbox"
    ON commusoft_outbox FOR ALL
    USING (is_staff());

-- PROCESSED WEBHOOK EVENTS: Staff only
CREATE POLICY "Staff can manage webhook events"
    ON processed_webhook_events FOR ALL
    USING (is_staff());

-- SYNC DRIFT ALERTS: Staff only
CREATE POLICY "Staff can manage drift alerts"
    ON sync_drift_alerts FOR ALL
    USING (is_staff());

-- ALERTS: Staff only
CREATE POLICY "Staff can manage alerts"
    ON alerts FOR ALL
    USING (is_staff());

-- AUDIT LOG: Staff read only
CREATE POLICY "Staff can read audit log"
    ON audit_log FOR SELECT
    USING (is_staff());

-- INTERNAL NOTES: Staff only
CREATE POLICY "Staff can manage internal notes"
    ON internal_notes FOR ALL
    USING (is_staff());

-- WAITLIST ENTRIES: Anyone can join, staff can read
CREATE POLICY "Anyone can join waitlist"
    ON waitlist_entries FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Staff can read waitlist"
    ON waitlist_entries FOR SELECT
    USING (is_staff());

-- SYSTEM SETTINGS: Staff only
CREATE POLICY "Staff can manage system settings"
    ON system_settings FOR ALL
    USING (is_staff());

-- =============================================================================
-- NOTES
-- =============================================================================
-- These policies use Supabase Auth's built-in functions:
-- - auth.uid(): Current authenticated user's ID
-- - auth.email(): Current authenticated user's email
-- - Custom functions current_member_id() and auth.is_staff()
