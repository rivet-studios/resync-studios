import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "./auth";
import { hashPassword, verifyPassword } from "./auth-utils";
import { updateDiscordNickname, updateDiscordRoles } from "./discord-bot";
import {
  insertForumThreadSchema,
  insertForumReplySchema,
  insertReportSchema,
  insertProductSchema,
  insertBanSchema,
  insertAppealSchema,
  insertAnnouncementSchema,
  users,
  forumThreads,
  type User,
} from "@shared/schema";
import { z } from "zod";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { sql } from "drizzle-orm";
import { db } from "./db";

function getBaseUrl(req: Request): string {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  return `${req.protocol}://${req.get('host')}`;
}

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
      const defaultRank = isStaffEmail ? "Team Member" : "Active Members";
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
          ? ["Team Member", "Staff Internal Affairs", "Developer"]
          : [],
      } as any);

      req.login(user as Express.User, (err) => {
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
        user.email?.toLowerCase().endsWith("@resyncstudios.com") &&
        user.userRank === "Active Members"
      ) {
        await storage.updateUserRank(user.id, "Team Member");
        user.userRank = "Team Member";
        // Also ensure staff internal affairs and community developer are in additional ranks
        const currentAdditional = user.additionalRanks || [];
        if (!currentAdditional.includes("Staff Internal Affairs"))
          currentAdditional.push("Staff Internal Affairs");
        if (!currentAdditional.includes("Developer"))
          currentAdditional.push("Developer");
        await storage.updateUserAdditionalRanks(user.id, currentAdditional);
      }

      req.login(user as Express.User, (err) => {
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
        "Trial Moderator",
        "Moderator",
        "Administrator",
        "Senior Administrator",
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
        "Staff Internal Affairs",
        "Staff Department Director",
        "Team Member",
        "Operations Manager",
        "Company Director",
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
      const posts = await storage.getAnnouncements();
      const postsWithAuthors = await Promise.all(
        posts.map(async (post) => {
          const author = await storage.getUser(post.authorId);
          return {
            ...post,
            author: author ? { id: author.id, username: author.username, userRank: author.userRank, profileImageUrl: author.profileImageUrl } : null,
          };
        })
      );
      res.json(postsWithAuthors);
    } catch (error) {
      console.error("Blog fetch error:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:id", async (req, res) => {
    try {
      const announcement = await storage.getAnnouncement(req.params.id);
      if (!announcement) return res.status(404).json({ message: "Post not found" });
      const author = await storage.getUser(announcement.authorId);
      res.json({
        ...announcement,
        author: author ? { id: author.id, username: author.username, userRank: author.userRank, profileImageUrl: author.profileImageUrl } : null,
      });
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
      const prods = await storage.getProducts(status || "Approved");
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
      if (!["Approved", "Denied"].includes(status)) {
        return res.status(400).json({ message: "Status must be approved or denied" });
      }
      const updates: any = {
        status,
        reviewedBy: user.id,
        reviewNotes: reviewNotes || null,
      };
      if (status === "Approved") {
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
        "Trial Moderator", "Moderator", "Administrator",
        "Senior Administrator", "Developer", "Staff Internal Affairs", "Team Member",
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
        "Trial Moderator", "Moderator", "Administrator",
        "Senior Administrator", "Developer", "Staff Internal Affairs", "Team Member",
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
        "Trial Moderator", "Moderator", "Administrator",
        "Senior Administrator", "Developer", "Staff Internal Affairs", "Team Member",
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
        "Appeals Moderator", "Trial Moderator", "Moderator", "Administrator",
        "Senior Administrator", "Developer", "Staff Internal Affairs", "Team Member",
        "Staff Department Director", "Operations Manager", "Company Director",
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
       "Appeals Moderator", "Trial Moderator", "Moderator", "Administrator",
        "Senior Administrator", "Developer", "Staff Internal Affairs", "Team Member",
        "Staff Department Director", "Operations Manager", "Company Director",
      ];
      if (!user.isAdmin && !user.isModerator && !staffRanks.includes(user.userRank)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { status, reviewNotes } = req.body;
      if (!["Approved", "Denied"].includes(status)) {
        return res.status(400).json({ message: "Status must be approved or denied" });
      }
      const appeal = await storage.getAppeal(req.params.id);
      if (!appeal) return res.status(404).json({ message: "Appeal not found" });

      const updated = await storage.updateAppeal(req.params.id, {
        status: status as any,
        reviewedBy: user.id,
        reviewNotes,
      });

      if (status === "Approved" && appeal.banId) {
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
"Trial Moderator", "Moderator", "Administrator",
        "Senior Administrator", "Developer", "Staff Internal Affairs", "Team Member",
        "Staff Department Director", "Operations Manager", "Company Director",
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

  app.get("/api/policies", async (_req, res) => {
    try {
      const allPolicies = await storage.getPolicies();
      res.json(allPolicies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch policies" });
    }
  });

  app.get("/api/policies/:slug", async (req, res) => {
    try {
      const policy = await storage.getPolicy(req.params.slug);
      if (!policy) return res.status(404).json({ message: "Policy not found" });
      res.json(policy);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch policy" });
    }
  });

  app.put("/api/policies/:slug", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      const opsRanks = ["Operations Manager", "Company Director"];
      const hasAccess =
        user?.isAdmin ||
        opsRanks.includes(user?.userRank || "") ||
        (user?.additionalRanks || []).some((r: string) => opsRanks.includes(r)) ||
        user?.email?.toLowerCase().endsWith("@resyncstudios.com");
      if (!hasAccess) {
        return res.status(403).json({ message: "Only Operations Managers can update policies" });
      }
      const { title, content } = req.body;
      if (!title || !content) {
        return res.status(400).json({ message: "Title and content are required" });
      }
      const policy = await storage.upsertPolicy(
        req.params.slug,
        title,
        content,
        user!.id
      );
      res.json(policy);
    } catch (error) {
      res.status(500).json({ message: "Failed to update policy" });
    }
  });

  app.patch("/api/admin/users/:id/rank", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (!user?.isAdmin && !user?.email?.toLowerCase().endsWith("@resyncstudios.com")) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { userRank } = req.body;
      const targetUser = await storage.getUser(req.params.id);
      const oldRank = targetUser?.userRank || undefined;
      await storage.updateUserRank(req.params.id, userRank);
      const updatedUser = await storage.getUser(req.params.id);

      if (updatedUser?.discordId) {
        updateDiscordRoles(updatedUser.discordId, userRank, oldRank).catch((err) =>
          console.error("Discord role sync error:", err)
        );
        if (updatedUser.username) {
          updateDiscordNickname(updatedUser.discordId, updatedUser.username).catch((err) =>
            console.error("Discord nickname sync error:", err)
          );
        }
      }

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
      if (!priceId || typeof priceId !== "string") {
        return res.status(400).json({ message: "A valid priceId is required" });
      }

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
        success_url: `${getBaseUrl(req)}/settings?tab=payments&success=true`,
        cancel_url: `${getBaseUrl(req)}/settings?tab=payments&cancelled=true`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Checkout error:", {
        message: error.message,
        type: error.type,
        code: error.code,
        statusCode: error.statusCode,
        stack: error.stack,
      });
      const statusCode = error.statusCode || 500;
      const userMessage = error.type === "StripeCardError"
        ? error.message
        : error.type === "StripeInvalidRequestError"
          ? `Invalid request: ${error.message}`
          : "Failed to create checkout session. Please try again or contact support.";
      res.status(statusCode).json({ message: userMessage });
    }
  });

  app.post("/api/stripe/product-checkout", requireAuth, async (req, res) => {
    try {
      const stripe = await getUncachableStripeClient();
      const user = await storage.getUser((req.user as any).id);
      if (!user) return res.status(401).json({ message: "User not found" });

      const { productId } = req.body;
      if (!productId) return res.status(400).json({ message: "productId is required" });

      const product = await storage.getProduct(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });
      if (product.status !== "Approved") return res.status(400).json({ message: "Product is not available for purchase" });
      if (!product.price || product.price <= 0) {
        return res.status(400).json({ message: "Product price must be greater than zero" });
      }

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
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description || undefined,
              images: product.imageUrl ? [product.imageUrl] : undefined,
            },
            unit_amount: product.price,
          },
          quantity: 1,
        }],
        mode: 'payment',
        metadata: { productId: product.id, userId: user.id },
        success_url: `${getBaseUrl(req)}/store/product/${product.id}?success=true`,
        cancel_url: `${getBaseUrl(req)}/store/product/${product.id}?cancelled=true`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Product checkout error:", {
        message: error.message,
        type: error.type,
        code: error.code,
        statusCode: error.statusCode,
        stack: error.stack,
      });
      const statusCode = error.statusCode || 500;
      const userMessage = error.type === "StripeCardError"
        ? error.message
        : error.type === "StripeInvalidRequestError"
          ? `Invalid request: ${error.message}`
          : "Failed to create checkout session. Please try again or contact support.";
      res.status(statusCode).json({ message: userMessage });
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
        return_url: `${getBaseUrl(req)}/settings?tab=payments`,
      });

      res.json({ url: portalSession.url });
    } catch (error: any) {
      console.error("Portal error:", {
        message: error.message,
        type: error.type,
        code: error.code,
        statusCode: error.statusCode,
        stack: error.stack,
      });
      const statusCode = error.statusCode || 500;
      const userMessage = error.type === "StripeInvalidRequestError"
        ? `Portal error: ${error.message}`
        : "Failed to create portal session. Please try again or contact support.";
      res.status(statusCode).json({ message: userMessage });
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

  app.get("/api/public/stats", async (_req, res) => {
    try {
      const [userCount] = await db.select({ count: sql`count(*)` }).from(users);
      const [threadCount] = await db.select({ count: sql`count(*)` }).from(forumThreads);
      res.json({
        totalMembers: Number(userCount.count),
        totalDiscussions: Number(threadCount.count),
      });
    } catch (error) {
      res.json({ totalMembers: 0, totalDiscussions: 0 });
    }
  });

  app.get("/api/search", async (req, res) => {
    try {
      const q = ((req.query.q as string) || "").trim().toLowerCase();
      const type = (req.query.type as string) || "";
      if (!q || q.length < 2) return res.json({ members: [], topics: [], products: [], posts: [] });

      const results: Record<string, any[]> = { members: [], topics: [], products: [], posts: [] };

      if (!type || type === "members") {
        const allUsers = await storage.getAllUsers();
        results.members = allUsers
          .filter((u) => u.username?.toLowerCase().includes(q))
          .slice(0, 10)
          .map((u) => ({
            id: u.id,
            title: u.username,
            description: u.userRank || "Active Members",
            url: `/profile/${u.id}`,
            image: u.profileImageUrl,
          }));
      }

      if (!type || type === "topics") {
        const threads = await storage.getForumThreads();
        results.topics = threads
          .filter((t) => t.title.toLowerCase().includes(q))
          .slice(0, 10)
          .map((t) => ({
            id: t.id,
            title: t.title,
            description: `${t.replyCount} replies · ${t.viewCount} views`,
            url: `/forums/thread/${t.id}`,
          }));
      }

      if (!type || type === "products") {
        const prods = await storage.getProducts("Approved");
        results.products = prods
          .filter((p) => p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q))
          .slice(0, 10)
          .map((p) => ({
            id: p.id,
            title: p.name,
            description: p.description ? p.description.substring(0, 100) : "",
            url: `/store`,
            image: p.imageUrl,
          }));
      }

      if (!type || type === "posts") {
        const posts = await storage.getAnnouncements();
        results.posts = posts
          .filter((a) => a.title.toLowerCase().includes(q) || (a.content || "").toLowerCase().includes(q))
          .slice(0, 10)
          .map((a) => ({
            id: a.id,
            title: a.title,
            description: a.content ? a.content.substring(0, 100) : "",
            url: `/blog/${a.id}`,
          }));
      }

      res.json(results);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  const pendingRobloxVerifications = new Map<string, { robloxId: number; verificationCode: string; expiresAt: number }>();

  app.post("/api/roblox/start-verification", requireAuth, async (req, res) => {
    try {
      const { robloxUsername } = req.body;
      if (!robloxUsername || typeof robloxUsername !== "string") {
        return res.status(400).json({ message: "Roblox username is required" });
      }

      const searchRes = await fetch(`https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(robloxUsername)}&limit=10`);
      if (!searchRes.ok) {
        return res.status(400).json({ message: "Failed to look up Roblox user. Try again later." });
      }
      const searchData = await searchRes.json() as { data: Array<{ id: number; name: string; displayName: string }> };
      const robloxUser = searchData.data?.find(
        (u: any) => u.name.toLowerCase() === robloxUsername.toLowerCase()
      );
      if (!robloxUser) {
        return res.status(404).json({ message: "Roblox user not found. Check the username and try again." });
      }

      const existingUser = await storage.getUserByRobloxId(String(robloxUser.id));
      if (existingUser && existingUser.id !== (req.user as any).id) {
        return res.status(409).json({ message: "This Roblox account is already linked to another user." });
      }

      const code = `RIVET-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      pendingRobloxVerifications.set((req.user as any).id, {
        robloxId: robloxUser.id,
        verificationCode: code,
        expiresAt: Date.now() + 15 * 60 * 1000,
      });

      res.json({
        robloxId: robloxUser.id,
        robloxUsername: robloxUser.name,
        robloxDisplayName: robloxUser.displayName,
        verificationCode: code,
      });
    } catch (error) {
      console.error("Roblox start verification error:", error);
      res.status(500).json({ message: "Verification failed. Try again later." });
    }
  });

  app.post("/api/roblox/verify", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const pending = pendingRobloxVerifications.get(userId);

      if (!pending) {
        return res.status(400).json({ message: "No pending verification. Please start the linking process first." });
      }

      if (Date.now() > pending.expiresAt) {
        pendingRobloxVerifications.delete(userId);
        return res.status(400).json({ message: "Verification expired. Please start over." });
      }

      const profileRes = await fetch(`https://users.roblox.com/v1/users/${pending.robloxId}`);
      if (!profileRes.ok) {
        return res.status(400).json({ message: "Failed to fetch Roblox profile" });
      }
      const profileData = await profileRes.json() as { description: string; name: string; displayName: string };

      if (!profileData.description || !profileData.description.includes(pending.verificationCode)) {
        return res.status(400).json({
          message: "Verification code not found in your Roblox profile description. Please add the code and try again.",
        });
      }

      const existingUser = await storage.getUserByRobloxId(String(pending.robloxId));
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({ message: "This Roblox account is already linked to another user." });
      }

      await storage.updateUser(userId, {
        robloxId: String(pending.robloxId),
        robloxUsername: profileData.name,
        robloxDisplayName: profileData.displayName,
        robloxLinkedAt: new Date(),
      });

      pendingRobloxVerifications.delete(userId);
      const updatedUser = await storage.getUser(userId);
      res.json(updatedUser);
    } catch (error) {
      console.error("Roblox verify error:", error);
      res.status(500).json({ message: "Verification failed. Try again later." });
    }
  });

  app.post("/api/roblox/unlink", requireAuth, async (req, res) => {
    try {
      await storage.updateUser((req.user as any).id, {
        robloxId: null as any,
        robloxUsername: null as any,
        robloxDisplayName: null as any,
        robloxLinkedAt: null as any,
      });
      const updatedUser = await storage.getUser((req.user as any).id);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to unlink Roblox account" });
    }
  });

  return httpServer;
}
