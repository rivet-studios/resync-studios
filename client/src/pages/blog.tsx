import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Calendar, User } from "lucide-react";

const blogPosts = [
  {
    id: "1",
    title:
      "Introducing Our New Website - Bigger, Better, and Built for the Future",
    excerpt:
      "After more than 12 months of work, we are finally ready to share our new website along with a new subscription system, new integrations, and a look at what is coming next.",
    author: "cxiqlne",
    date: "Dec 19, 2025",
    image:
      "https://imgur.com/a/car-fire-sbi-resync-studios-project-foxtrot-teaser-AjnovPK",
    featured: true,
    readTime: 10,
    views: 156,
    comments: 12,
  },
];

export default function Blog() {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const isAdmin = user?.id === "5c708d95-6933-4754-830a-0b0c6ebf13a9"; // Admin user ID

  const handleCreatePost = async () => {
    if (!title || !content) return;
    // Implementation would save to database
    setTitle("");
    setContent("");
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Blog</h1>
            <p className="text-muted-foreground mt-2">
              Browse our latest blog posts and articles
            </p>
          </div>
          {isAdmin && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-post">
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Blog Post</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      placeholder="Post title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      data-testid="input-post-title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Content</label>
                    <Textarea
                      placeholder="Post content..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={6}
                      data-testid="textarea-post-content"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreatePost}
                      data-testid="button-publish"
                    >
                      Publish
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Featured Post */}
      {blogPosts[0] && (
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-3 gap-0">
            <div className="md:col-span-1 h-48 md:h-auto">
              <img
                src={blogPosts[0].image}
                alt={blogPosts[0].title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="md:col-span-2 p-6">
              <Badge className="mb-3">Featured</Badge>
              <h2 className="text-2xl font-bold mb-3">{blogPosts[0].title}</h2>
              <p className="text-muted-foreground mb-4">
                {blogPosts[0].excerpt}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {blogPosts[0].author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {blogPosts[0].date}
                </div>
                <div>{blogPosts[0].readTime} min read</div>
              </div>
            </CardContent>
          </div>
        </Card>
      )}

      {/* All Posts */}
      <div>
        <h3 className="text-xl font-bold mb-4">Latest Articles</h3>
        <div className="space-y-3">
          {blogPosts.map((post) => (
            <Card
              key={post.id}
              className="hover:bg-card/80 transition-colors cursor-pointer"
            >
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">{post.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </div>
                  <div>{post.readTime} min read</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
