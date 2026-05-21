/**
 * Signup Step 5: Welcome
 * Shown after /join/confirm has verified payment and activated the member.
 */

import { useSearchParams } from 'react-router-dom';
import { SignupLayout } from '../components/SignupLayout';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail, Calendar, FileText } from 'lucide-react';

export function SignupDonePage() {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'annual';
  const firstName = searchParams.get('firstName') || 'there';
  const email = searchParams.get('email') || '';

  const isAnnual = plan === 'annual';
  const amount = isAnnual ? '£199' : '£19.99/month';

  const renewalDate = new Date();
  renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  const renewalDateStr = renewalDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  function handleLoginNow() {
    window.location.href = '/';
  }

  return (
    <SignupLayout
      step="Welcome!"
      leftContent={
        <>
          <h2 className="text-2xl font-semibold tracking-tight">
            You're all set
          </h2>
          <p className="text-muted-foreground">
            Welcome to Heat Plex Membership. Your account is now active.
          </p>
        </>
      }
    >
      <div className="space-y-8">
        <div className="flex justify-center">
          <div className="flex items-center justify-center size-20 rounded-full bg-primary/10">
            <CheckCircle2 className="size-10 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            You're a Heat Plex Member
          </h1>
          <p className="text-muted-foreground">
            Welcome aboard, {firstName}!
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Your Membership</h3>
            <p className="text-sm text-muted-foreground">
              {isAnnual ? 'Annual Plan' : 'Monthly Plan'}
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">{isAnnual ? 'Annual' : 'Monthly'}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">{amount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Renews on</span>
              <span className="font-medium">{renewalDateStr}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">What's next?</h3>

          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
                <Mail className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Check your email</p>
                <p className="text-sm text-muted-foreground">
                  {email
                    ? `We've sent your welcome email to ${email}`
                    : 'Check your inbox for your welcome email'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
                <Calendar className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Book your annual service</p>
                <p className="text-sm text-muted-foreground">
                  Free boiler service + CP12 certificate included
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
                <FileText className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Explore your portal</p>
                <p className="text-sm text-muted-foreground">
                  View savings, certificates, and manage billing
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={handleLoginNow}
            className="cursor-pointer w-full"
            size="lg"
          >
            Log in to your account
          </Button>
          <p className="text-sm text-muted-foreground">
            We'll send you a magic link to access your member portal
          </p>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Questions? Call us on{' '}
            <a href="tel:02076220444" className="text-primary hover:underline cursor-pointer">
              020 7622 0444
            </a>
            {' '}or email{' '}
            <a href="mailto:contact@heatplex.com" className="text-primary hover:underline cursor-pointer">
              contact@heatplex.com
            </a>
          </p>
        </div>
      </div>
    </SignupLayout>
  );
}
