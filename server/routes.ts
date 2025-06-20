import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
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
