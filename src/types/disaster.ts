import type { MarkerState } from './event';

export type DisasterSubtype =
  | 'earthquake'
  | 'wildfire'
  | 'flood'
  | 'cyclone'
  | 'volcano'
  | 'landslide'
  | 'tsunami'
  | 'severe_storm'
  | 'drought'
  | 'epidemic';

export interface DisasterEvent {
  id: string;
  disasterType: DisasterSubtype;
  title: string;
  lat: number;
  lng: number;
  date: string;          // ISO string
  magnitude?: number;
  magnitudeUnit?: string;
  alertLevel?: 'green' | 'yellow' | 'orange' | 'red';
  source: 'usgs' | 'eonet' | 'gdelt';
  url?: string;
  country?: string;
  depth?: number;        // km, earthquakes only
  state: MarkerState;
}

export interface DisastersApiResponse {
  events: DisasterEvent[];
  fetchedAt: string;
  sources: string[];
}

export const DISASTER_CONFIG: Record<DisasterSubtype, { color: string; emoji: string; label: string }> = {
  earthquake:   { color: '#ff4400', emoji: '⚡', label: 'Earthquake' },
  wildfire:     { color: '#ff6600', emoji: '🔥', label: 'Wildfire' },
  flood:        { color: '#00aaff', emoji: '🌊', label: 'Flood' },
  cyclone:      { color: '#00ddff', emoji: '🌀', label: 'Cyclone' },
  volcano:      { color: '#ff2200', emoji: '🌋', label: 'Volcano' },
  landslide:    { color: '#aa7733', emoji: '⛰️', label: 'Landslide' },
  tsunami:      { color: '#0066ff', emoji: '🌊', label: 'Tsunami' },
  severe_storm: { color: '#cc88ff', emoji: '⛈️', label: 'Severe Storm' },
  drought:      { color: '#ddaa00', emoji: '☀️', label: 'Drought' },
  epidemic:     { color: '#00ff88', emoji: '🦠', label: 'Epidemic/Outbreak' },
};

