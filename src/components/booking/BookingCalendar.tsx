/**
 * Date + time picker — calendar and slots shown together (no view switching)
 */

import { useState, useEffect, useCallback } from 'react';
import {
  format,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isWeekend,
  isBefore,
  isSameMonth,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2, Sun, Sunset } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SLOT_DETAILS, type AvailabilitySlot, type TimeSlot } from '@/types/booking';

interface BookingCalendarProps {
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  onDateSelect: (date: Date) => void;
  onSlotSelect: (slot: TimeSlot) => void;
  minDaysAhead?: number;
  maxWeeksAhead?: number;
}

function mockAvailabilityForDate(dateKey: string): AvailabilitySlot {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return {
    date: dateKey,
    am: ((hash % 3) + 1),
    pm: (((hash >> 4) % 3) + 1),
  };
}

export function BookingCalendar({
  selectedDate,
  selectedSlot,
  onDateSelect,
  onSlotSelect,
  minDaysAhead = 3,
  maxWeeksAhead = 12,
}: BookingCalendarProps) {
  const today = new Date();
  const minDate = addDays(today, minDaysAhead);
  const maxDate = addDays(today, maxWeeksAhead * 7);

  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(minDate));
  const [availability, setAvailability] = useState<Record<string, AvailabilitySlot>>({});
  const [loading, setLoading] = useState(true);

  const loadAvailability = useCallback(async () => {
    setLoading(true);
    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const mock: Record<string, AvailabilitySlot> = {};

      let currentDate = monthStart;
      while (currentDate <= monthEnd) {
        if (
          !isWeekend(currentDate) &&
          !isBefore(currentDate, minDate) &&
          isBefore(currentDate, maxDate)
        ) {
          const dateKey = format(currentDate, 'yyyy-MM-dd');
          mock[dateKey] = mockAvailabilityForDate(dateKey);
        }
        currentDate = addDays(currentDate, 1);
      }

      setAvailability(mock);
    } catch (error) {
      console.error('Failed to load availability:', error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, minDate, maxDate]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  function goToPreviousMonth() {
    const newMonth = subMonths(currentMonth, 1);
    if (!isBefore(newMonth, startOfMonth(minDate))) {
      setCurrentMonth(newMonth);
    }
  }

  function goToNextMonth() {
    const newMonth = addMonths(currentMonth, 1);
    if (isBefore(newMonth, maxDate)) {
      setCurrentMonth(newMonth);
    }
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  const canGoPrevious = !isBefore(subMonths(currentMonth, 1), startOfMonth(minDate));
  const canGoNext = isBefore(addMonths(currentMonth, 1), maxDate);

  const selectedKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const dayAvailability = selectedKey ? availability[selectedKey] : null;

  const weekdayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
      {/* Calendar — fixed compact width */}
      <div className="w-full max-w-[252px] shrink-0">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">{format(currentMonth, 'MMM yyyy')}</h3>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousMonth}
              disabled={!canGoPrevious || loading}
              className="size-7 cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextMonth}
              disabled={!canGoNext || loading}
              className="size-7 cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-[212px] items-center justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-0.5">
              {weekdayLabels.map((label, i) => (
                <div
                  key={i}
                  className="flex h-6 items-center justify-center text-[10px] font-medium text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((date) => {
                const dateKey = format(date, 'yyyy-MM-dd');
                const slots = availability[dateKey];
                const isCurrentMonth = isSameMonth(date, currentMonth);
                const isPast = isBefore(date, minDate);
                const isWeekendDay = isWeekend(date);
                const hasAvailability =
                  slots && (slots.am > 0 || slots.pm > 0);
                const isDisabled =
                  !isCurrentMonth || isPast || isWeekendDay || !hasAvailability;
                const isSelected =
                  selectedDate !== null && isSameDay(date, selectedDate);

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => !isDisabled && onDateSelect(date)}
                    disabled={isDisabled}
                    className={cn(
                      'relative flex size-8 cursor-pointer items-center justify-center rounded-md text-xs font-medium transition-colors',
                      'hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                      isDisabled &&
                        'cursor-not-allowed opacity-25 hover:bg-transparent',
                      !isCurrentMonth && 'text-muted-foreground/30',
                      !isSelected &&
                        hasAvailability &&
                        isCurrentMonth &&
                        'text-foreground',
                      isSelected &&
                        'bg-primary text-primary-foreground hover:bg-primary/90'
                    )}
                  >
                    {format(date, 'd')}
                    {hasAvailability && !isDisabled && !isSelected && (
                      <span className="absolute bottom-0.5 left-1/2 size-0.5 -translate-x-1/2 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            <p className="mt-2 text-[10px] leading-snug text-muted-foreground">
              Weekdays · {minDaysAhead}+ days ahead
            </p>
          </>
        )}
      </div>

      {/* Time slots */}
      <div className="min-w-0 flex-1 sm:border-l sm:border-border/60 sm:pl-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Time window
        </p>

        {!selectedDate ? (
          <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-3 py-6 text-center sm:py-8">
            <p className="text-xs text-muted-foreground">Select a date first</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <p className="mb-2 text-xs font-medium">
              {format(selectedDate, 'EEE d MMM')}
            </p>
            {(['AM', 'PM'] as const).map((slot) => {
              const details = SLOT_DETAILS[slot];
              const count =
                slot === 'AM' ? dayAvailability?.am ?? 0 : dayAvailability?.pm ?? 0;
              const isAvailable = count > 0;
              const isSelected = selectedSlot === slot;
              const Icon = slot === 'AM' ? Sun : Sunset;

              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => isAvailable && onSlotSelect(slot)}
                  disabled={!isAvailable}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-all',
                    'hover:border-primary/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                    !isAvailable && 'cursor-not-allowed opacity-40',
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'border-border/80 bg-card'
                  )}
                >
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-md',
                      isSelected ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium">{details.label}</span>
                    <span className="block text-[10px] text-muted-foreground">{details.short}</span>
                  </span>
                  {isAvailable && (
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {count} left
                    </span>
                  )}
                </button>
              );
            })}
            <p className="pt-1 text-[10px] leading-snug text-muted-foreground">
              60–90 min · Call 30 min before
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
