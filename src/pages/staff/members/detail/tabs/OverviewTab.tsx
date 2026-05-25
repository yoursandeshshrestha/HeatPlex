/**
 * Member Overview Tab
 * Key information and quick stats about the member
 */

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { Tables } from '@/lib/supabase';
import { formatDate } from '@/lib/date-utils';
import { ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { asMemberWithBilling } from '../types';
import {
  DetailGrid,
  DetailSection,
  DetailStat,
} from '../components/detail-ui';

type Member = Tables<'members'>;

interface MemberOverviewTabProps {
  member: Member;
  onUpdate: () => void;
}

export function MemberOverviewTab({ member }: MemberOverviewTabProps) {
  const [technicalOpen, setTechnicalOpen] = useState(false);
  const billing = asMemberWithBilling(member);
  const savingsTotal = (member.savings_total_pence || 0) / 100;
  const planPrice = member.plan === 'annual' ? '£199/year' : '£19.99/month';
  const annualCost = member.plan === 'annual' ? 199 : 240;
  const roi = annualCost > 0 ? `${((savingsTotal / annualCost) * 100).toFixed(0)}%` : '—';

  const hasAttribution =
    member.promo_code || member.engineer_credit_id || member.signup_ip;

  const contactItems = [
    {
      label: 'Email',
      value: (
        <a href={`mailto:${member.email}`} className="cursor-pointer hover:underline">
          {member.email}
        </a>
      ),
    },
    ...(member.phone
      ? [
          {
            label: 'Phone',
            value: (
              <a href={`tel:${member.phone}`} className="cursor-pointer hover:underline">
                {member.phone}
              </a>
            ),
          },
        ]
      : []),
    {
      label: 'Service address',
      value: (
        <>
          {member.address_line_1}
          {member.address_line_2 && <>, {member.address_line_2}</>}
          <br />
          {member.address_town}, {member.address_postcode}
        </>
      ),
    },
  ];

  const membershipItems = [
    {
      label: 'Plan',
      value: (
        <span className="capitalize">
          {member.plan} · {planPrice}
        </span>
      ),
    },
    {
      label: 'Status',
      value: <span className="capitalize">{member.status.replace(/_/g, ' ')}</span>,
    },
    {
      label: 'Member since',
      value: member.started_at ? formatDate(member.started_at) : '—',
    },
    {
      label: 'Next renewal',
      value: member.renewal_date ? (
        <>
          {format(new Date(member.renewal_date), 'PPP')}
          <span className="mt-1 block text-xs font-normal text-muted-foreground">
            Auto-renewal {member.auto_renewal ? 'enabled' : 'disabled'}
          </span>
        </>
      ) : (
        '—'
      ),
    },
    ...(member.cancellation_requested_at
      ? [
          {
            label: 'Cancellation',
            value: (
              <>
                Requested {formatDate(member.cancellation_requested_at)}
                {member.effective_end_date && (
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    Effective {format(new Date(member.effective_end_date), 'PPP')}
                  </span>
                )}
              </>
            ),
          },
        ]
      : []),
  ];

  const attributionItems = [
    ...(member.promo_code
      ? [{ label: 'Promo code', value: <span className="font-mono text-xs">{member.promo_code}</span> }]
      : []),
    ...(member.engineer_credit_id
      ? [{ label: 'Attributed engineer', value: member.engineer_credit_id }]
      : []),
    {
      label: 'Marketing emails',
      value: (
        <>
          <Badge variant="outline" className="font-normal">
            {member.marketing_email_opt_in ? 'Opted in' : 'Opted out'}
          </Badge>
          {member.marketing_consent_at && (
            <span className="mt-1 block text-xs font-normal text-muted-foreground">
              Since {formatDate(member.marketing_consent_at)}
            </span>
          )}
        </>
      ),
    },
    ...(member.signup_ip
      ? [{ label: 'Signup IP', value: <span className="font-mono text-xs">{member.signup_ip}</span> }]
      : []),
  ];

  const technicalItems = [
    { label: 'Member ID', value: <span className="font-mono text-xs">{member.id}</span> },
    ...(member.created_at
      ? [{ label: 'Created', value: formatDate(member.created_at) }]
      : []),
    ...(member.updated_at
      ? [{ label: 'Last updated', value: formatDate(member.updated_at) }]
      : []),
    ...(member.terms_accepted_at
      ? [{ label: 'Terms accepted', value: formatDate(member.terms_accepted_at) }]
      : []),
    ...(billing.gocardless_mandate_id
      ? [{ label: 'Mandate ID', value: <span className="font-mono text-xs">{billing.gocardless_mandate_id}</span> }]
      : []),
    ...(billing.gocardless_subscription_id
      ? [{ label: 'Subscription ID', value: <span className="font-mono text-xs">{billing.gocardless_subscription_id}</span> }]
      : []),
    ...(billing.gocardless_payment_id
      ? [{ label: 'Payment ID', value: <span className="font-mono text-xs">{billing.gocardless_payment_id}</span> }]
      : []),
    ...(billing.gocardless_billing_request_id
      ? [{ label: 'Billing request ID', value: <span className="font-mono text-xs">{billing.gocardless_billing_request_id}</span> }]
      : []),
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <DetailStat
          label="Total savings"
          value={`£${savingsTotal.toFixed(2)}`}
          hint="Accumulated since joining"
        />
        <DetailStat label="ROI" value={roi} hint={`Against £${annualCost}/yr plan cost`} />
        <DetailStat
          label="Plan"
          value={<span className="capitalize">{member.plan}</span>}
          hint={planPrice}
        />
      </div>

      <DetailSection title="Contact">
        <DetailGrid items={contactItems} />
      </DetailSection>

      <DetailSection title="Membership">
        <DetailGrid items={membershipItems} />
      </DetailSection>

      {hasAttribution && (
        <DetailSection title="Attribution">
          <DetailGrid items={attributionItems} />
        </DetailSection>
      )}

      <Collapsible open={technicalOpen} onOpenChange={setTechnicalOpen}>
        <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between rounded-lg px-1 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
          Technical details
          <ChevronDown
            className={cn('size-4 transition-transform', technicalOpen && 'rotate-180')}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <DetailSection title="System & integrations">
            <DetailGrid items={technicalItems} />
          </DetailSection>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
