import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const reportStatusEnum = pgEnum("report_status", [
  "Pending",
  "In Review",
  "Dismissed",
  "Action Taken",
]);

export const reports = pgTable("reports", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull(),
  targetId: varchar("target_id").notNull(),
  targetType: varchar("target_type").notNull(),
  reason: text("reason").notNull(),
  details: text("details"),
  status: reportStatusEnum("status").default("Pending"),
  moderatorNotes: text("moderator_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  status: true,
  moderatorNotes: true,
  createdAt: true,
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

// Enums
export const vipTierEnum = pgEnum("vip_tier", [
  "none",
  "Bronze VIP",
  "Diamond VIP",
  "Founders Edition VIP",
  "Lifetime",
]);
export const userRankEnum = pgEnum("user_rank", [
  "Banned",
  "Active Members",
  "Trusted Member",
  "Community Partner",
  "Bronze VIP",
  "Diamond VIP",
  "Founders Edition VIP",
  "Lifetime",
  "Vehicle Tester",
  "Customer Relations",
  "Appeals Moderator",
  "Trial Moderator",
  "Moderator",
  "Administrator",
  "Senior Administrator",
  "Developer",
  "Staff Internal Affairs",
  "Team Member",
  // "MI Trust & Safety Director"-disabled
  "Staff Department Director",
  "Operations Manager",
  "Company Director",
]);

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"), // Hashed password
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  bio: text("bio"),
  signature: text("signature"),
  // VIP subscription
  vipTier: vipTierEnum("vip_tier").default("none"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  // Discord linking
  discordId: varchar("discord_id").unique(),
  discordUsername: varchar("discord_username"),
  discordAvatar: varchar("discord_avatar"),
  discordLinkedAt: timestamp("discord_linked_at"),
  // Roblox linking
  robloxId: varchar("roblox_id").unique(),
  robloxUsername: varchar("roblox_username"),
  robloxDisplayName: varchar("roblox_display_name"),
  robloxLinkedAt: timestamp("roblox_linked_at"),
  // User Ranks
  userRank: userRankEnum("user_rank").default("Active Members"),

  additionalRanks: text("additional_ranks")
    .array()
    .default(sql`'{}'::text[]`),
  // Moderator Dashboard
  isModerator: boolean("is_moderator").default(false),
  // Admin Dashboard
  isAdmin: boolean("is_admin").default(false),
  // Date of Birth
  dateOfBirth: varchar("date_of_birth"),
  // Password Reset
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Forum Categories
export const forumCategories = pgTable("forum_categories", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  color: varchar("color"),
  group: varchar("group"),
  order: integer("order").default(0),
  threadCount: integer("thread_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Forum Threads
export const forumThreads = pgTable("forum_threads", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull(),
  authorId: varchar("author_id").notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  viewCount: integer("view_count").default(1),
  replyCount: integer("reply_count").default(0),
  upvotes: integer("upvotes").default(0),
  lastReplyAt: timestamp("last_reply_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Forum Replies
export const forumReplies = pgTable("forum_replies", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull(),
  authorId: varchar("author_id").notNull(),
  content: text("content").notNull(),
  upvotes: integer("upvotes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Magic Link Tokens
export const magicLinkTokens = pgTable("magic_link_tokens", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
});

// Announcements
export const announcements = pgTable("announcements", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull(),
  isPublished: boolean("is_published").default(false),
  category: varchar("category").default("General"),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Site Settings
export const siteSettings = pgTable("site_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  isOffline: boolean("is_offline").default(false),
  offlineMessage: text("offline_message"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payments
export const payments = pgTable("payments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  amount: integer("amount").notNull(),
  currency: varchar("currency").default("USD"),
  status: varchar("status").default("pending"),
  tierId: varchar("tier_id"),
  stripePaymentId: varchar("stripe_payment_id"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertForumThreadSchema = createInsertSchema(forumThreads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
  createdAt: true,
});
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const productStatusEnum = pgEnum("product_status", [
  "Pending",
  "Approved",
  "Denied",
]);

export const products = pgTable("products", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  imageUrl: varchar("image_url"),
  category: varchar("category"),
  submitterId: varchar("submitter_id").notNull(),
  status: productStatusEnum("status").default("Pending"),
  isCommunityProvided: boolean("is_community_provided").default(false),
  isFeatured: boolean("is_featured").default(false),
  isLimitedEdition: boolean("is_limited_edition").default(false),
  isVerified: boolean("is_verified").default(false),
  reviewedBy: varchar("reviewed_by"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  status: true,
  isCommunityProvided: true,
  isFeatured: true,
  isLimitedEdition: true,
  isVerified: true,
  reviewedBy: true,
  reviewNotes: true,
  createdAt: true,
  updatedAt: true,
});

export const bans = pgTable("bans", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  reason: text("reason").notNull(),
  bannedBy: varchar("banned_by").notNull(),
  isPermanent: boolean("is_permanent").default(true),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  priorRank: varchar("prior_rank").default("Active Members"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBanSchema = createInsertSchema(bans).omit({
  id: true,
  isActive: true,
  priorRank: true,
  createdAt: true,
});

export const appealStatusEnum = pgEnum("appeal_status", [
  "Pending",
  "In Review",
  "Approved",
  "Denied",
]);

export const appeals = pgTable("appeals", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  banId: varchar("ban_id"),
  reason: text("reason").notNull(),
  status: appealStatusEnum("status").default("Pending"),
  reviewedBy: varchar("reviewed_by"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAppealSchema = createInsertSchema(appeals).omit({
  id: true,
  status: true,
  reviewedBy: true,
  reviewNotes: true,
  createdAt: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = Partial<User> & { id?: string };
export type ForumCategory = typeof forumCategories.$inferSelect;
export type InsertForumCategory = z.infer<
  ReturnType<typeof createInsertSchema<typeof forumCategories>>
>;
export type ForumThread = typeof forumThreads.$inferSelect;
export type InsertForumThread = z.infer<typeof insertForumThreadSchema>;
export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = z.infer<
  ReturnType<typeof createInsertSchema<typeof siteSettings>>
>;
export const policies = pgTable("policies", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  slug: varchar("slug").notNull().unique(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  updatedBy: varchar("updated_by"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Policy = typeof policies.$inferSelect;

export const warningSeverityEnum = pgEnum("warning_severity", [
  "Verbal",
  "Written",
  "Final",
]);

export const moderationLogs = pgTable("moderation_logs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  action: varchar("action").notNull(),
  actorId: varchar("actor_id").notNull(),
  targetId: varchar("target_id"),
  targetType: varchar("target_type"),
  details: text("details"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertModerationLogSchema = createInsertSchema(
  moderationLogs,
).omit({
  id: true,
  createdAt: true,
});

export const warnings = pgTable("warnings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  issuedBy: varchar("issued_by").notNull(),
  reason: text("reason").notNull(),
  severity: warningSeverityEnum("severity").notNull(),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWarningSchema = createInsertSchema(warnings).omit({
  id: true,
  isActive: true,
  createdAt: true,
});

export const staffNotes = pgTable("staff_notes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  authorId: varchar("author_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStaffNoteSchema = createInsertSchema(staffNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Ban = typeof bans.$inferSelect;
export type InsertBan = z.infer<typeof insertBanSchema>;
export type Appeal = typeof appeals.$inferSelect;
export type InsertAppeal = z.infer<typeof insertAppealSchema>;
export type ModerationLog = typeof moderationLogs.$inferSelect;
export type InsertModerationLog = z.infer<typeof insertModerationLogSchema>;
export type Warning = typeof warnings.$inferSelect;
export type InsertWarning = z.infer<typeof insertWarningSchema>;
export type StaffNote = typeof staffNotes.$inferSelect;
export type InsertStaffNote = z.infer<typeof insertStaffNoteSchema>;
