import { randomUUID } from "crypto";
import {
  type User,
  type UpsertUser,
  type ForumCategory,
  type InsertForumCategory,
  type ForumThread,
  type InsertForumThread,
  type ForumReply,
  type InsertForumReply,
  type Announcement,
  type InsertAnnouncement,
  type SiteSettings,
  type Payment,
  type InsertPayment,
  type Product,
  type InsertProduct,
  type Ban,
  type InsertBan,
  type Appeal,
  type InsertAppeal,
  reports,
  type Report,
  type InsertReport,
  type Policy,
  policies,
  users,
  forumCategories,
  forumThreads,
  forumReplies,
  magicLinkTokens,
  announcements,
  siteSettings,
  payments,
  products,
  bans,
  appeals,
  moderationLogs,
  type ModerationLog,
  type InsertModerationLog,
  warnings,
  type Warning,
  type InsertWarning,
  staffNotes,
  type StaffNote,
  type InsertStaffNote,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, lt } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  getUserByRobloxId(robloxId: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  createMagicLinkToken(email: string): Promise<string>;
  verifyMagicLinkToken(token: string): Promise<string | undefined>;
  markMagicLinkTokenAsUsed(token: string): Promise<void>;
  getForumCategories(): Promise<ForumCategory[]>;
  getForumCategory(id: string): Promise<ForumCategory | undefined>;
  createForumCategory(category: InsertForumCategory): Promise<ForumCategory>;
  updateForumCategory(
    id: string,
    updates: Partial<ForumCategory>,
  ): Promise<ForumCategory | undefined>;
  deleteForumCategory(id: string): Promise<void>;
  getForumThreads(categoryId?: string): Promise<ForumThread[]>;
  getForumThread(id: string): Promise<ForumThread | undefined>;
  createForumThread(thread: InsertForumThread): Promise<ForumThread>;
  updateForumThread(
    id: string,
    updates: Partial<ForumThread>,
  ): Promise<ForumThread | undefined>;
  deleteForumThread(id: string): Promise<void>;
  getForumReplies(threadId: string): Promise<ForumReply[]>;
  getForumReply(id: string): Promise<ForumReply | undefined>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  updateForumReply(
    id: string,
    updates: Partial<ForumReply>,
  ): Promise<ForumReply | undefined>;
  deleteForumReply(id: string): Promise<void>;
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncement(id: string): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(
    id: string,
    updates: Partial<Announcement>,
  ): Promise<Announcement | undefined>;
  deleteAnnouncement(id: string): Promise<void>;
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: string): Promise<Payment | undefined>;
  getUserPayments(userId: string): Promise<Payment[]>;
  updatePaymentStatus(
    id: string,
    status: string,
    adminNotes?: string,
  ): Promise<Payment | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  getReports(): Promise<Report[]>;
  getUserReports(userId: string): Promise<Report[]>;
  updateReportStatus(
    id: string,
    status: string,
    notes?: string,
  ): Promise<Report | undefined>;
  getProducts(status?: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(
    id: string,
    updates: Partial<Product>,
  ): Promise<Product | undefined>;
  getBans(activeOnly?: boolean): Promise<Ban[]>;
  getBan(id: string): Promise<Ban | undefined>;
  getUserBans(userId: string): Promise<Ban[]>;
  createBan(ban: InsertBan): Promise<Ban>;
  deactivateBan(id: string): Promise<Ban | undefined>;
  getAppeals(status?: string): Promise<Appeal[]>;
  getAppeal(id: string): Promise<Appeal | undefined>;
  getUserAppeals(userId: string): Promise<Appeal[]>;
  createAppeal(appeal: InsertAppeal): Promise<Appeal>;
  updateAppeal(
    id: string,
    updates: Partial<Appeal>,
  ): Promise<Appeal | undefined>;
  getPolicies(): Promise<Policy[]>;
  getPolicy(slug: string): Promise<Policy | undefined>;
  upsertPolicy(
    slug: string,
    title: string,
    content: string,
    updatedBy: string,
  ): Promise<Policy>;
  getAdminStats(): Promise<{
    totalUsers: number;
    totalThreads: number;
    totalReplies: number;
    totalProducts: number;
    activeBans: number;
    pendingReports: number;
    pendingAppeals: number;
    totalPayments: number;
    totalAnnouncements: number;
  }>;
  getRecentActivity(limit?: number): Promise<any[]>;
  getStats(): Promise<{
    totalMembers: number;
  }>;
  createModerationLog(log: InsertModerationLog): Promise<ModerationLog>;
  getModerationLogs(filters?: {
    action?: string;
    actorId?: string;
    targetId?: string;
    limit?: number;
  }): Promise<ModerationLog[]>;
  getUserModerationLogs(targetId: string): Promise<ModerationLog[]>;
  createWarning(warning: InsertWarning): Promise<Warning>;
  getWarnings(activeOnly?: boolean): Promise<Warning[]>;
  getUserWarnings(userId: string): Promise<Warning[]>;
  getWarning(id: string): Promise<Warning | undefined>;
  deactivateWarning(id: string): Promise<Warning | undefined>;
  createStaffNote(note: InsertStaffNote): Promise<StaffNote>;
  getStaffNotes(userId: string): Promise<StaffNote[]>;
  deleteStaffNote(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async updateUserRank(userId: string, rank: string): Promise<void> {
    await db
      .update(users)
      .set({ userRank: rank as any, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateUserAdditionalRanks(
    userId: string,
    ranks: string[],
  ): Promise<void> {
    await db
      .update(users)
      .set({ additionalRanks: ranks, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.passwordResetToken, token),
          sql`${users.passwordResetExpires} > NOW()`,
        ),
      );
    return user;
  }
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }
  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.discordId, discordId));
    return user;
  }
  async getUserByRobloxId(robloxId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.robloxId, robloxId));
    return user;
  }
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  async upsertUser(userData: UpsertUser): Promise<User> {
    if (!userData.id) {
      const { id, ...dataWithoutId } = userData;
      const [user] = await db
        .insert(users)
        .values(dataWithoutId as any)
        .returning();
      return user;
    }
    const [user] = await db
      .insert(users)
      .values(userData as any)
      .onConflictDoUpdate({
        target: users.id,
        set: { ...userData, updatedAt: new Date() } as any,
      })
      .returning();
    return user;
  }
  async updateUser(
    id: string,
    updates: Partial<User>,
  ): Promise<User | undefined> {
    const current = await this.getUser(id);
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
        // Handle array merge for additionalRanks if provided as a single string
        additionalRanks:
          updates.additionalRanks || current?.additionalRanks || [],
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  async deleteUser(id: string): Promise<void> {
    await db.delete(reports).where(eq(reports.reporterId, id));
    await db.delete(appeals).where(eq(appeals.userId, id));
    await db.delete(bans).where(eq(bans.userId, id));
    await db.delete(forumReplies).where(eq(forumReplies.authorId, id));
    await db.delete(forumThreads).where(eq(forumThreads.authorId, id));
    await db.delete(payments).where(eq(payments.userId, id));
    await db.delete(users).where(eq(users.id, id));
  }
  async createMagicLinkToken(email: string): Promise<string> {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await db.insert(magicLinkTokens).values({ email, token, expiresAt });
    return token;
  }
  async verifyMagicLinkToken(token: string): Promise<string | undefined> {
    const [record] = await db
      .select()
      .from(magicLinkTokens)
      .where(
        and(
          eq(magicLinkTokens.token, token),
          lt(magicLinkTokens.expiresAt, new Date()),
        ),
      );
    return record?.email;
  }
  async markMagicLinkTokenAsUsed(token: string): Promise<void> {
    await db
      .update(magicLinkTokens)
      .set({ usedAt: new Date() })
      .where(eq(magicLinkTokens.token, token));
  }
  async getForumCategories(): Promise<ForumCategory[]> {
    return db.select().from(forumCategories).orderBy(forumCategories.order);
  }
  async getForumCategory(id: string): Promise<ForumCategory | undefined> {
    const [category] = await db
      .select()
      .from(forumCategories)
      .where(eq(forumCategories.id, id));
    return category;
  }
  async createForumCategory(
    categoryData: InsertForumCategory,
  ): Promise<ForumCategory> {
    const [category] = await db
      .insert(forumCategories)
      .values(categoryData)
      .returning();
    return category;
  }
  async getForumThreads(categoryId?: string): Promise<ForumThread[]> {
    if (categoryId)
      return db
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.categoryId, categoryId))
        .orderBy(desc(forumThreads.createdAt));
    return db.select().from(forumThreads).orderBy(desc(forumThreads.createdAt));
  }
  async getForumThread(id: string): Promise<ForumThread | undefined> {
    const [thread] = await db
      .select()
      .from(forumThreads)
      .where(eq(forumThreads.id, id));
    return thread;
  }
  async createForumThread(threadData: InsertForumThread): Promise<ForumThread> {
    const [thread] = await db
      .insert(forumThreads)
      .values(threadData)
      .returning();
    return thread;
  }
  async updateForumThread(
    id: string,
    updates: Partial<ForumThread>,
  ): Promise<ForumThread | undefined> {
    const [thread] = await db
      .update(forumThreads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(forumThreads.id, id))
      .returning();
    return thread;
  }
  async updateForumCategory(
    id: string,
    updates: Partial<ForumCategory>,
  ): Promise<ForumCategory | undefined> {
    const [cat] = await db
      .update(forumCategories)
      .set(updates)
      .where(eq(forumCategories.id, id))
      .returning();
    return cat;
  }
  async deleteForumCategory(id: string): Promise<void> {
    const threads = await db
      .select({ id: forumThreads.id })
      .from(forumThreads)
      .where(eq(forumThreads.categoryId, id));
    for (const thread of threads) {
      await db.delete(forumReplies).where(eq(forumReplies.threadId, thread.id));
    }
    await db.delete(forumThreads).where(eq(forumThreads.categoryId, id));
    await db.delete(forumCategories).where(eq(forumCategories.id, id));
  }
  async deleteForumThread(id: string): Promise<void> {
    await db.delete(forumReplies).where(eq(forumReplies.threadId, id));
    await db.delete(forumThreads).where(eq(forumThreads.id, id));
  }
  async getForumReply(id: string): Promise<ForumReply | undefined> {
    const [reply] = await db
      .select()
      .from(forumReplies)
      .where(eq(forumReplies.id, id));
    return reply;
  }
  async updateForumReply(
    id: string,
    updates: Partial<ForumReply>,
  ): Promise<ForumReply | undefined> {
    const [reply] = await db
      .update(forumReplies)
      .set(updates)
      .where(eq(forumReplies.id, id))
      .returning();
    return reply;
  }
  async deleteForumReply(id: string): Promise<void> {
    const reply = await this.getForumReply(id);
    await db.delete(forumReplies).where(eq(forumReplies.id, id));
    if (reply) {
      await db
        .update(forumThreads)
        .set({ replyCount: sql`GREATEST(${forumThreads.replyCount} - 1, 0)` })
        .where(eq(forumThreads.id, reply.threadId));
    }
  }
  async getForumReplies(threadId: string): Promise<ForumReply[]> {
    return db
      .select()
      .from(forumReplies)
      .where(eq(forumReplies.threadId, threadId))
      .orderBy(desc(forumReplies.createdAt));
  }
  async createForumReply(replyData: InsertForumReply): Promise<ForumReply> {
    const [reply] = await db.insert(forumReplies).values(replyData).returning();
    await db
      .update(forumThreads)
      .set({
        replyCount: sql`${forumThreads.replyCount} + 1`,
        lastReplyAt: new Date(),
      })
      .where(eq(forumThreads.id, replyData.threadId));
    return reply;
  }
  async getAnnouncements(): Promise<Announcement[]> {
    return db
      .select()
      .from(announcements)
      .where(eq(announcements.isPublished, true))
      .orderBy(desc(announcements.createdAt));
  }
  async getAnnouncement(id: string): Promise<Announcement | undefined> {
    const [announcement] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id));
    return announcement;
  }
  async createAnnouncement(
    announcementData: InsertAnnouncement,
  ): Promise<Announcement> {
    const [announcement] = await db
      .insert(announcements)
      .values(announcementData)
      .returning();
    return announcement;
  }
  async updateAnnouncement(
    id: string,
    updates: Partial<Announcement>,
  ): Promise<Announcement | undefined> {
    const [announcement] = await db
      .update(announcements)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(announcements.id, id))
      .returning();
    return announcement;
  }
  async deleteAnnouncement(id: string): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }
  async getSiteSettings(): Promise<SiteSettings> {
    const [settings] = await db.select().from(siteSettings).limit(1);
    if (settings) return settings;
    const [newSettings] = await db
      .insert(siteSettings)
      .values({
        isOffline: true,
        offlineMessage: "We're offline right now. Please check back later.",
      })
      .returning();
    return newSettings;
  }
  async updateSiteSettings(
    updates: Partial<SiteSettings>,
  ): Promise<SiteSettings> {
    const current = await this.getSiteSettings();
    const [updated] = await db
      .update(siteSettings)
      .set(updates)
      .where(eq(siteSettings.id, current.id))
      .returning();
    return updated;
  }
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(paymentData).returning();
    return payment;
  }
  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id));
    return payment;
  }
  async getUserPayments(userId: string): Promise<Payment[]> {
    return db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }
  async updatePaymentStatus(
    id: string,
    status: string,
    adminNotes?: string,
  ): Promise<Payment | undefined> {
    const [payment] = await db
      .update(payments)
      .set({ status, adminNotes })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }
  async createReport(reportData: InsertReport): Promise<Report> {
    const [report] = await db.insert(reports).values(reportData).returning();
    return report;
  }
  async getReports(): Promise<Report[]> {
    return db.select().from(reports).orderBy(desc(reports.createdAt));
  }
  async getUserReports(userId: string): Promise<Report[]> {
    return db
      .select()
      .from(reports)
      .where(eq(reports.reporterId, userId))
      .orderBy(desc(reports.createdAt));
  }
  async updateReportStatus(
    id: string,
    status: any,
    notes?: string,
  ): Promise<Report | undefined> {
    const [report] = await db
      .update(reports)
      .set({ status, moderatorNotes: notes })
      .where(eq(reports.id, id))
      .returning();
    return report;
  }
  async getProducts(status?: string): Promise<Product[]> {
    if (status) {
      return db
        .select()
        .from(products)
        .where(eq(products.status, status as any))
        .orderBy(desc(products.createdAt));
    }
    return db.select().from(products).orderBy(desc(products.createdAt));
  }
  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product;
  }
  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }
  async updateProduct(
    id: string,
    updates: Partial<Product>,
  ): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }
  async getBans(activeOnly?: boolean): Promise<Ban[]> {
    if (activeOnly) {
      return db
        .select()
        .from(bans)
        .where(eq(bans.isActive, true))
        .orderBy(desc(bans.createdAt));
    }
    return db.select().from(bans).orderBy(desc(bans.createdAt));
  }
  async getBan(id: string): Promise<Ban | undefined> {
    const [ban] = await db.select().from(bans).where(eq(bans.id, id));
    return ban;
  }
  async getUserBans(userId: string): Promise<Ban[]> {
    return db
      .select()
      .from(bans)
      .where(and(eq(bans.userId, userId), eq(bans.isActive, true)))
      .orderBy(desc(bans.createdAt));
  }
  async createBan(banData: InsertBan): Promise<Ban> {
    const targetUser = await this.getUser(banData.userId);
    const priorRank = targetUser?.userRank || "Active Members";
    const [ban] = await db
      .insert(bans)
      .values({ ...banData, priorRank })
      .returning();
    await db
      .update(users)
      .set({ userRank: "Banned" as any, updatedAt: new Date() })
      .where(eq(users.id, banData.userId));
    return ban;
  }
  async deactivateBan(id: string): Promise<Ban | undefined> {
    const [ban] = await db
      .update(bans)
      .set({ isActive: false })
      .where(eq(bans.id, id))
      .returning();
    if (ban) {
      const restoreRank = (ban.priorRank || "Active Members") as any;
      await db
        .update(users)
        .set({ userRank: restoreRank, updatedAt: new Date() })
        .where(eq(users.id, ban.userId));
    }
    return ban;
  }
  async getAppeals(status?: string): Promise<Appeal[]> {
    if (status) {
      return db
        .select()
        .from(appeals)
        .where(eq(appeals.status, status as any))
        .orderBy(desc(appeals.createdAt));
    }
    return db.select().from(appeals).orderBy(desc(appeals.createdAt));
  }
  async getAppeal(id: string): Promise<Appeal | undefined> {
    const [appeal] = await db.select().from(appeals).where(eq(appeals.id, id));
    return appeal;
  }
  async getUserAppeals(userId: string): Promise<Appeal[]> {
    return db
      .select()
      .from(appeals)
      .where(eq(appeals.userId, userId))
      .orderBy(desc(appeals.createdAt));
  }
  async createAppeal(appealData: InsertAppeal): Promise<Appeal> {
    const [appeal] = await db.insert(appeals).values(appealData).returning();
    return appeal;
  }
  async updateAppeal(
    id: string,
    updates: Partial<Appeal>,
  ): Promise<Appeal | undefined> {
    const [appeal] = await db
      .update(appeals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(appeals.id, id))
      .returning();
    return appeal;
  }
  async getStats(): Promise<{
    totalMembers: number;
  }> {
    const [userCount] = await db.select({ count: sql`count(*)` }).from(users);
    return {
      totalMembers: Number(userCount.count),
    };
  }

  async getAdminStats() {
    const [userCount] = await db.select({ count: sql`count(*)` }).from(users);
    const [threadCount] = await db
      .select({ count: sql`count(*)` })
      .from(forumThreads);
    const [replyCount] = await db
      .select({ count: sql`count(*)` })
      .from(forumReplies);
    const [productCount] = await db
      .select({ count: sql`count(*)` })
      .from(products);
    const [banCount] = await db
      .select({ count: sql`count(*)` })
      .from(bans)
      .where(eq(bans.isActive, true));
    const [reportCount] = await db
      .select({ count: sql`count(*)` })
      .from(reports)
      .where(sql`${reports.status} = 'pending'`);
    const [appealCount] = await db
      .select({ count: sql`count(*)` })
      .from(appeals)
      .where(sql`${appeals.status} = 'pending'`);
    const [paymentCount] = await db
      .select({ count: sql`count(*)` })
      .from(payments);
    const [announcementCount] = await db
      .select({ count: sql`count(*)` })
      .from(announcements);
    return {
      totalUsers: Number(userCount.count),
      totalThreads: Number(threadCount.count),
      totalReplies: Number(replyCount.count),
      totalProducts: Number(productCount.count),
      activeBans: Number(banCount.count),
      pendingReports: Number(reportCount.count),
      pendingAppeals: Number(appealCount.count),
      totalPayments: Number(paymentCount.count),
      totalAnnouncements: Number(announcementCount.count),
    };
  }

  async getRecentActivity(limit = 20): Promise<any[]> {
    const recentBans = await db
      .select({
        id: bans.id,
        type: sql`'ban'`.as("type"),
        description: bans.reason,
        targetId: bans.userId,
        actorId: bans.bannedBy,
        createdAt: bans.createdAt,
      })
      .from(bans)
      .orderBy(desc(bans.createdAt))
      .limit(limit);

    const recentReports = await db
      .select({
        id: reports.id,
        type: sql`'report'`.as("type"),
        description: reports.reason,
        targetId: reports.targetId,
        actorId: reports.reporterId,
        createdAt: reports.createdAt,
      })
      .from(reports)
      .orderBy(desc(reports.createdAt))
      .limit(limit);

    const recentAppeals = await db
      .select({
        id: appeals.id,
        type: sql`'appeal'`.as("type"),
        description: appeals.reason,
        targetId: appeals.userId,
        actorId: appeals.userId,
        createdAt: appeals.createdAt,
      })
      .from(appeals)
      .orderBy(desc(appeals.createdAt))
      .limit(limit);

    const combined = [...recentBans, ...recentReports, ...recentAppeals]
      .sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
      )
      .slice(0, limit);

    return combined;
  }

  async getPolicies(): Promise<Policy[]> {
    return db.select().from(policies).orderBy(policies.slug);
  }

  async getPolicy(slug: string): Promise<Policy | undefined> {
    const [policy] = await db
      .select()
      .from(policies)
      .where(eq(policies.slug, slug));
    return policy;
  }

  async upsertPolicy(
    slug: string,
    title: string,
    content: string,
    updatedBy: string,
  ): Promise<Policy> {
    const existing = await this.getPolicy(slug);
    if (existing) {
      const [updated] = await db
        .update(policies)
        .set({ title, content, updatedBy, updatedAt: new Date() })
        .where(eq(policies.slug, slug))
        .returning();
      return updated;
    }
    const [created] = await db
      .insert(policies)
      .values({ slug, title, content, updatedBy })
      .returning();
    return created;
  }
  async createModerationLog(log: InsertModerationLog): Promise<ModerationLog> {
    const [entry] = await db.insert(moderationLogs).values(log).returning();
    return entry;
  }
  async getModerationLogs(filters?: {
    action?: string;
    actorId?: string;
    targetId?: string;
    limit?: number;
  }): Promise<ModerationLog[]> {
    const conditions = [];
    if (filters?.action)
      conditions.push(eq(moderationLogs.action, filters.action));
    if (filters?.actorId)
      conditions.push(eq(moderationLogs.actorId, filters.actorId));
    if (filters?.targetId)
      conditions.push(eq(moderationLogs.targetId, filters.targetId));

    const query = db.select().from(moderationLogs);
    if (conditions.length > 0) {
      return query
        .where(and(...conditions))
        .orderBy(desc(moderationLogs.createdAt))
        .limit(filters?.limit || 100);
    }
    return query
      .orderBy(desc(moderationLogs.createdAt))
      .limit(filters?.limit || 100);
  }
  async getUserModerationLogs(targetId: string): Promise<ModerationLog[]> {
    return db
      .select()
      .from(moderationLogs)
      .where(eq(moderationLogs.targetId, targetId))
      .orderBy(desc(moderationLogs.createdAt))
      .limit(50);
  }
  async createWarning(warning: InsertWarning): Promise<Warning> {
    const [w] = await db.insert(warnings).values(warning).returning();
    return w;
  }
  async getWarnings(activeOnly?: boolean): Promise<Warning[]> {
    if (activeOnly) {
      return db
        .select()
        .from(warnings)
        .where(eq(warnings.isActive, true))
        .orderBy(desc(warnings.createdAt));
    }
    return db.select().from(warnings).orderBy(desc(warnings.createdAt));
  }
  async getUserWarnings(userId: string): Promise<Warning[]> {
    return db
      .select()
      .from(warnings)
      .where(eq(warnings.userId, userId))
      .orderBy(desc(warnings.createdAt));
  }
  async getWarning(id: string): Promise<Warning | undefined> {
    const [w] = await db.select().from(warnings).where(eq(warnings.id, id));
    return w;
  }
  async deactivateWarning(id: string): Promise<Warning | undefined> {
    const [w] = await db
      .update(warnings)
      .set({ isActive: false })
      .where(eq(warnings.id, id))
      .returning();
    return w;
  }
  async createStaffNote(note: InsertStaffNote): Promise<StaffNote> {
    const [n] = await db.insert(staffNotes).values(note).returning();
    return n;
  }
  async getStaffNotes(userId: string): Promise<StaffNote[]> {
    return db
      .select()
      .from(staffNotes)
      .where(eq(staffNotes.userId, userId))
      .orderBy(desc(staffNotes.createdAt));
  }
  async deleteStaffNote(id: string): Promise<void> {
    await db.delete(staffNotes).where(eq(staffNotes.id, id));
  }
}

export const storage = new DatabaseStorage();
