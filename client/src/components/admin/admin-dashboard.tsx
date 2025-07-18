import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, MapPin, Eye, Clock, Users, Download } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface AdminDashboardProps {
  submissions: any[];
  analytics: any;
  isLoading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onImportNPI: (state?: string, limit?: number) => void;
  isApproving: boolean;
  isRejecting: boolean;
  isImporting: boolean;
}

export default function AdminDashboard({ 
  submissions, 
  analytics, 
  isLoading, 
  onApprove, 
  onReject,
  onImportNPI,
  isApproving,
  isRejecting,
  isImporting 
}: AdminDashboardProps) {
  const [selectedState, setSelectedState] = useState<string>("");
  const [importLimit, setImportLimit] = useState<number>(25);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const handleReject = (id: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason) {
      onReject(id, reason);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Submissions</h3>
        
        {submissions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-500">No pending submissions to review.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={submission.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{submission.clinic.name}</h4>
                      <p className="text-sm text-gray-600">{submission.clinic.city}, {submission.clinic.country}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Submitted {new Date(submission.createdAt).toLocaleDateString()} by {submission.clinic.submitterEmail}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => onApprove(submission.id)}
                        disabled={isApproving || isRejecting}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleReject(submission.id)}
                        disabled={isApproving || isRejecting}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Cost Level:</span>
                      <p className="font-medium capitalize">{submission.clinic.costLevel}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Services:</span>
                      <p className="font-medium">{submission.clinic.services.slice(0, 2).join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Languages:</span>
                      <p className="font-medium">{submission.clinic.languages || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Teletherapy:</span>
                      <Badge variant={submission.clinic.teletherapy ? "default" : "secondary"}>
                        {submission.clinic.teletherapy ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                  
                  {submission.clinic.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">{submission.clinic.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* NPI Import Section */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Download className="mr-2 h-5 w-5" />
              Import Speech Therapy Centers
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Import real speech therapy centers from the National Provider Identifier (NPI) database. 
              This will add verified speech-language pathologists to your map.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State (Optional)
                </label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="All states" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All states</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="IL">Illinois</SelectItem>
                    <SelectItem value="PA">Pennsylvania</SelectItem>
                    <SelectItem value="OH">Ohio</SelectItem>
                    <SelectItem value="GA">Georgia</SelectItem>
                    <SelectItem value="NC">North Carolina</SelectItem>
                    <SelectItem value="MI">Michigan</SelectItem>
                    <SelectItem value="ON">Ontario</SelectItem>
                    <SelectItem value="BC">British Columbia</SelectItem>
                    <SelectItem value="QC">Quebec</SelectItem>
                    <SelectItem value="AB">Alberta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Centers
                </label>
                <Select value={importLimit.toString()} onValueChange={(value) => setImportLimit(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 centers</SelectItem>
                    <SelectItem value="25">25 centers</SelectItem>
                    <SelectItem value="50">50 centers</SelectItem>
                    <SelectItem value="100">100 centers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={() => onImportNPI(selectedState || undefined, importLimit)}
                disabled={isImporting}
                className="w-full sm:w-auto"
              >
                {isImporting ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Import Centers
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="text-primary h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Total Locations</p>
                    <p className="text-xl font-semibold text-gray-900">{analytics.totalLocations || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CheckCircle className="text-green-500 h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Verified</p>
                    <p className="text-xl font-semibold text-gray-900">{analytics.verifiedLocations || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Clock className="text-orange-500 h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-xl font-semibold text-gray-900">{analytics.pendingLocations || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Eye className="text-primary h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Total Views</p>
                    <p className="text-xl font-semibold text-gray-900">{analytics.totalViews || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
