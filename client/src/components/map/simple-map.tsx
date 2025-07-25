import { useEffect, useRef, useState } from "react";
import { Clinic } from "@/types/clinic";

interface SimpleMapProps {
  clinics: Clinic[];
  filteredClinics: Clinic[];
  onClinicClick: (clinic: Clinic) => void;
  isLoading?: boolean;
}

export default function SimpleMap({ clinics, filteredClinics, onClinicClick, isLoading }: SimpleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    async function initMap() {
      if (!mapRef.current || isLoading || mapInstanceRef.current) return;

      try {
        console.log('Starting map initialization...');
        
        // Import Leaflet
        const L = await import('leaflet');
        
        // Load CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Configure icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        // Create map
        mapInstanceRef.current = L.map(mapRef.current, {
          center: [39.8283, -98.5795], // Center of USA
          zoom: 4,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        // Add tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(mapInstanceRef.current);

        console.log('Map created successfully');
        setMapReady(true);
        
        // Add markers
        if (filteredClinics.length > 0) {
          console.log(`Adding ${filteredClinics.length} markers`);
          
          filteredClinics.forEach((clinic) => {
            if (clinic.latitude && clinic.longitude) {
              const marker = L.marker([clinic.latitude, clinic.longitude])
                .addTo(mapInstanceRef.current!)
                .bindPopup(`
                  <div>
                    <h3 style="margin: 0 0 8px 0; font-weight: bold;">${clinic.name}</h3>
                    <p style="margin: 0 0 4px 0; color: #666;">${clinic.address}</p>
                    <p style="margin: 0; color: #666;">${clinic.city}, ${clinic.state}</p>
                  </div>
                `)
                .on('click', () => {
                  onClinicClick(clinic);
                });
            }
          });
          
          // Fit bounds to show all markers
          const group = new L.FeatureGroup(
            filteredClinics
              .filter(c => c.latitude && c.longitude)
              .map(c => L.marker([c.latitude, c.longitude]))
          );
          
          if (group.getBounds().isValid()) {
            mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [20, 20] });
          }
        }

      } catch (error) {
        console.error('Map initialization failed:', error);
        setMapError(true);
      }
    }

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [clinics, filteredClinics, isLoading, onClinicClick]);

  if (isLoading) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clinics...</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="h-full w-full bg-red-50 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-red-600 mb-2 text-lg">Map Loading Failed</div>
          <p className="text-gray-700 mb-4">Unable to load the interactive map.</p>
          <button 
            onClick={() => {
              setMapError(false);
              setMapReady(false);
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <div 
        ref={mapRef} 
        className="h-full w-full"
        style={{ minHeight: '500px', backgroundColor: '#a7c8ed' }}
      />
      
      {!mapReady && (
        <div className="absolute inset-0 bg-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-700">Loading interactive map...</p>
          </div>
        </div>
      )}
      
      {mapReady && (
        <div className="absolute top-4 left-4 bg-white rounded-lg p-3 shadow-lg">
          <div className="text-sm font-semibold">Interactive Map</div>
          <div className="text-xs text-gray-600">{filteredClinics.length} centers displayed</div>
        </div>
      )}
    </div>
  );
}