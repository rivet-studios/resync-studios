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
  insertProductSchema,
  insertBanSchema,
  insertAppealSchema,
  insertAnnouncementSchema,
  type User,
} from "@shared/schema";
import { z } from "zod";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { sql } from "drizzle-orm";
import { db } from "./db";

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

  app.get("/api/reports/my", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const myReports = await storage.getUserReports(user.id);
      res.json(myReports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your reports" });
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
      const profileUpdateSchema = z.object({
        username: z.string().min(3).max(30).optional(),
        bio: z.string().max(500).optional(),
        signature: z.string().max(500).optional(),
        profileImageUrl: z.string().url().or(z.literal("")).optional(),
        dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").or(z.literal("")).optional(),
      });
      const parsed = profileUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const { username, bio, signature, profileImageUrl, dateOfBirth } = parsed.data;
      const updates: any = { updatedAt: new Date() };
      if (username !== undefined) updates.username = username;
      if (bio !== undefined) updates.bio = bio;
      if (signature !== undefined) updates.signature = signature;
      if (profileImageUrl !== undefined) updates.profileImageUrl = profileImageUrl || null;
      if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth || null;
      await storage.updateUser(userId, updates);
      res.json({ message: "Profile updated" });
    } catch (error) {
      res.status(500).json({ message: "Update failed" });
    }
  });

  app.post("/api/users/change-password", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const passwordSchema = z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
      });
      const parsed = passwordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const user = await storage.getUser(userId);
      if (!user || !user.password) {
        return res.status(400).json({ message: "Password change not available for this account type" });
      }
      if (!verifyPassword(parsed.data.currentPassword, user.password)) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      const hashedPassword = hashPassword(parsed.data.newPassword);
      await storage.updateUser(userId, { password: hashedPassword } as any);
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  app.delete("/api/users/account", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      await storage.deleteUser(userId);
      req.logout((err) => {
        if (err) return res.status(500).json({ message: "Account deleted but logout failed" });
        res.json({ message: "Account deleted" });
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Blog routes
  app.get("/api/blog", async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Blog fetch error:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:id", async (req, res) => {
    try {
      const announcement = await storage.getAnnouncement(req.params.id);
      if (!announcement) return res.status(404).json({ message: "Post not found" });
      res.json(announcement);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
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

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const prods = await storage.getProducts(status || "approved");
      const prodsWithSubmitters = await Promise.all(
        prods.map(async (p) => {
          const submitter = await storage.getUser(p.submitterId);
          return { ...p, submitter: submitter ? { id: submitter.id, username: submitter.username, userRank: submitter.userRank } : null };
        })
      );
      res.json(prodsWithSubmitters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/all", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const opsRanks = ["Operations Manager", "Company Director"];
      if (!user.isAdmin && !opsRanks.includes(user.userRank)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const prods = await storage.getProducts();
      const prodsWithSubmitters = await Promise.all(
        prods.map(async (p) => {
          const submitter = await storage.getUser(p.submitterId);
          return { ...p, submitter: submitter ? { id: submitter.id, username: submitter.username, userRank: submitter.userRank } : null };
        })
      );
      res.json(prodsWithSubmitters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/my", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const allProducts = await storage.getProducts();
      const myProducts = allProducts.filter((p) => p.submitterId === user.id);
      res.json(myProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const data = insertProductSchema.parse({
        ...req.body,
        submitterId: user.id,
      });
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.patch("/api/products/:id/review", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const opsRanks = ["Operations Manager", "Company Director"];
      if (!user.isAdmin && !opsRanks.includes(user.userRank)) {
        return res.status(403).json({ message: "Only Operations Managers can review products" });
      }
      const { status, reviewNotes } = req.body;
      if (!["approved", "denied"].includes(status)) {
        return res.status(400).json({ message: "Status must be approved or denied" });
      }
      const updates: any = {
        status,
        reviewedBy: user.id,
        reviewNotes: reviewNotes || null,
      };
      if (status === "approved") {
        updates.isCommunityProvided = true;
      }
      const product = await storage.updateProduct(req.params.id, updates);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Review failed" });
    }
  });

  app.patch("/api/products/:id/badges", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const opsRanks = ["Operations Manager", "Company Director"];
      if (!user.isAdmin && !opsRanks.includes(user.userRank)) {
        return res.status(403).json({ message: "Only Operations Managers can assign badges" });
      }
      const { isFeatured, isLimitedEdition, isVerified, isCommunityProvided } = req.body;
      const updates: any = {};
      if (typeof isFeatured === "boolean") updates.isFeatured = isFeatured;
      if (typeof isLimitedEdition === "boolean") updates.isLimitedEdition = isLimitedEdition;
      if (typeof isVerified === "boolean") updates.isVerified = isVerified;
      if (typeof isCommunityProvided === "boolean") updates.isCommunityProvided = isCommunityProvided;
      const product = await storage.updateProduct(req.params.id, updates);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Badge update failed" });
    }
  });

  // Ban routes
  app.get("/api/bans", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const staffRanks = [
        "Community Moderator", "Community Senior Moderator", "Community Administrator",
        "Community Senior Administrator", "Community Developer", "Staff Internal Affairs",
        "Company Representative", "Team Member", "MI Trust & Safety Director",
        "Staff Department Director", "Operations Manager", "Company Director",
      ];
      if (!user.isAdmin && !user.isModerator && !staffRanks.includes(user.userRank)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const activeOnly = req.query.active === "true";
      const banList = await storage.getBans(activeOnly);
      const bansWithUsers = await Promise.all(
        banList.map(async (b) => {
          const bannedUser = await storage.getUser(b.userId);
          const bannedByUser = await storage.getUser(b.bannedBy);
          return {
            ...b,
            user: bannedUser ? { id: bannedUser.id, username: bannedUser.username } : null,
            bannedByUser: bannedByUser ? { id: bannedByUser.id, username: bannedByUser.username } : null,
          };
        })
      );
      res.json(bansWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bans" });
    }
  });

  app.post("/api/bans", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const staffRanks = [
        "Community Moderator", "Community Senior Moderator", "Community Administrator",
        "Community Senior Administrator", "Community Developer", "Staff Internal Affairs",
        "Company Representative", "Team Member", "MI Trust & Safety Director",
        "Staff Department Director", "Operations Manager", "Company Director",
      ];
      if (!user.isAdmin && !user.isModerator && !staffRanks.includes(user.userRank)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const data = insertBanSchema.parse({
        ...req.body,
        bannedBy: user.id,
      });
      const ban = await storage.createBan(data);
      res.status(201).json(ban);
    } catch (error) {
      res.status(400).json({ message: "Invalid ban data" });
    }
  });

  app.delete("/api/bans/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const staffRanks = [
        "Community Moderator", "Community Senior Moderator", "Community Administrator",
        "Community Senior Administrator", "Community Developer", "Staff Internal Affairs",
        "Company Representative", "Team Member", "MI Trust & Safety Director",
        "Staff Department Director", "Operations Manager", "Company Director",
      ];
      if (!user.isAdmin && !user.isModerator && !staffRanks.includes(user.userRank)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const ban = await storage.deactivateBan(req.params.id);
      if (!ban) return res.status(404).json({ message: "Ban not found" });
      res.json({ message: "Ban lifted", ban });
    } catch (error) {
      res.status(500).json({ message: "Failed to lift ban" });
    }
  });

  // Appeal routes
  app.get("/api/appeals", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const staffRanks = [
        "Appeal Analyst", "Appeals Moderator", "Community Moderator",
        "Community Senior Moderator", "Community Administrator",
        "Community Senior Administrator", "Community Developer",
        "Staff Internal Affairs", "Company Representative", "Team Member",
        "MI Trust & Safety Director", "Staff Department Director",
        "Operations Manager", "Company Director",
      ];
      if (!user.isAdmin && !user.isModerator && !staffRanks.includes(user.userRank)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const status = req.query.status as string | undefined;
      const appealList = await storage.getAppeals(status);
      const appealsWithUsers = await Promise.all(
        appealList.map(async (a) => {
          const appellant = await storage.getUser(a.userId);
          return {
            ...a,
            user: appellant ? { id: appellant.id, username: appellant.username, email: appellant.email } : null,
          };
        })
      );
      res.json(appealsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appeals" });
    }
  });

  app.get("/api/appeals/my", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const myAppeals = await storage.getUserAppeals(user.id);
      res.json(myAppeals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appeals" });
    }
  });

  app.post("/api/appeals", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const data = insertAppealSchema.parse({
        ...req.body,
        userId: user.id,
      });
      const appeal = await storage.createAppeal(data);
      res.status(201).json(appeal);
    } catch (error) {
      res.status(400).json({ message: "Invalid appeal data" });
    }
  });

  app.patch("/api/appeals/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const staffRanks = [
        "Appeal Analyst", "Appeals Moderator", "Community Moderator",
        "Community Senior Moderator", "Community Administrator",
        "Community Senior Administrator", "Community Developer",
        "Staff Internal Affairs", "Company Representative", "Team Member",
        "MI Trust & Safety Director", "Staff Department Director",
        "Operations Manager", "Company Director",
      ];
      if (!user.isAdmin && !user.isModerator && !staffRanks.includes(user.userRank)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { status, reviewNotes } = req.body;
      if (!["approved", "denied"].includes(status)) {
        return res.status(400).json({ message: "Status must be approved or denied" });
      }
      const appeal = await storage.getAppeal(req.params.id);
      if (!appeal) return res.status(404).json({ message: "Appeal not found" });

      const updated = await storage.updateAppeal(req.params.id, {
        status: status as any,
        reviewedBy: user.id,
        reviewNotes,
      });

      if (status === "approved" && appeal.banId) {
        await storage.deactivateBan(appeal.banId);
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Appeal update failed" });
    }
  });

  // Report status update route
  app.patch("/api/reports/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const staffRanks = [
        "Report Analyst", "Community Moderator", "Community Senior Moderator",
        "Community Administrator", "Community Senior Administrator",
        "Community Developer", "Staff Internal Affairs", "Company Representative",
        "Team Member", "MI Trust & Safety Director", "Staff Department Director",
        "Operations Manager", "Company Director",
      ];
      if (!user.isAdmin && !user.isModerator && !staffRanks.includes(user.userRank)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { status, moderatorNotes } = req.body;
      const report = await storage.updateReportStatus(req.params.id, status, moderatorNotes);
      if (!report) return res.status(404).json({ message: "Report not found" });
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Report update failed" });
    }
  });

  // User bans check (public for banned users to see their status)
  app.get("/api/bans/my", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const userBans = await storage.getUserBans(user.id);
      res.json(userBans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bans" });
    }
  });

  // ---- Stripe Payment Routes ----

  app.get("/api/admin/stats", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (!user?.isAdmin && !user?.email?.toLowerCase().endsWith("@resyncstudios.com")) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/activity", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (!user?.isAdmin && !user?.isModerator && !user?.email?.toLowerCase().endsWith("@resyncstudios.com")) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const activity = await storage.getRecentActivity(20);
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  app.patch("/api/admin/site-settings", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (!user?.isAdmin && !user?.email?.toLowerCase().endsWith("@resyncstudios.com")) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { isOffline, offlineMessage } = req.body;
      const settings = await storage.updateSiteSettings({ isOffline, offlineMessage });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  app.get("/api/admin/site-settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch("/api/admin/users/:id/rank", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (!user?.isAdmin && !user?.email?.toLowerCase().endsWith("@resyncstudios.com")) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { userRank } = req.body;
      await storage.updateUserRank(req.params.id, userRank);
      const updatedUser = await storage.getUser(req.params.id);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update rank" });
    }
  });

  app.get("/api/payments/my", requireAuth, async (req, res) => {
    try {
      const payments = await storage.getUserPayments((req.user as any).id);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.get("/api/stripe/publishable-key", async (_req, res) => {
    try {
      const key = await getStripePublishableKey();
      res.json({ publishableKey: key });
    } catch (error) {
      res.status(500).json({ message: "Failed to get Stripe key" });
    }
  });

  app.get("/api/stripe/products", async (_req, res) => {
    try {
      const result = await db.execute(
        sql`SELECT p.id, p.name, p.description, p.metadata, p.active,
            pr.id as price_id, pr.unit_amount, pr.currency, pr.recurring, pr.active as price_active
            FROM stripe.products p
            LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
            WHERE p.active = true
            ORDER BY p.name, pr.unit_amount`
      );
      const productsMap = new Map();
      for (const row of result.rows as any[]) {
        if (!productsMap.has(row.id)) {
          productsMap.set(row.id, {
            id: row.id,
            name: row.name,
            description: row.description,
            metadata: row.metadata,
            active: row.active,
            prices: [],
          });
        }
        if (row.price_id) {
          productsMap.get(row.id).prices.push({
            id: row.price_id,
            unit_amount: row.unit_amount,
            currency: row.currency,
            recurring: row.recurring,
            active: row.price_active,
          });
        }
      }
      res.json(Array.from(productsMap.values()));
    } catch (error: any) {
      console.error("Stripe products query error:", error.message);
      res.json([]);
    }
  });

  app.post("/api/stripe/checkout", requireAuth, async (req, res) => {
    try {
      const stripe = await getUncachableStripeClient();
      const user = await storage.getUser((req.user as any).id);
      if (!user) return res.status(401).json({ message: "User not found" });

      const { priceId } = req.body;
      if (!priceId) return res.status(400).json({ message: "priceId is required" });

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: { userId: user.id },
        });
        await storage.updateUser(user.id, { stripeCustomerId: customer.id } as any);
        customerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${req.protocol}://${req.get('host')}/settings?tab=payments&success=true`,
        cancel_url: `${req.protocol}://${req.get('host')}/settings?tab=payments&cancelled=true`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Checkout error:", error.message);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.post("/api/stripe/portal", requireAuth, async (req, res) => {
    try {
      const stripe = await getUncachableStripeClient();
      const user = await storage.getUser((req.user as any).id);
      if (!user?.stripeCustomerId) {
        return res.status(400).json({ message: "No Stripe customer found" });
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${req.protocol}://${req.get('host')}/settings?tab=payments`,
      });

      res.json({ url: portalSession.url });
    } catch (error: any) {
      console.error("Portal error:", error.message);
      res.status(500).json({ message: "Failed to create portal session" });
    }
  });

  app.get("/api/stripe/subscription", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (!user?.stripeSubscriptionId) {
        return res.json({ subscription: null });
      }
      const result = await db.execute(
        sql`SELECT * FROM stripe.subscriptions WHERE id = ${user.stripeSubscriptionId}`
      );
      res.json({ subscription: result.rows[0] || null });
    } catch (error) {
      res.json({ subscription: null });
    }
  });

  return httpServer;
}
