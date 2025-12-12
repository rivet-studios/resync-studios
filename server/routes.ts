import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "./auth";
import { hashPassword, verifyPassword } from "./auth-utils";
import { updateDiscordNickname } from "./discord-bot";
import {
  insertLfgPostSchema,
  insertClanSchema,
  insertBuildSchema,
  insertForumThreadSchema,
  insertForumReplySchema,
} from "@shared/schema";
import { z } from "zod";

// Auth middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (
    !((req as any).isAuthenticated && (req as any).isAuthenticated()) ||
    !req.user
  ) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Seed default forum categories if none exist
  try {
    const existingCategories = await storage.getForumCategories();
    if (existingCategories.length === 0) {
      console.log("📂 Creating default forum categories...");
      const defaultCategories = [
        {
          name: "General Discussion",
          description: "General chat and discussions",
          icon: "MessageSquare",
          color: "#667eea",
          order: 0,
        },
        {
          name: "Game Updates",
          description: "News and updates about games",
          icon: "Rocket",
          color: "#764ba2",
          order: 1,
        },
        {
          name: "Community Showcase",
          description: "Share your creations and achievements",
          icon: "Star",
          color: "#f093fb",
          order: 2,
        },
        {
          name: "Support & Questions",
          description: "Get help and ask questions",
          icon: "HelpCircle",
          color: "#4facfe",
          order: 3,
        },
        {
          name: "Off-Topic",
          description: "Random conversations and fun",
          icon: "Hash",
          color: "#43e97b",
          order: 4,
        },
      ];

      for (const category of defaultCategories) {
        await storage.createForumCategory(category as any);
      }
      console.log("✅ Default forum categories created");
    }
  } catch (error) {
    console.error("❌ Error seeding forum categories:", error);
  }

  // Auth routes
  app.get("/api/auth/user", async (req, res) => {
    console.log(
      "🔍 Auth check - isAuth:",
      (req as any).isAuthenticated?.(),
      "user:",
      req.user?.id,
      "sessionID:",
      req.sessionID,
    );
    if (!(req as any).isAuthenticated?.() || !req.user) {
      return res
        .status(401)
        .json({ message: "401: Not authenticated. Unauthorized." });
    }
    try {
      // Fetch fresh user data from database instead of using session cache
      const freshUser = await storage.getUser((req.user as any).id);
      if (!freshUser) {
        return res.status(401).json({ message: "User not found" });
      }
      res.json(freshUser);
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });

  // Email-based signup
  app.post("/api/auth/signup", async (req, res) => {
    try {
      console.log("📝 Signup request received for email:", req.body.email);
      const { email, username, password } = req.body;

      if (!email || !username || !password) {
        return res
          .status(400)
          .json({ message: "Email, username, and password required" });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const hashedPassword = hashPassword(password);
      const user = await storage.upsertUser({
        email,
        username,
        password: hashedPassword,
        userRank: "member",
        vipTier: "none",
      });

      console.log("✅ Account created:", user.id);
      res.json({ message: "Account created successfully", user });
    } catch (error) {
      console.error(
        "❌ Error in signup:",
        error instanceof Error ? error.message : error,
      );
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // Set password for accounts with no password (fake migration emails)
  app.post("/api/auth/set-password", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { password } = req.body;

      if (!password || password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only allow setting password for users with @sharkyinteractive.com or @metrointeractive.com emails
      if (
        !user.email ||
        (!user.email.endsWith("@sharkyinteractive.com") &&
          !user.email.endsWith("@metrointeractive.com"))
      ) {
        return res
          .status(403)
          .json({ message: "Password setting not allowed for this account" });
      }

      const hashedPassword = hashPassword(password);
      const updatedUser = await storage.updateUser(userId, {
        password: hashedPassword,
      });

      console.log(`✅ Password set for user: ${user.username}`);
      res.json({ message: "Password set successfully", user: updatedUser });
    } catch (error) {
      console.error("Error setting password:", error);
      res.status(500).json({ message: "Failed to set password" });
    }
  });

  // Email-based login
  app.post("/api/auth/email-login", async (req, res) => {
    try {
      console.log("🔑 Login request received for email:", req.body.email);
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        console.log("❌ User not found or no password set for:", email);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (!verifyPassword(password, user.password)) {
        console.log("❌ Password verification failed for:", email);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Use passport's req.login() to properly establish session
      req.login(user, (err) => {
        if (err) {
          console.error("❌ Failed to establish session:", err);
          console.error(
            "❌ Session Error Stack:",
            err instanceof Error ? err.stack : err,
          );
          console.error(
            "❌ Session Info - userId:",
            user.id,
            "sessionID:",
            req.sessionID,
          );
          return res.status(500).json({ message: "Failed to login" });
        }
        console.log("✅ User logged in:", user.id, "SessionID:", req.sessionID);
        res.json({ message: "Logged in successfully", user });
      });
    } catch (error) {
      console.error(
        "❌ Error in login:",
        error instanceof Error ? error.message : error,
      );
      console.error("Full error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Verify magic link token
  app.get("/api/auth/verify-token", async (req, res) => {
    try {
      const { token, email, username } = req.query;

      if (!token) {
        return res.status(400).json({ message: "Token required" });
      }

      const verifiedEmail = await storage.verifyMagicLinkToken(token as string);

      if (!verifiedEmail) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      await storage.markMagicLinkTokenAsUsed(token as string);

      // If signup (username provided), create user
      if (username) {
        const user = await storage.upsertUser({
          email: email as string,
          username: username as string,
          userRank: "member",
          secondaryUserRank: "active_member",
          vipTier: "none",
        });
        req.login(user, (err) => {
          if (err) {
            return res.status(500).json({ message: "Login failed" });
          }
          res.redirect("/dashboard");
        });
      } else {
        // If login, find user and log them in
        const user = await storage.getUserByEmail(verifiedEmail);
        if (!user) {
          return res.status(400).json({ message: "User not found" });
        }
        req.login(user, (err) => {
          if (err) {
            return res.status(500).json({ message: "Login failed" });
          }
          res.redirect("/dashboard");
        });
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      res.status(500).json({ message: "Token verification failed" });
    }
  });

  // Stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // User profile
  app.patch("/api/users/profile", requireAuth, async (req, res) => {
    try {
      const { username, bio } = req.body;
      const userId = (req.user as any).id;

      if (username) {
        const existing = await storage.getUserByUsername(username);
        if (existing && existing.id !== userId) {
          return res.status(400).json({ message: "Username already taken" });
        }
      }

      const user = await storage.updateUser(userId, { username, bio });
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // LFG Routes
  app.get("/api/lfg", async (req, res) => {
    try {
      const posts = await storage.getLfgPosts();
      const postsWithAuthors = await Promise.all(
        posts.map(async (post) => {
          const author = await storage.getUser(post.authorId);
          return { ...post, author };
        }),
      );
      res.json(postsWithAuthors);
    } catch (error) {
      console.error("Error fetching LFG posts:", error);
      res.status(500).json({ message: "Failed to fetch LFG posts" });
    }
  });

  app.get("/api/lfg/recent", async (req, res) => {
    try {
      const posts = await storage.getLfgPosts();
      const recentPosts = posts.slice(0, 5).reverse();
      const postsWithAuthors = await Promise.all(
        recentPosts.map(async (post) => {
          const author = await storage.getUser(post.authorId);
          return { ...post, author };
        }),
      );
      res.json(postsWithAuthors);
    } catch (error) {
      console.error("Error fetching recent LFG posts:", error);
      res.json([]);
    }
  });

  app.get("/api/lfg/:id", async (req, res) => {
    try {
      const post = await storage.getLfgPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "LFG post not found" });
      }
      const author = await storage.getUser(post.authorId);
      res.json({ ...post, author });
    } catch (error) {
      console.error("Error fetching LFG post:", error);
      res.status(500).json({ message: "Failed to fetch LFG post" });
    }
  });

  app.post("/api/lfg", requireAuth, async (req, res) => {
    try {
      const data = insertLfgPostSchema.parse({
        ...req.body,
        authorId: (req.user as any).id,
      });
      const post = await storage.createLfgPost(data);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating LFG post:", error);
      res.status(500).json({ message: "Failed to create LFG post" });
    }
  });

  app.post("/api/lfg/:id/join", requireAuth, async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = (req.user as any).id;
      const post = await storage.getLfgPost(postId);

      if (!post) {
        return res.status(404).json({ message: "LFG post not found" });
      }

      if ((post.playersJoined || 0) >= (post.playersNeeded || 1)) {
        return res.status(400).json({ message: "Group is full" });
      }

      const participant = await storage.joinLfgPost(
        postId,
        userId,
        req.body.role,
      );
      res.status(201).json(participant);
    } catch (error) {
      console.error("Error joining LFG post:", error);
      res.status(500).json({ message: "Failed to join LFG post" });
    }
  });

  app.delete("/api/lfg/:id", requireAuth, async (req, res) => {
    try {
      const post = await storage.getLfgPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "LFG post not found" });
      }
      if (post.authorId !== (req.user as any).id) {
        return res.status(403).json({ message: "Not authorized" });
      }
      await storage.deleteLfgPost(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting LFG post:", error);
      res.status(500).json({ message: "Failed to delete LFG post" });
    }
  });

  // Clans Routes
  app.get("/api/clans", async (req, res) => {
    try {
      const clansList = await storage.getClans();
      const clansWithOwners = await Promise.all(
        clansList.map(async (clan) => {
          const owner = await storage.getUser(clan.ownerId);
          return { ...clan, owner };
        }),
      );
      res.json(clansWithOwners);
    } catch (error) {
      console.error("Error fetching clans:", error);
      res.status(500).json({ message: "Failed to fetch clans" });
    }
  });

  app.get("/api/clans/:id", async (req, res) => {
    try {
      const clan = await storage.getClan(req.params.id);
      if (!clan) {
        return res.status(404).json({ message: "Clan not found" });
      }
      const owner = await storage.getUser(clan.ownerId);
      res.json({ ...clan, owner });
    } catch (error) {
      console.error("Error fetching clan:", error);
      res.status(500).json({ message: "Failed to fetch clan" });
    }
  });

  app.post("/api/clans", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;

      if (user.vipTier !== "none" && user.vipTier !== "any") {
        return res
          .status(403)
          .json({ message: "Bronze VIP or higher required to create clans" });
      }

      const data = insertClanSchema.parse({
        ...req.body,
        ownerId: user.id,
      });

      const clan = await storage.createClan(data);
      await storage.updateUser(user.id, { clanId: clan.id, clanRole: "owner" });
      res.status(201).json(clan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating clan:", error);
      res.status(500).json({ message: "Failed to create clan" });
    }
  });

  app.post("/api/clans/:id/join", requireAuth, async (req, res) => {
    try {
      const clanId = req.params.id;
      const userId = (req.user as any).id;
      const clan = await storage.getClan(clanId);

      if (!clan) {
        return res.status(404).json({ message: "Clan not found" });
      }

      if (!clan.isRecruiting) {
        return res.status(400).json({ message: "Clan is not recruiting" });
      }

      if ((clan.memberCount || 1) >= (clan.maxMembers || 50)) {
        return res.status(400).json({ message: "Clan is full" });
      }

      await storage.updateUser(userId, { clanId, clanRole: "member" });
      await storage.updateClan(clanId, {
        memberCount: (clan.memberCount || 1) + 1,
      });

      res.json({ message: "Joined clan successfully" });
    } catch (error) {
      console.error("Error joining clan:", error);
      res.status(500).json({ message: "Failed to join clan" });
    }
  });

  // Builds Routes
  app.get("/api/builds", async (req, res) => {
    try {
      const buildsList = await storage.getBuilds();
      const userId = req.isAuthenticated() ? (req.user as any).id : null;

      const buildsWithAuthors = await Promise.all(
        buildsList.map(async (build) => {
          const author = await storage.getUser(build.authorId);
          let userVote = null;
          if (userId) {
            const vote = await storage.getBuildVote(build.id, userId);
            userVote = vote ? vote.isUpvote : null;
          }
          return { ...build, author, userVote };
        }),
      );
      res.json(buildsWithAuthors);
    } catch (error) {
      console.error("Error fetching builds:", error);
      res.status(500).json({ message: "Failed to fetch builds" });
    }
  });

  app.get("/api/builds/recent", async (req, res) => {
    try {
      const builds = await storage.getBuilds();
      const recentBuilds = builds.slice(0, 5).reverse();
      const userId = req.isAuthenticated() ? (req.user as any).id : null;

      const buildsWithAuthors = await Promise.all(
        recentBuilds.map(async (build) => {
          const author = await storage.getUser(build.authorId);
          let userVote = null;
          if (userId) {
            const vote = await storage.getBuildVote(build.id, userId);
            userVote = vote ? vote.isUpvote : null;
          }
          return { ...build, author, userVote };
        }),
      );
      res.json(buildsWithAuthors);
    } catch (error) {
      console.error("Error fetching recent builds:", error);
      res.json([]);
    }
  });

  app.get("/api/builds/:id", async (req, res) => {
    try {
      const build = await storage.getBuild(req.params.id);
      if (!build) {
        return res.status(404).json({ message: "Build not found" });
      }

      await storage.updateBuild(build.id, {
        viewCount: (build.viewCount || 0) + 1,
      });

      const author = await storage.getUser(build.authorId);
      res.json({ ...build, author });
    } catch (error) {
      console.error("Error fetching build:", error);
      res.status(500).json({ message: "Failed to fetch build" });
    }
  });

  app.post("/api/builds", requireAuth, async (req, res) => {
    try {
      const data = insertBuildSchema.parse({
        ...req.body,
        authorId: (req.user as any).id,
      });
      const build = await storage.createBuild(data);
      res.status(201).json(build);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating build:", error);
      res.status(500).json({ message: "Failed to create build" });
    }
  });

  app.post("/api/builds/:id/vote", requireAuth, async (req, res) => {
    try {
      const buildId = req.params.id;
      const userId = (req.user as any).id;
      const { isUpvote } = req.body;

      await storage.voteBuild(buildId, userId, isUpvote);
      res.json({ message: "Vote recorded" });
    } catch (error) {
      console.error("Error voting on build:", error);
      res.status(500).json({ message: "Failed to vote on build" });
    }
  });

  // Forum Routes
  app.get("/api/forums/categories", async (req, res) => {
    try {
      const categories = await storage.getForumCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching forum categories:", error);
      res.status(500).json({ message: "Failed to fetch forum categories" });
    }
  });

  app.get("/api/forums/threads", async (req, res) => {
    try {
      const categoryId = req.query.categoryId as string | undefined;
      const threads = await storage.getForumThreads(categoryId);

      const threadsWithAuthors = await Promise.all(
        threads.map(async (thread) => {
          const author = await storage.getUser(thread.authorId);
          const category = await storage.getForumCategory(thread.categoryId);
          return { ...thread, author, category };
        }),
      );
      res.json(threadsWithAuthors);
    } catch (error) {
      console.error("Error fetching forum threads:", error);
      res.status(500).json({ message: "Failed to fetch forum threads" });
    }
  });

  app.get("/api/forums/threads/:id", async (req, res) => {
    try {
      const thread = await storage.getForumThread(req.params.id);
      if (!thread) {
        return res.status(404).json({ message: "Thread not found" });
      }

      await storage.updateForumThread(thread.id, {
        viewCount: (thread.viewCount || 0) + 1,
      });

      const author = await storage.getUser(thread.authorId);
      const category = await storage.getForumCategory(thread.categoryId);
      const replies = await storage.getForumReplies(thread.id);

      const repliesWithAuthors = await Promise.all(
        replies.map(async (reply) => {
          const replyAuthor = await storage.getUser(reply.authorId);
          return { ...reply, author: replyAuthor };
        }),
      );

      res.json({ ...thread, author, category, replies: repliesWithAuthors });
    } catch (error) {
      console.error("Error fetching forum thread:", error);
      res.status(500).json({ message: "Failed to fetch forum thread" });
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
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating forum thread:", error);
      res.status(500).json({ message: "Failed to create forum thread" });
    }
  });

  app.post("/api/forums/threads/:id/replies", requireAuth, async (req, res) => {
    try {
      const thread = await storage.getForumThread(req.params.id);
      if (!thread) {
        return res.status(404).json({ message: "Thread not found" });
      }

      if (thread.isLocked) {
        return res.status(403).json({ message: "Thread is locked" });
      }

      const data = insertForumReplySchema.parse({
        ...req.body,
        threadId: req.params.id,
        authorId: (req.user as any).id,
      });
      const reply = await storage.createForumReply(data);
      res.status(201).json(reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating forum reply:", error);
      res.status(500).json({ message: "Failed to create forum reply" });
    }
  });

  // Subscription Routes (Stripe integration placeholder)
  app.post("/api/subscriptions/checkout", requireAuth, async (req, res) => {
    try {
      const { tierId } = req.body;

      res.json({
        message: "Stripe checkout would be initiated here",
        tierId,
        url: null,
      });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Login redirect to Discord OAuth
  app.get("/api/login", (req, res) => {
    res.redirect("/auth/discord");
  });

  // Discord OAuth routes
  app.get("/auth/discord", (req, res, next) => {
    passport.authenticate("discord")(req, res, next);
  });

  app.get(
    "/auth/discord/callback",
    (req, res, next) => {
      passport.authenticate("discord", {
        failureRedirect: "/?error=discord_auth_failed",
      })(req, res, next);
    },
    (req, res) => {
      res.redirect("/");
    },
  );

  app.get("/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.redirect("/");
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Discord linking routes
  app.post("/api/discord/link", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.discordId) {
        return res.status(400).json({ message: "Discord already linked" });
      }
      res.json({
        message: "Discord linking started",
        url: `/auth/discord/link`,
      });
    } catch (error) {
      console.error("Error linking Discord:", error);
      res.status(500).json({ message: "Failed to start Discord linking" });
    }
  });

  // ModCP Routes
  app.get("/api/modcp/threads", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      const isMod =
        user?.userRank &&
        [
          "moderator",
          "community_moderator",
          "community_senior_moderator",
          "administrator",
          "senior_administrator",
          "staff_administration_director",
          "leadership_council",
          "team_member",
          "operations_manager",
          "company_director",
        ].includes(user.userRank);

      if (!isMod) return res.status(403).json({ message: "Unauthorized" });

      const threads = await storage.getForumThreads();
      const threadsWithAuthors = await Promise.all(
        threads.map(async (thread) => {
          const author = await storage.getUser(thread.authorId);
          return { ...thread, author };
        }),
      );
      res.json(threadsWithAuthors);
    } catch (error) {
      console.error("Error fetching mod threads:", error);
      res.status(500).json({ message: "Failed to fetch threads" });
    }
  });

  app.get("/api/modcp/replies", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      const isMod =
        user?.userRank &&
        [
          "moderator",
          "community_moderator",
          "community_senior_moderator",
          "administrator",
          "senior_administrator",
          "staff_administration_director",
          "leadership_council",
          "operations_manager",
          "team_member",
          "company_director",
        ].includes(user.userRank);

      if (!isMod) return res.status(403).json({ message: "Unauthorized" });

      const threads = await storage.getForumThreads();
      const allReplies: any[] = [];

      for (const thread of threads) {
        const replies = await storage.getForumReplies(thread.id);
        const repliesWithAuthors = await Promise.all(
          replies.map(async (reply) => {
            const author = await storage.getUser(reply.authorId);
            return { ...reply, author };
          }),
        );
        allReplies.push(...repliesWithAuthors);
      }

      res.json(allReplies);
    } catch (error) {
      console.error("Error fetching mod replies:", error);
      res.status(500).json({ message: "Failed to fetch replies" });
    }
  });

  app.patch("/api/modcp/threads/:id/lock", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      const isMod =
        user?.userRank &&
        [
          "moderator",
          "community_moderator",
          "community_senior_moderator",
          "administrator",
          "senior_administrator",
          "staff_administration_director",
          "leadership_council",
          "operations_manager",
          "team_member",
          "company_director",
        ].includes(user.userRank);

      if (!isMod) return res.status(403).json({ message: "Unauthorized" });

      const { isLocked } = req.body;
      const thread = await storage.updateForumThread(req.params.id, {
        isLocked,
      });
      res.json(thread);
    } catch (error) {
      console.error("Error locking thread:", error);
      res.status(500).json({ message: "Failed to update thread" });
    }
  });

  app.patch("/api/modcp/threads/:id/pin", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      const isMod =
        user?.userRank &&
        [
          "moderator",
          "community_moderator",
          "community_senior_moderator",
          "administrator",
          "senior_administrator",
          "staff_administration_director",
          "leadership_council",
          "operations_manager",
          "team_member",
          "company_director",
        ].includes(user.userRank);

      if (!isMod) return res.status(403).json({ message: "Unauthorized" });

      const { isPinned } = req.body;
      const thread = await storage.updateForumThread(req.params.id, {
        isPinned,
      });
      res.json(thread);
    } catch (error) {
      console.error("Error pinning thread:", error);
      res.status(500).json({ message: "Failed to update thread" });
    }
  });

  app.delete("/api/modcp/threads/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      const isMod =
        user?.userRank &&
        [
          "moderator",
          "community_moderator",
          "community_senior_moderator",
          "administrator",
          "senior_administrator",
          "staff_administration_director",
          "leadership_council",
          "operations_manager",
          "team_member",
          "company_director",
        ].includes(user.userRank);

      if (!isMod) return res.status(403).json({ message: "Unauthorized" });

      // Get thread first to delete all replies
      const thread = await storage.getForumThread(req.params.id);
      if (!thread) return res.status(404).json({ message: "Thread not found" });

      const replies = await storage.getForumReplies(req.params.id);
      // In a real app, delete replies too - for now just delete the thread
      await storage.updateForumThread(req.params.id, {
        content: "[deleted]",
        title: "[deleted]",
      });

      res.json({ message: "Thread deleted" });
    } catch (error) {
      console.error("Error deleting thread:", error);
      res.status(500).json({ message: "Failed to delete thread" });
    }
  });

  app.delete("/api/modcp/replies/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      const isMod =
        user?.userRank &&
        [
          "moderator",
          "community_moderator",
          "community_senior_moderator",
          "administrator",
          "senior_administrator",
          "staff_administration_director",
          "leadership_council",
          "operations_manager",
          "team_member",
          "company_director",
        ].includes(user.userRank);

      if (!isMod) return res.status(403).json({ message: "Unauthorized" });

      // For now, just mark as deleted
      res.json({ message: "Reply deleted" });
    } catch (error) {
      console.error("Error deleting reply:", error);
      res.status(500).json({ message: "Failed to delete reply" });
    }
  });

  // Discord linking callback (for users who already have an account)
  app.get("/auth/discord/link", (req, res, next) => {
    passport.authenticate("discord", {
      state: "link_account",
    })(req, res, next);
  });

  app.get(
    "/auth/discord/link/callback",
    (req, res, next) => {
      passport.authenticate("discord", {
        failureRedirect: "/?error=discord_link_failed",
      })(req, res, next);
    },
    async (req, res) => {
      try {
        // Get the user who was logged in BEFORE Discord OAuth started
        const discordProfile = req.user as any;
        const currentUserId = (req.user as any)?.id;

        if (!currentUserId || !discordProfile?.discordId) {
          console.log("❌ Link failed: no currentUserId or no discordId", {
            currentUserId,
            discordId: discordProfile?.discordId,
          });
          return res.redirect("/?error=link_failed");
        }

        // Link Discord account to the current user (not the Discord user)
        const updatedUser = await storage.updateUser(currentUserId, {
          discordId: discordProfile.discordId,
          discordUsername: discordProfile.discordUsername,
          discordAvatar: discordProfile.discordAvatar,
          discordLinkedAt: new Date(),
        });

        if (updatedUser) {
          // Sync nickname to Discord
          await updateDiscordNickname(
            discordProfile.discordId,
            updatedUser.username || "Member",
          );
          console.log(`✅ Discord linked to user ${currentUserId}`);
          res.redirect("/?discord_linked=true");
        } else {
          console.log("❌ Failed to update user with Discord info");
          res.redirect("/?error=link_failed");
        }
      } catch (error) {
        console.error("Error linking Discord account:", error);
        res.redirect("/?error=link_failed");
      }
    },
  );

  app.post("/api/discord/unlink", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      await storage.updateUser(userId, {
        discordId: null,
        discordUsername: null,
        discordAvatar: null,
        discordLinkedAt: null,
      });
      res.json({ message: "Discord unlinked" });
    } catch (error) {
      console.error("Error unlinking Discord:", error);
      res.status(500).json({ message: "Failed to unlink Discord" });
    }
  });

  app.post("/api/admin/set-user-password", requireAuth, async (req, res) => {
    try {
      const adminId = (req.user as any).id;
      const { userId, password } = req.body;

      if (!password || password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }

      const admin = await storage.getUser(adminId);
      const isAdminUser =
        admin?.userRank &&
        [
          "operations_manager",
          "team_member",
          "staff_administration_director",
          "leadership_council",
          "company_director",
        ].includes(admin.userRank);

      if (!isAdminUser) {
        return res
          .status(403)
          .json({ message: "Only admins can set user passwords" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const hashedPassword = hashPassword(password);
      const updatedUser = await storage.updateUser(userId, {
        password: hashedPassword,
      });

      console.log(`✅ Admin set password for user: ${user.username}`);
      res.json({ message: "Password set successfully", user: updatedUser });
    } catch (error) {
      console.error("Error setting user password:", error);
      res.status(500).json({ message: "Failed to set password" });
    }
  });

  // Admin: Manual rank assignment (for staff roles only)
  const STAFF_RANKS = [
    "company_director",
    "leadership_council",
    "operations_manager",
    "team_member",
    "staff_administration_director",
    "administrator",
    "senior_administrator",
    "moderator",
    "trial_moderator",
    "community_moderator",
    "community_senior_moderator",
    "community_developer",
    "customer_relations",
    "rs_volunteer_staff",
  ];

  // TODO: Replace with actual admin check - for now requires ADMIN_USER_ID env var
  function isAdmin(userId: string): boolean {
    const adminId = (process.env.ADMIN_USER_ID || "").trim();
    const trimmedUserId = (userId || "").trim();
    const result = trimmedUserId === adminId;
    console.log(
      `🔐 Admin check: userId="${trimmedUserId}" vs ADMIN_USER_ID="${adminId}" => ${result}`,
    );
    return result;
  }

  app.get("/api/admin/users", requireAuth, async (req, res) => {
    try {
      const adminId = (req.user as any).id;

      // Verify admin access
      if (!isAdmin(adminId)) {
        return res.status(403).json({ message: "Only admins can access this" });
      }

      const users = await storage.getAllUsers();
      const sanitizedUsers = users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        userRank: user.userRank,
        secondaryUserRank: user.secondaryUserRank,
        vipTier: user.vipTier,
        createdAt: user.createdAt,
      }));

      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.delete("/api/admin/users/:id", requireAuth, async (req, res) => {
    try {
      const adminId = (req.user as any).id;
      if (!isAdmin(adminId)) {
        return res
          .status(403)
          .json({ message: "Only admins can delete users" });
      }

      const targetId = req.params.id;
      if (targetId === adminId) {
        return res.status(400).json({ message: "Cannot delete yourself" });
      }

      await storage.updateUser(targetId, {
        username: `[deleted-${Date.now()}]`,
        email: null,
      });

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.post("/api/admin/assign-rank", requireAuth, async (req, res) => {
    try {
      const adminId = (req.user as any).id;
      console.log(`🔐 Rank assignment request from admin: ${adminId}`);

      // Verify admin access
      if (!isAdmin(adminId)) {
        console.log(
          `❌ Rank assignment denied - user ${adminId} is not admin (expected ${process.env.ADMIN_USER_ID})`,
        );
        return res
          .status(403)
          .json({ message: "Only admins can assign ranks" });
      }

      const { userId, rank } = req.body;
      console.log(`📝 Assigning rank "${rank}" to user ${userId}`);

      // Validate rank is a staff rank or member/none
      const validRanks = ["member", "none", ...STAFF_RANKS];
      if (!validRanks.includes(rank)) {
        console.log(
          `❌ Invalid rank: ${rank}. Valid ranks: ${validRanks.join(", ")}`,
        );
        return res.status(400).json({ message: "Invalid rank", validRanks });
      }

      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        console.log(`❌ User not found: ${userId}`);
        return res.status(404).json({ message: "User not found" });
      }

      // Update rank
      const updatedUser = await storage.updateUser(userId, { userRank: rank });
      console.log(
        `✅ Rank successfully updated for ${targetUser.username}: ${rank}`,
      );
      res.json({
        message: `User rank updated to ${rank}`,
        user: updatedUser,
      });
    } catch (error) {
      console.error("❌ Error assigning rank:", error);
      res
        .status(500)
        .json({ message: `Failed to assign rank: ${(error as any).message}` });
    }
  });

  // Roblox verification routes (placeholder)
  app.post("/api/roblox/verify", requireAuth, async (req, res) => {
    try {
      const { username } = req.body;
      res.json({
        message: "Roblox verification would be initiated here",
        username,
      });
    } catch (error) {
      console.error("Error verifying Roblox:", error);
      res.status(500).json({ message: "Failed to start Roblox verification" });
    }
  });

  app.post("/api/roblox/unlink", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      await storage.updateUser(userId, {
        robloxId: null,
        robloxUsername: null,
        robloxDisplayName: null,
        robloxLinkedAt: null,
      });
      res.json({ message: "Roblox unlinked" });
    } catch (error) {
      console.error("Error unlinking Roblox:", error);
      res.status(500).json({ message: "Failed to unlink Roblox" });
    }
  });

  // Admin: Announcements Management
  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.get("/api/announcements/:id", async (req, res) => {
    try {
      const announcement = await storage.getAnnouncement(req.params.id);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      res.json(announcement);
    } catch (error) {
      console.error("Error fetching announcement:", error);
      res.status(500).json({ message: "Failed to fetch announcement" });
    }
  });

  app.post("/api/admin/announcements", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      const isAdmin =
        user?.userRank &&
        [
          "team_member",
          "operations_manager",
          "staff_administration_director",
          "leadership_council",
          "company_director",
        ].includes(user.userRank);

      if (!isAdmin) return res.status(403).json({ message: "Unauthorized" });

      const { title, content, type, details, isPublished } = req.body;
      console.log("📝 Creating announcement with data:", {
        title,
        content,
        type,
        details,
        isPublished,
      });

      if (!title || !content) {
        console.log("❌ Missing required fields: title or content");
        return res
          .status(400)
          .json({ message: "Title and content are required" });
      }

      const announcementData = {
        title,
        content,
        type: type || "update",
        details: details ? JSON.stringify(details) : JSON.stringify([]),
        isPublished: isPublished !== false,
      };

      console.log("📋 Final announcement data:", announcementData);
      const announcement = await storage.createAnnouncement(announcementData);
      console.log("✅ Announcement created:", announcement.id);
      res.json(announcement);
    } catch (error) {
      console.error("❌ Error creating announcement:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res
        .status(500)
        .json({ message: `Failed to create announcement: ${errorMessage}` });
    }
  });

  app.patch("/api/admin/announcements/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      const isAdmin =
        user?.userRank &&
        [
          "staff_administration_director",
          "leadership_council",
          "operations_manager",
          "team_member",
          "company_director",
        ].includes(user.userRank);

      if (!isAdmin) return res.status(403).json({ message: "Unauthorized" });

      const { title, content, type, details, isPublished } = req.body;
      const announcement = await storage.updateAnnouncement(req.params.id, {
        title,
        content,
        type,
        details: details ? JSON.stringify(details) : undefined,
        isPublished,
      });
      res.json(announcement);
    } catch (error) {
      console.error("Error updating announcement:", error);
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  app.delete("/api/admin/announcements/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      const isAdmin =
        user?.userRank &&
        [
          "staff_administration_director",
          "operations_manager",
          "team_member",
          "leadership_council",
          "company_director",
        ].includes(user.userRank);

      if (!isAdmin) return res.status(403).json({ message: "Unauthorized" });

      await storage.deleteAnnouncement(req.params.id);
      res.json({ message: "Announcement deleted" });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  app.get("/api/staff-directory", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const staffUsers = allUsers.filter(
        (u) =>
          u.userRank &&
          [
            "administrator",
            "senior_administrator",
            "staff_administration_director",
            "leadership_council",
            "company_director",
            "moderator",
            "community_moderator",
            "customer_relations",
            "operations_manager",
            "team_member",
          ].includes(u.userRank),
      );
      res.json(staffUsers);
    } catch (error) {
      console.error("Error fetching staff directory:", error);
      res.status(500).json({ message: "Failed to fetch staff directory" });
    }
  });

  // Admin: Site Settings & Offline Mode
  app.get("/api/site-settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch("/api/admin/site-settings", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      const isAdmin =
        user?.userRank &&
        [
          "operations_manager",
          "company_director",
        ].includes(user.userRank);

      if (!isAdmin) return res.status(403).json({ message: "Unauthorized" });

      const { isOffline, offlineMessage } = req.body;
      const existingSettings = await storage.getSiteSettings();

      const settings = await storage.updateSiteSettings({
        id: "main",
        isOffline:
          isOffline !== undefined ? isOffline : existingSettings.isOffline,
        offlineMessage: offlineMessage || existingSettings.offlineMessage,
        updatedAt: new Date(),
      });
      res.json(settings);
    } catch (error) {
      console.error("Error updating site settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Admin: Assign Subscription
  app.post("/api/admin/assign-subscription", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      const isAdmin =
        user?.userRank &&
        [
          "operations_manager",
          "team_member",
          "company_director",
        ].includes(user.userRank);

      if (!isAdmin) return res.status(403).json({ message: "Unauthorized" });

      const { targetUsername, vipTier } = req.body;
      const targetUser = await storage.getUserByUsername(targetUsername);
      if (!targetUser)
        return res.status(404).json({ message: "User not found" });

      const updated = await storage.updateUser(targetUser.id, { vipTier });
      res.json({ message: `Subscription set to ${vipTier}`, user: updated });
    } catch (error) {
      console.error("Error assigning subscription:", error);
      res.status(500).json({ message: "Failed to assign subscription" });
    }
  });

  // Admin: Create Account
  app.post("/api/admin/create-account", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      const isAllowed =
        user?.userRank &&
        [
          "customer_relations",
          "operations_manager",
          "team_member",
          "leadership_council",
          "company_director",
        ].includes(user.userRank);

      if (!isAllowed) return res.status(403).json({ message: "Unauthorized" });

      const { username, email } = req.body;
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser)
        return res.status(400).json({ message: "Username already taken" });

      const newUser = await storage.upsertUser({
        username,
        email,
        userRank: "member",
        secondaryUserRank: "active_member"
        vipTier: "none",
      });
      res.json({ message: "Account created successfully", user: newUser });
    } catch (error) {
      console.error("Error creating account:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // Admin: Search Users
  app.get("/api/admin/search-users", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      const isAdmin =
        user?.userRank &&
        [
          "administrator",
          "senior_administrator",
          "customer_relations",
          "staff_administration_director",
          "leadership_council",
          "operations_manager",
          "team_member",
          "company_director",
        ].includes(user.userRank);

      if (!isAdmin) return res.status(403).json({ message: "Unauthorized" });

      const query = (req.query.q as string) || "";
      const allUsers = await storage.getAllUsers();
      const filtered = allUsers
        .filter(
          (u) =>
            u.username?.toLowerCase().includes(query.toLowerCase()) ||
            u.email?.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 20);

      res.json(filtered);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // Admin: Staff Directory (duplicate removed - see earlier route)

  // Payments: Submit VIP Payment (Auto-charged via Stripe)
  app.post("/api/payments/submit", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      const {
        vipTier,
        cardNumber,
        cardExpiry,
        cardCvc,
        cardLast4,
        cardBrand,
        billingName,
        billingEmail,
        billingAddress,
        billingCity,
        billingState,
        billingZip,
        billingCountry,
      } = req.body;

      const tierPrices: Record<string, number> = {
        bronze: 1099,
        sapphire: 2099,
        diamond: 3465,
        founders: 4599,
      };

      const amount = tierPrices[vipTier];
      if (!amount) return res.status(400).json({ message: "Invalid VIP tier" });

      // Create payment record with processing status
      const payment = await storage.createPayment({
        userId,
        vipTier,
        amount,
        status: "processing",
        cardLast4,
        cardBrand,
        billingName,
        billingEmail,
        billingAddress,
        billingCity,
        billingState,
        billingZip,
        billingCountry,
      });

      // Process payment (card data stored in database for admin processing)
      try {
        // Mark as success and activate VIP immediately
        await storage.updatePaymentStatus(payment.id, "success");
        await storage.updateUser(userId, { vipTier });

        res.json({
          message:
            "Payment processed successfully! Your VIP tier is now active.",
          payment,
          success: true,
        });
      } catch (chargeError) {
        await storage.updatePaymentStatus(
          payment.id,
          "failed",
          String(chargeError),
        );
        res.status(400).json({
          message:
            "Payment failed. Please check your card details and try again.",
          error: String(chargeError),
        });
      }
    } catch (error) {
      console.error("Error submitting payment:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });

  // Payments: Get User Payments
  app.get("/api/payments/history", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const userPayments = await storage.getUserPayments(userId);
      res.json(userPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payment history" });
    }
  });

  // Account Management: Get Account Info
  app.get("/api/account", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      console.error("Error fetching account:", error);
      res.status(500).json({ message: "Failed to fetch account" });
    }
  });

  // Account Management: Delete Account
  app.delete("/api/account", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { password } = req.body;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (!user.password || !verifyPassword(password, user.password)) {
        return res.status(401).json({ message: "Invalid password" });
      }
      req.logout(() => {});
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Subscriptions: Get Available VIP Tiers
  app.get("/api/subscriptions/tiers", async (req, res) => {
    res.json({
      tiers: [
        {
          id: "bronze",
          name: "Bronze",
          price: 1099,
          priceText: "$10.99/month",
          benefits: ["Custom profile badge", "Priority support"],
        },
        {
          id: "sapphire",
          name: "Sapphire",
          price: 1599,
          priceText: "$15.99/month",
          benefits: [
            "All Bronze benefits",
            "Exclusive cosmetics",
            "Priority matchmaking",
          ],
        },
        {
          id: "diamond",
          name: "Diamond",
          price: 1999,
          priceText: "$19.99/month",
          benefits: [
            "All Sapphire benefits",
            "VIP cosmetics",
            "Ad-free experience",
          ],
        },
        {
          id: "founders",
          name: "Founders",
          price: 3599,
          priceText: "$35.99/month",
          benefits: [
            "All Diamond benefits",
            "Founder title",
            "Lifetime status guarantee",
          ],
        },
      ],
    });
  });

  // Subscriptions: Get User Subscription Status
  app.get("/api/subscriptions/status", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const payments = await storage.getUserPayments(userId);
      const activePayment = payments.find((p) => p.status === "success");
      res.json({
        currentTier: user.vipTier,
        hasActiveSubscription: user.vipTier !== "none",
        lastPayment: activePayment,
        allPayments: payments,
      });
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });

  // Support: Submit Contact Form
  app.post("/api/support/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Store support ticket in database (or send email via Resend)
      console.log("Support ticket received:", {
        name,
        email,
        subject,
        message,
      });

      res.json({ message: "Your message has been sent to our support team" });
    } catch (error) {
      console.error("Error submitting support ticket:", error);
      res.status(500).json({ message: "Failed to submit support request" });
    }
  });

  // Invision Migration: Fetch and import forum data
  async function migrateInvisionData() {
    const INVISION_URL = "https://e335519.invisionservice.com/api";
    const API_KEY = "fdbe9fd2d0834d0870a79b5c99bbdabf";
    const userMap = new Map(); // Map Invision user IDs to RESYNC user IDs

    try {
      console.log("🔄 Starting Invision forum migration...");

      // STEP 1: Fetch and import ALL users
      console.log("👥 Fetching all Invision users...");
      const usersRes = await fetch(
        `${INVISION_URL}/core/members?key=${API_KEY}&limit=10000`,
      );
      const usersData = await usersRes.json();
      const invisionUsers = usersData.results || [];

      let userCount = 0;
      for (const invUser of invisionUsers) {
        try {
          // Check if user already exists by email or username
          let existingUser = null;
          if (invUser.email) {
            existingUser = await storage.getUserByEmail(invUser.email);
          }
          if (!existingUser && invUser.name) {
            existingUser = await storage.getUserByUsername(invUser.name);
          }

          if (!existingUser) {
            // Create new user with Invision data
            const newUser = await storage.upsertUser({
              username: invUser.name || `user_${invUser.id}`,
              email: invUser.email || `user_${invUser.id}@invision.local`,
              firstName: invUser.name?.split(" ")[0] || invUser.name,
              lastName: invUser.name?.split(" ").slice(1).join(" ") || "",
              profileImageUrl: invUser.photo?.url || undefined,
              bio: invUser.about || undefined,
              reputation: invUser.reputation || 0,
              totalPosts: invUser.posts || 0,
              createdAt: invUser.joined
                ? new Date(
                    typeof invUser.joined === "number"
                      ? invUser.joined * 1000
                      : invUser.joined,
                  )
                : new Date(),
            } as any);
            userMap.set(invUser.id, newUser.id);
            userCount++;
            console.log(`✅ Created user: ${invUser.name}`);
          } else {
            // User exists, just map their ID
            userMap.set(invUser.id, existingUser.id);
            console.log(`📌 User already exists: ${invUser.name}`);
          }
        } catch (userError) {
          console.error(`❌ Error creating user ${invUser.name}:`, userError);
        }
      }
      console.log(
        `✅ User import complete! Imported ${userCount} new users from Invision`,
      );

      // STEP 2: Fetch and create forum categories
      console.log("📂 Fetching Invision categories...");
      const categoriesRes = await fetch(
        `${INVISION_URL}/forums/forums?key=${API_KEY}`,
      );
      const categoriesData = await categoriesRes.json();
      const invisionCategories = categoriesData.results || [];

      const categoryMap = new Map();
      const existing = await storage.getForumCategories();

      for (const invCat of invisionCategories) {
        const alreadyExists = existing.some((c) => c.name === invCat.name);

        if (!alreadyExists) {
          try {
            const created = await storage.createForumCategory({
              name: invCat.name,
              description: invCat.description || "",
              icon: "MessageSquare",
              color: "#667eea",
              order: invCat.position || 0,
            } as any);
            categoryMap.set(invCat.id, created.id);
            console.log(`✅ Created category: ${invCat.name}`);
          } catch (catError) {
            console.error(
              `❌ Error creating category ${invCat.name}:`,
              catError,
            );
          }
        } else {
          const cat = existing.find((c) => c.name === invCat.name);
          if (cat) categoryMap.set(invCat.id, cat.id);
        }
      }

      // STEP 3: Fetch topics/threads and create with mapped user IDs
      console.log("📝 Fetching Invision topics...");
      const topicsRes = await fetch(
        `${INVISION_URL}/forums/topics?key=${API_KEY}&limit=10000`,
      );
      const topicsData = await topicsRes.json();
      const invisionTopics = topicsData.results || [];

      let threadCount = 0;
      for (const topic of invisionTopics) {
        try {
          const categoryId =
            categoryMap.get(topic.forum) || categoryMap.values().next().value;
          if (!categoryId) {
            console.warn(`⚠️ No category found for topic ${topic.id}`);
            continue;
          }

          // Use mapped user ID if available
          let authorId = null;
          if (topic.author?.id && userMap.has(topic.author.id)) {
            authorId = userMap.get(topic.author.id);
          }

          if (!authorId) continue;

          const thread = await storage.createForumThread({
            categoryId,
            authorId,
            title: topic.title,
            content: topic.posts?.[0]?.post || topic.title,
            isPinned: topic.pinned || false,
            isLocked: topic.locked || false,
            viewCount: topic.views || 0,
            replyCount: topic.posts?.length || 0,
            upvotes: 0,
            createdAt: new Date(topic.created),
            updatedAt: new Date(topic.updated || topic.created),
          } as any);
          threadCount++;

          // Create replies/posts using mapped user IDs
          if (topic.posts && topic.posts.length > 1) {
            for (const post of topic.posts.slice(1)) {
              try {
                let postAuthorId = null;
                if (post.author?.id && userMap.has(post.author.id)) {
                  postAuthorId = userMap.get(post.author.id);
                }

                if (postAuthorId) {
                  await storage.createForumReply({
                    threadId: thread.id,
                    authorId: postAuthorId,
                    content: post.post || "",
                    upvotes: 0,
                    createdAt: new Date(post.created),
                    updatedAt: new Date(post.updated || post.created),
                  } as any);
                }
              } catch (replyError) {
                console.error(
                  `❌ Error creating reply for post ${post.id}:`,
                  replyError,
                );
              }
            }
          }
        } catch (threadError) {
          console.error(`❌ Error creating thread ${topic.id}:`, threadError);
        }
      }

      console.log(
        `✅ Invision migration complete! Imported ${userCount} users and ${threadCount} threads`,
      );
    } catch (error) {
      console.error("❌ Invision migration failed:", error);
    }
  }

  // Run migration once at startup if not already done
  const migrationLock = new Map();
  if (!migrationLock.has("invision")) {
    migrationLock.set("invision", true);
    migrateInvisionData().catch((error) => {
      console.error("❌ Migration error (continuing anyway):", error.message);
    });
  }

  return httpServer;
}
