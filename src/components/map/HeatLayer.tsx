'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import type { DisasterEvent } from '@/types/disaster';

interface HeatLayerProps {
  events: DisasterEvent[];
  visible: boolean;
}

const INTENSITY: Record<string, number> = {
  breaking:   1.0,
  recent:     0.7,
  active:     0.4,
  historical: 0.15,
};

export default function HeatLayer({ events, visible }: HeatLayerProps) {
  const map = useMap();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layerRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function mount() {
      await import('leaflet.heat');
      if (cancelled) return;

      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      if (!visible || events.length === 0) return;

      const points: [number, number, number][] = events.map((e) => [
        e.lat,
        e.lng,
        INTENSITY[e.state] ?? 0.2,
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      layerRef.current = (L as any).heatLayer(points, {
        radius: 35,
        blur: 25,
        maxZoom: 8,
        gradient: { 0.15: '#002244', 0.4: '#d4aa00', 0.7: '#ff8c00', 1.0: '#ff3300' },
      }).addTo(map);
    }

    mount();
    return () => {
      cancelled = true;
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, events, visible]);

  return null;
}
