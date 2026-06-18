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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent">
        <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-white/5 rounded" />
          <div className="h-10 w-full bg-white/5 rounded-xl" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 w-full bg-white/[0.03] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full text-white/50 hover:text-white">
            <Link href="/forums">
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {category?.name || "Category"}
            </h1>
            <p className="text-white/40">
              {category?.description || "Browse discussions in this category"}
            </p>
          </div>
        </div>

        <div className="border border-white/5 rounded-xl overflow-hidden bg-card">
          <div className="divide-y divide-white/5">
            {threads?.map((thread) => (
              <div
                key={thread.id}
                className="p-5 flex items-start gap-5 hover:bg-white/[0.02] transition-colors group"
                data-testid={`thread-${thread.id}`}
              >
                <Avatar className="w-10 h-10 border border-white/5 flex-shrink-0">
                  <AvatarImage
                    src={thread.author?.profileImageUrl || undefined}
                  />
                  <AvatarFallback className="bg-white/5 text-white/50">
                    <UserIcon className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 space-y-1">
                  <Link href={`/forums/thread/${thread.id}`}>
                    <h3 className="font-bold text-lg text-white/90 leading-tight group-hover:text-white transition-colors cursor-pointer truncate">
                      {thread.title}
                    </h3>
                  </Link>
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-white/30">
                    <span className="flex items-center gap-1.5">
                      Started by{" "}
                      <span className="font-semibold text-white/50 inline-flex items-center gap-1">
                        {thread.author?.username || "Unknown"}
                        <VerifiedBadge isVerified={thread.author?.isVerified} size="sm" />
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {thread.createdAt
                        ? formatDistanceToNow(new Date(thread.createdAt), {
                            addSuffix: true,
                          })
                        : "recently"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <div className="flex items-center gap-1 text-white/20">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-bold">
                      {thread.replyCount || 0}
                    </span>
                  </div>
                  {thread.isPinned && (
                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] px-1.5">
                      PINNED
                    </Badge>
                  )}
                </div>
              </div>
            ))}

            {threads?.length === 0 && (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6 text-white/20" />
                </div>
                <p className="text-white/40">
                  No discussions found in this category.
                </p>
                <Button asChild className="mt-4 bg-white text-black hover:bg-white/90">
                  <Link href="/forums/new">Start a Discussion</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
