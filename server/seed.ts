import { db } from "./db";
import { forumCategories } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  await db.insert(forumCategories).values([
        { name: "Getting Started with Forums", description: "New to forums? No worries, we've got you covered! You can find all the starting guides below", icon: "SignPost", color: "primary", group: "Miscellaneous", order: 0 },
    { name: "Announcements", description: "Important announcements from the RIVET Studios team", icon: "Bell", color: "primary", group: "News & Information", order: 1 },
    { name: "Information", description: "Important information", icon: "Info", color: "primary", group: "News & Information", order: 2 },
    { name: "Updates", description: "Game updates and patch notes", icon: "Zap", color: "primary", group: "News & Information", order: 3 },

    { name: "Discussion", description: "General community discussions", icon: "MessageSquare", color: "chart-1", group: "Community", order: 4 },
    { name: "Questions", description: "Need help or have questions? Ask and get help from the community.", icon: "HelpCircle", color: "chart-1", group: "Community", order: 5 },
    { name: "Suggestions", description: "Suggest features and improvements", icon: "Lightbulb", color: "chart-1", group: "Community", order: 6 },
    { name: "Feedback", description: "Share your feedback about the platform", icon: "MessageCircle", color: "chart-1", group: "Community", order: 7 },
    { name: "Donator Reviews", description: "Reviews from VIP supporters", icon: "Star", color: "chart-1", group: "Community", order: 8 },
    { name: "Staff Reviews", description: "Reviews of staff performance", icon: "Users", color: "chart-1", group: "Community", order: 9 },

    { name: "Game Moderation Appeals", description: "Appeal game-related moderation decisions", icon: "Shield", color: "destructive", group: "Moderation", order: 10 },
    { name: "Game Ban Appeals", description: "Appeal game bans", icon: "Ban", color: "destructive", group: "Moderation", order: 11 },
    { name: "Discord Moderation Appeals", description: "Appeal Discord moderation decisions", icon: "Shield", color: "destructive", group: "Moderation", order: 12 },
    { name: "Discord Ban Appeals", description: "Appeal Discord bans", icon: "Ban", color: "destructive", group: "Moderation", order: 13 },
    { name: "Member Reports", description: "Report community members", icon: "Flag", color: "destructive", group: "Moderation", order: 14 },
    { name: "Staff Abuse Reports", description: "Report staff misconduct", icon: "AlertOctagon", color: "destructive", group: "Moderation", order: 15 },
  ]);

  console.log("Database seeded successfully with forum categories!");
}

seed()
  .catch(console.error)
  .finally(() => process.exit(0));
