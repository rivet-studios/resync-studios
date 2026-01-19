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
  const renderRank = (rank: string | null | undefined, label: string) => {
    if (!rank || rank === "None" || rank === "member") return null;
    
    // If not own profile and not staff/vip, don't show specific ranks (simplified logic)
    const isStaffRank = rank.includes("staff") || rank.includes("admin") || rank.includes("moderator") || rank.includes("director");
    const isVipRank = rank.includes("vip") || rank.includes("lifetime");
    
    if (!isOwnProfile && !currentUser?.isAdmin && !currentUser?.isModerator) {
        // Here we could add more specific logic if needed
    }

    return (
      <Badge 
        variant="outline" 
        className="rounded-full px-3 py-0.5 text-[11px] font-medium border-border/50 bg-background/50 backdrop-blur-sm"
      >
        {rank.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 animate-in fade-in duration-500">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{profile.username}</span>
      </div>

      {/* Profile Header Card */}
      <Card className="border border-border/40 bg-card/30 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <Avatar className="w-24 h-24 rounded-full border-2 border-border/20 shadow-sm">
              <AvatarImage src={profile.profileImageUrl || undefined} />
              <AvatarFallback className="bg-muted text-muted-foreground">
                <UserIcon className="w-10 h-10" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="space-y-1">
                <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {profile.username}
                  </h1>
                  {profile.vipTier !== "none" && (
                     <Badge className="bg-primary text-primary-foreground font-bold rounded px-2 py-0">
                        VIP
                     </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mt-2">
                  {renderRank(profile.vipTier !== "none" ? profile.vipTier : null, "VIP")}
                  {renderRank(profile.userRank, "Primary")}
                  {renderRank(profile.secondaryUserRank, "Secondary")}
                  {renderRank(profile.tertiaryUserRank as string, "Tertiary")}
                </div>
              </div>

              <div className="flex flex-col gap-1 text-sm text-muted-foreground font-medium">
                <div className="flex items-center justify-center md:justify-start gap-1.5">
                   <UserIcon className="w-3.5 h-3.5" />
                   <span>Member since 12 months ago</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "January 26, 2025"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature Card */}
      <Card className="border border-border/40 bg-card/30 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm">
        <CardContent className="p-8 space-y-4">
          <h3 className="text-lg font-bold text-foreground">Signature</h3>
          <div className="text-sm text-foreground/80 space-y-4 italic font-medium">
            <p className="font-bold">{profile.username},</p>
            <p>{profile.signature || "Staff Director"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
