'use client';

import type { FilterState, TimeRange } from '@/types/filters';
import SearchInput from './SearchInput';
import TimeRangeSelector from './TimeRangeSelector';
import Spinner from '@/components/ui/Spinner';

interface TopBarProps {
  filters: FilterState;
  onQueryChange: (q: string) => void;
  onTimeRangeChange: (t: TimeRange) => void;
  eventCount: number;
  lastUpdated: Date | null;
  isLoading: boolean;
  onRefresh: () => void;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function TopBar({
  filters,
  onQueryChange,
  onTimeRangeChange,
  eventCount,
  lastUpdated,
  isLoading,
  onRefresh,
}: TopBarProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-bg-secondary flex-wrap">
      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-breaking animate-pulse" />
        <span className="text-text-primary font-bold text-sm tracking-wide uppercase">War Room</span>
      </div>

      <div className="h-4 w-px bg-border hidden sm:block" />

      {/* Search */}
      <SearchInput value={filters.query} onChange={onQueryChange} />

      {/* Time range */}
      <TimeRangeSelector value={filters.timeRange} onChange={onTimeRangeChange} />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Status */}
      <div className="flex items-center gap-3 text-xs text-text-muted">
        {isLoading ? (
          <Spinner size={12} />
        ) : (
          <span className="text-text-secondary font-medium">
            {eventCount} event{eventCount !== 1 ? 's' : ''}
          </span>
        )}
        {lastUpdated && (
          <span>Updated {formatTime(lastUpdated)}</span>
        )}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-2 py-1 rounded bg-bg-tertiary hover:bg-border transition-colors disabled:opacity-50 text-text-secondary hover:text-text-primary"
          title="Refresh"
        >
          ↻
        </button>
      </div>
    </div>
  );
}
