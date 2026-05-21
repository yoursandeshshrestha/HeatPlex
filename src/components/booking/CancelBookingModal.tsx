/**
 * Cancel Booking Modal
 * Allows members to cancel their service appointment
 */

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { AlertTriangle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Tables } from '@/lib/supabase';
import { formatSlotLabel } from '@/types/booking';
import type { TimeSlot } from '@/types/booking';

type Booking = Tables<'bookings'>;

interface CancelBookingModalProps {
  open: boolean;
  onClose: () => void;
  booking: Booking;
  onSuccess: () => void;
}

export function CancelBookingModal({
  open,
  onClose,
  booking,
  onSuccess,
}: CancelBookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setLoading(true);
    setError(null);

    try {
      // Update booking status to cancelled
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled_by_member',
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      if (updateError) throw updateError;

      // Send cancellation email
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'booking_cancelled',
            to: booking.member_id, // Will need to join with member email in real implementation
            data: {
              date: format(new Date(booking.scheduled_date), 'EEEE, MMMM d, yyyy'),
              slot: formatSlotLabel(booking.slot as TimeSlot, true),
            },
          },
        });
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
        // Don't fail the cancellation if email fails
      }

      toast.success('Booking cancelled', {
        description: 'Your service appointment has been cancelled.',
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Cancel error:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !loading && !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10">
              <AlertTriangle className="size-5 text-red-500" />
            </div>
            <div>
              <DialogTitle>Cancel Booking?</DialogTitle>
              <DialogDescription>This action cannot be undone</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">
              {format(new Date(booking.scheduled_date), 'EEEE, MMMM d, yyyy')}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatSlotLabel(booking.slot as TimeSlot, true)}
            </p>
          </div>

          <Alert>
            <AlertDescription className="text-sm">
              <strong>Cancellation Policy:</strong> You can cancel free of charge up to 48 hours
              before your appointment. For cancellations within 48 hours, please call us at
              020 7622 0444.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer"
          >
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={loading}
            className="cursor-pointer"
          >
            {loading ? (
              <>
                <Spinner className="mr-2 size-4" />
                Cancelling...
              </>
            ) : (
              <>
                <X className="mr-2 size-4" />
                Cancel Booking
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
