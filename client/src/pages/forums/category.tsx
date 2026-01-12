import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, User as UserIcon, ChevronLeft } from "lucide-react";
import type { ForumCategory, ForumThread, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

export default function ForumCategoryPage() {
  const { id } = useParams<{ id: string }>();

  const { data: category } = useQuery<ForumCategory>({
    queryKey: [`/api/forums/categories/${id}`],
    enabled: !!id,
  });

  const { data: threads, isLoading } = useQuery<(ForumThread & { author: User })[]>({
    queryKey: ["/api/forums/threads", { categoryId: id }],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-slate-100 rounded" />
        <div className="h-10 w-full bg-slate-100 rounded-xl" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 w-full bg-slate-50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/forums">
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{category?.name || "Category"}</h1>
          <p className="text-slate-500">{category?.description || "Browse discussions in this category"}</p>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="divide-y divide-slate-100">
          {threads?.map((thread) => (
            <div key={thread.id} className="p-5 flex items-start gap-5 hover:bg-slate-50/50 transition-colors group">
              <Avatar className="w-10 h-10 border-2 border-white shadow-sm flex-shrink-0">
                <AvatarImage src={thread.author?.profileImageUrl || undefined} />
                <AvatarFallback className="bg-slate-100 text-slate-500">
                  <UserIcon className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0 space-y-1">
                <Link href={`/forums/thread/${thread.id}`}>
                  <h3 className="font-bold text-lg text-slate-900 leading-tight group-hover:text-slate-700 transition-colors cursor-pointer truncate">
                    {thread.title}
                  </h3>
                </Link>
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    Started by <span className="font-semibold text-slate-700">{thread.author?.username}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDistanceToNow(new Date(thread.createdAt!), { addSuffix: true })}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <div className="flex items-center gap-1 text-slate-400">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-bold">{thread.replyCount}</span>
                </div>
                {thread.isPinned && <Badge className="bg-amber-50 text-amber-600 border-amber-100 text-[10px] px-1.5">PINNED</Badge>}
              </div>
            </div>
          ))}
          
          {threads?.length === 0 && (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-slate-500">No discussions found in this category.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/forums/new">Start a Discussion</Link>
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
