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

const ALERT_COLOR: Record<string, string> = {
  red:    '#ff3300',
  orange: '#ff8c00',
  yellow: '#d4aa00',
  green:  '#44ff66',
};

function timeAgo(isoDate: string): string {
  const ms  = Date.now() - new Date(isoDate).getTime();
  const min = Math.floor(ms / 60000);
  const hr  = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (min < 1)  return 'NOW';
  if (min < 60) return `${min}m`;
  if (hr < 24)  return `${hr}h`;
  return `${day}d`;
}

function locationFrom(ev: DisasterEvent): string {
  if (ev.country) return ev.country.toUpperCase();
  const parts = ev.title.split(',');
  if (parts.length > 1) return parts[parts.length - 1].trim().toUpperCase().slice(0, 24);
  return '';
}

function severityLabel(ev: DisasterEvent): { text: string; color: string } | null {
  if (ev.magnitude != null) {
    const color = ev.magnitude >= 7 ? '#ff3300' : ev.magnitude >= 5.5 ? '#ff8c00' : '#d4aa00';
    return { text: `M ${ev.magnitude.toFixed(1)}${ev.magnitudeUnit ? ` ${ev.magnitudeUnit}` : ''}`, color };
  }
  if (ev.alertLevel) {
    return { text: `${ev.alertLevel.toUpperCase()} ALERT`, color: ALERT_COLOR[ev.alertLevel] ?? '#d4aa00' };
  }
  if (ev.state === 'breaking') return { text: 'BREAKING', color: '#ff3300' };
  if (ev.state === 'recent')   return { text: 'RECENT',   color: '#ff8c00' };
  return null;
}

function TickerItem({ ev, onEventClick }: { ev: DisasterEvent; onEventClick: (e: DisasterEvent) => void }) {
  const cfg      = DISASTER_CONFIG[ev.disasterType];
  const dotColor = STATE_COLOR[ev.state] ?? '#b8f040';
  const location = locationFrom(ev);
  const severity = severityLabel(ev);

  return (
    <button
      onClick={() => onEventClick(ev)}
      className="flex items-center gap-2 px-4 h-full flex-shrink-0"
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: 11,
        whiteSpace: 'nowrap',
        color: '#b8f040',
        fontFamily: "'Share Tech Mono', monospace",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#0c1f10'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ color: dotColor, fontSize: 8, flexShrink: 0 }}>◆</span>
      <span style={{ color: cfg.color, fontWeight: 700, letterSpacing: '0.1em', fontSize: 10 }}>
        {cfg.emoji} {cfg.label.toUpperCase()}
      </span>
      <span style={{ color: '#1a4a22' }}>◈</span>
      {severity && (
        <>
          <span style={{ color: severity.color, fontWeight: 700, fontSize: 10 }}>{severity.text}</span>
          <span style={{ color: '#1a4a22' }}>◈</span>
        </>
      )}
      {location && (
        <>
          <span style={{ color: '#6aaa30', fontSize: 10 }}>{location}</span>
          <span style={{ color: '#1a4a22' }}>◈</span>
        </>
      )}
      <span style={{ color: '#b8f040', fontSize: 10 }}>
        {ev.title.length > 50 ? ev.title.slice(0, 50) + '…' : ev.title}
      </span>
      <span style={{ color: '#3a6828', fontSize: 9, marginLeft: 4 }}>{timeAgo(ev.date)}</span>
      <span style={{ color: '#1a4a22', marginLeft: 12, fontSize: 11 }}>│</span>
    </button>
  );
}

export default function TickerBar({ events, onEventClick }: TickerBarProps) {
  const items = events.slice(0, 80);
  // Fast scroll: ~1s per item, min 10s, max 40s
  const duration = events.length === 0 ? 0 : Math.max(10, Math.min(40, items.length * 1));

  return (
    <div
      className="flex-shrink-0 overflow-hidden relative select-none"
      style={{
        height: 36,
        minHeight: 36,
        background: '#020804',
        borderTop: '1px solid #1a4a22',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.6)',
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 z-10 flex items-center gap-1.5 px-2"
        style={{
          background: '#020804',
          borderRight: '2px solid #d4aa00',
          fontFamily: "'Share Tech Mono', monospace",
          color: '#d4aa00',
          fontSize: 9,
          letterSpacing: '0.2em',
          minWidth: 72,
        }}
      >
        <span style={{ color: '#ff3300', fontSize: 7 }}>◆</span>
        LIVE FEED
      </div>

      <div className="absolute inset-0" style={{ left: 72, overflow: 'hidden' }}>
        {events.length === 0 ? (
          <div
            className="flex items-center h-full px-6 text-[10px] tracking-widest"
            style={{ color: '#3a6828', fontFamily: "'Share Tech Mono', monospace" }}
          >
            ◈ STANDBY — AWAITING TELEMETRY ◈
          </div>
        ) : (
          <div
            className="flex items-center h-full"
            style={{
              animation: `ticker-scroll ${duration}s linear infinite`,
              willChange: 'transform',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.animationPlayState = 'paused'; }}
            onMouseLeave={(e) => { e.currentTarget.style.animationPlayState = 'running'; }}
          >
            {[...items, ...items].map((ev, i) => (
              <TickerItem key={`${ev.id}-${i}`} ev={ev} onEventClick={onEventClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
