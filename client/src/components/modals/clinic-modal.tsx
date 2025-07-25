import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Video, Phone, Mail, Globe, ArrowDownRight, Flag, CheckCircle } from "lucide-react";
import { Clinic } from "@/types/clinic";

interface ClinicModalProps {
  clinic: Clinic | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClinicModal({ clinic, isOpen, onClose }: ClinicModalProps) {
  if (!clinic) return null;

  const getCostLevelColor = (costLevel: string) => {
    switch (costLevel) {
      case 'free': return 'bg-green-50 text-green-600';
      case 'low-cost': return 'bg-orange-50 text-orange-600';
      case 'market-rate': return 'bg-blue-50 text-blue-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const getCostLevelLabel = (costLevel: string) => {
    switch (costLevel) {
      case 'free': return 'Free Services';
      case 'low-cost': return 'Low Cost';
      case 'market-rate': return 'Market Rate';
      default: return 'Unknown';
    }
  };

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${clinic.latitude},${clinic.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        aria-describedby={`clinic-details-${clinic.id}`}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{clinic.name}</DialogTitle>
          <p className="text-gray-600 flex items-center mt-1" id={`clinic-details-${clinic.id}`}>
            <MapPin className="text-primary mr-1 h-4 w-4" />
            {clinic.city}, {clinic.country}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cost Level */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Cost Level:</span>
            <Badge className={getCostLevelColor(clinic.costLevel)}>
              {getCostLevelLabel(clinic.costLevel)}
            </Badge>
          </div>

          {/* Services */}
          <div>
            <span className="text-sm font-medium text-gray-700 block mb-2">Services Offered:</span>
            <div className="flex flex-wrap gap-2">
              {clinic.services.map((service) => (
                <Badge key={service} variant="secondary" className="bg-primary/10 text-primary">
                  {service}
                </Badge>
              ))}
            </div>
          </div>

          {/* Languages */}
          {clinic.languages && (
            <div>
              <span className="text-sm font-medium text-gray-700 block mb-2">Languages Supported:</span>
              <p className="text-sm text-gray-600">{clinic.languages}</p>
            </div>
          )}

          {/* Teletherapy */}
          <div className="flex items-center space-x-2">
            <Video className="text-primary h-4 w-4" />
            <span className="text-sm font-medium text-gray-700">Teletherapy:</span>
            <span className={`text-sm font-medium ${clinic.teletherapy ? 'text-green-600' : 'text-gray-500'}`}>
              {clinic.teletherapy ? 'Available' : 'Not Available'}
            </span>
          </div>

          {/* Contact Info */}
          {(clinic.phone || clinic.email || clinic.website) && (
            <div className="border-t pt-4">
              <span className="text-sm font-medium text-gray-700 block mb-2">Contact Information:</span>
              <div className="space-y-1 text-sm text-gray-600">
                {clinic.phone && (
                  <p className="flex items-center">
                    <Phone className="mr-2 h-4 w-4" />
                    {clinic.phone}
                  </p>
                )}
                {clinic.email && (
                  <p className="flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    {clinic.email}
                  </p>
                )}
                {clinic.website && (
                  <p className="flex items-center">
                    <Globe className="mr-2 h-4 w-4" />
                    <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {clinic.website}
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {clinic.notes && (
            <div className="border-t pt-4">
              <span className="text-sm font-medium text-gray-700 block mb-2">Additional Notes:</span>
              <p className="text-sm text-gray-600">{clinic.notes}</p>
            </div>
          )}

          {/* Verification Status */}
          <div className="border-t pt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {clinic.verified ? (
                <>
                  <CheckCircle className="text-green-500 h-4 w-4" />
                  <span className="text-sm text-green-600 font-medium">Verified</span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                  <span className="text-sm text-yellow-600 font-medium">Pending Verification</span>
                </>
              )}
            </div>
            <span className="text-xs text-gray-500">
              Updated {new Date(clinic.updatedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-4 flex space-x-3">
            <Button onClick={handleGetDirections} className="flex-1">
              <ArrowDownRight className="mr-2 h-4 w-4" />
              Get ArrowDownRight
            </Button>
            <Button variant="outline">
              <Flag className="mr-2 h-4 w-4" />
              Report Issue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
