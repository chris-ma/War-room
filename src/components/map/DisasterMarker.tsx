'use client';

import { Marker, Tooltip } from 'react-leaflet';
import * as L from 'leaflet';
import type { DisasterEvent } from '@/types/disaster';
import { DISASTER_CONFIG } from '@/types/disaster';
import { getMarkerState } from '@/lib/markerState';

interface DisasterMarkerProps {
  event: DisasterEvent;
  isSelected: boolean;
  onClick: (event: DisasterEvent) => void;
}

function buildDisasterIcon(event: DisasterEvent, selected: boolean): L.DivIcon {
  const cfg = DISASTER_CONFIG[event.disasterType];
  const state = getMarkerState(event.date);
  const isPulsing = state === 'breaking';
  const selectedClass = selected ? ' disaster-marker-selected' : '';
  const pulseClass = isPulsing ? ' disaster-marker-pulse' : '';
  const mag = event.magnitude != null ? event.magnitude.toFixed(1) : '';

  return L.divIcon({
    className: '',
    html: `<div class="disaster-marker${selectedClass}${pulseClass}" style="--disaster-color:${cfg.color}">
             <div class="disaster-ring"></div>
             <div class="disaster-dot">${mag || cfg.emoji}</div>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });
}

export default function DisasterMarker({ event, isSelected, onClick }: DisasterMarkerProps) {
  const cfg = DISASTER_CONFIG[event.disasterType];
  const icon = buildDisasterIcon(event, isSelected);
  const state = getMarkerState(event.date);

  const subtitle = event.magnitude != null
    ? `${cfg.label} · M${event.magnitude.toFixed(1)}${event.magnitudeUnit ? ` ${event.magnitudeUnit}` : ''}`
    : cfg.label;

  return (
    <Marker
      position={[event.lat, event.lng]}
      icon={icon}
      zIndexOffset={isSelected ? 1000 : state === 'breaking' ? 500 : 0}
      eventHandlers={{ click: () => onClick(event) }}
    >
      <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
        <div style={{ background: '#1f2937', color: '#f9fafb', padding: '6px 10px', borderRadius: 6, fontSize: 12, maxWidth: 220 }}>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>{event.title}</div>
          <div style={{ color: '#9ca3af', fontSize: 11 }}>{subtitle} · {state}</div>
        </div>
      </Tooltip>
    </Marker>
  );
}
