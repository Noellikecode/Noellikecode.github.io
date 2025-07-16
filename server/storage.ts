import { clinics, submissions, analytics, type Clinic, type InsertClinic, type Submission, type InsertSubmission, type Analytics } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count } from "drizzle-orm";

export interface IStorage {
  // Clinic operations
  getClinic(id: string): Promise<Clinic | undefined>;
  getAllClinics(): Promise<Clinic[]>;
  getVerifiedClinics(): Promise<Clinic[]>;
  createClinic(clinic: InsertClinic): Promise<Clinic>;
  updateClinic(id: string, updates: Partial<Clinic>): Promise<Clinic | undefined>;
  verifyClinic(id: string): Promise<boolean>;
  
  // Submission operations
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getPendingSubmissions(): Promise<(Submission & { clinic: Clinic })[]>;
  approveSubmission(id: string, reviewedBy: string): Promise<boolean>;
  rejectSubmission(id: string, reviewedBy: string, reason: string): Promise<boolean>;
  
  // Analytics operations
  getAnalytics(): Promise<Analytics>;
  incrementViews(): Promise<void>;
  
  // Search and filter
  searchClinics(filters: {
    costLevel?: string;
    services?: string;
    teletherapy?: boolean;
    country?: string;
  }): Promise<Clinic[]>;
}

export class DatabaseStorage implements IStorage {
  async getClinic(id: string): Promise<Clinic | undefined> {
    const [clinic] = await db.select().from(clinics).where(eq(clinics.id, id));
    return clinic || undefined;
  }

  async getAllClinics(): Promise<Clinic[]> {
    return await db.select().from(clinics).orderBy(desc(clinics.createdAt));
  }

  async getVerifiedClinics(): Promise<Clinic[]> {
    return await db.select().from(clinics)
      .where(eq(clinics.verified, true))
      .orderBy(desc(clinics.createdAt));
  }

  async createClinic(clinic: InsertClinic & { latitude: number; longitude: number; submittedBy: string }): Promise<Clinic> {
    const [newClinic] = await db
      .insert(clinics)
      .values(clinic)
      .returning();
    return newClinic;
  }

  async updateClinic(id: string, updates: Partial<Clinic>): Promise<Clinic | undefined> {
    const [updated] = await db
      .update(clinics)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(clinics.id, id))
      .returning();
    return updated || undefined;
  }

  async verifyClinic(id: string): Promise<boolean> {
    const result = await db
      .update(clinics)
      .set({ verified: true, updatedAt: new Date() })
      .where(eq(clinics.id, id));
    return (result.rowCount || 0) > 0;
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const [newSubmission] = await db
      .insert(submissions)
      .values(submission)
      .returning();
    return newSubmission;
  }

  async getPendingSubmissions(): Promise<(Submission & { clinic: Clinic })[]> {
    const result = await db
      .select()
      .from(submissions)
      .innerJoin(clinics, eq(submissions.clinicId, clinics.id))
      .where(eq(submissions.status, "pending"))
      .orderBy(desc(submissions.createdAt));
    
    return result.map(row => ({
      ...row.submissions,
      clinic: row.clinics,
    }));
  }

  async approveSubmission(id: string, reviewedBy: string): Promise<boolean> {
    const result = await db
      .update(submissions)
      .set({
        status: "approved",
        reviewedBy,
        reviewedAt: new Date(),
      })
      .where(eq(submissions.id, id));
    return (result.rowCount || 0) > 0;
  }

  async rejectSubmission(id: string, reviewedBy: string, reason: string): Promise<boolean> {
    const result = await db
      .update(submissions)
      .set({
        status: "rejected",
        reviewedBy,
        reviewedAt: new Date(),
        rejectionReason: reason,
      })
      .where(eq(submissions.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAnalytics(): Promise<Analytics> {
    let [analyticsData] = await db.select().from(analytics).limit(1);
    
    if (!analyticsData) {
      // Initialize analytics if not exists
      [analyticsData] = await db
        .insert(analytics)
        .values({
          totalViews: 0,
          monthlyViews: 0,
        })
        .returning();
    }
    
    return analyticsData;
  }

  async incrementViews(): Promise<void> {
    await db
      .update(analytics)
      .set({
        totalViews: (await this.getAnalytics()).totalViews + 1,
        monthlyViews: (await this.getAnalytics()).monthlyViews + 1,
        lastUpdated: new Date(),
      });
  }

  async searchClinics(filters: {
    costLevel?: string;
    services?: string;
    teletherapy?: boolean;
    country?: string;
  }): Promise<Clinic[]> {
    const conditions = [eq(clinics.verified, true)];
    
    if (filters.costLevel) {
      conditions.push(eq(clinics.costLevel, filters.costLevel));
    }
    
    if (filters.country) {
      conditions.push(eq(clinics.country, filters.country));
    }
    
    if (filters.teletherapy !== undefined) {
      conditions.push(eq(clinics.teletherapy, filters.teletherapy));
    }
    
    return await db.select().from(clinics)
      .where(and(...conditions))
      .orderBy(desc(clinics.createdAt));
  }
}

export const storage = new DatabaseStorage();
