/**
 * Verify Page - Magic Link Callback
 * Handles redirect after Supabase Auth verifies magic link
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export function VerifyPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleAuthCallback();
  }, []);

  async function handleAuthCallback() {
    try {
      // Get the session after Supabase Auth verification
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        setStatus('error');
        setError('Failed to verify your login link');
        return;
      }

      if (!session) {
        setStatus('error');
        setError('No active session. The link may have expired.');
        return;
      }

      const email = session.user.email;
      if (!email) {
        await supabase.auth.signOut();
        setStatus('error');
        setError('No email on this account');
        return;
      }

      const [{ data: member }, { data: staff }] = await Promise.all([
        supabase.from('members').select('id').eq('email', email).maybeSingle(),
        supabase.from('staff').select('id').eq('email', email).maybeSingle(),
      ]);

      if (!member && !staff) {
        await supabase.auth.signOut();
        setStatus('error');
        setError('No account found for this email');
        return;
      }

      setStatus('success');

      // Redirect to account
      setTimeout(() => {
        navigate('/account', { replace: true });
      }, 1500);

    } catch (err) {
      console.error('Verification error:', err);
      setStatus('error');
      setError('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Content */}
      <div className="flex flex-col p-8">
        {/* Logo */}
        <div className="mb-8">
          <img src="/heatplex-logo.png" alt="Heat Plex" className="h-10" />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md border-0 shadow-none">
        <CardHeader className="text-center">
          <CardTitle>
            {status === 'verifying' && 'Verifying your link...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Unable to sign in'}
          </CardTitle>
          <CardDescription>
            {status === 'verifying' && 'Please wait while we verify your login link'}
            {status === 'success' && 'Redirecting you to your account...'}
            {status === 'error' && error}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === 'verifying' && (
            <Spinner className="h-8 w-8 text-primary" />
          )}

          {status === 'success' && (
            <div className="text-green-500 text-5xl">✓</div>
          )}

          {status === 'error' && (
            <>
              <div className="text-red-500 text-5xl">✗</div>
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button
                onClick={() => navigate('/')}
                className="w-full cursor-pointer"
              >
                Request a new link
              </Button>
            </>
          )}
        </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block relative bg-muted">
        <img
          src="/heatplex.jpg"
          alt="Heat Plex"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
