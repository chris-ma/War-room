'use client';

import { Marker, Tooltip } from 'react-leaflet';
import * as L from 'leaflet';
import type { ClusteredEvent } from '@/types/event';
import { getMarkerState } from '@/lib/markerState';

interface EventMarkerProps {
  event: ClusteredEvent;
  isSelected: boolean;
  onClick: (event: ClusteredEvent) => void;
}

function buildIcon(state: string, count: number, selected: boolean): L.DivIcon {
  const selectedClass = selected ? ' marker-selected' : '';
  const countBadge = count > 1 ? `<span class="marker-count">${count}</span>` : '';
  return L.divIcon({
    className: '',
    html: `<div class="marker-container marker-${state}${selectedClass}">
             <div class="marker-ring"></div>
             <div class="marker-dot"></div>
             ${countBadge}
           </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -18],
  });
}

export default function EventMarker({ event, isSelected, onClick }: EventMarkerProps) {
  const state = getMarkerState(event.lastSeen);
  const icon = buildIcon(state, event.articleCount, isSelected);

  return (
    <Marker
      position={[event.centerLat, event.centerLng]}
      icon={icon}
      zIndexOffset={isSelected ? 1000 : state === 'breaking' ? 500 : 0}
      eventHandlers={{ click: () => onClick(event) }}
    >
      <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
        <div style={{ background: '#1f2937', color: '#f9fafb', padding: '6px 10px', borderRadius: 6, fontSize: 12, maxWidth: 200 }}>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>{event.location}</div>
          <div style={{ color: '#9ca3af', fontSize: 11 }}>{event.articleCount} article{event.articleCount !== 1 ? 's' : ''} · {state}</div>
        </div>
      </Tooltip>
    </Marker>
  );
}
