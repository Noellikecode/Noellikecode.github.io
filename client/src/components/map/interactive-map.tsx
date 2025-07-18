import { useEffect, useRef, useState } from "react";
import { Clinic } from "@/types/clinic";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface InteractiveMapProps {
  clinics: Clinic[];
  onClinicClick: (clinic: Clinic) => void;
  isLoading?: boolean;
}

declare global {
  interface Window {
    L: any;
  }
}

export default function InteractiveMap({ clinics, onClinicClick, isLoading }: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      try {
        if (!mapContainerRef.current || mapRef.current) return;

        // Clean up any existing map
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        console.log('Starting map initialization...');
        
        // Dynamic import of Leaflet
        const leaflet = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        
        if (!mounted || !mapContainerRef.current) return;
        
        const L = leaflet.default;
        window.L = L; // Store globally for easier access

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

        // Wait for tiles to load
        mapRef.current.whenReady(() => {
          if (mounted) {
            setMapInitialized(true);
            console.log('Map initialized successfully');
          }
        });

      } catch (error) {
        console.error('Map failed to load:', error);
        if (mounted) {
          setMapInitialized(true);
        }
      }
    };

    // Delay initialization to ensure DOM is ready
    const timer = setTimeout(initMap, 100);

    return () => {
      clearTimeout(timer);
      mounted = false;
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        mapRef.current = null;
      }
      markersRef.current = [];
      setMapInitialized(false);
    };
  }, []);

  // Add markers to map
  useEffect(() => {
    if (!mapInitialized || !mapRef.current || !window.L) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      try {
        mapRef.current.removeLayer(marker);
      } catch (e) {
        // Ignore removal errors
      }
    });
    markersRef.current = [];

    // Add new markers
    clinics.forEach(clinic => {
      if (clinic.latitude && clinic.longitude) {
        const marker = window.L.marker([clinic.latitude, clinic.longitude])
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
    <div className="relative h-full w-full">
      <div 
        ref={mapContainerRef} 
        className="h-full w-full bg-gray-100"
        style={{ minHeight: '400px', height: '100%' }}
      />
      
      {!mapInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-2 text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}