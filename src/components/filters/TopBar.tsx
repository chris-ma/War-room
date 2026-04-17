'use client';

import Spinner from '@/components/ui/Spinner';

interface TopBarProps {
  eventCount: number;
  lastUpdated: Date | null;
  isLoading: boolean;
  onRefresh: () => void;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function TopBar({ eventCount, lastUpdated, isLoading, onRefresh }: TopBarProps) {
  return (
    <div className="flex-shrink-0 border-b border-border bg-bg-secondary">
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-breaking animate-pulse" />
          <span className="text-text-primary font-bold text-xs tracking-wide uppercase">Crisis Monitor</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-[10px] text-text-muted">
          {isLoading ? (
            <Spinner size={10} />
          ) : (
            <span className="text-text-secondary font-medium">{eventCount} events</span>
          )}
          {lastUpdated && <span className="hidden sm:inline">{formatTime(lastUpdated)}</span>}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-1.5 py-0.5 rounded bg-bg-tertiary hover:bg-border transition-colors disabled:opacity-50 text-text-secondary hover:text-text-primary text-sm"
            title="Refresh"
          >
            ↻
          </button>
        </div>
      </div>
    </div>
  );
}
