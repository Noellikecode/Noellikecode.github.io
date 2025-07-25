import { useEffect, useRef, useState } from "react";
import { Clinic } from "@/types/clinic";

interface OriginalWorkingMapProps {
  clinics: Clinic[];
  filteredClinics: Clinic[];
  onClinicClick: (clinic: Clinic) => void;
  isLoading?: boolean;
  selectedState?: string;
}

export default function OriginalWorkingMap({ 
  clinics, 
  filteredClinics, 
  onClinicClick, 
  isLoading, 
  selectedState 
}: OriginalWorkingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    async function initMap() {
      if (!mapRef.current || isLoading) return;

      try {
        // Import Leaflet
        const L = await import('leaflet');
        
        // Add CSS if not present
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
          await new Promise(resolve => {
            link.onload = () => resolve(undefined);
            setTimeout(resolve, 1000);
          });
        }

        // Configure default icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        // Clear any existing map
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        // Create map
        mapInstanceRef.current = L.map(mapRef.current, {
          center: [39.8283, -98.5795], // Center of USA
          zoom: 4,
          zoomControl: true,
          scrollWheelZoom: true,
          dragging: true,
        });

        // Add tile layer
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        });
        
        tileLayer.addTo(mapInstanceRef.current);
        
        // Wait for tiles to load before showing as ready
        tileLayer.on('load', () => {
          setMapReady(true);
        });
        
        // Fallback in case tiles don't trigger load event
        setTimeout(() => setMapReady(true), 2000);

        // Clear existing markers
        markersRef.current.forEach(marker => {
          mapInstanceRef.current.removeLayer(marker);
        });
        markersRef.current = [];

        // Add markers for filtered clinics
        const validClinics = filteredClinics.filter(
          clinic => clinic.latitude && clinic.longitude && 
                   !isNaN(clinic.latitude) && !isNaN(clinic.longitude)
        );

        validClinics.forEach(clinic => {
          const marker = L.marker([clinic.latitude, clinic.longitude])
            .addTo(mapInstanceRef.current)
            .bindPopup(`
              <div>
                <h3 style="margin: 0 0 8px 0; font-weight: bold;">${clinic.name}</h3>
                <p style="margin: 0 0 4px 0; color: #666;">${clinic.city}</p>
                <p style="margin: 0; color: #666;">Click for details</p>
              </div>
            `)
            .on('click', () => onClinicClick(clinic));

          markersRef.current.push(marker);
        });

        // Fit bounds if we have markers
        if (markersRef.current.length > 0) {
          const group = new L.FeatureGroup(markersRef.current);
          mapInstanceRef.current.fitBounds(group.getBounds(), { 
            padding: [20, 20],
            maxZoom: 13
          });
        }

        console.log(`Map loaded with ${validClinics.length} markers`);

      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    }

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
    };
  }, [filteredClinics, isLoading, onClinicClick]);

  if (isLoading) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading speech therapy centers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div 
        ref={mapRef} 
        className="h-full w-full"
        style={{ 
          minHeight: '400px',
          backgroundColor: '#a7c8ed' // Light blue background while loading
        }}
      />
      
      {!mapReady && (
        <div className="absolute inset-0 bg-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700">Loading map...</p>
          </div>
        </div>
      )}
      
      {mapReady && (
        <div className="absolute top-4 left-4 bg-white rounded-lg p-3 shadow-lg">
          <div className="text-sm font-semibold">Speech Therapy Centers</div>
          <div className="text-xs text-gray-600">{filteredClinics.length} centers displayed</div>
        </div>
      )}
    </div>
  );
}