import type { EnrichedArticle } from '@/types/event';
import { parseGdeltDate } from '@/lib/gdelt';

function formatAge(dateStr: string): string {
  try {
    const date = dateStr.match(/^\d{8}T/) ? parseGdeltDate(dateStr) : new Date(dateStr);
    const ageMs = Date.now() - date.getTime();
    const mins = Math.floor(ageMs / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return '';
  }
}

export default function ArticleCard({ article }: { article: EnrichedArticle }) {
  const age = formatAge(article.publishedAt ?? article.seendate);
  const image = article.urlToImage ?? article.socialimage;

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 p-3 rounded-lg border border-border hover:border-accent/50 hover:bg-bg-tertiary transition-colors group"
    >
      {image && (
        <div className="flex-shrink-0 w-16 h-12 rounded overflow-hidden bg-bg-tertiary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-xs font-medium leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {article.title}
        </p>
        {article.description && (
          <p className="text-text-muted text-[11px] mt-1 line-clamp-1">{article.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-text-muted">
          <span className="font-medium text-text-secondary truncate max-w-[120px]">
            {article.source?.name ?? article.domain}
          </span>
          {age && <><span>·</span><span>{age}</span></>}
        </div>
      </div>
    </a>
  );
}
