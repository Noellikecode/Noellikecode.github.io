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
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  useEffect(() => {
    // Set map ready immediately since we're using a pure HTML/CSS approach
    setMapReady(true);
  }, []);

  // Group clinics by state/region for better organization
  const clinicsByState = clinics.reduce((acc, clinic) => {
    const state = clinic.city || clinic.country || 'Unknown';
    if (!acc[state]) acc[state] = [];
    acc[state].push(clinic);
    return acc;
  }, {} as Record<string, Clinic[]>);

  const states = Object.keys(clinicsByState).sort();

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
    <div className="relative h-full w-full overflow-hidden">
      {/* Map Background */}
      <div 
        ref={mapContainerRef}
        className="h-full w-full bg-gradient-to-br from-blue-200 via-green-100 to-green-200"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 200, 255, 0.3) 0%, transparent 50%)
          `
        }}
      >
        {/* Title Header */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg z-10 max-w-sm">
          <div className="text-lg font-bold text-gray-800">🗺️ Speech Therapy Centers</div>
          <div className="text-sm text-gray-600">{clinics.length} locations across {states.length} states</div>
          <div className="text-xs text-gray-500 mt-1">Select a state below to view centers</div>
        </div>

        {/* States Grid */}
        <div className="absolute top-20 left-4 right-4 bottom-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {states.map(state => (
              <div
                key={state}
                className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-200"
                onClick={() => setSelectedClinic(null)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm">{state}</h3>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                    {clinicsByState[state].length}
                  </span>
                </div>
                
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {clinicsByState[state].map(clinic => (
                    <div
                      key={clinic.id}
                      className={`p-2 rounded border transition-all cursor-pointer text-xs ${
                        selectedClinic?.id === clinic.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClinic(clinic);
                        onClinicClick(clinic);
                      }}
                    >
                      <div className="font-medium text-gray-800 line-clamp-1">{clinic.name}</div>
                      <div className="text-gray-600 line-clamp-1">{clinic.city}, {clinic.country}</div>
                      {clinic.phone && (
                        <div className="text-blue-600 mt-1">{clinic.phone}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Clinic Detail Panel */}
        {selectedClinic && (
          <div className="absolute top-4 right-4 bg-white rounded-lg p-4 shadow-xl z-20 max-w-md border border-gray-300">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-gray-800 text-lg">{selectedClinic.name}</h3>
              <button
                onClick={() => setSelectedClinic(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">📍 Location:</span>
                <p className="text-gray-600 mt-1">{selectedClinic.city}, {selectedClinic.country}</p>
              </div>
              
              {selectedClinic.phone && (
                <div>
                  <span className="font-medium text-gray-700">📞 Phone:</span>
                  <p className="text-blue-600 mt-1">{selectedClinic.phone}</p>
                </div>
              )}
              
              <div>
                <span className="font-medium text-gray-700">🏥 Services:</span>
                <p className="text-gray-600 mt-1">
                  {Array.isArray(selectedClinic.services) && selectedClinic.services.length > 0
                    ? selectedClinic.services.join(', ')
                    : 'Speech therapy services'}
                </p>
              </div>
              
              {selectedClinic.latitude && selectedClinic.longitude && (
                <div>
                  <span className="font-medium text-gray-700">🌍 Coordinates:</span>
                  <p className="text-gray-600 mt-1 font-mono text-xs">
                    {selectedClinic.latitude.toFixed(4)}, {selectedClinic.longitude.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Stats */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-xs text-gray-600">
            Real data from National Provider Identifier (NPI) database
          </div>
          <div className="text-xs text-gray-500">
            Updated with verified speech therapy centers
          </div>
        </div>
      </div>
    </div>
  );
}