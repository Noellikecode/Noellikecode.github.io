import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, XCircle, BarChart, Flag, Inbox, Eye, Clock } from "lucide-react";
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

  const importNPIMutation = useMutation({
    mutationFn: async ({ state, limit }: { state?: string; limit?: number }) => {
      return await apiRequest("POST", "/api/admin/import-npi", {
        state,
        limit: limit || 50,
      });
    },
    onSuccess: (data) => {
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
                {submissions.length}
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
          </nav>
        </div>

        {/* Admin Content */}
        <div className="flex-1 p-6">
          <AdminDashboard 
            submissions={submissions}
            analytics={analytics}
            isLoading={isLoading}
            onApprove={(id) => approveMutation.mutate(id)}
            onReject={(id, reason) => rejectMutation.mutate({ submissionId: id, reason })}
            onImportNPI={(state, limit) => importNPIMutation.mutate({ state, limit })}
            isApproving={approveMutation.isPending}
            isRejecting={rejectMutation.isPending}
            isImporting={importNPIMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
