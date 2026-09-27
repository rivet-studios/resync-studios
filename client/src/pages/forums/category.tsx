import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Clock,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Pin,
  MessagesSquare,
  Plus,
} from "lucide-react";
import type { ForumCategory, ForumThread, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/verified-badge";

export default function ForumCategoryPage() {
  const { id } = useParams<{ id: string }>();

  const { data: category } = useQuery<ForumCategory>({
    queryKey: [`/api/forums/categories/${id}`],
    enabled: !!id,
  });

  const { data: threads, isLoading } = useQuery<
    (ForumThread & { author: User })[]
  >({
    queryKey: ["/api/forums/threads", { categoryId: id }],
    enabled: !!id,
  });

  const threadList = threads || [];
  const pinnedThreads = threadList.filter((thread) => thread.isPinned);
  const regularThreads = threadList.filter((thread) => !thread.isPinned);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent text-foreground">
        <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-24 rounded bg-white/5" />
            <div className="h-36 w-full rounded-2xl border border-white/5 bg-white/[0.03]" />

            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 w-full rounded-xl border border-white/5 bg-white/[0.02]"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/30">
          <Link
            href="/forums"
            className="flex items-center gap-1.5 transition-colors hover:text-white/70"
          >
            <ChevronLeft className="h-4 w-4" />
            Forums
          </Link>

          <ChevronRight className="h-3.5 w-3.5 text-white/15" />

          <span className="truncate text-white/50">
            {category?.name || "Category"}
          </span>
        </div>

        {/* Category Header */}
        <Card className="relative overflow-hidden border-white/10 bg-card">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-transparent" />

          <CardContent className="relative p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                  <MessagesSquare className="h-6 w-6 text-white/70" />
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="border-white/10 bg-white/[0.05] text-[10px] uppercase tracking-wider text-white/50"
                    >
                      Community Forum
                    </Badge>

                    <Badge
                      variant="outline"
                      className="border-white/10 text-[10px] text-white/40"
                    >
                      {threadList.length}{" "}
                      {threadList.length === 1 ? "discussion" : "discussions"}
                    </Badge>
                  </div>

                  <h1 className="truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {category?.name || "Category"}
                  </h1>

                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-white/40 sm:text-base">
                    {category?.description ||
                      "Browse discussions and conversations in this category."}
                  </p>
                </div>
              </div>

              <Button
                asChild
                className="shrink-0 gap-2 bg-white text-black hover:bg-white/90"
              >
                <Link href="/forums/new">
                  <Plus className="h-4 w-4" />
                  Start a Discussion
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pinned Discussions */}
        {pinnedThreads.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Pin className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white/80">
                Pinned Discussions
              </h2>
            </div>

            <div className="overflow-hidden rounded-xl border border-amber-500/10 bg-card">
              {pinnedThreads.map((thread) => {
                const username = thread.author?.username || "Unknown";
                const initial = username.charAt(0).toUpperCase() || "U";

                return (
                  <Link
                    key={thread.id}
                    href={`/forums/thread/${thread.id}`}
                    className="group block border-b border-white/5 last:border-b-0"
                    data-testid={`thread-${thread.id}`}
                  >
                    <div className="flex items-center gap-4 p-4 transition-colors hover:bg-amber-500/[0.025] sm:p-5">
                      <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-500/10 bg-amber-500/[0.06] sm:flex">
                        <Pin className="h-4 w-4 text-amber-400" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className="border-amber-500/20 bg-amber-500/10 text-[9px] text-amber-400">
                            PINNED
                          </Badge>
                        </div>

                        <h3 className="mt-1.5 truncate font-semibold text-white/90 transition-colors group-hover:text-white">
                          {thread.title}
                        </h3>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/30">
                          <span className="inline-flex items-center gap-1.5">
                            <Avatar className="h-5 w-5 border border-white/10">
                              <AvatarImage
                                src={
                                  thread.author?.profileImageUrl || undefined
                                }
                                alt={username}
                              />
                              <AvatarFallback className="bg-white/5 text-[9px] text-white/50">
                                {initial}
                              </AvatarFallback>
                            </Avatar>

                            <span className="inline-flex items-center gap-1">
                              {username}
                              <VerifiedBadge
                                isVerified={
                                  (thread.author as any)?.isVerified
                                }
                                size="sm"
                              />
                            </span>
                          </span>

                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {thread.createdAt
                              ? formatDistanceToNow(
                                  new Date(thread.createdAt),
                                  {
                                    addSuffix: true,
                                  },
                                )
                              : "Recently"}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <div className="hidden items-center gap-1 text-white/25 sm:flex">
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-xs font-semibold">
                            {thread.replyCount || 0}
                          </span>
                        </div>

                        <ChevronRight className="h-4 w-4 text-white/15 transition-transform group-hover:translate-x-0.5 group-hover:text-white/40" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Discussions */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-sm font-semibold text-white/80">
                Discussions
              </h2>
              <p className="mt-0.5 text-xs text-white/30">
                {regularThreads.length > 0
                  ? `${regularThreads.length} active ${
                      regularThreads.length === 1
                        ? "discussion"
                        : "discussions"
                    }`
                  : "No discussions yet"}
              </p>
            </div>

            {regularThreads.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-8 gap-1.5 text-xs text-white/40 hover:text-white"
              >
                <Link href="/forums/new">
                  <Plus className="h-3.5 w-3.5" />
                  New Discussion
                </Link>
              </Button>
            )}
          </div>

          <Card className="overflow-hidden border-white/5 bg-card">
            <CardContent className="p-0">
              {regularThreads.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {regularThreads.map((thread) => {
                    const username = thread.author?.username || "Unknown";
                    const initial = username.charAt(0).toUpperCase() || "U";

                    return (
                      <Link
                        key={thread.id}
                        href={`/forums/thread/${thread.id}`}
                        className="group block"
                        data-testid={`thread-${thread.id}`}
                      >
                        <div className="flex items-center gap-4 p-4 transition-colors hover:bg-white/[0.025] sm:gap-5 sm:p-5">
                          {/* Author Avatar */}
                          <Avatar className="h-10 w-10 shrink-0 border border-white/10 sm:h-11 sm:w-11">
                            <AvatarImage
                              src={
                                thread.author?.profileImageUrl || undefined
                              }
                              alt={username}
                            />
                            <AvatarFallback className="bg-white/[0.04] text-white/40">
                              {thread.author?.username ? (
                                initial
                              ) : (
                                <UserIcon className="h-5 w-5" />
                              )}
                            </AvatarFallback>
                          </Avatar>

                          {/* Thread Information */}
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-semibold text-white/85 transition-colors group-hover:text-white sm:text-base">
                              {thread.title}
                            </h3>

                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/30">
                              <span className="inline-flex items-center gap-1">
                                Started by
                                <span className="inline-flex items-center gap-1 font-medium text-white/50">
                                  {username}
                                  <VerifiedBadge
                                    isVerified={
                                      (thread.author as any)?.isVerified
                                    }
                                    size="sm"
                                  />
                                </span>
                              </span>

                              <span className="hidden text-white/10 sm:inline">
                                •
                              </span>

                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {thread.createdAt
                                  ? formatDistanceToNow(
                                      new Date(thread.createdAt),
                                      {
                                        addSuffix: true,
                                      },
                                    )
                                  : "Recently"}
                              </span>
                            </div>
                          </div>

                          {/* Reply Count */}
                          <div className="flex shrink-0 items-center gap-3">
                            <div className="flex min-w-[42px] flex-col items-center gap-0.5 text-white/25">
                              <MessageSquare className="h-4 w-4" />
                              <span className="text-[11px] font-semibold">
                                {thread.replyCount || 0}
                              </span>
                            </div>

                            <ChevronRight className="hidden h-4 w-4 text-white/10 transition-all group-hover:translate-x-0.5 group-hover:text-white/40 sm:block" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03]">
                    <MessageSquare className="h-6 w-6 text-white/20" />
                  </div>

                  <h3 className="mt-4 text-base font-semibold text-white/80">
                    No discussions yet
                  </h3>

                  <p className="mt-1.5 max-w-sm text-sm leading-5 text-white/30">
                    This category doesn't have any discussions yet. Start the
                    conversation and be the first to post.
                  </p>

                  <Button
                    asChild
                    className="mt-5 gap-2 bg-white text-black hover:bg-white/90"
                  >
                    <Link href="/forums/new">
                      <Plus className="h-4 w-4" />
                      Start a Discussion
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-center border-t border-white/5 pt-5">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-2 text-xs text-white/35 hover:text-white"
          >
            <Link href="/forums">
              <ChevronLeft className="h-3.5 w-3.5" />
              Back to all forums
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}