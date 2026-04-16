'use client';

import { useReducer } from 'react';
import type { FilterState, TimeRange } from '@/types/filters';

type FilterAction =
  | { type: 'SET_QUERY'; query: string }
  | { type: 'SET_TIME_RANGE'; timeRange: TimeRange }
  | { type: 'TOGGLE_REGION'; region: string }
  | { type: 'RESET' };

const initial: FilterState = {
  query: '',
  timeRange: '24h',
  regions: [],
  states: [],
};

function reducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.query };
    case 'SET_TIME_RANGE':
      return { ...state, timeRange: action.timeRange };
    case 'TOGGLE_REGION': {
      const exists = state.regions.includes(action.region);
      return {
        ...state,
        regions: exists
          ? state.regions.filter((r) => r !== action.region)
          : [...state.regions, action.region],
      };
    }
    case 'RESET':
      return initial;
    default:
      return state;
  }
}

export function useFilters() {
  const [filters, dispatch] = useReducer(reducer, initial);

  return {
    filters,
    setQuery: (query: string) => dispatch({ type: 'SET_QUERY', query }),
    setTimeRange: (timeRange: TimeRange) => dispatch({ type: 'SET_TIME_RANGE', timeRange }),
    toggleRegion: (region: string) => dispatch({ type: 'TOGGLE_REGION', region }),
    reset: () => dispatch({ type: 'RESET' }),
  };
}
