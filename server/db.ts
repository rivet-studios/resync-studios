// PostgreSQL database integration
import { sql } from "drizzle-orm";
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
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "sessions" (
        "sid" varchar PRIMARY KEY,
        "sess" jsonb NOT NULL,
        "expire" timestamp NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions"("expire");
    `);

    // Create enum types
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE vip_tier AS ENUM ('none', 'Bronze VIP', 'Diamond VIP', 'Founders Edition VIP', 'Lifetime');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE user_rank AS ENUM (
          'Banned',
          'Members',
          'Active Member',
          'Trusted Member',
          'Community Partner',
          'Vehicle Tester',
          'Bronze VIP',
          'Diamond VIP',
          'Founders Edition VIP',
          'Lifetime',
          'Retired Team Member',
          'Customer Relations',
          'Appeals Moderator',
          'Community Moderator',
          'Community Administrator',
          'Community Senior Administrator',
          'Gameplay Engineer',
          'Community Developer',
          'Team Member',
          'Staff Department Director',
          'Operations Manager',
          'Company Director'
        );
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    // Users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar UNIQUE,
        "password" varchar,
        "first_name" varchar,
        "last_name" varchar,
        "profile_image_url" varchar,
        "username" varchar UNIQUE,
        "bio" text,
        "signature" text,
        "vip_tier" subscription_tier DEFAULT 'none',
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
        "user_rank" user_rank DEFAULT 'Members',
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);

    // Magic link tokens table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "magic_link_tokens" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar NOT NULL,
        "token" varchar UNIQUE NOT NULL,
        "expires_at" timestamp NOT NULL,
        "used_at" timestamp,
        "created_at" timestamp DEFAULT now()
      );
    `);

    // Forum Categories table
    await db.execute(sql`
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
    await db.execute(sql`
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
    await db.execute(sql`
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

    // Announcements table
    await db.execute(sql`
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
