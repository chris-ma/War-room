import type { MarkerState } from '@/types/event';

const STATE_STYLES: Record<MarkerState, string> = {
  breaking:   'bg-breaking/20 text-breaking border border-breaking/40',
  recent:     'bg-recent/20 text-recent border border-recent/40',
  active:     'bg-active/20 text-active border border-active/40',
  historical: 'bg-historical/20 text-historical border border-historical/40',
};

export default function Badge({ state }: { state: MarkerState }) {
  return (
    <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${STATE_STYLES[state]}`}>
      {state}
    </span>
  );
}
