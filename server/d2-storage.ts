// D2 storage implementation for Cloudflare deployment
import type { 
  Contractor, InsertContractor, 
  User, ProjectType, 
  Lead, InsertLead,
  Plan, ContractorSubscription, InsertContractorSubscription
} from "@shared/schema";
import { getDatabase, type D2DatabaseService } from "./d2-db";

export interface IStorage {
  // Contractor operations
  getAllContractors(): Promise<Contractor[]>;
  getContractor(id: number): Promise<Contractor | undefined>;
  createContractor(contractor: InsertContractor): Promise<Contractor>;
  updateContractor(id: number, contractor: Partial<InsertContractor>): Promise<Contractor>;
  deleteContractor(id: number): Promise<void>;
  searchContractors(query: string): Promise<Contractor[]>;

  // User operations  
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: { username: string; passwordHash: string; role?: string }): Promise<User>;

  // Project type operations
  getAllProjectTypes(): Promise<ProjectType[]>;

  // Lead operations
  getAllLeads(): Promise<Lead[]>;
  getLeadsByContractor(contractorId: number): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLeadStatus(id: number, status: string): Promise<void>;

  // Plan operations
  getAllPlans(): Promise<Plan[]>;

  // Subscription operations
  getSubscriptionWithPlan(contractorId: number): Promise<any>;
  createOrUpdateSubscription(subscription: InsertContractorSubscription): Promise<ContractorSubscription>;
  incrementLeadUsage(contractorId: number): Promise<void>;
}

export class D2Storage implements IStorage {
  private db: D2DatabaseService;

  constructor() {
    this.db = getDatabase();
  }

  // Contractor operations
  async getAllContractors(): Promise<Contractor[]> {
    const result = await this.db.query(`
      SELECT * FROM contractors 
      ORDER BY id ASC
    `);
    
    return result.results?.map(this.mapToContractor) || [];
  }

  async getContractor(id: number): Promise<Contractor | undefined> {
    const result = await this.db.queryFirst(`
      SELECT * FROM contractors WHERE id = ?
    `, [id]);
    
    return result ? this.mapToContractor(result) : undefined;
  }

  async createContractor(contractor: InsertContractor): Promise<Contractor> {
    const projectTypesJson = JSON.stringify(contractor.projectTypes || []);
    
    const result = await this.db.execute(`
      INSERT INTO contractors (
        name, category, description, location, address, phone, email, website,
        image_url, rating, review_count, years_experience, project_types,
        service_radius, free_estimate, licensed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      contractor.name,
      contractor.category,
      contractor.description || '',
      contractor.location || '',
      contractor.address || '',
      contractor.phone || '',
      contractor.email || '',
      contractor.website || '',
      contractor.imageUrl || '',
      contractor.rating || 0,
      contractor.reviewCount || 0,
      contractor.yearsExperience || 0,
      projectTypesJson,
      contractor.serviceRadius || 50,
      contractor.freeEstimate ? 1 : 0,
      contractor.licensed ? 1 : 0
    ]);

    const newContractor = await this.getContractor(result.meta.last_row_id as number);
    if (!newContractor) {
      throw new Error('Failed to create contractor');
    }
    return newContractor;
  }

  async updateContractor(id: number, contractor: Partial<InsertContractor>): Promise<Contractor> {
    const updates: string[] = [];
    const values: any[] = [];

    Object.entries(contractor).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'projectTypes') {
          updates.push('project_types = ?');
          values.push(JSON.stringify(value));
        } else if (key === 'imageUrl') {
          updates.push('image_url = ?');
          values.push(value);
        } else if (key === 'reviewCount') {
          updates.push('review_count = ?');
          values.push(value);
        } else if (key === 'yearsExperience') {
          updates.push('years_experience = ?');
          values.push(value);
        } else if (key === 'serviceRadius') {
          updates.push('service_radius = ?');
          values.push(value);
        } else if (key === 'freeEstimate') {
          updates.push('free_estimate = ?');
          values.push(value ? 1 : 0);
        } else if (key === 'licensed') {
          updates.push('licensed = ?');
          values.push(value ? 1 : 0);
        } else {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }
    });

    if (updates.length > 0) {
      values.push(id);
      await this.db.execute(`
        UPDATE contractors 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, values);
    }

    const updated = await this.getContractor(id);
    if (!updated) {
      throw new Error('Contractor not found after update');
    }
    return updated;
  }

  async deleteContractor(id: number): Promise<void> {
    await this.db.execute(`DELETE FROM contractors WHERE id = ?`, [id]);
  }

  async searchContractors(query: string): Promise<Contractor[]> {
    const result = await this.db.query(`
      SELECT * FROM contractors 
      WHERE name LIKE ? OR description LIKE ? OR category LIKE ?
      ORDER BY id ASC
    `, [`%${query}%`, `%${query}%`, `%${query}%`]);
    
    return result.results?.map(this.mapToContractor) || [];
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.queryFirst(`
      SELECT * FROM users WHERE id = ?
    `, [id]);
    
    return result ? this.mapToUser(result) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.queryFirst(`
      SELECT * FROM users WHERE username = ?
    `, [username]);
    
    return result ? this.mapToUser(result) : undefined;
  }

  async createUser(user: { username: string; passwordHash: string; role?: string }): Promise<User> {
    const result = await this.db.execute(`
      INSERT INTO users (username, password_hash, role)
      VALUES (?, ?, ?)
    `, [user.username, user.passwordHash, user.role || 'user']);

    const newUser = await this.getUser(result.meta.last_row_id as number);
    if (!newUser) {
      throw new Error('Failed to create user');
    }
    return newUser;
  }

  // Project type operations
  async getAllProjectTypes(): Promise<ProjectType[]> {
    const result = await this.db.query(`
      SELECT * FROM project_types ORDER BY id ASC
    `);
    
    return result.results?.map(this.mapToProjectType) || [];
  }

  // Lead operations
  async getAllLeads(): Promise<Lead[]> {
    const result = await this.db.query(`
      SELECT * FROM leads ORDER BY created_at DESC
    `);
    
    return result.results?.map(this.mapToLead) || [];
  }

  async getLeadsByContractor(contractorId: number): Promise<Lead[]> {
    const result = await this.db.query(`
      SELECT * FROM leads WHERE contractor_id = ? ORDER BY created_at DESC
    `, [contractorId]);
    
    return result.results?.map(this.mapToLead) || [];
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const result = await this.db.execute(`
      INSERT INTO leads (
        contractor_id, customer_name, customer_email, customer_phone,
        project_type, project_description, budget, timeline, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      lead.contractorId,
      lead.customerName,
      lead.customerEmail,
      lead.customerPhone || '',
      lead.projectType,
      lead.projectDescription || '',
      lead.budget || '',
      lead.timeline || '',
      lead.status || 'new'
    ]);

    const newLead = await this.db.queryFirst(`
      SELECT * FROM leads WHERE id = ?
    `, [result.meta.last_row_id]);

    if (!newLead) {
      throw new Error('Failed to create lead');
    }
    return this.mapToLead(newLead);
  }

  async updateLeadStatus(id: number, status: string): Promise<void> {
    await this.db.execute(`
      UPDATE leads SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `, [status, id]);
  }

  // Plan operations
  async getAllPlans(): Promise<Plan[]> {
    const result = await this.db.query(`
      SELECT * FROM plans ORDER BY price ASC
    `);
    
    return result.results?.map(this.mapToPlan) || [];
  }

  // Subscription operations
  async getSubscriptionWithPlan(contractorId: number): Promise<any> {
    const result = await this.db.queryFirst(`
      SELECT 
        cs.*,
        p.name as plan_name,
        p.price as plan_price,
        p.monthly_leads as plan_monthly_leads,
        p.features as plan_features
      FROM contractor_subscriptions cs
      JOIN plans p ON cs.plan_id = p.id
      WHERE cs.contractor_id = ? AND cs.status = 'active'
    `, [contractorId]);
    
    if (!result) return null;

    return {
      id: result.id,
      contractorId: result.contractor_id,
      planId: result.plan_id,
      leadsUsed: result.leads_used,
      billingCycleStart: result.billing_cycle_start,
      billingCycleEnd: result.billing_cycle_end,
      status: result.status,
      plan: {
        id: result.plan_id,
        name: result.plan_name,
        price: result.plan_price,
        monthlyLeads: result.plan_monthly_leads,
        features: JSON.parse(result.plan_features || '[]')
      }
    };
  }

  async createOrUpdateSubscription(subscription: InsertContractorSubscription): Promise<ContractorSubscription> {
    // Check if subscription exists
    const existing = await this.db.queryFirst(`
      SELECT id FROM contractor_subscriptions 
      WHERE contractor_id = ? AND status = 'active'
    `, [subscription.contractorId]);

    if (existing) {
      // Update existing
      await this.db.execute(`
        UPDATE contractor_subscriptions 
        SET plan_id = ?, billing_cycle_start = ?, billing_cycle_end = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [subscription.planId, subscription.billingCycleStart, subscription.billingCycleEnd, existing.id]);
      
      const updated = await this.db.queryFirst(`
        SELECT * FROM contractor_subscriptions WHERE id = ?
      `, [existing.id]);
      
      return this.mapToContractorSubscription(updated);
    } else {
      // Create new
      const result = await this.db.execute(`
        INSERT INTO contractor_subscriptions (
          contractor_id, plan_id, leads_used, billing_cycle_start, billing_cycle_end, status
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        subscription.contractorId,
        subscription.planId,
        subscription.leadsUsed || 0,
        subscription.billingCycleStart,
        subscription.billingCycleEnd,
        subscription.status || 'active'
      ]);

      const newSubscription = await this.db.queryFirst(`
        SELECT * FROM contractor_subscriptions WHERE id = ?
      `, [result.meta.last_row_id]);

      return this.mapToContractorSubscription(newSubscription);
    }
  }

  async incrementLeadUsage(contractorId: number): Promise<void> {
    await this.db.execute(`
      UPDATE contractor_subscriptions 
      SET leads_used = leads_used + 1, updated_at = CURRENT_TIMESTAMP
      WHERE contractor_id = ? AND status = 'active'
    `, [contractorId]);
  }

  // Mapping functions
  private mapToContractor(row: any): Contractor {
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      description: row.description,
      location: row.location,
      address: row.address,
      phone: row.phone,
      email: row.email,
      website: row.website,
      imageUrl: row.image_url,
      rating: row.rating,
      reviewCount: row.review_count,
      yearsExperience: row.years_experience,
      projectTypes: JSON.parse(row.project_types || '[]'),
      serviceRadius: row.service_radius,
      freeEstimate: Boolean(row.free_estimate),
      licensed: Boolean(row.licensed),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private mapToUser(row: any): User {
    return {
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      role: row.role,
      createdAt: new Date(row.created_at)
    };
  }

  private mapToProjectType(row: any): ProjectType {
    return {
      id: row.id,
      name: row.name,
      icon: row.icon,
      description: row.description,
      createdAt: new Date(row.created_at)
    };
  }

  private mapToLead(row: any): Lead {
    return {
      id: row.id,
      contractorId: row.contractor_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      projectType: row.project_type,
      projectDescription: row.project_description,
      budget: row.budget,
      timeline: row.timeline,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private mapToPlan(row: any): Plan {
    return {
      id: row.id,
      name: row.name,
      price: row.price,
      monthlyLeads: row.monthly_leads,
      features: JSON.parse(row.features || '[]'),
      createdAt: new Date(row.created_at)
    };
  }

  private mapToContractorSubscription(row: any): ContractorSubscription {
    return {
      id: row.id,
      contractorId: row.contractor_id,
      planId: row.plan_id,
      leadsUsed: row.leads_used,
      billingCycleStart: new Date(row.billing_cycle_start),
      billingCycleEnd: new Date(row.billing_cycle_end),
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}