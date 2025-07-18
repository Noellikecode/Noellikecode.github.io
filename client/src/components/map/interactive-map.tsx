import { useEffect, useRef, useState } from "react";
import { Clinic } from "@/types/clinic";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface InteractiveMapProps {
  clinics: Clinic[];
  onClinicClick: (clinic: Clinic) => void;
  isLoading?: boolean;
}

export default function InteractiveMap({ clinics, onClinicClick, isLoading }: InteractiveMapProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // Group clinics by state
  const clinicsByState = clinics.reduce((acc, clinic) => {
    const state = clinic.state || 'Unknown';
    if (!acc[state]) acc[state] = [];
    acc[state].push(clinic);
    return acc;
  }, {} as Record<string, Clinic[]>);

  const statePositions: Record<string, { top: string; left: string; count: number }> = {
    'Colorado': { top: '45%', left: '35%', count: clinicsByState['Colorado']?.length || 0 },
    'Texas': { top: '65%', left: '35%', count: clinicsByState['Texas']?.length || 0 },
    'New York': { top: '25%', left: '75%', count: clinicsByState['New York']?.length || 0 },
    'Maryland': { top: '35%', left: '75%', count: clinicsByState['Maryland']?.length || 0 },
    'California': { top: '55%', left: '15%', count: clinicsByState['California']?.length || 0 },
    'Florida': { top: '75%', left: '75%', count: clinicsByState['Florida']?.length || 0 },
    'Washington': { top: '15%', left: '20%', count: clinicsByState['Washington']?.length || 0 },
    'Illinois': { top: '35%', left: '55%', count: clinicsByState['Illinois']?.length || 0 },
    'Georgia': { top: '65%', left: '70%', count: clinicsByState['Georgia']?.length || 0 },
    'Arizona': { top: '60%', left: '25%', count: clinicsByState['Arizona']?.length || 0 },
  };

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
    <div className="relative h-full w-full bg-gradient-to-b from-blue-100 to-green-100 overflow-hidden">
      {/* US Map Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg 
          viewBox="0 0 1000 600" 
          className="w-full h-full max-w-4xl"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
        >
          {/* Simplified US outline */}
          <path
            d="M200 300 L800 300 L800 450 L200 450 Z M150 200 L850 200 L850 500 L150 500 Z"
            fill="#e5e7eb"
            stroke="#9ca3af"
            strokeWidth="2"
          />
          <path
            d="M180 180 L820 180 L820 480 L180 480 Z"
            fill="#f3f4f6"
            stroke="#6b7280"
            strokeWidth="1"
          />
          {/* Alaska and Hawaii placeholders */}
          <rect x="50" y="400" width="80" height="60" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
          <circle cx="250" cy="450" r="15" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
        </svg>
      </div>

      {/* State Markers */}
      {Object.entries(statePositions).map(([state, position]) => {
        if (position.count === 0) return null;
        
        return (
          <div
            key={state}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110 z-10 ${
              selectedState === state ? 'scale-125' : ''
            }`}
            style={{ top: position.top, left: position.left }}
            onClick={() => setSelectedState(selectedState === state ? null : state)}
          >
            <div className="relative">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <span className="text-white text-xs font-bold">{position.count}</span>
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                {state}
              </div>
            </div>
          </div>
        );
      })}

      {/* Clinic List for Selected State */}
      {selectedState && clinicsByState[selectedState] && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm max-h-96 overflow-y-auto z-20">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">{selectedState} Clinics</h3>
            <button 
              onClick={() => setSelectedState(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2">
            {clinicsByState[selectedState].map((clinic) => (
              <div
                key={clinic.id}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onClinicClick(clinic)}
              >
                <h4 className="font-medium text-sm">{clinic.name}</h4>
                <p className="text-xs text-gray-600 mt-1">{clinic.address}</p>
                <p className="text-xs text-blue-600 mt-1">{clinic.services || 'Speech therapy services'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-20">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span className="text-sm text-gray-700">Speech Therapy Centers ({clinics.length} total)</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Click markers to view clinics in each state</p>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-4 left-4 bg-white/90 rounded-lg p-3 shadow-lg z-20">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{clinics.length}</div>
          <div className="text-sm text-gray-600">Locations</div>
        </div>
        <div className="text-center mt-2">
          <div className="text-lg font-semibold text-green-600">{Object.keys(clinicsByState).length}</div>
          <div className="text-xs text-gray-600">States</div>
        </div>
      </div>
    </div>
  );
}