import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Sparkles, Rocket, ShoppingBag, Zap } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  date: string;
  type: "launch" | "roadmap" | "feature";
  icon: any;
  content: string;
  details?: string[];
}

const announcements: Announcement[] = [
  {
    id: "launch",
    title: "Website Launch - After 5+ Months of Development",
    date: "November 2025",
    type: "launch",
    icon: Rocket,
    content: "Our new website is finally live! This project has taken a huge amount of time and effort, and seeing it come together has been extremely rewarding.",
    details: [
      "New subscription system with cleaner, easier-to-use interface",
      "Multiple new integrations for a smoother platform experience",
      "More stable and organized backend infrastructure",
      "Ready to support all new features we plan to introduce",
    ],
  },
  {
    id: "community-groups",
    title: "Community Groups - Coming Soon",
    date: "In Development",
    type: "roadmap",
    icon: Zap,
    content: "Direct integration with Project Ventura allowing players to manage in-game tools and features from the website.",
    details: [
      "Group management and control",
      "Asset management and permissions",
      "Activity logging",
      "Private servers support (future)",
      "Real control both inside and outside the game",
    ],
  },
  {
    id: "marketplace",
    title: "Community Marketplace - Coming Soon",
    date: "In Development",
    type: "roadmap",
    icon: ShoppingBag,
    content: "A platform where talented creators can upload and sell digital content while earning money directly.",
    details: [
      "Creator-focused content platform",
      "Digital file and asset uploads",
      "Stripe integration for direct payouts",
      "Support for creators to grow and share their work",
      "Monetization opportunities for talented creators",
    ],
  },
  {
    id: "vehicle-orders",
    title: "Custom Vehicle Orders - Coming Soon",
    date: "In Development",
    type: "roadmap",
    icon: Sparkles,
    content: "A highly requested feature allowing players to create personalized and unique vehicles in Project Ventura.",
    details: [
      "Personalized vehicle customization",
      "Style selection and design options",
      "Unique ride creation system",
      "Social sharing capabilities",
      "Make your vehicle truly one-of-a-kind",
    ],
  },
];

export default function Announcements() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mx-auto gap-2">
          <Megaphone className="w-3.5 h-3.5" />
          Latest Updates
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">Announcements</h1>
        <p className="text-lg text-muted-foreground">
          Stay updated with the latest news and roadmap for Resync Studios™
        </p>
      </div>

      <div className="space-y-6">
        {announcements.map((announcement) => {
          const Icon = announcement.icon;
          const isLaunch = announcement.type === "launch";
          const isRoadmap = announcement.type === "roadmap";

          return (
            <Card
              key={announcement.id}
              className={
                isLaunch
                  ? "border-chart-2/50 bg-gradient-to-r from-chart-2/10 to-primary/10"
                  : "hover:border-primary/30 transition-colors"
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-primary" />
                      <CardTitle className="text-xl">{announcement.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Badge
                        variant={isLaunch ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {isLaunch ? "🚀 LIVE" : "🔄 In Development"}
                      </Badge>
                      <CardDescription className="text-sm">
                        {announcement.date}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{announcement.content}</p>

                {announcement.details && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Key Features:</p>
                    <ul className="space-y-2">
                      {announcement.details.map((detail, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="text-primary font-bold">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-chart-3/10 border-primary/20">
        <CardContent className="p-6 text-center">
          <p className="text-lg font-semibold mb-2">Building Together</p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The launch of this site is only the start of what we want to do. Now that the foundation is in place, 
            we can focus on bigger features that will shape the future of our community. Thank you for your support 
            throughout this journey. We are just getting started, and the best parts are still ahead.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
