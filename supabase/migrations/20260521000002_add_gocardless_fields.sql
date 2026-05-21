-- Add GoCardless payment tracking fields to members table

ALTER TABLE members
ADD COLUMN IF NOT EXISTS gocardless_customer_id TEXT,
ADD COLUMN IF NOT EXISTS gocardless_mandate_id TEXT,
ADD COLUMN IF NOT EXISTS gocardless_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS gocardless_payment_id TEXT;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_members_gocardless_customer ON members(gocardless_customer_id);
CREATE INDEX IF NOT EXISTS idx_members_gocardless_mandate ON members(gocardless_mandate_id);
CREATE INDEX IF NOT EXISTS idx_members_gocardless_subscription ON members(gocardless_subscription_id);
CREATE INDEX IF NOT EXISTS idx_members_gocardless_payment ON members(gocardless_payment_id);
