import { NextRequest, NextResponse } from 'next/server';
import { fetchGdeltArtGeo } from '@/lib/gdelt';
import { clusterArticles } from '@/lib/clustering';
import { cacheGet, cacheSet, cacheGetStale } from '@/lib/cache';
import type { EventsApiResponse } from '@/types/event';

export const maxDuration = 15;

const CACHE_TTL_MS = 60_000;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const timespanStr = searchParams.get('timespan');
  const defaultTimespan = parseInt(process.env.GDELT_DEFAULT_TIMESPAN ?? '1440', 10);
  const timespan = timespanStr ? parseInt(timespanStr, 10) : defaultTimespan;
  const query = searchParams.get('query') ?? '';

  const cacheKey = `events:${timespan}:${query}`;

  const cached = cacheGet<EventsApiResponse>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const articles = await fetchGdeltArtGeo(timespan, query);
    const events = clusterArticles(articles);

    const response: EventsApiResponse = {
      events,
      fetchedAt: new Date().toISOString(),
      totalArticles: articles.length,
      clusteredCount: events.length,
    };

    cacheSet(cacheKey, response, CACHE_TTL_MS);
    return NextResponse.json(response);
  } catch (err) {
    console.error('GDELT fetch error:', err);
    const stale = cacheGetStale<EventsApiResponse>(cacheKey);
    if (stale) {
      return NextResponse.json({ ...stale, stale: true });
    }
    return NextResponse.json(
      { error: 'Failed to fetch events', code: 'GDELT_UNAVAILABLE' },
      { status: 502 }
    );
  }
}
