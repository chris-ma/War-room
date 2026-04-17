import type { GdeltArtListResponse } from '@/types/gdelt';

const BASE = 'https://api.gdeltproject.org/api/v2/doc/doc';

// GDELT dates: "YYYYMMDDTHHmmssZ" — NOT standard ISO 8601
export function parseGdeltDate(seendate: string): Date {
  const fixed = seendate.replace(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
    '$1-$2-$3T$4:$5:$6Z'
  );
  return new Date(fixed);
}

export async function fetchGdeltArtList(
  location: string,
  timespanMinutes = 720,
  maxRecords = 20
): Promise<import('@/types/gdelt').GdeltArticle[]> {
  const query = `disaster outbreak emergency ${location}`;
  const url = `${BASE}?query=${encodeURIComponent(query)}&mode=ArtList&format=json&timespan=${timespanMinutes}&maxrecords=${maxRecords}&sort=DateDesc`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`GDELT artlist error: ${res.status}`);
  const json: GdeltArtListResponse = await res.json();
  return json.articles ?? [];
}
