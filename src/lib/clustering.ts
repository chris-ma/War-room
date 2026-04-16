import type { GdeltArticle } from '@/types/gdelt';
import type { ClusteredEvent } from '@/types/event';
import { parseGdeltDate } from './gdelt';
import { getMarkerState } from './markerState';

const DEFAULT_RADIUS_KM = parseFloat(process.env.CLUSTER_RADIUS_KM ?? '50');

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function stableId(lat: number, lng: number, firstSeen: string): string {
  const la = lat.toFixed(2);
  const lo = lng.toFixed(2);
  const day = firstSeen.slice(0, 10);
  return `cluster_${la}_${lo}_${day}`;
}

export function clusterArticles(
  articles: GdeltArticle[],
  radiusKm = DEFAULT_RADIUS_KM
): ClusteredEvent[] {
  // Sort newest first so seeds are anchored to most recent events
  const sorted = [...articles].sort((a, b) => {
    const da = parseGdeltDate(a.seendate).getTime();
    const db = parseGdeltDate(b.seendate).getTime();
    return db - da;
  });

  const visited = new Set<number>();
  const clusters: ClusteredEvent[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (visited.has(i)) continue;
    visited.add(i);

    const seed = sorted[i];
    const seedLat = seed.geolat!;
    const seedLng = seed.geolong!;
    const members: GdeltArticle[] = [seed];

    for (let j = i + 1; j < sorted.length; j++) {
      if (visited.has(j)) continue;
      const art = sorted[j];
      if (haversineKm(seedLat, seedLng, art.geolat!, art.geolong!) <= radiusKm) {
        members.push(art);
        visited.add(j);
      }
    }

    const centerLat = members.reduce((s, a) => s + a.geolat!, 0) / members.length;
    const centerLng = members.reduce((s, a) => s + a.geolong!, 0) / members.length;

    const dates = members.map((a) => parseGdeltDate(a.seendate));
    const firstSeen = new Date(Math.min(...dates.map((d) => d.getTime())));
    const lastSeen = new Date(Math.max(...dates.map((d) => d.getTime())));

    const tonesWithValue = members.filter((a) => a.tone != null);
    const avgTone =
      tonesWithValue.length > 0
        ? tonesWithValue.reduce((s, a) => s + a.tone!, 0) / tonesWithValue.length
        : 0;

    const mostRecent = members[0];
    const location = mostRecent.geocontext ?? mostRecent.geocountry ?? 'Unknown';
    const country = mostRecent.geocountry ?? mostRecent.sourcecountry ?? '';

    const firstSeenISO = firstSeen.toISOString();

    clusters.push({
      id: stableId(centerLat, centerLng, firstSeenISO),
      centerLat,
      centerLng,
      articles: members,
      articleCount: members.length,
      location,
      country,
      firstSeen: firstSeenISO,
      lastSeen: lastSeen.toISOString(),
      avgTone,
      state: getMarkerState(lastSeen),
    });
  }

  return clusters;
}
