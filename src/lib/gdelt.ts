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

// Broad vocabulary so GDELT matches any armed conflict signal
const CONFLICT_QUERY =
  'war conflict military airstrike battle offensive assault ' +
  'shelling bombardment troops invasion occupation ceasefire ' +
  'casualties killed soldiers attack coup terrorism insurgency ' +
  'rebel gunfire explosion missile drone strike weapons clashes';

// One targeted query per coherent conflict zone.
// Each runs in parallel with the general query so no active war gets
// crowded out by the global MAX_RECORDS cap.
const HOTSPOT_QUERIES: string[] = [
  // Eastern Europe
  'Ukraine Russia war Kyiv Kharkiv Zaporizhzhia Donbas offensive troops',
  // Levant
  'Gaza Palestine Hamas airstrike Rafah West Bank ceasefire hostage',
  'Israel Lebanon Hezbollah Beirut south Lebanon rocket',
  // MENA
  'Syria Damascus Aleppo Idlib civil war government rebel',
  'Iraq militia attack Baghdad Erbil Iran-backed',
  'Yemen Houthi Saudi Arabia Red Sea ship missile Aden',
  'Iran military nuclear sanctions tensions',
  // Africa – Horn & East
  'Sudan RSF SAF civil war Khartoum Darfur Port Sudan',
  'Congo DRC M23 ADF Goma Kivu FARDC rebel',
  'Somalia Al-Shabaab Mogadishu Puntland AMISOM attack',
  'Ethiopia Amhara Fano militia Addis Ababa conflict',
  'Mozambique Cabo Delgado insurgency ISCAP ISIS',
  // Africa – West & Sahel
  'Mali Burkina Faso Niger Sahel jihadist coup Wagner junta',
  'Nigeria Boko Haram ISWAP bandits kidnap Abuja Maiduguri',
  'Cameroon Anglophone separatist Ambazonia',
  // Asia & Pacific
  'Myanmar civil war military junta PDF NUG Mandalay Yangon',
  'Afghanistan Taliban Kabul attack Kandahar ISIS-K',
  'Pakistan TTP Balochistan terrorist attack Peshawar',
  'Kashmir India Pakistan border Line of Control skirmish',
  'Taiwan China PLA strait military exercise tension',
  'Philippines Abu Sayyaf NPA insurgency Mindanao',
  // Americas
  'Haiti gang violence Port-au-Prince Cite Soleil armed',
  'Colombia ELN FARC dissident guerrilla Cali Bogota',
  'Ecuador Mexico cartel narco gang violence',
  // Central Asia / Caucasus
  'Armenia Azerbaijan Nagorno Karabakh border',
  'Georgia Russia tension South Ossetia Abkhazia',
];

// Countries covered by the static list above, used in dynamic discovery
// to avoid duplicating queries for already-covered zones.
const COVERED_COUNTRIES = new Set([
  'Ukraine','Russia','Israel','Palestine','Palestinian Territory','Lebanon',
  'Syria','Iraq','Iran','Yemen','Sudan','Congo',
  'Democratic Republic of Congo','DRC','Somalia','Ethiopia','Mozambique',
  'Mali','Burkina Faso','Niger','Nigeria','Cameroon','Myanmar','Afghanistan',
  'Pakistan','India','Taiwan','China','Philippines','Haiti','Colombia',
  'Ecuador','Mexico','Armenia','Azerbaijan','Georgia',
]);

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

function dedupeByUrl(batches: GdeltArticle[][]): GdeltArticle[] {
  const seen = new Set<string>();
  const out: GdeltArticle[] = [];
  for (const a of batches.flat()) {
    if (!seen.has(a.url)) { seen.add(a.url); out.push(a); }
  }
  return out;
}

export async function fetchGdeltArtGeo(
  timespanMinutes: number,
  extraQuery = ''
): Promise<GdeltArticle[]> {
  const generalQuery = [CONFLICT_QUERY, extraQuery].filter(Boolean).join(' ');
  const perHotspot = 20;
  const generalMax = 100;

  // Phase 1: general + all static hotspot queries in parallel
  const [general, ...hotspotBatches] = await Promise.all([
    fetchArtGeoQuery(generalQuery, timespanMinutes, generalMax),
    ...HOTSPOT_QUERIES.map((q) => fetchArtGeoQuery(q, timespanMinutes, perHotspot)),
  ]);

  // Phase 2: dynamic discovery — find high-frequency countries in the
  // general results not already covered, and run up to 3 extra queries.
  const countryCounts: Record<string, number> = {};
  for (const a of general) {
    const c = a.geocountry;
    if (c) countryCounts[c] = (countryCounts[c] ?? 0) + 1;
  }
  const emerging = Object.entries(countryCounts)
    .filter(([c]) => !COVERED_COUNTRIES.has(c))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([c]) => c);

  const dynamicBatches = await Promise.all(
    emerging.map((c) => fetchArtGeoQuery(`${c} conflict war attack`, timespanMinutes, 20))
  );

  return dedupeByUrl([general, ...hotspotBatches, ...dynamicBatches]);
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
