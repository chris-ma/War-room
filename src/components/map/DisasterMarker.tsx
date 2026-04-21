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
  const selectedClass = selected ? ' disaster-marker-selected' : '';
  const mag = event.magnitude != null ? event.magnitude.toFixed(1) : '';

  return L.divIcon({
    className: '',
    html: `<div class="disaster-marker${selectedClass}" style="--disaster-color:${cfg.color}">
             <div class="disaster-ring-outer"></div>
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
      <Tooltip direction="top" offset={[0, -12]} opacity={1}>
        <div style={{ background: '#06100a', color: '#b8f040', padding: '6px 10px', border: `1px solid ${cfg.color}`, fontSize: 11, maxWidth: 220, fontFamily: "'Share Tech Mono', monospace", borderRadius: 0 }}>
          <div style={{ color: cfg.color, fontWeight: 700, marginBottom: 2, fontSize: 10, letterSpacing: '0.1em' }}>{cfg.label.toUpperCase()} · {state.toUpperCase()}</div>
          <div style={{ lineHeight: 1.4 }}>{event.title}</div>
        </div>
      </Tooltip>
    </Marker>
  );
}
