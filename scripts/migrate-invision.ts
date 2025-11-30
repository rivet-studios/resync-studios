import { db } from "../server/db";
import { users, forumCategories, forumThreads, forumReplies } from "@shared/schema";

/**
 * Invision Community Data Migration Script
 * 
 * This script helps migrate data from your Invision Community site to RESYNC Studios
 * 
 * Prerequisites:
 * 1. Export your Invision Community database (ask your host for a backup)
 * 2. The backup should include: members, forums, topics, posts
 * 
 * Usage:
 * npx tsx scripts/migrate-invision.ts --export | imports data from exported JSON files
 */

interface InvisionUser {
  id: number;
  name: string;
  email: string;
  photo?: string;
  joined?: string;
  posts?: number;
}

interface InvisionForum {
  id: number;
  name: string;
  description?: string;
}

interface InvisionTopic {
  id: number;
  title: string;
  forum_id: number;
  author_id: number;
  author_name: string;
  created?: string;
  post_count?: number;
}

interface InvisionPost {
  id: number;
  topic_id: number;
  author_id: number;
  author_name: string;
  content: string;
  created?: string;
}

async function migrateUsers(invisionUsers: InvisionUser[]) {
  console.log(`📥 Migrating ${invisionUsers.length} users...`);
  
  for (const invUser of invisionUsers) {
    try {
      // Map Invision user to RESYNC user
      const username = invUser.name
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .substring(0, 50);

      await db.insert(users).values({
        email: invUser.email,
        username: username || `user_${invUser.id}`,
        firstName: invUser.name,
        profileImageUrl: invUser.photo,
        userRank: "member",
        vipTier: "none",
      }).onConflictDoNothing();

      console.log(`✅ Migrated user: ${invUser.name}`);
    } catch (error) {
      console.error(`❌ Error migrating user ${invUser.name}:`, error);
    }
  }
}

async function migrateForums(invisionForums: InvisionForum[]) {
  console.log(`📥 Migrating ${invisionForums.length} forum categories...`);
  
  for (let i = 0; i < invisionForums.length; i++) {
    const forum = invisionForums[i];
    try {
      await db.insert(forumCategories).values({
        name: forum.name,
        description: forum.description,
        order: i,
      }).onConflictDoNothing();

      console.log(`✅ Migrated forum: ${forum.name}`);
    } catch (error) {
      console.error(`❌ Error migrating forum ${forum.name}:`, error);
    }
  }
}

async function migrateTopicsAndPosts(
  invisionTopics: InvisionTopic[],
  invisionPosts: InvisionPost[],
  forumMap: Map<number, string>
) {
  console.log(`📥 Migrating ${invisionTopics.length} topics and ${invisionPosts.length} posts...`);

  // Create a map of author names to user IDs for reference
  const userByEmail = new Map<string, string>();
  
  for (const topic of invisionTopics) {
    try {
      // Find the category for this topic
      const categoryId = forumMap.get(topic.forum_id);
      if (!categoryId) {
        console.warn(`⚠️ Category not found for topic ${topic.title}`);
        continue;
      }

      // Create thread
      const [thread] = await db.insert(forumThreads).values({
        categoryId,
        authorId: `author_${topic.author_id}`,
        title: topic.title,
        content: `Migrated from Invision Community`,
      }).returning();

      // Migrate posts for this topic
      const topicPosts = invisionPosts.filter(p => p.topic_id === topic.id);
      for (const post of topicPosts) {
        await db.insert(forumReplies).values({
          threadId: thread.id,
          authorId: `author_${post.author_id}`,
          content: post.content,
        }).onConflictDoNothing();
      }

      console.log(`✅ Migrated topic: ${topic.title} (${topicPosts.length} posts)`);
    } catch (error) {
      console.error(`❌ Error migrating topic ${topic.title}:`, error);
    }
  }
}

async function runMigration() {
  try {
    console.log("🚀 Starting Invision Community to RESYNC Studios migration...\n");

    // Check if migration files exist
    const fs = await import("fs/promises");
    const path = await import("path");

    const migrationsDir = path.resolve("migrations");
    const usersFile = path.resolve(migrationsDir, "invision-users.json");
    const forumsFile = path.resolve(migrationsDir, "invision-forums.json");
    const topicsFile = path.resolve(migrationsDir, "invision-topics.json");
    const postsFile = path.resolve(migrationsDir, "invision-posts.json");

    // Check if files exist
    const filesExist = await Promise.all([
      fs.stat(usersFile).then(() => true).catch(() => false),
      fs.stat(forumsFile).then(() => true).catch(() => false),
      fs.stat(topicsFile).then(() => true).catch(() => false),
      fs.stat(postsFile).then(() => true).catch(() => false),
    ]);

    if (!filesExist.every(f => f)) {
      console.log("📋 Migration files not found. Here's what you need to do:\n");
      console.log("1. Export your Invision Community database");
      console.log("2. Create a 'migrations' folder in your project root");
      console.log("3. Create these JSON files:");
      console.log("   - migrations/invision-users.json");
      console.log("   - migrations/invision-forums.json");
      console.log("   - migrations/invision-topics.json");
      console.log("   - migrations/invision-posts.json\n");
      console.log("📝 File formats:\n");
      
      console.log("invision-users.json:");
      console.log(JSON.stringify([{
        id: 1,
        name: "User Name",
        email: "user@example.com",
        photo: "https://example.com/photo.jpg",
        joined: "2024-01-01",
        posts: 42
      }], null, 2) + "\n");

      console.log("invision-forums.json:");
      console.log(JSON.stringify([{
        id: 1,
        name: "General Discussion",
        description: "General discussion forum"
      }], null, 2) + "\n");

      console.log("invision-topics.json:");
      console.log(JSON.stringify([{
        id: 1,
        title: "First Post",
        forum_id: 1,
        author_id: 1,
        author_name: "User Name",
        created: "2024-01-01",
        post_count: 5
      }], null, 2) + "\n");

      console.log("invision-posts.json:");
      console.log(JSON.stringify([{
        id: 1,
        topic_id: 1,
        author_id: 1,
        author_name: "User Name",
        content: "Post content here",
        created: "2024-01-01"
      }], null, 2) + "\n");

      return;
    }

    // Read migration files
    const [usersData, forumsData, topicsData, postsData] = await Promise.all([
      fs.readFile(usersFile, "utf-8").then(JSON.parse),
      fs.readFile(forumsFile, "utf-8").then(JSON.parse),
      fs.readFile(topicsFile, "utf-8").then(JSON.parse),
      fs.readFile(postsFile, "utf-8").then(JSON.parse),
    ]);

    // Run migrations
    await migrateUsers(usersData);
    
    const forumMap = new Map();
    for (const forum of forumsData) {
      const [created] = await db.insert(forumCategories).values({
        name: forum.name,
        description: forum.description,
        order: forumsData.indexOf(forum),
      }).returning();
      if (created) {
        forumMap.set(forum.id, created.id);
      }
    }

    await migrateTopicsAndPosts(topicsData, postsData, forumMap);

    console.log("\n✨ Migration completed successfully!");
    console.log("📊 Summary:");
    console.log(`   - Users: ${usersData.length}`);
    console.log(`   - Categories: ${forumsData.length}`);
    console.log(`   - Topics: ${topicsData.length}`);
    console.log(`   - Posts: ${postsData.length}`);

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
