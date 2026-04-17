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

export default function DisasterDrawer({ event, articles, isLoading, error, onClose }: DisasterDrawerProps) {
  const isOpen = event !== null;

  return (
    <div
      className={`drawer-panel fixed top-0 right-0 h-full w-full sm:w-[380px] bg-bg-secondary border-l border-border z-[1100] flex flex-col shadow-2xl ${isOpen ? 'open' : ''}`}
    >
      {event ? (
        <>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 p-4 border-b border-border">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg">{DISASTER_CONFIG[event.disasterType].emoji}</span>
                <span
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: DISASTER_CONFIG[event.disasterType].color }}
                >
                  {DISASTER_CONFIG[event.disasterType].label}
                </span>
                <Badge state={getMarkerState(event.date)} />
              </div>
              <h2 className="text-text-primary font-semibold text-sm mt-1 leading-snug">{event.title}</h2>
              <p className="text-text-muted text-[11px] mt-0.5">{formatDate(event.date)}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors text-lg"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Event details */}
          <div className="px-4 py-3 border-b border-border space-y-1.5">
            {event.magnitude != null && (
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Magnitude</span>
                <span className="text-text-primary font-semibold">
                  {event.magnitude.toFixed(1)} {event.magnitudeUnit ?? ''}
                </span>
              </div>
            )}
            {event.depth != null && (
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Depth</span>
                <span className="text-text-primary">{event.depth.toFixed(0)} km</span>
              </div>
            )}
            {event.alertLevel && (
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Alert Level</span>
                <span
                  className="font-semibold capitalize"
                  style={{ color: event.alertLevel === 'red' ? '#ef4444' : event.alertLevel === 'orange' ? '#f97316' : event.alertLevel === 'yellow' ? '#eab308' : '#22c55e' }}
                >
                  {event.alertLevel}
                </span>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Location</span>
              <span className="text-text-primary text-right max-w-[180px]">
                {event.lat.toFixed(3)}°, {event.lng.toFixed(3)}°
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Source</span>
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline uppercase"
              >
                {event.source}
              </a>
            </div>
          </div>

          {/* Related articles */}
          <div className="px-4 py-2 border-b border-border">
            <p className="text-text-muted text-[10px] uppercase tracking-wide font-semibold">Related News</p>
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
              <div className="p-6 text-center text-text-muted text-sm">
                No related articles found.
              </div>
            )}
            {!isLoading && articles.length > 0 && (
              <div className="p-3 space-y-2">
                {articles.map((a, i) => (
                  <ArticleCard key={a.url + i} article={a} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-text-muted text-sm px-6 text-center">
          Click a disaster marker to view event details and related news.
        </div>
      )}
    </div>
  );
}
