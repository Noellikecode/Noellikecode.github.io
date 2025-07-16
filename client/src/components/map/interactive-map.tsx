import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Clinic } from "@/types/clinic";
import LoadingSpinner from "@/components/ui/loading-spinner";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface InteractiveMapProps {
  clinics: Clinic[];
  onClinicClick: (clinic: Clinic) => void;
  isLoading?: boolean;
}

export default function InteractiveMap({ clinics, onClinicClick, isLoading }: InteractiveMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current, {
      center: [40.7128, -74.0060], // Default to NYC
      zoom: 2,
      zoomControl: true,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current);

    return () => {
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
      <div ref={mapContainerRef} className="h-[calc(100vh-200px)] w-full bg-gray-100" />
      
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
