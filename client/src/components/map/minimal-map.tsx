import { useEffect, useRef, useState } from "react";
import { Clinic } from "@/types/clinic";

interface MinimalMapProps {
  clinics: Clinic[];
  filteredClinics: Clinic[];
  onClinicClick: (clinic: Clinic) => void;
  isLoading?: boolean;
}

export default function MinimalMap({ filteredClinics, onClinicClick, isLoading }: MinimalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (isLoading || !mapRef.current) return;

    let L: any;
    let map: any;

    async function loadMap() {
      try {
        // Import Leaflet
        L = await import('leaflet');
        
        // Force load CSS
        const cssLoaded = new Promise<void>((resolve) => {
          if (document.querySelector('link[href*="leaflet.css"]')) {
            resolve();
            return;
          }
          
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.onload = () => resolve();
          link.onerror = () => resolve(); // Continue even if CSS fails
          document.head.appendChild(link);
          
          // Fallback
          setTimeout(resolve, 1000);
        });
        
        await cssLoaded;

        // Configure Leaflet icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        // Create map with explicit container dimensions
        if (!mapRef.current) return;
        
        // Force container size
        mapRef.current.style.width = '100%';
        mapRef.current.style.height = '100%';
        mapRef.current.style.minHeight = '500px';
        
        map = L.map(mapRef.current, {
          center: [39.8283, -98.5795],
          zoom: 4,
          attributionControl: true,
          zoomControl: true
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        console.log('Map container created, adding markers...');
        setMapLoaded(true);

        // Add markers
        const validClinics = filteredClinics.filter(
          clinic => clinic.latitude && clinic.longitude && 
                   !isNaN(clinic.latitude) && !isNaN(clinic.longitude)
        );

        console.log(`Adding ${validClinics.length} markers to map`);

        validClinics.forEach((clinic, index) => {
          if (index < 1000) { // Limit to first 1000 for performance
            const marker = L.marker([clinic.latitude, clinic.longitude])
              .addTo(map)
              .bindPopup(`<strong>${clinic.name}</strong><br/>${clinic.city}`)
              .on('click', () => onClinicClick(clinic));
          }
        });

        // Fit to markers if any exist
        if (validClinics.length > 0) {
          const group = new L.FeatureGroup(
            validClinics.slice(0, 1000).map(c => L.marker([c.latitude, c.longitude]))
          );
          map.fitBounds(group.getBounds(), { padding: [20, 20] });
        }

        // Force map to invalidate size after setup
        setTimeout(() => {
          if (map) {
            map.invalidateSize();
          }
        }, 100);

      } catch (error) {
        console.error('Map loading failed:', error);
      }
    }

    loadMap();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [filteredClinics, isLoading, onClinicClick]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ 
          minHeight: '500px',
          position: 'relative',
          zIndex: 1
        }}
      />
      
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-100 z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-700">Initializing map...</p>
          </div>
        </div>
      )}
      
      {mapLoaded && (
        <div className="absolute top-4 left-4 bg-white rounded p-2 shadow-lg z-20">
          <div className="text-sm font-medium">Speech Therapy Centers</div>
          <div className="text-xs text-gray-600">{filteredClinics.length} locations</div>
        </div>
      )}
    </div>
  );
}