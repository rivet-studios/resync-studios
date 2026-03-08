import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
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
  Plus,
  Loader2,
  Clock,
  Calendar,
  ArrowRight,
  Pencil,
  Tag,
  FileText,
  ImageIcon,
} from "lucide-react";
import type { Announcement } from "@shared/schema";
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
      alert(`Failed to publish: ${error.message || "Unknown error"}`);
    },
  });

  const isAdmin =
    user?.isAdmin ||
    user?.userRank === "Team Member" ||
    user?.userRank === "Company Director";

  const handleCreatePost = () => {
    if (!title || !content) return;
    const postData: any = { title, content, category };
    if (imageUrl.trim()) postData.imageUrl = imageUrl.trim();
    createPostMutation.mutate(postData);
  };

  const categories = ["all", ...new Set(posts.map(p => p.category || "General"))];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
      (post.category || "General") === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="space-y-4">
            <Skeleton className="h-12 w-48 bg-muted" />
            <Skeleton className="h-6 w-80 bg-muted" />
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="h-80 rounded-xl bg-muted" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-24 bg-muted" />
              <Skeleton className="h-12 w-full bg-muted" />
              <Skeleton className="h-24 w-full bg-muted" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 rounded-xl bg-muted" />
                <Skeleton className="h-6 w-full bg-muted" />
                <Skeleton className="h-16 w-full bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      <div className="max-w-7xl mx-auto px-6 space-y-12 pb-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground" data-testid="heading-blog">
              Blog
            </h1>
            <p className="text-muted-foreground text-lg">
              Latest news, updates, and articles from the team
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
              data-testid="input-blog-search"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40" data-testid="select-blog-category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {featuredPost && (
          <Link href={`/blog/${featuredPost.id}`}>
            <Card className="overflow-visible border-none bg-secondary/30 hover-elevate cursor-pointer" data-testid="card-featured-post">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative aspect-video lg:aspect-auto lg:min-h-[360px] rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                  <img
                    src={
                      featuredPost.imageUrl ||
                      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
                    }
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                    data-testid="img-featured-post"
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <Badge variant="secondary" className="backdrop-blur-sm uppercase tracking-widest text-[10px] font-semibold">
                      Featured
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-8 flex flex-col justify-center space-y-6">
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-1.5" data-testid="text-featured-date">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(featuredPost.createdAt!)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {estimateReadTime(featuredPost.content)}
                    </span>
                    {featuredPost.category && (
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                        {featuredPost.category}
                      </Badge>
                    )}
                  </div>

                  <h2 className="text-2xl md:text-3xl font-semibold text-foreground leading-tight tracking-tight" data-testid="text-featured-title">
                    {featuredPost.title}
                  </h2>
                  <p className="text-muted-foreground text-base leading-relaxed line-clamp-3">
                    {featuredPost.content}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    {featuredPost.author && (
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={featuredPost.author.profileImageUrl || undefined} alt={featuredPost.author.username} />
                          <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                            {featuredPost.author.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground" data-testid="text-featured-author">
                            {featuredPost.author.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {featuredPost.author.userRank || "Member"}
                          </span>
                        </div>
                      </div>
                    )}
                    <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                      Read article <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </CardContent>
              </div>
            </Card>
          </Link>
        )}

        {remainingPosts.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">
              {selectedCategory !== "all" ? selectedCategory : "All Articles"}
              <span className="text-muted-foreground font-normal ml-2 text-sm">
                ({remainingPosts.length})
              </span>
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {remainingPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`}>
                  <Card className="overflow-visible hover-elevate cursor-pointer h-full flex flex-col" data-testid={`card-blog-${post.id}`}>
                    <div className="aspect-[16/10] rounded-t-xl overflow-hidden relative">
                      <img
                        src={
                          post.imageUrl ||
                          "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
                        }
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      {post.category && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary" className="backdrop-blur-sm text-[10px] uppercase tracking-wider">
                            {post.category}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5 flex flex-col flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.createdAt!)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {estimateReadTime(post.content)}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-foreground leading-snug tracking-tight line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed flex-1">
                        {post.content}
                      </p>
                      {post.author && (
                        <div className="flex items-center gap-2.5 pt-2 border-t border-border">
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={post.author.profileImageUrl || undefined} alt={post.author.username} />
                            <AvatarFallback className="text-[10px] font-semibold bg-muted text-muted-foreground">
                              {post.author.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-muted-foreground" data-testid={`text-author-${post.id}`}>
                            {post.author.username}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {filteredPosts.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <FileText className="w-12 h-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold text-foreground">No articles found</h3>
            <p className="text-muted-foreground text-sm max-w-md text-center">
              {searchQuery
                ? `No articles match "${searchQuery}". Try a different search term.`
                : "No blog posts have been published yet. Check back soon!"}
            </p>
          </div>
        )}

        {isAdmin && (
          <div className="fixed bottom-8 right-8 z-50">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="icon" className="h-14 w-14 rounded-full shadow-2xl" data-testid="button-create-post">
                  <Pencil className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Create Blog Post
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-5 py-2">
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
                          <SelectItem value="Announcement">Announcement</SelectItem>
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
                      className="min-h-[250px] resize-none"
                      data-testid="input-post-content"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateOpen(false)}
                      data-testid="button-cancel-post"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreatePost}
                      disabled={createPostMutation.isPending || !title || !content}
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
    </div>
  );
}
