/**
 * Login Page - Magic Link Sign In
 * Member enters email, we send them a magic link
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const DEV_ACCOUNTS = {
  staff: [
    { email: 'joe@heatplex.com', label: 'Joe (Owner)', role: 'Owner' },
    { email: 'miles@heatplex.com', label: 'Miles (Admin)', role: 'Admin' },
    { email: 'jackie@heatplex.com', label: 'Jackie (Staff)', role: 'Staff' },
  ],
  members: [
    { email: 'alice@heatplex.test', label: 'Alice (Member)', role: 'Member' },
    { email: 'bob@heatplex.test', label: 'Bob (Member)', role: 'Member' },
    { email: 'charlie@heatplex.test', label: 'Charlie (Member)', role: 'Member' },
  ],
};

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

  async function handleDevLogin(devEmail: string) {
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: devEmail.toLowerCase(),
        password: 'password123',
      });

      if (signInError) {
        setError('Dev login failed. Check that the user exists in the database.');
        setLoading(false);
        return;
      }

      navigate('/account', { replace: true });
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

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

      navigate('/account', { replace: true });
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
            <div className="w-full max-w-md space-y-8">
              <div className="space-y-2 text-center">
                <h1 className="text-3xl font-semibold tracking-tight">Check your email</h1>
                <p className="text-muted-foreground">
                  We've sent a login link to {maskedEmail}
                </p>
              </div>

              <div className="space-y-4">
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

                <div className="text-center text-sm text-muted-foreground space-y-1">
                  <p>New here?</p>
                  <a href="/join/plan" className="text-primary hover:underline cursor-pointer">
                    Join Heat Plex Membership →
                  </a>
                </div>
              </div>
            </div>
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
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
              <p className="text-muted-foreground">
                Enter your email and we'll send you a one-tap login link
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="youremail@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="cursor-text"
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
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            <div className="border-t pt-6 space-y-4">
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  <strong>New here?</strong> Heat Plex Membership covers your annual service + 20% off all works.
                </p>
                <Button variant="outline" className="w-full cursor-pointer" asChild>
                  <Link to="/join/plan">Join now from £199/year →</Link>
                </Button>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="text-xs font-medium text-muted-foreground text-center">DEV LOGIN</div>
              <div className="flex flex-wrap justify-center gap-2">
                {DEV_ACCOUNTS.staff.map((account) => (
                  <Button
                    key={account.email}
                    variant="outline"
                    size="sm"
                    onClick={() => handleDevLogin(account.email)}
                    disabled={loading}
                    className="cursor-pointer"
                  >
                    {account.label}
                  </Button>
                ))}
                {DEV_ACCOUNTS.members.map((account) => (
                  <Button
                    key={account.email}
                    variant="outline"
                    size="sm"
                    onClick={() => handleDevLogin(account.email)}
                    disabled={loading}
                    className="cursor-pointer"
                  >
                    {account.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
              <a href="https://heatplex.com/membership" className="hover:underline cursor-pointer">
                What's included?
              </a>
              <span>·</span>
              <a href="mailto:contact@heatplex.com" className="hover:underline cursor-pointer">
                Contact us
              </a>
            </div>
          </div>
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
