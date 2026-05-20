-- =============================================================================
-- COMMUNICATION TABLES: Sequences, Templates, Email Logs
-- =============================================================================

-- Email templates
CREATE TABLE templates (
    key TEXT PRIMARY KEY,
    version INT NOT NULL,
    subject TEXT NOT NULL,
    html_body TEXT,
    text_body TEXT,
    channel TEXT DEFAULT 'email' CHECK (channel IN ('email')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sequence enrollments
CREATE TABLE sequence_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    sequence_key TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_step INT DEFAULT 0,
    stopped_at TIMESTAMPTZ,
    stop_reason TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sequence_enrollments_member ON sequence_enrollments(member_id);
CREATE INDEX idx_sequence_enrollments_key ON sequence_enrollments(sequence_key);
CREATE INDEX idx_sequence_enrollments_status ON sequence_enrollments(member_id, sequence_key)
    WHERE stopped_at IS NULL;

-- Scheduled steps (the queue)
CREATE TABLE scheduled_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES sequence_enrollments(id) ON DELETE CASCADE,
    step_index INT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'email',
    template_key TEXT NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'sent', 'skipped', 'failed'
    )),
    retry_count INT DEFAULT 0,
    error TEXT,
    provider_message_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scheduled_steps_enrollment ON scheduled_steps(enrollment_id);
CREATE INDEX idx_scheduled_steps_pending ON scheduled_steps(status, scheduled_for)
    WHERE status = 'pending';
CREATE INDEX idx_scheduled_steps_scheduled ON scheduled_steps(scheduled_for);

-- Send log (for tracking opens, clicks, etc.)
CREATE TABLE send_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    channel TEXT NOT NULL DEFAULT 'email',
    template_key TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    provider_message_id TEXT,
    status TEXT,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    complained_at TIMESTAMPTZ,
    bounced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_send_log_member ON send_log(member_id);
CREATE INDEX idx_send_log_provider_id ON send_log(provider_message_id);
CREATE INDEX idx_send_log_sent ON send_log(sent_at);

-- Unsubscribes
CREATE TABLE unsubscribes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    email CITEXT NOT NULL,
    scope TEXT NOT NULL CHECK (scope IN ('all', 'marketing', 'specific_sequence')),
    sequence_key TEXT,
    unsubscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason TEXT,
    source TEXT NOT NULL CHECK (source IN ('one_click', 'reply_stop', 'admin', 'complaint')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_unsubscribes_email ON unsubscribes(email);
CREATE INDEX idx_unsubscribes_member ON unsubscribes(member_id);

-- Email validation cache
CREATE TABLE email_validation_cache (
    email CITEXT PRIMARY KEY,
    valid BOOLEAN,
    mx_record_found BOOLEAN,
    validated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_validation_validated ON email_validation_cache(validated_at);

-- Update triggers
CREATE TRIGGER update_scheduled_steps_updated_at BEFORE UPDATE ON scheduled_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
