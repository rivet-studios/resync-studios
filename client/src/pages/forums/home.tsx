import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, User as UserIcon } from "lucide-react";
import type { ForumCategory, ForumThread, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { rankConfig } from "@/components/user-rank-badge";

interface CategoryWithGroup extends ForumCategory {
  group?: string | null;
}

export default function ForumHome() {
  const { data: categories = [] } = useQuery<CategoryWithGroup[]>({
    queryKey: ["/api/forums/categories"],
  });

  const { data: threads = [] } = useQuery<(ForumThread & { author: User; category: ForumCategory })[]>({
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

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white" data-testid="heading-forums">Forums</h1>
          <p className="text-sm text-white/40 mt-1">Connect with our community and get support</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className="lg:col-span-3 space-y-1">
            {Object.entries(grouped).map(([groupName, cats]) => {
              if (cats.length === 0) return null;
              const groupThreadCount = threads.filter((t) =>
                cats.some((c) => c.id === t.categoryId)
              ).length;

              return (
                <div key={groupName} className="mb-4" data-testid={`group-${groupName}`}>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="w-full text-left px-3 py-2"
                  >
                    <h3 className="text-sm font-semibold text-white">{groupName}</h3>
                    <p className="text-xs text-white/30">{groupThreadCount} posts</p>
                  </button>
                  <div className="mt-1 space-y-0.5">
                    {cats.map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                          className={`w-full text-left flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm transition-colors ${
                            isSelected
                              ? "bg-white/10 text-white font-medium"
                              : "text-white/50 hover:text-white hover:bg-white/[0.03]"
                          }`}
                          data-testid={`button-category-${cat.id}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="pt-4">
              <Button
                asChild
                className="w-full bg-white text-black hover:bg-white/90 rounded-lg font-medium text-sm h-10 transition-transform active:scale-95"
              >
                <Link href="/forums/new" data-testid="link-new-thread">
                  <Plus className="w-4 h-4 mr-1.5" strokeWidth={2.5} /> Start Discussion
                </Link>
              </Button>
            </div>
          </aside>

          <div className="lg:col-span-9">
            <div className="border border-white/5 rounded-xl overflow-hidden bg-[#0a0a0a]">
              <div className="divide-y divide-white/5">
                {filteredThreads.map((thread) => (
                  <Link key={thread.id} href={`/forums/thread/${thread.id}`}>
                    <div
                      className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                      data-testid={`thread-${thread.id}`}
                    >
                      <Avatar className="w-9 h-9 flex-shrink-0 rounded-full bg-white/5 border border-white/5">
                        <AvatarImage src={thread.author?.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-white/5 text-white/50 text-sm font-semibold">
                          {getInitial(thread.author)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white/90 group-hover:text-white transition-colors truncate">
                          {thread.title}
                        </h3>
                        <p className="text-xs text-white/30 mt-0.5">
                          Started by{" "}
                          {(() => {
                            const rc = rankConfig[(thread.author as any)?.userRank || ""];
                            const isLifetime = (thread.author as any)?.userRank === "Lifetime" && rc?.isGradient;
                            return (
                              <span
                                className={isLifetime ? "font-semibold" : "text-white/50"}
                                style={isLifetime ? {
                                  color: "transparent",
                                  backgroundImage: rc.gradient,
                                  WebkitBackgroundClip: "text",
                                  backgroundClip: "text",
                                } : undefined}
                              >
                                {thread.author?.username || "Unknown"}
                              </span>
                            );
                          })()}
                          {" · "}
                          {thread.createdAt
                            ? formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })
                            : "recently"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-white/20 flex-shrink-0">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">{thread.replyCount || 0}</span>
                      </div>
                    </div>
                  </Link>
                ))}

                {filteredThreads.length === 0 && (
                  <div className="py-20 text-center">
                    <MessageSquare className="w-10 h-10 text-white/10 mx-auto mb-3" />
                    <p className="text-sm font-medium text-white/50">No discussions yet</p>
                    <p className="text-xs text-white/30 mt-1">Be the first to start a conversation with the community!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
