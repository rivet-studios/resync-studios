import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "./auth";
import { hashPassword, verifyPassword } from "./auth-utils";
import { updateDiscordNickname } from "./discord-bot";
import {
  insertClanSchema,
  insertBuildSchema,
  insertForumThreadSchema,
  insertForumReplySchema,
  insertReportSchema,
  type User,
} from "@shared/schema";
import { z } from "zod";

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (
    !((req as any).isAuthenticated && (req as any).isAuthenticated()) ||
    !req.user
  ) {
    return res
      .status(401)
      .json({ message: "Unauthorized. Contact support for help." });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Auth routes
  app.get("/api/auth/user", async (req, res) => {
    if (!(req as any).isAuthenticated?.() || !req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Contact support for help." });
    }
    const user = await storage.getUser((req.user as any).id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Contact support for help." });
    }
    const { password, ...userWithoutPassword } = user as any;
    res.json(userWithoutPassword);
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const hashedPassword = hashPassword(password);
      const user = await storage.upsertUser({
        email,
        username,
        password: hashedPassword,
        userRank: "member",
        vipTier: "none",
      });
      res.json(user);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Signup failed. Contact support for help." });
    }
  });

  app.post("/api/auth/email-login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password || !verifyPassword(password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Session failed. Contact support for help." });
        const { password, ...userWithoutPassword } = user as any;
        res.json(userWithoutPassword);
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Login failed. Contact support for help." });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const { search } = req.query;
      const allUsers = await storage.getAllUsers();
      if (search) {
        const filtered = allUsers.filter((u) =>
          u.username?.toLowerCase().includes((search as string).toLowerCase()),
        );
        return res.json(filtered);
      }
      res.json(allUsers);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch users. Contact support for help." });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Fetch user failed. Contact support for help." });
    }
  });

  app.post("/api/reports", requireAuth, async (req, res) => {
    try {
      const data = insertReportSchema.parse({
        ...req.body,
        reporterId: (req.user as any).id,
      });
      const report = await storage.createReport(data);
      res.status(201).json(report);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Invalid data. Contact support for help." });
    }
  });

  app.get("/api/reports", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user.isModerator && !user.isAdmin)
        return res.status(403).json({ message: "Forbidden" });
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Fetch reports failed. Contact support for help." });
    }
  });

  // Clans
  app.get("/api/clans", async (req, res) => res.json(await storage.getClans()));
  app.post("/api/clans", requireAuth, async (req, res) => {
    try {
      const data = insertClanSchema.parse({
        ...req.body,
        ownerId: (req.user as any).id,
      });
      res.status(201).json(await storage.createClan(data));
    } catch (error) {
      res
        .status(400)
        .json({ message: "Invalid data. Contact support for help." });
    }
  });

  // Builds
  app.get("/api/builds", async (req, res) =>
    res.json(await storage.getBuilds()),
  );
  app.post("/api/builds", requireAuth, async (req, res) => {
    try {
      const data = insertBuildSchema.parse({
        ...req.body,
        authorId: (req.user as any).id,
      });
      res.status(201).json(await storage.createBuild(data));
    } catch (error) {
      res
        .status(400)
        .json({ message: "Invalid data. Contact support for help." });
    }
  });

  // Forums
  app.get("/api/forums/categories", async (req, res) =>
    res.json(await storage.getForumCategories()),
  );
  app.get("/api/forums/categories/:id", async (req, res) => {
    const category = await storage.getForumCategory(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json(category);
  });
  app.get("/api/forums/threads", async (req, res) => {
    const categoryId = req.query.categoryId as string;
    const threads = await storage.getForumThreads(categoryId);
    // In a real app we'd join with users, but here we'll map if needed or assume storage does it
    // For now, let's just return the threads. If the frontend expects author, we might need a join.
    res.json(threads);
  });
  app.post("/api/forums/threads", requireAuth, async (req, res) => {
    try {
      const data = insertForumThreadSchema.parse({
        ...req.body,
        authorId: (req.user as any).id,
      });
      res.status(201).json(await storage.createForumThread(data));
    } catch (error) {
      res
        .status(400)
        .json({ message: "Invalid data. Contact support for help." });
    }
  });

  return httpServer;
}
