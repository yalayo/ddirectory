import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { insertContractorSchema } from "@shared/schema";
import { scrapeHouzzContractors } from "./scraper";

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
  app.post('/api/auth/login', async (req: any, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      // Authenticate user with database
      const user = await storage.authenticateUser(username, password);
      
      if (user) {
        req.session.authenticated = true;
        req.session.user = { 
          id: user.id,
          username: user.username,
          role: user.role 
        };
        res.json({ 
          success: true, 
          user: { 
            id: user.id,
            username: user.username,
            role: user.role 
          } 
        });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
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

  // Create admin user endpoint (for development)
  app.post('/api/auth/create-admin', async (req: any, res) => {
    try {
      const user = await storage.createHashedUser('admin', 'password123', 'manager');
      res.json({ success: true, message: 'Admin user created', userId: user.id });
    } catch (error: any) {
      if (error.message?.includes('duplicate')) {
        res.status(400).json({ message: 'Admin user already exists' });
      } else {
        console.error('Error creating admin user:', error);
        res.status(500).json({ message: 'Failed to create admin user' });
      }
    }
  });

  // Get all contractors
  app.get("/api/contractors", async (req, res) => {
    try {
      const { category, location, search, radius } = req.query;
      
      let contractors = await storage.getAllContractors();

      // Apply category filters (support multiple categories)
      if (category) {
        const categories = Array.isArray(category) ? category : [category];
        const categoryFiltered: any[] = [];
        
        for (const cat of categories) {
          if (typeof cat === 'string') {
            const catContractors = await storage.getContractorsByCategory(cat);
            categoryFiltered.push(...catContractors);
          }
        }
        
        // Remove duplicates based on ID
        contractors = categoryFiltered.filter((contractor, index, self) => 
          index === self.findIndex(c => c.id === contractor.id)
        );
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

  // Scraper endpoint for admin users
  app.post("/api/contractors/scrape", async (req: any, res) => {
    try {
      // Check if user is logged in (for now, allow any authenticated session)
      if (!req.session?.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = req.session.user;
      if (user.role !== 'manager') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const scrapedContractors = await scrapeHouzzContractors();
      let addedCount = 0;

      for (const contractorData of scrapedContractors) {
        try {
          await storage.createContractor(contractorData);
          addedCount++;
        } catch (error) {
          console.log(`Skipped duplicate contractor: ${contractorData.name}`);
        }
      }

      res.json({ 
        success: true, 
        count: addedCount,
        total: scrapedContractors.length,
        message: `Successfully added ${addedCount} new contractors from Houzz`
      });
    } catch (error) {
      console.error("Error scraping contractors:", error);
      res.status(500).json({ message: "Failed to scrape contractors" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
