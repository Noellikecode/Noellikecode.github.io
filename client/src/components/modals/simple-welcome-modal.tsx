import { useState, useEffect } from "react";

interface SimpleWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  totalClinics: number;
  isMapLoading?: boolean;
}

export default function SimpleWelcomeModal({ isOpen, onClose, onApplyFilters, totalClinics, isMapLoading = false }: SimpleWelcomeModalProps) {
  const [filters, setFilters] = useState({
    costLevel: "all",
    services: "all",
    teletherapy: false,
    state: "all",
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const allStates = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
    "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas",
    "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
    "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
    "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas",
    "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
  ];

  const hasActiveFilters = filters.costLevel !== "all" || 
                          filters.services !== "all" || 
                          filters.teletherapy || 
                          filters.state !== "all";

  if (!isOpen) return null;

  if (isMapLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[5000]">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Loading</h3>
            <p className="text-gray-600">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[5000] p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Welcome to Speech Access App</h2>
            <p className="text-gray-600">{totalClinics}+ verified centers across North America</p>
          </div>

          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Find Centers</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <select 
                    value={filters.state} 
                    onChange={(e) => handleFilterChange("state", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All States</option>
                    {allStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cost Level</label>
                  <select 
                    value={filters.costLevel} 
                    onChange={(e) => handleFilterChange("costLevel", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Cost Levels</option>
                    <option value="low-cost">Low Cost</option>
                    <option value="market-rate">Market Rate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Services</label>
                  <select 
                    value={filters.services} 
                    onChange={(e) => handleFilterChange("services", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Services</option>
                    <option value="speech-therapy">Speech Therapy</option>
                    <option value="language-therapy">Language Therapy</option>
                    <option value="voice-therapy">Voice Therapy</option>
                    <option value="stuttering">Stuttering</option>
                    <option value="apraxia">Apraxia</option>
                    <option value="feeding-therapy">Feeding Therapy</option>
                    <option value="social-skills">Social Skills</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="teletherapy" 
                    checked={filters.teletherapy}
                    onChange={(e) => handleFilterChange("teletherapy", e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="teletherapy" className="text-sm font-medium">
                    Teletherapy Available
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-600">
                {hasActiveFilters ? "Filters will be applied" : `Showing all ${totalClinics}+ centers`}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Skip
                </button>
                <button 
                  onClick={handleApplyFilters}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {hasActiveFilters ? "Apply Filters" : "Explore Map"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}