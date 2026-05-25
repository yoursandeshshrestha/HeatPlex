/**
 * Membership Tab
 * Plan, billing, and membership management
 */

import { Link } from 'react-router-dom';
import type { Tables } from '@/lib/supabase';
import { formatDate } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BenefitsList,
  DetailGrid,
  PanelEmpty,
  SectionPanel,
  memberStatusColors,
} from './member-ui';

type Member = Tables<'members'>;

interface MembershipTabProps {
  member: Member;
}

export function MembershipTab({ member }: MembershipTabProps) {
  const planPrice = member.plan === 'annual' ? '£199/year' : '£19.99/month';
  const planLabel = member.plan === 'annual' ? 'Annual' : 'Monthly';

  const detailItems = [
    {
      label: 'Plan',
      value: `${planLabel} · ${planPrice}`,
    },
    {
      label: 'Next renewal',
      value: member.renewal_date ? formatDate(member.renewal_date) : 'N/A',
    },
    {
      label: 'Auto-renewal',
      value: member.auto_renewal ? 'Enabled' : 'Disabled',
    },
    {
      label: 'Started',
      value: member.started_at ? formatDate(member.started_at) : 'N/A',
    },
    ...(member.promo_code
      ? [{ label: 'Promo code', value: member.promo_code }]
      : []),
  ];

  return (
    <div className="space-y-8">
      <SectionPanel title="Membership Details">
        <div className="mb-4">
          <Badge className={cn('capitalize', memberStatusColors[member.status] || memberStatusColors.pending)}>
            {member.status.replace('_', ' ')}
          </Badge>
        </div>
        <DetailGrid items={detailItems} />

        {member.status === 'active' && member.renewal_date && (
          <p className="mt-4 text-sm text-muted-foreground">
            {member.auto_renewal
              ? `Your payment method will be charged ${planPrice} on ${formatDate(member.renewal_date)}.`
              : `Your membership will expire on ${formatDate(member.renewal_date)} unless renewed.`}
          </p>
        )}

        {member.status === 'pending' && (
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-2 text-sm text-amber-400">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>Your membership is pending payment confirmation.</span>
            </div>
            <Button asChild className="cursor-pointer">
              <Link to="/member/complete-payment">Complete payment setup →</Link>
            </Button>
          </div>
        )}

        {member.status === 'payment_overdue' && (
          <div className="mt-4 flex items-start gap-2 text-sm text-red-400">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>Your payment is overdue. Please update your payment method.</span>
          </div>
        )}
      </SectionPanel>

      <SectionPanel title="Your Plan Includes">
        <BenefitsList />
      </SectionPanel>

      <SectionPanel title="Payment Method">
        <p className="text-sm text-muted-foreground">Direct Debit via GoCardless</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Protected by the Direct Debit Guarantee
        </p>
        <Button
          variant="outline"
          size="sm"
          disabled
          className="mt-4 cursor-not-allowed"
        >
          Manage payment method (coming soon)
        </Button>
      </SectionPanel>

      <SectionPanel title="Payment History" flushList>
        <PanelEmpty
          flush
          message="No payment history yet"
          hint="Your payment transactions will appear here"
        />
      </SectionPanel>

      {member.status === 'active' && (
        <SectionPanel title="Manage Membership">
          <div className="space-y-4">
            <div>
              <Button variant="outline" disabled className="w-full cursor-not-allowed sm:w-auto">
                Change plan (coming soon)
              </Button>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Switch between annual and monthly plans
              </p>
            </div>
            <div className="border-t border-border pt-4">
              <Button
                variant="outline"
                disabled
                className="w-full cursor-not-allowed text-red-400 sm:w-auto"
              >
                Cancel membership (coming soon)
              </Button>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Cancel your membership at any time
              </p>
            </div>
          </div>
        </SectionPanel>
      )}
    </div>
  );
}
