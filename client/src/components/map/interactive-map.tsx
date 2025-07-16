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
    if (!mapContainerRef.current) return;

    // Clean up existing map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const initMap = async () => {
      try {
        console.log('Starting map initialization...');
        
        // Ensure the container is ready
        if (!mapContainerRef.current) return;
        
        // Create map with proper options
        mapRef.current = L.map(mapContainerRef.current, {
          center: [20, 0],
          zoom: 2,
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          attributionControl: true,
        });

        // Add tile layer
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        });
        
        tileLayer.addTo(mapRef.current);
        
        // Wait for tiles to load before marking as initialized
        tileLayer.on('load', () => {
          console.log('Map tiles loaded successfully');
          setMapInitialized(true);
        });

        // Also set initialized after a delay as fallback
        setTimeout(() => {
          console.log('Map initialization timeout reached');
          setMapInitialized(true);
        }, 2000);

      } catch (error) {
        console.error('Map initialization failed:', error);
        setMapInitialized(true); // Show map container even if failed
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initMap, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapInitialized(false);
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
