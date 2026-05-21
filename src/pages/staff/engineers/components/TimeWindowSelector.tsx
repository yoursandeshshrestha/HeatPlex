/**
 * Time Window Selector
 * Period selector for engineer leaderboard
 */

import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DateRangeFilter } from '@/lib/supabase/queries';

export type TimeWindow = 'this_week' | 'last_week' | 'this_month' | 'all_time';

interface TimeWindowSelectorProps {
  window: TimeWindow;
  onWindowChange: (window: TimeWindow) => void;
}

const WINDOW_OPTIONS: { value: TimeWindow; label: string }[] = [
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'all_time', label: 'All Time' },
];

export function getDateRangeFromWindow(window: TimeWindow): DateRangeFilter {
  const now = new Date();

  switch (window) {
    case 'this_week':
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case 'last_week':
      const lastWeek = subWeeks(now, 1);
      return {
        from: startOfWeek(lastWeek, { weekStartsOn: 1 }),
        to: endOfWeek(lastWeek, { weekStartsOn: 1 }),
      };
    case 'this_month':
      return {
        from: startOfMonth(now),
        to: endOfMonth(now),
      };
    case 'all_time':
      return {
        from: new Date(2024, 0, 1), // Jan 1, 2024
        to: now,
      };
    default:
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      };
  }
}

export function TimeWindowSelector({ window, onWindowChange }: TimeWindowSelectorProps) {
  return (
    <Select value={window} onValueChange={onWindowChange}>
      <SelectTrigger className="w-[160px] cursor-pointer">
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        {WINDOW_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value} className="cursor-pointer">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
