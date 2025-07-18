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
  const mapInstanceRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    let mounted = true;
    
    const loadLeaflet = async () => {
      if (!mapContainerRef.current) return;
      
      try {
        // Import Leaflet CSS first
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(cssLink);

        // Wait for CSS to load
        await new Promise((resolve) => {
          cssLink.onload = resolve;
          setTimeout(resolve, 1000); // Fallback timeout
        });

        // Import Leaflet JS
        const L = await import('https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js');
        
        if (!mounted || !mapContainerRef.current) return;
        
        leafletRef.current = L.default;
        const Leaflet = L.default;

        // Fix default marker icons
        delete (Leaflet.Icon.Default.prototype as any)._getIconUrl;
        Leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Create the map
        const map = Leaflet.map(mapContainerRef.current, {
          center: [39.8283, -98.5795],
          zoom: 4,
          zoomControl: true,
          scrollWheelZoom: true
        });

        // Add OpenStreetMap tiles
        Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18
        }).addTo(map);

        mapInstanceRef.current = map;
        
        // Wait for map tiles to load
        setTimeout(() => {
          if (mounted) {
            map.invalidateSize();
            setMapReady(true);
            console.log('Map loaded successfully');
          }
        }, 500);

      } catch (error) {
        console.error('Failed to load map:', error);
        if (mounted) {
          setMapReady(true); // Show fallback
        }
      }
    };

    loadLeaflet();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
    };
  }, []);

  // Add markers when map is ready
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !leafletRef.current) return;

    const L = leafletRef.current;
    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      try {
        map.removeLayer(marker);
      } catch (e) {
        // Ignore removal errors
      }
    });
    markersRef.current = [];

    // Add clinic markers
    let markerCount = 0;
    clinics.forEach(clinic => {
      if (clinic.latitude && clinic.longitude) {
        try {
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
          
          markersRef.current.push(marker);
          markerCount++;
        } catch (e) {
          console.warn('Failed to add marker for clinic:', clinic.name);
        }
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
          backgroundColor: '#f0f8ff'
        }}
      />
      
      {!mapReady && (
        <div className="absolute inset-0 bg-blue-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-2 text-gray-700">Loading interactive map...</p>
            <p className="text-xs text-gray-500 mt-1">This may take a few seconds</p>
          </div>
        </div>
      )}
    </div>
  );
}