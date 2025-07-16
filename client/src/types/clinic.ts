export interface Clinic {
  id: string;
  name: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  costLevel: "free" | "low-cost" | "market-rate";
  services: string[];
  languages?: string;
  teletherapy: boolean;
  phone?: string;
  website?: string;
  email?: string;
  notes?: string;
  verified: boolean;
  submittedBy: string;
  submitterEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  clinicId?: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface Analytics {
  id: number;
  totalViews: number;
  monthlyViews: number;
  lastUpdated: string;
  totalLocations?: number;
  verifiedLocations?: number;
  pendingLocations?: number;
}
