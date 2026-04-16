import type { MarkerState } from './event';

export type TimeRange = '1h' | '6h' | '24h' | '7d';

export interface FilterState {
  query: string;
  timeRange: TimeRange;
  regions: string[];
  states: MarkerState[];
}

export const TIME_RANGE_MINUTES: Record<TimeRange, number> = {
  '1h': 60,
  '6h': 360,
  '24h': 1440,
  '7d': 10080,
};
