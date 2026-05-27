-- Update send_log table for better tracking
ALTER TABLE send_log
  ADD COLUMN IF NOT EXISTS to_email TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Create index on to_email for searching
CREATE INDEX IF NOT EXISTS idx_send_log_to_email ON send_log(to_email);

-- Create index on template_key for filtering
CREATE INDEX IF NOT EXISTS idx_send_log_template_key ON send_log(template_key);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_send_log_status ON send_log(status);
