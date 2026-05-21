/**
 * Inline booking review — confirm step without a modal
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Clock, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { formatSlotLabel, SLOT_DETAILS, type TimeSlot } from '@/types/booking';
import type { Tables } from '@/lib/supabase';

type Member = Tables<'members'>;

interface BookingReviewProps {
  date: Date;
  slot: TimeSlot;
  member: Member;
  onBack: () => void;
  onConfirm: () => Promise<void>;
}

export function BookingReview({ date, slot, member, onBack, onConfirm }: BookingReviewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slotInfo = SLOT_DETAILS[slot];

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      console.error('Booking error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to book service. Please try again.'
      );
      setLoading(false);
    }
  }

  const addressLines = [
    member.address_line_1,
    member.address_line_2,
    `${member.address_town}, ${member.address_postcode}`,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        disabled={loading}
        className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
      >
        <ArrowLeft className="size-4" />
        Change date or time
      </button>

      <div className="rounded-xl border border-border/80 bg-muted/20 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Appointment summary
        </p>

        <dl className="mt-4 space-y-4">
          <div className="flex gap-3">
            <Calendar className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <dt className="text-xs text-muted-foreground">Date</dt>
              <dd className="mt-0.5 text-sm font-medium">
                {format(date, 'EEEE, d MMMM yyyy')}
              </dd>
            </div>
          </div>
          <div className="flex gap-3">
            <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <dt className="text-xs text-muted-foreground">Time window</dt>
              <dd className="mt-0.5 text-sm font-medium">{slotInfo.label}</dd>
              <dd className="text-xs text-muted-foreground">{slotInfo.window}</dd>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <dt className="text-xs text-muted-foreground">Service address</dt>
              <dd className="mt-0.5 text-sm leading-relaxed">
                {addressLines.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </dd>
            </div>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-border/60 p-4">
        <p className="text-sm font-medium">Annual boiler service</p>
        <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
          <li>Included free with your membership</li>
          <li>Full safety inspection and CP12 certificate on completion</li>
          <li>{formatSlotLabel(slot)} arrival window</li>
        </ul>
      </div>

      <Alert className="border-border/80 bg-transparent">
        <AlertCircle className="size-4" />
        <AlertDescription className="text-xs leading-relaxed">
          Reschedule or cancel up to 48 hours before your visit. Within 48 hours, call{' '}
          <a href="tel:02076220444" className="font-medium text-foreground underline-offset-2 hover:underline">
            020 7622 0444
          </a>
          .
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="cursor-pointer"
        >
          Back
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          size="lg"
          className={cn('cursor-pointer sm:min-w-[180px]', loading && 'gap-2')}
        >
          {loading ? (
            <>
              <Spinner className="size-4" />
              Confirming…
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 size-4" />
              Confirm booking
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
