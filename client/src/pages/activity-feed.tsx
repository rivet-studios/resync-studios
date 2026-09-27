import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  MessageSquare,
  UserPlus,
  ShoppingCart,
  Shield,
  Star,
  FileText,
  Bell,
  ArrowUpRight,
} from "lucide-react";
import type { ActivityFeedItem } from "@shared/schema";

const typeConfig: Record<
  string,
  { icon: any; color: string; bg: string; border: string; label: string }
> = {
  user_joined: {
    icon: UserPlus,
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/15",
    label: "New Member",
  },
  thread_created: {
    icon: MessageSquare,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/15",
    label: "Forum",
  },
  product_approved: {
    icon: ShoppingCart,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/15",
    label: "Store",
  },
  moderation_action: {
    icon: Shield,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/15",
    label: "Moderation",
  },
  vip_upgrade: {
    icon: Star,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/15",
    label: "VIP",
  },
  blog_posted: {
    icon: FileText,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/15",
    label: "Blog",
  },
  announcement: {
    icon: Bell,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/15",
    label: "Announcement",
  },
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

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default function ActivityFeedPage() {
  const { data: items = [], isLoading } = useQuery<ActivityFeedItem[]>({
    queryKey: ["/api/activity-feed"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <section className="border-b border-border/40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Skeleton className="h-3 w-24 mb-4" />
            <Skeleton className="h-10 w-52" />
            <Skeleton className="h-4 w-80 mt-3" />
          </div>
        </section>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-4"
                  >
                    <Skeleton className="w-11 h-11 rounded-xl shrink-0" />

                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full max-w-lg" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 right-1/4 w-[30rem] h-[24rem] rounded-full bg-primary/10 blur-[130px]" />
          <div className="absolute -bottom-48 -left-32 w-[28rem] h-[28rem] rounded-full bg-primary/5 blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                RIVET Community
              </p>

              <h1
                className="text-3xl sm:text-5xl font-semibold tracking-tight text-foreground mt-3 flex items-center gap-3"
                data-testid="text-activity-feed-title"
              >
                Activity
              </h1>

              <p className="text-base text-muted-foreground mt-3 max-w-xl leading-relaxed">
                Follow recent activity across the RIVET platform.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="px-3 py-1.5 text-xs gap-2"
              >
                <Activity className="w-3.5 h-3.5 text-primary" />
                {items.length} recent{" "}
                {items.length === 1 ? "event" : "events"}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Feed */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {items.length === 0 ? (
          <Card className="border-dashed border-border/60 bg-card/20">
            <CardContent className="min-h-[320px] flex flex-col items-center justify-center text-center p-8">
              <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-center mb-5">
                <Activity className="w-6 h-6 text-muted-foreground/50" />
              </div>

              <h2 className="text-base font-semibold text-foreground">
                No activity yet
              </h2>

              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                There hasn't been any recorded platform activity yet. Check
                back soon for updates from across the community.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50 bg-card/40 overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[35px] top-8 bottom-8 w-px bg-border/50 hidden sm:block" />

                <div>
                  {items.map((item, index) => {
                    const config = typeConfig[item.type] || {
                      icon: Activity,
                      color: "text-muted-foreground",
                      bg: "bg-muted",
                      border: "border-border",
                      label: item.type,
                    };

                    const Icon = config.icon;

                    return (
                      <div
                        key={item.id}
                        className={`relative flex items-start gap-4 sm:gap-5 px-5 sm:px-7 py-5 transition-colors hover:bg-muted/20 ${
                          index !== items.length - 1
                            ? "border-b border-border/40"
                            : ""
                        }`}
                      >
                        {/* Event icon */}
                        <div
                          className={`relative z-10 w-11 h-11 rounded-xl border ${config.border} ${config.bg} ${config.color} flex items-center justify-center shrink-0`}
                        >
                          <Icon className="w-4.5 h-4.5" />
                        </div>

                        {/* Event content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div className="min-w-0">
                              <p
                                className="text-sm text-foreground leading-relaxed"
                                data-testid={`text-activity-${item.id}`}
                              >
                                {item.description}
                              </p>

                              <div className="flex items-center flex-wrap gap-2 mt-2.5">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] font-medium ${config.color} ${config.border} bg-transparent`}
                                >
                                  {config.label}
                                </Badge>

                                <span className="text-[11px] text-muted-foreground">
                                  {formatTimeAgo(item.createdAt)}
                                </span>
                              </div>
                            </div>

                            <span className="hidden sm:flex items-center text-muted-foreground/30">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}