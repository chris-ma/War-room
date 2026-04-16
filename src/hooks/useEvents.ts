'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ClusteredEvent } from '@/types/event';
import type { FilterState } from '@/types/filters';
import { TIME_RANGE_MINUTES } from '@/types/filters';
import { getMarkerState } from '@/lib/markerState';

const POLL_INTERVAL_MS = 60_000;
const AGE_UPDATE_MS = 30_000;

export function useEvents(filters: FilterState) {
  const [allEvents, setAllEvents] = useState<ClusteredEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [tick, setTick] = useState(0);
  const prevIdsRef = useRef<Set<string>>(new Set());

  const fetchEvents = useCallback(async () => {
    const timespan = TIME_RANGE_MINUTES[filters.timeRange];
    const params = new URLSearchParams({
      timespan: String(timespan),
      ...(filters.query ? { query: filters.query } : {}),
    });

    try {
      const res = await fetch(`/api/events?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAllEvents(data.events ?? []);
      setLastUpdated(new Date());
      setError(null);

      // Track new event IDs for potential future pulse highlighting
      const newIds = new Set<string>((data.events ?? []).map((e: ClusteredEvent) => e.id));
      prevIdsRef.current = newIds;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [filters.timeRange, filters.query]);

  // Initial fetch + polling
  useEffect(() => {
    fetchEvents();
    const id = setInterval(fetchEvents, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchEvents]);

  // Periodic tick to re-derive marker states (so markers age visually)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), AGE_UPDATE_MS);
    return () => clearInterval(id);
  }, []);

  // Client-side filtering + state re-derivation
  const events = allEvents
    .map((e) => ({ ...e, state: getMarkerState(e.lastSeen) }))
    .filter((e) => {
      if (filters.regions.length > 0 && !filters.regions.includes(e.country)) return false;
      if (filters.query) {
        const q = filters.query.toLowerCase();
        if (!e.location.toLowerCase().includes(q) && !e.country.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map((e) => ({ ...e, _tick: tick })) as ClusteredEvent[];

  return { events, isLoading, error, lastUpdated, refresh: fetchEvents };
}
