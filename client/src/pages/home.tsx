import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Globe, MapPin, Users } from "lucide-react";
import MinimalMap from "@/components/map/minimal-map";
import ClinicModal from "@/components/modals/clinic-modal";
import SimpleWelcomeModal from "@/components/modals/simple-welcome-modal";
import MLInsightsDashboard from "@/components/ml/ml-insights-dashboard";
import { Clinic } from "@/types/clinic";
import { apiRequest } from "@/lib/queryClient";


export default function Home() {

  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(true);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);
  const [isMlInsightsVisible, setIsMlInsightsVisible] = useState(false);
  const [filters, setFilters] = useState({
    costLevel: "all",
    services: "all",
    state: "all",
  });

  const { data: clinics = [], isLoading } = useQuery({
    queryKey: ["/api/clinics"],
    queryFn: async () => {
      const res = await fetch("/api/clinics");
      if (!res.ok) throw new Error("Failed to fetch clinics");
      return res.json();
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  // Record view on page load
  useEffect(() => {
    apiRequest("POST", "/api/analytics/view").catch(console.error);
  }, []);

  const handleApplyFilters = useCallback((newFilters: any) => {
    setFilters(newFilters);
    setHasAppliedFilters(true);
  }, []);





  // State coordinate boundaries for accurate filtering and zooming
  const getStateBounds = (state: string) => {
    const stateBounds: Record<string, {lat: [number, number], lng: [number, number], center: [number, number], zoom: number}> = {
      'california': { lat: [32.5, 42.0], lng: [-125.0, -114.0], center: [36.7783, -119.4179], zoom: 6 },
      'texas': { lat: [25.8, 36.5], lng: [-106.7, -93.5], center: [31.9686, -99.9018], zoom: 6 },
      'georgia': { lat: [30.3, 35.0], lng: [-85.6, -80.9], center: [33.2490, -83.4410], zoom: 7 },
      'pennsylvania': { lat: [39.7, 42.3], lng: [-80.5, -74.7], center: [40.2732, -77.1017], zoom: 7 },
      'north-carolina': { lat: [33.8, 36.6], lng: [-84.3, -75.4], center: [35.7596, -79.0193], zoom: 7 },
      'ohio': { lat: [38.4, 41.98], lng: [-84.8, -80.5], center: [40.4173, -82.9071], zoom: 7 },
      'new-york': { lat: [40.5, 45.0], lng: [-79.8, -71.8], center: [42.1657, -74.9481], zoom: 7 },
      'illinois': { lat: [37.0, 42.5], lng: [-91.5, -87.0], center: [40.3363, -89.0022], zoom: 7 },
      'alaska': { lat: [54.0, 71.5], lng: [-180.0, -130.0], center: [61.2181, -149.9003], zoom: 4 },
      'florida': { lat: [24.4, 31.0], lng: [-87.6, -80.0], center: [27.7663, -81.6868], zoom: 7 },
      'michigan': { lat: [41.7, 48.3], lng: [-90.4, -82.4], center: [44.3467, -85.4102], zoom: 6 },
      'hawaii': { lat: [18.9, 22.2], lng: [-160.3, -154.8], center: [21.0943, -157.4983], zoom: 7 }
    };
    return stateBounds[state] || null;
  };



  // Optimized state-based filtering with performance improvements
  const filteredClinics = useMemo(() => {
    if (!clinics || clinics.length === 0) return [];
    
    // Check if filters are active
    const hasStateFilter = filters.state !== "all";
    const hasCostFilter = filters.costLevel !== "all";
    const hasServicesFilter = filters.services !== "all";
    
    if (!hasStateFilter && !hasCostFilter && !hasServicesFilter) {
      return clinics;
    }
    
    // Pre-compute filter values for better performance
    const filterState = hasStateFilter ? filters.state.toUpperCase().trim() : null;
    
    const filtered = clinics.filter((clinic: any) => {
      // State filtering (most selective first)
      if (hasStateFilter) {
        const clinicState = clinic.state?.toUpperCase()?.trim();
        if (clinicState !== filterState) return false;
      }
      
      // Cost level filtering
      if (hasCostFilter && clinic.costLevel !== filters.costLevel) return false;
      
      // Services filtering
      if (hasServicesFilter && !clinic.services?.includes(filters.services)) return false;
      
      return true;
    });
    
    return filtered;
  }, [clinics, filters.state, filters.costLevel, filters.services]);

  // Debounced filter change handler for smoother performance
  const [pendingFilters, setPendingFilters] = useState(filters);
  
  const debouncedFilterUpdate = useMemo(
    () => debounce((newFilters: any) => {
      setFilters(newFilters);
      setHasAppliedFilters(true);
      
      // Force refresh of ML insights when state changes
      if (newFilters.state !== filters.state) {
        import('@/lib/queryClient').then(({ queryClient }) => {
          queryClient.invalidateQueries({ 
            queryKey: ["/api/ml/insights"]
          });
        });
      }
    }, 150),
    [filters.state]
  );

  const handleFilterChange = useCallback((key: string, value: any) => {
    const newFilters = { ...pendingFilters, [key]: value };
    setPendingFilters(newFilters);
    debouncedFilterUpdate(newFilters);
  }, [pendingFilters, debouncedFilterUpdate]);

  // Simple debounce function
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }



  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b flex-shrink-0 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Globe className="text-white h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">North American Speech Access App</h1>
                <p className="text-sm text-gray-500">Speech therapy resources across North America</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {clinics.length > 0 && `${clinics.length} Centers`}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Map Controls */}
      <div className="bg-white border-b px-4 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter by Cost:</label>
              <Select value={pendingFilters.costLevel} onValueChange={(value) => handleFilterChange("costLevel", value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="low-cost">Low Cost</SelectItem>
                  <SelectItem value="market-rate">Market Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Services:</label>
              <Select value={pendingFilters.services} onValueChange={(value) => handleFilterChange("services", value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="speech-therapy">Speech Therapy</SelectItem>
                  <SelectItem value="language-therapy">Language Therapy</SelectItem>
                  <SelectItem value="stuttering">Stuttering</SelectItem>
                  <SelectItem value="apraxia">Apraxia</SelectItem>
                  <SelectItem value="voice-therapy">Voice Therapy</SelectItem>
                  <SelectItem value="feeding-therapy">Feeding Therapy</SelectItem>
                  <SelectItem value="social-skills">Social Skills</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">State:</label>
              <Select value={pendingFilters.state} onValueChange={(value) => handleFilterChange("state", value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="Alabama">Alabama</SelectItem>
                  <SelectItem value="Alaska">Alaska</SelectItem>
                  <SelectItem value="Arizona">Arizona</SelectItem>
                  <SelectItem value="Arkansas">Arkansas</SelectItem>
                  <SelectItem value="California">California</SelectItem>
                  <SelectItem value="Colorado">Colorado</SelectItem>
                  <SelectItem value="Connecticut">Connecticut</SelectItem>
                  <SelectItem value="Delaware">Delaware</SelectItem>
                  <SelectItem value="Florida">Florida</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Hawaii">Hawaii</SelectItem>
                  <SelectItem value="Idaho">Idaho</SelectItem>
                  <SelectItem value="Illinois">Illinois</SelectItem>
                  <SelectItem value="Indiana">Indiana</SelectItem>
                  <SelectItem value="Iowa">Iowa</SelectItem>
                  <SelectItem value="Kansas">Kansas</SelectItem>
                  <SelectItem value="Kentucky">Kentucky</SelectItem>
                  <SelectItem value="Louisiana">Louisiana</SelectItem>
                  <SelectItem value="Maine">Maine</SelectItem>
                  <SelectItem value="Maryland">Maryland</SelectItem>
                  <SelectItem value="Massachusetts">Massachusetts</SelectItem>
                  <SelectItem value="Michigan">Michigan</SelectItem>
                  <SelectItem value="Minnesota">Minnesota</SelectItem>
                  <SelectItem value="Mississippi">Mississippi</SelectItem>
                  <SelectItem value="Missouri">Missouri</SelectItem>
                  <SelectItem value="Montana">Montana</SelectItem>
                  <SelectItem value="Nebraska">Nebraska</SelectItem>
                  <SelectItem value="Nevada">Nevada</SelectItem>
                  <SelectItem value="New Hampshire">New Hampshire</SelectItem>
                  <SelectItem value="New Jersey">New Jersey</SelectItem>
                  <SelectItem value="New Mexico">New Mexico</SelectItem>
                  <SelectItem value="New York">New York</SelectItem>
                  <SelectItem value="North Carolina">North Carolina</SelectItem>
                  <SelectItem value="North Dakota">North Dakota</SelectItem>
                  <SelectItem value="Ohio">Ohio</SelectItem>
                  <SelectItem value="Oklahoma">Oklahoma</SelectItem>
                  <SelectItem value="Oregon">Oregon</SelectItem>
                  <SelectItem value="Pennsylvania">Pennsylvania</SelectItem>
                  <SelectItem value="Rhode Island">Rhode Island</SelectItem>
                  <SelectItem value="South Carolina">South Carolina</SelectItem>
                  <SelectItem value="South Dakota">South Dakota</SelectItem>
                  <SelectItem value="Tennessee">Tennessee</SelectItem>
                  <SelectItem value="Texas">Texas</SelectItem>
                  <SelectItem value="Utah">Utah</SelectItem>
                  <SelectItem value="Vermont">Vermont</SelectItem>
                  <SelectItem value="Virginia">Virginia</SelectItem>
                  <SelectItem value="Washington">Washington</SelectItem>
                  <SelectItem value="West Virginia">West Virginia</SelectItem>
                  <SelectItem value="Wisconsin">Wisconsin</SelectItem>
                  <SelectItem value="Wyoming">Wyoming</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <MapPin className="text-primary mr-1 h-4 w-4" />
              {filteredClinics.length === clinics.length 
                ? `${filteredClinics.length} Total Centers` 
                : `${filteredClinics.length} of ${clinics.length} Centers`}
            </span>
            {hasAppliedFilters && filteredClinics.length < clinics.length && (
              <span className="text-blue-600 text-xs bg-blue-50 px-2 py-1 rounded">
                Filters Applied
              </span>
            )}
            <span className="flex items-center">
              <Users className="text-green-500 mr-1 h-4 w-4" />
              {analytics?.totalViews || 0} Views
            </span>
          </div>
        </div>
      </div>

      {/* Map Container - Takes remaining full height */}
      <div className="flex-1 min-h-0">
        <MinimalMap 
          clinics={clinics}
          filteredClinics={filteredClinics} 
          onClinicClick={setSelectedClinic}
          isLoading={isLoading}
        />
      </div>

      {/* Modals */}
      <SimpleWelcomeModal 
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        totalClinics={clinics.length}
        isMapLoading={isLoading}
      />
      
      <ClinicModal 
        clinic={selectedClinic}
        isOpen={!!selectedClinic}
        onClose={() => setSelectedClinic(null)}
      />

      {/* ML Insights Dashboard - Only show after map loads and welcome modal is closed */}
      {!isLoading && !isWelcomeModalOpen && (
        <MLInsightsDashboard
          filteredClinics={filteredClinics}
          filters={filters}
          isVisible={true}
          onToggle={() => setIsMlInsightsVisible(!isMlInsightsVisible)}
        />
      )}


    </div>
  );
}
