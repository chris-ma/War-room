'use client';

import Spinner from '@/components/ui/Spinner';

interface TopBarProps {
  eventCount: number;
  lastUpdated: Date | null;
  isLoading: boolean;
  onRefresh: () => void;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

export default function TopBar({ eventCount, lastUpdated, isLoading, onRefresh }: TopBarProps) {
  return (
    <div className="flex-shrink-0 bg-bg-secondary border-b-2 border-accent" style={{ borderBottomColor: '#1a4a22' }}>
      {/* amber top stripe */}
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, transparent, #d4aa00 30%, #44ff66 70%, transparent)' }} />

      <div className="flex items-center gap-4 px-4 py-2">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-2 h-2 bg-breaking" style={{ boxShadow: '0 0 8px #ff3300' }} />
          <span className="cc-glow text-xs font-bold tracking-widest uppercase"
                style={{ fontFamily: "'Orbitron', monospace", color: '#44ff66', letterSpacing: '0.25em' }}>
            CRISIS<span style={{ color: '#d4aa00' }}>MONITOR</span>
          </span>
        </div>

        {/* Divider */}
        <div className="h-4 w-px" style={{ background: '#1a4a22' }} />

        {/* Status */}
        <div className="flex items-center gap-3 text-[10px] flex-1" style={{ color: '#6aaa30' }}>
          <span style={{ color: '#d4aa00' }}>◈ TACTICAL DISPLAY ONLINE</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">
            SECTOR: <span style={{ color: '#b8f040' }}>GLOBAL</span>
          </span>
        </div>

        {/* Right: event count + time + refresh */}
        <div className="flex items-center gap-3 text-[10px]" style={{ color: '#6aaa30' }}>
          {isLoading ? (
            <Spinner size={10} />
          ) : (
            <span>
              EVENTS: <span style={{ color: '#44ff66', fontWeight: 700 }}>{String(eventCount).padStart(4, '0')}</span>
            </span>
          )}
          {lastUpdated && (
            <span className="hidden sm:inline">
              SYNC: <span style={{ color: '#b8f040' }}>{formatTime(lastUpdated)}</span>
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh"
            className="px-2 py-0.5 disabled:opacity-40 transition-colors"
            style={{
              border: '1px solid #1a4a22',
              color: '#6aaa30',
              background: '#06100a',
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 11,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#b8f040')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6aaa30')}
          >
            ↻ SYNC
          </button>
        </div>
      </div>

      {/* bottom scan stripe */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #1a4a22 20%, #1a4a22 80%, transparent)' }} />
    </div>
  );
}
