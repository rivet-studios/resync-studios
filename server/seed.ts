import { db } from "./db";
import { forumCategories } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");
  
  // Check if categories already exist
  const existing = await db.select().from(forumCategories);
  if (existing.length > 0) {
    console.log("Categories already exist, skipping seed.");
    return;
  }
  
  // Seed forum categories
  await db.insert(forumCategories).values([
    { name: "General Discussion", description: "General gaming chat and community discussions", icon: "MessageSquare", color: "primary", order: 1 },
    { name: "Game Guides", description: "Share and discuss game guides and tutorials", icon: "BookOpen", color: "chart-1", order: 2 },
    { name: "Bug Reports", description: "Report bugs and issues", icon: "Bug", color: "destructive", order: 3 },
    { name: "Feedback & Suggestions", description: "Share your ideas and feedback", icon: "Lightbulb", color: "chart-5", order: 4 },
    { name: "Off-Topic", description: "Non-gaming discussions", icon: "Coffee", color: "muted", order: 5 },
    { name: "VIP Lounge", description: "Exclusive discussions for VIP members", icon: "Crown", color: "chart-2", order: 6 },
  ]);
  
  console.log("Database seeded successfully!");
}

seed().catch(console.error).finally(() => process.exit(0));
