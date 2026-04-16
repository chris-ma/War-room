import type { EnrichedArticle } from '@/types/event';

interface NewsApiArticle {
  url: string;
  title: string;
  description?: string;
  urlToImage?: string;
  publishedAt?: string;
  source?: { name: string };
}

interface NewsApiResponse {
  status: string;
  articles?: NewsApiArticle[];
  message?: string;
}

export async function fetchNewsApiArticles(
  location: string
): Promise<EnrichedArticle[]> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) return [];

  const q = encodeURIComponent(`${location} conflict`);
  const url = `https://newsapi.org/v2/everything?q=${q}&sortBy=publishedAt&pageSize=5&language=en&apiKey=${apiKey}`;

  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return [];
    const json: NewsApiResponse = await res.json();
    if (json.status !== 'ok' || !json.articles) return [];

    return json.articles.map((a) => ({
      url: a.url,
      title: a.title,
      seendate: a.publishedAt ?? new Date().toISOString(),
      domain: new URL(a.url).hostname.replace('www.', ''),
      language: 'en',
      sourcecountry: '',
      description: a.description ?? undefined,
      urlToImage: a.urlToImage ?? undefined,
      publishedAt: a.publishedAt ?? undefined,
      source: a.source,
    }));
  } catch {
    return [];
  }
}
