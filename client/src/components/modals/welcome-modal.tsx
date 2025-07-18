import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Filter, Search, Globe } from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  totalClinics: number;
}

export default function WelcomeModal({ isOpen, onClose, onApplyFilters, totalClinics }: WelcomeModalProps) {
  const [filters, setFilters] = useState({
    costLevel: "all",
    services: "all",
    teletherapy: false,
    country: "all",
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const hasActiveFilters = filters.costLevel !== "all" || 
                          filters.services !== "all" || 
                          filters.teletherapy || 
                          filters.country !== "all";

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Globe className="h-6 w-6 text-primary" />
            Welcome to Global Speech Access Map
          </DialogTitle>
          <DialogDescription className="text-base">
            Discover speech therapy resources from our database of <strong>{totalClinics}+ verified centers</strong> across the United States.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
                Filter Your Search
              </CardTitle>
              <CardDescription>
                Choose your preferences to find the most relevant speech therapy centers for your needs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cost Level</label>
                  <Select value={filters.costLevel} onValueChange={(value) => handleFilterChange("costLevel", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All cost levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cost Levels</SelectItem>
                      <SelectItem value="free">Free Services</SelectItem>
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
                      <SelectItem value="stuttering">Stuttering</SelectItem>
                      <SelectItem value="apraxia">Apraxia</SelectItem>
                      <SelectItem value="voice-therapy">Voice Therapy</SelectItem>
                      <SelectItem value="feeding-therapy">Feeding Therapy</SelectItem>
                      <SelectItem value="social-skills">Social Skills</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Region</label>
                  <Select value={filters.country} onValueChange={(value) => handleFilterChange("country", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
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
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleApplyFilters}
              className="flex-1 flex items-center gap-2"
              size="lg"
            >
              <Search className="h-4 w-4" />
              {hasActiveFilters ? "Show Filtered Results" : "Browse All Centers"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                onApplyFilters({ costLevel: "all", services: "all", teletherapy: false, country: "all" });
                onClose();
              }}
              className="flex items-center gap-2"
              size="lg"
            >
              <MapPin className="h-4 w-4" />
              Skip & Browse All
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}