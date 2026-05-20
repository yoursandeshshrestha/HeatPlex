-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "citext";

-- =============================================================================
-- CORE TABLES: Members, Staff, Authentication
-- =============================================================================

-- Members table
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    address_town TEXT NOT NULL,
    address_postcode TEXT NOT NULL,

    -- Commusoft integration
    commusoft_customer_id TEXT,
    commusoft_link_severed_at TIMESTAMPTZ,

    -- Membership details
    plan TEXT NOT NULL CHECK (plan IN ('annual', 'monthly')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'active', 'payment_overdue', 'suspended',
        'cancellation_requested', 'cancelled', 'expired', 'deletion_requested'
    )),
    started_at TIMESTAMPTZ,
    renewal_date DATE,
    auto_renewal BOOLEAN DEFAULT TRUE,

    -- Cancellation
    cancellation_requested_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    effective_end_date DATE,

    -- Attribution
    engineer_credit_id UUID,
    promo_code TEXT,

    -- Marketing
    marketing_email_opt_in BOOLEAN DEFAULT FALSE,
    marketing_consent_at TIMESTAMPTZ,
    terms_accepted_at TIMESTAMPTZ NOT NULL,

    -- Computed
    savings_total_pence INT DEFAULT 0,

    -- Audit
    signup_ip TEXT,
    signup_user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_phone ON members(phone);
CREATE INDEX idx_members_commusoft_id ON members(commusoft_customer_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_renewal_date ON members(renewal_date) WHERE status = 'active';

-- Staff table
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff',
    last_login_at TIMESTAMPTZ,
    deactivated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: Authentication handled by Supabase Auth
-- No custom sessions or auth_tokens tables needed

-- Engineers table
CREATE TABLE engineers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commusoft_engineer_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    slug TEXT UNIQUE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_engineers_slug ON engineers(slug);
CREATE INDEX idx_engineers_commusoft_id ON engineers(commusoft_engineer_id);

-- Engineer commissions
CREATE TABLE engineer_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    engineer_id UUID NOT NULL REFERENCES engineers(id) ON DELETE CASCADE,
    attributed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    amount_pence INT NOT NULL DEFAULT 2500,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'voided')),
    paid_at TIMESTAMPTZ,
    paid_batch_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_engineer_commissions_member ON engineer_commissions(member_id);
CREATE INDEX idx_engineer_commissions_engineer ON engineer_commissions(engineer_id);
CREATE INDEX idx_engineer_commissions_status ON engineer_commissions(status);

-- =============================================================================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_engineers_updated_at BEFORE UPDATE ON engineers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
