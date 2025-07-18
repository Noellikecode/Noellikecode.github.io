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
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initGoogleMap = () => {
      if (!window.google || !mapContainerRef.current) return;

      // Create map centered on North America
      mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: 39.8283, lng: -98.5795 }, // Center of USA
        zoom: 4,
        minZoom: 2,
        maxZoom: 18,
        mapTypeId: 'roadmap'
      });

      setMapInitialized(true);
      console.log('Google Map initialized successfully');
    };

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initGoogleMap();
    } else {
      // Load Google Maps script
      window.initMap = initGoogleMap;
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBu-916DdpKAjTmJNIgngS6HL_kDIKU0aU&callback=initMap&libraries=marker`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onerror = () => {
        console.error('Failed to load Google Maps');
        // Fallback to simple display
        setMapInitialized(true);
      };
    }

    return () => {
      // Clean up markers
      markersRef.current = [];
    };
  }, []);

  // Add markers to map
  useEffect(() => {
    if (!mapInitialized || !mapRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];

    // Add clinic markers
    clinics.forEach(clinic => {
      if (clinic.latitude && clinic.longitude) {
        const marker = new window.google.maps.Marker({
          position: { lat: clinic.latitude, lng: clinic.longitude },
          map: mapRef.current,
          title: clinic.name
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="margin: 0 0 4px 0; font-weight: bold; font-size: 14px;">${clinic.name}</h3>
              <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">${clinic.address}</p>
              <p style="margin: 0; color: #0066cc; font-size: 12px;">${clinic.services || 'Speech therapy services'}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapRef.current, marker);
          onClinicClick(clinic);
        });

        markersRef.current.push(marker);
      }
    });

    console.log('Added', markersRef.current.length, 'markers to Google Map');
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
        style={{ minHeight: '400px' }}
      />
      
      {!mapInitialized && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-50">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-2 text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}