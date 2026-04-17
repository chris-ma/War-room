'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { ClusteredEvent } from '@/types/event';
import type { DisasterEvent, ActiveLayer } from '@/types/disaster';
import { useEvents } from '@/hooks/useEvents';
import { useDisasters } from '@/hooks/useDisasters';
import { useArticles } from '@/hooks/useArticles';
import { useFilters } from '@/hooks/useFilters';
import TopBar from '@/components/filters/TopBar';
import ArticleDrawer from '@/components/panels/ArticleDrawer';
import DisasterDrawer from '@/components/panels/DisasterDrawer';

const MapWrapper = dynamic(() => import('@/components/map/MapWrapper'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-bg-primary text-text-muted text-sm">
      Loading map...
    </div>
  ),
});

export default function HomePage() {
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>('conflict');

  const { filters, setQuery, setTimeRange } = useFilters();

  const conflictEnabled = activeLayer === 'conflict' || activeLayer === 'both';
  const disasterEnabled = activeLayer === 'disaster' || activeLayer === 'both';

  const {
    events,
    isLoading: conflictLoading,
    error: conflictError,
    lastUpdated: conflictUpdated,
    refresh: refreshConflict,
  } = useEvents(filters);

  const {
    events: disasterEvents,
    isLoading: disasterLoading,
    error: disasterError,
    lastUpdated: disasterUpdated,
    refresh: refreshDisasters,
  } = useDisasters(disasterEnabled);

  const {
    articles,
    isLoading: articlesLoading,
    error: articlesError,
    fetchArticles,
    clear: clearArticles,
  } = useArticles();

  // Conflict drawer state
  const [selectedEvent, setSelectedEvent] = useState<ClusteredEvent | null>(null);
  // Disaster drawer state
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterEvent | null>(null);

  const drawerOpen = selectedEvent !== null || selectedDisaster !== null;

  const handleMarkerClick = useCallback(
    (event: ClusteredEvent) => {
      setSelectedDisaster(null);
      setSelectedEvent(event);
      fetchArticles(event.id, event.location);
    },
    [fetchArticles]
  );

  const handleDisasterClick = useCallback(
    (event: DisasterEvent) => {
      setSelectedEvent(null);
      setSelectedDisaster(event);
      // Fetch articles related to the disaster title/location
      fetchArticles(event.id, event.title);
    },
    [fetchArticles]
  );

  const handleConflictClose = useCallback(() => {
    setSelectedEvent(null);
    clearArticles();
  }, [clearArticles]);

  const handleDisasterClose = useCallback(() => {
    setSelectedDisaster(null);
    clearArticles();
  }, [clearArticles]);

  const handleRefresh = useCallback(() => {
    if (conflictEnabled) refreshConflict();
    if (disasterEnabled) refreshDisasters();
  }, [conflictEnabled, disasterEnabled, refreshConflict, refreshDisasters]);

  const isLoading = conflictLoading || disasterLoading;
  const totalCount = (conflictEnabled ? events.length : 0) + (disasterEnabled ? disasterEvents.length : 0);
  const lastUpdated = disasterUpdated ?? conflictUpdated;
  const anyError = conflictError ?? disasterError;

  return (
    <div className="h-full flex flex-col">
      <TopBar
        filters={filters}
        onQueryChange={setQuery}
        onTimeRangeChange={setTimeRange}
        activeLayer={activeLayer}
        onLayerChange={(layer) => {
          setActiveLayer(layer);
          setSelectedEvent(null);
          setSelectedDisaster(null);
          clearArticles();
        }}
        eventCount={totalCount}
        lastUpdated={lastUpdated}
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />

      {anyError && (
        <div className="px-4 py-1 bg-red-900/20 text-red-400 text-xs border-b border-red-900/40">
          ⚠ {anyError} — showing cached data
        </div>
      )}

      <div className="flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{ right: drawerOpen ? 380 : 0 }}
        >
          <MapWrapper
            events={conflictEnabled ? events : []}
            disasterEvents={disasterEnabled ? disasterEvents : []}
            activeLayer={activeLayer}
            selectedEventId={selectedEvent?.id ?? null}
            selectedDisasterId={selectedDisaster?.id ?? null}
            onMarkerClick={handleMarkerClick}
            onDisasterClick={handleDisasterClick}
            drawerOpen={drawerOpen}
          />
        </div>

        {/* Conflict article drawer */}
        <ArticleDrawer
          event={selectedEvent}
          articles={articles}
          isLoading={articlesLoading}
          error={articlesError}
          onClose={handleConflictClose}
        />

        {/* Disaster detail + articles drawer */}
        <DisasterDrawer
          event={selectedDisaster}
          articles={articles}
          isLoading={articlesLoading}
          error={articlesError}
          onClose={handleDisasterClose}
        />
      </div>
    </div>
  );
}
