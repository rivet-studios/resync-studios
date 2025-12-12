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

// Enums
export const vipTierEnum = pgEnum("vip_tier", [
  "none",
  "bronze",
  "sapphire",
  "diamond",
  "founders",
  "founders_lifetime",
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
  "member", // Default rank for all users
  "active_member", // Users who have played games or posted in forums
  "trusted_member", // Users who have been active for a long time
  "community_partner", // Users who have partnered with Resync Studios
  "company_director", // Chief Executive Officer (CEO) & Founder of Resync Studios - cxiqlne
  "leadership_council", // Members of the Leadership Council
  "operations_manager", // Operations Managers
  "staff_administration_director", // RS Trust & Safety Director
  "team_member", // Users who are part of the Resync Studios team and users who are retired/former staff HR
  "administrator", // Users who are administrators
  "senior_administrator", // Users who are senior administrators - Trust & Safety Director typically recieves this rank as well
  "moderator", // Users who are moderators
  "community_moderator", // Users who are community moderators - Volunteer Staff typically recieves this rank
  "community_senior_moderator", // Users who are community senior moderators - Volunteer Staff typically recieves this rank upon promotion
  "community_developer", // Users who are community developers
  "bronze_vip", // Users who have purchased Bronze VIP
  "sapphire_vip", // Users who have purchased Sapphire VIP
  "diamond_vip", // Users who have purchased Diamond VIP
  "founders_edition_vip", // Users who have purchased Founders Edition VIP
  "founders_edition_lifetime", // Users who have purchased Founders Edition Lifetime VIP
  "customer_relations", // Users who are part of the Customer Relations team
  "rs_volunteer_staff", // Users who are part of the RS Volunteer Staff team - given to users upon passing the Volunteer Staff application process
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
  // User rank/role - User rank is the primary rank of the user - User rank can be either member, active_member, trusted_member, community_partner, company_director, leadership_council, operations_manager, staff_administration_director, team_member, administrator, senior_administrator, moderator, community_moderator, community_senior_moderator, community_developer, bronze_vip, sapphire_vip, diamond_vip, founders_edition_vip, founders_edition_lifetime, customer_relations, rs_volunteer_staff
  userRank: userRankEnum("user_rank").default("member"), // Primary rank
  secondaryUserRank: userRankEnum("secondary_user_rank").default("member"), // Secondary rank - Optional - if none provided, secondary rank will be set to member by default. If a secondary rank is provided, it will be set to that rank. If the user is a VIP, the secondary rank will be set to the VIP rank unless a secondary rank is provided, in which case it will be set to that rank. If the user is a staff member, the secondary rank will be set to the staff rank unless a secondary rank is provided, in which case it will be set to that rank. - The following ranks are available for secondary ranks: member, active_member, trusted_member, community_partner, company_director, leadership_council, operations_manager, staff_administration_director, team_member, administrator, senior_administ administrator, moderator, community_moderator, community_senior_moderator, community_developer, bronze_vip, sapphire_vip, diamond_vip, founders_edition_vip, founders_edition_lifetime - The following ranks are available for primary ranks: member, active_member, trusted_member, community_partner, company_director, leadership_council, operations_manager, staff_administration_director, team_member, administrator, senior_administrator, moderator, community_moderator, community_senior_moderator, community_developer, bronze_vip, sapphire_vip, diamond_vip, founders_edition_vip, founders_edition_lifetime, customer_relations, rs_volunteer_staff - The following ranks are available for VIP ranks: bronze_vip, sapphire_vip, diamond_vip, founders_edition_vip, founders_edition_lifetime - The following ranks are available for staff ranks: administrator, senior_administrator, moderator, community_moderator, community_senior_moderator, community_developer, rs_volunteer_staff
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
  isCommunityDeveloper: boolean("is_community_developer").default(false),
  // EAR (Emergency Access Request) Dashboard - EAR is a system that allows users to request access to the website if they are banned or have a website ban - EAR is only available to users who have a valid reason for requesting access
  isEAR: boolean("is_ear").default(false),
  // EAR Requests - EAR Requests are requests made by users to request access to the website if they are banned or have a website ban - EAR Requests are only available to users who have a valid reason for requesting access - EAR Requests are reviewed by the EAR Dashboard
  earRequests: text("ear_requests"),
  // EAR Request Status - EAR Request Status is the status of the EAR Request - EAR Request Status can be either pending, approved, or denied - EAR Request Status is reviewed by the EAR Dashboard
  earRequestStatus: varchar("ear_request_status").default("pending"),
  // EAR Request Date - EAR Request Date is the date the EAR Request was made - EAR Request Date is reviewed by the EAR Dashboard
  earRequestDate: timestamp("ear_request_date"),
  // EAR Request Reviewed By - EAR Request Reviewed By is the user who reviewed the EAR Request - EAR Request Reviewed By is reviewed by the EAR Dashboard
  earRequestReviewedBy: varchar("ear_request_reviewed_by"),
  // EAR Request Reviewed Date - EAR Request Reviewed Date is the date the EAR Request was reviewed - EAR Request Reviewed Date is reviewed by the EAR Dashboard - EAR Request Reviewed Date is only available if the EAR Request Status is either approved or denied
  earRequestReviewedDate: timestamp("ear_request_reviewed_date"),
  // EAR Request Reviewed Reason - EAR Request Reviewed Reason is the reason the EAR Request was reviewed - EAR Request Reviewed Reason is reviewed by the EAR Dashboard - EAR Request Reviewed Reason is only available if the EAR Request Status is either approved or denied - EAR Request Reviewed Reason can be either approved or denied
  earRequestReviewedReason: text("ear_request_reviewed_reason"),
  // Discord Server Roles - Discord Server Roles are the roles that the user has in the Resync Studios Discord server - Discord Server Roles are only available to users who have linked their Discord account to the website - Discord Server Roles are reviewed by the Discord Server Roles Dashboard
  discordServerRoles: text("discord_server_roles"),
  // Discord Server Roles Date - Discord Server Roles Date is the date the Discord Server Roles were last updated - Discord Server Roles Date is reviewed by the Discord Server Roles Dashboard
  discordServerRolesDate: timestamp("discord_server_roles_date"),
  // Discord Server Roles Reviewed By - Discord Server Roles Reviewed By is the user who reviewed the Discord Server Roles - Discord Server Roles Reviewed By is reviewed by the Discord Server Roles Dashboard
  discordServerRolesReviewedBy: varchar("discord_server_roles_reviewed_by"),
  // Discord Server Roles Reviewed Date - Discord Server Roles Reviewed Date is the date the Discord Server Roles were last reviewed - Discord Server Roles Reviewed Date is reviewed by the Discord Server Roles Dashboard
  discordServerRolesReviewedDate: timestamp(
    "discord_server_roles_reviewed_date",
  ),
  // Discord Server Roles Reviewed Reason - Discord Server Roles Reviewed Reason is the reason the Discord Server Roles were last reviewed - Discord Server Roles Reviewed Reason is reviewed by the Discord Server Roles Dashboard
  discordServerRolesReviewedReason: text(
    "discord_server_roles_reviewed_reason",
  ),
  // HelpDesk Tickets - HelpDesk Tickets are the tickets that the user has created in the HelpDesk - HelpDesk Tickets are only available to users who have created a HelpDesk ticket - HelpDesk Tickets are reviewed by the HelpDesk Dashboard - HelpDesk Tickets can be either open, closed, or pending - HelpDesk Tickets can be either public or private - HelpDesk Tickets can be either urgent or non-urgent - HelpDesk Tickets can be either high priority or low priority - HelpDesk Tickets can be either high severity or low severity - HelpDesk Tickets can be either high impact or low impact - HelpDesk Tickets can be either high risk or low risk - Help Desk Tickets can be either high reward or low reward - HelpDesk Tickets can be either high value or low value - HelpDesk Tickets can be either high cost or low cost - HelpDesk Tickets can be either high benefit or low benefit - HelpDesk Tickets can be either high return or low return - HelpDesk Tickets can be either high ROI or low ROI - HelpDesk Tickets can be either high leverage or low leverage
  helpDeskTickets: text("help_desk_tickets"),
  // HelpDesk Tickets Date - HelpDesk Tickets Date is the date the HelpDesk Tickets were last updated - HelpDesk Tickets Date is reviewed by the HelpDesk Dashboard
  helpDeskTicketsDate: timestamp("help_desk_tickets_date"),
  // HelpDesk Tickets Reviewed By - HelpDesk Tickets Reviewed By is the user who reviewed the HelpDesk Tickets - HelpDesk Tickets Reviewed By is reviewed by the HelpDesk Dashboard
  helpDeskTicketsReviewedBy: varchar("help_desk_tickets_reviewed_by"),
  // HelpDesk Tickets Reviewed Date - HelpDesk Tickets Reviewed Date is the date the HelpDesk Tickets were last reviewed - HelpDesk Tickets Reviewed Date is reviewed by the HelpDesk Dashboard
  helpDeskTicketsReviewedDate: timestamp("help_desk_tickets_reviewed_date"),
  // HelpDesk Tickets Reviewed Reason - HelpDesk Tickets Reviewed Reason is the reason the HelpDesk Tickets were last reviewed - HelpDesk Tickets Reviewed Reason is reviewed by the HelpDesk Dashboard
  helpDeskTicketsReviewedReason: text("help_desk_tickets_reviewed_reason"),
  // HelpDesk Tickets Status - HelpDesk Tickets Status is the status of the HelpDesk Tickets - HelpDesk Tickets Status can be either open, closed, or pending - HelpDesk Tickets Status is reviewed by the HelpDesk Dashboard
  helpDeskTicketsStatus: varchar("help_desk_tickets_status").default("open"),
  // HelpDesk Tickets Priority - HelpDesk Tickets Priority is the priority of the HelpDesk Tickets - HelpDesk Tickets Priority can be either high or low - HelpDesk Tickets Priority is reviewed by the HelpDesk Dashboard
  helpDeskTicketsPriority: varchar("help_desk_tickets_priority").default("low"),
  // HelpDesk Tickets Severity - HelpDesk Tickets Severity is the severity of the HelpDesk Tickets - HelpDesk Tickets Severity can be either high or low - HelpDesk Tickets Severity is reviewed by the HelpDesk Dashboard
  helpDeskTicketsSeverity: varchar("help_desk_tickets_severity").default("low"),
  // HelpDesk Tickets Impact - HelpDesk Tickets Impact is the impact of the HelpDesk Tickets - HelpDesk Tickets Impact can be either high or low - HelpDesk Tickets Impact is reviewed by the HelpDesk Dashboard
  helpDeskTicketsImpact: varchar("help_desk_tickets_impact").default("low"),
  // HelpDesk Tickets Risk - HelpDesk Tickets Risk is the risk of the HelpDesk Tickets - HelpDesk Tickets Risk can be either high or low - HelpDesk Tickets Risk is reviewed by the HelpDesk Dashboard
  helpDeskTicketsRisk: varchar("help_desk_tickets_risk").default("low"),
  // HelpDesk Tickets Reward - HelpDesk Tickets Reward is the reward of the HelpDesk Tickets - HelpDesk Tickets Reward can be either high or low - HelpDesk Tickets Reward is reviewed by the HelpDesk Dashboard
  helpDeskTicketsReward: varchar("help_desk_tickets_reward").default("low"),
  // HelpDesk Tickets Value - HelpDesk Tickets Value is the value of the HelpDesk Tickets - HelpDesk Tickets Value can be either high or low - HelpDesk Tickets Value is reviewed by the HelpDesk Dashboard
  helpDeskTicketsValue: varchar("help_desk_tickets_value").default("low"),
  // HelpDesk Tickets Cost - HelpDesk Tickets Cost is the cost of the HelpDesk Tickets - HelpDesk Tickets Cost can be either high or low - HelpDesk Tickets Cost is reviewed by the HelpDesk Dashboard
  helpDeskTicketsCost: varchar("help_desk_tickets_cost").default("low"),
  // HelpDesk Tickets Benefit - HelpDesk Tickets Benefit is the benefit of the HelpDesk Tickets - HelpDesk Tickets Benefit can be either high or low - HelpDesk Tickets Benefit is reviewed by the HelpDesk Dashboard
  helpDeskTicketsBenefit: varchar("help_desk_tickets_benefit").default("low"),
  // HelpDesk Tickets Return - HelpDesk Tickets Return is the return of the HelpDesk Tickets - HelpDesk Tickets Return can be either high or low - HelpDesk Tickets Return is reviewed by the HelpDesk Dashboard
  helpDeskTicketsReturn: varchar("help_desk_tickets_return").default("low"),
  // HelpDesk Tickets ROI - HelpDesk Tickets ROI is the ROI of the HelpDesk Tickets - HelpDesk Tickets ROI can be either high or low - HelpDesk Tickets ROI is reviewed by the HelpDesk Dashboard
  helpDeskTicketsROI: varchar("help_desk_tickets_roi").default("low"),
  // HelpDesk Tickets Leverage - HelpDesk Tickets Leverage is the leverage of the HelpDesk Tickets - HelpDesk Tickets Leverage can be either high or low - HelpDesk Tickets Leverage is reviewed by the HelpDesk Dashboard
  helpDeskTicketsLeverage: varchar("help_desk_tickets_leverage").default("low"),
  // HelpDesk Tickets Public - HelpDesk Tickets Public is whether the HelpDesk Tickets are public or private - HelpDesk Tickets Public is reviewed by the HelpDesk Dashboard
  helpDeskTicketsPublic: boolean("help_desk_tickets_public").default(false),
  // HelpDesk Tickets Urgent - HelpDesk Tickets Urgent is whether the HelpDesk Tickets are urgent or non-urgent - HelpDesk Tickets Urgent is reviewed by the HelpDesk Dashboard
  helpDeskTicketsUrgent: boolean("help_desk_tickets_urgent").default(false),
  // HelpDesk Tickets High Priority - HelpDesk Tickets High Priority is whether the HelpDesk Tickets are high priority or low priority - HelpDesk Tickets High Priority is reviewed by the HelpDesk Dashboard
  helpDeskTicketsHighPriority: boolean(
    "help_desk_tickets_high_priority",
  ).default(false),
  // HelpDesk Tickets High Severity - HelpDesk Tickets High Severity is whether the HelpDesk Tickets are high severity or low severity - HelpDesk Tickets High Severity is reviewed by the HelpDesk Dashboard
  helpDeskTicketsHighSeverity: boolean(
    "help_desk_tickets_high_severity",
  ).default(false),
  // HelpDesk Tickets High Impact - HelpDesk Tickets High Impact is whether the HelpDesk Tickets are high impact or low impact - HelpDesk Tickets High Impact is reviewed by the HelpDesk Dashboard
  helpDeskTicketsHighImpact: boolean("help_desk_tickets_high_impact").default(
    false,
  ),
  // HelpDesk Tickets High Risk - HelpDesk Tickets High Risk is whether the HelpDesk Tickets are high risk or low risk - HelpDesk Tickets High Risk is reviewed by the HelpDesk Dashboard
  helpDeskTicketsHighRisk: boolean("help_desk_tickets_high_risk").default(
    false,
  ),
  // HelpDesk Tickets High Reward - HelpDesk Tickets High Reward is whether the HelpDesk Tickets are high reward or low reward - HelpDesk Tickets High Reward is reviewed by the HelpDesk Dashboard
  helpDeskTicketsHighReward: boolean("help_desk_tickets_high_reward").default(
    false,
  ),
  // HelpDesk Tickets High Value - HelpDesk Tickets High Value is whether the HelpDesk Tickets are high value or low value - HelpDesk Tickets High Value is reviewed by the HelpDesk Dashboard
  helpDeskTicketsHighValue: boolean("help_desk_tickets_high_value").default(
    false,
  ),
  // HelpDesk Tickets High Cost - HelpDesk Tickets High Cost is whether the HelpDesk Tickets are high cost or low cost - HelpDesk Tickets High Cost is reviewed by the HelpDesk Dashboard
  helpDeskTicketsHighCost: boolean("help_desk_tickets_high_cost").default(
    false,
  ),
  // HelpDesk Tickets High Benefit - HelpDesk Tickets High Benefit is whether the HelpDesk Tickets are high benefit or low benefit - HelpDesk Tickets High Benefit is reviewed by the HelpDesk Dashboard
  helpDeskTicketsHighBenefit: boolean("help_desk_tickets_high_benefit").default(
    false,
  ),
  // HelpDesk Tickets High Return - HelpDesk Tickets High Return is whether the HelpDesk Tickets are high return or low return - HelpDesk Tickets High Return is reviewed by the HelpDesk Dashboard
  helpDeskTicketsHighReturn: boolean("help_desk_tickets_high_return").default(
    false,
  ),
  // HelpDesk Tickets High ROI - HelpDesk Tickets High ROI is whether the HelpDesk Tickets are high ROI or low ROI - HelpDesk Tickets High ROI is reviewed by the HelpDesk Dashboard
  helpDeskTicketsHighROI: boolean("help_desk_tickets_high_roi").default(false),
  // HelpDesk Tickets High Leverage - HelpDesk Tickets High Leverage is whether the HelpDesk Tickets are high leverage or low leverage - HelpDesk Tickets High Leverage is reviewed by the HelpDesk Dashboard
  helpDeskTicketsHighLeverage: boolean(
    "help_desk_tickets_high_leverage",
  ).default(false),
  // HelpDesk Tickets Private - HelpDesk Tickets Private is whether the HelpDesk Tickets are private or public - HelpDesk Tickets Private is reviewed by the HelpDesk Dashboard
  helpDeskTicketsPrivate: boolean("help_desk_tickets_private").default(false),
  // HelpDesk Tickets Non-Urgent - HelpDesk Tickets Non-Urgent is whether the HelpDesk Tickets are non-urgent or urgent - HelpDesk Tickets Non-Urgent is reviewed by the HelpDesk Dashboard
  helpDeskTicketsNonUrgent: boolean("help_desk_tickets_non_urgent").default(
    false,
  ),
  // HelpDesk Tickets Low Priority - HelpDesk Tickets Low Priority is whether the HelpDesk Tickets are low priority or high priority - HelpDesk Tickets Low Priority is reviewed by the HelpDesk Dashboard
  helpDeskTicketsLowPriority: boolean("help_desk_tickets_low_priority").default(
    false,
  ),
  // HelpDesk Tickets Low Severity - HelpDesk Tickets Low Severity is whether the HelpDesk Tickets are low severity or high severity - HelpDesk Tickets Low Severity is reviewed by the HelpDesk Dashboard
  helpDeskTicketsLowSeverity: boolean("help_desk_tickets_low_severity").default(
    false,
  ),
  // HelpDesk Tickets Low Impact - HelpDesk Tickets Low Impact is whether the HelpDesk Tickets are low impact or high impact - HelpDesk Tickets Low Impact is reviewed by the HelpDesk Dashboard
  helpDeskTicketsLowImpact: boolean("help_desk_tickets_low_impact").default(
    false,
  ),
  // HelpDesk Tickets Low Risk - HelpDesk Tickets Low Risk is whether the HelpDesk Tickets are low risk or high risk - HelpDesk Tickets Low Risk is reviewed by the HelpDesk Dashboard
  helpDeskTicketsLowRisk: boolean("help_desk_tickets_low_risk").default(false),
  // HelpDesk Tickets Low Reward - HelpDesk Tickets Low Reward is whether the HelpDesk Tickets are low reward or high reward - HelpDesk Tickets Low Reward is reviewed by the HelpDesk Dashboard
  helpDeskTicketsLowReward: boolean("help_desk_tickets_low_reward").default(
    false,
  ),
  // HelpDesk Tickets Low Value - HelpDesk Tickets Low Value is whether the HelpDesk Tickets are low value or high value - HelpDesk Tickets Low Value is reviewed by the HelpDesk Dashboard
  helpDeskTicketsLowValue: boolean("help_desk_tickets_low_value").default(
    false,
  ),
  // HelpDesk Tickets Low Cost - HelpDesk Tickets Low Cost is whether the HelpDesk Tickets are low cost or high cost - HelpDesk Tickets Low Cost is reviewed by the HelpDesk Dashboard
  helpDeskTicketsLowCost: boolean("help_desk_tickets_low_cost").default(false),
  // HelpDesk Tickets Low Benefit - HelpDesk Tickets Low Benefit is whether the HelpDesk Tickets are low benefit or high benefit - HelpDesk Tickets Low Benefit is reviewed by the HelpDesk Dashboard
  helpDeskTicketsLowBenefit: boolean("help_desk_tickets_low_benefit").default(
    false,
  ),
  // HelpDesk Tickets Low Return - HelpDesk Tickets Low Return is whether the HelpDesk Tickets are low return or high return - HelpDesk Tickets Low Return is reviewed by the HelpDesk Dashboard
  helpDeskTicketsLowReturn: boolean("help_desk_tickets_low_return").default(
    false,
  ),
  // HelpDesk Tickets Low ROI - HelpDesk Tickets Low ROI is whether the HelpDesk Tickets are low ROI or high ROI - HelpDesk Tickets Low ROI is reviewed by the HelpDesk Dashboard
  helpDeskTicketsLowROI: boolean("help_desk_tickets_low_roi").default(false),
  // HelpDesk Tickets Low Leverage - HelpDesk Tickets Low Leverage is whether the HelpDesk Tickets are low leverage or high leverage - HelpDesk Tickets Low Leverage is reviewed by the HelpDesk Dashboard
  helpDeskTicketsLowLeverage: boolean("help_desk_tickets_low_leverage").default(
    false,
  ),
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
  memberCount: integer("member_count").default(1), // Start at 1 to count the owner
  maxMembers: integer("max_members").default(50),
  discordInvite: varchar("discord_invite"),
  primaryGame: varchar("primary_game"),
  requirements: text("requirements"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// LFG Posts table
export const lfgPosts = pgTable("lfg_posts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  game: varchar("game").notNull(),
  platform: varchar("platform").notNull(),
  region: varchar("region"),
  skillLevel: skillLevelEnum("skill_level").default("intermediate"),
  roleNeeded: gameRoleEnum("role_needed").default("any"),
  playersNeeded: integer("players_needed").default(1),
  playersJoined: integer("players_joined").default(0), // Does not include the author
  scheduledAt: timestamp("scheduled_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// LFG Participants
export const lfgParticipants = pgTable("lfg_participants", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  lfgPostId: varchar("lfg_post_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: gameRoleEnum("role").default("any"),
  joinedAt: timestamp("joined_at").defaultNow(),
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
  viewCount: integer("view_count").default(1), // Start at 1 to count the initial view
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
  viewCount: integer("view_count").default(1), // Start at 1 to count the initial view
  replyCount: integer("reply_count").default(1), // Start at 1 to count the initial post
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
  parentReplyId: varchar("parent_reply_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Magic Link Tokens for email auth
export const magicLinkTokens = pgTable("magic_link_tokens", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Friends System
export const friendships = pgTable("friendships", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId1: varchar("user_id_1").notNull(),
  userId2: varchar("user_id_2").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, accepted, blocked
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(), // friend_request, achievement, message, etc
  relatedUserId: varchar("related_user_id"),
  message: text("message"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Achievements
export const achievements = pgTable("achievements", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  icon: varchar("icon"),
  criteria: varchar("criteria").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Achievements
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
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
  totalPoints: integer("total_points").default(0), // Reputation points go up by +1 for each post, reply, or upvote on a post or reply - Reputation points go down by -1 for each downvote a user registers on the users post or reply - Reputation points go down by -5 for each report filed against the user - Reputation points go down by -10 for each ban issued against the user
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Marketplace Items
export const marketplaceItems = pgTable("marketplace_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
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
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull(),
  totalViews: integer("total_views").default(0),
  totalEarnings: integer("total_earnings").default(0),
  totalSales: integer("total_sales").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Referral Program
export const referrals = pgTable("referrals", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull(),
  referredId: varchar("referred_id").notNull().unique(),
  rewardEarned: integer("reward_earned").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community Challenges
export const challenges = pgTable("challenges", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
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
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").notNull(),
  userId: varchar("user_id").notNull(),
  progress: integer("progress").default(0),
  completed: boolean("completed").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Reports
export const reports = pgTable("reports", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull(),
  targetUserId: varchar("target_user_id"),
  contentType: varchar("content_type"), // user, post, comment, etc
  contentId: varchar("content_id"),
  reason: text("reason").notNull(),
  status: varchar("status").notNull().default("open"), // open, investigating, resolved
  createdAt: timestamp("created_at").defaultNow(),
});

// Blocks
export const blocks = pgTable("blocks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  blockedUserId: varchar("blocked_user_id").notNull(),
  blockedAt: timestamp("blocked_at").defaultNow(),
});

// Knowledge Base Articles
export const knowledgeBase = pgTable("knowledge_base", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category").notNull(),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Meta Database (Game Builds/Guides)
export const metaDatabase = pgTable("meta_database", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
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
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  text: text("text").notNull(),
  rating: integer("rating").notNull(), // 1-5
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Announcements
export const announcements = pgTable("announcements", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  type: varchar("type").notNull().default("update"), // launch, roadmap, feature, update, announcement, maintenance, event, news, alert, warning, error, information
  details: text("details"), // JSON array stored as text
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Site Settings
export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default("main"),
  isOffline: boolean("is_offline").default(false),
  offlineMessage: text("offline_message").default(
    "We're currently performing maintenance. We'll be back online shortly!",
  ),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects
export const projects = pgTable("projects", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  gameType: varchar("game_type").notNull(), // ROBLOX, FiveM, etc
  location: varchar("location"),
  imageUrl: varchar("image_url"),
  status: varchar("status").default("active"), // active, discontinued, development
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Manual Payments (VIP Subscriptions)
export const payments = pgTable("payments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  vipTier: varchar("vip_tier").notNull(), // bronze, sapphire, diamond, founders
  amount: integer("amount").notNull(), // in cents
  status: varchar("status").default("processing"), // processing, success, failed, refunded
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  cardLast4: varchar("card_last_4"),
  cardBrand: varchar("card_brand"), // visa, mastercard, amex, discover
  billingName: varchar("billing_name"),
  billingEmail: varchar("billing_email"),
  billingAddress: text("billing_address"),
  billingCity: varchar("billing_city"),
  billingState: varchar("billing_state"),
  billingZip: varchar("billing_zip"),
  billingCountry: varchar("billing_country"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const forumThreadsRelations = relations(
  forumThreads,
  ({ one, many }) => ({
    category: one(forumCategories, {
      fields: [forumThreads.categoryId],
      references: [forumCategories.id],
    }),
    author: one(users, {
      fields: [forumThreads.authorId],
      references: [users.id],
    }),
    replies: many(forumReplies),
  }),
);

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertClanSchema = createInsertSchema(clans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  memberCount: true,
});
export const insertLfgPostSchema = createInsertSchema(lfgPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  playersJoined: true,
  isActive: true,
});
export const insertBuildSchema = createInsertSchema(builds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  upvotes: true,
  downvotes: true,
  viewCount: true,
  isFeatured: true,
});
export const insertForumCategorySchema = createInsertSchema(
  forumCategories,
).omit({
  id: true,
  createdAt: true,
  threadCount: true,
});
export const insertForumThreadSchema = createInsertSchema(forumThreads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  replyCount: true,
  upvotes: true,
  lastReplyAt: true,
});
export const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  upvotes: true,
});
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertFriendshipSchema = createInsertSchema(friendships).omit({
  id: true,
  createdAt: true,
});
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  isRead: true,
});
export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});
export const insertUserAchievementSchema = createInsertSchema(
  userAchievements,
).omit({
  id: true,
  unlockedAt: true,
});
export const insertDailyRewardSchema = createInsertSchema(dailyRewards).omit({
  updatedAt: true,
});
export const insertReputationPointSchema = createInsertSchema(
  reputationPoints,
).omit({
  updatedAt: true,
});
export const insertMarketplaceItemSchema = createInsertSchema(
  marketplaceItems,
).omit({
  id: true,
  createdAt: true,
  salesCount: true,
});
export const insertCreatorAnalyticsSchema = createInsertSchema(
  creatorAnalytics,
).omit({
  id: true,
  updatedAt: true,
});
export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});
export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
  participantCount: true,
});
export const insertChallengeParticipantSchema = createInsertSchema(
  challengeParticipants,
).omit({
  id: true,
  joinedAt: true,
});
export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});
export const insertBlockSchema = createInsertSchema(blocks).omit({
  id: true,
  blockedAt: true,
});
export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).omit(
  {
    id: true,
    createdAt: true,
    viewCount: true,
  },
);
export const insertMetaDatabaseSchema = createInsertSchema(metaDatabase).omit({
  id: true,
  createdAt: true,
  viewCount: true,
});
export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
export type InsertCreatorAnalytics = z.infer<
  typeof insertCreatorAnalyticsSchema
>;

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;
export type InsertChallengeParticipant = z.infer<
  typeof insertChallengeParticipantSchema
>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type Block = typeof blocks.$inferSelect;
export type InsertBlock = z.infer<typeof insertBlockSchema>;

export type KnowledgeBaseArticle = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBaseArticle = z.infer<
  typeof insertKnowledgeBaseSchema
>;

export type MetaGuide = typeof metaDatabase.$inferSelect;
export type InsertMetaGuide = z.infer<typeof insertMetaDatabaseSchema>;

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

// VIP tier configuration
export const VIP_TIERS = {
  none: { name: "Free", price: 0, features: [] },
  bronze: {
    name: "Bronze VIP",
    price: 1099,
    features: [
      "Exclusive Discord Role & Privileges",
      "Priority HelpDesk Support",
      "Priority Moderation Appeals",
      "XP Boost (20%)",
      "Paychecks Boost (20%)",
      "Save 20% on Vehicle Insurance",
      "ATM Fees Waived",
    ],
  },
  sapphire: {
    name: "Sapphire VIP",
    price: 1599,
    features: [
      "Exclusive Discord Role & Privileges",
      "High Priority HelpDesk Support",
      "High Priority Moderation Appeals",
      "XP Boost (35%)",
      "Paychecks Boost (30%)",
      "Save 25% on Vehicle Insurance",
      "Exclusive Vehicles",
      "ATM Fees Waived",
    ],
  },
  diamond: {
    name: "Diamond VIP",
    price: 1999,
    features: [
      "Exclusive Discord Role & Privileges",
      "High Priority HelpDesk Support",
      "High Priority Moderation Appeals",
      "Audi RS3 Given Monthly",
      "XP Boost (45%)",
      "Medical Bills 50% Off",
      "No Wallet Limit",
      "Save 35% on Vehicles",
      "Perma-Knife on Civilian Team",
      "ATM Fees Waived",
    ],
  },
  founders: {
    name: "Founders Edition",
    price: 3500,
    features: [
      "Exclusive Founders Discord Role",
      "Urgent Priority HelpDesk Support",
      "Instant FBI Access & Arrest Authority",
      "All Team-Queue & Team Count Bypass",
      "Hellcat Given Monthly",
      "XP Boost (55%)",
      "Medical Bills 55% Off",
      "No Wallet Limit",
      "Save 50% on Vehicles",
      "Perma-Glock on Civilian Team",
      "ATM Fees Waived",
    ],
  },
} as const;
