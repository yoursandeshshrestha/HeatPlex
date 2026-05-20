-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;
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
-- HELPER FUNCTIONS FOR RLS
-- =============================================================================

-- Note: We'll use custom session management instead of Supabase Auth
-- Session validation will be done in the application layer
-- For now, we'll use a simpler approach with direct member/staff checks

-- =============================================================================
-- POLICIES
-- =============================================================================

-- Note: We're using custom authentication with the sessions table
-- Authorization will be handled in the application layer (Edge Functions)
-- For now, we'll keep RLS enabled but allow service role full access

-- Service role bypasses RLS automatically
-- Application code (Edge Functions) will use service role key and implement
-- authorization logic based on the sessions table

-- =============================================================================
-- SERVICE ROLE POLICIES (Full access for backend operations)
-- =============================================================================

-- Allow service role to bypass RLS (for backend operations)
-- This will be used by Edge Functions with service role key

-- Public read access for templates (needed for email rendering)
CREATE POLICY "Templates are publicly readable"
    ON templates FOR SELECT
    USING (active = true);
