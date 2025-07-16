import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Clinic } from "@/types/clinic";
import LoadingSpinner from "@/components/ui/loading-spinner";

// Fix for default markers in Leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

interface InteractiveMapProps {
  clinics: Clinic[];
  onClinicClick: (clinic: Clinic) => void;
  isLoading?: boolean;
}

export default function InteractiveMap({ clinics, onClinicClick, isLoading }: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current).setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);
    
    setMapInitialized(true);

    return () => {
      map.remove();
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
    <div className="relative w-full">
      <div 
        ref={mapContainerRef} 
        className="w-full bg-gray-200 border"
        style={{ height: '500px' }}
      />
      
      {!mapInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p>Loading map...</p>
        </div>
      )}
    </div>
  );
}
