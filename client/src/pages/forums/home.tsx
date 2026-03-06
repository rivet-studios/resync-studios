import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, ChevronRight, Clock, User as UserIcon, Star } from "lucide-react";
import type { ForumCategory, ForumThread, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function ForumHome() {
  const { data: categories = [] } = useQuery<ForumCategory[]>({
    queryKey: ["/api/forums/categories"],
  });

  const { data: threads = [] } = useQuery<(ForumThread & { author: User; category: ForumCategory })[]>({
    queryKey: ["/api/forums/threads"],
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-12">
      <div className="max-w-7xl mx-auto p-6 sm:p-10 space-y-12 animate-in fade-in duration-700 pb-24">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight text-white uppercase">Forums</h1>
          <p className="text-white/40 font-medium">Connect with our community and get support</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Sidebar Categories */}
          <aside className="lg:col-span-3 space-y-6">
            <Card className="border-white/5 bg-[#121212] rounded-xl overflow-hidden shadow-2xl">
              <CardHeader className="bg-white/[0.02] border-b border-white/5 p-8">
                <CardTitle className="text-sm font-semibold uppercase tracking-widest text-white/90">
                  News & Information
                </CardTitle>
                <p className="text-[11px] font-bold text-white/20 mt-1 uppercase tracking-wider">{threads?.length || 0} posts</p>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Link href="/forums">
                    <button className="w-full flex items-center gap-4 px-6 py-4 rounded-lg text-[13px] font-bold text-white/40 hover:bg-white/[0.03] hover:text-white transition-all group">
                      <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white transition-colors" />
                      All Discussions
                    </button>
                  </Link>
                  {categories?.map((cat) => (
                    <Link key={cat.id} href={`/forums/category/${cat.id}`}>
                      <button className="w-full flex items-center gap-4 px-6 py-4 rounded-lg text-[13px] font-bold text-white/40 hover:bg-white/[0.03] hover:text-white transition-all group">
                        <div 
                          className="w-2 h-2 rounded-full opacity-40 group-hover:opacity-100 transition-all" 
                          style={{ backgroundColor: cat.color || '#fff' }}
                        />
                        {cat.name}
                      </button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button asChild className="w-full h-14 bg-white text-black hover:bg-white/90 shadow-xl rounded-lg font-semibold uppercase tracking-tight transition-transform active:scale-95">
              <Link href="/forums/new">
                <Plus className="w-5 h-5 mr-2" strokeWidth={3} /> Start Discussion
              </Link>
            </Button>
          </aside>

          {/* Main Thread List */}
          <div className="lg:col-span-9 space-y-4">
            <Card className="border-white/5 bg-[#121212] rounded-xl overflow-hidden shadow-2xl">
              <div className="divide-y divide-white/5">
                {threads?.map((thread) => (
                  <div key={thread.id} className="p-8 flex items-center gap-6 hover:bg-white/[0.02] transition-all group cursor-pointer">
                    <Avatar className="w-12 h-12 border-2 border-white/5 shadow-xl flex-shrink-0">
                      <AvatarImage src={thread.author?.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-white/5 text-white/20">
                        <UserIcon className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        {thread.isPinned && <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />}
                        <Link href={`/forums/thread/${thread.id}`}>
                          <h3 className="font-bold text-lg text-white/90 leading-tight group-hover:text-white transition-colors truncate">
                            {thread.title}
                          </h3>
                        </Link>
                      </div>
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-[12px] font-bold uppercase tracking-wider text-white/30">
                        <span className="flex items-center gap-1.5">
                          Started by <span className="text-white/60 hover:text-white transition-colors">{thread.author?.username}</span>
                        </span>
                        <span className="flex items-center gap-1.5 opacity-60">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDistanceToNow(new Date(thread.createdAt!), { addSuffix: true })}
                        </span>
                        {thread.category && (
                          <div 
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold border border-white/5 bg-white/[0.03] transition-colors hover:bg-white/10"
                            style={{ color: thread.category.color || '#666' }}
                          >
                            {thread.category.name}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="flex items-center gap-2 text-white/20">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm font-semibold">{thread.replyCount}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-white/40 transition-all group-hover:translate-x-1" />
                    </div>
                  </div>
                ))}
                
                {threads?.length === 0 && (
                  <div className="p-24 text-center space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5 shadow-inner">
                      <MessageSquare className="w-10 h-10 text-white/10" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-semibold text-white/80 uppercase tracking-tight">No discussions yet</p>
                      <p className="text-white/30 font-medium">Be the first to start a conversation with the community!</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
