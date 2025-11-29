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

// VIP tier configuration
export const VIP_TIERS = {
  none: { name: 'Free', price: 0, features: [] },
  bronze: { 
    name: 'Bronze VIP', 
    price: 499, 
    features: ['Bronze VIP Badge', 'Priority LFG Matching', 'Custom Profile Banner', 'Bronze Discord Role']
  },
  sapphire: { 
    name: 'Sapphire VIP', 
    price: 999, 
    features: ['Sapphire VIP Badge', 'Priority LFG Matching', 'Custom Profile Banner', 'Sapphire Discord Role', 'Exclusive Builds Access', 'Ad-Free Experience']
  },
  diamond: { 
    name: 'Diamond VIP', 
    price: 1999, 
    features: ['Diamond VIP Badge', 'Priority LFG Matching', 'Custom Profile Banner', 'Diamond Discord Role', 'Exclusive Builds Access', 'Ad-Free Experience', 'Clan Creation (100 members)', 'Priority Support']
  },
  founders: { 
    name: 'Founders Edition', 
    price: 4999, 
    features: ['Founders Badge (Limited)', 'All Diamond Features', 'Founders Discord Role', 'Early Access Features', 'Direct Dev Communication', 'Unlimited Clan Size', 'Custom In-Game Perks']
  },
} as const;
