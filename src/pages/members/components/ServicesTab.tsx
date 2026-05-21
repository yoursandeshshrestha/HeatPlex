/**
 * Services Tab
 * Book services and view history
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar, Phone, Wrench } from 'lucide-react';
import { BookingFlow } from '@/components/booking/BookingFlow';
import { ConfirmedBookingCard } from '@/components/booking/ConfirmedBookingCard';
import { PanelEmpty, SectionPanel, SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY } from './member-ui';
import { getUpcomingBookings } from '@/lib/supabase/queries';
import { useMember } from '@/contexts/AuthContext';
import { formatSlotLabel, type TimeSlot } from '@/types/booking';
import type { Tables } from '@/lib/supabase';

type Booking = Tables<'bookings'>;

const serviceTypes = [
  {
    title: 'Annual boiler service',
    detail: 'Free for members · Worth £120',
  },
  {
    title: 'Gas Safety Certificate (CP12)',
    detail: 'Free for members · Worth £80',
  },
  {
    title: 'Boiler repairs',
    detail: '20% member discount',
  },
  {
    title: 'Emergency callout',
    detail: '20% member discount · 24/7',
  },
];

export function ServicesTab() {
  const member = useMember();
  const [isBooking, setIsBooking] = useState(false);
  const [reschedulingBooking, setReschedulingBooking] = useState<Booking | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (member) {
      loadUpcomingBookings();
    }
  }, [member]);

  async function loadUpcomingBookings() {
    if (!member) return;

    try {
      setUpcomingBookings(await getUpcomingBookings(member.id));
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  }

  const hasUpcomingBooking = upcomingBookings.length > 0;
  const nextBooking = upcomingBookings[0];
  const isBookingOrRescheduling = isBooking || reschedulingBooking !== null;

  return (
    <div className="space-y-8">
      <SectionPanel
        title={hasUpcomingBooking && !isBookingOrRescheduling ? 'Your upcoming service' : reschedulingBooking ? 'Reschedule service' : 'Book annual service'}
        icon={Wrench}
        action={
          isBookingOrRescheduling ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsBooking(false);
                setReschedulingBooking(null);
              }}
              className="cursor-pointer text-muted-foreground"
            >
              Cancel
            </Button>
          ) : undefined
        }
      >
        {loadingBookings ? (
          <div className="flex justify-center py-10">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : hasUpcomingBooking && !isBookingOrRescheduling && nextBooking && member ? (
          <ConfirmedBookingCard
            booking={nextBooking}
            member={member}
            supportPhone={SUPPORT_PHONE}
            supportPhoneDisplay={SUPPORT_PHONE_DISPLAY}
            onReschedule={() => setReschedulingBooking(nextBooking)}
            onCancelled={() => loadUpcomingBookings()}
          />
        ) : isBookingOrRescheduling && member ? (
          <BookingFlow
            member={member}
            existingBooking={reschedulingBooking || undefined}
            onSuccess={() => {
              setIsBooking(false);
              setReschedulingBooking(null);
              loadUpcomingBookings();
            }}
            onCancel={() => {
              setIsBooking(false);
              setReschedulingBooking(null);
            }}
          />
        ) : (
          <BookServiceCTA onStart={() => setIsBooking(true)} />
        )}
      </SectionPanel>

      <SectionPanel title="Available services" flushList>
        <ul className="-mx-6 divide-y divide-border">
          {serviceTypes.map((service) => (
            <li key={service.title} className="px-6 py-3.5 first:pt-0 last:pb-0">
              <p className="text-sm font-medium">{service.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{service.detail}</p>
            </li>
          ))}
        </ul>
      </SectionPanel>

      {upcomingBookings.length > 1 && (
        <SectionPanel title="All upcoming bookings" flushList>
          <ul className="-mx-6 divide-y divide-border">
            {upcomingBookings.map((booking) => (
              <BookingListItem key={booking.id} booking={booking} />
            ))}
          </ul>
        </SectionPanel>
      )}

      <SectionPanel title="Service history" flushList>
        <PanelEmpty
          flush
          message="No service history yet"
          hint="Completed visits will appear here"
        />
      </SectionPanel>

      <SectionPanel title="Need help?">
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium">Office hours</p>
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="mt-0.5 block cursor-pointer text-muted-foreground hover:text-foreground"
            >
              {SUPPORT_PHONE_DISPLAY}
            </a>
            <p className="mt-0.5 text-xs text-muted-foreground">Monday–Friday, 8am–6pm</p>
          </div>
          <p className="text-xs text-muted-foreground">
            For urgent out-of-hours issues, call the number above and follow the prompts.
          </p>
        </div>
      </SectionPanel>
    </div>
  );
}

function BookServiceCTA({ onStart }: { onStart: () => void }) {
  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Your free annual boiler service is included with membership. Pick a weekday and
        morning or afternoon window — we&apos;ll confirm by email.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={onStart} size="lg" className="cursor-pointer">
          <Calendar className="mr-2 size-4" />
          Choose date & time
        </Button>
        <Button variant="outline" size="lg" className="cursor-pointer" asChild>
          <a href={`tel:${SUPPORT_PHONE}`}>
            <Phone className="mr-2 size-4" />
            Call {SUPPORT_PHONE_DISPLAY}
          </a>
        </Button>
      </div>
    </div>
  );
}

function BookingListItem({ booking }: { booking: Booking }) {
  const date = new Date(booking.scheduled_date);

  return (
    <li className="flex items-start gap-3 px-6 py-4">
      <Calendar className="mt-0.5 size-4 shrink-0 text-primary" />
      <div>
        <p className="text-sm font-medium">{format(date, 'EEE d MMM yyyy')}</p>
        <p className="text-xs text-muted-foreground">
          {formatSlotLabel(booking.slot as TimeSlot, true)}
        </p>
      </div>
    </li>
  );
}
