import { NextResponse } from 'next/server';
import { fetchUsgsEarthquakes } from '@/lib/usgs';
import { fetchEonetEvents } from '@/lib/eonet';
import { fetchEpidemicEvents } from '@/lib/epidemic';
import { cacheGet, cacheSet, cacheGetStale } from '@/lib/cache';
import type { DisastersApiResponse } from '@/types/disaster';

export const maxDuration = 15;

const CACHE_KEY = 'disasters:v2';
const CACHE_TTL_MS = 5 * 60_000;

export async function GET() {
  const cached = cacheGet<DisastersApiResponse>(CACHE_KEY);
  if (cached) return NextResponse.json(cached);

  try {
    const [usgsResult, eonetResult, epidemicResult] = await Promise.allSettled([
      fetchUsgsEarthquakes(),
      fetchEonetEvents(),
      fetchEpidemicEvents(),
    ]);

    const usgsEvents     = usgsResult.status     === 'fulfilled' ? usgsResult.value     : [];
    const eonetEvents    = eonetResult.status     === 'fulfilled' ? eonetResult.value    : [];
    const epidemicEvents = epidemicResult.status  === 'fulfilled' ? epidemicResult.value : [];

    const seen = new Set<string>();
    const events = [...usgsEvents, ...eonetEvents, ...epidemicEvents].filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });

    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const sources: string[] = [];
    if (usgsResult.status     === 'fulfilled') sources.push('usgs');
    if (eonetResult.status    === 'fulfilled') sources.push('eonet');
    if (epidemicResult.status === 'fulfilled') sources.push('gdelt-epidemic');

    const response: DisastersApiResponse = {
      events,
      fetchedAt: new Date().toISOString(),
      sources,
    };

    cacheSet(CACHE_KEY, response, CACHE_TTL_MS);
    return NextResponse.json(response);
  } catch (err) {
    console.error('Disaster fetch error:', err);
    const stale = cacheGetStale<DisastersApiResponse>(CACHE_KEY);
    if (stale) return NextResponse.json({ ...stale, stale: true });
    return NextResponse.json({ error: 'Failed to fetch disaster data' }, { status: 502 });
  }
}
