import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { insertContractorSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.session && req.session.authenticated) {
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  };

  // Authentication routes
  app.post('/api/auth/login', (req: any, res) => {
    const { username, password } = req.body;
    
    // Simple demo credentials
    if (username === 'admin' && password === 'password123') {
      req.session.authenticated = true;
      req.session.user = { username: 'admin' };
      res.json({ success: true, user: { username: 'admin' } });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });

  app.post('/api/auth/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        res.status(500).json({ message: 'Could not log out' });
      } else {
        res.json({ success: true });
      }
    });
  });

  app.get('/api/auth/user', requireAuth, (req: any, res) => {
    res.json(req.session.user);
  });

  // Get all contractors
  app.get("/api/contractors", async (req, res) => {
    try {
      const { category, location, search, radius } = req.query;
      
      let contractors = await storage.getAllContractors();

      // Apply filters
      if (category && typeof category === 'string') {
        contractors = await storage.getContractorsByCategory(category);
      }

      if (location && typeof location === 'string') {
        const radiusNum = radius ? parseInt(radius as string) : undefined;
        const locationFiltered = await storage.getContractorsByLocation(location, radiusNum);
        contractors = category ? 
          contractors.filter(c => locationFiltered.some(lc => lc.id === c.id)) :
          locationFiltered;
      }

      if (search && typeof search === 'string') {
        const searchFiltered = await storage.searchContractors(search);
        contractors = contractors.filter(c => searchFiltered.some(sc => sc.id === c.id));
      }

      res.json(contractors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contractors" });
    }
  });

  // Get contractor by ID
  app.get("/api/contractors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contractor = await storage.getContractor(id);
      
      if (!contractor) {
        return res.status(404).json({ message: "Contractor not found" });
      }

      res.json(contractor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contractor" });
    }
  });

  // Get all project types
  app.get("/api/project-types", async (req, res) => {
    try {
      const projectTypes = await storage.getAllProjectTypes();
      res.json(projectTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project types" });
    }
  });

  // Get reviews for a contractor
  app.get("/api/contractors/:id/reviews", async (req, res) => {
    try {
      const contractorId = parseInt(req.params.id);
      const reviews = await storage.getReviewsByContractor(contractorId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Create contractor
  app.post("/api/contractors", async (req, res) => {
    try {
      const validatedData = insertContractorSchema.parse(req.body);
      const contractor = await storage.createContractor(validatedData);
      res.status(201).json(contractor);
    } catch (error) {
      console.error("Error creating contractor:", error);
      res.status(400).json({ message: "Invalid contractor data" });
    }
  });

  // Update contractor
  app.put("/api/contractors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertContractorSchema.parse(req.body);
      
      const existingContractor = await storage.getContractor(id);
      if (!existingContractor) {
        return res.status(404).json({ message: "Contractor not found" });
      }

      const updatedContractor = await storage.updateContractor(id, validatedData);
      res.json(updatedContractor);
    } catch (error) {
      console.error("Error updating contractor:", error);
      res.status(400).json({ message: "Invalid contractor data" });
    }
  });

  // Delete contractor
  app.delete("/api/contractors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contractor = await storage.getContractor(id);
      
      if (!contractor) {
        return res.status(404).json({ message: "Contractor not found" });
      }

      await storage.deleteContractor(id);
      res.json({ message: "Contractor deleted successfully" });
    } catch (error) {
      console.error("Error deleting contractor:", error);
      res.status(500).json({ message: "Failed to delete contractor" });
    }
  });

  // Mock send message endpoint
  app.post("/api/contractors/:id/message", async (req, res) => {
    try {
      const contractorId = parseInt(req.params.id);
      const { name, email, phone, message } = req.body;

      // Validate contractor exists
      const contractor = await storage.getContractor(contractorId);
      if (!contractor) {
        return res.status(404).json({ message: "Contractor not found" });
      }

      // In a real app, this would send an email or store the message
      // For now, just return success
      res.json({ 
        message: "Message sent successfully", 
        contractorName: contractor.name 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
