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
  "pending",
  "reviewed",
  "dismissed",
  "action_taken",
]);

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull(),
  targetId: varchar("target_id").notNull(),
  targetType: varchar("target_type").notNull(),
  reason: text("reason").notNull(),
  details: text("details"),
  status: reportStatusEnum("status").default("pending"),
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
  "bronze",
  "sapphire",
  "diamond",
  "founders",
  "founders_lifetime",
  "lifetime",
]);
export const skillLevelEnum = pgEnum("skill_level", [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
  "pro",
]);
export const gameRoleEnum = pgEnum("game_role", [
  "tank",
  "dps",
  "support",
  "healer",
  "flex",
  "any",
]);
export const userRankEnum = pgEnum("user_rank", [
  "banned",
  "member",
  "active_member",
  "trusted_member",
  "community_partner",
  "bronze_vip",
  "diamond_vip",
  "founders_edition_vip",
  "lifetime",
  "customer_relations",
  "rs_volunteer_staff",
  "rs_trust_safety_team",
  "appeals_moderator",
  "community_moderator",
  "community_senior_moderator",
  "community_administrator",
  "community_senior_administrator",
  "community_developer",
  "staff_internal_affairs",
  "mi_trust_safety_director_trademark",
  "staff_department_director",
  "team_member",
  "operations_manager",
  "company_director",
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
  // Gaming stats
  gamesPlayed: integer("games_played").default(0),
  totalPosts: integer("total_posts").default(0),
  reputation: integer("reputation").default(0),
  // Clan membership
  clanId: varchar("clan_id"),
  clanRole: varchar("clan_role"),
  // User rank/role - Support for multiple ranks (up to 20)
  userRank: userRankEnum("user_rank").default("member"), // Primary rank
  secondaryUserRank: text("secondary_user_rank").default("None"), // Secondary rank
  tertiaryUserRank: userRankEnum("tertiary_user_rank").default("lifetime"), // Tertiary rank
  quaternaryUserRank: text("quaternary_user_rank").default("None"),
  quinaryUserRank: text("quinary_user_rank").default("None"),
  senaryUserRank: text("senary_user_rank").default("None"),
  septenaryUserRank: text("septenary_user_rank").default("None"),
  octonaryUserRank: text("octonary_user_rank").default("None"),
  nonaryUserRank: text("nonary_user_rank").default("None"),
  denaryUserRank: text("denary_user_rank").default("None"),
  eleventhUserRank: text("eleventh_user_rank").default("None"),
  twelfthUserRank: text("twelfth_user_rank").default("None"),
  thirteenthUserRank: text("thirteenth_user_rank").default("None"),
  fourteenthUserRank: text("fourteenth_user_rank").default("None"),
  fifteenthUserRank: text("fifteenth_user_rank").default("None"),
  sixteenthUserRank: text("sixteenth_user_rank").default("None"),
  seventeenthUserRank: text("seventeenth_user_rank").default("None"),
  eighteenthUserRank: text("eighteenth_user_rank").default("None"),
  nineteenthUserRank: text("nineteenth_user_rank").default("None"),
  twentiethUserRank: text("twentieth_user_rank").default("None"),
  // Banning
  isBanned: boolean("is_banned").default(false),
  banReason: text("ban_reason"),
  bannedAt: timestamp("banned_at"),
  bannedBy: varchar("banned_by"),
  // Website Ban
  isWebsiteBanned: boolean("is_website_banned").default(false),
  websiteBanReason: text("website_ban_reason"),
  websiteBannedAt: timestamp("website_banned_at"),
  websiteBannedBy: varchar("website_banned_by"),
  // Moderator Dashboard
  isModerator: boolean("is_moderator").default(false),
  // Admin Dashboard
  isAdmin: boolean("is_admin").default(false),
  // Community Developer Dashboard
  isCommunity Developer: boolean("is_community_developer").default(false),
  // EAR (Emergency Access Request) Dashboard
  isEAR: boolean("is_ear").default(false),
  earRequests: text("ear_requests"),
  earRequestStatus: varchar("ear_request_status").default("pending"),
  earRequestDate: timestamp("ear_request_date"),
  earRequestReviewedBy: varchar("ear_request_reviewed_by"),
  earRequestReviewedDate: timestamp("ear_request_reviewed_date"),
  earRequestReviewedReason: text("ear_request_reviewed_reason"),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Clans table
export const clans = pgTable("clans", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  tag: varchar("tag", { length: 6 }).notNull().unique(),
  description: text("description"),
  logoUrl: varchar("logo_url"),
  bannerUrl: varchar("banner_url"),
  ownerId: varchar("owner_id").notNull(),
  isRecruiting: boolean("is_recruiting").default(true),
  memberCount: integer("member_count").default(1),
  maxMembers: integer("max_members").default(50),
  discordInvite: varchar("discord_invite"),
  primaryGame: varchar("primary_game"),
  requirements: text("requirements"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Build/Meta Guides
export const builds = pgTable("builds", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  game: varchar("game").notNull(),
  character: varchar("character"),
  category: varchar("category"),
  content: text("content").notNull(),
  imageUrl: varchar("image_url"),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  viewCount: integer("view_count").default(1),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Build Votes
export const buildVotes = pgTable("build_votes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  buildId: varchar("build_id").notNull(),
  userId: varchar("user_id").notNull(),
  isUpvote: boolean("is_upvote").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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
  replyCount: integer("reply_count").default(1),
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

// Chat Messages
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull(),
  recipientId: varchar("recipient_id"),
  clanId: varchar("clan_id"),
  content: text("content").notNull(),
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
export const insertClanSchema = createInsertSchema(clans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertBuildSchema = createInsertSchema(builds).omit({
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
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
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

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = Partial<User> & { id?: string };
export type Clan = typeof clans.$inferSelect;
export type InsertClan = z.infer<typeof insertClanSchema>;
export type Build = typeof builds.$inferSelect;
export type InsertBuild = z.infer<typeof insertBuildSchema>;
export type BuildVote = typeof buildVotes.$inferSelect;
export type ForumCategory = typeof forumCategories.$inferSelect;
export type InsertForumCategory = z.infer<ReturnType<typeof createInsertSchema<typeof forumCategories>>>;
export type ForumThread = typeof forumThreads.$inferSelect;
export type InsertForumThread = z.infer<typeof insertForumThreadSchema>;
export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = z.infer<ReturnType<typeof createInsertSchema<typeof siteSettings>>>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
