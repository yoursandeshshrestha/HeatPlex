/**
 * Overview Tab
 * Shows membership status, quick stats, and recent activity
 */

import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, parse } from 'date-fns';
import type { Tables } from '@/lib/supabase';
import { formatDate } from '@/lib/date-utils';
import { useUpcomingBookings } from '@/lib/supabase/hooks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { formatSlotLabel, type TimeSlot } from '@/types/booking';
import {
  DetailGrid,
  PanelEmpty,
  SectionPanel,
  StatPanel,
  memberStatusColors,
  SUPPORT_PHONE,
} from './member-ui';

type Member = Tables<'members'>;
type Booking = Tables<'bookings'>;

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

function upcomingBookingsSubtitle(bookings: Booking[]): string {
  if (bookings.length === 0) return 'No appointments scheduled';
  if (bookings.length === 1) {
    const date = parse(bookings[0].scheduled_date, 'yyyy-MM-dd', new Date());
    return `Next: ${format(date, 'EEE d MMM')}`;
  }
  return `${bookings.length} service appointments`;
}

export function OverviewTab({ member }: OverviewTabProps) {
  const navigate = useNavigate();
  const { data, loading: loadingBookings } = useUpcomingBookings(member.id);
  const upcomingBookings = data ?? [];

  const planPrice = member.plan === 'annual' ? '£199/year' : '£19.99/month';
  const savings = ((member.savings_total_pence || 0) / 100).toFixed(2);
  const nextBooking = upcomingBookings[0];

  const quickActions: QuickAction[] = [
    {
      label: 'Book Service',
      description: nextBooking
        ? 'View or manage your upcoming visit'
        : 'Schedule your free annual service',
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
          {loadingBookings ? (
            <p className="text-2xl font-semibold tracking-tight text-muted-foreground">—</p>
          ) : (
            <p className="text-2xl font-semibold tracking-tight">{upcomingBookings.length}</p>
          )}
          <p className="mt-1.5 text-xs text-muted-foreground">
            {loadingBookings ? 'Loading…' : upcomingBookingsSubtitle(upcomingBookings)}
          </p>
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
        <SectionPanel
          title="Upcoming Bookings"
          flushList
          action={
            upcomingBookings.length > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 cursor-pointer px-2 text-xs"
                onClick={() => navigate('/member/services')}
              >
                View all
              </Button>
            ) : undefined
          }
        >
          {loadingBookings ? (
            <div className="flex justify-center px-6 py-10">
              <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : upcomingBookings.length > 0 ? (
            <ul className="-mx-6 divide-y divide-border">
              {upcomingBookings.map((booking) => (
                <OverviewBookingItem key={booking.id} booking={booking} />
              ))}
            </ul>
          ) : (
            <PanelEmpty
              flush
              message="No upcoming bookings"
              hint="Book your free annual service on the Services page"
            />
          )}
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

function OverviewBookingItem({ booking }: { booking: Booking }) {
  const date = parse(booking.scheduled_date, 'yyyy-MM-dd', new Date());
  const slot = booking.slot as TimeSlot;
  const isRescheduled = booking.status === 'rescheduled';

  return (
    <li className="flex items-start justify-between gap-3 px-6 py-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex w-12 shrink-0 flex-col items-center rounded-lg border border-border/80 bg-muted/30 py-1.5">
          <span className="text-[9px] font-semibold uppercase text-muted-foreground">
            {format(date, 'MMM')}
          </span>
          <span className="text-lg font-bold leading-none">{format(date, 'd')}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">Annual boiler service</p>
          <p className="text-xs text-muted-foreground">
            {format(date, 'EEEE, d MMMM yyyy')}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{formatSlotLabel(slot, true)}</p>
        </div>
      </div>
      <Badge
        variant="outline"
        className={cn(
          'shrink-0 capitalize',
          isRescheduled
            ? 'border-amber-500/30 text-amber-700 dark:text-amber-400'
            : 'border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
        )}
      >
        {isRescheduled ? 'Rescheduled' : 'Confirmed'}
      </Badge>
    </li>
  );
}
