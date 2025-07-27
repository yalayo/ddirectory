// Shared types for D Directory application
// Compatible with both PostgreSQL and Cloudflare D2

import { z } from "zod";

// Contractor types
export interface Contractor {
  id: number;
  name: string;
  category: string;
  description: string;
  location: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  imageUrl: string | null;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  projectTypes: string[];
  serviceRadius: number;
  freeEstimate: boolean;
  licensed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertContractor {
  name: string;
  category: string;
  description?: string;
  location?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  yearsExperience?: number;
  projectTypes?: string[];
  serviceRadius?: number;
  freeEstimate?: boolean;
  licensed?: boolean;
}

// User types
export interface User {
  id: number;
  username: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
}

// Project types
export interface ProjectType {
  id: number;
  name: string;
  icon: string;
  description: string;
  createdAt: Date;
}

// Lead types
export interface Lead {
  id: number;
  contractorId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  projectType: string;
  projectDescription: string | null;
  budget: string | null;
  timeline: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertLead {
  contractorId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  projectType: string;
  projectDescription?: string;
  budget?: string;
  timeline?: string;
  status?: string;
}

// Plan types
export interface Plan {
  id: number;
  name: string;
  price: number;
  monthlyLeads: number;
  features: string[];
  createdAt: Date;
}

// Subscription types
export interface ContractorSubscription {
  id: number;
  contractorId: number;
  planId: number;
  leadsUsed: number;
  billingCycleStart: Date;
  billingCycleEnd: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertContractorSubscription {
  contractorId: number;
  planId: number;
  leadsUsed?: number;
  billingCycleStart: string;
  billingCycleEnd: string;
  status?: string;
}

// Validation schemas
export const insertContractorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
  yearsExperience: z.number().min(0).optional(),
  projectTypes: z.array(z.string()).optional(),
  serviceRadius: z.number().min(1).optional(),
  freeEstimate: z.boolean().optional(),
  licensed: z.boolean().optional(),
});

export const insertLeadSchema = z.object({
  contractorId: z.number(),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().optional(),
  projectType: z.string().min(1, "Project type is required"),
  projectDescription: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  status: z.string().optional(),
});