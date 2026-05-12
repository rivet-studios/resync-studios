import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Plus,
  Eye,
  Clock,
  Pin,
  Lock,
  ChevronRight,
} from "lucide-react";
import type { ForumCategory, ForumThread, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { rankConfig } from "@/components/user-rank-badge";
import { VerifiedBadge } from "@/components/verified-badge";

interface CategoryWithGroup extends ForumCategory {
  group: string | null;
}

export default function ForumHome() {
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<CategoryWithGroup[]>({
    queryKey: ["/api/forums/categories"],
  });

  const { data: threads = [], isLoading: threadsLoading } = useQuery<(ForumThread & { author: User; category: ForumCategory })[]>({
    queryKey: ["/api/forums/threads"],
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const groupOrder = ["News & Information", "Community", "Moderation"];
  const grouped = groupOrder.reduce<Record<string, CategoryWithGroup[]>>((acc, group) => {
    acc[group] = categories
      .filter((c) => c.group === group)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return acc;
  }, {});

  const ungrouped = categories.filter(
    (c) => !c.group || !groupOrder.includes(c.group)
  );
  if (ungrouped.length > 0) {
    grouped["Other"] = ungrouped;
  }

  const filteredThreads = selectedCategory
    ? threads.filter((t) => t.categoryId === selectedCategory)
    : threads;

  const getInitial = (user?: User | null) => {
    if (!user?.username) return "?";
    return user.username.charAt(0).toUpperCase();
  };

  const renderUsername = (author: User | undefined) => {
    if (!author) return <span className="text-muted-foreground">Unknown</span>;
    const rc = rankConfig[(author as any)?.userRank || ""];
    const isGradient = rc?.isGradient;
    return (
      <span className="inline-flex items-center gap-1">
        <span
          className={isGradient ? "font-semibold" : "text-foreground/70 font-medium"}
          style={isGradient ? {
            color: "transparent",
            backgroundImage: rc.gradient,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          } : rc?.color ? { color: rc.color } : undefined}
        >
          {author.username}
        </span>
        <VerifiedBadge isVerified={author?.isVerified} size="sm" />
      </span>
    );
  };

  const isLoading = categoriesLoading || threadsLoading;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="heading-forums">Forums</h1>
            <p className="text-sm text-muted-foreground mt-1">Connect with our community and get support</p>
          </div>
          <Button asChild data-testid="link-new-thread">
            <Link href="/forums/new">
              <Plus className="w-4 h-4 mr-1.5" /> New Discussion
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className="lg:col-span-3 space-y-1">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-md" />
                ))}
              </div>
            ) : (
              <>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedCategory === null
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover-elevate"
                  }`}
                  data-testid="button-category-all"
                >
                  All Discussions
                  <span className="ml-2 text-xs text-muted-foreground">({threads.length})</span>
                </button>

                {Object.entries(grouped).map(([groupName, cats]) => {
                  if (cats.length === 0) return null;

                  return (
                    <div key={groupName} className="mt-4" data-testid={`group-${groupName}`}>
                      <h3 className="text-xs text-blue-400 font-bold uppercase tracking-wider text-muted-foreground px-3 mb-1.5">
                        {groupName}
                      </h3>
                      <div className="space-y-0.5">
                        {cats.map((cat) => {
                          const isSelected = selectedCategory === cat.id;
                          const catThreadCount = threads.filter((t) => t.categoryId === cat.id).length;
                          return (
                            <button
                              key={cat.id}
                              onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                              className={`w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                                isSelected
                                  ? "bg-accent text-accent-foreground font-medium"
                                  : "text-muted-foreground hover-elevate"
                              }`}
                              data-testid={`button-category-${cat.id}`}
                            >
                              <span className="truncate">{cat.name}</span>
                              <span className="text-xs flex-shrink-0 opacity-60">{catThreadCount}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </aside>

          <div className="lg:col-span-9">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-md" />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0 divide-y divide-border">
                  {filteredThreads.map((thread) => (
                    <Link key={thread.id} href={`/forums/thread/${thread.id}`}>
                      <div
                        className="flex items-start gap-3 sm:gap-4 px-4 py-3.5 hover-elevate transition-colors cursor-pointer group"
                        data-testid={`thread-${thread.id}`}
                      >
                        <Avatar className="w-9 h-9 flex-shrink-0 mt-0.5">
                          <AvatarImage src={thread.author?.profileImageUrl || undefined} />
                          <AvatarFallback className="text-sm font-semibold">
                            {getInitial(thread.author)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {thread.isPinned && (
                              <Pin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            )}
                            <h3 className="text-sm font-medium group-hover:text-foreground transition-colors truncate">
                              {thread.title}
                            </h3>
                            {thread.isLocked && (
                              <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              {renderUsername(thread.author)}
                            </span>
                            {thread.category && (
                              <>
                                <span>in</span>
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  {thread.category.name}
                                </Badge>
                              </>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {thread.createdAt
                                ? formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })
                                : "recently"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0 text-muted-foreground">
                          <div className="flex items-center gap-1 text-xs" data-testid={`thread-replies-${thread.id}`}>
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{thread.replyCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs" data-testid={`thread-views-${thread.id}`}>
                            <Eye className="w-3.5 h-3.5" />
                            <span>{thread.viewCount || 0}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                        </div>
                      </div>
                    </Link>
                  ))}

                  {filteredThreads.length === 0 && (
                    <div className="py-16 text-center">
                      <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">No discussions yet</p>
                      <p className="text-xs text-muted-foreground/60 mt-1 mb-4">Be the first to start a conversation!</p>
                      <Button asChild variant="outline" size="sm" data-testid="link-start-discussion-empty">
                        <Link href="/forums/new">
                          <Plus className="w-3.5 h-3.5 mr-1.5" /> Start Discussion
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
