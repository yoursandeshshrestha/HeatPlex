/**
 * Booking types and display constants
 */

export type TimeSlot = 'AM' | 'PM';

export interface AvailabilitySlot {
  date: string;
  am: number;
  pm: number;
}

export interface Booking {
  id: string;
  member_id: string;
  commusoft_job_id: string | null;
  scheduled_date: string;
  slot: TimeSlot;
  status:
    | 'booked'
    | 'rescheduled'
    | 'cancelled_by_member'
    | 'cancelled_by_provider'
    | 'completed'
    | 'no_show';
  engineer_id: string | null;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const SLOT_DETAILS: Record<
  TimeSlot,
  { label: string; window: string; short: string }
> = {
  AM: {
    label: 'Morning',
    window: '8:00 AM – 12:00 PM',
    short: '8am – 12pm',
  },
  PM: {
    label: 'Afternoon',
    window: '12:00 PM – 4:00 PM',
    short: '12pm – 4pm',
  },
};

export function formatSlotLabel(slot: TimeSlot, long = false): string {
  const { label, window, short } = SLOT_DETAILS[slot];
  return long ? `${label} (${window})` : `${label} · ${short}`;
}
