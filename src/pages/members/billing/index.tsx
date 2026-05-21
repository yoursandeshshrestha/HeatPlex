/**
 * Member Billing Page
 * FR-8.x: Current plan, payment history, mandate update, cancellation
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMember } from '@/contexts/AuthContext';
import { getMemberPayments, getMemberMandate, getMemberSubscription } from '@/lib/supabase/queries';
import { format } from 'date-fns';
import { formatDate } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import {
  CreditCard,
  Calendar,
  Download,
  AlertCircle,
  Settings,
  XCircle,
  Receipt,
} from 'lucide-react';
import { SectionPanel, PanelEmpty, BenefitsList } from '../components/member-ui';
import type { Tables } from '@/lib/supabase';

type Payment = Tables<'payments'>;
type Mandate = Tables<'mandates'>;
type Subscription = Tables<'subscriptions'>;

interface BillingData {
  payments: Payment[];
  mandate: Mandate | null;
  subscription: Subscription | null;
}

export function BillingPage() {
  const member = useMember();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!member) return;
    loadBillingData();
  }, [member]);

  async function loadBillingData() {
    if (!member) return;

    try {
      setLoading(true);
      setError(null);

      const [payments, mandate, subscription] = await Promise.all([
        getMemberPayments(member.id, 12), // Last 12 payments
        getMemberMandate(member.id),
        getMemberSubscription(member.id),
      ]);

      setBillingData({
        payments,
        mandate,
        subscription,
      });
    } catch (err) {
      console.error('Error loading billing data:', err);
      setError('Failed to load billing information. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePaymentMethod() {
    // TODO: Implement GoCardless mandate update redirect
    // FR-8.3: Redirect to GoCardless hosted mandate-update flow
    alert('Payment method update will be implemented with GoCardless integration');
  }

  function handleSwitchPlan() {
    // FR-8.4: v1 uses mailto link
    const subject = `Plan switch request — Member ID ${member?.id}`;
    const body = `Hello,\n\nI would like to switch my membership plan.\n\nCurrent plan: ${member?.plan}\n\nMember ID: ${member?.id}\nName: ${member?.first_name} ${member?.last_name}\nEmail: ${member?.email}\n\nPlease contact me to discuss switching plans.\n\nThank you.`;

    window.location.href = `mailto:contact@heatplex.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function handleCancelMembership() {
    // FR-8.5: Navigate to cancellation flow
    navigate('/member/cancel');
  }

  if (!member) return null;

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground mt-1">
            Manage your plan and payment information
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Spinner className="size-8" />
        </div>
      </div>
    );
  }

  if (error || !billingData) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground mt-1">
            Manage your plan and payment information
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Failed to load billing data'}</AlertDescription>
        </Alert>
        <Button onClick={loadBillingData} className="mt-4 cursor-pointer">
          Try Again
        </Button>
      </div>
    );
  }

  const { payments, mandate, subscription } = billingData;
  const showDunningBanner = ['payment_overdue', 'suspended'].includes(member.status);
  const nextChargeDate = subscription?.start_date || member.renewal_date;
  const planPrice = member.plan === 'annual' ? '£199' : '£19.99';
  const planInterval = member.plan === 'annual' ? 'year' : 'month';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Manage your plan and payment information
        </p>
      </div>

      <div className="space-y-8">
        {/* FR-8.7: Dunning state banner */}
        {showDunningBanner && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {member.status === 'payment_overdue' && (
                <>Your payment is overdue. Please update your bank details to keep your membership active.</>
              )}
              {member.status === 'suspended' && (
                <>Your membership is suspended due to payment failure. Update your bank details to reactivate.</>
              )}
            </AlertDescription>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 cursor-pointer"
              onClick={handleUpdatePaymentMethod}
            >
              Update Bank Details
            </Button>
          </Alert>
        )}

        {/* FR-8.1: Current plan */}
        <SectionPanel
          title="Your Plan"
          icon={CreditCard}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwitchPlan}
              className="h-7 cursor-pointer px-2.5 text-xs"
            >
              Switch Plan
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-base px-3 py-1 capitalize">
                {member.plan}
              </Badge>
              <span className="text-2xl font-bold">
                {planPrice}/{planInterval}
              </span>
            </div>
            <BenefitsList />
          </div>
        </SectionPanel>

        {/* FR-8.2: Next charge information */}
        <SectionPanel title="Next Payment" icon={Calendar}>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Amount
                </p>
                <p className="mt-1.5 text-sm font-medium">{planPrice}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Due Date
                </p>
                <p className="mt-1.5 text-sm font-medium">
                  {nextChargeDate ? formatDate(nextChargeDate) : 'TBD'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Payment Method
                </p>
                <p className="mt-1.5 text-sm font-medium">
                  Direct Debit
                  {mandate?.reference && ` (${mandate.reference.slice(-4)})`}
                </p>
              </div>
              {member.plan === 'annual' && (
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Auto-renewal
                  </p>
                  <p className="mt-1.5 text-sm font-medium">
                    {member.auto_renewal ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              )}
            </div>
            <div className="border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUpdatePaymentMethod}
                className="cursor-pointer"
              >
                <Settings className="h-4 w-4 mr-2" />
                Update Payment Method
              </Button>
            </div>
          </div>
        </SectionPanel>

        {/* FR-8.6: Payment history */}
        <SectionPanel title="Payment History" icon={Receipt} flushList>
          {payments.length === 0 ? (
            <PanelEmpty
              flush
              message="No payment history yet"
              hint="Your payment transactions will appear here"
            />
          ) : (
            <div className="divide-y divide-border">
              {payments.map((payment) => (
                <PaymentRow key={payment.id} payment={payment} />
              ))}
            </div>
          )}
        </SectionPanel>

        {/* FR-8.5: Cancel membership */}
        <SectionPanel title="Manage Membership" icon={XCircle}>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You can cancel your membership at any time. You'll retain access until the end of your billing period.
            </p>
            <Button
              variant="outline"
              onClick={handleCancelMembership}
              className="cursor-pointer text-red-400"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Membership
            </Button>
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}

function PaymentRow({ payment }: { payment: Payment }) {
  const statusColors = {
    confirmed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    submitted: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    failed: 'bg-red-500/15 text-red-400 border-red-500/25',
    charged_back: 'bg-red-500/15 text-red-400 border-red-500/25',
    refunded: 'bg-muted text-muted-foreground border-border',
  } as const;

  const statusLabels = {
    confirmed: 'Paid',
    pending: 'Pending',
    submitted: 'Processing',
    failed: 'Failed',
    charged_back: 'Charged Back',
    refunded: 'Refunded',
  };

  const displayDate = payment.charge_date || payment.created_at || new Date().toISOString();

  return (
    <div className="flex items-center justify-between py-4 px-6 hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">
              £{(payment.amount_pence / 100).toFixed(2)}
            </span>
            <Badge variant="outline" className={statusColors[payment.status as keyof typeof statusColors]}>
              {statusLabels[payment.status as keyof typeof statusLabels] || payment.status}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {format(new Date(displayDate), 'dd MMM yyyy')}
            {' • '}
            <span className="capitalize">
              {payment.type.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>
      {payment.status === 'confirmed' && (
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer"
          onClick={() => {
            // TODO: Implement receipt download
            alert('Receipt download will be implemented');
          }}
        >
          <Download className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
