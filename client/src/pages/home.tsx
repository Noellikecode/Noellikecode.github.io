import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Globe, Plus, Settings, MapPin, Users } from "lucide-react";
import InteractiveMap from "@/components/map/interactive-map";
import ClinicModal from "@/components/modals/clinic-modal";
import SubmissionModal from "@/components/modals/submission-modal";
import { Clinic } from "@/types/clinic";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    costLevel: "all",
    services: "all",
    teletherapy: false,
    country: "all",
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

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredClinics = clinics.filter((clinic: Clinic) => {
    if (filters.costLevel !== "all" && clinic.costLevel !== filters.costLevel) return false;
    if (filters.services !== "all" && !clinic.services.includes(filters.services)) return false;
    if (filters.teletherapy && !clinic.teletherapy) return false;
    if (filters.country !== "all" && clinic.country !== filters.country) return false;
    return true;
  });

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
                <h1 className="text-xl font-semibold text-gray-900">Global Speech Access Map</h1>
                <p className="text-sm text-gray-500">Crowdsourced speech therapy resources worldwide</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setIsSubmissionModalOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Location
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setLocation("/admin")}>
                <Settings className="h-5 w-5" />
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
                  <SelectItem value="free">Free</SelectItem>
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
                  <SelectItem value="stuttering">Stuttering</SelectItem>
                  <SelectItem value="apraxia">Apraxia</SelectItem>
                  <SelectItem value="voice">Voice Therapy</SelectItem>
                  <SelectItem value="language">Language Therapy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="teletherapy" 
                checked={filters.teletherapy}
                onCheckedChange={(checked) => handleFilterChange("teletherapy", checked)}
              />
              <label htmlFor="teletherapy" className="text-sm text-gray-700">Teletherapy Available</label>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <MapPin className="text-primary mr-1 h-4 w-4" />
              {analytics?.totalLocations || 0} Locations
            </span>
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
          clinics={filteredClinics} 
          onClinicClick={setSelectedClinic}
          isLoading={isLoading}
        />
      </div>

      {/* Modals */}
      <ClinicModal 
        clinic={selectedClinic} 
        isOpen={!!selectedClinic}
        onClose={() => setSelectedClinic(null)}
      />
      
      <SubmissionModal 
        isOpen={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
      />

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
