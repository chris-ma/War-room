import type { GdeltArticle } from './gdelt';

export type MarkerState = 'breaking' | 'recent' | 'active' | 'historical';
export type EventType = 'conflict' | 'disaster';

export interface ClusteredEvent {
  id: string;
  centerLat: number;
  centerLng: number;
  articles: GdeltArticle[];
  articleCount: number;
  location: string;
  country: string;
  firstSeen: string; // ISO string for JSON serialization
  lastSeen: string;  // ISO string for JSON serialization
  avgTone: number;
  state: MarkerState;
}

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
  // NewsAPI enrichment
  description?: string;
  urlToImage?: string;
  publishedAt?: string;
  source?: { name: string };
}

export interface EventsApiResponse {
  events: ClusteredEvent[];
  fetchedAt: string;
  totalArticles: number;
  clusteredCount: number;
  stale?: boolean;
}

export interface ArticlesApiResponse {
  articles: EnrichedArticle[];
  clusterId: string;
  location: string;
  source: 'gdelt' | 'gdelt+newsapi';
}
