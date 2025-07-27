// Temporary in-memory storage for testing Cloudflare deployment
import type {
  Contractor,
  InsertContractor,
  User,
  ProjectType,
  Lead,
  InsertLead,
  Plan,
  ContractorSubscription,
  InsertContractorSubscription,
} from "@shared/schema";
import type { IStorage } from "./storage";

export class MemoryStorage implements IStorage {
  private contractors: Map<number, Contractor> = new Map();
  private users: Map<number, User> = new Map();
  private projectTypes: Map<number, ProjectType> = new Map();
  private leads: Map<number, Lead> = new Map();
  private plans: Map<number, Plan> = new Map();
  private subscriptions: Map<number, ContractorSubscription> = new Map();
  private nextId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize with admin user
    this.users.set(1, {
      id: 1,
      username: 'admin',
      passwordHash: '$2a$10$rQZc8pZXuZNYxNOV7kqZPOp5V8zJJ0YQYj8X3q8zQ2gXKGzQlZJ.K', // password123
      role: 'manager',
      createdAt: new Date()
    });

    // Initialize project types
    const projectTypesData = [
      { name: 'Bathroom Remodeling', icon: 'Bath', description: 'Complete bathroom renovation and remodeling services' },
      { name: 'Kitchen Remodeling', icon: 'ChefHat', description: 'Kitchen renovation, cabinet installation, and appliance fitting' },
      { name: 'Custom Homes', icon: 'Home', description: 'Custom home construction from design to completion' },
      { name: 'Roofing', icon: 'Hammer', description: 'Roof repair, replacement, and installation services' },
      { name: 'Flooring', icon: 'Square', description: 'Hardwood, tile, carpet, and laminate flooring installation' },
      { name: 'Home Additions', icon: 'Plus', description: 'Room additions, extensions, and home expansions' },
      { name: 'Electrical Work', icon: 'Zap', description: 'Electrical installation, repair, and maintenance' },
      { name: 'Plumbing', icon: 'Droplets', description: 'Plumbing installation, repair, and maintenance services' }
    ];

    projectTypesData.forEach((pt, index) => {
      this.projectTypes.set(index + 1, {
        id: index + 1,
        name: pt.name,
        icon: pt.icon,
        description: pt.description,
        createdAt: new Date()
      });
    });

    // Initialize plans
    const plansData = [
      { name: 'Basic', price: 29.99, monthlyLeads: 5, features: ['Basic listing', 'Email notifications', 'Lead tracking'] },
      { name: 'Professional', price: 79.99, monthlyLeads: 15, features: ['Enhanced listing', 'Priority placement', 'Advanced analytics', 'Phone support'] },
      { name: 'Premium', price: 149.99, monthlyLeads: 50, features: ['Premium listing', 'Top placement', 'Unlimited project types', '24/7 support', 'Custom branding'] }
    ];

    plansData.forEach((plan, index) => {
      this.plans.set(index + 1, {
        id: index + 1,
        name: plan.name,
        price: plan.price,
        monthlyLeads: plan.monthlyLeads,
        features: plan.features,
        createdAt: new Date()
      });
    });

    this.nextId = 100; // Start contractor IDs at 100
  }

  // Contractor operations
  async getAllContractors(): Promise<Contractor[]> {
    return Array.from(this.contractors.values()).sort((a, b) => a.id - b.id);
  }

  async getContractor(id: number): Promise<Contractor | undefined> {
    return this.contractors.get(id);
  }

  async createContractor(contractor: InsertContractor): Promise<Contractor> {
    const id = this.nextId++;
    const newContractor: Contractor = {
      id,
      name: contractor.name,
      category: contractor.category,
      description: contractor.description || '',
      location: contractor.location || '',
      address: contractor.address || null,
      phone: contractor.phone || null,
      email: contractor.email || null,
      website: contractor.website || null,
      imageUrl: contractor.imageUrl || null,
      rating: contractor.rating || 0,
      reviewCount: contractor.reviewCount || 0,
      yearsExperience: contractor.yearsExperience || 0,
      projectTypes: contractor.projectTypes || [],
      serviceRadius: contractor.serviceRadius || 50,
      freeEstimate: contractor.freeEstimate || false,
      licensed: contractor.licensed || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.contractors.set(id, newContractor);
    return newContractor;
  }

  async updateContractor(id: number, contractor: Partial<InsertContractor>): Promise<Contractor> {
    const existing = this.contractors.get(id);
    if (!existing) {
      throw new Error('Contractor not found');
    }

    const updated: Contractor = {
      ...existing,
      ...contractor,
      updatedAt: new Date()
    };

    this.contractors.set(id, updated);
    return updated;
  }

  async deleteContractor(id: number): Promise<void> {
    this.contractors.delete(id);
  }

  async searchContractors(query: string): Promise<Contractor[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.contractors.values()).filter(contractor =>
      contractor.name.toLowerCase().includes(lowerQuery) ||
      contractor.description.toLowerCase().includes(lowerQuery) ||
      contractor.category.toLowerCase().includes(lowerQuery)
    );
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: { username: string; passwordHash: string; role?: string }): Promise<User> {
    const id = this.nextId++;
    const newUser: User = {
      id,
      username: user.username,
      passwordHash: user.passwordHash,
      role: user.role || 'user',
      createdAt: new Date()
    };

    this.users.set(id, newUser);
    return newUser;
  }

  // Project type operations
  async getAllProjectTypes(): Promise<ProjectType[]> {
    return Array.from(this.projectTypes.values());
  }

  // Lead operations
  async getAllLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getLeadsByContractor(contractorId: number): Promise<Lead[]> {
    return Array.from(this.leads.values())
      .filter(lead => lead.contractorId === contractorId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const id = this.nextId++;
    const newLead: Lead = {
      id,
      contractorId: lead.contractorId,
      customerName: lead.customerName,
      customerEmail: lead.customerEmail,
      customerPhone: lead.customerPhone || null,
      projectType: lead.projectType,
      projectDescription: lead.projectDescription || null,
      budget: lead.budget || null,
      timeline: lead.timeline || null,
      status: lead.status || 'new',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.leads.set(id, newLead);
    return newLead;
  }

  async updateLeadStatus(id: number, status: string): Promise<void> {
    const lead = this.leads.get(id);
    if (lead) {
      lead.status = status;
      lead.updatedAt = new Date();
    }
  }

  // Plan operations
  async getAllPlans(): Promise<Plan[]> {
    return Array.from(this.plans.values());
  }

  // Subscription operations
  async getSubscriptionWithPlan(contractorId: number): Promise<any> {
    const subscription = Array.from(this.subscriptions.values())
      .find(sub => sub.contractorId === contractorId && sub.status === 'active');

    if (!subscription) return null;

    const plan = this.plans.get(subscription.planId);
    return {
      ...subscription,
      plan
    };
  }

  async createOrUpdateSubscription(subscription: InsertContractorSubscription): Promise<ContractorSubscription> {
    const existing = Array.from(this.subscriptions.values())
      .find(sub => sub.contractorId === subscription.contractorId && sub.status === 'active');

    if (existing) {
      existing.planId = subscription.planId;
      existing.billingCycleStart = new Date(subscription.billingCycleStart);
      existing.billingCycleEnd = new Date(subscription.billingCycleEnd);
      existing.updatedAt = new Date();
      return existing;
    }

    const id = this.nextId++;
    const newSubscription: ContractorSubscription = {
      id,
      contractorId: subscription.contractorId,
      planId: subscription.planId,
      leadsUsed: subscription.leadsUsed || 0,
      billingCycleStart: new Date(subscription.billingCycleStart),
      billingCycleEnd: new Date(subscription.billingCycleEnd),
      status: subscription.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.subscriptions.set(id, newSubscription);
    return newSubscription;
  }

  async incrementLeadUsage(contractorId: number): Promise<void> {
    const subscription = Array.from(this.subscriptions.values())
      .find(sub => sub.contractorId === contractorId && sub.status === 'active');

    if (subscription) {
      subscription.leadsUsed += 1;
      subscription.updatedAt = new Date();
    }
  }
}

export const storage = new MemoryStorage();