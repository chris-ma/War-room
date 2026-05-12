import type { DisasterSubtype } from './disaster';

export type TimeRange = '24h' | '7d' | '30d';

export const TIME_RANGE_HOURS: Record<TimeRange, number> = {
  '24h': 24,
  '7d':  7 * 24,
  '30d': 30 * 24,
};

export const ALL_DISASTER_TYPES: DisasterSubtype[] = [
  'earthquake', 'wildfire', 'flood', 'cyclone', 'volcano',
  'landslide', 'tsunami', 'severe_storm', 'drought', 'epidemic',
];
