/**
 * Login Page - Magic Link Sign In
 * Member enters email, we send them a magic link
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/account', { replace: true });
    }
  }, [user, authLoading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // DEV MODE: Sign in with password (no email sent)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: 'password123',
      });

      if (signInError) {
        setError('Invalid email or password. Check that the user exists in the database.');
        setLoading(false);
        return;
      }

      // Success - redirect to auto-redirect route
      window.location.href = '/account';
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const maskedEmail = email
    ? email.replace(/(.{1})(.*)(@.*)/, '$1***$3')
    : '';

  // Show loading while checking auth
  if (authLoading) {
    return <LoadingScreen />;
  }

  if (sent) {
    return (
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left side - Form */}
        <div className="flex flex-col p-8">
          {/* Logo */}
          <div className="mb-8">
            <img src="/heatplex-logo.png" alt="Heat Plex" className="h-10" />
          </div>

          <div className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-md border-0 shadow-none">
              <CardHeader>
                <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We've sent a login link to {maskedEmail}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Your login link expires in 15 minutes.
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              onClick={() => setSent(false)}
              className="w-full cursor-pointer"
            >
              Send another link
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>New here?</p>
              <a href="/join/plan" className="text-primary hover:underline cursor-pointer">
                Join Heat Plex Membership →
              </a>
            </div>
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

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex flex-col p-8">
        {/* Logo */}
        <div className="mb-8">
          <img src="/heatplex-logo.png" alt="Heat Plex" className="h-10" />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md border-0 shadow-none">
            <CardHeader className="text-center">
              <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a one-tap login link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="cursor-pointer"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={loading || !email}
            >
              {loading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Sending...
                </>
              ) : (
                'Send login link'
              )}
            </Button>
          </form>

          <div className="mt-6 border-t pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>New here?</strong> Heat Plex Membership covers your annual service + 20% off all works.
              </p>
              <Button
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() => (window.location.href = '/join/plan')}
              >
                Join now from £199/year →
              </Button>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-4 text-sm text-muted-foreground">
            <a href="https://heatplex.com/membership" className="hover:underline cursor-pointer">
              What's included?
            </a>
            <span>·</span>
            <a href="mailto:contact@heatplex.com" className="hover:underline cursor-pointer">
              Contact us
            </a>
          </div>
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
