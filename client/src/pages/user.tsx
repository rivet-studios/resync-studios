import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Calendar, ChevronRight } from "lucide-react";
import type { User } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const userId = id || currentUser?.id;

  const { data: profile, isLoading } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-8 space-y-6 bg-[#0a0a0a] min-h-screen">
        <Skeleton className="h-48 w-full rounded-2xl bg-white/5" />
        <Skeleton className="h-64 w-full rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (!profile) return <div className="p-8 text-center text-white bg-[#0a0a0a] min-h-screen">User not found</div>;

  const renderBadge = (rank: string, colorClass: string) => (
    <Badge
      key={rank}
      variant="outline"
      className={`rounded-lg px-3 py-1 text-[11px] font-bold border-2 ${colorClass} uppercase tracking-tight shadow-sm`}
    >
      {rank}
    </Badge>
  );

  const getRankBadge = (rank: string) => {
    const badges: Record<string, string> = {
      Lifetime: "border-[#1e3a8a] bg-[#1e3a8a]/20 text-[#3b82f6]",
      "Founders Edition VIP": "border-[#451a03] bg-[#451a03]/20 text-[#f59e0b]",
      "Active Member": "border-[#1e293b] bg-[#1e293b]/20 text-[#94a3b8]",
      "Company Director": "border-[#1e3a8a] bg-[#1e3a8a]/20 text-[#3b82f6]",
      "Operational Manager": "border-[#450a0a] bg-[#450a0a]/20 text-[#ef4444]",
      "Community Moderator": "border-[#064e3b] bg-[#064e3b]/20 text-[#10b981]",
      "Appeals Moderator": "border-[#1e3a8a] bg-[#1e3a8a]/20 text-[#3b82f6]",
      "Customer Relations": "border-[#422006] bg-[#422006]/20 text-[#d97706]",
      "Trusted Member": "border-[#4c1d95] bg-[#4c1d95]/20 text-[#a855f7]",
      "Team Member": "border-[#1e293b] bg-[#1e293b]/20 text-[#94a3b8]",
    };
    return renderBadge(rank, badges[rank] || "border-white/10 bg-white/5 text-white/60");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white/10">
      {/* Mesh Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="max-w-5xl mx-auto w-full px-6 pt-16 pb-24 space-y-10 relative z-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-white/30">
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white/60">{profile.username}</span>
        </div>

        {/* Profile Card */}
        <Card className="bg-[#121212] border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
          <CardContent className="p-10 md:p-14">
            <div className="flex flex-col md:flex-row gap-10 items-start">
              <div className="relative group shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-tr from-white/20 to-transparent rounded-full blur opacity-40 group-hover:opacity-60 transition duration-500" />
                <Avatar className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-[#121212] shadow-2xl relative">
                  <AvatarImage src={profile.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-[#1a1a1a] text-white/20">
                    <UserIcon className="w-16 h-16" />
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 space-y-8">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                      {profile.username}
                    </h1>
                    {profile.vipTier !== "none" && (
                      <div className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-lg shadow-purple-500/20">
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">VIP</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {profile.vipTier !== "none" && getRankBadge("Lifetime")}
                    {profile.vipTier === "founders_edition" && getRankBadge("Founders Edition VIP")}
                    {profile.userRank && getRankBadge(profile.userRank)}
                    {(profile as any).additionalRanks?.map((rank: string) => getRankBadge(rank))}
                    {getRankBadge("Active Member")}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-white/5">
                  <div className="flex items-center gap-3 text-white/40">
                    <div className="p-2 bg-white/5 rounded-lg"><UserIcon className="w-4 h-4" /></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Identity</span>
                      <span className="text-sm font-bold text-white/80">Member since {profile.createdAt ? formatDistanceToNow(new Date(profile.createdAt)) : '5 months'} ago</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-white/40">
                    <div className="p-2 bg-white/5 rounded-lg"><Calendar className="w-4 h-4" /></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Registration</span>
                      <span className="text-sm font-bold text-white/80">Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'October 8, 2025'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signature Card */}
        <Card className="bg-[#121212] border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
          <CardContent className="p-10 md:p-14 space-y-8">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-black uppercase tracking-tighter text-white/90">Signature</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <div className="space-y-6 text-base font-medium text-white/50 leading-relaxed max-w-2xl">
              {profile.signature ? (
                <div className="prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: profile.signature }} />
              ) : (
                <div className="space-y-1">
                  <p className="font-bold text-white/70">{profile.username}</p>
                  <p>Ventura County Board</p>
                  <p>Former QA Team Member</p>
                  <p>RIVET Studios</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
