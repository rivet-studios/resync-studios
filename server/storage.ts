import { 
  type User, type InsertUser, type UpsertUser,
  type Clan, type InsertClan,
  type LfgPost, type InsertLfgPost,
  type LfgParticipant,
  type Build, type InsertBuild,
  type BuildVote,
  type ForumCategory, type InsertForumCategory,
  type ForumThread, type InsertForumThread,
  type ForumReply, type InsertForumReply,
  type ChatMessage, type InsertChatMessage,
  users, clans, lfgPosts, lfgParticipants, builds, buildVotes,
  forumCategories, forumThreads, forumReplies, chatMessages
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, or, ilike } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  getUserByRobloxId(robloxId: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Clans
  getClans(): Promise<Clan[]>;
  getClan(id: string): Promise<Clan | undefined>;
  createClan(clan: InsertClan): Promise<Clan>;
  updateClan(id: string, updates: Partial<Clan>): Promise<Clan | undefined>;
  deleteClan(id: string): Promise<void>;
  
  // LFG Posts
  getLfgPosts(): Promise<LfgPost[]>;
  getLfgPost(id: string): Promise<LfgPost | undefined>;
  createLfgPost(post: InsertLfgPost): Promise<LfgPost>;
  updateLfgPost(id: string, updates: Partial<LfgPost>): Promise<LfgPost | undefined>;
  deleteLfgPost(id: string): Promise<void>;
  joinLfgPost(postId: string, userId: string, role?: string): Promise<LfgParticipant>;
  leaveLfgPost(postId: string, userId: string): Promise<void>;
  
  // Builds
  getBuilds(): Promise<Build[]>;
  getBuild(id: string): Promise<Build | undefined>;
  createBuild(build: InsertBuild): Promise<Build>;
  updateBuild(id: string, updates: Partial<Build>): Promise<Build | undefined>;
  deleteBuild(id: string): Promise<void>;
  voteBuild(buildId: string, userId: string, isUpvote: boolean): Promise<void>;
  getBuildVote(buildId: string, userId: string): Promise<BuildVote | undefined>;
  
  // Forum Categories
  getForumCategories(): Promise<ForumCategory[]>;
  getForumCategory(id: string): Promise<ForumCategory | undefined>;
  createForumCategory(category: InsertForumCategory): Promise<ForumCategory>;
  
  // Forum Threads
  getForumThreads(categoryId?: string): Promise<ForumThread[]>;
  getForumThread(id: string): Promise<ForumThread | undefined>;
  createForumThread(thread: InsertForumThread): Promise<ForumThread>;
  updateForumThread(id: string, updates: Partial<ForumThread>): Promise<ForumThread | undefined>;
  
  // Forum Replies
  getForumReplies(threadId: string): Promise<ForumReply[]>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  
  // Chat Messages
  getChatMessages(recipientId?: string, clanId?: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Stats
  getStats(): Promise<{ totalMembers: number; activeLfg: number; totalClans: number; totalBuilds: number }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.discordId, discordId));
    return user;
  }

  async getUserByRobloxId(robloxId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.robloxId, robloxId));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Clans
  async getClans(): Promise<Clan[]> {
    return db.select().from(clans).orderBy(desc(clans.memberCount));
  }

  async getClan(id: string): Promise<Clan | undefined> {
    const [clan] = await db.select().from(clans).where(eq(clans.id, id));
    return clan;
  }

  async createClan(clanData: InsertClan): Promise<Clan> {
    const [clan] = await db.insert(clans).values(clanData).returning();
    return clan;
  }

  async updateClan(id: string, updates: Partial<Clan>): Promise<Clan | undefined> {
    const [clan] = await db.update(clans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(clans.id, id))
      .returning();
    return clan;
  }

  async deleteClan(id: string): Promise<void> {
    await db.delete(clans).where(eq(clans.id, id));
  }

  // LFG Posts
  async getLfgPosts(): Promise<LfgPost[]> {
    return db.select().from(lfgPosts)
      .where(eq(lfgPosts.isActive, true))
      .orderBy(desc(lfgPosts.createdAt));
  }

  async getLfgPost(id: string): Promise<LfgPost | undefined> {
    const [post] = await db.select().from(lfgPosts).where(eq(lfgPosts.id, id));
    return post;
  }

  async createLfgPost(postData: InsertLfgPost): Promise<LfgPost> {
    const [post] = await db.insert(lfgPosts).values(postData).returning();
    return post;
  }

  async updateLfgPost(id: string, updates: Partial<LfgPost>): Promise<LfgPost | undefined> {
    const [post] = await db.update(lfgPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(lfgPosts.id, id))
      .returning();
    return post;
  }

  async deleteLfgPost(id: string): Promise<void> {
    await db.delete(lfgPosts).where(eq(lfgPosts.id, id));
  }

  async joinLfgPost(postId: string, usId: string, role?: string): Promise<LfgParticipant> {
    const [participant] = await db.insert(lfgParticipants)
      .values({ lfgPostId: postId, userId: usId, role: role as any || 'any' })
      .returning();
    
    await db.update(lfgPosts)
      .set({ playersJoined: sql`${lfgPosts.playersJoined} + 1` })
      .where(eq(lfgPosts.id, postId));
    
    return participant;
  }

  async leaveLfgPost(postId: string, userId: string): Promise<void> {
    await db.delete(lfgParticipants)
      .where(and(eq(lfgParticipants.lfgPostId, postId), eq(lfgParticipants.userId, userId)));
    
    await db.update(lfgPosts)
      .set({ playersJoined: sql`GREATEST(${lfgPosts.playersJoined} - 1, 0)` })
      .where(eq(lfgPosts.id, postId));
  }

  // Builds
  async getBuilds(): Promise<Build[]> {
    return db.select().from(builds).orderBy(desc(builds.upvotes), desc(builds.createdAt));
  }

  async getBuild(id: string): Promise<Build | undefined> {
    const [build] = await db.select().from(builds).where(eq(builds.id, id));
    return build;
  }

  async createBuild(buildData: InsertBuild): Promise<Build> {
    const [build] = await db.insert(builds).values(buildData).returning();
    return build;
  }

  async updateBuild(id: string, updates: Partial<Build>): Promise<Build | undefined> {
    const [build] = await db.update(builds)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(builds.id, id))
      .returning();
    return build;
  }

  async deleteBuild(id: string): Promise<void> {
    await db.delete(builds).where(eq(builds.id, id));
  }

  async voteBuild(buildId: string, userId: string, isUpvote: boolean): Promise<void> {
    const existingVote = await this.getBuildVote(buildId, userId);
    
    if (existingVote) {
      if (existingVote.isUpvote === isUpvote) {
        await db.delete(buildVotes)
          .where(and(eq(buildVotes.buildId, buildId), eq(buildVotes.userId, userId)));
        if (isUpvote) {
          await db.update(builds).set({ upvotes: sql`${builds.upvotes} - 1` }).where(eq(builds.id, buildId));
        } else {
          await db.update(builds).set({ downvotes: sql`${builds.downvotes} - 1` }).where(eq(builds.id, buildId));
        }
      } else {
        await db.update(buildVotes)
          .set({ isUpvote })
          .where(and(eq(buildVotes.buildId, buildId), eq(buildVotes.userId, userId)));
        if (isUpvote) {
          await db.update(builds).set({ 
            upvotes: sql`${builds.upvotes} + 1`, 
            downvotes: sql`${builds.downvotes} - 1` 
          }).where(eq(builds.id, buildId));
        } else {
          await db.update(builds).set({ 
            upvotes: sql`${builds.upvotes} - 1`, 
            downvotes: sql`${builds.downvotes} + 1` 
          }).where(eq(builds.id, buildId));
        }
      }
    } else {
      await db.insert(buildVotes).values({ buildId, userId, isUpvote });
      if (isUpvote) {
        await db.update(builds).set({ upvotes: sql`${builds.upvotes} + 1` }).where(eq(builds.id, buildId));
      } else {
        await db.update(builds).set({ downvotes: sql`${builds.downvotes} + 1` }).where(eq(builds.id, buildId));
      }
    }
  }

  async getBuildVote(buildId: string, userId: string): Promise<BuildVote | undefined> {
    const [vote] = await db.select().from(buildVotes)
      .where(and(eq(buildVotes.buildId, buildId), eq(buildVotes.userId, userId)));
    return vote;
  }

  // Forum Categories
  async getForumCategories(): Promise<ForumCategory[]> {
    return db.select().from(forumCategories).orderBy(forumCategories.order);
  }

  async getForumCategory(id: string): Promise<ForumCategory | undefined> {
    const [category] = await db.select().from(forumCategories).where(eq(forumCategories.id, id));
    return category;
  }

  async createForumCategory(categoryData: InsertForumCategory): Promise<ForumCategory> {
    const [category] = await db.insert(forumCategories).values(categoryData).returning();
    return category;
  }

  // Forum Threads
  async getForumThreads(categoryId?: string): Promise<ForumThread[]> {
    if (categoryId) {
      return db.select().from(forumThreads)
        .where(eq(forumThreads.categoryId, categoryId))
        .orderBy(desc(forumThreads.isPinned), desc(forumThreads.createdAt));
    }
    return db.select().from(forumThreads)
      .orderBy(desc(forumThreads.isPinned), desc(forumThreads.createdAt));
  }

  async getForumThread(id: string): Promise<ForumThread | undefined> {
    const [thread] = await db.select().from(forumThreads).where(eq(forumThreads.id, id));
    return thread;
  }

  async createForumThread(threadData: InsertForumThread): Promise<ForumThread> {
    const [thread] = await db.insert(forumThreads).values(threadData).returning();
    
    await db.update(forumCategories)
      .set({ threadCount: sql`${forumCategories.threadCount} + 1` })
      .where(eq(forumCategories.id, threadData.categoryId));
    
    return thread;
  }

  async updateForumThread(id: string, updates: Partial<ForumThread>): Promise<ForumThread | undefined> {
    const [thread] = await db.update(forumThreads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(forumThreads.id, id))
      .returning();
    return thread;
  }

  // Forum Replies
  async getForumReplies(threadId: string): Promise<ForumReply[]> {
    return db.select().from(forumReplies)
      .where(eq(forumReplies.threadId, threadId))
      .orderBy(forumReplies.createdAt);
  }

  async createForumReply(replyData: InsertForumReply): Promise<ForumReply> {
    const [reply] = await db.insert(forumReplies).values(replyData).returning();
    
    await db.update(forumThreads)
      .set({ 
        replyCount: sql`${forumThreads.replyCount} + 1`,
        lastReplyAt: new Date()
      })
      .where(eq(forumThreads.id, replyData.threadId));
    
    return reply;
  }

  // Chat Messages
  async getChatMessages(recipientId?: string, clanId?: string): Promise<ChatMessage[]> {
    if (clanId) {
      return db.select().from(chatMessages)
        .where(eq(chatMessages.clanId, clanId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(100);
    }
    if (recipientId) {
      return db.select().from(chatMessages)
        .where(eq(chatMessages.recipientId, recipientId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(100);
    }
    return [];
  }

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(messageData).returning();
    return message;
  }

  // Stats
  async getStats(): Promise<{ totalMembers: number; activeLfg: number; totalClans: number; totalBuilds: number }> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [lfgCount] = await db.select({ count: sql<number>`count(*)` }).from(lfgPosts).where(eq(lfgPosts.isActive, true));
    const [clanCount] = await db.select({ count: sql<number>`count(*)` }).from(clans);
    const [buildCount] = await db.select({ count: sql<number>`count(*)` }).from(builds);
    
    return {
      totalMembers: Number(userCount.count),
      activeLfg: Number(lfgCount.count),
      totalClans: Number(clanCount.count),
      totalBuilds: Number(buildCount.count),
    };
  }
}

export const storage = new DatabaseStorage();
