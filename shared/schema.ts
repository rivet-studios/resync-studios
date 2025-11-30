import { sql, relations } from 'drizzle-orm';
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

// Enums
export const vipTierEnum = pgEnum('vip_tier', ['none', 'bronze', 'sapphire', 'diamond', 'founders']);
export const skillLevelEnum = pgEnum('skill_level', ['beginner', 'intermediate', 'advanced', 'expert', 'pro']);
export const gameRoleEnum = pgEnum('game_role', ['tank', 'dps', 'support', 'healer', 'flex', 'any']);
export const userRankEnum = pgEnum('user_rank', [
  'member',
  'company_director',
  'leadership_council',
  'operations_manager',
  'rs_trust_safety_director',
  'team_member',
  'administrator',
  'senior_administrator',
  'moderator',
  'community_moderator',
  'community_senior_moderator',
  'community_developer',
  'bronze_vip',
  'sapphire_vip',
  'diamond_vip',
  'founders_edition_vip',
  'customer_relations',
  'rs_volunteer_staff'
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"), // Hashed password
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  bio: text("bio"),
  // VIP subscription
  vipTier: vipTierEnum("vip_tier").default('none'),
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
  // User rank/role
  userRank: userRankEnum("user_rank").default('member'),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Clans table
export const clans = pgTable("clans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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

// LFG Posts table
export const lfgPosts = pgTable("lfg_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  game: varchar("game").notNull(),
  platform: varchar("platform").notNull(),
  region: varchar("region"),
  skillLevel: skillLevelEnum("skill_level").default('intermediate'),
  roleNeeded: gameRoleEnum("role_needed").default('any'),
  playersNeeded: integer("players_needed").default(1),
  playersJoined: integer("players_joined").default(0),
  scheduledAt: timestamp("scheduled_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// LFG Participants
export const lfgParticipants = pgTable("lfg_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lfgPostId: varchar("lfg_post_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: gameRoleEnum("role").default('any'),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Build/Meta Guides
export const builds = pgTable("builds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  viewCount: integer("view_count").default(0),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Build Votes
export const buildVotes = pgTable("build_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buildId: varchar("build_id").notNull(),
  userId: varchar("user_id").notNull(),
  isUpvote: boolean("is_upvote").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Forum Categories
export const forumCategories = pgTable("forum_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull(),
  authorId: varchar("author_id").notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  viewCount: integer("view_count").default(0),
  replyCount: integer("reply_count").default(0),
  upvotes: integer("upvotes").default(0),
  lastReplyAt: timestamp("last_reply_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Forum Replies
export const forumReplies = pgTable("forum_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull(),
  authorId: varchar("author_id").notNull(),
  content: text("content").notNull(),
  upvotes: integer("upvotes").default(0),
  parentReplyId: varchar("parent_reply_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat Messages
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull(),
  recipientId: varchar("recipient_id"),
  clanId: varchar("clan_id"),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Magic Link Tokens for email auth
export const magicLinkTokens = pgTable("magic_link_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Friends System
export const friendships = pgTable("friendships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId1: varchar("user_id_1").notNull(),
  userId2: varchar("user_id_2").notNull(),
  status: varchar("status").notNull().default('pending'), // pending, accepted, blocked
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(), // friend_request, achievement, message, etc
  relatedUserId: varchar("related_user_id"),
  message: text("message"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Achievements
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  icon: varchar("icon"),
  criteria: varchar("criteria").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Achievements
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  achievementId: varchar("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// Daily Rewards
export const dailyRewards = pgTable("daily_rewards", {
  userId: varchar("user_id").primaryKey(),
  lastClaimedAt: timestamp("last_claimed_at"),
  streak: integer("streak").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reputation Points
export const reputationPoints = pgTable("reputation_points", {
  userId: varchar("user_id").primaryKey(),
  totalPoints: integer("total_points").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Marketplace Items
export const marketplaceItems = pgTable("marketplace_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  category: varchar("category").notNull(),
  imageUrl: varchar("image_url"),
  isFeatured: boolean("is_featured").default(false),
  salesCount: integer("sales_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Creator Analytics
export const creatorAnalytics = pgTable("creator_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull(),
  totalViews: integer("total_views").default(0),
  totalEarnings: integer("total_earnings").default(0),
  totalSales: integer("total_sales").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Referral Program
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull(),
  referredId: varchar("referred_id").notNull().unique(),
  rewardEarned: integer("reward_earned").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community Challenges
export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  objective: text("objective"),
  reward: integer("reward").default(0),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  participantCount: integer("participant_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Challenge Participants
export const challengeParticipants = pgTable("challenge_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").notNull(),
  userId: varchar("user_id").notNull(),
  progress: integer("progress").default(0),
  completed: boolean("completed").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Reports
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull(),
  targetUserId: varchar("target_user_id"),
  contentType: varchar("content_type"), // user, post, comment, etc
  contentId: varchar("content_id"),
  reason: text("reason").notNull(),
  status: varchar("status").notNull().default('open'), // open, investigating, resolved
  createdAt: timestamp("created_at").defaultNow(),
});

// Blocks
export const blocks = pgTable("blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  blockedUserId: varchar("blocked_user_id").notNull(),
  blockedAt: timestamp("blocked_at").defaultNow(),
});

// Knowledge Base Articles
export const knowledgeBase = pgTable("knowledge_base", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category").notNull(),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Meta Database (Game Builds/Guides)
export const metaDatabase = pgTable("meta_database", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  game: varchar("game").notNull(),
  character: varchar("character"),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  tier: varchar("tier"), // S, A, B, C
  winRate: integer("win_rate"),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Testimonials
export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  text: text("text").notNull(),
  rating: integer("rating").notNull(), // 1-5
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  clan: one(clans, { fields: [users.clanId], references: [clans.id] }),
  lfgPosts: many(lfgPosts),
  builds: many(builds),
  forumThreads: many(forumThreads),
  sentMessages: many(chatMessages),
}));

export const clansRelations = relations(clans, ({ one, many }) => ({
  owner: one(users, { fields: [clans.ownerId], references: [users.id] }),
  members: many(users),
  messages: many(chatMessages),
}));

export const lfgPostsRelations = relations(lfgPosts, ({ one, many }) => ({
  author: one(users, { fields: [lfgPosts.authorId], references: [users.id] }),
  participants: many(lfgParticipants),
}));

export const buildsRelations = relations(builds, ({ one, many }) => ({
  author: one(users, { fields: [builds.authorId], references: [users.id] }),
  votes: many(buildVotes),
}));

export const forumThreadsRelations = relations(forumThreads, ({ one, many }) => ({
  category: one(forumCategories, { fields: [forumThreads.categoryId], references: [forumCategories.id] }),
  author: one(users, { fields: [forumThreads.authorId], references: [users.id] }),
  replies: many(forumReplies),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const insertClanSchema = createInsertSchema(clans).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  memberCount: true 
});
export const insertLfgPostSchema = createInsertSchema(lfgPosts).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  playersJoined: true,
  isActive: true
});
export const insertBuildSchema = createInsertSchema(builds).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  upvotes: true,
  downvotes: true,
  viewCount: true,
  isFeatured: true
});
export const insertForumCategorySchema = createInsertSchema(forumCategories).omit({ 
  id: true, 
  createdAt: true,
  threadCount: true
});
export const insertForumThreadSchema = createInsertSchema(forumThreads).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  viewCount: true,
  replyCount: true,
  upvotes: true,
  lastReplyAt: true
});
export const insertForumReplySchema = createInsertSchema(forumReplies).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  upvotes: true
});
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ 
  id: true, 
  createdAt: true,
  isRead: true
});

export const insertFriendshipSchema = createInsertSchema(friendships).omit({ 
  id: true, 
  createdAt: true 
});
export const insertNotificationSchema = createInsertSchema(notifications).omit({ 
  id: true, 
  createdAt: true,
  isRead: true
});
export const insertAchievementSchema = createInsertSchema(achievements).omit({ 
  id: true, 
  createdAt: true 
});
export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({ 
  id: true, 
  unlockedAt: true
});
export const insertDailyRewardSchema = createInsertSchema(dailyRewards).omit({ 
  updatedAt: true
});
export const insertReputationPointSchema = createInsertSchema(reputationPoints).omit({ 
  updatedAt: true
});
export const insertMarketplaceItemSchema = createInsertSchema(marketplaceItems).omit({ 
  id: true, 
  createdAt: true,
  salesCount: true
});
export const insertCreatorAnalyticsSchema = createInsertSchema(creatorAnalytics).omit({ 
  id: true, 
  updatedAt: true
});
export const insertReferralSchema = createInsertSchema(referrals).omit({ 
  id: true, 
  createdAt: true
});
export const insertChallengeSchema = createInsertSchema(challenges).omit({ 
  id: true, 
  createdAt: true,
  participantCount: true
});
export const insertChallengeParticipantSchema = createInsertSchema(challengeParticipants).omit({ 
  id: true, 
  joinedAt: true
});
export const insertReportSchema = createInsertSchema(reports).omit({ 
  id: true, 
  createdAt: true
});
export const insertBlockSchema = createInsertSchema(blocks).omit({ 
  id: true, 
  blockedAt: true
});
export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).omit({ 
  id: true, 
  createdAt: true,
  viewCount: true
});
export const insertMetaDatabaseSchema = createInsertSchema(metaDatabase).omit({ 
  id: true, 
  createdAt: true,
  viewCount: true
});
export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ 
  id: true, 
  createdAt: true
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Clan = typeof clans.$inferSelect;
export type InsertClan = z.infer<typeof insertClanSchema>;

export type LfgPost = typeof lfgPosts.$inferSelect;
export type InsertLfgPost = z.infer<typeof insertLfgPostSchema>;

export type LfgParticipant = typeof lfgParticipants.$inferSelect;

export type Build = typeof builds.$inferSelect;
export type InsertBuild = z.infer<typeof insertBuildSchema>;

export type BuildVote = typeof buildVotes.$inferSelect;

export type ForumCategory = typeof forumCategories.$inferSelect;
export type InsertForumCategory = z.infer<typeof insertForumCategorySchema>;

export type ForumThread = typeof forumThreads.$inferSelect;
export type InsertForumThread = z.infer<typeof insertForumThreadSchema>;

export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type DailyReward = typeof dailyRewards.$inferSelect;
export type InsertDailyReward = z.infer<typeof insertDailyRewardSchema>;

export type ReputationPoint = typeof reputationPoints.$inferSelect;
export type InsertReputationPoint = z.infer<typeof insertReputationPointSchema>;

export type MarketplaceItem = typeof marketplaceItems.$inferSelect;
export type InsertMarketplaceItem = z.infer<typeof insertMarketplaceItemSchema>;

export type CreatorAnalytics = typeof creatorAnalytics.$inferSelect;
export type InsertCreatorAnalytics = z.infer<typeof insertCreatorAnalyticsSchema>;

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;
export type InsertChallengeParticipant = z.infer<typeof insertChallengeParticipantSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type Block = typeof blocks.$inferSelect;
export type InsertBlock = z.infer<typeof insertBlockSchema>;

export type KnowledgeBaseArticle = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBaseArticle = z.infer<typeof insertKnowledgeBaseSchema>;

export type MetaGuide = typeof metaDatabase.$inferSelect;
export type InsertMetaGuide = z.infer<typeof insertMetaDatabaseSchema>;

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

// VIP tier configuration
export const VIP_TIERS = {
  none: { name: 'Free', price: 0, features: [] },
  bronze: { 
    name: 'Bronze VIP', 
    price: 1299, 
    features: ['Exclusive Discord Role & Privileges', 'Priority HelpDesk Support', 'Priority Moderation Appeals', 'XP Boost (20%)', 'Paychecks Boost (20%)', 'Save 20% on Vehicle Insurance', 'ATM Fees Waived']
  },
  sapphire: { 
    name: 'Sapphire VIP', 
    price: 2999, 
    features: ['Exclusive Discord Role & Privileges', 'High Priority HelpDesk Support', 'High Priority Moderation Appeals', 'XP Boost (35%)', 'Paychecks Boost (30%)', 'Save 25% on Vehicle Insurance', 'Exclusive Vehicles', 'ATM Fees Waived']
  },
  diamond: { 
    name: 'Diamond VIP', 
    price: 4499, 
    features: ['Exclusive Discord Role & Privileges', 'High Priority HelpDesk Support', 'High Priority Moderation Appeals', 'Audi RS3 Given Monthly', 'XP Boost (45%)', 'Medical Bills 50% Off', 'No Wallet Limit', 'Save 35% on Vehicles', 'Perma-Knife on Civilian Team', 'ATM Fees Waived']
  },
  founders: { 
    name: 'Founders Edition', 
    price: 12000, 
    features: ['Exclusive Founders Discord Role', 'Urgent Priority HelpDesk Support', 'Instant VBI Access & Arrest Authority', 'All Team-Queue & Team Count Bypass', 'Hellcat Given Monthly', 'XP Boost (55%)', 'Medical Bills 55% Off', 'No Wallet Limit', 'Save 50% on Vehicles', 'Perma-Glock on Civilian Team', 'ATM Fees Waived']
  },
} as const;
