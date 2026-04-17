export type MarkerState = 'breaking' | 'recent' | 'active' | 'historical';

export interface EnrichedArticle {
  url: string;
  title: string;
  seendate: string;
  domain: string;
  language: string;
  sourcecountry: string;
  socialimage?: string;
  geocontext?: string;
  geocountry?: string;
  tone?: number;
  description?: string;
  urlToImage?: string;
  publishedAt?: string;
  source?: { name: string };
}

export interface ArticlesApiResponse {
  articles: EnrichedArticle[];
  clusterId: string;
  location: string;
  source: 'gdelt' | 'gdelt+newsapi';
}
