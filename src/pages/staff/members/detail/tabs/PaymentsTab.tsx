/**
 * Member Payments Tab
 * View payment history and GoCardless integration details
 */

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase';
import { formatDate } from '@/lib/date-utils';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { asMemberWithBilling } from '../types';
import {
  DetailEmpty,
  DetailGrid,
  DetailLoading,
  DetailSection,
  DetailStat,
} from '../components/detail-ui';

type Payment = Tables<'payments'>;
type Member = Tables<'members'>;

interface MemberPaymentsTabProps {
  memberId: string;
  member: Member;
}

const statusStyles: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'border-amber-500/30 text-amber-700 dark:text-amber-400' },
  submitted: { label: 'Submitted', className: 'border-blue-500/30 text-blue-700 dark:text-blue-400' },
  confirmed: { label: 'Confirmed', className: 'border-emerald-500/30 text-emerald-700 dark:text-emerald-400' },
  failed: { label: 'Failed', className: 'border-red-500/30 text-red-700 dark:text-red-400' },
  charged_back: { label: 'Charged back', className: 'border-red-500/30 text-red-700 dark:text-red-400' },
  refunded: { label: 'Refunded', className: 'border-border text-muted-foreground' },
};

const typeLabels: Record<string, string> = {
  signup_annual: 'Annual signup',
  renewal: 'Renewal',
  monthly_instalment: 'Monthly instalment',
  refund: 'Refund',
  manual_charge: 'Manual charge',
};

export function MemberPaymentsTab({ memberId, member }: MemberPaymentsTabProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, [memberId]);

  async function loadPayments() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPayments(data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalPaid = payments
    .filter((p) => p.status === 'confirmed')
    .reduce((sum, p) => sum + (p.amount_pence || 0), 0);

  const failedPayments = payments.filter((p) => p.status === 'failed').length;

  if (loading) {
    return <DetailLoading />;
  }

  const billing = asMemberWithBilling(member);

  const gocardlessItems = [
    ...(billing.gocardless_mandate_id
      ? [{ label: 'Mandate ID', value: <span className="font-mono text-xs">{billing.gocardless_mandate_id}</span> }]
      : []),
    ...(billing.gocardless_subscription_id
      ? [{ label: 'Subscription ID', value: <span className="font-mono text-xs">{billing.gocardless_subscription_id}</span> }]
      : []),
    ...(billing.gocardless_billing_request_id
      ? [{ label: 'Billing request ID', value: <span className="font-mono text-xs">{billing.gocardless_billing_request_id}</span> }]
      : []),
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <DetailStat label="Total paid" value={`£${(totalPaid / 100).toFixed(2)}`} />
        <DetailStat label="Payments" value={payments.length} />
        <DetailStat
          label="Failed"
          value={failedPayments}
          hint={failedPayments > 0 ? 'Requires attention' : 'No failed payments'}
        />
      </div>

      {gocardlessItems.length > 0 && (
        <DetailSection title="GoCardless">
          <DetailGrid items={gocardlessItems} />
        </DetailSection>
      )}

      <DetailSection
        title={`Payment history (${payments.length})`}
        flushList
        action={
          payments.length > 0 ? (
            <Button size="sm" variant="ghost" className="h-7 cursor-pointer px-2 text-xs">
              <Download className="mr-1.5 size-3.5" />
              Export
            </Button>
          ) : undefined
        }
      >
        {payments.length === 0 ? (
          <DetailEmpty
            message="No payments yet"
            hint="Payment history will appear after the first charge."
          />
        ) : (
          <ul className="divide-y divide-border">
            {payments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </ul>
        )}
      </DetailSection>
    </div>
  );
}

function PaymentRow({ payment }: { payment: Payment }) {
  const status = statusStyles[payment.status] || {
    label: payment.status,
    className: 'border-border text-muted-foreground',
  };

  const amount = Math.abs(payment.amount_pence || 0) / 100;
  const isNegative = (payment.amount_pence || 0) < 0;

  return (
    <li className="flex items-start justify-between gap-4 px-6 py-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium">
            {isNegative ? '-' : ''}£{amount.toFixed(2)}
          </p>
          <Badge variant="outline" className="text-[11px] font-normal">
            {typeLabels[payment.type] || payment.type}
          </Badge>
          <Badge variant="outline" className={cn('text-[11px] font-normal', status.className)}>
            {status.label}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {payment.charge_date && <>Charge {format(new Date(payment.charge_date), 'PP')}</>}
          {payment.confirmed_at && <> · Confirmed {formatDate(payment.confirmed_at)}</>}
          {payment.gocardless_payment_id && (
            <> · <span className="font-mono">{payment.gocardless_payment_id}</span></>
          )}
        </p>
        {payment.failure_reason && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{payment.failure_reason}</p>
        )}
      </div>
      <p className="shrink-0 text-xs text-muted-foreground">{formatDate(payment.created_at)}</p>
    </li>
  );
}
