import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Filter, Globe } from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  totalClinics: number;
  isMapLoading?: boolean;
}

export default function WelcomeModal({ isOpen, onClose, onApplyFilters, totalClinics, isMapLoading = false }: WelcomeModalProps) {
  const [filters, setFilters] = useState({
    costLevel: "all",
    services: "all",
    teletherapy: false,
    state: "all",
  });
  
  const [showLoadingDelay, setShowLoadingDelay] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // No delay - show content immediately
  useEffect(() => {
    if (!isMapLoading) {
      // Show content immediately without delay
      setTimeout(() => setShowLoadingDelay(false), 100);
    } else {
      setShowLoadingDelay(true);
      setLoadingProgress(0);
    }
  }, [isMapLoading]);

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

  // Ultra-lightweight loading - no animations at all
  const LoadingContent = () => (
    <div className="flex flex-col items-center justify-center py-8 space-y-3">
      {/* Static circle - no spinner */}
      <div className="w-8 h-8 border-2 border-blue-600 rounded-full"></div>
      
      {/* Simple text only */}
      <div className="text-center">
        <h3 className="text-base font-medium text-gray-800">Loading Map</h3>
        <p className="text-gray-600 text-sm">Preparing speech therapy centers...</p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl" aria-describedby="welcome-description">
        {isMapLoading ? (
          <LoadingContent />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-medium">
                Welcome to Speech Access App
              </DialogTitle>
              <DialogDescription id="welcome-description" className="text-sm text-gray-600">
                {totalClinics}+ verified centers across North America
              </DialogDescription>
            </DialogHeader>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-base mb-3">Find Centers</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium">State
                  </label>
                  <Select value={filters.state} onValueChange={(value) => handleFilterChange("state", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All states" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="all">All States</SelectItem>
                      {allStates.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Cost Level</label>
                  <Select value={filters.costLevel} onValueChange={(value) => handleFilterChange("costLevel", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All cost levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cost Levels</SelectItem>
                      <SelectItem value="low-cost">Low Cost</SelectItem>
                      <SelectItem value="market-rate">Market Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Services</label>
                  <Select value={filters.services} onValueChange={(value) => handleFilterChange("services", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All services" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      <SelectItem value="speech-therapy">Speech Therapy</SelectItem>
                      <SelectItem value="language-therapy">Language Therapy</SelectItem>
                      <SelectItem value="voice-therapy">Voice Therapy</SelectItem>
                      <SelectItem value="stuttering">Stuttering</SelectItem>
                      <SelectItem value="apraxia">Apraxia</SelectItem>
                      <SelectItem value="feeding-therapy">Feeding Therapy</SelectItem>
                      <SelectItem value="social-skills">Social Skills</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox 
                    id="welcome-teletherapy" 
                    checked={filters.teletherapy}
                    onCheckedChange={(checked) => handleFilterChange("teletherapy", checked)}
                  />
                  <label htmlFor="welcome-teletherapy" className="text-sm font-medium">
                    Teletherapy Available
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {hasActiveFilters ? (
                <span className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  Filters will be applied
                </span>
              ) : (
                <span>Showing all {totalClinics}+ centers</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Skip
              </Button>
              <Button onClick={handleApplyFilters}>
                <Filter className="h-4 w-4 mr-2" />
                {hasActiveFilters ? "Apply Filters" : "View Map"}
              </Button>
            </div>
          </div>
        </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}