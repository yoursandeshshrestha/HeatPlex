/**
 * Overview Tab
 * Shows membership status, quick stats, and recent activity
 */

import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Tables } from '@/lib/supabase';
import { formatDate } from '@/lib/date-utils';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Phone,
  Wrench,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DetailGrid,
  PanelEmpty,
  SectionPanel,
  StatPanel,
  memberStatusColors,
  SUPPORT_PHONE,
} from './member-ui';

type Member = Tables<'members'>;

interface OverviewTabProps {
  member: Member;
}

type QuickActionStyle = {
  fill: string;
  icon: string;
};

type QuickAction = {
  label: string;
  description: string;
  icon: LucideIcon;
  style: QuickActionStyle;
} & ({ path: string } | { href: string });

function QuickActionTile({
  action,
  onNavigate,
}: {
  action: QuickAction;
  onNavigate: (path: string) => void;
}) {
  const Icon = action.icon;

  const handleClick = () => {
    if ('path' in action) onNavigate(action.path);
  };

  const tile = (
    <div
      className={cn(
        'group flex h-full min-h-[128px] w-full cursor-pointer flex-col rounded-xl p-4 transition-all hover:brightness-110',
        action.style.fill
      )}
    >
      <Icon className={cn('size-5', action.style.icon)} strokeWidth={1.75} />
      <div className="mt-3 flex flex-1 flex-col">
        <p className="text-sm font-medium leading-tight text-foreground">{action.label}</p>
        <p className="mt-1 flex-1 text-xs leading-relaxed text-foreground/60">
          {action.description}
        </p>
        <div
          className={cn(
            'mt-3 flex items-center gap-1 text-xs font-medium',
            action.style.icon
          )}
        >
          <span>{'href' in action ? 'Call now' : 'Open'}</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );

  if ('href' in action) {
    return (
      <a
        href={action.href}
        className="block h-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
      >
        {tile}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="h-full w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      {tile}
    </button>
  );
}

export function OverviewTab({ member }: OverviewTabProps) {
  const navigate = useNavigate();
  const planPrice = member.plan === 'annual' ? '£199/year' : '£19.99/month';
  const savings = ((member.savings_total_pence || 0) / 100).toFixed(2);

  const quickActions: QuickAction[] = [
    {
      label: 'Book Service',
      description: 'Schedule service or request a repair',
      icon: Wrench,
      style: { fill: 'bg-secondary/35', icon: 'text-secondary' },
      path: '/member/services',
    },
    {
      label: 'Membership',
      description: 'Plan, renewal & billing',
      icon: CreditCard,
      style: { fill: 'bg-primary/35', icon: 'text-primary' },
      path: '/member/membership',
    },
    {
      label: 'My Profile',
      description: 'Contact details & address',
      icon: User,
      style: { fill: 'bg-sky-400/25', icon: 'text-sky-300' },
      path: '/member/profile',
    },
    {
      label: 'Benefits',
      description: 'Your membership perks',
      icon: Sparkles,
      style: { fill: 'bg-violet-400/25', icon: 'text-violet-300' },
      path: '/member/membership',
    },
    {
      label: 'Support',
      description: 'Mon–Fri, 8am–6pm',
      icon: Phone,
      style: { fill: 'bg-emerald-400/25', icon: 'text-emerald-300' },
      href: `tel:${SUPPORT_PHONE}`,
    },
  ];

  const detailItems = [
    {
      label: 'Plan',
      value: `${member.plan === 'annual' ? 'Annual' : 'Monthly'} · ${planPrice}`,
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
      label: 'Member since',
      value: member.started_at ? formatDate(member.started_at) : 'N/A',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatPanel title="Membership Status" icon={CreditCard}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-2xl font-semibold tracking-tight capitalize">
                {member.status.replace('_', ' ')}
              </p>
              <Badge
                className={cn(
                  'mt-2 capitalize',
                  memberStatusColors[member.status] || memberStatusColors.pending
                )}
              >
                {member.plan}
              </Badge>
            </div>
          </div>
        </StatPanel>

        <StatPanel title="Total Savings" icon={CheckCircle2}>
          <p className="text-2xl font-semibold tracking-tight text-primary">£{savings}</p>
          <p className="mt-1.5 text-xs text-muted-foreground">From member discounts</p>
        </StatPanel>

        <StatPanel title="Upcoming Bookings" icon={Calendar}>
          <p className="text-2xl font-semibold tracking-tight">0</p>
          <p className="mt-1.5 text-xs text-muted-foreground">Service appointments</p>
        </StatPanel>

        <StatPanel title="Member Since" icon={Calendar}>
          <p className="text-2xl font-semibold tracking-tight">
            {member.started_at ? formatDate(member.started_at) : 'N/A'}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">Membership start date</p>
        </StatPanel>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {quickActions.map((action) => (
            <QuickActionTile key={action.label} action={action} onNavigate={navigate} />
          ))}
        </div>
      </div>

      <SectionPanel title="Membership Details">
        <DetailGrid items={detailItems} />
      </SectionPanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionPanel title="Upcoming Bookings" flushList>
          <PanelEmpty
            flush
            message="No upcoming bookings"
            hint="Book a service from the Services page"
          />
        </SectionPanel>

        <SectionPanel title="Recent Activity" flushList>
          <PanelEmpty
            flush
            message="No recent activity"
            hint="Your service history and savings will appear here"
          />
        </SectionPanel>
      </div>
    </div>
  );
}
