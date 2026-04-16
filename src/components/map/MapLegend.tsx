'use client';

const STATES = [
  { label: 'Breaking', color: '#ef4444', desc: '< 5 min' },
  { label: 'Recent',   color: '#f97316', desc: '< 1 hr' },
  { label: 'Active',   color: '#eab308', desc: '< 24 hr' },
  { label: 'Historical', color: '#6b7280', desc: '> 24 hr' },
];

export default function MapLegend() {
  return (
    <div className="absolute bottom-8 left-4 z-[1000] bg-bg-secondary border border-border rounded-lg p-3 text-xs space-y-1.5">
      <div className="text-text-secondary font-semibold uppercase tracking-wide mb-2">Event Status</div>
      {STATES.map((s) => (
        <div key={s.label} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: s.color }}
          />
          <span className="text-text-primary">{s.label}</span>
          <span className="text-text-muted">{s.desc}</span>
        </div>
      ))}
    </div>
  );
}
