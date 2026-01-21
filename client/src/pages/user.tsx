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
import { getDate } from "date-fns";

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
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!profile) return <div className="p-8 text-center">User not found</div>;

  const isOwnProfile = currentUser?.id === profile.id;

  // Rank visibility logic
  const renderRank = (rank: string | null | undefined) => {
    if (!rank || rank === "None" || rank === "Member") return null;

    const rankColors: Record<string, string> = {
      "Lifetime": "border-blue-200 bg-blue-50 text-blue-600",
      "Founders Edition VIP": "border-amber-200 bg-amber-50 text-amber-600",
      "Community Senior Administrator": "border-red-200 bg-red-50 text-red-600",
      "Staff Internal Affairs": "border-slate-200 bg-slate-50 text-slate-600",
      "Staff Department Director": "border-pink-200 bg-pink-50 text-pink-600",
      "Community Moderator": "border-emerald-200 bg-emerald-50 text-emerald-600",
      "Appeals Moderator": "border-cyan-200 bg-cyan-50 text-cyan-600",
      "Trusted Member": "border-purple-200 bg-purple-50 text-purple-600",
      "Active Member": "border-slate-200 bg-slate-50 text-slate-500",
    };

    const colorClass = rankColors[rank] || "border-slate-200 bg-white text-slate-600";

    return (
      <Badge
        variant="outline"
        className={`rounded-full px-3 py-0.5 text-[10px] font-bold border ${colorClass} shadow-sm`}
      >
        {rank
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l: string) => l.toUpperCase())}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pt-12">
      <div className="max-w-5xl mx-auto w-full px-4 space-y-8 animate-in fade-in duration-700 pb-20">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground transition-colors">Dashboard</Link>
          <span className="opacity-40">/</span>
          <span className="text-foreground font-semibold">{profile.username}</span>
        </div>

        {/* Profile Header Card */}
        <Card className="border border-border/50 bg-card shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <Avatar className="w-32 h-32 rounded-full border-4 border-background shadow-xl shrink-0">
                <AvatarImage src={profile.profileImageUrl || undefined} />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <UserIcon className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {profile.username}
                  </h1>
                  {profile.vipTier !== "none" && (
                    <Badge className="bg-slate-900 text-white font-black rounded px-2 py-0.5 text-[10px] shadow-sm uppercase tracking-tighter">
                      VIP
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {renderRank(profile.vipTier !== "none" ? profile.vipTier : null)}
                  {renderRank(profile.userRank)}
                  {(profile as any).additionalRanks?.map((rank: string) => (
                    <span key={rank}>{renderRank(rank)}</span>
                  ))}
                  {profile.isAdmin && renderRank("Administrator")}
                </div>

                <div className="space-y-4 pt-4 border-t border-border/50">
                   <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <UserIcon className="w-4 h-4 opacity-50" />
                    <span>Member since 12 months ago</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <Calendar className="w-4 h-4 opacity-50" />
                    <span>Joined {profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "January 26, 2025"}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signature Card */}
        <Card className="border border-border/50 bg-card shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <h3 className="text-xl font-bold text-foreground">Signature</h3>
            <div className="space-y-4 text-sm text-foreground font-semibold italic">
               <p>{profile.username},</p>
               <p>{profile.signature || "Staff Director"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
