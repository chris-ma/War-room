'use client';

import type { ActiveLayer } from '@/types/disaster';
import { DISASTER_CONFIG, type DisasterSubtype } from '@/types/disaster';

const CONFLICT_STATES = [
  { label: 'Breaking', color: '#ef4444', desc: '< 5 min' },
  { label: 'Recent',   color: '#f97316', desc: '< 1 hr' },
  { label: 'Active',   color: '#eab308', desc: '< 24 hr' },
  { label: 'Historical', color: '#6b7280', desc: '> 24 hr' },
];

const DISASTER_TYPES: DisasterSubtype[] = [
  'earthquake', 'wildfire', 'flood', 'cyclone', 'volcano', 'severe_storm', 'landslide',
];

export default function MapLegend({ activeLayer }: { activeLayer: ActiveLayer }) {
  const showConflict = activeLayer === 'conflict' || activeLayer === 'both';
  const showDisaster = activeLayer === 'disaster' || activeLayer === 'both';

  return (
    <div className="absolute bottom-8 left-4 z-[1000] bg-bg-secondary border border-border rounded-lg p-3 text-xs space-y-1.5 max-h-[60vh] overflow-y-auto">
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
  );
}
