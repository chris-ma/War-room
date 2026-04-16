import type { MarkerState } from '@/types/event';

export function getMarkerState(lastSeen: Date | string): MarkerState {
  const date = typeof lastSeen === 'string' ? new Date(lastSeen) : lastSeen;
  const ageMs = Date.now() - date.getTime();
  if (ageMs < 5 * 60 * 1000)       return 'breaking';
  if (ageMs < 60 * 60 * 1000)      return 'recent';
  if (ageMs < 24 * 60 * 60 * 1000) return 'active';
  return 'historical';
}
