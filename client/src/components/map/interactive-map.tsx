import { useEffect, useRef, useState } from "react";
import { Clinic } from "@/types/clinic";
import LoadingSpinner from "@/components/ui/loading-spinner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface InteractiveMapProps {
  clinics: Clinic[];
  onClinicClick: (clinic: Clinic) => void;
  isLoading?: boolean;
}

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function InteractiveMap({ clinics, onClinicClick, isLoading }: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      // Initialize the map
      const map = L.map(mapContainerRef.current, {
        center: [39.8283, -98.5795], // Center of USA
        zoom: 4,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true
      });

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        minZoom: 2
      }).addTo(map);

      mapRef.current = map;
      
      // Set map ready after a short delay to ensure tiles load
      setTimeout(() => {
        map.invalidateSize();
        setMapReady(true);
        console.log('Leaflet map initialized successfully');
      }, 100);

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapReady(true); // Show even if there's an error
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Add markers when map is ready and clinics are available
  useEffect(() => {
    if (!mapReady || !mapRef.current || !clinics.length) return;

    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = [];

    // Add clinic markers
    let addedMarkers = 0;
    clinics.forEach(clinic => {
      if (clinic.latitude && clinic.longitude) {
        try {
          const marker = L.marker([clinic.latitude, clinic.longitude])
            .bindPopup(`
              <div style="padding: 8px; min-width: 250px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px; color: #1f2937;">${clinic.name}</h3>
                <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 14px;">
                  <strong>Address:</strong> ${clinic.address}
                </p>
                <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 14px;">
                  <strong>Services:</strong> ${clinic.services || 'Speech therapy services'}
                </p>
                ${clinic.phone ? `<p style="margin: 0; color: #3b82f6; font-size: 14px;"><strong>Phone:</strong> ${clinic.phone}</p>` : ''}
              </div>
            `)
            .on('click', () => {
              onClinicClick(clinic);
            });

          marker.addTo(map);
          markersRef.current.push(marker);
          addedMarkers++;
        } catch (error) {
          console.warn('Failed to add marker for clinic:', clinic.name, error);
        }
      }
    });

    console.log(`Added ${addedMarkers} markers to the map`);

    // Fit map to show all markers if we have any
    if (markersRef.current.length > 0) {
      const group = new L.FeatureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }

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
        style={{ minHeight: '400px' }}
      />
      
      {!mapReady && (
        <div className="absolute inset-0 bg-blue-50 flex items-center justify-center z-10">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-2 text-gray-700">Loading map...</p>
            <p className="text-xs text-gray-500 mt-1">Initializing interactive map</p>
          </div>
        </div>
      )}

      {mapReady && (
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10">
          <div className="text-sm font-semibold text-gray-800">Speech Therapy Centers</div>
          <div className="text-xs text-gray-600">{clinics.length} locations found</div>
          <div className="text-xs text-gray-500 mt-1">Click markers for details</div>
        </div>
      )}
    </div>
  );
}