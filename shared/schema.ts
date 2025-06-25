import { pgTable, text, serial, integer, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contractors = pgTable("contractors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  imageUrl: text("image_url"),
  rating: text("rating").notNull(),
  reviewCount: integer("review_count").notNull().default(0),
  freeEstimate: boolean("free_estimate").default(false),
  licensed: boolean("licensed").default(false),
  serviceRadius: integer("service_radius").default(50),
  specialties: text("specialties").array(),
  yearsExperience: integer("years_experience"),
  projectTypes: text("project_types").array(),
});

export const projectTypes = pgTable("project_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  slug: text("slug").notNull().unique(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  contractorId: integer("contractor_id").notNull().references(() => contractors.id),
  customerName: text("customer_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  projectType: text("project_type"),
});

export const insertContractorSchema = createInsertSchema(contractors).omit({
  id: true,
});

export const insertProjectTypeSchema = createInsertSchema(projectTypes).omit({
  id: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
});

export type InsertContractor = z.infer<typeof insertContractorSchema>;
export type Contractor = typeof contractors.$inferSelect;

export type InsertProjectType = z.infer<typeof insertProjectTypeSchema>;
export type ProjectType = typeof projectTypes.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("manager"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Subscription plans for contractors
export const plans = pgTable("plans", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  monthlyLeads: integer("monthly_leads").notNull(),
  price: text("price").notNull(),
  features: text("features", { mode: "json" }).$type<string[]>(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

// Contractor subscriptions
export const contractorSubscriptions = pgTable("contractor_subscriptions", {
  id: integer("id").primaryKey(),
  contractorId: integer("contractor_id").references(() => contractors.id).notNull(),
  planId: integer("plan_id").references(() => plans.id).notNull(),
  startDate: text("start_date").$defaultFn(() => new Date().toISOString()),
  endDate: text("end_date"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  leadsUsed: integer("leads_used").default(0),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

// Leads from booking form submissions
export const leads = pgTable("leads", {
  id: integer("id").primaryKey(),
  contractorId: integer("contractor_id").references(() => contractors.id).notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  projectType: text("project_type").notNull(),
  projectDescription: text("project_description"),
  budget: text("budget"),
  timeline: text("timeline"),
  address: text("address"),
  status: text("status").default("new"),
  source: text("source").default("book_service_form"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

// Plan schemas
export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
});

export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;

// Contractor subscription schemas
export const insertContractorSubscriptionSchema = createInsertSchema(contractorSubscriptions).omit({
  id: true,
  createdAt: true,
});

export type InsertContractorSubscription = z.infer<typeof insertContractorSubscriptionSchema>;
export type ContractorSubscription = typeof contractorSubscriptions.$inferSelect;

// Lead schemas
export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
