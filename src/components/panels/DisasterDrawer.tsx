'use client';

import type { DisasterEvent } from '@/types/disaster';
import type { EnrichedArticle } from '@/types/event';
import { DISASTER_CONFIG } from '@/types/disaster';
import { getMarkerState } from '@/lib/markerState';
import Badge from '@/components/ui/Badge';
import ArticleCard from './ArticleCard';
import Spinner from '@/components/ui/Spinner';
import ErrorBanner from '@/components/ui/ErrorBanner';

interface DisasterDrawerProps {
  event: DisasterEvent | null;
  articles: EnrichedArticle[];
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString([], {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const ALERT_COLOR: Record<string, string> = {
  red: '#ff3300', orange: '#ff8c00', yellow: '#d4aa00', green: '#44ff66',
};

const mono = { fontFamily: "'Share Tech Mono', monospace" };

function DataRow({ label, value, valueColor }: { label: string; value: React.ReactNode; valueColor?: string }) {
  return (
    <div className="flex justify-between items-center py-1 px-4 text-[11px]"
         style={{ borderBottom: '1px solid #0c1f10', ...mono }}>
      <span style={{ color: '#3a6828', letterSpacing: '0.08em' }}>{label}</span>
      <span style={{ color: valueColor ?? '#b8f040' }}>{value}</span>
    </div>
  );
}

export default function DisasterDrawer({ event, articles, isLoading, error, onClose }: DisasterDrawerProps) {
  const isOpen = event !== null;
  const cfg = event ? DISASTER_CONFIG[event.disasterType] : null;

  return (
    <div
      className={`drawer-panel fixed top-0 right-0 h-full w-full sm:w-[380px] z-[1100] flex flex-col ${isOpen ? 'open' : ''}`}
      style={{ background: '#06100a', borderLeft: `2px solid ${cfg?.color ?? '#1a4a22'}`, ...mono }}
    >
      {event && cfg ? (
        <>
          {/* Coloured header stripe */}
          <div className="h-0.5" style={{ background: cfg.color, boxShadow: `0 0 12px ${cfg.color}` }} />

          {/* Header */}
          <div className="flex items-start justify-between gap-3 p-4"
               style={{ borderBottom: '1px solid #1a4a22' }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{cfg.emoji}</span>
                <span className="text-[10px] font-bold tracking-widest"
                      style={{ color: cfg.color, letterSpacing: '0.2em' }}>
                  ── {cfg.label.toUpperCase()} ──
                </span>
                <Badge state={getMarkerState(event.date)} />
              </div>
              <div className="text-[11px] leading-snug" style={{ color: '#b8f040' }}>{event.title}</div>
              <div className="text-[10px] mt-0.5" style={{ color: '#3a6828' }}>{formatDate(event.date)}</div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 px-2 py-1 text-sm transition-colors"
              style={{ border: '1px solid #1a4a22', color: '#3a6828', background: '#06100a' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ff3300')}
              onMouseLeave={e => (e.currentTarget.style.color = '#3a6828')}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Section label */}
          <div className="px-4 py-1 text-[9px] tracking-widest"
               style={{ color: '#d4aa00', borderBottom: '1px solid #1a4a22', letterSpacing: '0.2em' }}>
            ── INCIDENT DATA ──
          </div>

          {/* Data rows */}
          {event.magnitude != null && (
            <DataRow label="MAGNITUDE" value={`${event.magnitude.toFixed(1)} ${event.magnitudeUnit ?? ''}`} valueColor={cfg.color} />
          )}
          {event.depth != null && (
            <DataRow label="DEPTH" value={`${event.depth.toFixed(0)} KM`} />
          )}
          {event.alertLevel && (
            <DataRow label="ALERT" value={event.alertLevel.toUpperCase()} valueColor={ALERT_COLOR[event.alertLevel]} />
          )}
          <DataRow label="COORDS" value={`${event.lat.toFixed(3)}° ${event.lng.toFixed(3)}°`} />
          <DataRow label="SOURCE" value={
            <a href={event.url} target="_blank" rel="noopener noreferrer"
               style={{ color: '#44ff66', textDecoration: 'underline' }}>
              {event.source.toUpperCase()}
            </a>
          } />

          {/* Intel feed */}
          <div className="px-4 py-1 text-[9px] tracking-widest mt-1"
               style={{ color: '#d4aa00', borderBottom: '1px solid #1a4a22', borderTop: '1px solid #1a4a22', letterSpacing: '0.2em' }}>
            ── INTEL FEED ──
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <Spinner size={24} />
              </div>
            )}
            {error && !isLoading && (
              <div className="p-4"><ErrorBanner message={error} /></div>
            )}
            {!isLoading && !error && articles.length === 0 && (
              <div className="p-6 text-center text-[11px]" style={{ color: '#3a6828' }}>
                NO INTEL AVAILABLE FOR THIS SECTOR
              </div>
            )}
            {!isLoading && articles.length > 0 && (
              <div className="p-2 space-y-1.5">
                {articles.map((a, i) => (
                  <ArticleCard key={a.url + i} article={a} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-[11px] px-6 text-center"
             style={{ color: '#3a6828' }}>
          SELECT TARGET ON TACTICAL DISPLAY
        </div>
      )}
    </div>
  );
}
