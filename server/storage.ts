import { Resend } from 'resend';
import { randomUUID } from 'crypto';
import { 
  type User, type InsertUser, type UpsertUser,
  type Clan, type InsertClan,
  type LfgPost, type InsertLfgPost,
  type LfgParticipant,
  type Build, type InsertBuild,
  type BuildVote,
  type ForumCategory, type InsertForumCategory,
  type ForumThread, type InsertForumThread,
  type ForumReply, type InsertForumReply,
  type ChatMessage, type InsertChatMessage,
  type Announcement, type InsertAnnouncement,
  type SiteSettings, type InsertSiteSettings,
  type Payment, type InsertPayment,
  users, clans, lfgPosts, lfgParticipants, builds, buildVotes,
  forumCategories, forumThreads, forumReplies, chatMessages, magicLinkTokens, announcements, siteSettings, payments
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, or, ilike, lt } from "drizzle-orm";

let connectionSettings: any;

async function getResendClient() {
  // Try environment variable first (for Render.com deployment)
  if (process.env.RESEND_API_KEY) {
    return {
      client: new Resend(process.env.RESEND_API_KEY),
      fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    };
  }

  // Fall back to Replit connectors API
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!hostname || !xReplitToken) {
    console.error('⚠️ Resend API not configured. Set RESEND_API_KEY environment variable or configure Resend integration.');
    throw new Error('Resend API key not configured. Please set RESEND_API_KEY environment variable or configure the Resend integration in Replit.');
  }

  if (!connectionSettings) {
    try {
      const response = await fetch(
        'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
        {
          headers: {
            'Accept': 'application/json',
            'X_REPLIT_TOKEN': xReplitToken
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Resend connection: ${response.status}`);
      }
      
      const data = await response.json();
      connectionSettings = data.items?.[0];

      if (!connectionSettings || !connectionSettings.settings?.api_key) {
        console.error('⚠️ Resend integration not connected. Please configure it in Replit.');
        throw new Error('Resend not connected in Replit. Please set up the Resend integration.');
      }
    } catch (error) {
      console.error('Failed to get Resend connection:', error);
      throw error;
    }
  }

  return {
    client: new Resend(connectionSettings.settings.api_key),
    fromEmail: connectionSettings.settings.from_email || 'onboarding@resend.dev'
  };
}

export async function sendSignupEmail(email: string, confirmLink: string) {
  try {
    const { client, fromEmail } = await getResendClient();
    console.log(`📧 Sending signup email from: ${fromEmail} to: ${email}`);
    
    const response = await client.emails.send({
      from: `RESYNC Studios <${fromEmail}>`,
      to: email,
      subject: 'Confirm your RESYNC Studios account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; text-align: center; border-radius: 8px;">
            <h1 style="margin: 0; font-size: 28px;">RESYNC Studios</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.8;">Gaming Community Platform</p>
          </div>
          <div style="padding: 30px; background: #f5f5f5;">
            <h2 style="color: #1a1a2e; margin-top: 0;">Welcome to RESYNC Studios!</h2>
            <p style="color: #666; line-height: 1.6;">
              Thanks for signing up. Click the button below to confirm your email and complete your account setup.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmLink}" style="
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
              ">
                Confirm Email
              </a>
            </div>
            <p style="color: #999; font-size: 12px;">
              Or copy and paste this link in your browser:<br/>
              ${confirmLink}
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">
              This link expires in 24 hours. If you didn't create this account, please ignore this email.
            </p>
          </div>
          <div style="background: #1a1a2e; color: #999; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
            <p style="margin: 0;">© 2025 RESYNC Studios. All rights reserved.</p>
          </div>
        </div>
      `
    });
    console.log('✅ Signup email response:', response);
  } catch (error) {
    console.error('❌ Failed to send signup email:', error);
    throw error;
  }
}

export async function sendLoginLinkEmail(email: string, loginLink: string) {
  try {
    const { client, fromEmail } = await getResendClient();
    console.log(`📧 Sending login email from: ${fromEmail} to: ${email}`);
    
    const response = await client.emails.send({
      from: `RESYNC Studios <${fromEmail}>`,
      to: email,
      subject: 'Your RESYNC Studios login link',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; text-align: center; border-radius: 8px;">
            <h1 style="margin: 0; font-size: 28px;">RESYNC Studios</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.8;">Gaming Community Platform</p>
          </div>
          <div style="padding: 30px; background: #f5f5f5;">
            <h2 style="color: #1a1a2e; margin-top: 0;">Log in to RESYNC Studios</h2>
            <p style="color: #666; line-height: 1.6;">
              Click the button below to log in to your account. This link is unique and expires in 24 hours.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginLink}" style="
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
              ">
                Log In
              </a>
            </div>
            <p style="color: #999; font-size: 12px;">
              Or copy and paste this link in your browser:<br/>
              ${loginLink}
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">
              This link expires in 24 hours. If you didn't request this login link, please ignore this email.
            </p>
          </div>
          <div style="background: #1a1a2e; color: #999; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
            <p style="margin: 0;">© 2025 RESYNC Studios. All rights reserved.</p>
          </div>
        </div>
      `
    });
    console.log('✅ Login email response:', response);
  } catch (error) {
    console.error('❌ Failed to send login email:', error);
    throw error;
  }
}

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  getUserByRobloxId(robloxId: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Magic Link Tokens
  createMagicLinkToken(email: string): Promise<string>;
  verifyMagicLinkToken(token: string): Promise<string | undefined>;
  markMagicLinkTokenAsUsed(token: string): Promise<void>;
  
  // Clans
  getClans(): Promise<Clan[]>;
  getClan(id: string): Promise<Clan | undefined>;
  createClan(clan: InsertClan): Promise<Clan>;
  updateClan(id: string, updates: Partial<Clan>): Promise<Clan | undefined>;
  deleteClan(id: string): Promise<void>;
  
  // LFG Posts
  getLfgPosts(): Promise<LfgPost[]>;
  getLfgPost(id: string): Promise<LfgPost | undefined>;
  createLfgPost(post: InsertLfgPost): Promise<LfgPost>;
  updateLfgPost(id: string, updates: Partial<LfgPost>): Promise<LfgPost | undefined>;
  deleteLfgPost(id: string): Promise<void>;
  joinLfgPost(postId: string, userId: string, role?: string): Promise<LfgParticipant>;
  leaveLfgPost(postId: string, userId: string): Promise<void>;
  
  // Builds
  getBuilds(): Promise<Build[]>;
  getBuild(id: string): Promise<Build | undefined>;
  createBuild(build: InsertBuild): Promise<Build>;
  updateBuild(id: string, updates: Partial<Build>): Promise<Build | undefined>;
  deleteBuild(id: string): Promise<void>;
  voteBuild(buildId: string, userId: string, isUpvote: boolean): Promise<void>;
  getBuildVote(buildId: string, userId: string): Promise<BuildVote | undefined>;
  
  // Forum Categories
  getForumCategories(): Promise<ForumCategory[]>;
  getForumCategory(id: string): Promise<ForumCategory | undefined>;
  createForumCategory(category: InsertForumCategory): Promise<ForumCategory>;
  
  // Forum Threads
  getForumThreads(categoryId?: string): Promise<ForumThread[]>;
  getForumThread(id: string): Promise<ForumThread | undefined>;
  createForumThread(thread: InsertForumThread): Promise<ForumThread>;
  updateForumThread(id: string, updates: Partial<ForumThread>): Promise<ForumThread | undefined>;
  
  // Forum Replies
  getForumReplies(threadId: string): Promise<ForumReply[]>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  
  // Chat Messages
  getChatMessages(recipientId?: string, clanId?: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Announcements
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncement(id: string): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: string): Promise<void>;
  
  // Site Settings
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings>;
  
  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: string): Promise<Payment | undefined>;
  getUserPayments(userId: string): Promise<Payment[]>;
  updatePaymentStatus(id: string, status: string, adminNotes?: string): Promise<Payment | undefined>;
  
  // Stats
  getStats(): Promise<{ totalMembers: number; activeLfg: number; totalClans: number; totalBuilds: number }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.discordId, discordId));
    return user;
  }

  async getUserByRobloxId(robloxId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.robloxId, robloxId));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // If id is undefined, create new user without upsert
    if (!userData.id) {
      const { id, ...dataWithoutId } = userData;
      const [user] = await db.insert(users)
        .values(dataWithoutId)
        .returning();
      return user;
    }
    
    // Otherwise, use upsert for existing users
    const [user] = await db.insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Magic Link Tokens
  async createMagicLinkToken(email: string): Promise<string> {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await db.insert(magicLinkTokens).values({ email, token, expiresAt });
    return token;
  }

  async verifyMagicLinkToken(token: string): Promise<string | undefined> {
    const [record] = await db.select().from(magicLinkTokens)
      .where(and(eq(magicLinkTokens.token, token), eq(magicLinkTokens.usedAt, null), lt(magicLinkTokens.expiresAt, new Date())));
    return record?.email;
  }

  async markMagicLinkTokenAsUsed(token: string): Promise<void> {
    await db.update(magicLinkTokens)
      .set({ usedAt: new Date() })
      .where(eq(magicLinkTokens.token, token));
  }

  // Clans
  async getClans(): Promise<Clan[]> {
    return db.select().from(clans).orderBy(desc(clans.memberCount));
  }

  async getClan(id: string): Promise<Clan | undefined> {
    const [clan] = await db.select().from(clans).where(eq(clans.id, id));
    return clan;
  }

  async createClan(clanData: InsertClan): Promise<Clan> {
    const [clan] = await db.insert(clans).values(clanData).returning();
    return clan;
  }

  async updateClan(id: string, updates: Partial<Clan>): Promise<Clan | undefined> {
    const [clan] = await db.update(clans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(clans.id, id))
      .returning();
    return clan;
  }

  async deleteClan(id: string): Promise<void> {
    await db.delete(clans).where(eq(clans.id, id));
  }

  // LFG Posts
  async getLfgPosts(): Promise<LfgPost[]> {
    return db.select().from(lfgPosts)
      .where(eq(lfgPosts.isActive, true))
      .orderBy(desc(lfgPosts.createdAt));
  }

  async getLfgPost(id: string): Promise<LfgPost | undefined> {
    const [post] = await db.select().from(lfgPosts).where(eq(lfgPosts.id, id));
    return post;
  }

  async createLfgPost(postData: InsertLfgPost): Promise<LfgPost> {
    const [post] = await db.insert(lfgPosts).values(postData).returning();
    return post;
  }

  async updateLfgPost(id: string, updates: Partial<LfgPost>): Promise<LfgPost | undefined> {
    const [post] = await db.update(lfgPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(lfgPosts.id, id))
      .returning();
    return post;
  }

  async deleteLfgPost(id: string): Promise<void> {
    await db.delete(lfgPosts).where(eq(lfgPosts.id, id));
  }

  async joinLfgPost(postId: string, userId: string, role?: string): Promise<LfgParticipant> {
    const [participant] = await db.insert(lfgParticipants)
      .values({ lfgPostId: postId, userId, role })
      .returning();
    await db.update(lfgPosts)
      .set({ playersJoined: sql`${lfgPosts.playersJoined} + 1` })
      .where(eq(lfgPosts.id, postId));
    return participant;
  }

  async leaveLfgPost(postId: string, userId: string): Promise<void> {
    await db.delete(lfgParticipants)
      .where(and(eq(lfgParticipants.lfgPostId, postId), eq(lfgParticipants.userId, userId)));
    await db.update(lfgPosts)
      .set({ playersJoined: sql`${lfgPosts.playersJoined} - 1` })
      .where(eq(lfgPosts.id, postId));
  }

  // Builds
  async getBuilds(): Promise<Build[]> {
    return db.select().from(builds).orderBy(desc(builds.createdAt));
  }

  async getBuild(id: string): Promise<Build | undefined> {
    const [build] = await db.select().from(builds).where(eq(builds.id, id));
    return build;
  }

  async createBuild(buildData: InsertBuild): Promise<Build> {
    const [build] = await db.insert(builds).values(buildData).returning();
    return build;
  }

  async updateBuild(id: string, updates: Partial<Build>): Promise<Build | undefined> {
    const [build] = await db.update(builds)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(builds.id, id))
      .returning();
    return build;
  }

  async deleteBuild(id: string): Promise<void> {
    await db.delete(builds).where(eq(builds.id, id));
  }

  async voteBuild(buildId: string, userId: string, isUpvote: boolean): Promise<void> {
    const existing = await this.getBuildVote(buildId, userId);
    if (existing) {
      await db.delete(buildVotes)
        .where(and(eq(buildVotes.buildId, buildId), eq(buildVotes.userId, userId)));
      if (existing.isUpvote) {
        await db.update(builds).set({ upvotes: sql`${builds.upvotes} - 1` }).where(eq(builds.id, buildId));
      } else {
        await db.update(builds).set({ downvotes: sql`${builds.downvotes} - 1` }).where(eq(builds.id, buildId));
      }
    }
    await db.insert(buildVotes).values({ buildId, userId, isUpvote });
    if (isUpvote) {
      await db.update(builds).set({ upvotes: sql`${builds.upvotes} + 1` }).where(eq(builds.id, buildId));
    } else {
      await db.update(builds).set({ downvotes: sql`${builds.downvotes} + 1` }).where(eq(builds.id, buildId));
    }
  }

  async getBuildVote(buildId: string, userId: string): Promise<BuildVote | undefined> {
    const [vote] = await db.select().from(buildVotes)
      .where(and(eq(buildVotes.buildId, buildId), eq(buildVotes.userId, userId)));
    return vote;
  }

  // Forum Categories
  async getForumCategories(): Promise<ForumCategory[]> {
    try {
      const categories = await db.select().from(forumCategories).orderBy(forumCategories.order);
      console.log("📂 Forum categories retrieved:", categories.length, "categories");
      if (categories.length === 0) {
        console.warn("⚠️ No forum categories found in database. Checking raw SQL...");
        const rawCategories = await db.execute(`SELECT * FROM forum_categories LIMIT 5`);
        console.log("🔍 Raw SQL result:", rawCategories);
      }
      return categories;
    } catch (error) {
      console.error("❌ Error fetching forum categories:", error);
      return [];
    }
  }

  async getForumCategory(id: string): Promise<ForumCategory | undefined> {
    const [category] = await db.select().from(forumCategories).where(eq(forumCategories.id, id));
    return category;
  }

  async createForumCategory(categoryData: InsertForumCategory): Promise<ForumCategory> {
    const [category] = await db.insert(forumCategories).values(categoryData).returning();
    return category;
  }

  // Forum Threads
  async getForumThreads(categoryId?: string): Promise<ForumThread[]> {
    if (categoryId) {
      return db.select().from(forumThreads)
        .where(eq(forumThreads.categoryId, categoryId))
        .orderBy(desc(forumThreads.createdAt));
    }
    return db.select().from(forumThreads).orderBy(desc(forumThreads.createdAt));
  }

  async getForumThread(id: string): Promise<ForumThread | undefined> {
    const [thread] = await db.select().from(forumThreads).where(eq(forumThreads.id, id));
    return thread;
  }

  async createForumThread(threadData: InsertForumThread): Promise<ForumThread> {
    const [thread] = await db.insert(forumThreads).values(threadData).returning();
    return thread;
  }

  async updateForumThread(id: string, updates: Partial<ForumThread>): Promise<ForumThread | undefined> {
    const [thread] = await db.update(forumThreads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(forumThreads.id, id))
      .returning();
    return thread;
  }

  // Forum Replies
  async getForumReplies(threadId: string): Promise<ForumReply[]> {
    return db.select().from(forumReplies)
      .where(eq(forumReplies.threadId, threadId))
      .orderBy(desc(forumReplies.createdAt));
  }

  async createForumReply(replyData: InsertForumReply): Promise<ForumReply> {
    const [reply] = await db.insert(forumReplies).values(replyData).returning();
    await db.update(forumThreads)
      .set({ 
        replyCount: sql`${forumThreads.replyCount} + 1`,
        lastReplyAt: new Date()
      })
      .where(eq(forumThreads.id, replyData.threadId));
    return reply;
  }

  // Chat Messages
  async getChatMessages(recipientId?: string, clanId?: string): Promise<ChatMessage[]> {
    if (clanId) {
      return db.select().from(chatMessages)
        .where(eq(chatMessages.clanId, clanId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(100);
    }
    if (recipientId) {
      return db.select().from(chatMessages)
        .where(eq(chatMessages.recipientId, recipientId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(100);
    }
    return [];
  }

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(messageData).returning();
    return message;
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return db.select().from(announcements).where(eq(announcements.isPublished, true)).orderBy(desc(announcements.createdAt));
  }

  async getAnnouncement(id: string): Promise<Announcement | undefined> {
    const [announcement] = await db.select().from(announcements).where(eq(announcements.id, id));
    return announcement;
  }

  async createAnnouncement(announcementData: InsertAnnouncement): Promise<Announcement> {
    const [announcement] = await db.insert(announcements).values(announcementData).returning();
    return announcement;
  }

  async updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement | undefined> {
    const [announcement] = await db.update(announcements)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(announcements.id, id))
      .returning();
    return announcement;
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSettings> {
    const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, "main"));
    return settings || { id: "main", isOffline: false, offlineMessage: "We're currently performing maintenance. We'll be back online shortly!", updatedAt: new Date() };
  }

  async updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    const [settings] = await db.update(siteSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(siteSettings.id, "main"))
      .returning();
    return settings;
  }

  // Payments
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(paymentData).returning();
    return payment;
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt));
  }

  async updatePaymentStatus(id: string, status: string, errorMessage?: string): Promise<Payment | undefined> {
    const [payment] = await db.update(payments)
      .set({ status, errorMessage, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  // Stats
  async getStats(): Promise<{ totalMembers: number; activeLfg: number; totalClans: number; totalBuilds: number }> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [lfgCount] = await db.select({ count: sql<number>`count(*)` }).from(lfgPosts).where(eq(lfgPosts.isActive, true));
    const [clanCount] = await db.select({ count: sql<number>`count(*)` }).from(clans);
    const [buildCount] = await db.select({ count: sql<number>`count(*)` }).from(builds);
    
    return {
      totalMembers: Number(userCount.count),
      activeLfg: Number(lfgCount.count),
      totalClans: Number(clanCount.count),
      totalBuilds: Number(buildCount.count),
    };
  }
}

export const storage = new DatabaseStorage();
