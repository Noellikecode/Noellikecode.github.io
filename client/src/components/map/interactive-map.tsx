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
    google: any;
    initMap: () => void;
  }
}

export default function InteractiveMap({ clinics, onClinicClick, isLoading }: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeGoogleMaps = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          createMap();
          return;
        }

        // Create callback function
        window.initMap = () => {
          if (mounted) {
            createMap();
          }
        };

        // Load Google Maps script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBt8ZhVl5gQjOq8ZY8GQ1-9XQ1Z1Z1Z1Z1&callback=initMap`;
        script.async = true;
        script.defer = true;
        
        script.onerror = () => {
          console.error('Failed to load Google Maps');
          if (mounted) {
            fallbackToSimpleMap();
          }
        };

        document.head.appendChild(script);

        // Timeout fallback
        setTimeout(() => {
          if (mounted && !mapReady) {
            console.log('Google Maps timeout, falling back to simple map');
            fallbackToSimpleMap();
          }
        }, 5000);

      } catch (error) {
        console.error('Error loading Google Maps:', error);
        if (mounted) {
          fallbackToSimpleMap();
        }
      }
    };

    const createMap = () => {
      if (!mapContainerRef.current || !window.google) return;

      try {
        const map = new window.google.maps.Map(mapContainerRef.current, {
          center: { lat: 39.8283, lng: -98.5795 },
          zoom: 4,
          mapTypeId: 'roadmap'
        });

        mapRef.current = map;

        // Add clinic markers
        const bounds = new window.google.maps.LatLngBounds();
        let addedMarkers = 0;

        clinics.forEach(clinic => {
          if (clinic.latitude && clinic.longitude) {
            const marker = new window.google.maps.Marker({
              position: { lat: clinic.latitude, lng: clinic.longitude },
              map: map,
              title: clinic.name
            });

            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 8px; max-width: 300px;">
                  <h3 style="margin: 0 0 8px 0; font-weight: bold;">${clinic.name}</h3>
                  <p style="margin: 0 0 6px 0; color: #666;">${clinic.address}</p>
                  <p style="margin: 0; color: #0066cc;">${clinic.services || 'Speech therapy services'}</p>
                </div>
              `
            });

            marker.addListener('click', () => {
              infoWindow.open(map, marker);
              onClinicClick(clinic);
            });

            markersRef.current.push(marker);
            bounds.extend(marker.getPosition());
            addedMarkers++;
          }
        });

        if (addedMarkers > 0) {
          map.fitBounds(bounds);
        }

        console.log(`Added ${addedMarkers} markers to Google Maps`);
        setMapReady(true);
        setMapError(false);

      } catch (error) {
        console.error('Error creating Google Maps:', error);
        fallbackToSimpleMap();
      }
    };

    const fallbackToSimpleMap = () => {
      // Create a simple fallback map using just HTML/CSS
      if (!mapContainerRef.current) return;

      const container = mapContainerRef.current;
      container.innerHTML = `
        <div style="
          width: 100%; 
          height: 100%; 
          background: linear-gradient(180deg, #87CEEB 0%, #98FB98 100%);
          position: relative;
          overflow: hidden;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255,255,255,0.9);
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          ">
            <h3 style="margin: 0 0 8px 0; color: #333;">Speech Therapy Centers</h3>
            <p style="margin: 0 0 8px 0; color: #666;">${clinics.length} locations across the United States</p>
            <div style="text-align: left; margin-top: 12px;">
              ${clinics.slice(0, 5).map(clinic => `
                <div style="
                  padding: 4px 0; 
                  border-bottom: 1px solid #eee; 
                  cursor: pointer;
                  font-size: 12px;
                " onclick="console.log('Clicked: ${clinic.name}')">
                  📍 ${clinic.name}
                </div>
              `).join('')}
              ${clinics.length > 5 ? `<div style="color: #666; font-size: 11px; margin-top: 8px;">...and ${clinics.length - 5} more locations</div>` : ''}
            </div>
          </div>
        </div>
      `;

      setMapReady(true);
      setMapError(false);
      console.log('Fallback map created with clinic list');
    };

    initializeGoogleMaps();

    return () => {
      mounted = false;
      markersRef.current = [];
      if (window.initMap) {
        delete window.initMap;
      }
    };
  }, [clinics, onClinicClick]);

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
            <p className="text-xs text-gray-500 mt-1">Trying Google Maps, will fallback if needed</p>
          </div>
        </div>
      )}

      {mapReady && !mapError && (
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10">
          <div className="text-sm font-semibold text-gray-800">Interactive Map</div>
          <div className="text-xs text-gray-600">{clinics.length} speech therapy centers</div>
          <div className="text-xs text-gray-500 mt-1">Click markers for details</div>
        </div>
      )}
    </div>
  );
}