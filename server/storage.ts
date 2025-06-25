import bcrypt from "bcryptjs";
import { 
  contractors, 
  projectTypes, 
  reviews, 
  users,
  type Contractor, 
  type InsertContractor,
  type ProjectType,
  type InsertProjectType,
  type Review,
  type InsertReview,
  type User, 
  type InsertUser 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(username: string, password: string): Promise<User | null>;
  createHashedUser(username: string, password: string, role?: string): Promise<User>;

  // Contractors
  getAllContractors(): Promise<Contractor[]>;
  getContractor(id: number): Promise<Contractor | undefined>;
  getContractorsByCategory(category: string): Promise<Contractor[]>;
  getContractorsByLocation(location: string, radius?: number): Promise<Contractor[]>;
  searchContractors(query: string): Promise<Contractor[]>;
  createContractor(contractor: InsertContractor): Promise<Contractor>;
  updateContractor(id: number, contractor: InsertContractor): Promise<Contractor>;
  deleteContractor(id: number): Promise<void>;

  // Project Types
  getAllProjectTypes(): Promise<ProjectType[]>;
  createProjectType(projectType: InsertProjectType): Promise<ProjectType>;

  // Reviews
  getReviewsByContractor(contractorId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Plans
  getAllPlans(): Promise<Plan[]>;
  getPlan(id: number): Promise<Plan | undefined>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  updatePlan(id: number, plan: InsertPlan): Promise<Plan>;

  // Contractor Subscriptions
  getContractorSubscription(contractorId: number): Promise<ContractorSubscription | undefined>;
  createContractorSubscription(subscription: InsertContractorSubscription): Promise<ContractorSubscription>;
  updateContractorSubscription(id: number, subscription: Partial<InsertContractorSubscription>): Promise<ContractorSubscription>;
  getSubscriptionWithPlan(contractorId: number): Promise<{subscription: ContractorSubscription, plan: Plan} | undefined>;

  // Leads
  getAllLeads(): Promise<Lead[]>;
  getLeadsByContractor(contractorId: number): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLeadStatus(id: number, status: string): Promise<Lead>;
  getLeadsCount(contractorId: number, month?: number, year?: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contractors: Map<number, Contractor>;
  private projectTypes: Map<number, ProjectType>;
  private reviews: Map<number, Review>;
  private plans: Map<number, Plan>;
  private contractorSubscriptions: Map<number, ContractorSubscription>;
  private leads: Map<number, Lead>;
  private currentUserId: number;
  private currentContractorId: number;
  private currentProjectTypeId: number;
  private currentReviewId: number;
  private currentPlanId: number;
  private currentSubscriptionId: number;
  private currentLeadId: number;

  constructor() {
    this.users = new Map();
    this.contractors = new Map();
    this.projectTypes = new Map();
    this.reviews = new Map();
    this.plans = new Map();
    this.contractorSubscriptions = new Map();
    this.leads = new Map();
    this.currentUserId = 1;
    this.currentContractorId = 1;
    this.currentProjectTypeId = 1;
    this.currentReviewId = 1;
    this.currentPlanId = 1;
    this.currentSubscriptionId = 1;
    this.currentLeadId = 1;

    // Initialize with sample data
    this.initializeData();
    this.initializePlans();
    this.initializeSubscriptions();
  }

  private initializeData() {
    // Initialize project types
    const sampleProjectTypes: Omit<ProjectType, 'id'>[] = [
      {
        name: "Bathroom Remodeling",
        imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        slug: "bathroom-remodeling"
      },
      {
        name: "Kitchen Remodeling", 
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        slug: "kitchen-remodeling"
      },
      {
        name: "Custom Homes",
        imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200", 
        slug: "custom-homes"
      },
      {
        name: "New Home Construction",
        imageUrl: "https://images.unsplash.com/photo-1448630360428-65456885c650?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        slug: "new-home-construction"
      },
      {
        name: "Garage Building",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        slug: "garage-building"
      }
    ];

    sampleProjectTypes.forEach(pt => {
      const projectType: ProjectType = { ...pt, id: this.currentProjectTypeId++ };
      this.projectTypes.set(projectType.id, projectType);
    });

    // Initialize contractors
    const sampleContractors: Omit<Contractor, 'id'>[] = [
      {
        name: "Isagani B.Baluyut Construction",
        category: "General Contractors",
        description: "Specializing in custom home construction, renovations, and commercial projects. Over 15 years of experience serving the Lake Charles area with quality craftsmanship.",
        location: "Lake Charles, LA",
        address: "Lake Charles, LA",
        phone: "(337) 555-0101",
        email: "info@baluyutconstruction.com",
        website: "www.baluyutconstruction.com",
        imageUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "5.0",
        reviewCount: 24,
        freeEstimate: true,
        licensed: true,
        serviceRadius: 50,
        specialties: ["Custom Homes", "Renovations", "Commercial"],
        yearsExperience: 15,
        projectTypes: ["custom-homes", "new-home-construction"]
      },
      {
        name: "Finishes That Last",
        category: "Interior Design & Renovation",
        description: "Expert interior finishing services including flooring, paint, and custom millwork. We focus on creating beautiful, lasting finishes for your home.",
        location: "Nederland, TX",
        address: "723 N 16th St, Nederland, TX 77627",
        phone: "(409) 555-0202",
        email: "contact@finishesthatlast.com",
        website: "www.finishesthatlast.com",
        imageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.9",
        reviewCount: 1,
        freeEstimate: false,
        licensed: true,
        serviceRadius: 30,
        specialties: ["Interior Finishing", "Flooring", "Paint"],
        yearsExperience: 8,
        projectTypes: ["bathroom-remodeling", "kitchen-remodeling"]
      },
      {
        name: "Gulf Coast Builders",
        category: "General Contractors",
        description: "Full-service construction company specializing in residential and light commercial projects. Licensed, bonded, and insured with a commitment to excellence.",
        location: "Lake Charles, LA",
        address: "Lake Charles, LA",
        phone: "(337) 555-0303",
        email: "info@gulfcoastbuilders.com",
        website: "www.gulfcoastbuilders.com",
        imageUrl: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.7",
        reviewCount: 18,
        freeEstimate: true,
        licensed: true,
        serviceRadius: 75,
        specialties: ["Residential", "Commercial", "Storm Damage"],
        yearsExperience: 12,
        projectTypes: ["new-home-construction", "garage-building"]
      },
      {
        name: "Bayou State Renovations",
        category: "Kitchen & Bath Remodeling",
        description: "Transform your kitchen and bathroom with our expert remodeling services. We handle everything from design to completion with attention to every detail.",
        location: "Sulphur, LA",
        address: "Sulphur, LA",
        phone: "(337) 555-0404",
        email: "info@bayoustatereno.com",
        website: "www.bayoustatereno.com",
        imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "5.0",
        reviewCount: 32,
        freeEstimate: false,
        licensed: true,
        serviceRadius: 40,
        specialties: ["Kitchen Remodeling", "Bathroom Remodeling", "Design"],
        yearsExperience: 10,
        projectTypes: ["kitchen-remodeling", "bathroom-remodeling"]
      },
      {
        name: "Mike's Quality Construction",
        category: "General Contractors",
        description: "Family-owned construction business serving Southwest Louisiana for over 20 years. Specializing in home additions, roofing, and storm damage repairs.",
        location: "Lake Charles, LA",
        address: "Lake Charles, LA",
        phone: "(337) 555-0505",
        email: "mike@mikesqualityconstruction.com",
        website: "www.mikesqualityconstruction.com",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.2",
        reviewCount: 9,
        freeEstimate: true,
        licensed: true,
        serviceRadius: 50,
        specialties: ["Home Additions", "Roofing", "Storm Damage"],
        yearsExperience: 20,
        projectTypes: ["new-home-construction", "garage-building"]
      },
      {
        name: "Precision Home Improvements",
        category: "Home Remodeling Specialist",
        description: "Precision craftsmanship for all your home improvement needs. From small repairs to complete home makeovers, we deliver quality results on time and on budget.",
        location: "Westlake, LA",
        address: "Westlake, LA",
        phone: "(337) 555-0606",
        email: "info@precisionhomeimprovements.com",
        website: "www.precisionhomeimprovements.com",
        imageUrl: "https://images.unsplash.com/photo-1620626011761-996317b8d101?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.8",
        reviewCount: 15,
        freeEstimate: false,
        licensed: true,
        serviceRadius: 35,
        specialties: ["Home Improvements", "Repairs", "Remodeling"],
        yearsExperience: 7,
        projectTypes: ["bathroom-remodeling", "kitchen-remodeling"]
      }
    ];

    sampleContractors.forEach(contractor => {
      const newContractor: Contractor = { ...contractor, id: this.currentContractorId++ };
      this.contractors.set(newContractor.id, newContractor);
    });
  }

  private initializePlans() {
    const samplePlans: Omit<Plan, 'id' | 'createdAt'>[] = [
      {
        name: "Basic",
        monthlyLeads: 5,
        price: "29.99",
        features: ["5 leads per month", "Basic profile listing", "Email support"],
        isActive: true,
      },
      {
        name: "Professional",
        monthlyLeads: 15,
        price: "79.99",
        features: ["15 leads per month", "Featured profile", "Priority support", "Lead analytics"],
        isActive: true,
      },
      {
        name: "Premium",
        monthlyLeads: 50,
        price: "199.99",
        features: ["50 leads per month", "Top placement", "24/7 support", "Advanced analytics", "Custom branding"],
        isActive: true,
      },
    ];

    samplePlans.forEach(plan => {
      const newPlan: Plan = { 
        ...plan, 
        id: this.currentPlanId++,
        createdAt: new Date().toISOString()
      };
      this.plans.set(newPlan.id, newPlan);
    });
  }

  private initializeSubscriptions() {
    // Give first few contractors sample subscriptions
    const subscriptions = [
      { contractorId: 1, planId: 2 }, // Professional
      { contractorId: 2, planId: 1 }, // Basic
      { contractorId: 3, planId: 3 }, // Premium
      { contractorId: 4, planId: 2 }, // Professional
    ];

    subscriptions.forEach(sub => {
      const newSub: ContractorSubscription = {
        id: this.currentSubscriptionId++,
        contractorId: sub.contractorId,
        planId: sub.planId,
        startDate: new Date().toISOString(),
        endDate: null,
        isActive: true,
        leadsUsed: Math.floor(Math.random() * 10),
        createdAt: new Date().toISOString(),
      };
      this.contractorSubscriptions.set(newSub.id, newSub);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Contractor methods
  async getAllContractors(): Promise<Contractor[]> {
    return Array.from(this.contractors.values()).sort((a, b) => a.id - b.id);
  }

  async getContractor(id: number): Promise<Contractor | undefined> {
    return this.contractors.get(id);
  }

  async getContractorsByCategory(category: string): Promise<Contractor[]> {
    return Array.from(this.contractors.values())
      .filter(contractor => contractor.category.toLowerCase().includes(category.toLowerCase()))
      .sort((a, b) => a.id - b.id);
  }

  async getContractorsByLocation(location: string, radius?: number): Promise<Contractor[]> {
    return Array.from(this.contractors.values())
      .filter(contractor => contractor.location.toLowerCase().includes(location.toLowerCase()))
      .sort((a, b) => a.id - b.id);
  }

  async searchContractors(query: string): Promise<Contractor[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.contractors.values())
      .filter(contractor => 
        contractor.name.toLowerCase().includes(searchTerm) ||
        contractor.category.toLowerCase().includes(searchTerm) ||
        contractor.description.toLowerCase().includes(searchTerm) ||
        contractor.specialties?.some(spec => spec.toLowerCase().includes(searchTerm))
      )
      .sort((a, b) => a.id - b.id);
  }

  async createContractor(contractor: InsertContractor): Promise<Contractor> {
    const id = this.currentContractorId++;
    const newContractor: Contractor = { 
      id,
      name: contractor.name,
      category: contractor.category,
      description: contractor.description,
      location: contractor.location,
      imageUrl: contractor.imageUrl,
      rating: contractor.rating,
      address: contractor.address ?? null,
      phone: contractor.phone ?? null,
      email: contractor.email ?? null,
      website: contractor.website ?? null,
      specialties: contractor.specialties ?? null,
      yearsExperience: contractor.yearsExperience ?? null,
      projectTypes: contractor.projectTypes ?? null,
      reviewCount: contractor.reviewCount ?? 0,
      serviceRadius: contractor.serviceRadius ?? 50,
      freeEstimate: contractor.freeEstimate ?? false,
      licensed: contractor.licensed ?? false
    };
    this.contractors.set(id, newContractor);
    return newContractor;
  }

  // Project Type methods
  async getAllProjectTypes(): Promise<ProjectType[]> {
    return Array.from(this.projectTypes.values());
  }

  async createProjectType(projectType: InsertProjectType): Promise<ProjectType> {
    const id = this.currentProjectTypeId++;
    const newProjectType: ProjectType = { ...projectType, id };
    this.projectTypes.set(id, newProjectType);
    return newProjectType;
  }

  // Review methods
  async getReviewsByContractor(contractorId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      review => review.contractorId === contractorId
    );
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const newReview: Review = { 
      id,
      contractorId: review.contractorId,
      customerName: review.customerName,
      rating: review.rating,
      comment: review.comment,
      projectType: review.projectType ?? null
    };
    this.reviews.set(id, newReview);
    return newReview;
  }

  async updateContractor(id: number, contractor: InsertContractor): Promise<Contractor> {
    const existing = this.contractors.get(id);
    if (!existing) {
      throw new Error("Contractor not found");
    }
    
    const updated: Contractor = { 
      id,
      name: contractor.name,
      category: contractor.category,
      description: contractor.description,
      location: contractor.location,
      imageUrl: contractor.imageUrl,
      rating: contractor.rating,
      address: contractor.address ?? null,
      phone: contractor.phone ?? null,
      email: contractor.email ?? null,
      website: contractor.website ?? null,
      specialties: contractor.specialties ?? null,
      yearsExperience: contractor.yearsExperience ?? null,
      projectTypes: contractor.projectTypes ?? null,
      reviewCount: contractor.reviewCount ?? 0,
      serviceRadius: contractor.serviceRadius ?? 50,
      freeEstimate: contractor.freeEstimate ?? false,
      licensed: contractor.licensed ?? false
    };
    
    this.contractors.set(id, updated);
    return updated;
  }

  async deleteContractor(id: number): Promise<void> {
    this.contractors.delete(id);
  }

  // Plan methods
  async getAllPlans(): Promise<Plan[]> {
    return Array.from(this.plans.values()).sort((a, b) => a.id - b.id);
  }

  async getPlan(id: number): Promise<Plan | undefined> {
    return this.plans.get(id);
  }

  async createPlan(plan: InsertPlan): Promise<Plan> {
    const id = this.currentPlanId++;
    const newPlan: Plan = {
      ...plan,
      id,
      createdAt: new Date().toISOString(),
    };
    this.plans.set(id, newPlan);
    return newPlan;
  }

  async updatePlan(id: number, plan: InsertPlan): Promise<Plan> {
    const existing = this.plans.get(id);
    if (!existing) {
      throw new Error("Plan not found");
    }
    
    const updated: Plan = {
      ...existing,
      ...plan,
    };
    this.plans.set(id, updated);
    return updated;
  }

  // Contractor Subscription methods
  async getContractorSubscription(contractorId: number): Promise<ContractorSubscription | undefined> {
    return Array.from(this.contractorSubscriptions.values())
      .find(sub => sub.contractorId === contractorId && sub.isActive);
  }

  async createContractorSubscription(subscription: InsertContractorSubscription): Promise<ContractorSubscription> {
    const id = this.currentSubscriptionId++;
    const newSubscription: ContractorSubscription = {
      ...subscription,
      id,
      createdAt: new Date().toISOString(),
    };
    this.contractorSubscriptions.set(id, newSubscription);
    return newSubscription;
  }

  async updateContractorSubscription(id: number, subscription: Partial<InsertContractorSubscription>): Promise<ContractorSubscription> {
    const existing = this.contractorSubscriptions.get(id);
    if (!existing) {
      throw new Error("Subscription not found");
    }
    
    const updated: ContractorSubscription = {
      ...existing,
      ...subscription,
    };
    this.contractorSubscriptions.set(id, updated);
    return updated;
  }

  async getSubscriptionWithPlan(contractorId: number): Promise<{subscription: ContractorSubscription, plan: Plan} | undefined> {
    const subscription = await this.getContractorSubscription(contractorId);
    if (!subscription) return undefined;
    
    const plan = await this.getPlan(subscription.planId);
    if (!plan) return undefined;
    
    return { subscription, plan };
  }

  // Lead methods
  async getAllLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values()).sort((a, b) => b.id - a.id);
  }

  async getLeadsByContractor(contractorId: number): Promise<Lead[]> {
    return Array.from(this.leads.values())
      .filter(lead => lead.contractorId === contractorId)
      .sort((a, b) => b.id - a.id);
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const id = this.currentLeadId++;
    const now = new Date().toISOString();
    const newLead: Lead = {
      ...lead,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.leads.set(id, newLead);
    
    // Increment leads used for contractor
    const subscription = await this.getContractorSubscription(lead.contractorId);
    if (subscription) {
      await this.updateContractorSubscription(subscription.id, {
        leadsUsed: (subscription.leadsUsed || 0) + 1
      });
    }
    
    return newLead;
  }

  async updateLeadStatus(id: number, status: string): Promise<Lead> {
    const existing = this.leads.get(id);
    if (!existing) {
      throw new Error("Lead not found");
    }
    
    const updated: Lead = {
      ...existing,
      status,
      updatedAt: new Date().toISOString(),
    };
    this.leads.set(id, updated);
    return updated;
  }

  async getLeadsCount(contractorId: number, month?: number, year?: number): Promise<number> {
    const leads = await this.getLeadsByContractor(contractorId);
    
    if (month === undefined || year === undefined) {
      return leads.length;
    }
    
    return leads.filter(lead => {
      const createdDate = new Date(lead.createdAt);
      return createdDate.getMonth() === month && createdDate.getFullYear() === year;
    }).length;
  }
}

// rewrite MemStorage to DatabaseStorage
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllContractors(): Promise<Contractor[]> {
    return await db.select().from(contractors).orderBy(contractors.id);
  }

  async getContractor(id: number): Promise<Contractor | undefined> {
    const [contractor] = await db.select().from(contractors).where(eq(contractors.id, id));
    return contractor || undefined;
  }

  async getContractorsByCategory(category: string): Promise<Contractor[]> {
    return await db.select().from(contractors).where(eq(contractors.category, category)).orderBy(contractors.id);
  }

  async getContractorsByLocation(location: string, radius?: number): Promise<Contractor[]> {
    return await db.select().from(contractors).where(eq(contractors.location, location)).orderBy(contractors.id);
  }

  async searchContractors(query: string): Promise<Contractor[]> {
    // For now, return all contractors - in production would use full-text search
    return await db.select().from(contractors).orderBy(contractors.id);
  }

  async createContractor(contractor: InsertContractor): Promise<Contractor> {
    const [created] = await db
      .insert(contractors)
      .values(contractor)
      .returning();
    return created;
  }

  async getAllProjectTypes(): Promise<ProjectType[]> {
    return await db.select().from(projectTypes);
  }

  async createProjectType(projectType: InsertProjectType): Promise<ProjectType> {
    const [created] = await db
      .insert(projectTypes)
      .values(projectType)
      .returning();
    return created;
  }

  async getReviewsByContractor(contractorId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.contractorId, contractorId));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return created;
  }

  async updateContractor(id: number, contractor: InsertContractor): Promise<Contractor> {
    const [updated] = await db
      .update(contractors)
      .set(contractor)
      .where(eq(contractors.id, id))
      .returning();
    return updated;
  }

  async deleteContractor(id: number): Promise<void> {
    await db.delete(contractors).where(eq(contractors.id, id));
  }

  // User authentication methods
  async authenticateUser(username: string, password: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (!user) return null;

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return null;

    return user;
  }

  async createHashedUser(username: string, password: string, role: string = "manager"): Promise<User> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const [user] = await db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
        role,
      })
      .returning();
    
    return user;
  }
}

export const storage = new DatabaseStorage();
