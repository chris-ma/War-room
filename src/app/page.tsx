'use client';

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { DisasterEvent, DisasterSubtype } from '@/types/disaster';
import { ALL_DISASTER_TYPES, TIME_RANGE_HOURS, type TimeRange } from '@/types/filters';
import { useDisasters } from '@/hooks/useDisasters';
import { useArticles } from '@/hooks/useArticles';
import { useNotifications } from '@/hooks/useNotifications';
import TopBar from '@/components/filters/TopBar';
import FilterBar from '@/components/filters/FilterBar';
import DisasterDrawer from '@/components/panels/DisasterDrawer';
import TickerBar from '@/components/ui/TickerBar';

const MapWrapper = dynamic(() => import('@/components/map/MapWrapper'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-bg-primary text-text-muted text-sm">
      Loading map...
    </div>
  ),
});

export default function HomePage() {
  const { events, isLoading, error, lastUpdated, refresh } = useDisasters();
  const { articles, isLoading: articlesLoading, error: articlesError, fetchArticles, clear: clearArticles } = useArticles();
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterEvent | null>(null);

  // Filters
  const [activeTypes, setActiveTypes] = useState<Set<DisasterSubtype>>(
    () => new Set(ALL_DISASTER_TYPES)
  );
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [showHeatMap, setShowHeatMap] = useState(false);

  // Notifications
  const { requestPermission } = useNotifications(events);

  const drawerOpen = selectedDisaster !== null;

  // Apply filters client-side
  const filteredEvents = useMemo(() => {
    const cutoffMs = Date.now() - TIME_RANGE_HOURS[timeRange] * 60 * 60 * 1000;
    return events.filter(
      (e) =>
        activeTypes.has(e.disasterType) &&
        new Date(e.date).getTime() >= cutoffMs
    );
  }, [events, activeTypes, timeRange]);

  const handleToggleType = useCallback((type: DisasterSubtype) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const handleDisasterClick = useCallback((event: DisasterEvent) => {
    setSelectedDisaster(event);
    fetchArticles(event.id, event.title);
  }, [fetchArticles]);

  const handleDisasterClose = useCallback(() => {
    setSelectedDisaster(null);
    clearArticles();
  }, [clearArticles]);

  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>
      <TopBar
        eventCount={filteredEvents.length}
        lastUpdated={lastUpdated}
        isLoading={isLoading}
        onRefresh={refresh}
      />

      <FilterBar
        activeTypes={activeTypes}
        timeRange={timeRange}
        showHeatMap={showHeatMap}
        onToggleType={handleToggleType}
        onSetTimeRange={setTimeRange}
        onToggleHeatMap={() => setShowHeatMap((v) => !v)}
        onRequestNotifications={requestPermission}
      />

      {error && (
        <div className="px-4 py-1 bg-red-900/20 text-red-400 text-xs border-b border-red-900/40">
          ⚠ {error} — showing cached data
        </div>
      )}

      <div className="flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{ right: drawerOpen ? 380 : 0 }}
        >
          <MapWrapper
            disasterEvents={filteredEvents}
            selectedDisasterId={selectedDisaster?.id ?? null}
            onDisasterClick={handleDisasterClick}
            drawerOpen={drawerOpen}
            showHeatMap={showHeatMap}
          />
        </div>

        <DisasterDrawer
          event={selectedDisaster}
          articles={articles}
          isLoading={articlesLoading}
          error={articlesError}
          onClose={handleDisasterClose}
        />
      </div>

      <TickerBar events={filteredEvents} onEventClick={handleDisasterClick} />
    </div>
  );
}
