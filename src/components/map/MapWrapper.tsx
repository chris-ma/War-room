import dynamic from 'next/dynamic';
import type { ClusteredEvent } from '@/types/event';
import type { DisasterEvent, ActiveLayer } from '@/types/disaster';

interface MapWrapperProps {
  events: ClusteredEvent[];
  disasterEvents: DisasterEvent[];
  activeLayer: ActiveLayer;
  selectedEventId: string | null;
  selectedDisasterId: string | null;
  onMarkerClick: (event: ClusteredEvent) => void;
  onDisasterClick: (event: DisasterEvent) => void;
  drawerOpen: boolean;
}

const WorldMap = dynamic(() => import('./WorldMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-bg-primary">
      <div className="text-text-muted text-sm">Loading map...</div>
    </div>
  ),
});

export default function MapWrapper(props: MapWrapperProps) {
  return <WorldMap {...props} />;
}
