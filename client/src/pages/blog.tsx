import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pencil,
  Loader2,
  Clock,
  Calendar,
  Eye,
  MessageCircle,
  Tag,
  ImageIcon,
  FileText,
} from "lucide-react";
import type { Announcement } from "@shared/schema";
import { Link } from "wouter";
import { UserRankBadge } from "@/components/user-rank-badge";

interface BlogPost extends Announcement {
  author: {
    id: string;
    username: string;
    userRank: string;
    profileImageUrl: string | null;
    vipTier: string | null;
  } | null;
}

function estimateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function formatDate(dateStr: string | Date): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export default function Blog() {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [imageUrl, setImageUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/blog", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setIsCreateOpen(false);
      setTitle("");
      setContent("");
      setCategory("General");
      setImageUrl("");
    },
    onError: (error: any) => {
      console.error("Blog post error:", error);
    },
  });

  const isAdminUser =
    user?.isAdmin ||
    user?.userRank === "Team Member" ||
    user?.userRank === "Company Director";

  const handleCreatePost = () => {
    if (!title || !content) return;
    const postData: any = { title, content, category };
    if (imageUrl.trim()) postData.imageUrl = imageUrl.trim();
    createPostMutation.mutate(postData);
  };

  const categories = [
    "all",
    ...new Set(posts.map((p) => p.category || "General")),
  ];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      (post.category || "General") === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-24 bg-white/5" />
          <Skeleton className="h-4 w-64 bg-white/5" />
        </div>
        <Skeleton className="h-[360px] w-full rounded-2xl bg-white/5" />
        <div className="grid md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-foreground"
            data-testid="heading-blog"
          >
            Blog
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Browse our latest blog posts and articles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 h-8 text-sm bg-white/5 border-white/10"
            data-testid="input-blog-search"
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger
              className="w-36 h-8 text-sm bg-white/5 border-white/10"
              data-testid="select-blog-category"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all" ? "All categories" : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredPosts.length === 0 && !isLoading ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] py-20 flex flex-col items-center gap-3 text-center px-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/[0.06] flex items-center justify-center">
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              No articles found
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              {searchQuery
                ? `No articles match "${searchQuery}". Try a different search term.`
                : "No blog posts have been published yet. Check back soon!"}
            </p>
          </div>
        </div>
      ) : (
        <>
          {featuredPost && (
            <Link href={`/blog/${featuredPost.id}`}>
              <div
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:bg-white/[0.04] transition-colors cursor-pointer"
                data-testid="card-featured-post"
              >
                <div className="relative aspect-[16/7] overflow-hidden">
                  <img
                    src={
                      featuredPost.imageUrl ||
                      "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=1200&q=80"
                    }
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                    data-testid="img-featured-post"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/10 border border-white/[0.08] text-[10px] font-semibold uppercase tracking-widest text-foreground/70">
                      Featured
                    </span>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span
                        className="flex items-center gap-1"
                        data-testid="text-featured-date"
                      >
                        <Calendar className="w-3 h-3" />
                        {formatDate(featuredPost.createdAt!)}
                      </span>
                      {featuredPost.viewCount !== undefined && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatCount(featuredPost.viewCount)} views
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {estimateReadTime(featuredPost.content)}
                      </span>
                    </div>
                  </div>

                  <h2
                    className="text-xl md:text-2xl font-bold text-foreground leading-tight tracking-tight"
                    data-testid="text-featured-title"
                  >
                    {featuredPost.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {featuredPost.content}
                  </p>

                  {featuredPost.author && (
                    <div className="flex items-center gap-2 pt-1">
                      <Avatar className="w-6 h-6 border border-white/10">
                        <AvatarImage
                          src={
                            featuredPost.author.profileImageUrl || undefined
                          }
                          alt={featuredPost.author.username}
                        />
                        <AvatarFallback className="text-[9px] font-semibold bg-white/10">
                          {featuredPost.author.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className="text-xs font-semibold text-foreground"
                        data-testid="text-featured-author"
                      >
                        {featuredPost.author.username}
                      </span>
                      <UserRankBadge
                        rank={featuredPost.author.userRank || "Members"}
                        size="sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Link>
          )}

          {remainingPosts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  {selectedCategory !== "all" ? selectedCategory : "All articles"}
                  <span className="text-muted-foreground font-normal ml-2">
                    ({remainingPosts.length})
                  </span>
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {remainingPosts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.id}`}>
                    <div
                      className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:bg-white/[0.04] transition-colors cursor-pointer h-full flex flex-col"
                      data-testid={`card-blog-${post.id}`}
                    >
                      <div className="aspect-[16/8] overflow-hidden relative">
                        <img
                          src={
                            post.imageUrl ||
                            "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&q=80"
                          }
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                        {post.category && (
                          <div className="absolute top-2.5 right-2.5">
                            <Badge
                              variant="secondary"
                              className="text-[9px] uppercase tracking-wider backdrop-blur-sm bg-black/40 border-white/10"
                            >
                              {post.category}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.createdAt!)}
                          </span>
                          {post.viewCount !== undefined && (
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {formatCount(post.viewCount)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {estimateReadTime(post.content)}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 flex-1">
                          {post.title}
                        </h4>
                        {post.author && (
                          <div className="flex items-center gap-2 pt-1.5 border-t border-white/[0.04]">
                            <Avatar className="w-5 h-5">
                              <AvatarImage
                                src={
                                  post.author.profileImageUrl || undefined
                                }
                                alt={post.author.username}
                              />
                              <AvatarFallback className="text-[9px] bg-white/10">
                                {post.author.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span
                              className="text-xs text-muted-foreground"
                              data-testid={`text-author-${post.id}`}
                            >
                              {post.author.username}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {isAdminUser && (
        <div className="fixed bottom-8 right-8 z-50">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button
                size="icon"
                className="h-12 w-12 rounded-full shadow-2xl"
                data-testid="button-create-post"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Create Blog Post
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Title
                  </label>
                  <Input
                    placeholder="Enter article title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    data-testid="input-post-title"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Tag className="w-3 h-3" /> Category
                    </label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger data-testid="select-post-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Update">Update</SelectItem>
                        <SelectItem value="Announcement">
                          Announcement
                        </SelectItem>
                        <SelectItem value="Dev Blog">Dev Blog</SelectItem>
                        <SelectItem value="Community">Community</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <ImageIcon className="w-3 h-3" /> Cover Image URL
                    </label>
                    <Input
                      placeholder="https://..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      data-testid="input-post-image"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Content
                  </label>
                  <Textarea
                    placeholder="Write your article content..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[220px] resize-none"
                    data-testid="input-post-content"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-1">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    data-testid="button-cancel-post"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePost}
                    disabled={
                      createPostMutation.isPending || !title || !content
                    }
                    data-testid="button-publish"
                  >
                    {createPostMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Publishing...
                      </>
                    ) : (
                      "Publish Article"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
