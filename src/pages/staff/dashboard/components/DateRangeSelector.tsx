/**
 * Date Range Selector
 * Preset date range picker for dashboard filtering
 */

import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';

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
    <Combobox value={preset} onValueChange={(value) => value && onPresetChange(value as DateRangePreset)}>
      <ComboboxInput placeholder="Select period" className="h-9 w-[180px] cursor-pointer" />
      <ComboboxContent>
        <ComboboxList>
        {PRESET_OPTIONS.map((option) => (
          <ComboboxItem key={option.value} value={option.value} className="cursor-pointer">
            {option.label}
          </ComboboxItem>
        ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
