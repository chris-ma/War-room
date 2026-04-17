'use client';

import type { ActiveLayer } from '@/types/disaster';

const OPTIONS: { value: ActiveLayer; label: string }[] = [
  { value: 'conflict',  label: '⚔ Conflict' },
  { value: 'disaster',  label: '🌍 Disasters' },
  { value: 'both',      label: '⊕ Both' },
];

interface LayerToggleProps {
  value: ActiveLayer;
  onChange: (v: ActiveLayer) => void;
}

export default function LayerToggle({ value, onChange }: LayerToggleProps) {
  return (
    <div className="flex items-center gap-0.5 bg-bg-tertiary rounded-lg p-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
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
