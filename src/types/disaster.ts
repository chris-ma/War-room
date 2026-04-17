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
  | 'drought';

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
  source: 'usgs' | 'eonet';
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
  earthquake:   { color: '#8b5cf6', emoji: '⚡', label: 'Earthquake' },
  wildfire:     { color: '#f97316', emoji: '🔥', label: 'Wildfire' },
  flood:        { color: '#06b6d4', emoji: '🌊', label: 'Flood' },
  cyclone:      { color: '#0ea5e9', emoji: '🌀', label: 'Cyclone' },
  volcano:      { color: '#dc2626', emoji: '🌋', label: 'Volcano' },
  landslide:    { color: '#92400e', emoji: '⛰️', label: 'Landslide' },
  tsunami:      { color: '#1d4ed8', emoji: '🌊', label: 'Tsunami' },
  severe_storm: { color: '#6b7280', emoji: '⛈️', label: 'Severe Storm' },
  drought:      { color: '#d97706', emoji: '☀️', label: 'Drought' },
};

export type ActiveLayer = 'conflict' | 'disaster' | 'both';
