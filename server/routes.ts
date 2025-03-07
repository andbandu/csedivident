import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertDividendSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Middleware to check if user is admin
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).send("Admin access required");
    }
    next();
  };

  // Public routes
  app.get("/api/dividends", async (_req, res) => {
    const dividends = await storage.getAllDividends();
    res.json(dividends);
  });

  // Admin routes
  app.post("/api/dividends", requireAdmin, async (req, res) => {
    const result = insertDividendSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }
    const dividend = await storage.createDividend(result.data);
    res.status(201).json(dividend);
  });

  app.patch("/api/dividends/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const result = insertDividendSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }
    const dividend = await storage.updateDividend(id, result.data);
    res.json(dividend);
  });

  app.delete("/api/dividends/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteDividend(id);
    res.sendStatus(204);
  });

  const httpServer = createServer(app);
  return httpServer;
}
