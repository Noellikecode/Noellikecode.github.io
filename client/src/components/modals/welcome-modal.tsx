import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Filter, Search, Globe, Navigation, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  onLocationSearch: (zipcode: string, location: { lat: number; lon: number }) => void;
  totalClinics: number;
}

export default function WelcomeModal({ isOpen, onClose, onApplyFilters, onLocationSearch, totalClinics }: WelcomeModalProps) {
  const [filters, setFilters] = useState({
    costLevel: "all",
    services: "all",
    teletherapy: false,
    country: "all",
    state: "all",
  });
  
  const [zipcode, setZipcode] = useState("");
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [searchMode, setSearchMode] = useState<"location" | "filter">("location");

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleLocationSearch = async () => {
    if (!zipcode.trim() || zipcode.length !== 5) {
      setLocationError("Please enter a valid 5-digit zipcode");
      return;
    }

    setIsSearchingLocation(true);
    setLocationError("");

    try {
      // Use a free geocoding service to convert zipcode to coordinates
      const response = await fetch(`https://api.zippopotam.us/us/${zipcode}`);
      
      if (!response.ok) {
        throw new Error("Zipcode not found");
      }
      
      const data = await response.json();
      const location = {
        lat: parseFloat(data.places[0].latitude),
        lon: parseFloat(data.places[0].longitude)
      };
      
      onLocationSearch(zipcode, location);
      onClose();
    } catch (error) {
      setLocationError("Unable to find this zipcode. Please check and try again.");
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const hasActiveFilters = filters.costLevel !== "all" || 
                          filters.services !== "all" || 
                          filters.teletherapy || 
                          filters.country !== "all" ||
                          filters.state !== "all";

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
          {/* Search Mode Toggle */}
          <div className="flex gap-2 bg-muted/30 p-1 rounded-lg">
            <Button
              variant={searchMode === "location" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSearchMode("location")}
              className="flex-1"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Find Near Me
            </Button>
            <Button
              variant={searchMode === "filter" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSearchMode("filter")}
              className="flex-1"
            >
              <Filter className="h-4 w-4 mr-2" />
              Browse All
            </Button>
          </div>

          {searchMode === "location" ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5" />
                  Find Centers Near You
                </CardTitle>
                <CardDescription>
                  Enter your zipcode to see ALL speech therapy centers in that immediate area
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Zipcode</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter 5-digit zipcode (e.g., 90210)"
                        value={zipcode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                          setZipcode(value);
                          setLocationError("");
                        }}
                        maxLength={5}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleLocationSearch}
                        disabled={isSearchingLocation || zipcode.length !== 5}
                        className="px-6"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        {isSearchingLocation ? "Searching..." : "Find"}
                      </Button>
                    </div>
                  </div>
                  
                  {locationError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{locationError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <p className="font-medium mb-1">What happens next:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• We'll show ALL speech therapy centers within 3 miles of your zipcode</li>
                      <li>• The map will zoom directly to your zipcode area</li>
                      <li>• You can still use filters to refine your search</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
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
                    <label className="text-sm font-medium flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      State/Region
                    </label>
                    <Select value={filters.state} onValueChange={(value) => handleFilterChange("state", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All states" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        <SelectItem value="california">California</SelectItem>
                        <SelectItem value="texas">Texas</SelectItem>
                        <SelectItem value="florida">Florida</SelectItem>
                        <SelectItem value="new-york">New York</SelectItem>
                        <SelectItem value="pennsylvania">Pennsylvania</SelectItem>
                        <SelectItem value="illinois">Illinois</SelectItem>
                        <SelectItem value="ohio">Ohio</SelectItem>
                        <SelectItem value="georgia">Georgia</SelectItem>
                        <SelectItem value="north-carolina">North Carolina</SelectItem>
                        <SelectItem value="michigan">Michigan</SelectItem>
                        <SelectItem value="washington">Washington</SelectItem>
                        <SelectItem value="arizona">Arizona</SelectItem>
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
                        <SelectItem value="free">Free</SelectItem>
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
          )}
          
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {searchMode === "location" ? (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Search by zipcode for local results
                </span>
              ) : hasActiveFilters ? (
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
              {searchMode === "filter" && (
                <Button onClick={handleApplyFilters}>
                  <Search className="h-4 w-4 mr-2" />
                  {hasActiveFilters ? "Apply Filters" : "View Map"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}