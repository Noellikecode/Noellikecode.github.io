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
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initMap = async () => {
      try {
        // Dynamic import of Leaflet
        const leaflet = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        
        const L = leaflet.default;

        // Fix marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Create map centered on North America
        mapRef.current = L.map(mapContainerRef.current, {
          center: [39.8283, -98.5795], // Center of USA
          zoom: 4,
          minZoom: 2,
          maxZoom: 18
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapRef.current);

        setMapInitialized(true);
        console.log('Map initialized successfully');

      } catch (error) {
        console.error('Map failed to load:', error);
        setMapInitialized(true);
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];
    };
  }, []);

  // Add markers to map
  useEffect(() => {
    if (!mapInitialized || !mapRef.current) return;

    const L = (window as any).L || require('leaflet');

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    clinics.forEach(clinic => {
      if (clinic.latitude && clinic.longitude) {
        const marker = L.marker([clinic.latitude, clinic.longitude])
          .addTo(mapRef.current)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold text-sm">${clinic.name}</h3>
              <p class="text-xs text-gray-600">${clinic.address}</p>
              <p class="text-xs text-blue-600 mt-1">${clinic.services}</p>
            </div>
          `)
          .on('click', () => onClinicClick(clinic));

        markersRef.current.push(marker);
      }
    });

    console.log('Added', markersRef.current.length, 'markers to map');
  }, [clinics, onClinicClick, mapInitialized]);

  if (isLoading) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-2 text-gray-600">Loading clinics...</p>
        </div>
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
    </div>
  );
}