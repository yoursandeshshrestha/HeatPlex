/**
 * Complete payment for staff-created or resumed pending members.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMember } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { CreditCard, Lock, Shield } from 'lucide-react';
import { startMemberPayment } from '@/lib/members/start-member-payment';
import { savePendingSignup } from '@/lib/signup/pending-signup';

export function CompletePaymentPage() {
  const member = useMember();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (member?.status === 'active') {
      navigate('/member', { replace: true });
    }
  }, [member?.status, navigate]);

  if (!member) {
    return <LoadingScreen message="Loading your account..." />;
  }

  if (member.status === 'active') {
    return <LoadingScreen message="Redirecting to your dashboard..." />;
  }

  if (member.status !== 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md space-y-4 text-center">
          <Alert>
            <AlertDescription>
              Your membership status is &quot;{member.status.replace('_', ' ')}&quot;. Please
              contact support if you need help with payment.
            </AlertDescription>
          </Alert>
          <LogoutButton variant="outline" className="w-full" />
        </div>
      </div>
    );
  }

  const pendingMember = member;
  const isAnnual = pendingMember.plan === 'annual';
  const amount = isAnnual ? '£199' : '£19.99/month';
  const planLabel = isAnnual ? 'Annual Membership' : 'Monthly Membership';

  async function handleProceedToPayment() {
    setLoading(true);
    setError(null);

    try {
      const redirectUri = `${window.location.origin}/join/confirm`;
      const { memberId, billingRequestId, authorizationUrl } =
        await startMemberPayment(redirectUri);

      savePendingSignup({
        memberId,
        email: pendingMember.email,
        firstName: pendingMember.first_name,
        plan: pendingMember.plan,
        billingRequestId,
      });

      window.location.href = authorizationUrl;
    } catch (err) {
      console.error('Payment start error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start payment');
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingScreen message="Redirecting to your bank..." />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <img src="/heatplex-logo.png" alt="Heat Plex" className="h-8" />
        <LogoutButton variant="ghost" size="sm" />
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-8">
          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-2xl font-semibold tracking-tight">
              Complete your membership
            </h1>
            <p className="text-muted-foreground">
              Hi {pendingMember.first_name}, set up Direct Debit to activate your Heat Plex membership.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Payment summary</h2>
              <p className="text-sm text-muted-foreground">{planLabel}</p>
            </div>

            <div className="flex items-center justify-between text-lg">
              <span className="font-medium">{isAnnual ? 'Due today' : 'First payment'}</span>
              <span className="text-2xl font-bold">{amount}</span>
            </div>

            {!isAnnual && (
              <p className="text-sm text-muted-foreground">
                12-month minimum commitment · £239.88 total in year one
              </p>
            )}

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-start gap-2">
                <CreditCard className="size-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  You&apos;ll be redirected to GoCardless to set up your Direct Debit mandate.
                  {isAnnual && ' Your £199 payment is collected via Instant Bank Pay.'}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="size-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Protected by the Direct Debit Guarantee
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="size-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Secure bank-level encryption — we never see your bank details
                </p>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleProceedToPayment}
              disabled={loading}
              className="w-full cursor-pointer"
              size="lg"
            >
              {loading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Starting payment...
                </>
              ) : (
                'Set up Direct Debit →'
              )}
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Questions? Call{' '}
            <a href="tel:02076220444" className="text-primary hover:underline">
              020 7622 0444
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
