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
