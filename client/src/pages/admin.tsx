import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, XCircle, BarChart, Flag, Inbox, Eye, Clock, Brain, Target, TrendingUp, Zap, MapPin, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminDashboard from "@/components/admin/admin-dashboard";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["/api/admin/submissions"],
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics"],
  });

  // Type the analytics data
  const typedAnalytics = analytics as { totalLocations?: number; verifiedLocations?: number } | undefined;

  const approveMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      await apiRequest("POST", `/api/admin/submissions/${submissionId}/approve`, {
        reviewedBy: "admin@example.com"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clinics"] });
      toast({
        title: "Success",
        description: "Submission approved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve submission",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ submissionId, reason }: { submissionId: string; reason: string }) => {
      await apiRequest("POST", `/api/admin/submissions/${submissionId}/reject`, {
        reviewedBy: "admin@example.com",
        reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Success",
        description: "Submission rejected successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject submission",
        variant: "destructive",
      });
    },
  });

  // ML insights queries
  const { data: mlInsights, isLoading: mlLoading } = useQuery({
    queryKey: ["/api/ml/insights"],
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const importNPIMutation = useMutation({
    mutationFn: async ({ state, limit }: { state?: string; limit?: number }) => {
      return await apiRequest("POST", "/api/admin/import-npi", {
        state,
        limit: limit || 50,
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/clinics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Import Completed",
        description: `Imported ${data.imported} new clinics from NPI database. Skipped ${data.skipped} duplicates.`,
      });
    },
    onError: () => {
      toast({
        title: "Import Failed",
        description: "Failed to import clinics from NPI database",
        variant: "destructive",
      });
    },
  });

  // ML enhancement mutation
  const enhanceMutation = useMutation({
    mutationFn: async (limit: number = 50) => {
      return await apiRequest("POST", "/api/ml/enhance-data", { limit });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/clinics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ml/insights"] });
      toast({
        title: "Data Enhancement Complete",
        description: `Enhanced ${data.data.enhancementsApplied} clinic records with improved information.`,
      });
    },
    onError: () => {
      toast({
        title: "Enhancement Failed",
        description: "Failed to enhance clinic data",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Admin Header */}
      <div className="bg-gray-900 text-white p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Admin Dashboard</h2>
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="text-gray-300 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Admin Sidebar */}
        <div className="w-64 bg-gray-100 border-r">
          <nav className="p-4 space-y-2">
            <div className="flex items-center space-x-3 px-3 py-2 bg-primary text-white rounded-lg">
              <Inbox className="h-4 w-4" />
              <span>Pending Submissions</span>
              <span className="ml-auto bg-white text-primary text-xs px-2 py-1 rounded-full">
                {Array.isArray(submissions) ? submissions.length : 0}
              </span>
            </div>
            <div className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              <span>Verified Locations</span>
            </div>
            <div className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">
              <BarChart className="h-4 w-4" />
              <span>Analytics</span>
            </div>
            <div className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">
              <Flag className="h-4 w-4" />
              <span>Reported Issues</span>
            </div>
            <div className="flex items-center space-x-3 px-3 py-2 text-blue-700 bg-blue-50 rounded-lg">
              <Brain className="h-4 w-4" />
              <span>ML Insights</span>
              <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                AI
              </span>
            </div>
          </nav>
        </div>

        {/* Admin Content */}
        <div className="flex-1 p-6">
          <AdminDashboard 
            submissions={Array.isArray(submissions) ? submissions : []}
            analytics={typedAnalytics}
            isLoading={isLoading}
            onApprove={(id) => approveMutation.mutate(id)}
            onReject={(id, reason) => rejectMutation.mutate({ submissionId: id, reason })}
            onImportNPI={(state, limit) => importNPIMutation.mutate({ state, limit })}
            isApproving={approveMutation.isPending}
            isRejecting={rejectMutation.isPending}
            isImporting={importNPIMutation.isPending}
          />

          {/* ML Insights Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Brain className="mr-2 h-5 w-5 text-blue-500" />
                Machine Learning Insights
              </h3>
              <Button 
                onClick={() => enhanceMutation.mutate(100)}
                disabled={enhanceMutation.isPending}
                variant="outline"
                size="sm"
              >
                {enhanceMutation.isPending ? (
                  <>
                    <Zap className="mr-2 h-4 w-4 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Enhance Data
                  </>
                )}
              </Button>
            </div>

            {mlLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">Loading ML insights...</div>
              </div>
            ) : (mlInsights as any)?.success ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Coverage Analysis */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <Target className="mr-2 h-4 w-4 text-green-500" />
                        Coverage Analysis
                      </h4>
                      <div className="text-2xl font-bold text-green-600">
                        {(mlInsights as any).data.coverage.totalCoverage.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Underserved Areas</span>
                        <span className="font-medium text-red-600">
                          {(mlInsights as any).data.coverage.underservedAreas.length} locations
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Growth Opportunities</span>
                        <span className="font-medium text-blue-600">
                          {(mlInsights as any).data.coverage.optimalNewLocations.length} locations
                        </span>
                      </div>
                    </div>

                    {(mlInsights as any).data.coverage.underservedAreas.length > 0 && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center text-red-800 text-sm font-medium mb-2">
                          <AlertTriangle className="mr-1 h-4 w-4" />
                          Top Priority Area
                        </div>
                        <div className="text-sm text-red-700">
                          {(mlInsights as any).data.coverage.underservedAreas[0].location.city}, {(mlInsights as any).data.coverage.underservedAreas[0].location.state}
                          <br />
                          <span className="text-xs">
                            {(mlInsights as any).data.coverage.underservedAreas[0].metrics.population.toLocaleString()} residents, 
                            {(mlInsights as any).data.coverage.underservedAreas[0].metrics.nearestClinicDistance.toFixed(1)} miles to nearest clinic
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Expansion Opportunities */}
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-gray-900 flex items-center mb-4">
                      <TrendingUp className="mr-2 h-4 w-4 text-blue-500" />
                      Expansion Opportunities
                    </h4>
                    
                    <div className="space-y-3">
                      {(mlInsights as any).data.expansion.slice(0, 3).map((location: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {location.location.city}, {location.location.state}
                            </div>
                            <div className="text-xs text-gray-600">
                              {location.metrics.population.toLocaleString()} population
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-blue-600">
                              {location.metrics.nearestClinicDistance.toFixed(1)} mi
                            </div>
                            <div className="text-xs text-gray-500">
                              to nearest
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Data Quality */}
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-gray-900 flex items-center mb-4">
                      <CheckCircle className="mr-2 h-4 w-4 text-purple-500" />
                      Data Quality
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Potential Duplicates</span>
                        <span className="font-medium text-orange-600">
                          {(mlInsights as any).data.dataQuality.duplicatesFound} found
                        </span>
                      </div>
                      
                      {(mlInsights as any).data.dataQuality.topDuplicates.length > 0 && (
                        <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                          <div className="text-xs text-orange-800 font-medium mb-1">
                            Top Duplicate Match
                          </div>
                          <div className="text-xs text-orange-700">
                            "{(mlInsights as any).data.dataQuality.topDuplicates[0].original.name}" vs 
                            "{(mlInsights as any).data.dataQuality.topDuplicates[0].duplicate.name}" 
                            ({((mlInsights as any).data.dataQuality.topDuplicates[0].similarity * 100).toFixed(1)}% similar)
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* System Performance */}
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-gray-900 flex items-center mb-4">
                      <Zap className="mr-2 h-4 w-4 text-yellow-500" />
                      AI Performance
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Clinics</span>
                        <span className="font-medium text-gray-900">
                          {typedAnalytics?.totalLocations || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Verified</span>
                        <span className="font-medium text-green-600">
                          {typedAnalytics?.verifiedLocations || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Coverage Score</span>
                        <span className="font-medium text-blue-600">
                          {(mlInsights as any).data.coverage.totalCoverage.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="text-xs text-green-800 font-medium">
                        ML System Status: Active
                      </div>
                      <div className="text-xs text-green-700 mt-1">
                        Analyzing {typedAnalytics?.totalLocations || 0} locations across 50 states
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500">Unable to load ML insights</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
