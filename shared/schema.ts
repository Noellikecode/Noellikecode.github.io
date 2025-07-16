import { pgTable, text, serial, boolean, timestamp, real, json, uuid, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const clinics = pgTable("clinics", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  city: text("city").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  costLevel: text("cost_level").notNull(), // 'free', 'low-cost', 'market-rate'
  services: json("services").$type<string[]>().notNull().default([]),
  languages: text("languages"),
  teletherapy: boolean("teletherapy").notNull().default(false),
  phone: text("phone"),
  website: text("website"),
  email: text("email"),
  notes: text("notes"),
  verified: boolean("verified").notNull().default(false),
  submittedBy: text("submitted_by").notNull(),
  submitterEmail: text("submitter_email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id").references(() => clinics.id),
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected'
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  totalViews: integer("total_views").notNull().default(0),
  monthlyViews: integer("monthly_views").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const submissionsRelations = relations(submissions, ({ one }) => ({
  clinic: one(clinics, {
    fields: [submissions.clinicId],
    references: [clinics.id],
  }),
}));

export const clinicsRelations = relations(clinics, ({ many }) => ({
  submissions: many(submissions),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertClinicSchema = createInsertSchema(clinics).omit({
  id: true,
  verified: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  services: z.array(z.string()).min(1, "At least one service must be selected"),
  costLevel: z.enum(["free", "low-cost", "market-rate"]),
  submitterEmail: z.string().email("Invalid email address"),
  teletherapy: z.boolean().default(false),
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertClinic = z.infer<typeof insertClinicSchema>;
export type Clinic = typeof clinics.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;
export type Analytics = typeof analytics.$inferSelect;
