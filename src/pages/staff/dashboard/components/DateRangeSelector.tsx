/**
 * Date Range Selector
 * Preset date range picker for dashboard filtering
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type DateRangePreset = 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom';

interface DateRangeSelectorProps {
  preset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
}

const PRESET_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
];

export function DateRangeSelector({ preset, onPresetChange }: DateRangeSelectorProps) {
  return (
    <Select value={preset} onValueChange={onPresetChange}>
      <SelectTrigger className="w-[180px] cursor-pointer">
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        {PRESET_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value} className="cursor-pointer">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
