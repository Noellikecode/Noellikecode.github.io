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
    Cesium: any;
  }
}

export default function InteractiveMap({ clinics, onClinicClick, isLoading }: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const loadCesium = async () => {
      if (!mapContainerRef.current) return;

      try {
        // Load Cesium CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://cesium.com/downloads/cesiumjs/releases/1.111/Build/Cesium/Widgets/widgets.css';
        document.head.appendChild(cssLink);

        // Load Cesium JS
        const script = document.createElement('script');
        script.src = 'https://cesium.com/downloads/cesiumjs/releases/1.111/Build/Cesium/Cesium.js';
        script.async = true;

        const loadPromise = new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });

        document.head.appendChild(script);
        await loadPromise;

        if (!mounted || !mapContainerRef.current || !window.Cesium) return;

        // Configure Cesium
        window.Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxZS1mZjY5LTQwOGItOGE2OC04UzNkMzExZGY3MTQiLCJpZCI6MjU5LCJzY29wZXMiOlsiYXNyIiwiZ2MiXSwiaWF0IjoxNDc4MjI4MzQ0fQ.Hj9C_zE6bQtT_9h9aEfz_JfVOXHu8y_kYAyOXj9PK3s';

        const viewer = new window.Cesium.Viewer(mapContainerRef.current, {
          terrainProvider: window.Cesium.createWorldTerrain(),
          homeButton: true,
          sceneModePicker: true,
          baseLayerPicker: false,
          navigationHelpButton: false,
          animation: false,
          timeline: false,
          fullscreenButton: false,
          geocoder: false,
          infoBox: true,
          selectionIndicator: true
        });

        // Set initial camera position over North America
        viewer.camera.setView({
          destination: window.Cesium.Cartesian3.fromDegrees(-98.5795, 39.8283, 5000000),
          orientation: {
            heading: 0.0,
            pitch: -window.Cesium.Math.PI_OVER_TWO,
            roll: 0.0
          }
        });

        viewerRef.current = viewer;

        if (mounted) {
          setMapReady(true);
          console.log('3D Globe loaded successfully');
        }

      } catch (error) {
        console.error('Failed to load 3D map:', error);
        if (mounted) {
          setMapReady(true); // Show fallback
        }
      }
    };

    loadCesium();

    return () => {
      mounted = false;
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (e) {
          // Ignore cleanup errors
        }
        viewerRef.current = null;
      }
    };
  }, []);

  // Add markers when map is ready
  useEffect(() => {
    if (!mapReady || !viewerRef.current || !window.Cesium) return;

    const viewer = viewerRef.current;
    
    // Clear existing entities
    viewer.entities.removeAll();

    // Add clinic markers
    let markerCount = 0;
    clinics.forEach(clinic => {
      if (clinic.latitude && clinic.longitude) {
        try {
          const entity = viewer.entities.add({
            position: window.Cesium.Cartesian3.fromDegrees(clinic.longitude, clinic.latitude),
            billboard: {
              image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMzQgMiA1IDUuMTM0IDUgOUM1IDEzLjM2NyAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxMy4zNjcgMTkgOUMxOSA1LjEzNCAxNS44NjYgMiAxMiAyWiIgZmlsbD0iI0VGNDQ0NCIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjIiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSI5IiByPSIzIiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPgo=',
              scale: 0.8,
              verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM
            },
            label: {
              text: clinic.name,
              font: '12pt sans-serif',
              fillColor: window.Cesium.Color.WHITE,
              outlineColor: window.Cesium.Color.BLACK,
              outlineWidth: 2,
              style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new window.Cesium.Cartesian2(0, -40),
              show: false // Initially hidden
            },
            description: `
              <div style="padding: 10px; max-width: 300px;">
                <h3 style="margin: 0 0 8px 0; color: #333;">${clinic.name}</h3>
                <p style="margin: 0 0 8px 0; color: #666;">${clinic.address}</p>
                <p style="margin: 0; color: #0066cc;">${clinic.services || 'Speech therapy services'}</p>
              </div>
            `
          });

          // Add click handler
          entity.clinic = clinic;
          markerCount++;
        } catch (e) {
          console.warn('Failed to add marker for clinic:', clinic.name);
        }
      }
    });

    // Handle clicks on entities
    viewer.selectedEntityChanged.addEventListener(() => {
      const selectedEntity = viewer.selectedEntity;
      if (selectedEntity && selectedEntity.clinic) {
        onClinicClick(selectedEntity.clinic);
      }
    });

    console.log(`Added ${markerCount} markers to 3D globe`);
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
          backgroundColor: '#000011'
        }}
      />
      
      {!mapReady && (
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-black flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-2 text-white">Loading 3D Globe...</p>
            <p className="text-xs text-blue-200 mt-1">Preparing Earth view</p>
          </div>
        </div>
      )}

      {mapReady && (
        <div className="absolute top-4 left-4 bg-black/50 text-white p-3 rounded-lg backdrop-blur-sm">
          <div className="text-sm font-medium">3D Interactive Globe</div>
          <div className="text-xs opacity-75">{clinics.length} Speech Therapy Centers</div>
          <div className="text-xs opacity-75 mt-1">Click markers for details • Drag to rotate</div>
        </div>
      )}
    </div>
  );
}