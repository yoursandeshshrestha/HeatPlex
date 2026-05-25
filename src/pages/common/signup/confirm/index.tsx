/**
 * Signup Step 4b: Confirm payment
 * GoCardless Billing Request Flow return URL — verifies payment server-side, then continues to welcome.
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SignupLayout } from '../components/SignupLayout';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import {
  clearPendingSignup,
  isBillingRequestReturn,
  parseGoCardlessReturn,
  peekPendingSignup,
  type MemberWithGoCardless,
} from '@/lib/signup/pending-signup';

type ConfirmedMember = {
  email: string;
  firstName: string;
  plan: string;
};

export function SignupConfirmPage() {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;
    handleConfirmation();
  }, []);

  async function afterPaymentSuccess(member: ConfirmedMember) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user.email) {
      await refreshSession();
      navigate('/member?payment=complete', { replace: true });
      return;
    }

    const doneParams = new URLSearchParams({
      email: member.email,
      firstName: member.firstName || '',
      plan: member.plan || 'annual',
    });
    navigate(`/join/done?${doneParams.toString()}`);
  }

  async function sendWelcomeEmail(member: ConfirmedMember) {
    try {
      await supabase.functions.invoke('send-email', {
        body: {
          type: 'welcome',
          to: member.email,
          data: {
            firstName: member.firstName || '',
            plan: member.plan || 'annual',
            dashboardUrl: `${window.location.origin}/member`,
          },
        },
      });
    } catch (emailErr) {
      console.error('Welcome email error:', emailErr);
    }
  }

  async function completeSignup(
    billingRequestId: string,
    memberId?: string
  ): Promise<ConfirmedMember | null> {
    const { data, error: invokeError } = await supabase.functions.invoke(
      'complete-signup',
      {
        body: memberId
          ? { billingRequestId, memberId }
          : { billingRequestId },
      }
    );

    if (invokeError) {
      throw new Error(invokeError.message || 'Failed to confirm payment');
    }

    if (data?.cancelled) {
      clearPendingSignup();
      navigate('/join/plan');
      return null;
    }

    if (data?.success && data.member) {
      return {
        email: data.member.email,
        firstName: data.member.firstName,
        plan: data.member.plan,
      };
    }

    if (data?.pending) {
      throw new Error(
        'Payment is still processing. Please wait a moment and refresh this page.'
      );
    }

    throw new Error(data?.error || 'Failed to confirm payment');
  }

  async function resolveMemberFromSession(): Promise<MemberWithGoCardless | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user.email) return null;

    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('email', session.user.email)
      .maybeSingle();

    return data as MemberWithGoCardless | null;
  }

  async function handleConfirmation() {
    const { cancelled, billingRequestId, billingRequestFlowId } =
      parseGoCardlessReturn(searchParams);

    if (cancelled) {
      clearPendingSignup();
      navigate('/join/plan');
      return;
    }

    const pending = peekPendingSignup();
    let returnBillingRequestId =
      billingRequestId ?? pending?.billingRequestId ?? null;

    const hasGoCardlessReturn = isBillingRequestReturn(
      returnBillingRequestId,
      billingRequestFlowId
    );

    // Fast path: normal redirect from GoCardless — verify immediately, no extra DB round-trip
    if (hasGoCardlessReturn && returnBillingRequestId) {
      try {
        const member = await completeSignup(
          returnBillingRequestId,
          pending?.memberId
        );
        if (!member) return;

        clearPendingSignup();
        await afterPaymentSuccess(member);
        void sendWelcomeEmail(member);
        return;
      } catch (err) {
        console.error('Confirmation error:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to complete signup. Please contact support.'
        );
        return;
      }
    }

    const sessionMember = await resolveMemberFromSession();

    if (!returnBillingRequestId && sessionMember?.gocardless_billing_request_id) {
      returnBillingRequestId = sessionMember.gocardless_billing_request_id;
    }

    if (sessionMember?.status === 'active') {
      clearPendingSignup();
      await afterPaymentSuccess({
        email: sessionMember.email,
        firstName: sessionMember.first_name,
        plan: sessionMember.plan,
      });
      return;
    }

    const hasReturn =
      hasGoCardlessReturn || Boolean(pending) || Boolean(returnBillingRequestId);

    if (!hasReturn) {
      setError('missing_return');
      return;
    }

    if (!returnBillingRequestId) {
      setError('We could not match this payment to your signup. Please contact support.');
      return;
    }

    try {
      const member = await completeSignup(
        returnBillingRequestId,
        pending?.memberId ?? sessionMember?.id
      );
      if (!member) return;

      clearPendingSignup();
      await afterPaymentSuccess(member);
      void sendWelcomeEmail(member);
    } catch (err) {
      console.error('Confirmation error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to complete signup. Please contact support.'
      );
    }
  }

  if (error === 'missing_return') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md space-y-4 text-center">
          <Alert>
            <AlertDescription>
              This page completes your signup after GoCardless redirects you here. If you
              already finished payment, open the link from your browser history or log in to
              your dashboard.
            </AlertDescription>
          </Alert>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link to="/member">Go to dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/member/complete-payment">Complete payment</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button variant="outline" asChild className="w-full">
            <Link to="/member/complete-payment">Try payment again</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SignupLayout
      step="Confirming payment"
      currentStep={3}
      totalSteps={3}
      leftContent={
        <>
          <h2 className="text-2xl font-semibold tracking-tight">
            Almost there
          </h2>
          <p className="text-muted-foreground">
            We are confirming your Direct Debit setup with GoCardless.
          </p>
        </>
      }
    >
      <LoadingScreen message="Confirming your payment..." />
    </SignupLayout>
  );
}
