import type { GdeltArticle, GdeltArtGeoResponse } from '@/types/gdelt';
import type { DisasterEvent } from '@/types/disaster';
import { parseGdeltDate } from './gdelt';
import { getMarkerState } from './markerState';

const BASE = 'https://api.gdeltproject.org/api/v2/doc/doc';

const DISEASE_QUERY =
  'outbreak epidemic disease virus pandemic pathogen ' +
  'cholera ebola mpox dengue malaria measles meningitis ' +
  'avian influenza bird flu H5N1 plague Marburg Lassa ' +
  'WHO health emergency alert public health';

// Deduplicate epidemic events: keep only one per ~150 km radius
function dedupeByProximity(events: DisasterEvent[], radiusKm = 150): DisasterEvent[] {
  const kept: DisasterEvent[] = [];
  for (const ev of events) {
    const tooClose = kept.some((k) => {
      const dLat = (ev.lat - k.lat) * 111;
      const dLng = (ev.lng - k.lng) * 111 * Math.cos((ev.lat * Math.PI) / 180);
      return Math.sqrt(dLat * dLat + dLng * dLng) < radiusKm;
    });
    if (!tooClose) kept.push(ev);
  }
  return kept;
}

export async function fetchEpidemicEvents(timespanMinutes = 10080): Promise<DisasterEvent[]> {
  const url = `${BASE}?query=${encodeURIComponent(DISEASE_QUERY)}&mode=artgeo&format=json&timespan=${timespanMinutes}&maxrecords=80&sort=DateDesc`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) return [];

  const json: GdeltArtGeoResponse = await res.json();
  const articles: GdeltArticle[] = (json.articles ?? []).filter(
    (a) => a.geolat != null && a.geolong != null
  );

  const events: DisasterEvent[] = articles.map((a) => {
    const date = parseGdeltDate(a.seendate);
    return {
      id: `epidemic_${Buffer.from(a.url).toString('base64').slice(0, 16)}`,
      disasterType: 'epidemic',
      title: a.title,
      lat: a.geolat!,
      lng: a.geolong!,
      date: date.toISOString(),
      source: 'gdelt',
      url: a.url,
      country: a.geocountry ?? a.sourcecountry,
      state: getMarkerState(date),
    };
  });

  return dedupeByProximity(events);
}
