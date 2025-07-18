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
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  // Initialize map once
  useEffect(() => {
    let isMounted = true;

    const loadMap = async () => {
      if (!mapContainerRef.current) return;

      try {
        // Import Leaflet
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');
        
        if (!isMounted) return;
        
        leafletRef.current = L;

        // Configure default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Create map
        const map = L.map(mapContainerRef.current, {
          center: [39.8283, -98.5795],
          zoom: 4,
          minZoom: 2,
          maxZoom: 18
        });

        // Add base layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        mapRef.current = map;
        
        // Wait for map to be ready
        map.whenReady(() => {
          if (isMounted) {
            setMapReady(true);
          }
        });

      } catch (error) {
        console.error('Failed to load map:', error);
        if (isMounted) {
          setMapReady(true); // Show content even if map fails
        }
      }
    };

    loadMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapReady(false);
    };
  }, []);

  // Add markers when map is ready and clinics change
  useEffect(() => {
    if (!mapReady || !mapRef.current || !leafletRef.current || !clinics.length) return;

    const L = leafletRef.current;
    const map = mapRef.current;

    // Clear existing markers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add clinic markers
    let markerCount = 0;
    clinics.forEach(clinic => {
      if (clinic.latitude && clinic.longitude) {
        const marker = L.marker([clinic.latitude, clinic.longitude])
          .bindPopup(`
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="margin: 0 0 4px 0; font-weight: bold; font-size: 14px;">${clinic.name}</h3>
              <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">${clinic.address}</p>
              <p style="margin: 0; color: #0066cc; font-size: 12px;">${clinic.services || 'Speech therapy services'}</p>
            </div>
          `)
          .on('click', () => onClinicClick(clinic))
          .addTo(map);
        
        markerCount++;
      }
    });

    console.log(`Added ${markerCount} markers to map`);
  }, [mapReady, clinics, onClinicClick]);

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
    <div className="relative h-full w-full">
      <div 
        ref={mapContainerRef} 
        className="h-full w-full"
        style={{ 
          minHeight: '400px',
          backgroundColor: '#f0f0f0'
        }}
      />
      
      {!mapReady && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-2 text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}