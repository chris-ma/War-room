import dynamic from 'next/dynamic';
import type { DisasterEvent } from '@/types/disaster';

interface MapWrapperProps {
  disasterEvents: DisasterEvent[];
  selectedDisasterId: string | null;
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
