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
      "https://i.imgur.com/a/car-fire-sbi-resync-studios-project-foxtrot-teaser-AjnovPK.png",
    featured: false,
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

  const isAdmin =
    user?.isAdmin ||
    user?.userRank === "Team Member" ||
    user?.userRank === "Company Director";

  const handleCreatePost = async () => {
    if (!title || !content) return;
    // Implementation would save to database
    setTitle("");
    setContent("");
    setIsCreateOpen(false);
  };

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
                      className="bg-slate-900 text-white hover:bg-slate-800 h-12 px-8 font-bold"
                    >
                      Publish Article
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Featured Post */}
        {blogPosts[0] && (
          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-3xl group cursor-pointer hover:shadow-2xl transition-all duration-500">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="relative h-[300px] lg:h-[450px] overflow-hidden">
                <img
                  src={blogPosts[0].image}
                  alt={blogPosts[0].title}
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
                    {blogPosts[0].title}
                  </h2>
                  <p className="text-slate-500 text-lg leading-relaxed font-medium">
                    {blogPosts[0].excerpt}
                  </p>
                </div>
                <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {blogPosts[0].author}
                      </p>
                      <p className="text-xs font-bold text-slate-400">
                        Founder
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-black text-slate-900">
                      {blogPosts[0].date}
                    </p>
                    <p className="text-xs font-bold text-slate-400">
                      {blogPosts[0].readTime} min read
                    </p>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        )}

        {/* Latest Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map((post) => (
            <Card
              key={post.id}
              className="border-none shadow-sm bg-white hover:shadow-xl transition-all duration-300 group cursor-pointer rounded-2xl overflow-hidden"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <CardContent className="p-6 space-y-4">
                <h4 className="text-xl font-bold text-slate-900 line-clamp-2 leading-snug">
                  {post.title}
                </h4>
                <p className="text-slate-500 text-sm line-clamp-3 font-medium leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest">
                    {post.date}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {post.readTime} MIN READ
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
