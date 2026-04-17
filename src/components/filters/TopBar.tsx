'use client';

import type { FilterState, TimeRange } from '@/types/filters';
import type { ActiveLayer } from '@/types/disaster';
import SearchInput from './SearchInput';
import TimeRangeSelector from './TimeRangeSelector';
import LayerToggle from './LayerToggle';
import Spinner from '@/components/ui/Spinner';

interface TopBarProps {
  filters: FilterState;
  onQueryChange: (q: string) => void;
  onTimeRangeChange: (t: TimeRange) => void;
  activeLayer: ActiveLayer;
  onLayerChange: (l: ActiveLayer) => void;
  eventCount: number;
  lastUpdated: Date | null;
  isLoading: boolean;
  onRefresh: () => void;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function TopBar({
  filters,
  onQueryChange,
  onTimeRangeChange,
  activeLayer,
  onLayerChange,
  eventCount,
  lastUpdated,
  isLoading,
  onRefresh,
}: TopBarProps) {
  return (
    <div className="flex-shrink-0 border-b border-border bg-bg-secondary">
      {/* Row 1: Logo + status + refresh */}
      <div className="flex items-center gap-2 px-3 py-1.5">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-breaking animate-pulse" />
          <span className="text-text-primary font-bold text-xs tracking-wide uppercase">War Room</span>
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

      {/* Row 2: Controls */}
      <div className="flex items-center gap-2 px-3 pb-1.5 overflow-x-auto scrollbar-none">
        <LayerToggle value={activeLayer} onChange={onLayerChange} />
        <SearchInput value={filters.query} onChange={onQueryChange} placeholder="Search…" />
        {activeLayer !== 'disaster' && (
          <TimeRangeSelector value={filters.timeRange} onChange={onTimeRangeChange} />
        )}
      </div>
    </div>
  );
}
