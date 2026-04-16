'use client';

import { useState, useCallback } from 'react';
import type { EnrichedArticle } from '@/types/event';

export function useArticles() {
  const [articles, setArticles] = useState<EnrichedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async (clusterId: string, location: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ clusterId, location });
      const res = await fetch(`/api/articles?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setArticles(data.articles ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles');
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setArticles([]);
    setError(null);
  }, []);

  return { articles, isLoading, error, fetchArticles, clear };
}
