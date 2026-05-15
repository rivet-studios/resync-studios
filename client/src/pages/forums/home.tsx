import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Plus, Pin, Lock } from "lucide-react";
import type { ForumCategory, ForumThread, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { rankConfig } from "@/components/user-rank-badge";
import { VerifiedBadge } from "@/components/verified-badge";

interface CategoryWithGroup extends ForumCategory {
  group: string | null;
}

const DOT_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
];

const GROUP_ORDER = ["News & Information", "Community", "Moderation"];

export default function ForumHome() {
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<CategoryWithGroup[]>({
    queryKey: ["/api/forums/categories"],
  });

  const { data: threads = [], isLoading: threadsLoading } = useQuery<
    (ForumThread & { author: User; category: ForumCategory })[]
  >({
    queryKey: ["/api/forums/threads"],
  });

  const groups: { name: string; categories: CategoryWithGroup[] }[] = [];

  for (const groupName of GROUP_ORDER) {
    const cats = categories
      .filter((c) => c.group === groupName)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    if (cats.length > 0) groups.push({ name: groupName, categories: cats });
  }

  const ungrouped = categories.filter(
    (c) => !c.group || !GROUP_ORDER.includes(c.group)
  );
  if (ungrouped.length > 0) groups.push({ name: "Other", categories: ungrouped });

  const getInitial = (user?: User | null) =>
    user?.username ? user.username.charAt(0).toUpperCase() : "?";

  const renderUsername = (author?: User | null) => {
    if (!author) return <span className="text-muted-foreground">Unknown</span>;
    const rc = rankConfig[(author as any)?.userRank || ""];
    const isGradient = rc?.isGradient;
    return (
      <span className="inline-flex items-center gap-1">
        <span
          className={isGradient ? "font-semibold" : "font-medium"}
          style={
            isGradient
              ? {
                  color: "transparent",
                  backgroundImage: rc.gradient,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                }
              : rc?.color
              ? { color: rc.color }
              : undefined
          }
        >
          {author.username}
        </span>
        <VerifiedBadge isVerified={(author as any)?.isVerified} size="sm" />
      </span>
    );
  };

  if (categoriesLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-28 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-56 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-5 animate-in fade-in duration-500">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="heading-forums">
              Forums
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Connect with our community and get support
            </p>
          </div>
          <Button asChild data-testid="link-new-thread">
            <Link href="/forums/new">
              <Plus className="w-4 h-4 mr-1.5" /> New Discussion
            </Link>
          </Button>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No forum categories yet</p>
          </div>
        ) : (
          groups.map((group) => {
            const groupCatIds = new Set(group.categories.map((c) => c.id));
            const groupThreads = threads
              .filter((t) => groupCatIds.has(t.categoryId))
              .sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
              });

            return (
              <div
                key={group.name}
                className="flex rounded-xl overflow-hidden border border-white/10"
                data-testid={`group-${group.name}`}
              >
                <div className="w-52 flex-shrink-0 bg-[#111111] p-5 flex flex-col gap-4 border-r border-white/10">
                  <div>
                    <h2 className="text-[15px] font-bold text-foreground leading-snug">
                      {group.name}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      {groupThreads.length} posts
                    </p>
                  </div>

                  <div className="space-y-2">
                    {group.categories.map((cat, idx) => (
                      <div key={cat.id} className="flex items-center gap-2.5">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: DOT_COLORS[idx % DOT_COLORS.length],
                          }}
                        />
                        <span className="text-sm text-foreground/75 truncate">{cat.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-w-0 bg-[#0d0d0d] divide-y divide-white/[0.07]">
                  {threadsLoading ? (
                    <div className="p-4 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-3.5 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : groupThreads.length === 0 ? (
                    <div className="flex items-center justify-center py-14 px-6 text-center">
                      <div>
                        <MessageSquare className="w-7 h-7 text-muted-foreground/25 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground/60">No discussions yet</p>
                      </div>
                    </div>
                  ) : (
                    groupThreads.map((thread) => (
                      <Link key={thread.id} href={`/forums/thread/${thread.id}`}>
                        <div
                          className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.06] transition-colors cursor-pointer group"
                          data-testid={`thread-${thread.id}`}
                        >
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarImage src={thread.author?.profileImageUrl || undefined} />
                            <AvatarFallback className="text-xs font-semibold">
                              {getInitial(thread.author)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {thread.isPinned && (
                                <Pin className="w-3 h-3 text-amber-500 flex-shrink-0" />
                              )}
                              <span className="text-sm font-medium text-foreground truncate group-hover:text-foreground/90">
                                {thread.title}
                              </span>
                              {thread.isLocked && (
                                <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 flex-wrap">
                              <span>Started by</span>
                              {renderUsername(thread.author)}
                              <span>·</span>
                              <span>
                                {thread.createdAt
                                  ? formatDistanceToNow(new Date(thread.createdAt), {
                                      addSuffix: true,
                                    })
                                  : "recently"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0 ml-2">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{thread.replyCount ?? 0}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
