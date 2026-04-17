'use client';

import { useState } from 'react';
import { DISASTER_CONFIG, type DisasterSubtype } from '@/types/disaster';

const DISASTER_TYPES: DisasterSubtype[] = [
  'earthquake', 'wildfire', 'flood', 'cyclone', 'volcano',
  'severe_storm', 'landslide', 'tsunami', 'drought', 'epidemic',
];

export default function MapLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute bottom-8 left-2 sm:left-4 z-[1000]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-2 py-1 bg-bg-secondary border border-border rounded-lg text-[10px] text-text-secondary hover:text-text-primary transition-colors shadow"
      >
        <span>⊞</span>
        <span>Legend</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-1 bg-bg-secondary border border-border rounded-lg p-3 text-xs space-y-1.5 max-h-[50vh] overflow-y-auto shadow-lg">
          <div className="text-text-secondary font-semibold uppercase tracking-wide mb-1">🌍 Events</div>
          {DISASTER_TYPES.map((type) => {
            const cfg = DISASTER_CONFIG[type];
            return (
              <div key={type} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded flex-shrink-0" style={{ background: cfg.color }} />
                <span className="text-text-primary">{cfg.emoji} {cfg.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
