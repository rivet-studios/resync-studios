import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import crypto from "crypto";
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "./auth";
import { hashPassword, verifyPassword } from "./auth-utils";
import {
  updateDiscordNickname,
  updateDiscordRoles,
  syncUserFromDiscord,
  getRoleMappingStatus,
  getDiscordMemberCount,
} from "./discord-bot";
import {
  insertForumThreadSchema,
  insertForumReplySchema,
  insertReportSchema,
  insertProductSchema,
  insertBanSchema,
  insertAppealSchema,
  insertAnnouncementSchema,
  insertWarningSchema,
  insertStaffNoteSchema,
  insertFaqEntrySchema,
  insertNotificationSchema,
  insertActivityFeedSchema,
  users,
  forumThreads,
  forumReplies,
  products,
  bans,
  reports,
  changelogEntries,
  faqEntries,
  notifications,
  activityFeed,
  directMessages,
  reactions,
  achievementDefinitions,
  userAchievements,
  forumPolls,
  bookmarks,
  auditLog,
  productReviews,
  serviceStatuses,
  type User,
} from "@shared/schema";
import { z } from "zod";
import {
  getUncachableStripeClient,
  getStripePublishableKey,
} from "./stripeClient";
import { sql, eq, desc, and, or, count, gte } from "drizzle-orm";
import { db } from "./db";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getVipPriceId } from "./stripe-products";

const uploadDir = path.join(process.cwd(), "uploads", "avatars");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const mimeToExt: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const userId = (req.user as any)?.id || "unknown";
    const ext = mimeToExt[file.mimetype] || ".png";
    cb(null, `${userId}-${Date.now()}${ext}`);
  },
});

const bannerDir = path.join(process.cwd(), "uploads", "banners");
if (!fs.existsSync(bannerDir)) fs.mkdirSync(bannerDir, { recursive: true });

const bannerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, bannerDir),
  filename: (req, file, cb) => {
    const userId = (req.user as any)?.id || "unknown";
    const ext = mimeToExt[file.mimetype] || ".png";
    cb(null, `banner-${userId}-${Date.now()}${ext}`);
  },
});

const bannerUpload = multer({
  storage: bannerStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, GIF, and WebP images are allowed"));
    }
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, GIF, and WebP images are allowed"));
    }
  },
});

function getBaseUrl(req: Request): string {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.REPLIT_DEV_DOMAIN)
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  return `${req.protocol}://${req.get("host")}`;
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
    const {
      password,
      passwordResetToken,
      passwordResetExpires,
      twoFactorSecret,
      twoFactorBackupCodes,
      ...userWithoutSensitive
    } = user as any;
    res.json(userWithoutSensitive);
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

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({
          message:
            "If an account exists with that email, a reset link has been sent.",
        });
      }

      const crypto = await import("crypto");
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      await storage.updateUser(user.id, {
        passwordResetToken: token,
        passwordResetExpires: expires,
      } as any);

      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const baseUrl =
        process.env.NODE_ENV === "production"
          ? "https://resyncstudios.com"
          : process.env.REPLIT_DEV_DOMAIN
            ? `https://${process.env.REPLIT_DEV_DOMAIN}`
            : "https://resyncstudios.com";
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      await resend.emails.send({
        from: "RIVET Studios <support@resyncstudios.com>",
        to: email,
        subject: "Password Reset Request",
        html: `
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: #ffffff; padding: 40px; border-radius: 12px;">
            <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Password Reset</h1>
            <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
              You requested a password reset for your RIVET Studios account. Click the button below to set a new password. This link expires in 1 hour.
            </p>
            <a href="${resetUrl}" style="display: inline-block; background: #18181B; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
              Reset Password
            </a>
            <p style="color: #71717a; font-size: 12px; margin-top: 32px;">
              If you didn't request this, contact support immediately.
            </p>
          </div>
        `,
      });

      res.json({
        message:
          "If an account exists with that email, a reset link has been sent.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res
          .status(400)
          .json({ message: "Token and password are required" });
      }
      if (password.length < 8) {
        return res
          .status(400)
          .json({ message: "Password must be at least 8 characters" });
      }

      const user = await storage.getUserByResetToken(token);

      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid or expired reset token" });
      }

      const hashedPassword = hashPassword(password);
      await storage.updateUser(user.id, {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      } as any);

      res.json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  function sanitizeUser(user: any) {
    const {
      password,
      passwordResetToken,
      passwordResetExpires,
      twoFactorSecret,
      twoFactorBackupCodes,
      ...safe
    } = user;
    return safe;
  }

  app.get("/api/users", async (req, res) => {
    try {
      const { search } = req.query;
      const allUsers = await storage.getAllUsers();
      const sanitized = allUsers.map(sanitizeUser);
      if (search) {
        const filtered = sanitized.filter((u: any) =>
          u.username?.toLowerCase().includes((search as string).toLowerCase()),
        );
        return res.json(filtered);
      }
      res.json(sanitized);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch users. Contact support for help." });
    }
  });

  app.get("/api/profile/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(sanitizeUser(user));
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
      if (!isAdminUser(user))
        return res.status(403).json({ message: "Forbidden" });
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/search-users", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!isForumStaff(user) && !isAdminUser(user)) {
        return res.status(403).json({ message: "Forbidden" });
      }
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
      const actingUser = req.user as any;
      if (!isAdminUser(actingUser))
        return res.status(403).json({ message: "Forbidden" });
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

  app.get("/api/admin/discord-status", requireAuth, async (req, res) => {
    try {
      const actingUser = req.user as any;
      if (!isAdminUser(actingUser))
        return res.status(403).json({ message: "Forbidden" });
      const status = getRoleMappingStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to get Discord status" });
    }
  });

  app.post("/api/admin/discord-sync/:userId", requireAuth, async (req, res) => {
    try {
      const actingUser = req.user as any;
      if (!isAdminUser(actingUser))
        return res.status(403).json({ message: "Forbidden" });

      const targetUser = await storage.getUser(req.params.userId);
      if (!targetUser)
        return res.status(404).json({ message: "User not found" });
      if (!targetUser.discordId)
        return res
          .status(400)
          .json({ message: "User has no linked Discord account" });

      const success = await syncUserFromDiscord(targetUser.discordId);
      if (success) {
        res.json({ message: "Discord sync completed" });
      } else {
        res.status(500).json({ message: "Discord sync failed" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to sync from Discord" });
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

  const threadUpdateSchema = z.object({
    isPinned: z.boolean().optional(),
    isLocked: z.boolean().optional(),
    categoryId: z.string().optional(),
    title: z.string().min(3).optional(),
    content: z.string().min(10).optional(),
  });

  const replyUpdateSchema = z.object({
    content: z.string().min(1),
  });

  const categoryCreateSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    group: z.string().optional(),
    order: z.number().int().optional(),
  });

  const forumStaffRanks = [
    "Trial Moderator",
    "Moderator",
    "Administrator",
    "Senior Administrator",
    "Developer",
    "Staff Internal Affairs",
    "Team Member",
    "Staff Department Director",
    "Operations Manager",
    "Company Director",
  ];

  function isForumStaff(user: any): boolean {
    return (
      user.isAdmin ||
      user.isModerator ||
      forumStaffRanks.includes(user.userRank) ||
      (user.additionalRanks || []).some((r: string) =>
        forumStaffRanks.includes(r),
      )
    );
  }

  // Forum staff routes - thread moderation
  app.patch("/api/forums/threads/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const thread = await storage.getForumThread(req.params.id);
      if (!thread) return res.status(404).json({ message: "Thread not found" });

      const isStaff = isForumStaff(user);
      const isAuthor = thread.authorId === user.id;

      if (!isStaff && !isAuthor)
        return res.status(403).json({ message: "Forbidden" });

      const parsed = threadUpdateSchema.parse(req.body);
      const allowedFields: any = {};
      if (isStaff) {
        if (parsed.isPinned !== undefined)
          allowedFields.isPinned = parsed.isPinned;
        if (parsed.isLocked !== undefined)
          allowedFields.isLocked = parsed.isLocked;
        if (parsed.categoryId !== undefined)
          allowedFields.categoryId = parsed.categoryId;
      }
      if (parsed.title !== undefined) allowedFields.title = parsed.title;
      if (parsed.content !== undefined) allowedFields.content = parsed.content;

      const updated = await storage.updateForumThread(
        req.params.id,
        allowedFields,
      );
      if (isStaff) {
        const actions = [];
        if (parsed.isPinned !== undefined)
          actions.push(parsed.isPinned ? "pinned" : "unpinned");
        if (parsed.isLocked !== undefined)
          actions.push(parsed.isLocked ? "locked" : "unlocked");
        if (parsed.categoryId !== undefined) actions.push("moved");
        if (actions.length > 0) {
          await storage.createModerationLog({
            action: `thread_${actions.join("_")}`,
            actorId: user.id,
            targetId: req.params.id,
            targetType: "thread",
            details: `Thread ${actions.join(", ")}`,
          });
        }
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError)
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      res.status(500).json({ message: "Failed to update thread" });
    }
  });

  app.delete("/api/forums/threads/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!isForumStaff(user))
        return res.status(403).json({ message: "Forbidden" });
      await storage.deleteForumThread(req.params.id);
      await storage.createModerationLog({
        action: "thread_deleted",
        actorId: user.id,
        targetId: req.params.id,
        targetType: "thread",
        details: "Thread deleted",
      });
      res.json({ message: "Thread deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete thread" });
    }
  });

  app.patch("/api/forums/replies/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const reply = await storage.getForumReply(req.params.id);
      if (!reply) return res.status(404).json({ message: "Reply not found" });

      const isStaff = isForumStaff(user);
      const isAuthor = reply.authorId === user.id;
      if (!isStaff && !isAuthor)
        return res.status(403).json({ message: "Forbidden" });

      const parsed = replyUpdateSchema.parse(req.body);
      const updated = await storage.updateForumReply(req.params.id, {
        content: parsed.content,
      });
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError)
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      res.status(500).json({ message: "Failed to update reply" });
    }
  });

  app.delete("/api/forums/replies/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!isForumStaff(user))
        return res.status(403).json({ message: "Forbidden" });
      await storage.deleteForumReply(req.params.id);
      res.json({ message: "Reply deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete reply" });
    }
  });

  function isAdminUser(user: any): boolean {
    const adminRanks = [
      "Developer",
      "Staff Internal Affairs",
      "Team Member",
      "Staff Department Director",
      "Operations Manager",
      "Company Director",
    ];
    return (
      user.isAdmin ||
      user.email?.toLowerCase().endsWith("@resyncstudios.com") ||
      adminRanks.includes(user.userRank) ||
      (user.additionalRanks || []).some((r: string) => adminRanks.includes(r))
    );
  }

  // Admin forum category management
  app.post("/api/admin/forum-categories", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!isAdminUser(user))
        return res.status(403).json({ message: "Forbidden" });
      const parsed = categoryCreateSchema.parse(req.body);
      const category = await storage.createForumCategory(parsed as any);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError)
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.patch(
    "/api/admin/forum-categories/:id",
    requireAuth,
    async (req, res) => {
      try {
        const user = req.user as any;
        if (!isAdminUser(user))
          return res.status(403).json({ message: "Forbidden" });
        const parsed = categoryCreateSchema.partial().parse(req.body);
        const updated = await storage.updateForumCategory(
          req.params.id,
          parsed as any,
        );
        if (!updated)
          return res.status(404).json({ message: "Category not found" });
        res.json(updated);
      } catch (error) {
        if (error instanceof z.ZodError)
          return res
            .status(400)
            .json({ message: "Invalid data", errors: error.errors });
        res.status(500).json({ message: "Failed to update category" });
      }
    },
  );

  app.delete(
    "/api/admin/forum-categories/:id",
    requireAuth,
    async (req, res) => {
      try {
        const user = req.user as any;
        if (!isAdminUser(user))
          return res.status(403).json({ message: "Forbidden" });
        await storage.deleteForumCategory(req.params.id);
        res.json({ message: "Category deleted" });
      } catch (error) {
        res.status(500).json({ message: "Failed to delete category" });
      }
    },
  );

  // Admin forum stats
  app.get("/api/admin/forum-stats", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!isAdminUser(user))
        return res.status(403).json({ message: "Forbidden" });
      const [threadCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(forumThreads);
      const {
        forumReplies: forumRepliesTable,
        forumCategories: forumCatsTable,
      } = await import("@shared/schema");
      const [replyCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(forumRepliesTable);
      const [categoryCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(forumCatsTable);
      res.json({
        totalThreads: Number(threadCount.count),
        totalReplies: Number(replyCount.count),
        totalCategories: Number(categoryCount.count),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get forum stats" });
    }
  });

  // Moderation logs routes
  app.get("/api/moderation-logs", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!isForumStaff(user))
        return res.status(403).json({ message: "Forbidden" });
      const { action, actorId, targetId, limit } = req.query;
      const logs = await storage.getModerationLogs({
        action: action as string,
        actorId: actorId as string,
        targetId: targetId as string,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch moderation logs" });
    }
  });

  app.get(
    "/api/moderation-logs/user/:userId",
    requireAuth,
    async (req, res) => {
      try {
        const user = req.user as any;
        if (!isForumStaff(user))
          return res.status(403).json({ message: "Forbidden" });
        const logs = await storage.getUserModerationLogs(req.params.userId);
        res.json(logs);
      } catch (error) {
        res
          .status(500)
          .json({ message: "Failed to fetch user moderation logs" });
      }
    },
  );

  // Warnings routes
  app.get("/api/warnings", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!isForumStaff(user))
        return res.status(403).json({ message: "Forbidden" });
      const activeOnly = req.query.active === "true";
      const allWarnings = await storage.getWarnings(activeOnly);
      res.json(allWarnings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch warnings" });
    }
  });

  app.get("/api/warnings/user/:userId", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!isForumStaff(user))
        return res.status(403).json({ message: "Forbidden" });
      const userWarnings = await storage.getUserWarnings(req.params.userId);
      res.json(userWarnings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user warnings" });
    }
  });

  app.post("/api/warnings", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!isForumStaff(user))
        return res.status(403).json({ message: "Forbidden" });
      const data = insertWarningSchema.parse({
        ...req.body,
        issuedBy: user.id,
      });
      const warning = await storage.createWarning(data);
      await storage.createModerationLog({
        action: "Warning Issued",
        actorId: user.id,
        targetId: data.userId,
        targetType: "user",
        details: `${data.severity} warning: ${data.reason}`,
      });
      res.status(201).json(warning);
    } catch (error) {
      if (error instanceof z.ZodError)
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      res.status(500).json({ message: "Failed to create warning" });
    }
  });

  app.patch("/api/warnings/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!isForumStaff(user))
        return res.status(403).json({ message: "Forbidden" });
      const warning = await storage.deactivateWarning(req.params.id);
      if (!warning)
        return res.status(404).json({ message: "Warning not found" });
      await storage.createModerationLog({
        action: "Warning Rescinded",
        actorId: user.id,
        targetId: warning.userId,
        targetType: "user",
        details: `Rescinded ${warning.severity} warning`,
      });
      res.json(warning);
    } catch (error) {
      res.status(500).json({ message: "Failed to deactivate warning" });
    }
  });

  // Mass warnings route
  app.post("/api/warnings/mass", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!isForumStaff(user))
        return res.status(403).json({ message: "Forbidden" });
      const { userIds, reason, severity } = req.body;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "userIds array is required" });
      }
      if (!reason || !severity) {
        return res
          .status(400)
          .json({ message: "reason and severity are required" });
      }
      const results = [];
      for (const userId of userIds) {
        const warning = await storage.createWarning({
          userId,
          issuedBy: user.id,
          reason,
          severity,
        });
        await storage.createModerationLog({
          action: "Warning Issued",
          actorId: user.id,
          targetId: userId,
          targetType: "user",
          details: `${severity} warning (mass): ${reason}`,
        });
        results.push(warning);
      }
      res.status(201).json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to issue mass warnings" });
    }
  });

  // Escalation tracker - users with multiple active warnings
  app.get("/api/warnings/escalations", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!isForumStaff(user))
        return res.status(403).json({ message: "Forbidden" });
      const allWarnings = await storage.getWarnings(true);
      const userWarningMap: Record<
        string,
        { count: number; warnings: any[]; user?: any }
      > = {};
      for (const w of allWarnings) {
        if (!userWarningMap[w.userId]) {
          userWarningMap[w.userId] = { count: 0, warnings: [] };
        }
        userWarningMap[w.userId].count++;
        userWarningMap[w.userId].warnings.push(w);
      }
      const escalations = [];
      for (const [userId, data] of Object.entries(userWarningMap)) {
        if (data.count >= 2) {
          const targetUser = await storage.getUser(userId);
          escalations.push({
            userId,
            username: targetUser?.username || userId,
            email: targetUser?.email,
            userRank: targetUser?.userRank,
            warningCount: data.count,
            warnings: data.warnings,
            suggestBan: data.count >= 3,
          });
        }
      }
      escalations.sort((a, b) => b.warningCount - a.warningCount);
      res.json(escalations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch escalations" });
    }
  });

  // Bulk rank change
  app.post("/api/admin/bulk-rank-change", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!isAdminUser(user))
        return res.status(403).json({ message: "Forbidden" });
      const { userIds, userRank } = req.body;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "userIds array is required" });
      }
      if (!userRank) {
        return res.status(400).json({ message: "userRank is required" });
      }
      const results = [];
      for (const userId of userIds) {
        const targetUser = await storage.getUser(userId);
        const oldRank = targetUser?.userRank || "none";
        await storage.updateUserRank(userId, userRank);
        await storage.createModerationLog({
          action: "Rank Changed",
          actorId: user.id,
          targetId: userId,
          targetType: "user",
          details: `Bulk rank change from "${oldRank}" to "${userRank}"`,
          metadata: JSON.stringify({ oldRank, newRank: userRank }),
        });
        results.push({ userId, oldRank, newRank: userRank });
      }
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to bulk update ranks" });
    }
  });

  // Role change history
  app.get("/api/admin/role-history", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!isAdminUser(user))
        return res.status(403).json({ message: "Forbidden" });
      const logs = await storage.getModerationLogs({ action: "Rank Changed" });
      const logsWithUsers = await Promise.all(
        logs.map(async (log: any) => {
          const actor = await storage.getUser(log.actorId);
          const target = log.targetId
            ? await storage.getUser(log.targetId)
            : null;
          return {
            ...log,
            actor: actor ? { id: actor.id, username: actor.username } : null,
            target: target
              ? { id: target.id, username: target.username }
              : null,
          };
        }),
      );
      res.json(logsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch role history" });
    }
  });

  // Staff notes routes
  app.get("/api/staff-notes/:userId", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!isForumStaff(user))
        return res.status(403).json({ message: "Forbidden" });
      const notes = await storage.getStaffNotes(req.params.userId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff notes" });
    }
  });

  app.post("/api/staff-notes", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!isForumStaff(user))
        return res.status(403).json({ message: "Forbidden" });
      const data = insertStaffNoteSchema.parse({
        ...req.body,
        authorId: user.id,
      });
      const note = await storage.createStaffNote(data);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z.ZodError)
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      res.status(500).json({ message: "Failed to create staff note" });
    }
  });

  app.delete("/api/staff-notes/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!isForumStaff(user))
        return res.status(403).json({ message: "Forbidden" });
      await storage.deleteStaffNote(req.params.id);
      res.json({ message: "Note deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete staff note" });
    }
  });

  app.post("/api/admin/set-user-password", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!isAdminUser(user))
        return res.status(403).json({ message: "Forbidden" });

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
      if (!isAdminUser(user))
        return res.status(403).json({ message: "Forbidden" });

      const { targetUsername, vipTier } = req.body;
      const targetUser = await storage.getUserByUsername(targetUsername);
      if (!targetUser)
        return res.status(404).json({ message: "User not found" });

      await storage.updateUser(targetUser.id, { vipTier: vipTier as any });
      res.json({ message: "Subscription assigned successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to assign subscription" });
    }
  });

  app.post("/api/admin/announcements", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!isAdminUser(user))
        return res.status(403).json({ message: "Forbidden" });

      const data = insertAnnouncementSchema.parse({
        ...req.body,
        authorId: user.id,
      });
      if (req.body.scheduledFor) {
        (data as any).scheduledFor = new Date(req.body.scheduledFor);
        (data as any).isPublished = false;
      }
      const announcement = await storage.createAnnouncement(data);
      res.status(201).json(announcement);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.delete("/api/admin/announcements/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!isAdminUser(user))
        return res.status(403).json({ message: "Forbidden" });

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
        profileImageUrl: z
          .string()
          .refine(
            (val) =>
              val === "" ||
              val.startsWith("/uploads/") ||
              /^https?:\/\//.test(val),
            { message: "Invalid image URL" },
          )
          .optional(),
        dateOfBirth: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
          .or(z.literal(""))
          .optional(),
      });
      const parsed = profileUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const { username, bio, signature, profileImageUrl, dateOfBirth } =
        parsed.data;
      const updates: any = { updatedAt: new Date() };
      if (username !== undefined) updates.username = username;
      if (bio !== undefined) updates.bio = bio;
      if (signature !== undefined) updates.signature = signature;
      if (profileImageUrl !== undefined)
        updates.profileImageUrl = profileImageUrl || null;
      if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth || null;
      await storage.updateUser(userId, updates);
      res.json({ message: "Profile updated" });
    } catch (error) {
      res.status(500).json({ message: "Update failed" });
    }
  });

  app.post(
    "/api/users/profile/avatar",
    requireAuth,
    (req, res, next) => {
      avatarUpload.single("avatar")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res
              .status(400)
              .json({ message: "File too large. Maximum size is 5MB." });
          }
          return res
            .status(400)
            .json({ message: `Upload error: ${err.message}` });
        }
        if (err) {
          return res.status(400).json({ message: err.message });
        }
        next();
      });
    },
    async (req, res) => {
      try {
        const userId = (req.user as any).id;
        if (!req.file) {
          return res.status(400).json({ message: "No image file provided" });
        }
        const imageUrl = `/uploads/avatars/${req.file.filename}`;
        await storage.updateUser(userId, { profileImageUrl: imageUrl } as any);
        res.json({ message: "Avatar uploaded", profileImageUrl: imageUrl });
      } catch (error: any) {
        res.status(500).json({ message: "Upload failed" });
      }
    },
  );

  app.post(
    "/api/users/profile/banner",
    requireAuth,
    (req, res, next) => {
      bannerUpload.single("banner")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res
              .status(400)
              .json({ message: "File too large. Maximum size is 10MB." });
          }
          return res
            .status(400)
            .json({ message: `Upload error: ${err.message}` });
        }
        if (err) return res.status(400).json({ message: err.message });
        next();
      });
    },
    async (req, res) => {
      try {
        const userId = (req.user as any).id;
        if (!req.file) {
          return res.status(400).json({ message: "No image file provided" });
        }
        const bannerUrl = `/uploads/banners/${req.file.filename}`;
        await storage.updateUser(userId, {
          profileBannerUrl: bannerUrl,
        } as any);
        res.json({ message: "Banner uploaded", profileBannerUrl: bannerUrl });
      } catch (error: any) {
        res.status(500).json({ message: "Upload failed" });
      }
    },
  );

  app.post("/api/users/change-password", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const passwordSchema = z.object({
        currentPassword: z.string().min(1),
        newPassword: z
          .string()
          .min(8, "Password must be at least 8 characters"),
      });
      const parsed = passwordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const user = await storage.getUser(userId);
      if (!user || !user.password) {
        return res.status(400).json({
          message: "Password change not available for this account type",
        });
      }
      if (!verifyPassword(parsed.data.currentPassword, user.password)) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
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
        if (err)
          return res
            .status(500)
            .json({ message: "Account deleted but logout failed" });
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
            author: author
              ? {
                  id: author.id,
                  username: author.username,
                  userRank: author.userRank,
                  profileImageUrl: author.profileImageUrl,
                }
              : null,
          };
        }),
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
      if (!announcement)
        return res.status(404).json({ message: "Post not found" });
      const author = await storage.getUser(announcement.authorId);
      res.json({
        ...announcement,
        author: author
          ? {
              id: author.id,
              username: author.username,
              userRank: author.userRank,
              profileImageUrl: author.profileImageUrl,
            }
          : null,
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
      const hasAccess = user.isAdmin || adminRanks.includes(user.userRank);

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
          return {
            ...p,
            submitter: submitter
              ? {
                  id: submitter.id,
                  username: submitter.username,
                  userRank: submitter.userRank,
                }
              : null,
          };
        }),
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
          return {
            ...p,
            submitter: submitter
              ? {
                  id: submitter.id,
                  username: submitter.username,
                  userRank: submitter.userRank,
                }
              : null,
          };
        }),
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

  app.get("/api/marketplace/stats", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const allProducts = await storage.getProducts();
      const myProducts = allProducts.filter((p) => p.submitterId === user.id);
      const approvedProducts = myProducts.filter(
        (p) => p.status === "approved",
      );
      res.json({
        totalProducts: myProducts.length,
        approvedProducts: approvedProducts.length,
        pendingProducts: myProducts.filter((p) => p.status === "pending")
          .length,
        totalSales: 0,
        totalCommission: 0,
        recentSales: [],
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch marketplace stats" });
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
      const userRanks = [user.userRank, ...(user.additionalRanks || [])];
      const hasOpsAccess =
        user.isAdmin || userRanks.some((r: string) => opsRanks.includes(r));
      if (!hasOpsAccess) {
        return res
          .status(403)
          .json({ message: "Only Operations Managers can review products" });
      }
      let { status, reviewNotes } = req.body;
      const statusMap: Record<string, string> = {
        approved: "approved",
        denied: "denied",
        Approved: "approved",
        Denied: "denied",
      };
      status = statusMap[status?.toLowerCase?.()];
      if (!status) {
        return res
          .status(400)
          .json({ message: "Status must be approved or denied" });
      }
      const existingProduct = await storage.getProduct(req.params.id);
      if (!existingProduct)
        return res.status(404).json({ message: "Product not found" });

      const updates: any = {
        status,
        reviewedBy: user.id,
        reviewNotes: reviewNotes || null,
      };
      if (status === "approved") {
        updates.isCommunityProvided = true;

        if (existingProduct.price === 0) {
          updates.canPurchase = false;
        }

        if (!existingProduct.stripeProductId && existingProduct.price > 0) {
          try {
            const stripe = await getUncachableStripeClient();
            const stripeProduct = await stripe.products.create({
              name: existingProduct.name,
              description: existingProduct.description || undefined,
              images: existingProduct.imageUrl
                ? [existingProduct.imageUrl]
                : [],
              metadata: {
                platform_product_id: existingProduct.id,
                category: existingProduct.category || "",
                submitter_id: existingProduct.submitterId,
              },
            });
            const stripePrice = await stripe.prices.create({
              product: stripeProduct.id,
              unit_amount: existingProduct.price,
              currency: "usd",
              metadata: {
                platform_product_id: existingProduct.id,
              },
            });
            updates.stripeProductId = stripeProduct.id;
            updates.stripePriceId = stripePrice.id;
            console.log(
              `✅ Stripe product created for "${existingProduct.name}": ${stripeProduct.id}, price: ${stripePrice.id}`,
            );
          } catch (stripeErr: any) {
            console.error(
              `⚠️ Failed to create Stripe product for "${existingProduct.name}":`,
              stripeErr.message,
            );
          }
        }
      }
      const product = await storage.updateProduct(req.params.id, updates);
      if (!product)
        return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (error: any) {
      console.error("Product review failed:", error.message, error.stack);
      res.status(500).json({ message: "Review failed" });
    }
  });

  app.patch("/api/products/:id/badges", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const opsRanks = ["Operations Manager", "Company Director"];
      const userRanks = [user.userRank, ...(user.additionalRanks || [])];
      const hasOpsAccess =
        user.isAdmin || userRanks.some((r: string) => opsRanks.includes(r));
      if (!hasOpsAccess) {
        return res
          .status(403)
          .json({ message: "Only Operations Managers can assign badges" });
      }
      const { isFeatured, isLimitedEdition, isVerified, isCommunityProvided } =
        req.body;
      const updates: any = {};
      if (typeof isFeatured === "boolean") updates.isFeatured = isFeatured;
      if (typeof isLimitedEdition === "boolean")
        updates.isLimitedEdition = isLimitedEdition;
      if (typeof isVerified === "boolean") updates.isVerified = isVerified;
      if (typeof isCommunityProvided === "boolean")
        updates.isCommunityProvided = isCommunityProvided;
      const product = await storage.updateProduct(req.params.id, updates);
      if (!product)
        return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Badge update failed" });
    }
  });

  // ===== PRODUCT REVIEWS =====
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = req.params.id;
      const reviews = await db
        .select({
          id: productReviews.id,
          productId: productReviews.productId,
          userId: productReviews.userId,
          rating: productReviews.rating,
          comment: productReviews.comment,
          createdAt: productReviews.createdAt,
          username: users.username,
          profileImageUrl: users.profileImageUrl,
        })
        .from(productReviews)
        .leftJoin(users, eq(productReviews.userId, users.id))
        .where(eq(productReviews.productId, productId))
        .orderBy(desc(productReviews.createdAt));
      res.json(reviews);
    } catch {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/products/:id/reviews", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const productId = req.params.id;
      const { rating, comment } = req.body;
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be 1-5" });
      }

      const existing = await db
        .select()
        .from(productReviews)
        .where(and(eq(productReviews.productId, productId), eq(productReviews.userId, userId)))
        .limit(1);

      if (existing.length > 0) {
        const [updated] = await db
          .update(productReviews)
          .set({ rating, comment: comment || null, createdAt: new Date() })
          .where(eq(productReviews.id, existing[0].id))
          .returning();
        return res.json(updated);
      }

      const [review] = await db
        .insert(productReviews)
        .values({ productId, userId, rating, comment: comment || null })
        .returning();
      res.json(review);
    } catch {
      res.status(500).json({ message: "Failed to submit review" });
    }
  });

  app.delete("/api/products/:id/reviews", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const productId = req.params.id;
      await db
        .delete(productReviews)
        .where(and(eq(productReviews.productId, productId), eq(productReviews.userId, userId)));
      res.json({ deleted: true });
    } catch {
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // ===== SERVICE STATUS MANAGEMENT =====
  app.get("/api/admin/service-statuses", requireAuth, async (req, res) => {
    try {
      if (!isAdminUser(req.user as any)) return res.status(403).json({ message: "Forbidden" });
      const statuses = await db.select().from(serviceStatuses).orderBy(serviceStatuses.serviceKey);
      res.json(statuses);
    } catch {
      res.status(500).json({ message: "Failed to fetch service statuses" });
    }
  });

  app.patch("/api/admin/service-statuses/:key", requireAuth, async (req, res) => {
    try {
      if (!isAdminUser(req.user as any)) return res.status(403).json({ message: "Forbidden" });
      const { status } = req.body;
      const validStatuses = ["operational", "degraded", "partial outage", "offline", "maintenance"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const [updated] = await db
        .update(serviceStatuses)
        .set({ status, updatedAt: new Date() })
        .where(eq(serviceStatuses.serviceKey, req.params.key))
        .returning();
      if (!updated) return res.status(404).json({ message: "Service not found" });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Failed to update service status" });
    }
  });

  // Ban routes
  app.get("/api/bans", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const staffRanks = [
        "Trial Moderator",
        "Moderator",
        "Administrator",
        "Senior Administrator",
        "Developer",
        "Staff Internal Affairs",
        "Team Member",
        "Staff Department Director",
        "Operations Manager",
        "Company Director",
      ];
      if (
        !user.isAdmin &&
        !user.isModerator &&
        !staffRanks.includes(user.userRank)
      ) {
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
            user: bannedUser
              ? { id: bannedUser.id, username: bannedUser.username }
              : null,
            bannedByUser: bannedByUser
              ? { id: bannedByUser.id, username: bannedByUser.username }
              : null,
          };
        }),
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
        "Trial Moderator",
        "Moderator",
        "Administrator",
        "Senior Administrator",
        "Developer",
        "Staff Internal Affairs",
        "Team Member",
        "Staff Department Director",
        "Operations Manager",
        "Company Director",
      ];
      if (
        !user.isAdmin &&
        !user.isModerator &&
        !staffRanks.includes(user.userRank)
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const data = insertBanSchema.parse({
        ...req.body,
        bannedBy: user.id,
      });
      const ban = await storage.createBan(data);
      await storage.createModerationLog({
        action: "Ban Issued",
        actorId: user.id,
        targetId: data.userId,
        targetType: "user",
        details: `Ban issued: ${data.reason}${data.isPermanent ? " (Permanent)" : ""}`,
      });
      res.status(201).json(ban);
    } catch (error) {
      res.status(400).json({ message: "Invalid ban data" });
    }
  });

  app.delete("/api/bans/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const staffRanks = [
        "Trial Moderator",
        "Moderator",
        "Administrator",
        "Senior Administrator",
        "Developer",
        "Staff Internal Affairs",
        "Team Member",
        "Staff Department Director",
        "Operations Manager",
        "Company Director",
      ];
      if (
        !user.isAdmin &&
        !user.isModerator &&
        !staffRanks.includes(user.userRank)
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const ban = await storage.deactivateBan(req.params.id);
      if (!ban) return res.status(404).json({ message: "Ban not found" });
      await storage.createModerationLog({
        action: "Ban Lifted",
        actorId: user.id,
        targetId: ban.userId,
        targetType: "user",
        details: "Ban lifted",
      });
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
        "Appeals Moderator",
        "Trial Moderator",
        "Moderator",
        "Administrator",
        "Senior Administrator",
        "Developer",
        "Staff Internal Affairs",
        "Team Member",
        "Staff Department Director",
        "Operations Manager",
        "Company Director",
      ];
      if (
        !user.isAdmin &&
        !user.isModerator &&
        !staffRanks.includes(user.userRank)
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const status = req.query.status as string | undefined;
      const appealList = await storage.getAppeals(status);
      const appealsWithUsers = await Promise.all(
        appealList.map(async (a) => {
          const appellant = await storage.getUser(a.userId);
          return {
            ...a,
            user: appellant
              ? {
                  id: appellant.id,
                  username: appellant.username,
                  email: appellant.email,
                }
              : null,
          };
        }),
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
        "Appeals Moderator",
        "Trial Moderator",
        "Moderator",
        "Administrator",
        "Senior Administrator",
        "Developer",
        "Staff Internal Affairs",
        "Team Member",
        "Staff Department Director",
        "Operations Manager",
        "Company Director",
      ];
      if (
        !user.isAdmin &&
        !user.isModerator &&
        !staffRanks.includes(user.userRank)
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { status: rawStatus, reviewNotes } = req.body;
      const statusLower = rawStatus?.toLowerCase?.();
      if (!["approved", "denied"].includes(statusLower)) {
        return res
          .status(400)
          .json({ message: "Status must be approved or denied" });
      }
      const appeal = await storage.getAppeal(req.params.id);
      if (!appeal) return res.status(404).json({ message: "Appeal not found" });

      const updated = await storage.updateAppeal(req.params.id, {
        status: statusLower as any,
        reviewedBy: user.id,
        reviewNotes,
      });

      if (statusLower === "approved" && appeal.banId) {
        await storage.deactivateBan(appeal.banId);
      }

      await storage.createModerationLog({
        action: `appeal_${statusLower}`,
        actorId: user.id,
        targetId: appeal.userId,
        targetType: "appeal",
        details: `Appeal ${statusLower}${reviewNotes ? `: ${reviewNotes}` : ""}`,
      });

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
        "Trial Moderator",
        "Moderator",
        "Administrator",
        "Senior Administrator",
        "Developer",
        "Staff Internal Affairs",
        "Team Member",
        "Staff Department Director",
        "Operations Manager",
        "Company Director",
      ];
      if (
        !user.isAdmin &&
        !user.isModerator &&
        !staffRanks.includes(user.userRank)
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { status, moderatorNotes } = req.body;
      const report = await storage.updateReportStatus(
        req.params.id,
        status,
        moderatorNotes,
      );
      if (!report) return res.status(404).json({ message: "Report not found" });
      await storage.createModerationLog({
        action: `report_${status.toLowerCase().replace(/\s+/g, "_")}`,
        actorId: user.id,
        targetId: report.targetId || req.params.id,
        targetType: "report",
        details: `Report ${status}${moderatorNotes ? `: ${moderatorNotes}` : ""}`,
      });
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
      if (!user || !isAdminUser(user)) {
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
      if (!user || (!isAdminUser(user) && !user.isModerator)) {
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
      if (!user || !isAdminUser(user)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { isOffline, offlineMessage } = req.body;
      const settings = await storage.updateSiteSettings({
        isOffline,
        offlineMessage,
      });
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

  app.get("/api/site-status", async (_req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json({
        isOffline: settings.isOffline ?? false,
        offlineMessage: settings.offlineMessage,
      });
    } catch (error) {
      res.json({ isOffline: false, offlineMessage: null });
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
        (user?.additionalRanks || []).some((r: string) =>
          opsRanks.includes(r),
        ) ||
        user?.email?.toLowerCase().endsWith("@resyncstudios.com");
      if (!hasAccess) {
        return res
          .status(403)
          .json({ message: "Only Operations Managers can update policies" });
      }
      const { title, content } = req.body;
      if (!title || !content) {
        return res
          .status(400)
          .json({ message: "Title and content are required" });
      }
      const policy = await storage.upsertPolicy(
        req.params.slug,
        title,
        content,
        user!.id,
      );
      res.json(policy);
    } catch (error) {
      res.status(500).json({ message: "Failed to update policy" });
    }
  });

  app.patch("/api/admin/users/:id/rank", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (!user || !isAdminUser(user)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { userRank } = req.body;
      const targetUser = await storage.getUser(req.params.id);
      const oldRank = targetUser?.userRank || undefined;
      await storage.updateUserRank(req.params.id, userRank);
      const updatedUser = await storage.getUser(req.params.id);

      await storage.createModerationLog({
        action: "Rank Changed",
        actorId: user!.id,
        targetId: req.params.id,
        targetType: user!.username,
        details: `Rank changed from "${oldRank || "none"}" to "${userRank}"`,
        metadata: JSON.stringify({ oldRank, newRank: userRank }),
      });

      if (updatedUser?.discordId) {
        updateDiscordRoles(updatedUser.discordId, userRank, oldRank).catch(
          (err) => console.error("Discord role sync error:", err),
        );
        if (updatedUser.username) {
          updateDiscordNickname(
            updatedUser.discordId,
            updatedUser.username,
          ).catch((err) => console.error("Discord nickname sync error:", err));
        }
      }

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update rank" });
    }
  });

  app.patch("/api/admin/users/:id/verify", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (!user || !isAdminUser(user)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { isVerified } = req.body;
      if (typeof isVerified !== "boolean") {
        return res.status(400).json({ message: "isVerified must be a boolean" });
      }
      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      await storage.updateUser(req.params.id, { isVerified });
      const updatedUser = await storage.getUser(req.params.id);

      await db.insert(auditLog).values({
        userId: user.id,
        action: isVerified ? "user_verified" : "user_unverified",
        targetId: req.params.id,
        targetType: "user",
        details: JSON.stringify({ username: updatedUser?.username, isVerified }),
        ipAddress: req.ip || null,
      });

      res.json(sanitizeUser(updatedUser));
    } catch (error) {
      res.status(500).json({ message: "Failed to update verification status" });
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
            ORDER BY p.name, pr.unit_amount`,
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

      const { tierId } = req.body;

      if (!tierId || typeof tierId !== "string") {
        return res.status(400).json({ message: "A valid tierId is required" });
      }

      const priceId = await getVipPriceId(tierId);
      if (!priceId) {
        return res.status(400).json({
          message:
            "Invalid subscription tier. VIP products may not be configured yet.",
        });
      }

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: { userId: user.id },
        });
        await storage.updateUser(user.id, {
          stripeCustomerId: customer.id,
        } as any);
        customerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${getBaseUrl(req)}/store/subscriptions?success=true`,
        cancel_url: `${getBaseUrl(req)}/store/subscriptions?cancelled=true`,
        metadata: {
          userId: user.id,
          tierId: tierId || "",
        },
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
      const userMessage =
        error.type === "StripeCardError"
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
      if (!productId)
        return res.status(400).json({ message: "productId is required" });

      const product = await storage.getProduct(productId);
      if (!product)
        return res.status(404).json({ message: "Product not found" });
      if (product.status !== "approved")
        return res
          .status(400)
          .json({ message: "Product is not available for purchase" });
      if (!product.price || product.price <= 0) {
        return res
          .status(400)
          .json({ message: "Product price must be greater than zero" });
      }

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: { userId: user.id },
        });
        await storage.updateUser(user.id, {
          stripeCustomerId: customer.id,
        } as any);
        customerId = customer.id;
      }

      const lineItem = product.stripePriceId
        ? { price: product.stripePriceId, quantity: 1 }
        : {
            price_data: {
              currency: "usd",
              product_data: {
                name: product.name,
                description: product.description || undefined,
                images: product.imageUrl ? [product.imageUrl] : undefined,
              },
              unit_amount: product.price,
            },
            quantity: 1,
          };

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [lineItem],
        mode: "payment",
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
      const userMessage =
        error.type === "StripeCardError"
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
      const userMessage =
        error.type === "StripeInvalidRequestError"
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
        sql`SELECT * FROM stripe.subscriptions WHERE id = ${user.stripeSubscriptionId}`,
      );
      res.json({ subscription: result.rows[0] || null });
    } catch (error) {
      res.json({ subscription: null });
    }
  });

  let cachedExternalStats = {
    discordMembers: 28,
    robloxMembers: 10,
    fetchedAt: 0,
  };
  const EXTERNAL_STATS_TTL = 120_000;

  async function fetchExternalStats() {
    const now = Date.now();
    if (now - cachedExternalStats.fetchedAt < EXTERNAL_STATS_TTL) {
      return cachedExternalStats;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const [discordCount, robloxCount] = await Promise.all([
        getDiscordMemberCount().catch(() => cachedExternalStats.discordMembers),
        (async () => {
          try {
            const robloxGroupId = process.env.ROBLOX_GROUP_ID || "34964480";
            const resp = await fetch(
              `https://groups.roblox.com/v1/groups/${robloxGroupId}`,
              { signal: controller.signal },
            );
            if (!resp.ok) return cachedExternalStats.robloxMembers;
            const data = await resp.json();
            return data.memberCount || cachedExternalStats.robloxMembers;
          } catch {
            return cachedExternalStats.robloxMembers;
          }
        })(),
      ]);

      cachedExternalStats = {
        discordMembers: discordCount,
        robloxMembers: robloxCount,
        fetchedAt: now,
      };
    } catch {
    } finally {
      clearTimeout(timeout);
    }

    return cachedExternalStats;
  }

  app.get("/api/public/stats", async (_req, res) => {
    try {
      const [userCount] = await db.select({ count: sql`count(*)` }).from(users);
      const [threadCount] = await db
        .select({ count: sql`count(*)` })
        .from(forumThreads);

      const external = await fetchExternalStats();

      res.json({
        totalMembers: Number(userCount.count),
        totalDiscussions: Number(threadCount.count),
        discordMembers: external.discordMembers,
        robloxMembers: external.robloxMembers,
      });
    } catch (error) {
      res.json({
        totalMembers: 20,
        totalDiscussions: 2,
        discordMembers: 28,
        robloxMembers: 10,
      });
    }
  });

  app.get("/api/search", async (req, res) => {
    try {
      const q = ((req.query.q as string) || "").trim().toLowerCase();
      const type = (req.query.type as string) || "";
      if (!q || q.length < 2)
        return res.json({ members: [], topics: [], products: [], posts: [] });

      const results: Record<string, any[]> = {
        members: [],
        topics: [],
        products: [],
        posts: [],
      };

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
        const prods = await storage.getProducts("approved");
        results.products = prods
          .filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              (p.description || "").toLowerCase().includes(q),
          )
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
          .filter(
            (a) =>
              a.title.toLowerCase().includes(q) ||
              (a.content || "").toLowerCase().includes(q),
          )
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

  const pendingRobloxVerifications = new Map<
    string,
    { robloxId: number; verificationCode: string; expiresAt: number }
  >();

  app.post("/api/roblox/start-verification", requireAuth, async (req, res) => {
    try {
      const { robloxUsername } = req.body;
      if (!robloxUsername || typeof robloxUsername !== "string") {
        return res.status(400).json({ message: "Roblox username is required" });
      }

      const searchRes = await fetch(
        `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(robloxUsername)}&limit=10`,
      );
      if (!searchRes.ok) {
        return res
          .status(400)
          .json({ message: "Failed to look up Roblox user. Try again later." });
      }
      const searchData = (await searchRes.json()) as {
        data: Array<{ id: number; name: string; displayName: string }>;
      };
      const robloxUser = searchData.data?.find(
        (u: any) => u.name.toLowerCase() === robloxUsername.toLowerCase(),
      );
      if (!robloxUser) {
        return res.status(404).json({
          message: "Roblox user not found. Check the username and try again.",
        });
      }

      const existingUser = await storage.getUserByRobloxId(
        String(robloxUser.id),
      );
      if (existingUser && existingUser.id !== (req.user as any).id) {
        return res.status(409).json({
          message: "This Roblox account is already linked to another user.",
        });
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
      res
        .status(500)
        .json({ message: "Verification failed. Try again later." });
    }
  });

  app.post("/api/roblox/verify", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const pending = pendingRobloxVerifications.get(userId);

      if (!pending) {
        return res.status(400).json({
          message:
            "No pending verification. Please start the linking process first.",
        });
      }

      if (Date.now() > pending.expiresAt) {
        pendingRobloxVerifications.delete(userId);
        return res
          .status(400)
          .json({ message: "Verification expired. Please start over." });
      }

      const profileRes = await fetch(
        `https://users.roblox.com/v1/users/${pending.robloxId}`,
      );
      if (!profileRes.ok) {
        return res
          .status(400)
          .json({ message: "Failed to fetch Roblox profile" });
      }
      const profileData = (await profileRes.json()) as {
        description: string;
        name: string;
        displayName: string;
      };

      if (
        !profileData.description ||
        !profileData.description.includes(pending.verificationCode)
      ) {
        return res.status(400).json({
          message:
            "Verification code not found in your Roblox profile description. Please add the code and try again.",
        });
      }

      const existingUser = await storage.getUserByRobloxId(
        String(pending.robloxId),
      );
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({
          message: "This Roblox account is already linked to another user.",
        });
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
      res
        .status(500)
        .json({ message: "Verification failed. Try again later." });
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

  // ---- Discord domain verification ----
  app.get("/.well-known/discord", (_req, res) => {
    res.type("text/plain").send("dh=47352e73b380893b8e6cdf646091746b12c236a6");
  });

  // ---- Platform Status endpoint ----
  app.get("/api/platform-status", async (_req, res) => {
    try {
      const siteSettings = await storage.getSiteSettings();

      const manualStatuses = await db.select().from(serviceStatuses);
      const services: Record<string, { status: string; label: string }> = {};

      for (const svc of manualStatuses) {
        services[svc.serviceKey] = { status: svc.status, label: svc.label };
      }

      if (!services.platform) services.platform = { status: "operational", label: "Platform API" };
      if (!services.database) services.database = { status: "operational", label: "Database" };
      if (!services.authentication) services.authentication = { status: "operational", label: "Authentication" };
      if (!services.forums) services.forums = { status: "operational", label: "Forums & Community" };
      if (!services.moderation) services.moderation = { status: "operational", label: "Moderation Systems" };
      if (!services.payments) services.payments = { status: "operational", label: "Payments & Store" };

      if (siteSettings?.isOffline) {
        services.platform = { status: "degraded", label: "Platform API" };
      }

      const allOperational = Object.values(services).every(
        (s) => s.status === "operational",
      );

      res.json({
        overall: allOperational
          ? "operational"
          : siteSettings?.isOffline
            ? "maintenance"
            : "degraded",
        services,
        maintenance: siteSettings?.isOffline
          ? {
              active: true,
              message:
                siteSettings.offlineMessage ||
                "The platform is currently undergoing maintenance.",
            }
          : { active: false, message: null },
        lastChecked: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch platform status" });
    }
  });

  // ---- Changelog endpoints ----
  app.get("/api/changelog", async (_req, res) => {
    try {
      const entries = await db
        .select()
        .from(changelogEntries)
        .where(eq(changelogEntries.isPublished, true))
        .orderBy(desc(changelogEntries.publishedAt));
      res.json(entries);
    } catch {
      res.status(500).json({ message: "Failed to fetch changelog" });
    }
  });

  const changelogBodySchema = z.object({
    title: z.string().min(1, "Title is required").max(255),
    content: z.string().min(1, "Content is required"),
    category: z
      .enum(["Feature", "Improvement", "Bugfix", "Platform"])
      .default("Platform"),
    version: z.string().max(20).optional().nullable(),
    isPublished: z.boolean().default(true),
  });

  app.post("/api/admin/changelog", async (req, res) => {
    const user = req.user as any;
    if (!user || !isAdminUser(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const parsed = changelogBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: parsed.error.flatten().fieldErrors,
      });
    }
    try {
      const { title, content, category, version, isPublished } = parsed.data;
      const [entry] = await db
        .insert(changelogEntries)
        .values({
          title,
          content,
          category,
          version: version || null,
          authorId: user.id,
          isPublished,
          publishedAt: new Date(),
        })
        .returning();
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to create changelog entry" });
    }
  });

  app.delete("/api/admin/changelog/:id", async (req, res) => {
    const user = req.user as any;
    if (!user || !isAdminUser(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      await db
        .delete(changelogEntries)
        .where(eq(changelogEntries.id, req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete changelog entry" });
    }
  });

  // ---- FAQ Endpoints ----
  app.get("/api/faq", async (_req, res) => {
    try {
      const entries = await db
        .select()
        .from(faqEntries)
        .where(eq(faqEntries.isPublished, true))
        .orderBy(faqEntries.sortOrder, faqEntries.createdAt);
      res.json(entries);
    } catch (err) {
      console.error("Failed to fetch FAQ:", err);
      res.status(500).json({ message: "Failed to fetch FAQ entries" });
    }
  });

  app.post("/api/admin/faq", requireAuth, async (req, res) => {
    const user = req.user as any;
    if (!isAdminUser(user))
      return res.status(403).json({ message: "Forbidden" });
    try {
      const parsed = insertFaqEntrySchema.parse(req.body);
      const [entry] = await db.insert(faqEntries).values(parsed).returning();
      res.json(entry);
    } catch (err: any) {
      if (err?.name === "ZodError")
        return res
          .status(400)
          .json({ message: "Invalid data", errors: err.errors });
      console.error("Failed to create FAQ:", err);
      res.status(500).json({ message: "Failed to create FAQ entry" });
    }
  });

  app.put("/api/admin/faq/:id", requireAuth, async (req, res) => {
    const user = req.user as any;
    if (!isAdminUser(user))
      return res.status(403).json({ message: "Forbidden" });
    try {
      const { question, answer, category, sortOrder, isPublished } = req.body;
      const [entry] = await db
        .update(faqEntries)
        .set({
          question,
          answer,
          category,
          sortOrder,
          isPublished,
          updatedAt: new Date(),
        })
        .where(eq(faqEntries.id, req.params.id))
        .returning();
      if (!entry)
        return res.status(404).json({ message: "FAQ entry not found" });
      res.json(entry);
    } catch (err) {
      console.error("Failed to update FAQ:", err);
      res.status(500).json({ message: "Failed to update FAQ entry" });
    }
  });

  app.delete("/api/admin/faq/:id", requireAuth, async (req, res) => {
    const user = req.user as any;
    if (!isAdminUser(user))
      return res.status(403).json({ message: "Forbidden" });
    try {
      await db.delete(faqEntries).where(eq(faqEntries.id, req.params.id));
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to delete FAQ:", err);
      res.status(500).json({ message: "Failed to delete FAQ entry" });
    }
  });

  // ---- Notifications Endpoints ----
  app.get("/api/notifications", requireAuth, async (req, res) => {
    const user = req.user as any;
    try {
      const items = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, user.id))
        .orderBy(desc(notifications.createdAt))
        .limit(50);
      res.json(items);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread-count", requireAuth, async (req, res) => {
    const user = req.user as any;
    try {
      const [result] = await db
        .select({ count: count() })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, user.id),
            eq(notifications.isRead, false),
          ),
        );
      res.json({ count: result?.count || 0 });
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    const user = req.user as any;
    try {
      const [notif] = await db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.id, req.params.id),
            eq(notifications.userId, user.id),
          ),
        )
        .returning();
      if (!notif)
        return res.status(404).json({ message: "Notification not found" });
      res.json(notif);
    } catch (err) {
      console.error("Failed to mark notification read:", err);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  app.post("/api/notifications/read-all", requireAuth, async (req, res) => {
    const user = req.user as any;
    try {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.userId, user.id),
            eq(notifications.isRead, false),
          ),
        );
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to mark all read:", err);
      res.status(500).json({ message: "Failed to mark all as read" });
    }
  });

  // ---- Activity Feed Endpoints ----
  app.get("/api/activity-feed", async (_req, res) => {
    try {
      const items = await db
        .select()
        .from(activityFeed)
        .orderBy(desc(activityFeed.createdAt))
        .limit(50);
      res.json(items);
    } catch (err) {
      console.error("Failed to fetch activity feed:", err);
      res.status(500).json({ message: "Failed to fetch activity feed" });
    }
  });

  // ---- Admin Analytics Endpoint ----
  app.get("/api/admin/analytics", requireAuth, async (req, res) => {
    const user = req.user as any;
    if (!isAdminUser(user))
      return res.status(403).json({ message: "Forbidden" });
    try {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [totalUsersResult] = await db
        .select({ count: count() })
        .from(users);
      const [newTodayResult] = await db
        .select({ count: count() })
        .from(users)
        .where(gte(users.createdAt, todayStart));
      const [newWeekResult] = await db
        .select({ count: count() })
        .from(users)
        .where(gte(users.createdAt, sevenDaysAgo));
      const [newMonthResult] = await db
        .select({ count: count() })
        .from(users)
        .where(gte(users.createdAt, thirtyDaysAgo));

      const [totalThreadsResult] = await db
        .select({ count: count() })
        .from(forumThreads);

      let totalReplies = 0;
      try {
        const [repliesResult] = await db
          .select({ count: count() })
          .from(forumReplies);
        totalReplies = repliesResult?.count || 0;
      } catch {
        totalReplies = 0;
      }

      let totalProducts = 0;
      try {
        const [productsResult] = await db
          .select({ count: count() })
          .from(products);
        totalProducts = productsResult?.count || 0;
      } catch {
        totalProducts = 0;
      }

      let totalBans = 0;
      try {
        const [bansResult] = await db.select({ count: count() }).from(bans);
        totalBans = bansResult?.count || 0;
      } catch {
        totalBans = 0;
      }

      let totalReports = 0;
      try {
        const [reportsResult] = await db
          .select({ count: count() })
          .from(reports);
        totalReports = reportsResult?.count || 0;
      } catch {
        totalReports = 0;
      }

      const recentSignupsResult = await db.execute(sql`
        SELECT DATE(created_at) as date, COUNT(*)::int as count
        FROM users
        WHERE created_at >= ${thirtyDaysAgo}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `);

      const rankDistributionResult = await db.execute(sql`
        SELECT user_rank as rank, COUNT(*)::int as count
        FROM users
        GROUP BY user_rank
        ORDER BY count DESC
      `);

      const vipCountsResult = await db.execute(sql`
        SELECT vip_tier as tier, COUNT(*)::int as count
        FROM users
        WHERE vip_tier IS NOT NULL AND vip_tier != 'none'
        GROUP BY vip_tier
        ORDER BY count DESC
      `);

      res.json({
        totalUsers: totalUsersResult?.count || 0,
        newUsersToday: newTodayResult?.count || 0,
        newUsersThisWeek: newWeekResult?.count || 0,
        newUsersThisMonth: newMonthResult?.count || 0,
        totalThreads: totalThreadsResult?.count || 0,
        totalReplies,
        totalProducts,
        totalBans,
        totalReports,
        recentSignups: (recentSignupsResult as any).rows || [],
        rankDistribution: (rankDistributionResult as any).rows || [],
        vipCounts: (vipCountsResult as any).rows || [],
      });
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // ===== DIRECT MESSAGES =====
  app.get("/api/messages", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const conversations = await db.execute(sql`
        SELECT DISTINCT ON (partner_id) partner_id, last_message, last_time, unread_count
        FROM (
          SELECT
            CASE WHEN sender_id = ${userId} THEN receiver_id ELSE sender_id END as partner_id,
            content as last_message,
            created_at as last_time,
            CASE WHEN receiver_id = ${userId} AND is_read = false THEN 1 ELSE 0 END as unread_count
          FROM direct_messages
          WHERE sender_id = ${userId} OR receiver_id = ${userId}
          ORDER BY created_at DESC
        ) sub
        ORDER BY partner_id, last_time DESC
      `);
      res.json((conversations as any).rows || []);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get("/api/messages/:userId", requireAuth, async (req, res) => {
    try {
      const currentUserId = (req.user as any).id;
      const otherUserId = req.params.userId;
      const messages = await db
        .select()
        .from(directMessages)
        .where(
          or(
            and(
              eq(directMessages.senderId, currentUserId),
              eq(directMessages.receiverId, otherUserId),
            ),
            and(
              eq(directMessages.senderId, otherUserId),
              eq(directMessages.receiverId, currentUserId),
            ),
          ),
        )
        .orderBy(directMessages.createdAt);

      await db.execute(sql`
        UPDATE direct_messages SET is_read = true
        WHERE sender_id = ${otherUserId} AND receiver_id = ${currentUserId} AND is_read = false
      `);

      res.json(messages);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const senderId = (req.user as any).id;
      const { receiverId, content } = req.body;
      if (!receiverId || !content)
        return res
          .status(400)
          .json({ message: "Receiver and content required" });

      const [msg] = await db
        .insert(directMessages)
        .values({
          senderId,
          receiverId,
          content,
        })
        .returning();

      await db.insert(notifications).values({
        userId: receiverId,
        type: "message",
        title: "New Message",
        message: `You received a new message`,
        link: `/messages?user=${senderId}`,
      });

      res.json(msg);
    } catch (err) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/messages/unread-count", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const [result] = await db
        .select({ count: count() })
        .from(directMessages)
        .where(
          and(
            eq(directMessages.receiverId, userId),
            eq(directMessages.isRead, false),
          ),
        );
      res.json({ count: result?.count || 0 });
    } catch {
      res.json({ count: 0 });
    }
  });

  // ===== REACTIONS =====
  app.post("/api/reactions", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { targetType, targetId, reactionType } = req.body;
      if (!targetType || !targetId)
        return res.status(400).json({ message: "Target required" });

      const existing = await db
        .select()
        .from(reactions)
        .where(
          and(
            eq(reactions.userId, userId),
            eq(reactions.targetType, targetType),
            eq(reactions.targetId, targetId),
            eq(reactions.reactionType, reactionType || "like"),
          ),
        );

      if (existing.length > 0) {
        await db.delete(reactions).where(eq(reactions.id, existing[0].id));
        const [countResult] = await db
          .select({ count: count() })
          .from(reactions)
          .where(
            and(
              eq(reactions.targetType, targetType),
              eq(reactions.targetId, targetId),
            ),
          );
        return res.json({ liked: false, count: countResult?.count || 0 });
      }

      await db.insert(reactions).values({
        userId,
        targetType,
        targetId,
        reactionType: reactionType || "like",
      });

      const [countResult] = await db
        .select({ count: count() })
        .from(reactions)
        .where(
          and(
            eq(reactions.targetType, targetType),
            eq(reactions.targetId, targetId),
          ),
        );
      res.json({ liked: true, count: countResult?.count || 0 });
    } catch (err) {
      res.status(500).json({ message: "Failed to toggle reaction" });
    }
  });

  app.get("/api/reactions/:targetType/:targetId", async (req, res) => {
    try {
      const { targetType, targetId } = req.params;
      const [countResult] = await db
        .select({ count: count() })
        .from(reactions)
        .where(
          and(
            eq(reactions.targetType, targetType),
            eq(reactions.targetId, targetId),
          ),
        );
      const userId = (req.user as any)?.id;
      let userReacted = false;
      if (userId) {
        const existing = await db
          .select()
          .from(reactions)
          .where(
            and(
              eq(reactions.userId, userId),
              eq(reactions.targetType, targetType),
              eq(reactions.targetId, targetId),
            ),
          );
        userReacted = existing.length > 0;
      }
      res.json({ count: countResult?.count || 0, userReacted });
    } catch {
      res.json({ count: 0, userReacted: false });
    }
  });

  // ===== ACHIEVEMENTS =====
  app.get("/api/achievements", async (_req, res) => {
    try {
      const achievements = await db
        .select()
        .from(achievementDefinitions)
        .orderBy(achievementDefinitions.category);
      res.json(achievements);
    } catch {
      res.json([]);
    }
  });

  app.get("/api/achievements/user/:userId", async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT ua.*, ad.name, ad.description, ad.icon, ad.category, ad.points
        FROM user_achievements ua
        JOIN achievement_definitions ad ON ua.achievement_id = ad.id
        WHERE ua.user_id = ${req.params.userId}
        ORDER BY ua.earned_at DESC
      `);
      res.json((result as any).rows || []);
    } catch {
      res.json([]);
    }
  });

  app.post("/api/admin/achievements", requireAuth, async (req, res) => {
    const user = req.user as any;
    if (!isAdminUser(user))
      return res.status(403).json({ message: "Forbidden" });
    try {
      const { name, description, icon, category, points } = req.body;
      const [achievement] = await db
        .insert(achievementDefinitions)
        .values({
          name,
          description,
          icon: icon || "trophy",
          category: category || "general",
          points: points || 10,
        })
        .returning();
      res.json(achievement);
    } catch (err) {
      res.status(500).json({ message: "Failed to create achievement" });
    }
  });

  app.post("/api/admin/achievements/grant", requireAuth, async (req, res) => {
    const user = req.user as any;
    if (!isAdminUser(user))
      return res.status(403).json({ message: "Forbidden" });
    try {
      const { userId, achievementId } = req.body;
      const existing = await db
        .select()
        .from(userAchievements)
        .where(
          and(
            eq(userAchievements.userId, userId),
            eq(userAchievements.achievementId, achievementId),
          ),
        );
      if (existing.length > 0)
        return res.status(400).json({ message: "Already earned" });

      const [ua] = await db
        .insert(userAchievements)
        .values({ userId, achievementId })
        .returning();

      const [achDef] = await db
        .select()
        .from(achievementDefinitions)
        .where(eq(achievementDefinitions.id, achievementId));
      if (achDef) {
        await db.execute(
          sql`UPDATE users SET reputation_points = COALESCE(reputation_points, 0) + ${achDef.points} WHERE id = ${userId}`,
        );
        await db.insert(notifications).values({
          userId,
          type: "achievement",
          title: "Achievement Unlocked!",
          message: `You earned "${achDef.name}" (+${achDef.points} rep)`,
          link: `/profile`,
        });
      }
      res.json(ua);
    } catch (err) {
      res.status(500).json({ message: "Failed to grant achievement" });
    }
  });

  // ===== BOOKMARKS =====
  app.get("/api/bookmarks", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const userBookmarks = await db
        .select()
        .from(bookmarks)
        .where(eq(bookmarks.userId, userId))
        .orderBy(desc(bookmarks.createdAt));
      res.json(userBookmarks);
    } catch {
      res.json([]);
    }
  });

  app.post("/api/bookmarks", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { targetType, targetId } = req.body;
      if (!targetType || !targetId)
        return res.status(400).json({ message: "Target required" });

      const existing = await db
        .select()
        .from(bookmarks)
        .where(
          and(
            eq(bookmarks.userId, userId),
            eq(bookmarks.targetType, targetType),
            eq(bookmarks.targetId, targetId),
          ),
        );

      if (existing.length > 0) {
        await db.delete(bookmarks).where(eq(bookmarks.id, existing[0].id));
        return res.json({ bookmarked: false });
      }

      await db.insert(bookmarks).values({ userId, targetType, targetId });
      res.json({ bookmarked: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to toggle bookmark" });
    }
  });

  // ===== FORUM POLLS =====
  app.post("/api/forums/polls", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { threadId, question, options, allowMultiple, endsAt } = req.body;
      if (!threadId || !question || !options)
        return res.status(400).json({ message: "Missing fields" });

      const [thread] = await db.select().from(forumThreads).where(eq(forumThreads.id, threadId)).limit(1);
      if (!thread) return res.status(404).json({ message: "Thread not found" });
      if (thread.authorId !== userId && !isAdminUser(req.user as any) && !isForumStaff(req.user as any)) {
        return res.status(403).json({ message: "Only the thread author or staff can add a poll" });
      }

      const [poll] = await db
        .insert(forumPolls)
        .values({
          threadId,
          question,
          options,
          allowMultiple: allowMultiple || false,
          endsAt: endsAt ? new Date(endsAt) : null,
        })
        .returning();
      res.json(poll);
    } catch (err) {
      res.status(500).json({ message: "Failed to create poll" });
    }
  });

  app.get("/api/forums/polls/:threadId", async (req, res) => {
    try {
      const polls = await db
        .select()
        .from(forumPolls)
        .where(eq(forumPolls.threadId, req.params.threadId));
      res.json(polls[0] || null);
    } catch {
      res.json(null);
    }
  });

  app.post("/api/forums/polls/:pollId/vote", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { optionIndex } = req.body;
      const pollId = req.params.pollId;

      const [poll] = await db
        .select()
        .from(forumPolls)
        .where(eq(forumPolls.id, pollId));
      if (!poll) return res.status(404).json({ message: "Poll not found" });

      if (poll.endsAt && new Date(poll.endsAt) < new Date()) {
        return res.status(400).json({ message: "Poll has ended" });
      }

      const votes = (poll.votes as Record<string, string[]>) || {};
      for (const key of Object.keys(votes)) {
        votes[key] = (votes[key] || []).filter((id: string) => id !== userId);
      }
      const optKey = String(optionIndex);
      if (!votes[optKey]) votes[optKey] = [];
      votes[optKey].push(userId);

      await db
        .update(forumPolls)
        .set({ votes })
        .where(eq(forumPolls.id, pollId));
      const [updated] = await db
        .select()
        .from(forumPolls)
        .where(eq(forumPolls.id, pollId));
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to vote" });
    }
  });

  // ===== REFERRAL SYSTEM =====
  app.get("/api/referral/code", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      let code = (user as any).referralCode;
      if (!code) {
        const crypto = await import("crypto");
        code = crypto.randomBytes(6).toString("hex");
        await db.execute(
          sql`UPDATE users SET referral_code = ${code} WHERE id = ${userId}`,
        );
      }
      const referralCount = await db.execute(
        sql`SELECT COUNT(*) as count FROM users WHERE referred_by = ${userId}`,
      );
      res.json({
        code,
        referralCount: parseInt(
          (referralCount as any).rows?.[0]?.count || "0",
          10,
        ),
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to get referral code" });
    }
  });

  app.post("/api/referral/apply", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { referralCode } = req.body;
      if (!referralCode)
        return res.status(400).json({ message: "Missing referral code" });

      const currentUser = await db.execute(
        sql`SELECT referred_by FROM users WHERE id = ${userId}`,
      );
      const current = (currentUser as any).rows?.[0];
      if (current?.referred_by)
        return res.status(400).json({ message: "Referral already applied" });

      const referrerResult = await db.execute(
        sql`SELECT id FROM users WHERE referral_code = ${referralCode}`,
      );
      const referrer = (referrerResult as any).rows?.[0];
      if (!referrer)
        return res.status(404).json({ message: "Invalid referral code" });
      if (referrer.id === userId)
        return res.status(400).json({ message: "Cannot refer yourself" });

      await db.execute(
        sql`UPDATE users SET referred_by = ${referrer.id} WHERE id = ${userId} AND referred_by IS NULL`,
      );
      await db.execute(
        sql`UPDATE users SET reputation_points = COALESCE(reputation_points, 0) + 10 WHERE id = ${referrer.id}`,
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to apply referral" });
    }
  });

  // ===== AUDIT LOG =====
  app.get("/api/admin/audit-log", requireAuth, async (req, res) => {
    const user = req.user as any;
    if (!isAdminUser(user))
      return res.status(403).json({ message: "Forbidden" });
    try {
      const limitVal = Math.min(
        Math.max(parseInt(req.query.limit as string) || 50, 1),
        200,
      );
      const offsetVal = Math.max(parseInt(req.query.offset as string) || 0, 0);
      const actionFilter = req.query.action as string;

      let result;
      if (actionFilter) {
        result = await db.execute(
          sql`SELECT * FROM audit_log WHERE action = ${actionFilter} ORDER BY created_at DESC LIMIT ${limitVal} OFFSET ${offsetVal}`,
        );
      } else {
        result = await db.execute(
          sql`SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ${limitVal} OFFSET ${offsetVal}`,
        );
      }
      res.json((result as any).rows || []);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch audit log" });
    }
  });

  // ===== USER REPUTATION =====
  app.get("/api/users/:userId/reputation", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const achievements = await db.execute(sql`
        SELECT ua.*, ad.name, ad.description, ad.icon, ad.points
        FROM user_achievements ua
        JOIN achievement_definitions ad ON ua.achievement_id = ad.id
        WHERE ua.user_id = ${req.params.userId}
        ORDER BY ua.earned_at DESC
      `);
      res.json({
        reputationPoints: (user as any).reputationPoints || 0,
        achievements: (achievements as any).rows || [],
      });
    } catch {
      res.json({ reputationPoints: 0, achievements: [] });
    }
  });

  // ===== RATE LIMITING MIDDLEWARE =====
  const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
  function rateLimit(windowMs: number, maxRequests: number) {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = `${(req as any).ip || "unknown"}-${req.path}`;
      const now = Date.now();
      const entry = rateLimitMap.get(key);
      if (!entry || now > entry.resetAt) {
        rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
        return next();
      }
      if (entry.count >= maxRequests) {
        return res
          .status(429)
          .json({ message: "Too many requests. Please try again later." });
      }
      entry.count++;
      next();
    };
  }

  // Apply rate limiting to auth endpoints
  app.use("/api/auth/login", rateLimit(15 * 60 * 1000, 10));
  app.use("/api/auth/signup", rateLimit(60 * 60 * 1000, 5));
  app.use("/api/auth/forgot-password", rateLimit(15 * 60 * 1000, 3));

  // ---- Security / session info endpoint ----
  app.get("/api/auth/security-info", async (req, res) => {
    if (!(req as any).isAuthenticated?.() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUser((req.user as any).id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const hasPassword = !!(user as any).password;
    const hasDiscord = !!user.discordId;
    const hasRoblox = !!user.robloxId;
    const emailVerified = !!user.email;

    let activeSessions = 0;
    try {
      const result = await db.execute(
        sql`SELECT COUNT(*) as count FROM sessions WHERE sess::jsonb->'passport'->>'user' = ${user.id} AND expire > NOW()`,
      );
      activeSessions = parseInt((result as any).rows?.[0]?.count || "1", 10);
    } catch {
      activeSessions = 1;
    }

    res.json({
      hasPassword,
      hasDiscord,
      hasRoblox,
      emailVerified,
      activeSessions,
      accountCreated: user.createdAt,
      lastLogin: user.updatedAt || user.createdAt,
      twoFactorEnabled: !!(user as any).twoFactorEnabled,
    });
  });

  // ===== TWO-FACTOR AUTHENTICATION =====
  app.post("/api/auth/2fa/setup", async (req, res) => {
    if (!(req as any).isAuthenticated?.() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await storage.getUser((req.user as any).id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if ((user as any).twoFactorEnabled) {
        return res.status(400).json({ message: "2FA is already enabled" });
      }

      const secret = generateSecret();

      const otpauth = generateURI({
        issuer: "RIVET Studios",
        label: user.email || user.username || "user",
        secret,
      });

      const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

      await db.execute(
        sql`UPDATE users SET two_factor_secret = ${secret} WHERE id = ${user.id}`,
      );

      res.json({ secret, qrCode: qrCodeDataUrl });
    } catch (error) {
      console.error("2FA setup error:", error);
      res.status(500).json({ message: "Failed to set up 2FA" });
    }
  });

  app.post("/api/auth/2fa/verify", async (req, res) => {
    if (!(req as any).isAuthenticated?.() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ message: "Token required" });

      const user = await storage.getUser((req.user as any).id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const secret = (user as any).twoFactorSecret;
      if (!secret) return res.status(400).json({ message: "2FA not set up" });

      const result = await verify({ secret, token });
      if (!result.valid) {
        return res.status(400).json({ message: "Invalid code" });
      }

      const backupCodes = Array.from({ length: 8 }, () =>
        crypto.randomBytes(4).toString("hex"),
      );

      await db.execute(
        sql`UPDATE users SET two_factor_enabled = true, two_factor_backup_codes = ${JSON.stringify(backupCodes)} WHERE id = ${user.id}`,
      );

      res.json({ success: true, backupCodes });
    } catch (error) {
      console.error("2FA verify error:", error);
      res.status(500).json({ message: "Failed to verify 2FA" });
    }
  });

  app.post("/api/auth/2fa/disable", async (req, res) => {
    if (!(req as any).isAuthenticated?.() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ message: "Token required" });

      const user = await storage.getUser((req.user as any).id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!(user as any).twoFactorEnabled) {
        return res.status(400).json({ message: "2FA is not enabled" });
      }

      const secret = (user as any).twoFactorSecret;
      const result = await verify({ secret, token });

      if (!result.valid) {
        const backupCodes = JSON.parse(
          (user as any).twoFactorBackupCodes || "[]",
        );
        const codeIndex = backupCodes.indexOf(token);

        if (codeIndex === -1) {
          return res.status(400).json({ message: "Invalid code" });
        }

        backupCodes.splice(codeIndex, 1);

        await db.execute(
          sql`UPDATE users SET two_factor_backup_codes = ${JSON.stringify(backupCodes)} WHERE id = ${user.id}`,
        );
      }

      await db.execute(
        sql`UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL, two_factor_backup_codes = NULL WHERE id = ${user.id}`,
      );

      res.json({ success: true });
    } catch (error) {
      console.error("2FA disable error:", error);
      res.status(500).json({ message: "Failed to disable 2FA" });
    }
  });

  app.post("/api/auth/2fa/validate", async (req, res) => {
    try {
      const { userId, token } = req.body;
      if (!userId || !token) {
        return res.status(400).json({ message: "User ID and token required" });
      }

      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!(user as any).twoFactorEnabled) {
        return res.json({ success: true });
      }

      const secret = (user as any).twoFactorSecret;
      const result = await verify({ secret, token });

      if (result.valid) {
        return res.json({ success: true });
      }

      const backupCodes = JSON.parse(
        (user as any).twoFactorBackupCodes || "[]",
      );
      const codeIndex = backupCodes.indexOf(token);

      if (codeIndex !== -1) {
        backupCodes.splice(codeIndex, 1);

        await db.execute(
          sql`UPDATE users SET two_factor_backup_codes = ${JSON.stringify(backupCodes)} WHERE id = ${user.id}`,
        );

        return res.json({ success: true });
      }

      res.status(400).json({ message: "Invalid 2FA code" });
    } catch (error) {
      console.error("2FA validate error:", error);
      res.status(500).json({ message: "Failed to validate 2FA" });
    }
  });

  return httpServer;
}
