import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Loader2 } from "lucide-react";
import type { Announcement } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface BlogPost extends Announcement {
  author: { id: string; username: string; userRank: string; profileImageUrl: string | null } | null;
}

function estimateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export default function News() {
  const { id } = useParams<{ id: string }>();

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ["/api/blog", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] pt-20">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <Skeleton className="h-12 w-3/4 bg-white/5" />
          <Skeleton className="h-[400px] w-full rounded-xl bg-white/5" />
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
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-32 space-y-12 relative z-10">
        <div className="space-y-8">
          <div className="space-y-4">
            <Badge className="bg-white/5 text-white/40 border-white/10 px-4 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em]">
              {post.category || "Blog Post"}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight text-white" data-testid="text-post-title">
              {post.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-8 pt-4 border-t border-white/5">
            {post.author && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 overflow-hidden">
                  {post.author.profileImageUrl ? (
                    <img src={post.author.profileImageUrl} alt={post.author.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold text-white/40">
                      {post.author.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold uppercase tracking-widest text-white" data-testid="text-post-author">
                    {post.author.username}
                  </span>
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    {post.author.userRank || "Member"}
                  </span>
                </div>
              </div>
            )}
            <div className="h-8 w-px bg-white/5 hidden sm:block" />
            <div className="flex items-center gap-6 text-[12px] font-bold text-white/30 uppercase tracking-widest">
              <span className="flex items-center gap-2" data-testid="text-post-date">
                <Calendar className="w-4 h-4" /> {new Date(post.createdAt!).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> {estimateReadTime(post.content)}
              </span>
            </div>
          </div>
        </div>

        {post.imageUrl && (
          <div className="aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/5 group relative">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              data-testid="img-post-hero"
            />
          </div>
        )}

        <div className="prose prose-invert prose-lg max-w-none space-y-8 text-white/60 leading-relaxed font-medium" data-testid="text-post-content">
          {post.content.split('\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
