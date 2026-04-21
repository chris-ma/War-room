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
    <div className="absolute bottom-8 left-2 sm:left-4 z-[1000]" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2 py-1 text-[10px] transition-colors"
        style={{
          background: '#06100a',
          border: '1px solid #1a4a22',
          color: '#6aaa30',
          letterSpacing: '0.1em',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#b8f040')}
        onMouseLeave={e => (e.currentTarget.style.color = '#6aaa30')}
      >
        <span style={{ color: '#d4aa00' }}>▣</span>
        <span>THREAT MATRIX</span>
        <span style={{ color: '#44ff66' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-0 text-[11px] max-h-[50vh] overflow-y-auto"
             style={{ background: '#06100a', border: '1px solid #1a4a22', borderTop: '1px solid #d4aa00' }}>
          <div className="px-3 py-1.5 text-[9px] tracking-widest"
               style={{ color: '#d4aa00', borderBottom: '1px solid #1a4a22', letterSpacing: '0.2em' }}>
            ── ACTIVE SIGNATURES ──
          </div>
          {DISASTER_TYPES.map((type) => {
            const cfg = DISASTER_CONFIG[type];
            return (
              <div key={type} className="flex items-center gap-2 px-3 py-1"
                   style={{ borderBottom: '1px solid #0c1f10' }}>
                <span className="flex-shrink-0" style={{
                  width: 10, height: 10,
                  background: cfg.color,
                  transform: 'rotate(45deg)',
                  boxShadow: `0 0 6px ${cfg.color}`,
                  display: 'inline-block',
                }} />
                <span style={{ color: '#b8f040' }}>{cfg.label.toUpperCase()}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
