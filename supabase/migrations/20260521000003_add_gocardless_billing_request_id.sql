-- Link members to GoCardless billing requests for signup confirmation
ALTER TABLE members
ADD COLUMN IF NOT EXISTS gocardless_billing_request_id TEXT;

CREATE INDEX IF NOT EXISTS idx_members_gocardless_billing_request
  ON members(gocardless_billing_request_id);
