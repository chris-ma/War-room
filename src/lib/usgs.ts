import type { DisasterEvent } from '@/types/disaster';
import { getMarkerState } from './markerState';

interface UsgsFeature {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;   // ms since epoch
    url: string;
    alert: string | null;  // "green" | "yellow" | "orange" | "red"
    type: string;
    title: string;
    tsunami: number;
    sig: number;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number, number]; // [lng, lat, depth_km]
  };
}

interface UsgsGeoJson {
  type: 'FeatureCollection';
  features: UsgsFeature[];
}

const FEEDS = [
  // M4.5+ last 24h — current breaking events
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson',
  // Significant earthquakes last week — broader context
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson',
];

function parseAlert(alert: string | null): DisasterEvent['alertLevel'] {
  if (alert === 'red')    return 'red';
  if (alert === 'orange') return 'orange';
  if (alert === 'yellow') return 'yellow';
  if (alert === 'green')  return 'green';
  return undefined;
}

export async function fetchUsgsEarthquakes(): Promise<DisasterEvent[]> {
  const results = await Promise.allSettled(
    FEEDS.map((url) => fetch(url, { next: { revalidate: 0 } }).then((r) => r.json() as Promise<UsgsGeoJson>))
  );

  const seen = new Set<string>();
  const events: DisasterEvent[] = [];

  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    const data = result.value;
    for (const f of data.features ?? []) {
      if (seen.has(f.id)) continue;
      seen.add(f.id);

      const [lng, lat, depth] = f.geometry.coordinates;
      const date = new Date(f.properties.time).toISOString();
      const mag = f.properties.mag ?? 0;

      // Treat tsunamis as their own subtype
      const disasterType = f.properties.tsunami === 1 ? 'tsunami' : 'earthquake';

      events.push({
        id: `usgs_${f.id}`,
        disasterType,
        title: f.properties.title,
        lat,
        lng,
        date,
        magnitude: mag,
        magnitudeUnit: 'Mw',
        alertLevel: parseAlert(f.properties.alert),
        depth: depth ?? undefined,
        source: 'usgs',
        url: f.properties.url,
        state: getMarkerState(date),
      });
    }
  }

  return events;
}
