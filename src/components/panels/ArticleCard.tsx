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

const mono = { fontFamily: "'Share Tech Mono', monospace" };

export default function ArticleCard({ article }: { article: EnrichedArticle }) {
  const age    = formatAge(article.publishedAt ?? article.seendate ?? '');
  const source = article.source?.name ?? article.domain ?? '';

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 transition-all"
      style={{
        background: '#020804',
        border: '1px solid #1a4a22',
        ...mono,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#44ff66';
        e.currentTarget.style.background  = '#06100a';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#1a4a22';
        e.currentTarget.style.background  = '#020804';
      }}
    >
      {/* Headline */}
      <div
        className="text-[11px] leading-snug mb-2"
        style={{ color: '#b8f040' }}
      >
        {article.title}
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[9px] min-w-0">
          {source && (
            <span
              className="truncate"
              style={{ color: '#6aaa30', letterSpacing: '0.06em' }}
            >
              {source.toUpperCase()}
            </span>
          )}
          {source && age && <span style={{ color: '#1a4a22' }}>·</span>}
          {age && <span style={{ color: '#3a6828' }}>{age}</span>}
        </div>
        <span
          className="flex-shrink-0 text-[9px] tracking-widest"
          style={{ color: '#44ff66', letterSpacing: '0.15em' }}
        >
          READ ▶
        </span>
      </div>
    </a>
  );
}
