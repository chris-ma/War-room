'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import type { ClusteredEvent } from '@/types/event';
import type { DisasterEvent } from '@/types/disaster';
import type { ActiveLayer } from '@/types/disaster';
import EventMarker from './EventMarker';
import DisasterMarker from './DisasterMarker';
import MapLegend from './MapLegend';
import 'leaflet/dist/leaflet.css';

interface WorldMapProps {
  events: ClusteredEvent[];
  disasterEvents: DisasterEvent[];
  activeLayer: ActiveLayer;
  selectedEventId: string | null;
  selectedDisasterId: string | null;
  onMarkerClick: (event: ClusteredEvent) => void;
  onDisasterClick: (event: DisasterEvent) => void;
  drawerOpen: boolean;
}

function MapResizer({ drawerOpen }: { drawerOpen: boolean }) {
  const map = useMap();
  const prev = useRef(drawerOpen);
  useEffect(() => {
    if (prev.current !== drawerOpen) {
      prev.current = drawerOpen;
      setTimeout(() => map.invalidateSize(), 320);
    }
  }, [drawerOpen, map]);
  return null;
}

export default function WorldMap({
  events,
  disasterEvents,
  activeLayer,
  selectedEventId,
  selectedDisasterId,
  onMarkerClick,
  onDisasterClick,
  drawerOpen,
}: WorldMapProps) {
  const showConflict = activeLayer === 'conflict' || activeLayer === 'both';
  const showDisaster = activeLayer === 'disaster' || activeLayer === 'both';

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={12}
        style={{ width: '100%', height: '100%', background: '#0a0e1a' }}
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />
        <MapResizer drawerOpen={drawerOpen} />

        {/* Conflict layer */}
        {showConflict && (
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={60}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
          >
            {events.map((event) => (
              <EventMarker
                key={event.id}
                event={event}
                isSelected={selectedEventId === event.id}
                onClick={onMarkerClick}
              />
            ))}
          </MarkerClusterGroup>
        )}

        {/* Disaster layer — separate cluster group so they don't mix */}
        {showDisaster && (
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
            key="disaster-cluster"
          >
            {disasterEvents.map((event) => (
              <DisasterMarker
                key={event.id}
                event={event}
                isSelected={selectedDisasterId === event.id}
                onClick={onDisasterClick}
              />
            ))}
          </MarkerClusterGroup>
        )}
      </MapContainer>
      <MapLegend activeLayer={activeLayer} />
    </div>
  );
}
