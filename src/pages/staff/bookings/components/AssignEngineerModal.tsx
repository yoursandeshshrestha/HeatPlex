/**
 * Assign Engineer Modal
 * Modal for assigning/reassigning engineers to bookings
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { getAvailableEngineers, assignEngineerToBooking } from '@/lib/supabase/queries';
import { format } from 'date-fns';
import type { BookingWithDetails } from '@/lib/supabase/queries';

interface AssignEngineerModalProps {
  booking: BookingWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AssignEngineerModal({
  booking,
  open,
  onOpenChange,
  onSuccess,
}: AssignEngineerModalProps) {
  const [engineers, setEngineers] = useState<{ id: string; name: string; slug: string | null }[]>([]);
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadEngineers();
      setSelectedEngineerId(booking?.engineer_id || '');
    }
  }, [open, booking]);

  async function loadEngineers() {
    try {
      const data = await getAvailableEngineers();
      setEngineers(data);
    } catch (error) {
      console.error('Failed to load engineers:', error);
      toast.error('Failed to load engineers');
    }
  }

  async function handleAssign() {
    if (!booking) return;

    setLoading(true);
    try {
      await assignEngineerToBooking(booking.id, selectedEngineerId || null);
      toast.success(
        selectedEngineerId ? 'Engineer assigned successfully' : 'Engineer unassigned'
      );
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to assign engineer:', error);
      toast.error('Failed to assign engineer');
    } finally {
      setLoading(false);
    }
  }

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Engineer</DialogTitle>
          <DialogDescription>
            Assign an engineer to this booking for{' '}
            {booking.member.first_name} {booking.member.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Booking Details</Label>
            <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">
                  {format(new Date(booking.scheduled_date), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-muted-foreground">Time Slot:</span>
                <span className="font-medium">{booking.slot === 'AM' ? 'Morning' : 'Afternoon'}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-muted-foreground">Member:</span>
                <span className="font-medium">
                  {booking.member.first_name} {booking.member.last_name}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="engineer">Engineer</Label>
            <Select value={selectedEngineerId} onValueChange={setSelectedEngineerId}>
              <SelectTrigger id="engineer" className="cursor-pointer">
                <SelectValue placeholder="Select an engineer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned" className="cursor-pointer">
                  Unassigned
                </SelectItem>
                {engineers.map((engineer) => (
                  <SelectItem
                    key={engineer.id}
                    value={engineer.id}
                    className="cursor-pointer"
                  >
                    {engineer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {booking.notes && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Notes</Label>
              <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                {booking.notes}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={loading} className="cursor-pointer">
            {loading ? 'Assigning...' : 'Assign Engineer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
