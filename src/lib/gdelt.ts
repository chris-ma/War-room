import type { GdeltArticle, GdeltArtGeoResponse, GdeltArtListResponse } from '@/types/gdelt';

const BASE = 'https://api.gdeltproject.org/api/v2/doc/doc';
const MAX_RECORDS = parseInt(process.env.GDELT_MAX_RECORDS ?? '250', 10);

// GDELT dates: "YYYYMMDDTHHmmssZ" — NOT standard ISO 8601
export function parseGdeltDate(seendate: string): Date {
  const fixed = seendate.replace(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
    '$1-$2-$3T$4:$5:$6Z'
  );
  return new Date(fixed);
}

const CONFLICT_QUERY =
  'conflict war military airstrike battle protest coup terrorism';

// Targeted queries for active conflict zones that often get crowded out
// by the global 250-record cap on the general query.
const HOTSPOT_QUERIES = [
  'Ukraine Russia war military Kyiv Kharkiv Zaporizhzhia',
  'Gaza Israel Palestine Hamas airstrike ceasefire',
  'Syria Iraq Iran missile attack',
  'Sudan Yemen Houthi civil war',
];

async function fetchArtGeoQuery(
  query: string,
  timespanMinutes: number,
  maxRecords: number
): Promise<GdeltArticle[]> {
  const url = `${BASE}?query=${encodeURIComponent(query)}&mode=artgeo&format=json&timespan=${timespanMinutes}&maxrecords=${maxRecords}&sort=DateDesc`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) return [];
  const json: GdeltArtGeoResponse = await res.json();
  return (json.articles ?? []).filter((a) => a.geolat != null && a.geolong != null);
}

export async function fetchGdeltArtGeo(
  timespanMinutes: number,
  extraQuery = ''
): Promise<GdeltArticle[]> {
  const generalQuery = [CONFLICT_QUERY, extraQuery].filter(Boolean).join(' ');

  // Run general + hotspot queries in parallel; allocate ~100 records to general,
  // ~40 each to hotspots so known active zones always have representation.
  const perHotspot = 40;
  const generalMax = Math.max(MAX_RECORDS - HOTSPOT_QUERIES.length * perHotspot, 100);

  const [general, ...hotspots] = await Promise.all([
    fetchArtGeoQuery(generalQuery, timespanMinutes, generalMax),
    ...HOTSPOT_QUERIES.map((q) => fetchArtGeoQuery(q, timespanMinutes, perHotspot)),
  ]);

  // Deduplicate by URL, keeping the first occurrence (general query takes priority)
  const seen = new Set<string>();
  const merged: GdeltArticle[] = [];
  for (const article of [...general, ...hotspots.flat()]) {
    if (!seen.has(article.url)) {
      seen.add(article.url);
      merged.push(article);
    }
  }
  return merged;
}

export async function fetchGdeltArtList(
  location: string,
  timespanMinutes = 720,
  maxRecords = 20
): Promise<GdeltArticle[]> {
  const query = `conflict ${location}`;
  const url = `${BASE}?query=${encodeURIComponent(query)}&mode=ArtList&format=json&timespan=${timespanMinutes}&maxrecords=${maxRecords}&sort=DateDesc`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`GDELT artlist error: ${res.status}`);

  const json: GdeltArtListResponse = await res.json();
  return json.articles ?? [];
}
