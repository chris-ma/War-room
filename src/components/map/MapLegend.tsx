'use client';

import { useState } from 'react';
import type { ActiveLayer } from '@/types/disaster';
import { DISASTER_CONFIG, type DisasterSubtype } from '@/types/disaster';

const CONFLICT_STATES = [
  { label: 'Breaking', color: '#ef4444', desc: '< 5 min' },
  { label: 'Recent',   color: '#f97316', desc: '< 1 hr' },
  { label: 'Active',   color: '#eab308', desc: '< 24 hr' },
  { label: 'Historical', color: '#6b7280', desc: '> 24 hr' },
];

const DISASTER_TYPES: DisasterSubtype[] = [
  'earthquake', 'wildfire', 'flood', 'cyclone', 'volcano', 'severe_storm', 'landslide', 'epidemic',
];

export default function MapLegend({ activeLayer }: { activeLayer: ActiveLayer }) {
  const [open, setOpen] = useState(false);
  const showConflict = activeLayer === 'conflict' || activeLayer === 'both';
  const showDisaster = activeLayer === 'disaster' || activeLayer === 'both';

  return (
    <div className="absolute bottom-8 left-2 sm:left-4 z-[1000]">
      {/* Toggle button — always visible */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-2 py-1 bg-bg-secondary border border-border rounded-lg text-[10px] text-text-secondary hover:text-text-primary transition-colors shadow"
      >
        <span>⊞</span>
        <span>Legend</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>

      {/* Collapsible legend */}
      {open && (
        <div className="mt-1 bg-bg-secondary border border-border rounded-lg p-3 text-xs space-y-1.5 max-h-[50vh] overflow-y-auto shadow-lg">
          {showConflict && (
            <>
              <div className="text-text-secondary font-semibold uppercase tracking-wide mb-1">⚔ Conflict</div>
              {CONFLICT_STATES.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-text-primary">{s.label}</span>
                  <span className="text-text-muted">{s.desc}</span>
                </div>
              ))}
            </>
          )}
          {showConflict && showDisaster && <div className="border-t border-border my-1" />}
          {showDisaster && (
            <>
              <div className="text-text-secondary font-semibold uppercase tracking-wide mb-1">🌍 Disasters</div>
              {DISASTER_TYPES.map((type) => {
                const cfg = DISASTER_CONFIG[type];
                return (
                  <div key={type} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded flex-shrink-0" style={{ background: cfg.color }} />
                    <span className="text-text-primary">{cfg.emoji} {cfg.label}</span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
