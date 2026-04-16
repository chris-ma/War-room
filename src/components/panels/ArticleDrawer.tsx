'use client';

import type { ClusteredEvent, EnrichedArticle } from '@/types/event';
import DrawerHeader from './DrawerHeader';
import ArticleCard from './ArticleCard';
import Spinner from '@/components/ui/Spinner';
import ErrorBanner from '@/components/ui/ErrorBanner';

interface ArticleDrawerProps {
  event: ClusteredEvent | null;
  articles: EnrichedArticle[];
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

export default function ArticleDrawer({ event, articles, isLoading, error, onClose }: ArticleDrawerProps) {
  const isOpen = event !== null;

  return (
    <div
      className={`drawer-panel fixed top-0 right-0 h-full w-full sm:w-[380px] bg-bg-secondary border-l border-border z-[1100] flex flex-col shadow-2xl ${isOpen ? 'open' : ''}`}
    >
      {event ? (
        <>
          <DrawerHeader event={event} onClose={onClose} />
          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <Spinner size={24} />
              </div>
            )}
            {error && !isLoading && (
              <div className="p-4">
                <ErrorBanner message={error} />
              </div>
            )}
            {!isLoading && !error && articles.length === 0 && (
              <div className="p-6 text-center text-text-muted text-sm">
                No articles found for this location.
              </div>
            )}
            {!isLoading && articles.length > 0 && (
              <div className="p-3 space-y-2">
                {articles.map((a, i) => (
                  <ArticleCard key={a.url + i} article={a} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-text-muted text-sm px-6 text-center">
          Click a marker on the map to view related news articles.
        </div>
      )}
    </div>
  );
}
