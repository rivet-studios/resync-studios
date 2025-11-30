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
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Auth routes
  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "401: Not authenticated. Unauthorized." });
    }
    res.json(req.user);
  });

  // Email-based signup
  app.post("/api/auth/signup", async (req, res) => {
    try {
      console.log("📝 Signup request received for email:", req.body.email);
      const { email, username, password } = req.body;
      
      if (!email || !username || !password) {
        return res.status(400).json({ message: "Email, username, and password required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
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
        userRank: 'member',
        vipTier: 'none'
      });

      console.log("✅ Account created:", user.id);
      res.json({ message: "Account created successfully", user });
    } catch (error) {
      console.error("❌ Error in signup:", error instanceof Error ? error.message : error);
      res.status(500).json({ message: "Failed to create account" });
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

      // Use passport's login method to establish session
      req.login(user, (err) => {
        if (err) {
          console.error("❌ Session creation failed:", err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        console.log("✅ User logged in:", user.id);
        res.json({ message: "Logged in successfully", user });
      });
    } catch (error) {
      console.error("❌ Error in login:", error instanceof Error ? error.message : error);
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
        })
      );
      res.json(postsWithAuthors);
    } catch (error) {
      console.error("Error fetching LFG posts:", error);
      res.status(500).json({ message: "Failed to fetch LFG posts" });
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
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
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
      
      const participant = await storage.joinLfgPost(postId, userId, req.body.role);
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
        })
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
      
      if (user.vipTier !== 'diamond' && user.vipTier !== 'founders') {
        return res.status(403).json({ message: "Diamond VIP or higher required to create clans" });
      }
      
      const data = insertClanSchema.parse({
        ...req.body,
        ownerId: user.id,
      });
      
      const clan = await storage.createClan(data);
      await storage.updateUser(user.id, { clanId: clan.id, clanRole: 'owner' });
      res.status(201).json(clan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
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
      
      await storage.updateUser(userId, { clanId, clanRole: 'member' });
      await storage.updateClan(clanId, { memberCount: (clan.memberCount || 1) + 1 });
      
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
        })
      );
      res.json(buildsWithAuthors);
    } catch (error) {
      console.error("Error fetching builds:", error);
      res.status(500).json({ message: "Failed to fetch builds" });
    }
  });

  app.get("/api/builds/:id", async (req, res) => {
    try {
      const build = await storage.getBuild(req.params.id);
      if (!build) {
        return res.status(404).json({ message: "Build not found" });
      }
      
      await storage.updateBuild(build.id, { viewCount: (build.viewCount || 0) + 1 });
      
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
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
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
        })
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
      
      await storage.updateForumThread(thread.id, { viewCount: (thread.viewCount || 0) + 1 });
      
      const author = await storage.getUser(thread.authorId);
      const category = await storage.getForumCategory(thread.categoryId);
      const replies = await storage.getForumReplies(thread.id);
      
      const repliesWithAuthors = await Promise.all(
        replies.map(async (reply) => {
          const replyAuthor = await storage.getUser(reply.authorId);
          return { ...reply, author: replyAuthor };
        })
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
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
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
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
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
        url: null
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
    }
  );

  app.get("/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.redirect("/");
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
        url: `/auth/discord/link`
      });
    } catch (error) {
      console.error("Error linking Discord:", error);
      res.status(500).json({ message: "Failed to start Discord linking" });
    }
  });

  // Discord linking callback (for users who already have an account)
  app.get("/auth/discord/link", (req, res, next) => {
    passport.authenticate("discord", {
      state: "link_account"
    })(req, res, next);
  });

  app.get("/auth/discord/link/callback",
    (req, res, next) => {
      passport.authenticate("discord", {
        failureRedirect: "/?error=discord_link_failed",
      })(req, res, next);
    },
    async (req, res) => {
      try {
        const user = req.user as any;
        const currentUser = req.session?.userId ? await storage.getUser(req.session.userId) : null;
        
        if (currentUser && user.discordId) {
          // Link Discord account to existing user
          await storage.updateUser(currentUser.id, {
            discordId: user.discordId,
            discordUsername: user.discordUsername,
            discordAvatar: user.discordAvatar,
            discordLinkedAt: new Date(),
          });
          
          // Sync nickname to Discord
          await updateDiscordNickname(user.discordId, currentUser.username || "Member");
          
          res.redirect("/?discord_linked=true");
        } else {
          res.redirect("/?error=link_failed");
        }
      } catch (error) {
        console.error("Error linking Discord account:", error);
        res.redirect("/?error=link_failed");
      }
    }
  );

  app.post("/api/discord/unlink", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      await storage.updateUser(userId, { 
        discordId: null, 
        discordUsername: null, 
        discordAvatar: null,
        discordLinkedAt: null
      });
      res.json({ message: "Discord unlinked" });
    } catch (error) {
      console.error("Error unlinking Discord:", error);
      res.status(500).json({ message: "Failed to unlink Discord" });
    }
  });

  // Admin: Manual rank assignment (for staff roles only)
  const STAFF_RANKS = [
    'company_director',
    'leadership_council', 
    'operations_manager',
    'rs_trust_safety_director',
    'administrator',
    'senior_administrator',
    'moderator',
    'community_moderator',
    'community_senior_moderator',
    'community_developer',
    'customer_relations',
    'rs_volunteer_staff'
  ];

  // TODO: Replace with actual admin check - for now requires ADMIN_USER_ID env var
  function isAdmin(userId: string): boolean {
    return userId === process.env.ADMIN_USER_ID;
  }

  app.post("/api/admin/assign-rank", requireAuth, async (req, res) => {
    try {
      const adminId = (req.user as any).id;
      
      // Verify admin access
      if (!isAdmin(adminId)) {
        return res.status(403).json({ message: "Only admins can assign ranks" });
      }

      const { userId, rank } = req.body;

      // Validate rank is a staff rank or member/none
      const validRanks = ['member', 'none', ...STAFF_RANKS];
      if (!validRanks.includes(rank)) {
        return res.status(400).json({ message: "Invalid rank", validRanks });
      }

      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update rank
      const updatedUser = await storage.updateUser(userId, { userRank: rank });
      res.json({ 
        message: `User rank updated to ${rank}`,
        user: updatedUser 
      });
    } catch (error) {
      console.error("Error assigning rank:", error);
      res.status(500).json({ message: "Failed to assign rank" });
    }
  });

  // Roblox verification routes (placeholder)
  app.post("/api/roblox/verify", requireAuth, async (req, res) => {
    try {
      const { username } = req.body;
      res.json({ 
        message: "Roblox verification would be initiated here",
        username
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
        robloxLinkedAt: null
      });
      res.json({ message: "Roblox unlinked" });
    } catch (error) {
      console.error("Error unlinking Roblox:", error);
      res.status(500).json({ message: "Failed to unlink Roblox" });
    }
  });

  return httpServer;
}
