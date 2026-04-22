'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import * as L from 'leaflet';
import type { DisasterEvent } from '@/types/disaster';
import DisasterMarker from './DisasterMarker';
import MapLegend from './MapLegend';
import 'leaflet/dist/leaflet.css';

interface WorldMapProps {
  disasterEvents: DisasterEvent[];
  selectedDisasterId: string | null;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function clusterIcon(cluster: any): L.DivIcon {
  const count = cluster.getChildCount();
  const color = count >= 50 ? '#ff3300' : count >= 10 ? '#d4aa00' : '#44ff66';
  const size  = count >= 50 ? 52 : count >= 10 ? 44 : 36;
  const inner = size - 14;

  return L.divIcon({
    className: '',
    html: `<div class="cc-cluster" style="width:${size}px;height:${size}px;--cc:${color}">
             <div class="cc-ring"></div>
             <div class="cc-ring cc-ring-2"></div>
             <div class="cc-core" style="width:${inner}px;height:${inner}px">${count}</div>
           </div>`,
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function WorldMap({
  disasterEvents,
  selectedDisasterId,
  onDisasterClick,
  drawerOpen,
}: WorldMapProps) {
  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={12}
        style={{ width: '100%', height: '100%', background: '#020804' }}
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
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          iconCreateFunction={clusterIcon}
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
      </MapContainer>
      <MapLegend />
    </div>
  );
}
