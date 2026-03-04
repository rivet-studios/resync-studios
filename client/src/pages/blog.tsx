import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
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
import { Plus, Calendar, User, Loader2 } from "lucide-react";
import type { Announcement } from "@shared/schema";

export default function Blog() {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: posts = [], isLoading } = useQuery<Announcement[]>({
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
    },
  });

  const isAdmin =
    user?.isAdmin ||
    user?.userRank === "Team Member" ||
    user?.userRank === "Company Director";

  const handleCreatePost = () => {
    if (!title || !content) return;
    createPostMutation.mutate({ title, content, category: "General" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30">
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Latest News
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              Stay updated with the latest from RIVET Studios™
            </p>
          </div>
          {isAdmin && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg px-6 h-12 font-bold">
                  <Plus className="w-5 h-5 mr-2" />
                  New Article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-white/90 backdrop-blur-xl border-none shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    Create Blog Post
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-slate-400">
                      Title
                    </label>
                    <Input
                      placeholder="Post title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-12 border-slate-200 text-lg font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-slate-400">
                      Content
                    </label>
                    <Textarea
                      placeholder="Write your article here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[300px] border-slate-200 resize-none text-base font-medium"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setIsCreateOpen(false)}
                      className="h-12 px-6 font-bold"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreatePost}
                      disabled={createPostMutation.isPending}
                      className="bg-slate-900 text-white hover:bg-slate-800 h-12 px-8 font-bold"
                    >
                      {createPostMutation.isPending ? "Publishing..." : "Publish Article"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Featured Post */}
        {posts.length > 0 && (
          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-3xl group cursor-pointer hover:shadow-2xl transition-all duration-500">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="relative h-[300px] lg:h-[450px] overflow-hidden">
                <img
                  src={posts[0].imageUrl || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"}
                  alt={posts[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-6 left-6">
                  <Badge className="bg-white/90 backdrop-blur-md text-slate-900 font-black px-4 py-1 rounded-full shadow-sm">
                    FEATURED
                  </Badge>
                </div>
              </div>
              <CardContent className="p-8 lg:p-12 flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h2 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
                    {posts[0].title}
                  </h2>
                  <p className="text-slate-500 text-lg leading-relaxed font-medium line-clamp-4">
                    {posts[0].content}
                  </p>
                </div>
                <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        Admin
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-black text-slate-900">
                      {new Date(posts[0].createdAt!).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        )}

        {/* Latest Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(1).map((post) => (
            <Card
              key={post.id}
              className="border-none shadow-sm bg-white hover:shadow-xl transition-all duration-300 group cursor-pointer rounded-2xl overflow-hidden"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={post.imageUrl || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <CardContent className="p-6 space-y-4">
                <h4 className="text-xl font-bold text-slate-900 line-clamp-2 leading-snug">
                  {post.title}
                </h4>
                <p className="text-slate-500 text-sm line-clamp-3 font-medium leading-relaxed">
                  {post.content}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest">
                    {new Date(post.createdAt!).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
