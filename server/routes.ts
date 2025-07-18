import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClinicSchema, insertSubmissionSchema } from "@shared/schema";
import { z } from "zod";
import { npiService } from "./npi-service";
import { getCoordinates } from "@shared/utils";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all verified clinics
  app.get("/api/clinics", async (req, res) => {
    try {
      const clinics = await storage.getVerifiedClinics();
      res.json(clinics);
    } catch (error) {
      console.error("Error fetching clinics:", error);
      res.status(500).json({ message: "Failed to fetch clinics" });
    }
  });

  // Get clinic by ID
  app.get("/api/clinics/:id", async (req, res) => {
    try {
      const clinic = await storage.getClinic(req.params.id);
      if (!clinic) {
        return res.status(404).json({ message: "Clinic not found" });
      }
      res.json(clinic);
    } catch (error) {
      console.error("Error fetching clinic:", error);
      res.status(500).json({ message: "Failed to fetch clinic" });
    }
  });

  // Search clinics with filters
  app.get("/api/clinics/search", async (req, res) => {
    try {
      const filters = {
        costLevel: req.query.costLevel as string,
        services: req.query.services as string,
        teletherapy: req.query.teletherapy === "true",
        country: req.query.country as string,
      };
      
      const clinics = await storage.searchClinics(filters);
      res.json(clinics);
    } catch (error) {
      console.error("Error searching clinics:", error);
      res.status(500).json({ message: "Failed to search clinics" });
    }
  });

  // Submit new clinic for review
  app.post("/api/clinics", async (req, res) => {
    try {
      const validatedData = insertClinicSchema.parse(req.body);
      
      const [latitude, longitude] = await getCoordinates(validatedData.city, validatedData.country);
      
      const clinicData = {
        ...validatedData,
        latitude,
        longitude,
        submittedBy: validatedData.submitterEmail,
      };
      
      const clinic = await storage.createClinic(clinicData);
      
      // Create submission record
      await storage.createSubmission({
        clinicId: clinic.id,
        status: "pending",
      });
      
      res.status(201).json({ 
        message: "Clinic submitted for review",
        clinicId: clinic.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors 
        });
      }
      console.error("Error creating clinic:", error);
      res.status(500).json({ message: "Failed to submit clinic" });
    }
  });

  // Admin routes
  app.get("/api/admin/submissions", async (req, res) => {
    try {
      const submissions = await storage.getPendingSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.post("/api/admin/submissions/:id/approve", async (req, res) => {
    try {
      const { reviewedBy } = req.body;
      const success = await storage.approveSubmission(req.params.id, reviewedBy);
      
      if (success) {
        // Also verify the associated clinic
        const submissions = await storage.getPendingSubmissions();
        const submission = submissions.find(s => s.id === req.params.id);
        if (submission) {
          await storage.verifyClinic(submission.clinicId!);
        }
        
        res.json({ message: "Submission approved" });
      } else {
        res.status(404).json({ message: "Submission not found" });
      }
    } catch (error) {
      console.error("Error approving submission:", error);
      res.status(500).json({ message: "Failed to approve submission" });
    }
  });

  app.post("/api/admin/submissions/:id/reject", async (req, res) => {
    try {
      const { reviewedBy, reason } = req.body;
      const success = await storage.rejectSubmission(req.params.id, reviewedBy, reason);
      
      if (success) {
        res.json({ message: "Submission rejected" });
      } else {
        res.status(404).json({ message: "Submission not found" });
      }
    } catch (error) {
      console.error("Error rejecting submission:", error);
      res.status(500).json({ message: "Failed to reject submission" });
    }
  });

  // Analytics
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      const totalClinics = (await storage.getAllClinics()).length;
      const verifiedClinics = (await storage.getVerifiedClinics()).length;
      const pendingSubmissions = (await storage.getPendingSubmissions()).length;
      
      res.json({
        ...analytics,
        totalLocations: totalClinics,
        verifiedLocations: verifiedClinics,
        pendingLocations: pendingSubmissions,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Increment view count
  app.post("/api/analytics/view", async (req, res) => {
    try {
      await storage.incrementViews();
      res.json({ message: "View recorded" });
    } catch (error) {
      console.error("Error recording view:", error);
      res.status(500).json({ message: "Failed to record view" });
    }
  });

  // Import speech therapy centers from NPI
  app.post("/api/admin/import-npi", async (req, res) => {
    try {
      const { state, limit = 50 } = req.body;
      
      console.log(`Starting NPI import for state: ${state || 'all'}, limit: ${limit}`);
      
      console.log('Calling NPI service with state:', state, 'limit:', limit);
      const clinics = await npiService.fetchSpeechTherapyCenters(state, limit);
      console.log('NPI service returned', clinics.length, 'clinics');
      
      let importedCount = 0;
      let skippedCount = 0;
      
      for (const clinic of clinics) {
        try {
          // Check if clinic already exists by name and city
          const existingClinics = await storage.searchClinics({
            country: clinic.country
          });
          
          const exists = existingClinics.some(existing => 
            existing.name.toLowerCase() === clinic.name.toLowerCase() && 
            existing.city.toLowerCase() === clinic.city.toLowerCase()
          );
          
          if (!exists) {
            // Get coordinates for the clinic
            const [latitude, longitude] = await getCoordinates(clinic.city, clinic.country);
            
            const clinicWithCoords = {
              ...clinic,
              latitude,
              longitude,
              submittedBy: 'NPI Import Service',
              verified: true // Auto-verify NPI imported clinics
            };
            
            await storage.createClinic(clinicWithCoords);
            importedCount++;
          } else {
            skippedCount++;
          }
        } catch (error) {
          console.error(`Error importing clinic ${clinic.name}:`, error);
          skippedCount++;
        }
      }
      
      res.json({
        message: "NPI import completed",
        imported: importedCount,
        skipped: skippedCount,
        total: clinics.length
      });
    } catch (error) {
      console.error("Error importing from NPI:", error);
      res.status(500).json({ message: "Failed to import from NPI" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
