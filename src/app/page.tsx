'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { ClusteredEvent } from '@/types/event';
import { useEvents } from '@/hooks/useEvents';
import { useArticles } from '@/hooks/useArticles';
import { useFilters } from '@/hooks/useFilters';
import TopBar from '@/components/filters/TopBar';
import ArticleDrawer from '@/components/panels/ArticleDrawer';

const MapWrapper = dynamic(() => import('@/components/map/MapWrapper'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-bg-primary text-text-muted text-sm">
      Loading map...
    </div>
  ),
});

export default function HomePage() {
  const { filters, setQuery, setTimeRange } = useFilters();
  const { events, isLoading, error: eventsError, lastUpdated, refresh } = useEvents(filters);
  const { articles, isLoading: articlesLoading, error: articlesError, fetchArticles, clear } = useArticles();

  const [selectedEvent, setSelectedEvent] = useState<ClusteredEvent | null>(null);
  const drawerOpen = selectedEvent !== null;

  const handleMarkerClick = useCallback(
    (event: ClusteredEvent) => {
      setSelectedEvent(event);
      fetchArticles(event.id, event.location);
    },
    [fetchArticles]
  );

  const handleDrawerClose = useCallback(() => {
    setSelectedEvent(null);
    clear();
  }, [clear]);

  return (
    <div className="h-full flex flex-col">
      <TopBar
        filters={filters}
        onQueryChange={setQuery}
        onTimeRangeChange={setTimeRange}
        eventCount={events.length}
        lastUpdated={lastUpdated}
        isLoading={isLoading}
        onRefresh={refresh}
      />

      {eventsError && (
        <div className="px-4 py-1 bg-red-900/20 text-red-400 text-xs border-b border-red-900/40">
          ⚠ {eventsError} — showing cached data
        </div>
      )}

      <div className="flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{ right: drawerOpen ? 380 : 0 }}
        >
          <MapWrapper
            events={events}
            selectedEventId={selectedEvent?.id ?? null}
            onMarkerClick={handleMarkerClick}
            drawerOpen={drawerOpen}
          />
        </div>

        <ArticleDrawer
          event={selectedEvent}
          articles={articles}
          isLoading={articlesLoading}
          error={articlesError}
          onClose={handleDrawerClose}
        />
      </div>
    </div>
  );
}
