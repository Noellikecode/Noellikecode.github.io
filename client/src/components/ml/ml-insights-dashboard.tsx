import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  MapPin, 
  Users, 
  Zap,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { Clinic } from "@/types/clinic";

interface MLInsightsDashboardProps {
  filteredClinics: Clinic[];
  filters: any;
  isVisible: boolean;
  onToggle: () => void;
}

export default function MLInsightsDashboard({ 
  filteredClinics, 
  filters, 
  isVisible, 
  onToggle 
}: MLInsightsDashboardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const { data: mlInsights, isLoading: mlLoading } = useQuery({
    queryKey: ["/api/ml/insights", filters],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (!isVisible) return null;

  const hasData = (mlInsights as any)?.success;
  const insights = hasData ? (mlInsights as any).data : null;

  return (
    <div className="fixed bottom-4 right-4 w-96 z-50">
      {/* Toggle Button */}
      <div className="flex justify-end mb-2">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          size="sm"
          className="bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white/95 border"
        >
          <Brain className="h-4 w-4 mr-2 text-purple-600" />
          AI Insights
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 ml-2" />
          ) : (
            <ChevronUp className="h-4 w-4 ml-2" />
          )}
        </Button>
      </div>

      {/* Dashboard Panel */}
      {isExpanded && (
        <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-2 border-purple-100">
          <CardContent className="p-4">
            {mlLoading ? (
              <div className="flex items-center justify-center h-24">
                <div className="flex items-center space-x-2 text-purple-600">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                  <span className="text-sm font-medium">Analyzing data...</span>
                </div>
              </div>
            ) : hasData ? (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-gray-900">Live AI Analysis</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {filteredClinics.length} centers
                  </Badge>
                </div>

                {/* Coverage Score - Large Display */}
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                    {insights.coverage.totalCoverage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Coverage Score</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Analyzing {filteredClinics.length} locations
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-xs font-medium text-red-800">Underserved</span>
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      {insights.coverage.underservedAreas.length}
                    </div>
                    <div className="text-xs text-red-600">areas identified</div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-medium text-blue-800">Opportunities</span>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {insights.coverage.optimalNewLocations.length}
                    </div>
                    <div className="text-xs text-blue-600">growth zones</div>
                  </div>
                </div>

                {/* Priority Alert */}
                {insights.coverage.underservedAreas.length > 0 && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-lg border border-orange-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-orange-600" />
                      <span className="text-xs font-semibold text-orange-800">Priority Area</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {insights.coverage.underservedAreas[0].location.city}, {insights.coverage.underservedAreas[0].location.state}
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{insights.coverage.underservedAreas[0].metrics.population.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="h-3 w-3" />
                        <span>{insights.coverage.underservedAreas[0].metrics.nearestClinicDistance.toFixed(1)}mi</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expansion Recommendations */}
                {insights.expansion.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      <span className="text-xs font-semibold text-gray-800">AI Recommendations</span>
                    </div>
                    {insights.expansion.slice(0, 2).map((location: any, index: number) => (
                      <div key={index} className="bg-purple-50 p-2 rounded border border-purple-100">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {location.city}, {location.state}
                            </div>
                            <div className="text-xs text-gray-600">
                              Pop: {location.population.toLocaleString()} • Score: {location.score.toFixed(1)}
                            </div>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className="text-xs bg-purple-100 text-purple-700"
                          >
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Filter Info */}
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                  {filters.state && filters.state !== "all" ? (
                    <span>Filtered to {filters.state} • </span>
                  ) : null}
                  {filters.services?.length > 0 ? (
                    <span>Services: {filters.services.join(", ")} • </span>
                  ) : null}
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 text-gray-500">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <div className="text-sm">AI analysis unavailable</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}