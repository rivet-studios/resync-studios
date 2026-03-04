import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "./auth";
import { hashPassword, verifyPassword } from "./auth-utils";
import { updateDiscordNickname } from "./discord-bot";
import {
  insertGroupSchema,
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

      const isStaffEmail = email.toLowerCase().endsWith("@resyncstudios.com");
      const defaultRank = isStaffEmail ? "Team Member" : "Member";
      const isAdmin = isStaffEmail;
      const isModerator = isStaffEmail;

      const user = await storage.upsertUser({
        email,
        username,
        password: hashedPassword,
        userRank: defaultRank,
        vipTier: "none",
        isAdmin,
        isModerator,
        additionalRanks: isStaffEmail
          ? ["Team Member", "Staff Internal Affairs", "Community Developer"]
          : [],
      } as any);

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({
            message:
              "Signup successful but login failed. Please try logging in manually.",
          });
        }
        res.json(user);
      });
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

      // Auto-assign Team Member rank if email matches domain
      if (
        user.email.toLowerCase().endsWith("@resyncstudios.com") &&
        user.userRank === "Member"
      ) {
        await storage.updateUserRank(user.id, "Team Member");
        user.userRank = "Team Member";
        // Also ensure staff internal affairs and community developer are in additional ranks
        const currentAdditional = user.additionalRanks || [];
        if (!currentAdditional.includes("Staff Internal Affairs"))
          currentAdditional.push("Staff Internal Affairs");
        if (!currentAdditional.includes("Community Developer"))
          currentAdditional.push("Community Developer");
        await storage.updateUserAdditionalRanks(user.id, currentAdditional);
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
      const staffRanks = [
        "Team Member",
        "Operations Manager",
        "Company Director",
        "MI Trust & Safety Director",
        "Community Moderator",
        "Community Senior Moderator",
        "Community Administrator",
        "Community Senior Administrator",
        "RS Trust & Safety Team",
      ];
      const isStaff =
        user.isAdmin ||
        user.isModerator ||
        staffRanks.includes(user.userRank) ||
        (user.additionalRanks || []).some((r: string) =>
          staffRanks.includes(r),
        );

      if (!isStaff) return res.status(403).json({ message: "Forbidden" });
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Fetch reports failed. Contact support for help." });
    }
  });

  app.get("/api/admin/users", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const adminRanks = [
        "Company Representative",
        "Staff Internal Affairs",
        "Staff Department Director",
        "Team Member",
        "Operations Manager",
        "Company Director",
        "MI Trust & Safety Director",
      ];
      const hasAccess =
        user.email?.endsWith("@resyncstudios.com") ||
        adminRanks.includes(user.userRank) ||
        (user.additionalRanks || []).some((r: string) =>
          adminRanks.includes(r),
        );

      if (!hasAccess) return res.status(403).json({ message: "Forbidden" });
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/search-users", requireAuth, async (req, res) => {
    try {
      const { q } = req.query;
      const allUsers = await storage.getAllUsers();
      const filtered = allUsers.filter(
        (u) =>
          u.username?.toLowerCase().includes((q as string).toLowerCase()) ||
          u.email?.toLowerCase().includes((q as string).toLowerCase()),
      );
      res.json(filtered);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  app.post("/api/admin/assign-rank", requireAuth, async (req, res) => {
    try {
      const { userId, rank } = req.body;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const currentRanks = user.additionalRanks || [];
      if (!currentRanks.includes(rank)) {
        await storage.updateUser(userId, {
          additionalRanks: [...currentRanks, rank],
        });
      }
      res.json({ message: "Rank assigned" });
    } catch (error) {
      res.status(500).json({ message: "Failed to assign rank" });
    }
  });

  // Groups (formerly clans)
  app.get("/api/groups", async (req, res) =>
    res.json(await storage.getGroups()),
  );
  app.post("/api/groups", requireAuth, async (req, res) => {
    try {
      const data = insertGroupSchema.parse({
        ...req.body,
        ownerId: (req.user as any).id,
      });
      res.status(201).json(await storage.createGroup(data));
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

  // Forum Categories
  app.get("/api/forums/categories", async (req, res) => {
    try {
      const categories = await storage.getForumCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Forum Threads
  app.get("/api/forums/threads", async (req, res) => {
    try {
      const { categoryId } = req.query;
      const threads = await storage.getForumThreads(categoryId as string);

      // Fetch authors and categories for each thread
      const threadsWithExtras = await Promise.all(
        threads.map(async (thread) => {
          const author = await storage.getUser(thread.authorId);
          const category = await storage.getForumCategory(thread.categoryId);
          return { ...thread, author, category };
        }),
      );

      res.json(threadsWithExtras);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch threads" });
    }
  });

  app.post("/api/forums/threads", requireAuth, async (req, res) => {
    try {
      const data = insertForumThreadSchema.parse({
        ...req.body,
        authorId: (req.user as any).id,
      });
      const thread = await storage.createForumThread(data);
      res.status(201).json(thread);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.get("/api/forums/threads/:id", async (req, res) => {
    try {
      const thread = await storage.getForumThread(req.params.id);
      if (!thread) return res.status(404).json({ message: "Thread not found" });

      const author = await storage.getUser(thread.authorId);
      const category = await storage.getForumCategory(thread.categoryId);
      const replies = await storage.getForumReplies(req.params.id);
      const repliesWithAuthors = await Promise.all(
        replies.map(async (reply) => {
          const replyAuthor = await storage.getUser(reply.authorId);
          return { ...reply, author: replyAuthor };
        }),
      );

      res.json({ ...thread, author, category, replies: repliesWithAuthors });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch thread" });
    }
  });

  // Forum Replies
  app.get("/api/forums/threads/:id/replies", async (req, res) => {
    try {
      const replies = await storage.getForumReplies(req.params.id);
      const repliesWithAuthors = await Promise.all(
        replies.map(async (reply) => {
          const author = await storage.getUser(reply.authorId);
          return { ...reply, author };
        }),
      );
      res.json(repliesWithAuthors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch replies" });
    }
  });

  app.post("/api/forums/threads/:id/replies", requireAuth, async (req, res) => {
    try {
      const data = insertForumReplySchema.parse({
        ...req.body,
        threadId: req.params.id,
        authorId: (req.user as any).id,
      });
      const reply = await storage.createForumReply(data);
      res.status(201).json(reply);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.post("/api/admin/set-user-password", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user.isAdmin) return res.status(403).json({ message: "Forbidden" });

      const { userId, password } = req.body;
      const hashedPassword = hashPassword(password);
      await storage.updateUser(userId, { password: hashedPassword });
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to set password" });
    }
  });

  app.post("/api/admin/assign-subscription", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user.isAdmin) return res.status(403).json({ message: "Forbidden" });

      const { targetUsername, vipTier } = req.body;
      const targetUser = await storage.getUserByUsername(targetUsername);
      if (!targetUser) return res.status(404).json({ message: "User not found" });

      await storage.updateUser(targetUser.id, { vipTier: vipTier as any });
      res.json({ message: "Subscription assigned successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to assign subscription" });
    }
  });

  app.post("/api/admin/announcements", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user.isAdmin) return res.status(403).json({ message: "Forbidden" });

      const data = insertAnnouncementSchema.parse({
        ...req.body,
        authorId: user.id,
      });
      const announcement = await storage.createAnnouncement(data);
      res.status(201).json(announcement);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.delete("/api/admin/announcements/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user.isAdmin) return res.status(403).json({ message: "Forbidden" });

      await storage.deleteAnnouncement(req.params.id);
      res.json({ message: "Announcement deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  app.get("/api/auth/discord", passport.authenticate("discord"));
  app.get(
    "/api/auth/discord/callback",
    passport.authenticate("discord", { failureRedirect: "/login" }),
    (req, res) => {
      res.redirect("/onboarding");
    },
  );

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out" });
    });
  });

  app.patch("/api/users/profile", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { username, bio, signature } = req.body;
      await storage.updateUser(userId, {
        username,
        bio,
        signature,
        updatedAt: new Date(),
      } as any);
      res.json({ message: "Profile updated" });
    } catch (error) {
      res.status(500).json({ message: "Update failed" });
    }
  });

  // Blog routes
  app.get("/api/blog", async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.post("/api/blog", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const adminRanks = [
        "Team Member",
        "Operations Manager",
        "Company Director",
      ];
      const hasAccess =
        user.isAdmin || adminRanks.includes(user.userRank);

      if (!hasAccess) return res.status(403).json({ message: "Forbidden" });

      const data = insertAnnouncementSchema.parse({
        ...req.body,
        authorId: user.id,
        isPublished: true,
      });
      const post = await storage.createAnnouncement(data);
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  return httpServer;
}
