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
import { Plus, Calendar, User, Loader2, MessageSquare, Eye, Clock } from "lucide-react";
import type { Announcement } from "@shared/schema";
import { Link } from "wouter";

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
      <div className="flex items-center justify-center min-h-screen bg-[#050505]">
        <Loader2 className="w-8 h-8 animate-spin text-white/20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-20">
      <div className="max-w-7xl mx-auto px-6 space-y-16 pb-32">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter uppercase text-white">Blog</h1>
          <p className="text-white/40 text-lg font-medium">Browse our latest blog posts and articles</p>
        </div>

        {/* Featured Post */}
        {posts.length > 0 && (
          <div className="group relative">
            <Link href={`/blog/${posts[0].id}`}>
              <Card className="border-none bg-transparent overflow-hidden cursor-pointer">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
                    <img
                      src={posts[0].imageUrl || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"}
                      alt={posts[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-8 left-8 z-20">
                      <Badge className="bg-white/10 backdrop-blur-xl text-white font-black px-4 py-1.5 rounded-full border border-white/10 uppercase tracking-widest text-[10px]">
                        Featured
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-0 space-y-8">
                    <div className="space-y-6">
                      <div className="flex flex-wrap items-center gap-6 text-[12px] font-bold uppercase tracking-[0.2em] text-white/30">
                        <span className="flex items-center gap-2">
                          {new Date(posts[0].createdAt!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> 2.4K views</span>
                        <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> 12 comments</span>
                        <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 3 min read</span>
                      </div>
                      
                      <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter">
                        {posts[0].title}
                      </h2>
                      <p className="text-white/40 text-xl font-medium leading-relaxed line-clamp-3">
                        {posts[0].content}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-white/5 shadow-xl">
                        <img src="/attached_assets/logo.svg" alt="RS" className="w-5 h-5 invert opacity-60" />
                      </div>
                      <span className="text-sm font-black uppercase tracking-widest text-white/80">David</span>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Link>
          </div>
        )}

        {/* Latest Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 pt-12 border-t border-white/5">
          {posts.slice(1).map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`}>
              <Card className="border-none bg-transparent hover:translate-y-[-8px] transition-all duration-500 group cursor-pointer space-y-6">
                <div className="aspect-[16/10] rounded-[2rem] overflow-hidden shadow-xl relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                  <img
                    src={post.imageUrl || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <CardContent className="p-0 space-y-4">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/20">
                    <span>{new Date(post.createdAt!).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>5 min read</span>
                  </div>
                  <h4 className="text-2xl font-black text-white leading-snug tracking-tight line-clamp-2 group-hover:text-white/80 transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-white/30 text-base font-medium line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {isAdmin && (
          <div className="fixed bottom-12 right-12 z-50">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="h-16 w-16 rounded-full bg-white text-black hover:bg-white/90 shadow-2xl active:scale-90 transition-all">
                  <Plus className="w-8 h-8" strokeWidth={3} />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-[#121212] border-white/5 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight">Create Blog Post</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Title</label>
                    <Input
                      placeholder="Post title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-white/5 border-white/10 h-14 text-white font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Content</label>
                    <Textarea
                      placeholder="Write your article here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="bg-white/5 border-white/10 min-h-[300px] text-white font-medium resize-none"
                    />
                  </div>
                  <Button
                    onClick={handleCreatePost}
                    disabled={createPostMutation.isPending}
                    className="w-full h-14 bg-white text-black font-black uppercase tracking-widest hover:bg-white/90"
                  >
                    {createPostMutation.isPending ? "Publishing..." : "Publish Article"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}
