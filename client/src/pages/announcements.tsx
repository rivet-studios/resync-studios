import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import type { Announcement } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

interface BlogPost extends Announcement {
  author: { id: string; username: string; userRank: string; profileImageUrl: string | null } | null;
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

export default function News() {
  const { id } = useParams<{ id: string }>();

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ["/api/blog", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <Skeleton className="h-8 w-32 bg-muted" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-24 bg-muted rounded-full" />
            <Skeleton className="h-14 w-3/4 bg-muted" />
            <Skeleton className="h-6 w-1/2 bg-muted" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-xl bg-muted" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-full bg-muted" />
            <Skeleton className="h-5 w-full bg-muted" />
            <Skeleton className="h-5 w-3/4 bg-muted" />
            <Skeleton className="h-5 w-full bg-muted" />
            <Skeleton className="h-5 w-5/6 bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-lg">Article not found</p>
        <Link href="/blog">
          <Button variant="outline" data-testid="button-back-blog">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-32 space-y-10 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/blog">
            <Button variant="ghost" size="sm" data-testid="button-back-blog">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Blog
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={handleShare} data-testid="button-share">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="text-[10px] uppercase tracking-widest font-semibold">
              {post.category || "Blog Post"}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight text-foreground" data-testid="text-post-title">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border">
            {post.author && (
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.author.profileImageUrl || undefined} alt={post.author.username} />
                  <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                    {post.author.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground" data-testid="text-post-author">
                    {post.author.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {post.author.userRank || "Member"}
                  </span>
                </div>
              </div>
            )}
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5" data-testid="text-post-date">
                <Calendar className="w-3.5 h-3.5" /> {formatDate(post.createdAt!)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {estimateReadTime(post.content)}
              </span>
            </div>
          </div>
        </div>

        {post.imageUrl && (
          <div className="aspect-video rounded-xl overflow-hidden border border-border">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
              data-testid="img-post-hero"
            />
          </div>
        )}

        <Card className="border-none bg-transparent shadow-none">
          <CardContent className="p-0">
            <div className="prose prose-invert prose-lg max-w-none space-y-6 text-muted-foreground leading-relaxed" data-testid="text-post-content">
              {post.content.split('\n').map((para, i) => (
                para.trim() ? <p key={i} className="text-foreground/80">{para}</p> : null
              ))}
            </div>
          </CardContent>
        </Card>

        {post.author && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={post.author.profileImageUrl || undefined} alt={post.author.username} />
                  <AvatarFallback className="text-sm font-semibold bg-muted text-muted-foreground">
                    {post.author.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Written by</span>
                  <span className="text-base font-semibold text-foreground">
                    {post.author.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {post.author.userRank || "Member"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
