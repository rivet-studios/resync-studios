import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Eye,
  MessageCircle,
  ChevronRight,
  Send,
} from "lucide-react";
import type { Announcement } from "@shared/schema";
import { UserRankBadge } from "@/components/user-rank-badge";
import { VerifiedBadge } from "@/components/verified-badge";
import { useToast } from "@/hooks/use-toast";

interface BlogPost extends Announcement {
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
      const res = await apiRequest("POST", `/api/blog/${id}/comments`, {
        content,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog", id, "comments"] });
      setCommentText("");
      toast({ title: "Comment posted" });
    },
    onError: () =>
      toast({ title: "Failed to post comment", variant: "destructive" }),
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard" });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-5 w-48 bg-white/5 rounded" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-24 bg-white/5 rounded-full" />
          <Skeleton className="h-12 w-3/4 bg-white/5 rounded" />
          <Skeleton className="h-4 w-56 bg-white/5 rounded" />
        </div>
        <Skeleton className="h-[360px] w-full bg-white/5 rounded-2xl" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-4 w-full bg-white/5 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 flex flex-col items-center gap-4 text-center">
        <p className="text-muted-foreground">Article not found</p>
        <Link href="/blog">
          <Button variant="outline" size="sm" data-testid="button-back-blog">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/blog">
            <span
              className="hover:text-foreground transition-colors cursor-pointer"
              data-testid="breadcrumb-blog"
            >
              Blog
            </span>
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground/70 truncate max-w-[200px]">
            {post.title}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleShare}
          data-testid="button-share"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/10 border border-white/[0.08] text-[10px] font-semibold uppercase tracking-widest text-foreground/70">
            {post.category || "Blog Post"}
          </span>
        </div>

        <h1
          className="text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight"
          data-testid="text-post-title"
        >
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 pt-1">
          {post.author && (
            <div className="flex items-center gap-2.5">
              <Avatar className="w-8 h-8 border border-white/10">
                <AvatarImage
                  src={post.author.profileImageUrl || undefined}
                  alt={post.author.username}
                />
                <AvatarFallback className="text-xs bg-white/10">
                  {post.author.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1">
                  <span
                    className="text-sm font-semibold text-foreground"
                    data-testid="text-post-author"
                  >
                    {post.author.username}
                  </span>
                  {post.author.isVerified && (
                    <VerifiedBadge isVerified size="sm" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {post.author.userRank || "Member"}
                </p>
              </div>
              <UserRankBadge
                rank={post.author.userRank || "Members"}
                size="sm"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span
              className="flex items-center gap-1"
              data-testid="text-post-date"
            >
              <Calendar className="w-3 h-3" />
              {formatDate(post.createdAt!)}
            </span>
            {post.viewCount !== undefined && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatCount(post.viewCount)} views
              </span>
            )}
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {comments.length} comments
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {estimateReadTime(post.content)}
            </span>
          </div>
        </div>
      </div>

      {post.imageUrl && (
        <div className="aspect-[16/8] rounded-2xl overflow-hidden border border-white/[0.06]">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
            data-testid="img-post-hero"
          />
        </div>
      )}

      <div
        className="space-y-4 text-[15px] text-foreground/80 leading-relaxed"
        data-testid="text-post-content"
      >
        {post.content.split("\n").map((para, i) =>
          para.trim() ? (
            <p key={i} className="text-foreground/80">
              {para}
            </p>
          ) : null,
        )}
      </div>

      {post.author && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-center gap-4">
          <Avatar className="w-12 h-12 border border-white/10">
            <AvatarImage
              src={post.author.profileImageUrl || undefined}
              alt={post.author.username}
            />
            <AvatarFallback className="text-sm bg-white/10">
              {post.author.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">
              Written by
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-foreground">
                {post.author.username}
              </span>
              {post.author.isVerified && (
                <VerifiedBadge isVerified size="sm" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {post.author.userRank || "Member"}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Comments ({comments.length})
          </h3>
        </div>

        {user ? (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Avatar className="w-7 h-7 mt-0.5 shrink-0 border border-white/10">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback className="text-[10px] bg-white/10">
                  {user.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                className="flex-1 min-h-[80px] resize-none bg-white/5 border-white/10 text-sm"
                data-testid="input-comment"
              />
            </div>
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={
                  !commentText.trim() || postCommentMutation.isPending
                }
                onClick={() => postCommentMutation.mutate(commentText.trim())}
                data-testid="button-post-comment"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Post comment
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
            <p className="text-sm text-muted-foreground">
              <Link href="/login">
                <span className="text-foreground underline underline-offset-2 cursor-pointer hover:text-foreground/80">
                  Sign in
                </span>
              </Link>{" "}
              to leave a comment.
            </p>
          </div>
        )}

        {commentsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-7 h-7 rounded-full bg-white/5 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-24 bg-white/5" />
                  <Skeleton className="h-3 w-full bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No comments yet. Be the first to share your thoughts!
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
                <Avatar className="w-7 h-7 mt-0.5 shrink-0 border border-white/10">
                  <AvatarImage
                    src={comment.author?.profileImageUrl || undefined}
                  />
                  <AvatarFallback className="text-[10px] bg-white/10">
                    {comment.author?.username?.charAt(0).toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {comment.author && (
                      <>
                        <Link href={`/profile/${comment.author.id}`}>
                          <span className="text-xs font-semibold text-foreground hover:underline cursor-pointer">
                            {comment.author.username}
                          </span>
                        </Link>
                        <UserRankBadge
                          rank={comment.author.userRank || "Members"}
                          size="sm"
                        />
                      </>
                    )}
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {timeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
