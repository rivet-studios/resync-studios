import { Resend } from "resend";
import { randomUUID } from "crypto";
import {
  type User,
  type UpsertUser,
  type Clan,
  type InsertClan,
  type Build,
  type InsertBuild,
  type BuildVote,
  type ForumCategory,
  type InsertForumCategory,
  type ForumThread,
  type InsertForumThread,
  type ForumReply,
  type InsertForumReply,
  type ChatMessage,
  type InsertChatMessage,
  type Announcement,
  type InsertAnnouncement,
  type SiteSettings,
  type Payment,
  type InsertPayment,
  reports,
  type Report,
  type InsertReport,
  users,
  clans,
  builds,
  buildVotes,
  forumCategories,
  forumThreads,
  forumReplies,
  chatMessages,
  magicLinkTokens,
  announcements,
  siteSettings,
  payments,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, lt } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  getUserByRobloxId(robloxId: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  createMagicLinkToken(email: string): Promise<string>;
  verifyMagicLinkToken(token: string): Promise<string | undefined>;
  markMagicLinkTokenAsUsed(token: string): Promise<void>;
  getClans(): Promise<Clan[]>;
  getClan(id: string): Promise<Clan | undefined>;
  createClan(clan: InsertClan): Promise<Clan>;
  updateClan(id: string, updates: Partial<Clan>): Promise<Clan | undefined>;
  deleteClan(id: string): Promise<void>;
  getBuilds(): Promise<Build[]>;
  getBuild(id: string): Promise<Build | undefined>;
  createBuild(build: InsertBuild): Promise<Build>;
  updateBuild(id: string, updates: Partial<Build>): Promise<Build | undefined>;
  deleteBuild(id: string): Promise<void>;
  voteBuild(buildId: string, userId: string, isUpvote: boolean): Promise<void>;
  getBuildVote(buildId: string, userId: string): Promise<BuildVote | undefined>;
  getForumCategories(): Promise<ForumCategory[]>;
  getForumCategory(id: string): Promise<ForumCategory | undefined>;
  createForumCategory(category: InsertForumCategory): Promise<ForumCategory>;
  getForumThreads(categoryId?: string): Promise<ForumThread[]>;
  getForumThread(id: string): Promise<ForumThread | undefined>;
  createForumThread(thread: InsertForumThread): Promise<ForumThread>;
  updateForumThread(id: string, updates: Partial<ForumThread>): Promise<ForumThread | undefined>;
  getForumReplies(threadId: string): Promise<ForumReply[]>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  getChatMessages(recipientId?: string, clanId?: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncement(id: string): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: string): Promise<void>;
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: string): Promise<Payment | undefined>;
  getUserPayments(userId: string): Promise<Payment[]>;
  updatePaymentStatus(id: string, status: string, adminNotes?: string): Promise<Payment | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  getReports(): Promise<Report[]>;
  updateReportStatus(id: string, status: string, notes?: string): Promise<Report | undefined>;
  getStats(): Promise<{ totalMembers: number; activeLfg: number; totalClans: number; totalBuilds: number; }>;
}

export class DatabaseStorage implements IStorage {
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
    if (!userData.id) {
      const { id, ...dataWithoutId } = userData;
      const [user] = await db.insert(users).values(dataWithoutId as any).returning();
      return user;
    }
    const [user] = await db.insert(users).values(userData as any).onConflictDoUpdate({
      target: users.id,
      set: { ...userData, updatedAt: new Date() } as any,
    }).returning();
    return user;
  }
  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set({ ...updates, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return user;
  }
  async createMagicLinkToken(email: string): Promise<string> {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await db.insert(magicLinkTokens).values({ email, token, expiresAt });
    return token;
  }
  async verifyMagicLinkToken(token: string): Promise<string | undefined> {
    const [record] = await db.select().from(magicLinkTokens).where(and(eq(magicLinkTokens.token, token), lt(magicLinkTokens.expiresAt, new Date())));
    return record?.email;
  }
  async markMagicLinkTokenAsUsed(token: string): Promise<void> {
    await db.update(magicLinkTokens).set({ usedAt: new Date() }).where(eq(magicLinkTokens.token, token));
  }
  async getClans(): Promise<Clan[]> { return db.select().from(clans).orderBy(desc(clans.memberCount)); }
  async getClan(id: string): Promise<Clan | undefined> {
    const [clan] = await db.select().from(clans).where(eq(clans.id, id));
    return clan;
  }
  async createClan(clanData: InsertClan): Promise<Clan> {
    const [clan] = await db.insert(clans).values(clanData).returning();
    return clan;
  }
  async updateClan(id: string, updates: Partial<Clan>): Promise<Clan | undefined> {
    const [clan] = await db.update(clans).set({ ...updates, updatedAt: new Date() }).where(eq(clans.id, id)).returning();
    return clan;
  }
  async deleteClan(id: string): Promise<void> { await db.delete(clans).where(eq(clans.id, id)); }
  async getBuilds(): Promise<Build[]> { return db.select().from(builds).orderBy(desc(builds.createdAt)); }
  async getBuild(id: string): Promise<Build | undefined> {
    const [build] = await db.select().from(builds).where(eq(builds.id, id));
    return build;
  }
  async createBuild(buildData: InsertBuild): Promise<Build> {
    const [build] = await db.insert(builds).values(buildData).returning();
    return build;
  }
  async updateBuild(id: string, updates: Partial<Build>): Promise<Build | undefined> {
    const [build] = await db.update(builds).set({ ...updates, updatedAt: new Date() }).where(eq(builds.id, id)).returning();
    return build;
  }
  async deleteBuild(id: string): Promise<void> { await db.delete(builds).where(eq(builds.id, id)); }
  async voteBuild(buildId: string, userId: string, isUpvote: boolean): Promise<void> {
    const existing = await this.getBuildVote(buildId, userId);
    if (existing) {
      await db.delete(buildVotes).where(and(eq(buildVotes.buildId, buildId), eq(buildVotes.userId, userId)));
      await db.update(builds).set({ [existing.isUpvote ? "upvotes" : "downvotes"]: sql`${builds[existing.isUpvote ? "upvotes" : "downvotes"]} - 1` }).where(eq(builds.id, buildId));
    }
    await db.insert(buildVotes).values({ buildId, userId, isUpvote });
    await db.update(builds).set({ [isUpvote ? "upvotes" : "downvotes"]: sql`${builds[isUpvote ? "upvotes" : "downvotes"]} + 1` }).where(eq(builds.id, buildId));
  }
  async getBuildVote(buildId: string, userId: string): Promise<BuildVote | undefined> {
    const [vote] = await db.select().from(buildVotes).where(and(eq(buildVotes.buildId, buildId), eq(buildVotes.userId, userId)));
    return vote;
  }
  async getForumCategories(): Promise<ForumCategory[]> { return db.select().from(forumCategories).orderBy(forumCategories.order); }
  async getForumCategory(id: string): Promise<ForumCategory | undefined> {
    const [category] = await db.select().from(forumCategories).where(eq(forumCategories.id, id));
    return category;
  }
  async createForumCategory(categoryData: InsertForumCategory): Promise<ForumCategory> {
    const [category] = await db.insert(forumCategories).values(categoryData).returning();
    return category;
  }
  async getForumThreads(categoryId?: string): Promise<ForumThread[]> {
    if (categoryId) return db.select().from(forumThreads).where(eq(forumThreads.categoryId, categoryId)).orderBy(desc(forumThreads.createdAt));
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
    const [thread] = await db.update(forumThreads).set({ ...updates, updatedAt: new Date() }).where(eq(forumThreads.id, id)).returning();
    return thread;
  }
  async getForumReplies(threadId: string): Promise<ForumReply[]> { return db.select().from(forumReplies).where(eq(forumReplies.threadId, threadId)).orderBy(desc(forumReplies.createdAt)); }
  async createForumReply(replyData: InsertForumReply): Promise<ForumReply> {
    const [reply] = await db.insert(forumReplies).values(replyData).returning();
    await db.update(forumThreads).set({ replyCount: sql`${forumThreads.replyCount} + 1`, lastReplyAt: new Date() }).where(eq(forumThreads.id, replyData.threadId));
    return reply;
  }
  async getChatMessages(recipientId?: string, clanId?: string): Promise<ChatMessage[]> {
    if (clanId) return db.select().from(chatMessages).where(eq(chatMessages.clanId, clanId)).orderBy(desc(chatMessages.createdAt)).limit(100);
    if (recipientId) return db.select().from(chatMessages).where(eq(chatMessages.recipientId, recipientId)).orderBy(desc(chatMessages.createdAt)).limit(100);
    return [];
  }
  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(messageData).returning();
    return message;
  }
  async getAnnouncements(): Promise<Announcement[]> { return db.select().from(announcements).where(eq(announcements.isPublished, true)).orderBy(desc(announcements.createdAt)); }
  async getAnnouncement(id: string): Promise<Announcement | undefined> {
    const [announcement] = await db.select().from(announcements).where(eq(announcements.id, id));
    return announcement;
  }
  async createAnnouncement(announcementData: InsertAnnouncement): Promise<Announcement> {
    const [announcement] = await db.insert(announcements).values(announcementData).returning();
    return announcement;
  }
  async updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement | undefined> {
    const [announcement] = await db.update(announcements).set({ ...updates, updatedAt: new Date() }).where(eq(announcements.id, id)).returning();
    return announcement;
  }
  async deleteAnnouncement(id: string): Promise<void> { await db.delete(announcements).where(eq(announcements.id, id)); }
  async getSiteSettings(): Promise<SiteSettings> {
    const [settings] = await db.select().from(siteSettings).limit(1);
    if (settings) return settings;
    const [newSettings] = await db.insert(siteSettings).values({ isOffline: false, offlineMessage: "Maintenance" }).returning();
    return newSettings;
  }
  async updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSiteSettings();
    const [updated] = await db.update(siteSettings).set(updates).where(eq(siteSettings.id, current.id)).returning();
    return updated;
  }
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(paymentData).returning();
    return payment;
  }
  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }
  async getUserPayments(userId: string): Promise<Payment[]> { return db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt)); }
  async updatePaymentStatus(id: string, status: string, adminNotes?: string): Promise<Payment | undefined> {
    const [payment] = await db.update(payments).set({ status, adminNotes }).where(eq(payments.id, id)).returning();
    return payment;
  }
  async createReport(reportData: InsertReport): Promise<Report> {
    const [report] = await db.insert(reports).values(reportData).returning();
    return report;
  }
  async getReports(): Promise<Report[]> { return db.select().from(reports).orderBy(desc(reports.createdAt)); }
  async updateReportStatus(id: string, status: any, notes?: string): Promise<Report | undefined> {
    const [report] = await db.update(reports).set({ status, moderatorNotes: notes }).where(eq(reports.id, id)).returning();
    return report;
  }
  async getStats(): Promise<{ totalMembers: number; activeLfg: number; totalClans: number; totalBuilds: number; }> {
    const [userCount] = await db.select({ count: sql`count(*)` }).from(users);
    const [clanCount] = await db.select({ count: sql`count(*)` }).from(clans);
    const [buildCount] = await db.select({ count: sql`count(*)` }).from(builds);
    return { totalMembers: Number(userCount.count), activeLfg: 0, totalClans: Number(clanCount.count), totalBuilds: Number(buildCount.count) };
  }
}

export const storage = new DatabaseStorage();
