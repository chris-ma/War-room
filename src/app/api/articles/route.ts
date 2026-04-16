import { NextRequest, NextResponse } from 'next/server';
import { fetchGdeltArtList } from '@/lib/gdelt';
import { fetchNewsApiArticles } from '@/lib/newsapi';
import { cacheGet, cacheSet } from '@/lib/cache';
import type { EnrichedArticle, ArticlesApiResponse } from '@/types/event';

export const maxDuration = 10;

const CACHE_TTL_MS = 120_000;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const location = searchParams.get('location') ?? '';
  const clusterId = searchParams.get('clusterId') ?? '';

  if (!location) {
    return NextResponse.json({ error: 'location is required' }, { status: 400 });
  }

  const cacheKey = `articles:${clusterId || location}`;
  const cached = cacheGet<ArticlesApiResponse>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const [gdeltArticles, newsApiArticles] = await Promise.allSettled([
    fetchGdeltArtList(location),
    fetchNewsApiArticles(location),
  ]);

  const gdelt: EnrichedArticle[] =
    gdeltArticles.status === 'fulfilled'
      ? gdeltArticles.value.map((a) => ({
          url: a.url,
          title: a.title,
          seendate: a.seendate,
          domain: a.domain,
          language: a.language,
          sourcecountry: a.sourcecountry,
          socialimage: a.socialimage,
          geocontext: a.geocontext,
          geocountry: a.geocountry,
          tone: a.tone,
        }))
      : [];

  const newsapi: EnrichedArticle[] =
    newsApiArticles.status === 'fulfilled' ? newsApiArticles.value : [];

  // Merge by URL deduplication
  const seen = new Set<string>();
  const merged: EnrichedArticle[] = [];
  for (const a of [...gdelt, ...newsapi]) {
    if (!seen.has(a.url)) {
      seen.add(a.url);
      merged.push(a);
    }
  }

  const source: ArticlesApiResponse['source'] = newsapi.length > 0 ? 'gdelt+newsapi' : 'gdelt';
  const response: ArticlesApiResponse = { articles: merged, clusterId, location, source };

  cacheSet(cacheKey, response, CACHE_TTL_MS);
  return NextResponse.json(response);
}
