/**
 * Member Bookings Tab
 * View all bookings for this member
 */

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase';
import { formatDate } from '@/lib/date-utils';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DetailEmpty,
  DetailLoading,
  DetailSection,
} from '../components/detail-ui';

type Booking = Tables<'bookings'>;

interface MemberBookingsTabProps {
  memberId: string;
}

const statusStyles: Record<string, { label: string; className: string }> = {
  booked: { label: 'Booked', className: 'border-blue-500/30 text-blue-700 dark:text-blue-400' },
  rescheduled: { label: 'Rescheduled', className: 'border-amber-500/30 text-amber-700 dark:text-amber-400' },
  cancelled_by_member: { label: 'Cancelled', className: 'border-border text-muted-foreground' },
  cancelled_by_provider: { label: 'Cancelled', className: 'border-red-500/30 text-red-700 dark:text-red-400' },
  completed: { label: 'Completed', className: 'border-emerald-500/30 text-emerald-700 dark:text-emerald-400' },
  no_show: { label: 'No show', className: 'border-red-500/30 text-red-700 dark:text-red-400' },
};

function getStatusStyle(status: string) {
  return statusStyles[status] || {
    label: status.replace(/_/g, ' '),
    className: 'border-border text-muted-foreground',
  };
}

export function MemberBookingsTab({ memberId }: MemberBookingsTabProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, [memberId]);

  async function loadBookings() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('member_id', memberId)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <DetailLoading />;
  }

  return (
    <DetailSection title={`Bookings (${bookings.length})`} flushList>
      {bookings.length === 0 ? (
        <DetailEmpty
          message="No bookings yet"
          hint="Service appointments will appear here once scheduled."
        />
      ) : (
        <ul className="divide-y divide-border">
          {bookings.map((booking) => (
            <BookingRow key={booking.id} booking={booking} />
          ))}
        </ul>
      )}
    </DetailSection>
  );
}

function BookingRow({ booking }: { booking: Booking }) {
  const date = parse(booking.scheduled_date, 'yyyy-MM-dd', new Date());
  const status = getStatusStyle(booking.status);
  const slotLabel = booking.slot === 'AM' ? 'Morning (8am–12pm)' : 'Afternoon (12pm–4pm)';

  return (
    <li className="flex items-start justify-between gap-4 px-6 py-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex w-11 shrink-0 flex-col items-center rounded-lg border border-border/80 bg-muted/30 py-1.5">
          <span className="text-[9px] font-semibold uppercase text-muted-foreground">
            {format(date, 'MMM')}
          </span>
          <span className="text-base font-semibold leading-none">{format(date, 'd')}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">{format(date, 'EEEE, d MMMM yyyy')}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{slotLabel}</p>
          {booking.notes && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{booking.notes}</p>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">
            Created {formatDate(booking.created_at)}
            {booking.completed_at && <> · Completed {formatDate(booking.completed_at)}</>}
          </p>
        </div>
      </div>
      <Badge variant="outline" className={cn('shrink-0 capitalize', status.className)}>
        {status.label}
      </Badge>
    </li>
  );
}
