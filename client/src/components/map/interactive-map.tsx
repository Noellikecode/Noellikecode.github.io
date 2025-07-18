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
    if (!mapContainerRef.current) return;

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

        // Add markers for clinics
        clinics.forEach(clinic => {
          if (clinic.latitude && clinic.longitude) {
            const marker = L.marker([clinic.latitude, clinic.longitude])
              .addTo(mapRef.current)
              .bindPopup(`
                <div style="padding: 8px; min-width: 200px;">
                  <h3 style="font-weight: bold; margin: 0 0 4px 0;">${clinic.name}</h3>
                  <p style="margin: 0; color: #666; font-size: 12px;">${clinic.city}, ${clinic.country}</p>
                  ${clinic.phone ? `<p style="margin: 4px 0; font-size: 12px;">${clinic.phone}</p>` : ''}
                  ${clinic.services ? `<p style="margin: 4px 0; font-size: 11px;">Services: ${clinic.services.join(', ')}</p>` : ''}
                </div>
              `)
              .on('click', () => onClinicClick(clinic));

            markersRef.current.push(marker);
          }
        });

        // Fit map to show all markers if we have clinics
        if (markersRef.current.length > 0) {
          const group = new L.featureGroup(markersRef.current);
          mapRef.current.fitBounds(group.getBounds().pad(0.1));
        }

        setMapInitialized(true);
        console.log('Map loaded successfully with', markersRef.current.length, 'markers');

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
    };
  }, [clinics, onClinicClick]);

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
