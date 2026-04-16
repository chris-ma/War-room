'use client';

import type { TimeRange } from '@/types/filters';

const OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '1h',  label: '1h' },
  { value: '6h',  label: '6h' },
  { value: '24h', label: '24h' },
  { value: '7d',  label: '7d' },
];

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (v: TimeRange) => void;
}

export default function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center gap-0.5 bg-bg-tertiary rounded-lg p-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            value === opt.value
              ? 'bg-accent text-white'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-primary'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
