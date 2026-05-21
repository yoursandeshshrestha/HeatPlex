/**
 * Confirmed / upcoming booking summary for the member portal
 */

import { useState } from 'react';
import { differenceInCalendarDays, differenceInHours, format, parse } from 'date-fns';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Sun,
  Sunset,
  RefreshCw,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CancelBookingModal } from './CancelBookingModal';
import { cn } from '@/lib/utils';
import { SLOT_DETAILS, type TimeSlot } from '@/types/booking';
import type { Tables } from '@/lib/supabase';

type Booking = Tables<'bookings'>;
type Member = Tables<'members'>;

interface ConfirmedBookingCardProps {
  booking: Booking;
  member: Member;
  supportPhone: string;
  supportPhoneDisplay: string;
  className?: string;
  onReschedule?: () => void;
  onCancelled?: () => void;
}

function formatAddress(member: Member): string {
  const parts = [
    member.address_line_1,
    member.address_line_2,
    `${member.address_town}, ${member.address_postcode}`,
  ].filter(Boolean);
  return parts.join(', ');
}

function daysUntilLabel(date: Date): string | null {
  const days = differenceInCalendarDays(date, new Date());
  if (days < 0) return null;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `In ${days} days`;
  if (days < 14) return 'Next week';
  const weeks = Math.floor(days / 7);
  return `In ${weeks} week${weeks === 1 ? '' : 's'}`;
}

export function ConfirmedBookingCard({
  booking,
  member,
  supportPhone,
  supportPhoneDisplay,
  className,
  onReschedule,
  onCancelled,
}: ConfirmedBookingCardProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);

  const date = parse(booking.scheduled_date, 'yyyy-MM-dd', new Date());
  const slot = booking.slot as TimeSlot;
  const slotInfo = SLOT_DETAILS[slot];
  const SlotIcon = slot === 'AM' ? Sun : Sunset;
  const countdown = daysUntilLabel(date);
  const isRescheduled = booking.status === 'rescheduled';

  const hoursUntil = differenceInHours(date, new Date());
  const withinCancellationWindow = hoursUntil < 48;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">You&apos;re all set</p>
            <p className="text-xs text-muted-foreground">
              Confirmation sent to {member.email}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'shrink-0 capitalize',
            isRescheduled
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
          )}
        >
          {isRescheduled ? 'Rescheduled' : 'Confirmed'}
        </Badge>
      </div>

      {/* Appointment card */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-muted/20">
        <div className="flex gap-0">
          {/* Date block */}
          <div className="flex w-[108px] shrink-0 flex-col items-center justify-center border-r border-border/60 bg-card px-3 py-4 sm:w-[120px]">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {format(date, 'EEE')}
            </span>
            <span className="text-2xl font-bold leading-none tracking-tight">
              {format(date, 'd')}
            </span>
            <span className="mt-0.5 text-xs font-medium text-muted-foreground">
              {format(date, 'MMM')}
            </span>
            {countdown && (
              <span className="mt-2.5 whitespace-nowrap rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
                {countdown}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1 p-4">
            <p className="font-medium leading-snug">Annual boiler service</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Included with membership</p>

            <ul className="mt-3 space-y-2">
              <li className="flex items-start gap-2 text-xs">
                <Clock className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <span>
                  <span className="font-medium text-foreground">{slotInfo.label}</span>
                  <span className="text-muted-foreground"> · {slotInfo.short}</span>
                </span>
              </li>
              <li className="flex items-start gap-2 text-xs">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <span className="leading-snug text-muted-foreground">
                  {formatAddress(member)}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Time window bar */}
        <div className="flex items-center gap-2 border-t border-border/60 bg-card/50 px-4 py-2.5">
          <SlotIcon className="size-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">
            Arrival window: <span className="font-medium text-foreground">{slotInfo.window}</span>
          </span>
        </div>
      </div>

      {/* What to expect */}
      <div className="rounded-lg border border-border/60 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          On the day
        </p>
        <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
          <li className="flex gap-2">
            <Calendar className="mt-0.5 size-3 shrink-0 text-primary/80" />
            <span>Engineer calls ~30 minutes before arrival</span>
          </li>
          <li className="flex gap-2">
            <Clock className="mt-0.5 size-3 shrink-0 text-primary/80" />
            <span>Visit takes 60–90 minutes · CP12 issued on completion</span>
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {withinCancellationWindow ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
            <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
              Too close to reschedule or cancel
            </p>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
              Your service is in less than 48 hours. Please call us to make changes.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            {onReschedule && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReschedule}
                className="cursor-pointer flex-1"
              >
                <RefreshCw className="mr-2 size-3.5" />
                Reschedule
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCancelModal(true)}
              className="cursor-pointer flex-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <X className="mr-2 size-3.5" />
              Cancel booking
            </Button>
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {withinCancellationWindow
              ? 'Need help? Call our support team.'
              : 'Changes? Reschedule at least 48 hours ahead.'}
          </p>
          <Button variant="outline" size="sm" className="cursor-pointer shrink-0" asChild>
            <a href={`tel:${supportPhone}`}>
              <Phone className="mr-2 size-3.5" />
              {supportPhoneDisplay}
            </a>
          </Button>
        </div>
      </div>

      {/* Cancel Modal */}
      <CancelBookingModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        booking={booking}
        onSuccess={() => {
          setShowCancelModal(false);
          onCancelled?.();
        }}
      />
    </div>
  );
}
