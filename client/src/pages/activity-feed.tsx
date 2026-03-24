import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, MessageSquare, UserPlus, ShoppingCart, Shield, Star, FileText, Bell } from "lucide-react";
import type { ActivityFeedItem } from "@shared/schema";

const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
  user_joined: { icon: UserPlus, color: "text-green-500", label: "New Member" },
  thread_created: { icon: MessageSquare, color: "text-blue-500", label: "Forum" },
  product_approved: { icon: ShoppingCart, color: "text-purple-500", label: "Store" },
  moderation_action: { icon: Shield, color: "text-red-500", label: "Moderation" },
  vip_upgrade: { icon: Star, color: "text-yellow-500", label: "VIP" },
  blog_posted: { icon: FileText, color: "text-cyan-500", label: "Blog" },
  announcement: { icon: Bell, color: "text-orange-500", label: "Announcement" },
};

function formatTimeAgo(dateStr: string | Date | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function ActivityFeedPage() {
  const { data: items = [], isLoading } = useQuery<ActivityFeedItem[]>({
    queryKey: ["/api/activity-feed"],
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-activity-feed-title">
          <Activity className="w-6 h-6" />
          Activity Feed
        </h1>
        <p className="text-muted-foreground mt-1">Recent activity across the platform</p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No activity yet. Check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-4">
            <div className="space-y-0">
              {items.map((item, index) => {
                const config = typeConfig[item.type] || { icon: Activity, color: "text-muted-foreground", label: item.type };
                const Icon = config.icon;
                return (
                  <div key={item.id} className={`flex items-start gap-3 py-3 ${index !== items.length - 1 ? "border-b border-border/50" : ""}`}>
                    <div className={`p-2 rounded-full bg-muted shrink-0 ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm" data-testid={`text-activity-${item.id}`}>{item.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{config.label}</Badge>
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
