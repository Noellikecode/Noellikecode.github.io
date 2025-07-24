import { useEffect, useRef, useState } from "react";
import { Clinic } from "@/types/clinic";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface InteractiveMapProps {
  clinics: Clinic[];
  filteredClinics: Clinic[];
  onClinicClick: (clinic: Clinic) => void;
  isLoading?: boolean;
  selectedState?: string;
  getStateBounds?: (state: string) => any;
  userLocation?: { lat: number; lon: number; zipcode: string } | null;
}

export default function InteractiveMap({ clinics, filteredClinics, onClinicClick, isLoading, selectedState, getStateBounds, userLocation }: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const initAttemptRef = useRef(0);
  const maxRetries = 3;
  const initializingRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;

    const attemptMapInitialization = async () => {
      if (!mapContainerRef.current || !mounted || initializingRef.current) return;
      
      // Clear existing map when filters change
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
        markersRef.current = [];
        setMapReady(false);
      }
      
      // Reset attempt counter for new filter requests
      initAttemptRef.current = 0;
      
      initializingRef.current = true;

      initAttemptRef.current++;
      console.log(`Map initialization attempt ${initAttemptRef.current}/${maxRetries}`);

      try {
        // Clear any existing map
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch (e) {}
          mapInstanceRef.current = null;
        }

        // Ensure container is ready
        const container = mapContainerRef.current;
        if (!container.offsetWidth || !container.offsetHeight) {
          throw new Error('Container not ready');
        }

        // Dynamic import of Leaflet
        const [L] = await Promise.all([
          import('leaflet'),
          // Load CSS
          new Promise<void>((resolve) => {
            const existingLink = document.querySelector('link[href*="leaflet.css"]');
            if (existingLink) {
              resolve();
              return;
            }
            
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            link.onload = () => resolve();
            link.onerror = () => resolve();
            document.head.appendChild(link);
            
            setTimeout(resolve, 1000);
          })
        ]);

        if (!mounted) return;

        // Configure Leaflet marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        // Create map with timeout protection
        const mapCreationPromise = new Promise<any>((resolve, reject) => {
          try {
            // Determine initial center and zoom based on user location
            let initialCenter: [number, number] = [39.8283, -98.5795]; // Center of USA
            let initialZoom = 4;
            
            if (userLocation) {
              initialCenter = [userLocation.lat, userLocation.lon];
              initialZoom = 13; // Much closer zoom for specific zipcode area
            }
            
            const map = L.map(container, {
              center: initialCenter,
              zoom: initialZoom,
              zoomControl: true,
              scrollWheelZoom: true,
              doubleClickZoom: true,
              dragging: true,
              attributionControl: true,
              preferCanvas: true, // Use canvas for smoother performance
              zoomAnimation: true,
              fadeAnimation: true,
              markerZoomAnimation: true,
              zoomSnap: 0.25, // Smoother zoom increments
              wheelPxPerZoomLevel: 120, // Smoother wheel zoom
              zoomDelta: 0.5 // Finer zoom control
            });

            // Add tile layer with error handling
            const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 18,
              minZoom: 2
            });

            let tilesLoaded = false;
            let tilesError = false;

            tileLayer.on('load', () => {
              tilesLoaded = true;
              console.log('Map tiles loaded successfully');
            });

            tileLayer.on('tileerror', () => {
              tilesError = true;
              console.warn('Some tiles failed to load');
            });

            tileLayer.addTo(map);

            // Give tiles time to load, then resolve
            setTimeout(() => {
              if (!tilesError || tilesLoaded) {
                resolve(map);
              } else {
                console.log('Tiles had issues but proceeding anyway');
                resolve(map);
              }
            }, 2000);

            // Immediate fallback if tiles load quickly
            tileLayer.on('load', () => {
              setTimeout(() => resolve(map), 100);
            });

          } catch (err) {
            reject(err);
          }
        });

        // Wait for map creation with timeout
        const map = await Promise.race([
          mapCreationPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Map creation timeout')), 10000)
          )
        ]) as any;

        if (!mounted) return;

        mapInstanceRef.current = map;

        // Optimize with Canvas rendering for large datasets
        map.getRenderer = map.getRenderer || (() => L.canvas());

        // Add clinic markers with optimized batching
        const L_imported = await import('leaflet');
        const bounds = new L_imported.LatLngBounds([]);
        let markerCount = 0;

        // Always show only filtered results - never show all clinics when filters are applied  
        const markersToShow = filteredClinics;
        const hasActiveFilters = filteredClinics.length < clinics.length;
        
        // If no markers to show at all, don't initialize map
        if (markersToShow.length === 0) {
          console.log('No markers to show, skipping map initialization');
          setMapReady(true);
          initializingRef.current = false;
          return;
        }
        
        // Dynamic batch sizing for smooth loading
        const getBatchSize = (zoom: number, isFiltered: boolean) => {
          if (isFiltered) return 200; // Larger batches for filtered results (smaller dataset)
          if (zoom <= 3) return 50;   // Smaller batches at low zoom for responsiveness
          if (zoom <= 5) return 100;  // Medium batches at medium zoom
          return 150;                 // Moderate batches for initial load
        };

        // Process with dynamic batch sizing for optimal performance
        const currentBatchSize = getBatchSize(map.getZoom(), hasActiveFilters);
        const batches = [];
        for (let i = 0; i < markersToShow.length; i += currentBatchSize) {
          batches.push(markersToShow.slice(i, i + currentBatchSize));
        }

        for (const batch of batches) {
          if (!mounted) break;
          
          for (const clinic of batch) {
            if (clinic.latitude && clinic.longitude) {
              try {
                const marker = L.marker([clinic.latitude, clinic.longitude], {
                  // Use lightweight options for performance
                  riseOnHover: true,
                  bubblingMouseEvents: false
                })
                  .bindPopup(`
                    <div style="padding: 8px; min-width: 200px; max-width: 280px;">
                      <h3 style="margin: 0 0 6px 0; font-weight: bold; color: #1f2937; font-size: 16px;">${clinic.name}</h3>
                      <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;">
                        📍 ${clinic.city}, ${clinic.country}
                      </p>
                      <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;">
                        🗣️ ${Array.isArray(clinic.services) && clinic.services.length > 0 ? clinic.services.join(', ') : 'Speech therapy'}
                      </p>
                      <p style="margin: 0 0 4px 0; color: #059669; font-size: 13px; font-weight: 600;">
                        💰 ${(clinic as any).costLevel || 'Contact for pricing'}
                      </p>
                      ${clinic.phone ? `<p style="margin: 0; color: #3b82f6; font-size: 13px;">📞 ${clinic.phone}</p>` : ''}
                    </div>
                  `, {
                    maxWidth: 300,
                    closeButton: true,
                    autoPan: false  // Disable auto-pan for performance
                  })
                  .on('click', () => onClinicClick(clinic));

                marker.addTo(map);
                markersRef.current.push(marker);
                bounds.extend([clinic.latitude, clinic.longitude]);
                markerCount++;
              } catch (error) {
                console.warn('Failed to add marker:', clinic.name, error);
              }
            }
          }
          
          // Dynamic delay: faster for filtered results, slower for initial load
          const delay = hasActiveFilters ? 5 : (currentBatchSize > 100 ? 15 : 10);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Smooth zoom-based marker management with debouncing
        let zoomTimeout: NodeJS.Timeout;
        map.on('zoomstart', () => {
          // Hide some UI elements during zoom for smoothness
          container.style.pointerEvents = 'none';
        });

        map.on('zoomend', () => {
          container.style.pointerEvents = 'auto';
          
          // Debounce for smooth zoom interactions
          clearTimeout(zoomTimeout);
          zoomTimeout = setTimeout(() => {
            const newZoom = map.getZoom();
            const status = hasActiveFilters ? 'filtered' : 'initial sample';
            console.log(`Zoom ${newZoom}: ${markerCount} markers (${status})`);
          }, 150);
        });

        // Add user location marker if available
        if (userLocation) {
          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `<div style="
              background: #3b82f6; 
              border: 3px solid white; 
              border-radius: 50%; 
              width: 20px; 
              height: 20px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                background: white; 
                border-radius: 50%; 
                width: 8px; 
                height: 8px;
              "></div>
            </div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          const userMarker = L.marker([userLocation.lat, userLocation.lon], { icon: userIcon })
            .bindPopup(`
              <div style="padding: 8px; text-align: center;">
                <h3 style="margin: 0 0 6px 0; font-weight: bold; color: #3b82f6;">Your Location</h3>
                <p style="margin: 0; color: #6b7280; font-size: 13px;">📍 Zipcode: ${userLocation.zipcode}</p>
                <p style="margin: 4px 0 0 0; color: #059669; font-size: 12px;">Showing clinics within 3 miles</p>
              </div>
            `, {
              maxWidth: 200,
              closeButton: true
            });

          userMarker.addTo(map);
          markersRef.current.push(userMarker);
        }

        // Fit map to markers
        if (markerCount > 0) {
          try {
            map.fitBounds(bounds, { padding: [20, 20] });
          } catch (e) {
            console.warn('Failed to fit bounds, using default view');
          }
        }

        // Ensure map is properly sized
        setTimeout(() => {
          if (mounted && map) {
            map.invalidateSize();
          }
        }, 100);

        console.log(`Map initialized successfully with ${markerCount} markers`);
        setMapReady(true);
        setMapError(false);
        initializingRef.current = false;
        
        // Always fit to the actual markers that are shown
        if (markerCount > 0 && bounds.isValid()) {
          try {
            // For state filtering, use tighter bounds around the markers
            const paddingOptions = hasActiveFilters ? { padding: [50, 50] } : { padding: [20, 20] };
            map.fitBounds(bounds, paddingOptions);
            console.log(`Map fitted to ${markerCount} markers with ${hasActiveFilters ? 'active' : 'no'} filters`);
          } catch (e) {
            console.warn('Failed to fit bounds, using default view');
            // Fallback to center US view
            map.setView([39.8283, -98.5795], 4);
          }
        } else {
          // No markers to show - center on US
          map.setView([39.8283, -98.5795], 4);
        }

      } catch (error) {
        console.error(`Map initialization attempt ${initAttemptRef.current} failed:`, error);
        
        initializingRef.current = false;
        if (mounted) {
          if (initAttemptRef.current < maxRetries) {
            console.log(`Retrying in 2 seconds... (attempt ${initAttemptRef.current + 1}/${maxRetries})`);
            retryTimeout = setTimeout(attemptMapInitialization, 2000);
          } else {
            console.error('All map initialization attempts failed');
            setMapError(true);
            setMapReady(true);
          }
        }
      }
    };

    // Start initialization with a small delay to ensure DOM is ready
    const initTimeout = setTimeout(attemptMapInitialization, 100);

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      clearTimeout(retryTimeout);
      
      // Clean up markers efficiently
      if (mapInstanceRef.current && markersRef.current.length > 0) {
        markersRef.current.forEach(marker => {
          try {
            mapInstanceRef.current.removeLayer(marker);
          } catch (e) {}
        });
      }
      markersRef.current = [];

      // Clean up map
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [clinics, filteredClinics, onClinicClick, userLocation]);

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



  // Show empty state only when there are no clinics to display and no filters applied
  if (filteredClinics.length === 0 && clinics.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ready to Find Speech Therapy Centers?
          </h3>
          <p className="text-gray-600 mb-4">
            Use the filters above to discover speech therapy resources from our database of 5,000+ verified centers across the United States.
          </p>
          <p className="text-sm text-gray-500">
            Filter by cost level, services, or region to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full z-0">
      <div 
        ref={mapContainerRef} 
        className="h-full w-full z-0"
        style={{ 
          minHeight: '400px',
          backgroundColor: '#f0f8ff'
        }}
      />
      
      {!mapReady && (
        <div className="absolute inset-0 bg-blue-50 flex items-center justify-center z-0">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-2 text-gray-700">Loading interactive map...</p>
            <p className="text-xs text-gray-500 mt-1">
              Attempt {Math.min(initAttemptRef.current + 1, maxRetries)} of {maxRetries}
            </p>
          </div>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 bg-red-50 flex items-center justify-center z-10">
          <div className="text-center p-6">
            <div className="text-red-600 mb-2 text-lg">Map Loading Failed</div>
            <p className="text-gray-700 mb-4">
              Unable to load the interactive map after {maxRetries} attempts.
            </p>
            <button 
              onClick={() => {
                setMapError(false);
                setMapReady(false);
                initAttemptRef.current = 0;
                // Trigger re-initialization
                setTimeout(() => window.location.reload(), 100);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {mapReady && !mapError && (
        <div className="absolute top-20 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10">
          <div className="text-sm font-semibold text-gray-800">Interactive Map</div>
          <div className="text-xs text-gray-600">{clinics.length} speech therapy centers</div>
          <div className="text-xs text-gray-500 mt-1">Click markers for details</div>
        </div>
      )}
    </div>
  );
}