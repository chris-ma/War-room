'use client';

import type { DisasterEvent } from '@/types/disaster';
import { DISASTER_CONFIG } from '@/types/disaster';

interface TickerBarProps {
  events: DisasterEvent[];
  onEventClick: (event: DisasterEvent) => void;
}

const STATE_COLOR: Record<string, string> = {
  breaking:   '#ff3300',
  recent:     '#ff8c00',
  active:     '#d4aa00',
  historical: '#4a6a3a',
};

function timeAgo(isoDate: string): string {
  const ms = Date.now() - new Date(isoDate).getTime();
  const min = Math.floor(ms / 60000);
  const hr  = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (min < 1)  return 'NOW';
  if (min < 60) return `${min}m`;
  if (hr < 24)  return `${hr}h`;
  return `${day}d`;
}

export default function TickerBar({ events, onEventClick }: TickerBarProps) {
  if (events.length === 0) return null;

  const items = events.slice(0, 60);
  // ~4s per item, clamped between 20s and 140s
  const duration = Math.max(20, Math.min(140, items.length * 4));

  return (
    <div
      className="flex-shrink-0 overflow-hidden relative select-none"
      style={{
        height: 28,
        background: '#020804',
        borderTop: '1px solid #1a4a22',
        fontFamily: "'Share Tech Mono', monospace",
      }}
    >
      {/* Static left label */}
      <div
        className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-2 gap-1.5"
        style={{
          background: '#020804',
          borderRight: '1px solid #1a4a22',
          color: '#d4aa00',
          fontSize: 9,
          letterSpacing: '0.18em',
          minWidth: 68,
        }}
      >
        <span style={{ color: '#ff3300', fontSize: 7 }}>◆</span>
        FEED
      </div>

      {/* Scrolling area */}
      <div className="absolute inset-0" style={{ left: 68, overflow: 'hidden' }}>
        <div
          className="flex items-center h-full"
          style={{
            animation: `ticker-scroll ${duration}s linear infinite`,
            willChange: 'transform',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = 'paused')}
          onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = 'running')}
        >
          {[...items, ...items].map((ev, i) => {
            const cfg       = DISASTER_CONFIG[ev.disasterType];
            const dotColor  = STATE_COLOR[ev.state] ?? '#b8f040';
            const mag       = ev.magnitude != null
              ? ` ${ev.magnitude.toFixed(1)}${ev.magnitudeUnit ?? ''}`
              : '';
            const titleStr  = ev.title.length > 42
              ? ev.title.slice(0, 42) + '…'
              : ev.title;

            return (
              <button
                key={`${ev.id}-${i}`}
                onClick={() => onEventClick(ev)}
                className="flex items-center gap-1.5 px-3 h-full flex-shrink-0"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 10,
                  letterSpacing: '0.03em',
                  whiteSpace: 'nowrap',
                  color: '#b8f040',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#06100a')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ color: dotColor, fontSize: 7 }}>◆</span>
                <span style={{ fontSize: 11 }}>{cfg.emoji}</span>
                <span style={{ color: cfg.color, fontWeight: 700, fontSize: 9, letterSpacing: '0.08em' }}>
                  {cfg.label.toUpperCase()}
                </span>
                {mag && (
                  <span style={{ color: cfg.color, fontSize: 9 }}>{mag}</span>
                )}
                <span style={{ color: '#6aaa30' }}>—</span>
                <span style={{ color: '#b8f040' }}>{titleStr}</span>
                <span style={{ color: '#3a6828', fontSize: 9, marginLeft: 4 }}>{timeAgo(ev.date)}</span>
                <span style={{ color: '#1a4a22', marginLeft: 8, fontSize: 9 }}>│</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
