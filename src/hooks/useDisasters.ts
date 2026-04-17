'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DisasterEvent } from '@/types/disaster';
import { getMarkerState } from '@/lib/markerState';

const POLL_INTERVAL_MS = 5 * 60_000; // 5 min — USGS/EONET update infrequently

export function useDisasters(enabled: boolean) {
  const [events, setEvents] = useState<DisasterEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDisasters = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/disasters');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const refreshed = (data.events ?? []).map((e: DisasterEvent) => ({
        ...e,
        state: getMarkerState(e.date),
      }));
      setEvents(refreshed);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) { setEvents([]); return; }
    fetchDisasters();
    const id = setInterval(fetchDisasters, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [enabled, fetchDisasters]);

  return { events, isLoading, error, lastUpdated, refresh: fetchDisasters };
}
