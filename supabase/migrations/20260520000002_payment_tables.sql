-- =============================================================================
-- PAYMENT TABLES: Mandates, Subscriptions, Payments
-- =============================================================================

-- GoCardless mandates
CREATE TABLE mandates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    gocardless_mandate_id TEXT UNIQUE NOT NULL,
    scheme TEXT DEFAULT 'bacs',
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'cancelled', 'failed', 'expired')),
    reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mandates_member ON mandates(member_id);
CREATE INDEX idx_mandates_gocardless_id ON mandates(gocardless_mandate_id);
CREATE INDEX idx_mandates_status ON mandates(status);

-- GoCardless subscriptions (monthly only)
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    mandate_id UUID NOT NULL REFERENCES mandates(id) ON DELETE CASCADE,
    gocardless_subscription_id TEXT UNIQUE NOT NULL,
    amount_pence INT NOT NULL,
    interval_unit TEXT NOT NULL,
    status TEXT NOT NULL,
    start_date DATE NOT NULL,
    commitment_end_date DATE,
    cancelled_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_member ON subscriptions(member_id);
CREATE INDEX idx_subscriptions_mandate ON subscriptions(mandate_id);
CREATE INDEX idx_subscriptions_gocardless_id ON subscriptions(gocardless_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    mandate_id UUID REFERENCES mandates(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    gocardless_payment_id TEXT UNIQUE,
    amount_pence INT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'signup_annual', 'renewal', 'monthly_instalment',
        'refund', 'manual_charge'
    )),
    status TEXT NOT NULL CHECK (status IN (
        'pending', 'submitted', 'confirmed', 'failed',
        'charged_back', 'refunded'
    )),
    charge_date DATE,
    confirmed_at TIMESTAMPTZ,
    failure_reason TEXT,
    refund_of UUID REFERENCES payments(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_member ON payments(member_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_charge_date ON payments(charge_date);
CREATE INDEX idx_payments_gocardless_id ON payments(gocardless_payment_id);
CREATE INDEX idx_payments_type ON payments(type);

-- Update triggers
CREATE TRIGGER update_mandates_updated_at BEFORE UPDATE ON mandates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
