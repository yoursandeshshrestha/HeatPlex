/**
 * Signup Step 4: Payment
 * Redirect to GoCardless for payment processing
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SignupLayout } from '../components/SignupLayout';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { CreditCard, Shield, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { savePendingSignup } from '@/lib/signup/pending-signup';

export function SignupPaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = searchParams.get('plan') || 'annual';
  const isAnnual = plan === 'annual';
  const amount = isAnnual ? '£199' : '£19.99/month';

  async function handleProceedToPayment() {
    setLoading(true);
    setError(null);

    try {
      const marketingOptIn = searchParams.get('marketingOptIn') === 'true';
      const email = searchParams.get('email') || '';
      const firstName = searchParams.get('firstName') || '';
      const lastName = searchParams.get('lastName') || '';

      // 1. Create GoCardless billing request
      const redirectUri = `${window.location.origin}/join/confirm`;

      const { data: signupData, error: signupError } = await supabase.functions.invoke(
        'create-signup',
        {
          body: {
            email: email.toLowerCase(),
            firstName,
            lastName,
            plan,
            redirectUri,
            phone: searchParams.get('phone') || '',
            addressLine1: searchParams.get('addressLine1') || '',
            addressLine2: searchParams.get('addressLine2') || null,
            town: searchParams.get('town') || '',
            postcode: searchParams.get('postcode') || '',
            promoCode: searchParams.get('promoCode') || null,
            marketingOptIn,
          },
        }
      );

      if (signupError) {
        setError(signupError.message || 'Failed to create payment request');
        setLoading(false);
        return;
      }

      const { memberId, billingRequestId, authorizationUrl } = signupData ?? {};
      if (!authorizationUrl) {
        setError(signupData?.error || 'Failed to create payment request');
        setLoading(false);
        return;
      }
      if (!memberId) {
        setError(signupData?.error || 'Failed to create membership');
        setLoading(false);
        return;
      }

      // 2. Create Supabase auth user (for login)
      const { error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password: 'password123', // Dev mode password
        options: {
          emailRedirectTo: window.location.origin + '/account',
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (authError && !authError.message.includes('already registered')) {
        setError(`Sign up failed: ${authError.message}`);
        setLoading(false);
        return;
      }

      savePendingSignup({
        memberId,
        email: email.toLowerCase(),
        firstName,
        plan,
        billingRequestId,
      });

      // 3. Redirect to GoCardless authorization page
      window.location.href = authorizationUrl;
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to create membership: ${errorMessage}`);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <LoadingScreen message="Redirecting to your bank..." />
    );
  }

  return (
    <SignupLayout
      step="Step 3/3. Payment"
      currentStep={3}
      totalSteps={3}
      leftContent={
        <>
          <h2 className="text-2xl font-semibold tracking-tight">
            Complete your membership
          </h2>
          <p className="text-muted-foreground">
            Review your membership details and complete signup.
          </p>
        </>
      }
    >
      <div className="space-y-8">

        {/* Payment Summary */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Payment Summary</h3>
            <p className="text-sm text-muted-foreground">
              {isAnnual ? 'Annual Membership' : 'Monthly Membership'}
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-lg">
              <span className="font-medium">
                {isAnnual ? 'Due today' : 'First payment'}
              </span>
              <span className="text-2xl font-bold">{amount}</span>
            </div>

            {!isAnnual && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• 12-month minimum commitment</p>
                <p>• Payments on the same day each month</p>
                <p>• Total first year: £239.88</p>
              </div>
            )}

            {isAnnual && (
              <div className="text-sm text-muted-foreground">
                <p>One-time payment, covers full year</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Method Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="size-5" />
            <h3 className="text-lg font-semibold">Direct Debit via GoCardless</h3>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You'll be redirected to GoCardless to set up your Direct Debit mandate.
              {isAnnual && ' Your £199 payment will be processed immediately via Instant Bank Pay.'}
            </p>

            <div className="grid gap-3">
              <div className="flex items-start gap-2">
                <Shield className="size-4 text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Protected by Direct Debit Guarantee</p>
                  <p className="text-muted-foreground">Full refund if anything goes wrong</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="size-4 text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Secure bank-level encryption</p>
                  <p className="text-muted-foreground">We never see your bank details</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="cursor-pointer"
          >
            ← Back
          </Button>
          <Button
            onClick={handleProceedToPayment}
            disabled={loading}
            className="cursor-pointer px-8"
          >
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Creating membership...
              </>
            ) : (
              'Complete signup →'
            )}
          </Button>
        </div>
      </div>
    </SignupLayout>
  );
}
