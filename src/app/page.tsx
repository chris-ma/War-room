'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { DisasterEvent } from '@/types/disaster';
import { useDisasters } from '@/hooks/useDisasters';
import { useArticles } from '@/hooks/useArticles';
import TopBar from '@/components/filters/TopBar';
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
  const { events, isLoading, error, lastUpdated, refresh } = useDisasters();
  const { articles, isLoading: articlesLoading, error: articlesError, fetchArticles, clear: clearArticles } = useArticles();
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterEvent | null>(null);

  const drawerOpen = selectedDisaster !== null;

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
        eventCount={events.length}
        lastUpdated={lastUpdated}
        isLoading={isLoading}
        onRefresh={refresh}
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
            disasterEvents={events}
            selectedDisasterId={selectedDisaster?.id ?? null}
            onDisasterClick={handleDisasterClick}
            drawerOpen={drawerOpen}
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
    </div>
  );
}
