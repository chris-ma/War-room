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

export async function fetchGdeltArtGeo(
  timespanMinutes: number,
  extraQuery = ''
): Promise<GdeltArticle[]> {
  const query = [CONFLICT_QUERY, extraQuery].filter(Boolean).join(' ');
  const url = `${BASE}?query=${encodeURIComponent(query)}&mode=artgeo&format=json&timespan=${timespanMinutes}&maxrecords=${MAX_RECORDS}&sort=DateDesc`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`GDELT artgeo error: ${res.status}`);

  const json: GdeltArtGeoResponse = await res.json();
  return (json.articles ?? []).filter(
    (a) => a.geolat != null && a.geolong != null
  );
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
