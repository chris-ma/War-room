import type { ClusteredEvent } from '@/types/event';
import Badge from '@/components/ui/Badge';
import { getMarkerState } from '@/lib/markerState';

interface DrawerHeaderProps {
  event: ClusteredEvent;
  onClose: () => void;
}

export default function DrawerHeader({ event, onClose }: DrawerHeaderProps) {
  const state = getMarkerState(event.lastSeen);

  return (
    <div className="flex items-start justify-between gap-3 p-4 border-b border-border">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge state={state} />
          {event.country && (
            <span className="text-[10px] text-text-muted font-medium uppercase tracking-wide">
              {event.country}
            </span>
          )}
        </div>
        <h2 className="text-text-primary font-semibold text-sm mt-1 leading-snug">{event.location}</h2>
        <p className="text-text-muted text-[11px] mt-0.5">
          {event.articleCount} article{event.articleCount !== 1 ? 's' : ''} · {event.centerLat.toFixed(2)}°, {event.centerLng.toFixed(2)}°
        </p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors text-lg leading-none"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}
