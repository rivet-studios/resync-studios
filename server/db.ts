// PostgreSQL database integration
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Initialize database schema if needed
export async function initializeDatabase() {
  try {
    console.log("🗄️ Initializing database schema...");

    // Create all tables from schema using raw SQL
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "sessions" (
        "sid" varchar PRIMARY KEY,
        "sess" jsonb NOT NULL,
        "expire" timestamp NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions"("expire");
    `);

    // Create enum types
    await db.execute(`
      DO $$ BEGIN
        CREATE TYPE vip_tier AS ENUM ('none', 'bronze', 'sapphire', 'diamond', 'founders', 'founders_edition_lifetime');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(`
      DO $$ BEGIN
        CREATE TYPE user_rank AS ENUM (
  "company_director",
  "operations_manager",
  "leadership_council",
  "staff_department_director",
  "team_member",
  "staff_internal_affairs",
  "community_developer",
  "community_senior_administrator",
  "community_administrator",
  "community_senior_moderator",
  "community_moderator",
  "customer_relations",
  "appeals_moderator",
  "rs_volunteer_staff",
  "rs_trust_&_safety_team",
  "founders_edition_lifetime",
  "founders_edition_vip",
  "diamond_vip",
  "sapphire_vip",
  "bronze_vip",
  "community_partner",
  "trusted_member",
  "active_member",
  "member",
  "banned",
        );
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(`
      DO $$ BEGIN
        CREATE TYPE secondary_user_rank AS ENUM (
    "company_director",
    "operations_manager",
    "leadership_council",
    "staff_department_director",
    "team_member",
    "staff_internal_affairs",
    "community_developer",
    "community_senior_administrator",
    "community_administrator",
    "community_senior_moderator",
    "community_moderator",
    "customer_relations",
    "appeals_moderator",
    "rs_volunteer_staff",
    "rs_trust_&_safety_team",
    "founders_edition_lifetime",
    "founders_edition_vip",
    "diamond_vip",
    "sapphire_vip",
    "bronze_vip",
    "community_partner",
    "trusted_member",
    "active_member",
    "member",
    "banned",
        );
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(`
      DO $$ BEGIN
        CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert', 'pro');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(`
      DO $$ BEGIN
        CREATE TYPE game_role AS ENUM ('tank', 'dps', 'support', 'healer', 'flex', 'any');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    // Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar UNIQUE,
        "password" varchar,
        "first_name" varchar,
        "last_name" varchar,
        "profile_image_url" varchar,
        "username" varchar UNIQUE,
        "bio" text,
        "vip_tier" vip_tier DEFAULT 'none',
        "stripe_customer_id" varchar,
        "stripe_subscription_id" varchar,
        "discord_id" varchar UNIQUE,
        "discord_username" varchar,
        "discord_avatar" varchar,
        "discord_linked_at" timestamp,
        "roblox_id" varchar UNIQUE,
        "roblox_username" varchar,
        "roblox_display_name" varchar,
        "roblox_linked_at" timestamp,
        "games_played" integer DEFAULT 0,
        "total_posts" integer DEFAULT 0,
        "reputation" integer DEFAULT 0,
        "clan_id" varchar,
        "clan_role" varchar,
        "user_rank" user_rank DEFAULT 'member',
        "secondary_user_rank" secondary_user_rank DEFAULT 'active_member',
        "is_banned" boolean DEFAULT false,
        "ban_reason" text,
        "banned_at" timestamp,
        "banned_by" varchar,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);

    // Magic link tokens table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "magic_link_tokens" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar NOT NULL,
        "token" varchar UNIQUE NOT NULL,
        "expires_at" timestamp NOT NULL,
        "used_at" timestamp,
        "created_at" timestamp DEFAULT now()
      );
    `);

    // Clans table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "clans" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL UNIQUE,
        "tag" varchar NOT NULL UNIQUE,
        "description" text,
        "logo_url" varchar,
        "banner_url" varchar,
        "owner_id" varchar NOT NULL,
        "is_recruiting" boolean DEFAULT true,
        "member_count" integer DEFAULT 1,
        "max_members" integer DEFAULT 50,
        "discord_invite" varchar,
        "primary_game" varchar,
        "requirements" text,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);

    // LFG Posts table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "lfg_posts" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "author_id" varchar NOT NULL,
        "title" varchar NOT NULL,
        "description" text,
        "game" varchar NOT NULL,
        "platform" varchar NOT NULL,
        "region" varchar,
        "skill_level" skill_level DEFAULT 'intermediate',
        "role_needed" game_role DEFAULT 'any',
        "players_needed" integer DEFAULT 1,
        "players_joined" integer DEFAULT 0,
        "scheduled_at" timestamp,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);

    // LFG Participants table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "lfg_participants" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "lfg_post_id" varchar NOT NULL,
        "user_id" varchar NOT NULL,
        "role" game_role DEFAULT 'any',
        "joined_at" timestamp DEFAULT now()
      );
    `);

    // Builds table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "builds" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "author_id" varchar NOT NULL,
        "title" varchar NOT NULL,
        "description" text,
        "game" varchar NOT NULL,
        "character" varchar,
        "category" varchar,
        "content" text NOT NULL,
        "image_url" varchar,
        "upvotes" integer DEFAULT 0,
        "downvotes" integer DEFAULT 0,
        "view_count" integer DEFAULT 0,
        "is_featured" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);

    // Build Votes table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "build_votes" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "build_id" varchar NOT NULL,
        "user_id" varchar NOT NULL,
        "is_upvote" boolean NOT NULL,
        "created_at" timestamp DEFAULT now()
      );
    `);

    // Forum Categories table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "forum_categories" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "description" text,
        "icon" varchar,
        "color" varchar,
        "order" integer DEFAULT 0,
        "thread_count" integer DEFAULT 0,
        "created_at" timestamp DEFAULT now()
      );
    `);

    // Forum Threads table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "forum_threads" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "category_id" varchar NOT NULL,
        "author_id" varchar NOT NULL,
        "title" varchar NOT NULL,
        "content" text NOT NULL,
        "is_pinned" boolean DEFAULT false,
        "is_locked" boolean DEFAULT false,
        "view_count" integer DEFAULT 1,
        "reply_count" integer DEFAULT 1,
        "upvotes" integer DEFAULT 0,
        "last_reply_at" timestamp,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);

    // Forum Replies table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "forum_replies" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "thread_id" varchar NOT NULL,
        "author_id" varchar NOT NULL,
        "content" text NOT NULL,
        "upvotes" integer DEFAULT 0,
        "parent_reply_id" varchar,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);

    // Chat Messages table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "chat_messages" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "sender_id" varchar NOT NULL,
        "recipient_id" varchar,
        "clan_id" varchar,
        "content" text NOT NULL,
        "is_read" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now()
      CREATE TABLE IF NOT EXISTS "announcements" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "title" varchar NOT NULL,
        "content" text NOT NULL,
        "type" varchar DEFAULT 'update' NOT NULL,
        "details" text,
        "is_published" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);

    console.log("✅ Database schema initialized successfully");
  } catch (error) {
    console.error("⚠️ Database initialization error:", error);
    // Don't throw - let the app continue even if schema init has issues
  }
}
