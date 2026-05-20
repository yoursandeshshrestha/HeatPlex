-- =============================================================================
-- SYSTEM TABLES: Webhooks, Outbox, Alerts, Audit, Settings
-- =============================================================================

-- Commusoft outbox (reliable outbound writes)
CREATE TABLE commusoft_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'completed', 'dead_letter'
    )),
    attempts INT DEFAULT 0,
    last_attempted_at TIMESTAMPTZ,
    last_error TEXT,
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_commusoft_outbox_pending ON commusoft_outbox(status, scheduled_for)
    WHERE status = 'pending';
CREATE INDEX idx_commusoft_outbox_status ON commusoft_outbox(status);

-- Processed webhook events (idempotency)
CREATE TABLE processed_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL CHECK (source IN ('gocardless', 'commusoft', 'resend')),
    external_event_id TEXT NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source, external_event_id)
);

CREATE INDEX idx_webhook_events_source ON processed_webhook_events(source);
CREATE INDEX idx_webhook_events_external_id ON processed_webhook_events(external_event_id);

-- Sync drift alerts
CREATE TABLE sync_drift_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    details JSONB,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES staff(id) ON DELETE SET NULL
);

CREATE INDEX idx_sync_drift_member ON sync_drift_alerts(member_id);
CREATE INDEX idx_sync_drift_unresolved ON sync_drift_alerts(detected_at)
    WHERE resolved_at IS NULL;

-- Alerts (for admin inbox)
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    title TEXT NOT NULL,
    body TEXT,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES staff(id) ON DELETE SET NULL
);

CREATE INDEX idx_alerts_unresolved ON alerts(created_at) WHERE resolved_at IS NULL;
CREATE INDEX idx_alerts_member ON alerts(member_id);
CREATE INDEX idx_alerts_severity ON alerts(severity);

-- Audit log (append-only)
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
    action_type TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    summary TEXT,
    before JSONB,
    after JSONB,
    ip TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_staff ON audit_log(staff_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);
CREATE INDEX idx_audit_log_target ON audit_log(target_type, target_id);

-- Prevent updates/deletes on audit log
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit log is append-only. Updates and deletes are not allowed.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_log_update BEFORE UPDATE ON audit_log
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

CREATE TRIGGER prevent_audit_log_delete BEFORE DELETE ON audit_log
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

-- Internal notes (staff notes on members)
CREATE TABLE internal_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_internal_notes_member ON internal_notes(member_id);
CREATE INDEX idx_internal_notes_created ON internal_notes(created_at);

-- Waitlist entries
CREATE TABLE waitlist_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    requested_period TEXT,
    contacted_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    resolution TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_waitlist_member ON waitlist_entries(member_id);
CREATE INDEX idx_waitlist_unresolved ON waitlist_entries(created_at)
    WHERE resolved_at IS NULL;

-- System settings (single-row table)
CREATE TABLE system_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    commission_amount_pence INT DEFAULT 2500,
    pause_sequences BOOLEAN DEFAULT FALSE,
    pause_commusoft_outbound BOOLEAN DEFAULT FALSE,
    pause_new_signups BOOLEAN DEFAULT FALSE,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    maintenance_message TEXT,
    twelve_month_minimum_enabled BOOLEAN DEFAULT TRUE,
    default_plan TEXT DEFAULT 'annual' CHECK (default_plan IN ('annual', 'monthly')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO system_settings (id) VALUES (1);

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- INITIAL SEED DATA
-- =============================================================================

-- Insert default staff users (Heat Plex team)
INSERT INTO staff (email, name, role) VALUES
    ('joe@heatplex.com', 'Joe Mason', 'owner'),
    ('miles@heatplex.com', 'Miles', 'admin'),
    ('jackie@heatplex.com', 'Jackie', 'staff');

-- Insert engineers (Heat Plex team)
INSERT INTO engineers (commusoft_engineer_id, name, slug, email, active) VALUES
    ('eng_vas', 'Vas', 'vas', 'vas@heatplex.com', true),
    ('eng_marinel', 'Marinel', 'marinel', 'marinel@heatplex.com', true),
    ('eng_spencer', 'Spencer', 'spencer', 'spencer@heatplex.com', true),
    ('eng_ryan', 'Ryan', 'ryan', 'ryan@heatplex.com', true),
    ('eng_albert', 'Albert', 'albert', 'albert@heatplex.com', true);
