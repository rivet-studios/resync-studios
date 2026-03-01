import { db } from "./db";
import { forumCategories } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Clear existing categories (temporarily disabled for safety)
  // await db.delete(forumCategories);

  // Seed forum categories matching user's structure
  await db.insert(forumCategories).values([
    // News & Information
    {
      name: "Announcements",
      description: "Important announcements from the RIVET Studios team",
      icon: "Bell",
      color: "primary",
      order: 1,
    },
    {
      name: "Information",
      description: "Important information",
      icon: "Info",
      color: "primary",
      order: 2,
    },
    {
      name: "Updates",
      description: "Game updates and patch notes",
      icon: "Zap",
      color: "primary",
      order: 3,
    },

    // Community
    {
      name: "Discussion",
      description: "General community discussions",
      icon: "MessageSquare",
      color: "chart-1",
      order: 4,
    },
    {
      name: "Questions",
      description: "Ask questions and get help from the community",
      icon: "HelpCircle",
      color: "chart-1",
      order: 5,
    },
    {
      name: "Suggestions",
      description: "Suggest features and improvements",
      icon: "Lightbulb",
      color: "chart-1",
      order: 6,
    },
    {
      name: "Feedback",
      description: "Share your feedback about the platform",
      icon: "MessageCircle",
      color: "chart-1",
      order: 7,
    },
    {
      name: "Donator Reviews",
      description: "Reviews from VIP supporters",
      icon: "Star",
      color: "chart-1",
      order: 8,
    },
    {
      name: "Staff Reviews",
      description: "Reviews of staff performance",
      icon: "Users",
      color: "chart-1",
      order: 9,
    },

    // Moderation
    {
      name: "Game Moderation Appeals",
      description:
        "Appeal game-related moderation decisions such as warnings, kicks, and more (excluding bans)",
      icon: "Shield",
      color: "destructive",
      order: 10,
    },
    {
      name: "Game Ban Appeals",
      description: "Appeal game bans",
      icon: "Ban",
      color: "destructive",
      order: 12,
    },
    {
      name: "Discord Moderation Appeals",
      description:
        "Appeal Discord moderation decisions such as warnings, server kicks, timeouts/mutes, and more (excluding Discord bans)",
      icon: "Shield",
      color: "destructive",
      order: 13,
    },
    {
      name: "Discord Ban Appeals",
      description: "Appeal Discord bans",
      icon: "Ban",
      color: "destructive",
      order: 15,
    },
    {
      name: "Member & Staff Reports",
      description: "Report members and staff",
      icon: "Flag",
      color: "destructive",
      order: 16,
    },
    {
      name: "Member Reports",
      description: "Report community members",
      icon: "Flag",
      color: "destructive",
      order: 17,
    },
    {
      name: "Staff Abuse Reports",
      description: "Report staff misconduct",
      icon: "AlertOctagon",
      color: "destructive",
      order: 18,
    },
  ]);

  console.log("Database seeded successfully with new forum categories!");
}

seed()
  .catch(console.error)
  .finally(() => process.exit(0));
