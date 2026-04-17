import type { DisasterEvent, DisasterSubtype } from '@/types/disaster';
import { getMarkerState } from './markerState';

interface EonetGeometry {
  magnitudeValue: number | null;
  magnitudeUnit: string | null;
  date: string;
  type: 'Point' | 'Polygon';
  coordinates: number[] | number[][][];
}

interface EonetEvent {
  id: string;
  title: string;
  link: string;
  closed: string | null;
  categories: { id: string; title: string }[];
  sources: { id: string; url: string }[];
  geometry: EonetGeometry[];
}

interface EonetResponse {
  events?: EonetEvent[];
}

const CATEGORY_MAP: Record<string, DisasterSubtype> = {
  wildfires:    'wildfire',
  volcanoes:    'volcano',
  severeStorms: 'severe_storm',
  floods:       'flood',
  landslides:   'landslide',
  drought:      'drought',
  earthquakes:  'earthquake',  // fallback — USGS is primary for EQ
};

// Open events from the last 14 days
const EONET_URL =
  'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=200&days=14';

export async function fetchEonetEvents(): Promise<DisasterEvent[]> {
  const res = await fetch(EONET_URL, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`EONET error: ${res.status}`);

  const data: EonetResponse = await res.json();
  const events: DisasterEvent[] = [];

  for (const ev of data.events ?? []) {
    const categoryId = ev.categories[0]?.id ?? '';
    const disasterType: DisasterSubtype = CATEGORY_MAP[categoryId] ?? 'severe_storm';

    // Use the most recent geometry point
    const geos = ev.geometry.filter((g) => g.type === 'Point');
    if (geos.length === 0) continue;

    const geo = geos[geos.length - 1]; // most recent
    const coords = geo.coordinates as [number, number];
    const lng = coords[0];
    const lat = coords[1];
    const date = geo.date;

    const sourceUrl = ev.sources[0]?.url ?? ev.link;

    events.push({
      id: `eonet_${ev.id}`,
      disasterType,
      title: ev.title,
      lat,
      lng,
      date,
      magnitude: geo.magnitudeValue ?? undefined,
      magnitudeUnit: geo.magnitudeUnit ?? undefined,
      source: 'eonet',
      url: sourceUrl,
      state: getMarkerState(date),
    });
  }

  return events;
}
