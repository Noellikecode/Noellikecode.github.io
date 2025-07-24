import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Globe, Plus, MapPin, Users } from "lucide-react";
import InteractiveMap from "@/components/map/interactive-map";
import ClinicModal from "@/components/modals/clinic-modal";
import SubmissionModal from "@/components/modals/submission-modal";
import WelcomeModal from "@/components/modals/welcome-modal";
import MLInsightsDashboard from "@/components/ml/ml-insights-dashboard";
import { Clinic } from "@/types/clinic";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
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



  // State-based filtering - always return filtered results, never empty
  const filteredClinics = useMemo(() => {
    if (!clinics || clinics.length === 0) return [];
    
    // Apply filters - if no filters are active, return all clinics
    const hasFilters = filters.costLevel !== "all" || 
                      filters.services !== "all" || 
                      filters.state !== "all";
    
    if (!hasFilters) {
      return clinics;
    }
    
    const filtered = clinics.filter((clinic: any) => {
      // Cost level filtering
      if (filters.costLevel !== "all" && clinic.costLevel !== filters.costLevel) return false;
      
      // Services filtering
      if (filters.services !== "all" && 
          !clinic.services?.includes(filters.services)) return false;
      
      // State filtering - handle both state codes and full names
      if (filters.state !== "all") {
        const clinicState = clinic.state?.toUpperCase();
        const filterState = filters.state?.toUpperCase();
        if (clinicState !== filterState) return false;
      }
      
      return true;
    });
    
    console.log(`Filtered ${clinics.length} clinics to ${filtered.length} results`);
    return filtered;
  }, [clinics, filters]);

  // Optimized filter change handler
  const handleFilterChange = useCallback((key: string, value: any) => {
    console.log(`Filter changed: ${key} = ${value}`);
    setFilters(prev => ({ ...prev, [key]: value }));
    setHasAppliedFilters(true);
  }, []);



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
              <Button onClick={() => setIsSubmissionModalOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Location
              </Button>

            </div>
          </div>
        </div>
      </header>

      {/* Map Controls */}
      <div className="bg-white border-b px-4 py-3 flex-shrink-0 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter by Cost:</label>
              <Select value={filters.costLevel} onValueChange={(value) => handleFilterChange("costLevel", value)}>
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
              <Select value={filters.services} onValueChange={(value) => handleFilterChange("services", value)}>
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
              <Select value={filters.state} onValueChange={(value) => handleFilterChange("state", value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="AL">Alabama</SelectItem>
                  <SelectItem value="AK">Alaska</SelectItem>
                  <SelectItem value="AZ">Arizona</SelectItem>
                  <SelectItem value="AR">Arkansas</SelectItem>
                  <SelectItem value="CA">California</SelectItem>
                  <SelectItem value="CO">Colorado</SelectItem>
                  <SelectItem value="CT">Connecticut</SelectItem>
                  <SelectItem value="DE">Delaware</SelectItem>
                  <SelectItem value="FL">Florida</SelectItem>
                  <SelectItem value="GA">Georgia</SelectItem>
                  <SelectItem value="HI">Hawaii</SelectItem>
                  <SelectItem value="ID">Idaho</SelectItem>
                  <SelectItem value="IL">Illinois</SelectItem>
                  <SelectItem value="IN">Indiana</SelectItem>
                  <SelectItem value="IA">Iowa</SelectItem>
                  <SelectItem value="KS">Kansas</SelectItem>
                  <SelectItem value="KY">Kentucky</SelectItem>
                  <SelectItem value="LA">Louisiana</SelectItem>
                  <SelectItem value="ME">Maine</SelectItem>
                  <SelectItem value="MD">Maryland</SelectItem>
                  <SelectItem value="MA">Massachusetts</SelectItem>
                  <SelectItem value="MI">Michigan</SelectItem>
                  <SelectItem value="MN">Minnesota</SelectItem>
                  <SelectItem value="MS">Mississippi</SelectItem>
                  <SelectItem value="MO">Missouri</SelectItem>
                  <SelectItem value="MT">Montana</SelectItem>
                  <SelectItem value="NE">Nebraska</SelectItem>
                  <SelectItem value="NV">Nevada</SelectItem>
                  <SelectItem value="NH">New Hampshire</SelectItem>
                  <SelectItem value="NJ">New Jersey</SelectItem>
                  <SelectItem value="NM">New Mexico</SelectItem>
                  <SelectItem value="NY">New York</SelectItem>
                  <SelectItem value="NC">North Carolina</SelectItem>
                  <SelectItem value="ND">North Dakota</SelectItem>
                  <SelectItem value="OH">Ohio</SelectItem>
                  <SelectItem value="OK">Oklahoma</SelectItem>
                  <SelectItem value="OR">Oregon</SelectItem>
                  <SelectItem value="PA">Pennsylvania</SelectItem>
                  <SelectItem value="RI">Rhode Island</SelectItem>
                  <SelectItem value="SC">South Carolina</SelectItem>
                  <SelectItem value="SD">South Dakota</SelectItem>
                  <SelectItem value="TN">Tennessee</SelectItem>
                  <SelectItem value="TX">Texas</SelectItem>
                  <SelectItem value="UT">Utah</SelectItem>
                  <SelectItem value="VT">Vermont</SelectItem>
                  <SelectItem value="VA">Virginia</SelectItem>
                  <SelectItem value="WA">Washington</SelectItem>
                  <SelectItem value="WV">West Virginia</SelectItem>
                  <SelectItem value="WI">Wisconsin</SelectItem>
                  <SelectItem value="WY">Wyoming</SelectItem>
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
        <InteractiveMap 
          clinics={clinics}
          filteredClinics={filteredClinics} 
          onClinicClick={setSelectedClinic}
          isLoading={isLoading}
          selectedState={filters.state}
          getStateBounds={getStateBounds}
        />
      </div>

      {/* Modals */}
      <WelcomeModal 
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        totalClinics={clinics.length}
      />
      
      <ClinicModal 
        clinic={selectedClinic} 
        isOpen={!!selectedClinic}
        onClose={() => setSelectedClinic(null)}
      />
      
      <SubmissionModal 
        isOpen={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
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

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-30">
        <div className="flex justify-around py-2">
          <button className="flex flex-col items-center py-2 px-4 text-primary">
            <MapPin className="h-5 w-5" />
            <span className="text-xs mt-1">Map</span>
          </button>
          <button 
            className="flex flex-col items-center py-2 px-4 text-gray-600"
            onClick={() => setIsSubmissionModalOpen(true)}
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs mt-1">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
