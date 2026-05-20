-- =============================================================================
-- OPERATIONAL TABLES: Bookings, Jobs, Certificates, Savings
-- =============================================================================

-- Bookings (member-initiated service bookings)
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    commusoft_job_id TEXT,
    scheduled_date DATE NOT NULL,
    slot TEXT NOT NULL CHECK (slot IN ('AM', 'PM')),
    status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN (
        'booked', 'rescheduled', 'cancelled_by_member',
        'cancelled_by_provider', 'completed', 'no_show'
    )),
    engineer_id UUID REFERENCES engineers(id) ON DELETE SET NULL,
    notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_member ON bookings(member_id);
CREATE INDEX idx_bookings_scheduled_date ON bookings(scheduled_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_commusoft_job ON bookings(commusoft_job_id);

-- Member jobs (cached from Commusoft)
CREATE TABLE member_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    commusoft_job_id TEXT UNIQUE NOT NULL,
    job_type TEXT,
    scheduled_date DATE,
    completed_at TIMESTAMPTZ,
    engineer_id UUID REFERENCES engineers(id) ON DELETE SET NULL,
    total_invoiced_pence INT,
    member_discount_pence INT,
    status TEXT,
    raw_commusoft_data JSONB,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_member_jobs_member ON member_jobs(member_id);
CREATE INDEX idx_member_jobs_commusoft_id ON member_jobs(commusoft_job_id);
CREATE INDEX idx_member_jobs_completed ON member_jobs(completed_at);

-- Gas certificates (CP12)
CREATE TABLE gas_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    commusoft_certificate_id TEXT UNIQUE NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL,
    expires_at DATE,
    engineer_id UUID REFERENCES engineers(id) ON DELETE SET NULL,
    cached_file_path TEXT,
    cache_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gas_certificates_member ON gas_certificates(member_id);
CREATE INDEX idx_gas_certificates_issued ON gas_certificates(issued_at);
CREATE INDEX idx_gas_certificates_commusoft_id ON gas_certificates(commusoft_certificate_id);

-- Savings events (append-only ledger)
CREATE TABLE savings_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    source TEXT NOT NULL CHECK (source IN (
        'job_discount', 'annual_service_included',
        'cp12_included', 'goodwill_credit'
    )),
    source_ref TEXT,
    amount_pence INT NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_savings_events_member ON savings_events(member_id);
CREATE INDEX idx_savings_events_applied ON savings_events(applied_at);

-- Job completions (for KPIs and conversion tracking)
CREATE TABLE job_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commusoft_job_id TEXT UNIQUE NOT NULL,
    engineer_id UUID REFERENCES engineers(id) ON DELETE SET NULL,
    customer_commusoft_id TEXT,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    was_member_at_completion BOOLEAN DEFAULT FALSE,
    membership_offered BOOLEAN,
    offer_outcome TEXT,
    decline_reason TEXT,
    completed_at TIMESTAMPTZ NOT NULL,
    raw_form_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_completions_commusoft ON job_completions(commusoft_job_id);
CREATE INDEX idx_job_completions_engineer ON job_completions(engineer_id);
CREATE INDEX idx_job_completions_member ON job_completions(member_id);
CREATE INDEX idx_job_completions_completed ON job_completions(completed_at);

-- Update triggers
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_member_jobs_updated_at BEFORE UPDATE ON member_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gas_certificates_updated_at BEFORE UPDATE ON gas_certificates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SAVINGS RECALCULATION TRIGGER
-- =============================================================================
CREATE OR REPLACE FUNCTION recalculate_member_savings()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE members
    SET savings_total_pence = (
        SELECT COALESCE(SUM(amount_pence), 0)
        FROM savings_events
        WHERE member_id = NEW.member_id
    )
    WHERE id = NEW.member_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_recalculate_savings AFTER INSERT ON savings_events
    FOR EACH ROW EXECUTE FUNCTION recalculate_member_savings();
