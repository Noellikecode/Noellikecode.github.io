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
    <div className="h-screen w-screen bg-gray-900 relative overflow-hidden">
      {/* Floating Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Globe className="text-white h-4 w-4" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Global Speech Access Map</h1>
              <p className="text-xs text-gray-600">{analytics?.totalLocations || 0} Locations • {analytics?.totalViews || 0} Views</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsSubmissionModalOpen(true)} className="bg-primary hover:bg-primary/90 shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Button>
          <Button variant="outline" size="icon" onClick={() => setLocation("/admin")} className="bg-white/90 backdrop-blur-sm shadow-lg">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Floating Filter Controls */}
      <div className="absolute top-20 left-4 z-20 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg max-w-md">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={filters.costLevel} onValueChange={(value) => handleFilterChange("costLevel", value)}>
            <SelectTrigger className="w-28 h-8">
              <SelectValue placeholder="Cost" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Costs</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="low-cost">Low Cost</SelectItem>
              <SelectItem value="market-rate">Market Rate</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.services} onValueChange={(value) => handleFilterChange("services", value)}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue placeholder="Services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="stuttering">Stuttering</SelectItem>
              <SelectItem value="apraxia">Apraxia</SelectItem>
              <SelectItem value="voice">Voice Therapy</SelectItem>
              <SelectItem value="language">Language Therapy</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="teletherapy" 
              checked={filters.teletherapy}
              onCheckedChange={(checked) => handleFilterChange("teletherapy", checked)}
            />
            <label htmlFor="teletherapy" className="text-xs text-gray-700">Teletherapy</label>
          </div>
        </div>
      </div>

      {/* Full Screen Map */}
      <div className="absolute inset-0 z-10">
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
    </div>
  );
}
