// PostgreSQL database integration
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
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
    
    // Create users table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar UNIQUE,
        first_name varchar,
        last_name varchar,
        profile_image_url varchar,
        username varchar UNIQUE,
        bio text,
        vip_tier varchar DEFAULT 'none',
        stripe_customer_id varchar,
        stripe_subscription_id varchar,
        discord_id varchar UNIQUE,
        discord_username varchar,
        discord_avatar varchar,
        discord_linked_at timestamp,
        roblox_id varchar UNIQUE,
        roblox_username varchar,
        roblox_display_name varchar,
        roblox_linked_at timestamp,
        games_played integer DEFAULT 0,
        total_posts integer DEFAULT 0,
        reputation integer DEFAULT 0,
        clan_id varchar,
        clan_role varchar,
        user_rank varchar DEFAULT 'member',
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      );
    `);

    // Create sessions table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid varchar PRIMARY KEY,
        sess jsonb NOT NULL,
        expire timestamp NOT NULL
      );
    `);

    // Create magic_link_tokens table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS magic_link_tokens (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar NOT NULL,
        token varchar UNIQUE NOT NULL,
        expires_at timestamp NOT NULL,
        used_at timestamp,
        created_at timestamp DEFAULT now()
      );
    `);

    console.log("✅ Database schema initialized successfully");
  } catch (error) {
    console.error("⚠️ Database initialization error (may be expected):", error);
  }
}
