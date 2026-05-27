-- Add INSERT policy for send_log so Edge Functions can log emails
CREATE POLICY "Service role can insert send log"
    ON send_log FOR INSERT
    WITH CHECK (true);
