import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  ChevronRight,
  FolderOpen,
  Lock,
  MessageSquare,
  MessagesSquare,
  Pin,
  Plus,
} from "lucide-react";
import type {
  ForumCategory,
  ForumThread,
  User,
} from "@shared/schema";
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

const GROUP_ORDER = [
  "News & Information",
  "Community",
  "Moderation",
];

export default function ForumHome() {
  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useQuery<CategoryWithGroup[]>({
    queryKey: ["/api/forums/categories"],
  });

  const {
    data: threads = [],
    isLoading: threadsLoading,
  } = useQuery<
    (ForumThread & {
      author: User;
      category: ForumCategory;
    })[]
  >({
    queryKey: ["/api/forums/threads"],
  });

  const groups: {
    name: string;
    categories: CategoryWithGroup[];
  }[] = [];

  for (const groupName of GROUP_ORDER) {
    const groupCategories = categories
      .filter((category) => category.group === groupName)
      .sort(
        (a, b) =>
          (a.order ?? 0) - (b.order ?? 0),
      );

    if (groupCategories.length > 0) {
      groups.push({
        name: groupName,
        categories: groupCategories,
      });
    }
  }

  const ungrouped = categories
    .filter(
      (category) =>
        !category.group ||
        !GROUP_ORDER.includes(category.group),
    )
    .sort(
      (a, b) =>
        (a.order ?? 0) - (b.order ?? 0),
    );

  if (ungrouped.length > 0) {
    groups.push({
      name: "Other",
      categories: ungrouped,
    });
  }

  const getInitial = (user?: User | null) =>
    user?.username
      ? user.username.charAt(0).toUpperCase()
      : "?";

  const renderUsername = (author?: User | null) => {
    if (!author) {
      return (
        <span className="text-muted-foreground">
          Unknown
        </span>
      );
    }

    const rank = rankConfig[(author as any)?.userRank || ""];
    const isGradient = rank?.isGradient;

    return (
      <span className="inline-flex items-center gap-1 min-w-0">
        <span
          className={
            isGradient
              ? "font-semibold truncate"
              : "font-medium truncate"
          }
          style={
            isGradient
              ? {
                  color: "transparent",
                  backgroundImage: rank.gradient,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                }
              : rank?.color
                ? { color: rank.color }
                : undefined
          }
        >
          {author.username}
        </span>

        <VerifiedBadge
          isVerified={(author as any)?.isVerified}
          size="sm"
        />
      </span>
    );
  };

  const getGroupThreads = (
    groupCategories: CategoryWithGroup[],
  ) => {
    const categoryIds = new Set(
      groupCategories.map((category) => category.id),
    );

    return threads
      .filter((thread) =>
        categoryIds.has(thread.categoryId),
      )
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        return (
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
        );
      });
  };

  const totalPosts = threads.length;
  const totalCategories = categories.length;

  if (categoriesLoading) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-72" />
            </div>

            <Skeleton className="h-10 w-40" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <Skeleton
                key={item}
                className="h-20 rounded-xl"
              />
            ))}
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <Skeleton
                key={item}
                className="h-64 w-full rounded-2xl"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <MessagesSquare className="h-3.5 w-3.5" />
              RIVET Community
            </div>

            <h1
              className="text-3xl font-bold tracking-tight"
              data-testid="heading-forums"
            >
              Forums
            </h1>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Connect with the community, share ideas, and join
              the discussion.
            </p>
          </div>

          <Button
            asChild
            className="shrink-0 gap-2"
            data-testid="link-new-thread"
          >
            <Link href="/forums/new">
              <Plus className="h-4 w-4" />
              New Discussion
            </Link>
          </Button>
        </div>

        {/* Forum Stats */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/5 bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <FolderOpen className="h-4 w-4 text-primary" />
              </div>

              <div>
                <p className="text-lg font-bold">
                  {totalCategories}
                </p>
                <p className="text-xs text-muted-foreground">
                  {totalCategories === 1
                    ? "Category"
                    : "Categories"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>

              <div>
                <p className="text-lg font-bold">
                  {totalPosts}
                </p>
                <p className="text-xs text-muted-foreground">
                  {totalPosts === 1
                    ? "Discussion"
                    : "Discussions"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <MessagesSquare className="h-4 w-4 text-primary" />
              </div>

              <div>
                <p className="text-lg font-bold">
                  {groups.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Forum Sections
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        {groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03]">
              <MessageSquare className="h-6 w-6 text-muted-foreground/30" />
            </div>

            <p className="mt-4 text-sm font-medium text-muted-foreground">
              No forum categories yet
            </p>

            <p className="mt-1 text-xs text-muted-foreground/50">
              Check back later for community discussions.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map((group) => {
              const groupThreads =
                getGroupThreads(group.categories);

              const pinnedThreads = groupThreads.filter(
                (thread) => thread.isPinned,
              );

              return (
                <section
                  key={group.name}
                  className="overflow-hidden rounded-2xl border border-white/5 bg-card"
                  data-testid={`group-${group.name}`}
                >
                  {/* Group Header */}
                  <div className="border-b border-white/5 bg-white/[0.015] px-5 py-4 sm:px-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03]">
                          <FolderOpen className="h-4 w-4 text-white/50" />
                        </div>

                        <div>
                          <h2 className="text-sm font-bold text-foreground">
                            {group.name}
                          </h2>

                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {group.categories.length}{" "}
                            {group.categories.length === 1
                              ? "category"
                              : "categories"}
                            {" · "}
                            {groupThreads.length}{" "}
                            {groupThreads.length === 1
                              ? "discussion"
                              : "discussions"}
                          </p>
                        </div>
                      </div>

                      <span className="hidden text-xs text-muted-foreground/40 sm:block">
                        {groupThreads.length} posts
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]">
                    {/* Category Sidebar */}
                    <div className="border-b border-white/5 bg-white/[0.01] p-4 lg:border-b-0 lg:border-r">
                      <div className="space-y-1">
                        {group.categories.map(
                          (category, index) => (
                            <Link
                              key={category.id}
                              href={`/forums/category/${category.id}`}
                              className="group/category flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
                            >
                              <span
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{
                                  backgroundColor:
                                    DOT_COLORS[
                                      index %
                                        DOT_COLORS.length
                                    ],
                                }}
                              />

                              <span className="min-w-0 flex-1 truncate text-sm text-foreground/65 transition-colors group-hover/category:text-foreground">
                                {category.name}
                              </span>

                              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/10 transition-all group-hover/category:translate-x-0.5 group-hover/category:text-white/40" />
                            </Link>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Threads */}
                    <div className="min-w-0 divide-y divide-white/[0.06]">
                      {threadsLoading ? (
                        <div className="space-y-3 p-5">
                          {[1, 2, 3].map((item) => (
                            <div
                              key={item}
                              className="flex items-center gap-3"
                            >
                              <Skeleton className="h-9 w-9 shrink-0 rounded-full" />

                              <div className="flex-1 space-y-1.5">
                                <Skeleton className="h-3.5 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : groupThreads.length === 0 ? (
                        <div className="flex min-h-[190px] items-center justify-center px-6 py-12 text-center">
                          <div>
                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.03]">
                              <MessageSquare className="h-5 w-5 text-muted-foreground/25" />
                            </div>

                            <p className="mt-3 text-sm font-medium text-muted-foreground/60">
                              No discussions yet
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground/35">
                              Be the first to start a conversation.
                            </p>
                          </div>
                        </div>
                      ) : (
                        groupThreads.map((thread) => (
                          <Link
                            key={thread.id}
                            href={`/forums/thread/${thread.id}`}
                          >
                            <div
                              className={`group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.035] sm:px-5 ${
                                thread.isPinned
                                  ? "bg-amber-500/[0.025]"
                                  : ""
                              }`}
                              data-testid={`thread-${thread.id}`}
                            >
                              {/* Avatar */}
                              <Avatar className="h-9 w-9 shrink-0 border border-white/5">
                                <AvatarImage
                                  src={
                                    thread.author
                                      ?.profileImageUrl ||
                                    undefined
                                  }
                                  alt={
                                    thread.author?.username ||
                                    "Unknown"
                                  }
                                />

                                <AvatarFallback className="text-xs font-semibold">
                                  {getInitial(thread.author)}
                                </AvatarFallback>
                              </Avatar>

                              {/* Main Content */}
                              <div className="min-w-0 flex-1">
                                <div className="flex min-w-0 items-center gap-1.5">
                                  {thread.isPinned && (
                                    <Pin className="h-3 w-3 shrink-0 text-amber-500" />
                                  )}

                                  <span className="truncate text-sm font-medium text-foreground/85 transition-colors group-hover:text-foreground">
                                    {thread.title}
                                  </span>

                                  {thread.isLocked && (
                                    <Lock className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                                  )}
                                </div>

                                <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
                                  <span>Started by</span>

                                  {renderUsername(
                                    thread.author,
                                  )}

                                  <span className="text-white/10">
                                    ·
                                  </span>

                                  <span>
                                    {thread.createdAt
                                      ? formatDistanceToNow(
                                          new Date(
                                            thread.createdAt,
                                          ),
                                          {
                                            addSuffix: true,
                                          },
                                        )
                                      : "recently"}
                                  </span>
                                </div>
                              </div>

                              {/* Replies */}
                              <div className="flex shrink-0 items-center gap-2">
                                <div className="flex min-w-[42px] flex-col items-center text-muted-foreground/40">
                                  <MessageSquare className="h-3.5 w-3.5" />
                                  <span className="mt-0.5 text-[10px] font-semibold">
                                    {thread.replyCount ?? 0}
                                  </span>
                                </div>

                                <ChevronRight className="hidden h-4 w-4 text-white/10 transition-all group-hover:translate-x-0.5 group-hover:text-white/35 sm:block" />
                              </div>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Group Footer */}
                  {groupThreads.length > 0 && (
                    <div className="border-t border-white/5 bg-white/[0.01] px-5 py-2.5 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground/35">
                          {pinnedThreads.length > 0 && (
                            <>
                              <Pin className="h-3 w-3 text-amber-500/50" />
                              <span>
                                {pinnedThreads.length} pinned
                              </span>
                            </>
                          )}
                        </div>

                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground/40">
                          Browse category
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        {groups.length > 0 && (
          <div className="rounded-xl border border-white/5 bg-card px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">
                  Have something to discuss?
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Start a new discussion with the community.
                </p>
              </div>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Link href="/forums/new">
                  <Plus className="h-3.5 w-3.5" />
                  New Discussion
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}