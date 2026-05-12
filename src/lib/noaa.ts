import type { DisasterEvent, DisasterSubtype } from '@/types/disaster';
import { getMarkerState } from './markerState';

const STATE_CENTROIDS: Record<string, [number, number]> = {
  AL: [32.8, -86.8], AK: [64.2, -153.4], AZ: [34.3, -111.1], AR: [34.8, -92.2],
  CA: [36.8, -119.4], CO: [39.0, -105.5], CT: [41.6, -72.7], DE: [39.0, -75.5],
  FL: [27.8, -81.7], GA: [32.7, -83.6], HI: [20.9, -157.0], ID: [44.4, -114.6],
  IL: [40.0, -89.2], IN: [40.3, -86.1], IA: [42.0, -93.2], KS: [38.5, -98.4],
  KY: [37.5, -85.3], LA: [31.2, -92.4], ME: [45.4, -69.0], MD: [39.1, -76.8],
  MA: [42.2, -71.5], MI: [44.3, -85.6], MN: [46.4, -93.2], MS: [32.7, -89.7],
  MO: [38.5, -92.5], MT: [47.0, -110.5], NE: [41.5, -99.8], NV: [39.3, -116.6],
  NH: [44.0, -71.6], NJ: [40.1, -74.6], NM: [34.3, -106.2], NY: [43.0, -75.5],
  NC: [35.6, -79.4], ND: [47.5, -100.5], OH: [40.4, -82.8], OK: [35.6, -96.9],
  OR: [44.0, -120.5], PA: [40.9, -77.8], RI: [41.7, -71.5], SC: [33.9, -80.9],
  SD: [44.4, -100.2], TN: [35.9, -86.4], TX: [31.5, -99.3], UT: [39.3, -111.1],
  VT: [44.1, -72.7], VA: [37.8, -79.5], WA: [47.4, -120.4], WV: [38.6, -80.6],
  WI: [44.5, -90.0], WY: [43.0, -107.6], DC: [38.9, -77.0],
};

const EVENT_MAP: Partial<Record<string, DisasterSubtype>> = {
  'Tornado Warning':               'severe_storm',
  'Tornado Watch':                 'severe_storm',
  'Severe Thunderstorm Warning':   'severe_storm',
  'Severe Thunderstorm Watch':     'severe_storm',
  'Blizzard Warning':              'severe_storm',
  'Winter Storm Warning':          'severe_storm',
  'Winter Storm Watch':            'severe_storm',
  'Ice Storm Warning':             'severe_storm',
  'High Wind Warning':             'severe_storm',
  'Extreme Wind Warning':          'severe_storm',
  'Flash Flood Warning':           'flood',
  'Flash Flood Watch':             'flood',
  'Flood Warning':                 'flood',
  'Flood Watch':                   'flood',
  'Coastal Flood Warning':         'flood',
  'Lakeshore Flood Warning':       'flood',
  'Hurricane Warning':             'cyclone',
  'Hurricane Watch':               'cyclone',
  'Hurricane Force Wind Warning':  'cyclone',
  'Tropical Storm Warning':        'cyclone',
  'Tropical Storm Watch':          'cyclone',
  'Typhoon Warning':               'cyclone',
  'Typhoon Watch':                 'cyclone',
  'Tsunami Warning':               'tsunami',
  'Tsunami Watch':                 'tsunami',
  'Tsunami Advisory':              'tsunami',
  'Red Flag Warning':              'wildfire',
  'Fire Weather Watch':            'wildfire',
  'Extreme Fire Danger':           'wildfire',
  'Excessive Heat Warning':        'drought',
};

interface NoaaGeometry {
  type: 'Point' | 'Polygon' | 'MultiPolygon';
  coordinates: unknown;
}

interface NoaaFeature {
  id: string;
  geometry: NoaaGeometry | null;
  properties: {
    id: string;
    event: string;
    headline: string | null;
    severity: string;
    urgency: string;
    effective: string;
    expires: string;
    areaDesc: string;
  };
}

const NOAA_URL =
  'https://api.weather.gov/alerts/active?status=actual&message_type=alert' +
  '&severity=Extreme,Severe&urgency=Immediate,Expected&limit=500';

function centroidOf(geometry: NoaaGeometry): [number, number] | null {
  if (geometry.type === 'Point') {
    const [lng, lat] = geometry.coordinates as [number, number];
    return [lat, lng];
  }
  const ring =
    geometry.type === 'Polygon'
      ? (geometry.coordinates as number[][][])[0]
      : (geometry.coordinates as number[][][][])[0]?.[0];
  if (!ring || ring.length === 0) return null;
  const lat = ring.reduce((s, c) => s + c[1], 0) / ring.length;
  const lng = ring.reduce((s, c) => s + c[0], 0) / ring.length;
  return [lat, lng];
}

function fallbackFromAreaDesc(areaDesc: string): [number, number] | null {
  const codes = areaDesc.match(/\b([A-Z]{2})\b/g) ?? [];
  for (const code of codes) {
    if (STATE_CENTROIDS[code]) return STATE_CENTROIDS[code];
  }
  return null;
}

export async function fetchNoaaAlerts(): Promise<DisasterEvent[]> {
  const res = await fetch(NOAA_URL, {
    headers: { 'User-Agent': 'CrisisMonitor/1.0' },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`NOAA ${res.status}`);

  const data: { features: NoaaFeature[] } = await res.json();
  const events: DisasterEvent[] = [];
  const seen = new Set<string>();

  for (const f of data.features ?? []) {
    const p = f.properties;
    const disasterType: DisasterSubtype = EVENT_MAP[p.event] ?? 'severe_storm';
    const date = p.effective;

    const coords = f.geometry
      ? centroidOf(f.geometry)
      : fallbackFromAreaDesc(p.areaDesc);
    if (!coords) continue;

    const [lat, lng] = coords;
    const key = `${disasterType}_${Math.round(lat)}_${Math.round(lng)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    events.push({
      id: `noaa_${p.id.replace(/[^a-zA-Z0-9]/g, '_').slice(-32)}`,
      disasterType,
      title: p.headline ?? p.event,
      lat,
      lng,
      date,
      source: 'noaa',
      url: 'https://www.weather.gov/alerts',
      country: 'US',
      state: getMarkerState(date),
    });
  }

  return events;
}
