/**
 * Multi-step booking: schedule (date + time) → review → confirm
 */

import { useState } from 'react';
import { format, parse } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { BookingCalendar } from './BookingCalendar';
import { BookingReview } from './BookingReview';
import { formatSlotLabel, type TimeSlot } from '@/types/booking';
import type { Tables } from '@/lib/supabase';

type Member = Tables<'members'>;
type Booking = Tables<'bookings'>;

type Step = 'schedule' | 'review';

interface BookingFlowProps {
  member: Member;
  existingBooking?: Booking;
  onSuccess: () => void;
  onCancel: () => void;
}

const STEPS: { id: Step; label: string }[] = [
  { id: 'schedule', label: 'Date & time' },
  { id: 'review', label: 'Confirm' },
];

export function BookingFlow({ member, existingBooking, onSuccess, onCancel }: BookingFlowProps) {
  const [step, setStep] = useState<Step>('schedule');
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    existingBooking ? parse(existingBooking.scheduled_date, 'yyyy-MM-dd', new Date()) : null
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(
    existingBooking ? (existingBooking.slot as TimeSlot) : null
  );

  const canContinue = selectedDate !== null && selectedSlot !== null;
  const isRescheduling = !!existingBooking;

  function handleDateSelect(date: Date) {
    setSelectedDate(date);
    setSelectedSlot(null);
  }

  async function handleConfirmBooking() {
    if (!selectedDate || !selectedSlot) return;

    if (isRescheduling && existingBooking) {
      // Update existing booking
      const { error } = await supabase
        .from('bookings')
        .update({
          scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
          slot: selectedSlot,
          status: 'rescheduled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingBooking.id);

      if (error) throw error;

      toast.success('Booking rescheduled', {
        description: `${format(selectedDate, 'EEE d MMM')} · ${formatSlotLabel(selectedSlot)}`,
      });
    } else {
      // Create new booking
      const { error } = await supabase
        .from('bookings')
        .insert({
          member_id: member.id,
          scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
          slot: selectedSlot,
          status: 'booked',
        })
        .select()
        .single();

      if (error) throw error;

      try {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'booking_confirmation',
            to: member.email,
            data: {
              firstName: member.first_name,
              date: format(selectedDate, 'EEEE, MMMM d, yyyy'),
              slot: formatSlotLabel(selectedSlot, true),
              address: `${member.address_line_1}, ${member.address_town}, ${member.address_postcode}`,
              dashboardUrl: `${window.location.origin}/member/services`,
            },
          },
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      toast.success('Service booked', {
        description: `${format(selectedDate, 'EEE d MMM')} · ${formatSlotLabel(selectedSlot)}`,
      });
    }

    onSuccess();
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, index) => {
          const isActive = step === s.id;
          const isDone = step === 'review' && s.id === 'schedule';

          return (
            <div key={s.id} className="flex items-center gap-2">
              {index > 0 && (
                <div
                  className={cn(
                    'h-px w-6 sm:w-10',
                    isDone || isActive ? 'bg-primary/40' : 'bg-border'
                  )}
                />
              )}
              <div
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  isActive && 'bg-primary/10 text-primary',
                  isDone && !isActive && 'text-muted-foreground',
                  !isActive && !isDone && 'text-muted-foreground/60'
                )}
              >
                <span
                  className={cn(
                    'flex size-5 items-center justify-center rounded-full text-[10px] font-semibold',
                    isActive && 'bg-primary text-primary-foreground',
                    isDone && !isActive && 'bg-primary/20 text-primary',
                    !isActive && !isDone && 'bg-muted text-muted-foreground'
                  )}
                >
                  {index + 1}
                </span>
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {step === 'schedule' ? (
        <>
          <BookingCalendar
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onDateSelect={handleDateSelect}
            onSlotSelect={setSelectedSlot}
          />

          {canContinue && selectedDate && selectedSlot && (
            <div className="flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {format(selectedDate, 'EEE d MMM yyyy')}
                </span>
                {' · '}
                {formatSlotLabel(selectedSlot)}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onCancel} className="cursor-pointer">
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep('review')}
                  className="cursor-pointer"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        selectedDate &&
        selectedSlot && (
          <BookingReview
            date={selectedDate}
            slot={selectedSlot}
            member={member}
            onBack={() => setStep('schedule')}
            onConfirm={handleConfirmBooking}
          />
        )
      )}
    </div>
  );
}
