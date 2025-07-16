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
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const timer = setTimeout(() => {
      try {
        console.log('Initializing map...');
        mapRef.current = L.map(mapContainerRef.current!, {
          center: [40.7128, -74.0060],
          zoom: 2,
          scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(mapRef.current);

        // Force size invalidation after a brief delay
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        }, 200);

        setMapInitialized(true);
        console.log('Map initialized successfully');
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
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
    <div className="relative">
      <div 
        ref={mapContainerRef} 
        className="h-[calc(100vh-200px)] w-full bg-gray-100"
        style={{ minHeight: '400px', zIndex: 1 }}
      />
      
      {!mapInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300">
          <div className="text-center p-8">
            <div className="mb-4">
              <LoadingSpinner />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Loading Interactive Map</h3>
            <p className="text-gray-600">Please wait while the map initializes...</p>
          </div>
        </div>
      )}
    </div>
  );
}
