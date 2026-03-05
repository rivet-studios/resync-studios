import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, User, Eye, MessageSquare, Clock, Heart, Share2, Send, Loader2 } from "lucide-react";
import type { Announcement } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function News() {
  const { id } = useParams<{ id: string }>();

  const { data: post, isLoading } = useQuery<Announcement>({
    queryKey: ["/api/blog", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] pt-20">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <Skeleton className="h-12 w-3/4 bg-white/5" />
          <Skeleton className="h-[400px] w-full rounded-[2.5rem] bg-white/5" />
          <Skeleton className="h-64 w-full bg-white/5" />
        </div>
      </div>
    );
  }

  if (!post) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white/40">Article not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white/10">
      {/* Mesh Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-32 space-y-12 relative z-10">
        {/* Header Section */}
        <div className="space-y-8">
          <div className="space-y-4">
            <Badge className="bg-white/5 text-white/40 border-white/10 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Featured Post</Badge>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight text-white">{post.title}</h1>
            <p className="text-white/40 text-xl font-medium leading-relaxed">A first look at our brand new digital ecosystem.</p>
          </div>

          <div className="flex flex-wrap items-center gap-8 pt-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-white/5">
                <img src="/attached_assets/logo.svg" alt="RS" className="w-5 h-5 invert opacity-60" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase tracking-widest text-white">David</span>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Founder</span>
              </div>
            </div>
            <div className="h-8 w-px bg-white/5 hidden sm:block" />
            <div className="flex items-center gap-6 text-[12px] font-bold text-white/30 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(post.createdAt!).toLocaleDateString()}</span>
              <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> 2.4K views</span>
              <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> 12 comments</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 3 min read</span>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="aspect-video rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 group relative">
          <img
            src={post.imageUrl || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Content Section */}
        <div className="prose prose-invert prose-lg max-w-none space-y-8 text-white/60 leading-relaxed font-medium">
          {post.content.split('\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {/* Reactions */}
        <div className="flex items-center gap-3 py-12 border-y border-white/5">
          {[
            { icon: Heart, count: 27, color: "text-red-500" },
            { icon: Send, count: 12, color: "text-blue-500" },
            { icon: Share2, count: 4, color: "text-green-500" }
          ].map((react, i) => (
            <button key={i} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all active:scale-95 group">
              <react.icon className={`w-4 h-4 ${react.color} opacity-70 group-hover:opacity-100`} />
              <span className="text-xs font-black">{react.count}</span>
            </button>
          ))}
        </div>

        {/* Recently Viewed */}
        <div className="space-y-6 pt-12">
           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Recently viewed</h4>
           <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                   <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-white/60">User {i+1}</span>
                      <span className="text-[8px] font-medium text-white/20 uppercase tracking-tighter">about 2 hours ago</span>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-12 pt-20">
          <div className="flex items-center gap-4">
            <MessageSquare className="w-6 h-6 text-white/40" />
            <h3 className="text-2xl font-black uppercase tracking-tight">Comments (12)</h3>
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <Textarea 
                placeholder="Share your thoughts..." 
                className="bg-white/5 border-white/10 rounded-[2rem] min-h-[160px] p-8 text-white font-medium resize-none focus:bg-white/[0.08] transition-all"
              />
              <Button className="absolute bottom-6 right-6 bg-white text-black font-black uppercase tracking-widest px-8 rounded-xl hover:bg-white/90 shadow-xl transition-all active:scale-95">Post comment</Button>
            </div>

            <div className="space-y-8 pt-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-6 group">
                  <Avatar className="w-12 h-12 border-2 border-white/5 shadow-xl">
                    <AvatarFallback className="bg-white/5 text-white/20 font-bold">U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-white">Guest User</span>
                        <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase rounded">Founders Edition VIP</span>
                      </div>
                      <span className="text-[10px] font-bold text-white/20 uppercase">Feb 27, 2026 12:45 PM</span>
                    </div>
                    <p className="text-white/60 font-medium leading-relaxed">Wow, this looks amazing! Can't wait for the new update to drop. The team has been working really hard on this.</p>
                    <div className="flex items-center gap-6">
                       <button className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">Reply</button>
                       <div className="flex items-center gap-3">
                          <Heart className="w-3 h-3 text-white/20 cursor-pointer hover:text-red-500 transition-colors" />
                          <MessageSquare className="w-3 h-3 text-white/20 cursor-pointer hover:text-blue-500 transition-colors" />
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}