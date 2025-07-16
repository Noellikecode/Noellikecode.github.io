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
    if (!mapContainerRef.current || typeof window === 'undefined') return;

    // Ensure we don't initialize multiple times
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const timer = setTimeout(() => {
      if (mapContainerRef.current && !mapRef.current) {
        try {
          mapRef.current = L.map(mapContainerRef.current, {
            center: [40.7128, -74.0060], // Default to NYC
            zoom: 2,
            zoomControl: true,
          });

          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
          }).addTo(mapRef.current);
          
          // Invalidate size to ensure proper rendering
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.invalidateSize();
            }
          }, 300);
          
          setMapInitialized(true);
        } catch (error) {
          console.error('Failed to initialize map:', error);
          setMapInitialized(false);
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !clinics.length) return;

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current!.removeLayer(layer);
      }
    });

    // Add clinic markers
    clinics.forEach((clinic) => {
      if (!clinic.latitude || !clinic.longitude) return;

      // Create custom icon based on cost level
      const getMarkerColor = (costLevel: string) => {
        switch (costLevel) {
          case 'free': return '#4CAF50'; // Green
          case 'low-cost': return '#FF9800'; // Orange
          case 'market-rate': return '#1976D2'; // Blue
          default: return '#9E9E9E'; // Gray
        }
      };

      const customIcon = L.divIcon({
        html: `<div style="background-color: ${getMarkerColor(clinic.costLevel)}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        className: 'custom-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([clinic.latitude, clinic.longitude], { icon: customIcon })
        .addTo(mapRef.current!)
        .on('click', () => onClinicClick(clinic));

      // Add popup
      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-semibold">${clinic.name}</h3>
          <p class="text-sm text-gray-600">${clinic.city}, ${clinic.country}</p>
          <p class="text-sm">Cost: ${clinic.costLevel}</p>
          <p class="text-sm">Services: ${clinic.services.slice(0, 2).join(', ')}${clinic.services.length > 2 ? '...' : ''}</p>
        </div>
      `);
    });
  }, [clinics, onClinicClick]);

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
      
      {/* Show loading message if map hasn't initialized */}
      {!mapInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300">
          <div className="text-center p-8">
            <div className="mb-4">
              <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Interactive World Map</h3>
            <p className="text-gray-600">Map is loading...</p>
            <div className="mt-4">
              <LoadingSpinner size="sm" />
            </div>
          </div>
        </div>
      )}
      
      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
        <h3 className="font-semibold text-gray-900 mb-3">Legend</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Free Services</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Low Cost</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Market Rate</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span>Unverified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
