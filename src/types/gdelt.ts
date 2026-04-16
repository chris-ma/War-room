export interface GdeltArticle {
  url: string;
  urlmobile?: string;
  title: string;
  seendate: string; // "YYYYMMDDTHHmmssZ" format
  socialimage?: string;
  domain: string;
  language: string;
  sourcecountry: string;
  geocountry?: string;
  geolat?: number;
  geolong?: number;
  geores?: number; // 1=country, 2=state, 3=city
  geocontext?: string;
  tone?: number; // negative = more negative sentiment
}

export interface GdeltArtGeoResponse {
  articles?: GdeltArticle[] | null;
  status?: string;
}

export interface GdeltArtListResponse {
  articles?: GdeltArticle[] | null;
  status?: string;
}
