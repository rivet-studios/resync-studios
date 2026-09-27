import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Eye,
  MessageCircle,
  ChevronRight,
  Send,
  ArrowUpRight,
} from "lucide-react";

import type { Announcement } from "@shared/schema";
import { UserRankBadge } from "@/components/user-rank-badge";
import { VerifiedBadge } from "@/components/verified-badge";
import { useToast } from "@/hooks/use-toast";

interface BlogPost extends Announcement {
  viewCount?: number;
  author: {
    id: string;
    username: string;
    userRank: string;
    profileImageUrl: string | null;
    isVerified?: boolean;
  } | null;
}

interface BlogComment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    userRank: string;
    profileImageUrl: string | null;
    isVerified?: boolean;
  } | null;
}

function estimateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function formatDate(dateStr: string | Date): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(dateStr: string | Date): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);

  if (hrs < 24) return `${hrs}h ago`;

  const days = Math.floor(hrs / 24);

  if (days < 30) return `${days}d ago`;

  return formatDate(dateStr);
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [commentText, setCommentText] = useState("");

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ["/api/blog", id],
    enabled: !!id,
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery<
    BlogComment[]
  >({
    queryKey: ["/api/blog", id, "comments"],
    queryFn: async () => {
      const res = await fetch(`/api/blog/${id}/comments`);

      if (!res.ok) return [];

      return res.json();
    },
    enabled: !!id,
  });

  const postCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest(
        "POST",
        `/api/blog/${id}/comments`,
        { content },
      );

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/blog", id, "comments"],
      });

      setCommentText("");

      toast({
        title: "Comment posted",
      });
    },

    onError: () =>
      toast({
        title: "Failed to post comment",
        variant: "destructive",
      }),
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);

      toast({
        title: "Link copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Skeleton className="h-4 w-40 mb-10" />

          <div className="max-w-3xl mx-auto space-y-5">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-5 w-72" />

            <div className="flex items-center gap-3 pt-3">
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>

          <Skeleton className="max-w-5xl mx-auto h-[380px] sm:h-[480px] rounded-2xl mt-10" />

          <div className="max-w-3xl mx-auto mt-10 space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                key={i}
                className={`h-4 ${
                  i % 3 === 0 ? "w-4/5" : "w-full"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-muted border border-border/50 flex items-center justify-center mx-auto mb-5">
            <MessageCircle className="w-6 h-6 text-muted-foreground/50" />
          </div>

          <h1 className="text-xl font-semibold">
            Article not found
          </h1>

          <p className="text-sm text-muted-foreground mt-2">
            The announcement you're looking for could not be found or may no
            longer be available.
          </p>

          <Link href="/blog">
            <Button
              variant="outline"
              size="sm"
              className="mt-6"
              data-testid="button-back-blog"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient page background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-64 left-1/3 w-[40rem] h-[30rem] rounded-full bg-primary/[0.06] blur-[150px]" />
        <div className="absolute top-[40%] -right-64 w-[35rem] h-[35rem] rounded-full bg-primary/[0.035] blur-[150px]" />
      </div>

      <div className="relative">
        {/* Breadcrumb / actions */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
              <Link href="/blog">
                <span
                  className="hover:text-foreground transition-colors cursor-pointer"
                  data-testid="breadcrumb-blog"
                >
                  Blog
                </span>
              </Link>

              <ChevronRight className="w-3 h-3 shrink-0" />

              <span className="text-foreground/60 truncate max-w-[220px] sm:max-w-[400px]">
                {post.title}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-2"
              onClick={handleShare}
              data-testid="button-share"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>

        {/* Article header */}
        <header className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/[0.06] text-primary text-[10px] uppercase tracking-[0.18em] font-semibold px-3 py-1"
              >
                {post.category || "Blog Post"}
              </Badge>

              <span className="text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
                RIVET News
              </span>
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold tracking-[-0.035em] leading-[1.05] text-foreground"
              data-testid="text-post-title"
            >
              {post.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-2">
              {post.author && (
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-border/60">
                    <AvatarImage
                      src={post.author.profileImageUrl || undefined}
                      alt={post.author.username}
                    />

                    <AvatarFallback className="text-xs bg-muted">
                      {post.author.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-sm font-semibold text-foreground"
                        data-testid="text-post-author"
                      >
                        {post.author.username}
                      </span>

                      {post.author.isVerified && (
                        <VerifiedBadge
                          isVerified
                          size="sm"
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {post.author.userRank || "Member"}
                      </span>

                      <UserRankBadge
                        rank={post.author.userRank || "Members"}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="hidden sm:block h-8 w-px bg-border/60" />

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span
                  className="flex items-center gap-1.5"
                  data-testid="text-post-date"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(post.createdAt!)}
                </span>

                {post.viewCount !== undefined && (
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    {formatCount(post.viewCount)}
                  </span>
                )}

                <span className="flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {comments.length}
                </span>

                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {estimateReadTime(post.content)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Hero image */}
        {post.imageUrl && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14">
            <div className="relative aspect-[16/8] sm:aspect-[16/7] rounded-2xl sm:rounded-3xl overflow-hidden border border-border/50 bg-muted shadow-2xl shadow-black/10">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover"
                data-testid="img-post-hero"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        )}

        {/* Article */}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <article
            className="pt-10 sm:pt-14"
            data-testid="text-post-content"
          >
            <div className="space-y-6 text-[16px] sm:text-[17px] leading-[1.85] text-foreground/80">
              {post.content.split("\n").map((para, i) =>
                para.trim() ? (
                  <p
                    key={i}
                    className={
                      i === 0
                        ? "text-foreground/90"
                        : undefined
                    }
                  >
                    {para}
                  </p>
                ) : null,
              )}
            </div>
          </article>

          {/* Article footer */}
          {post.author && (
            <div className="mt-14 pt-8 border-t border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-3">
                  <Avatar className="w-11 h-11 border border-border/60">
                    <AvatarImage
                      src={post.author.profileImageUrl || undefined}
                      alt={post.author.username}
                    />

                    <AvatarFallback className="text-xs bg-muted">
                      {post.author.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Written by
                    </p>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-sm font-semibold text-foreground">
                        {post.author.username}
                      </span>

                      {post.author.isVerified && (
                        <VerifiedBadge
                          isVerified
                          size="sm"
                        />
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {post.author.userRank || "Member"}
                    </p>
                  </div>
                </div>

                <Link href={`/profile/${post.author.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 self-start sm:self-auto"
                  >
                    View profile
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Comments */}
          <section className="mt-16 pb-24">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
                  Community
                </p>

                <h2 className="text-xl font-semibold mt-1">
                  Comments
                </h2>
              </div>

              <Badge
                variant="outline"
                className="text-xs"
              >
                {comments.length}
              </Badge>
            </div>

            {/* Comment composer */}
            {user ? (
              <div className="rounded-2xl border border-border/50 bg-card/40 p-4 sm:p-5 mb-7">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 mt-0.5 shrink-0 border border-border/60">
                    <AvatarImage
                      src={user.profileImageUrl || undefined}
                    />

                    <AvatarFallback className="text-[10px] bg-muted">
                      {user.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="min-h-[90px] resize-none bg-background/60 border-border/60 text-sm"
                    data-testid="input-comment"
                  />
                </div>

                <div className="flex justify-end mt-3">
                  <Button
                    size="sm"
                    disabled={
                      !commentText.trim() ||
                      postCommentMutation.isPending
                    }
                    onClick={() =>
                      postCommentMutation.mutate(commentText.trim())
                    }
                    data-testid="button-post-comment"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Post comment
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/60 bg-card/20 p-7 text-center mb-7">
                <p className="text-sm text-muted-foreground">
                  <Link href="/login">
                    <span className="text-foreground underline underline-offset-4 cursor-pointer hover:text-primary transition-colors">
                      Sign in
                    </span>
                  </Link>{" "}
                  to leave a comment.
                </p>
              </div>
            )}

            {/* Loading */}
            {commentsLoading ? (
              <div className="space-y-5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex gap-3"
                  >
                    <Skeleton className="w-9 h-9 rounded-full shrink-0" />

                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-border/50 rounded-2xl">
                <MessageCircle className="w-6 h-6 text-muted-foreground/40 mx-auto mb-3" />

                <p className="text-sm text-muted-foreground">
                  No comments yet.
                </p>

                <p className="text-xs text-muted-foreground/70 mt-1">
                  Be the first to share your thoughts.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-3"
                    data-testid={`comment-${comment.id}`}
                  >
                    <Avatar className="w-9 h-9 mt-1 shrink-0 border border-border/60">
                      <AvatarImage
                        src={
                          comment.author?.profileImageUrl ||
                          undefined
                        }
                      />

                      <AvatarFallback className="text-[10px] bg-muted">
                        {comment.author?.username
                          ?.charAt(0)
                          .toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="rounded-2xl border border-border/50 bg-card/40 px-4 py-3.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {comment.author && (
                            <>
                              <Link
                                href={`/profile/${comment.author.id}`}
                              >
                                <span className="text-xs font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                                  {comment.author.username}
                                </span>
                              </Link>

                              {comment.author.isVerified && (
                                <VerifiedBadge
                                  isVerified
                                  size="sm"
                                />
                              )}

                              <UserRankBadge
                                rank={
                                  comment.author.userRank ||
                                  "Members"
                                }
                                size="sm"
                              />
                            </>
                          )}

                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {timeAgo(comment.createdAt)}
                          </span>
                        </div>

                        <p className="text-sm text-foreground/80 leading-relaxed mt-2.5">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}