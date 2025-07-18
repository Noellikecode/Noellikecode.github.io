import { useEffect, useRef, useState } from "react";
import { Clinic } from "@/types/clinic";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface InteractiveMapProps {
  clinics: Clinic[];
  onClinicClick: (clinic: Clinic) => void;
  isLoading?: boolean;
}

export default function InteractiveMap({ clinics, onClinicClick, isLoading }: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    let map: any = null;

    const initMap = async () => {
      try {
        // Dynamic import of Leaflet
        const leaflet = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        
        const LeafletLib = leaflet.default;
        setL(LeafletLib);

        // Fix marker icons
        delete (LeafletLib.Icon.Default.prototype as any)._getIconUrl;
        LeafletLib.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        if (!mapContainerRef.current) return;

        // Create map with zoom constraints
        map = LeafletLib.map(mapContainerRef.current, {
          center: [20, 0],
          zoom: 2,
          minZoom: 2,
          maxZoom: 18,
          maxBounds: [[-85, -180], [85, 180]],
          maxBoundsViscosity: 1.0
        });

        // Add tile layer with world wrap prevention
        LeafletLib.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          noWrap: true,
          bounds: [[-85, -180], [85, 180]]
        }).addTo(map);

        setMapInitialized(true);
        console.log('Map loaded successfully');

      } catch (error) {
        console.error('Map failed to load:', error);
        setMapInitialized(true); // Still show container
      }
    };

    const timer = setTimeout(initMap, 500);

    return () => {
      clearTimeout(timer);
      if (map) {
        map.remove();
      }
    };
  }, []);

  // Markers will be added later

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-200px)] w-full bg-gray-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div 
        ref={mapContainerRef} 
        className="h-full w-full bg-gray-100"
        style={{ minHeight: '400px' }}
      />
      
      {!mapInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-2 text-gray-600">Loading map...</p>
            <p className="text-xs text-gray-400 mt-1">Status: {mapInitialized ? 'Ready' : 'Loading'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
