import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Calendar, ChevronRight, Flag } from "lucide-react";
import type { User } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { ReportDialog } from "@/components/report-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { VipBadge } from "@/components/vip-badge";
import { rankConfig } from "@/components/user-rank-badge";

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
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground" data-testid="text-user-not-found">User not found</p>
      </div>
    );
  }

  const vipBadgeStyles: Record<string, string> = {
    "Lifetime": "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
    "Founders Edition VIP": "border-red-500 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30",
    "Diamond VIP": "border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30",
    "Sapphire VIP": "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30",
    "Bronze VIP": "border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  };

  const rankBadgeStyles: Record<string, string> = {
    "Company Director": "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
    "Operations Manager": "border-red-500 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30",
    "Moderator": "border-green-500 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30",
    "Administrator": "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30",
    "Senior Administrator": "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
    "Developer": "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30",
    "Trial Moderator": "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/30",
    "Team Member": "border-gray-400 bg-gray-50 text-gray-600 dark:bg-white/5 dark:text-white/60 dark:border-white/10",
    "Active Member": "border-gray-300 bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-white/50 dark:border-white/10",
    "Trusted Member": "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/30",
    "Customer Relations": "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30",
    "Appeals Moderator": "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30",
    "Staff Internal Affairs": "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30",
    "Staff Department Director": "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  };

  const getVipLabel = (tier: string) => {
    if (tier === "founders_edition") return "Founders Edition VIP";
    if (tier === "diamond") return "Diamond VIP";
    if (tier === "sapphire") return "Sapphire VIP";
    if (tier === "bronze") return "Bronze VIP";
    if (tier === "lifetime") return "Lifetime";
    return null;
  };

  const vipLabel = getVipLabel(profile.vipTier || "");
  const defaultStyle = "border-gray-300 bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-white/50 dark:border-white/10";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors" data-testid="link-breadcrumb-dashboard">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium" data-testid="text-breadcrumb-username">{profile.username}</span>
        </div>
        {currentUser && currentUser.id !== profile.id && (
          <ReportDialog
            targetId={profile.id}
            targetType="user"
            trigger={
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" data-testid="button-report-user">
                <Flag className="w-3.5 h-3.5" />
                Report
              </Button>
            }
          />
        )}
      </div>

      <Card className="border border-border/50 dark:border-white/5 rounded-xl overflow-hidden shadow-sm" data-testid="card-profile">
        <CardContent className="p-8 md:p-10">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Avatar className="w-24 h-24 rounded-full border-2 border-border/30 dark:border-white/10 shrink-0" data-testid="img-avatar">
              <AvatarImage src={profile.profileImageUrl || undefined} />
              <AvatarFallback className="bg-muted text-muted-foreground">
                <UserIcon className="w-10 h-10" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                {(() => {
                  const rc = rankConfig[profile.userRank || ""];
                  const isLifetime = profile.userRank === "Lifetime" && rc?.isGradient;
                  return (
                    <h1
                      className="text-2xl sm:text-3xl font-bold"
                      style={isLifetime ? {
                        color: "transparent",
                        backgroundImage: rc.gradient,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                      } : { color: "var(--foreground)" }}
                      data-testid="text-username"
                    >
                      {profile.username}
                    </h1>
                  );
                })()}
                {profile.vipTier && profile.vipTier !== "none" && (
                  <VipBadge tier={profile.vipTier as any} size="md" />
                )}
              </div>

              <div className="flex flex-wrap gap-2" data-testid="container-badges">
                {vipLabel && (
                  <Badge
                    variant="outline"
                    className={`rounded-md px-2.5 py-0.5 text-xs font-semibold border ${vipBadgeStyles[vipLabel] || defaultStyle}`}
                    data-testid={`badge-vip-tier`}
                  >
                    {vipLabel}
                  </Badge>
                )}
                {profile.vipTier === "Founders Edition VIP" && (
                  <Badge
                    variant="outline"
                    className={`rounded-md px-2.5 py-0.5 text-xs font-semibold border ${vipBadgeStyles["Founders Edition VIP"]}`}
                    data-testid="badge-founders"
                  >
                    Founders Edition VIP
                  </Badge>
                )}
                {profile.userRank && profile.userRank !== "Active Members" && (
                  <Badge
                    variant="outline"
                    className={`rounded-md px-2.5 py-0.5 text-xs font-semibold border ${rankBadgeStyles[profile.userRank] || defaultStyle}`}
                    data-testid="badge-rank"
                  >
                    {profile.userRank}
                  </Badge>
                )}
                {(profile as any).additionalRanks?.map((rank: string) => (
                  <Badge
                    key={rank}
                    variant="outline"
                    className={`rounded-md px-2.5 py-0.5 text-xs font-semibold border ${rankBadgeStyles[rank] || defaultStyle}`}
                    data-testid={`badge-additional-${rank}`}
                  >
                    {rank}
                  </Badge>
                ))}
                <Badge
                  variant="outline"
                  className={`rounded-md px-2.5 py-0.5 text-xs font-semibold border ${defaultStyle}`}
                  data-testid="badge-active"
                >
                  Active Member
                </Badge>
              </div>

              <div className="flex flex-col gap-1.5 pt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2" data-testid="text-member-since">
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Member since {profile.createdAt ? formatDistanceToNow(new Date(profile.createdAt)) : "recently"} ago</span>
                </div>
                <div className="flex items-center gap-2" data-testid="text-joined-date">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "recently"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/50 dark:border-white/5 rounded-xl overflow-hidden shadow-sm" data-testid="card-signature">
        <CardContent className="p-8 md:p-10 space-y-4">
          <h3 className="text-lg font-bold text-foreground" data-testid="heading-signature">Signature</h3>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-1">
            {profile.signature ? (
              <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: profile.signature }} />
            ) : (
              <div className="space-y-0.5">
                <p className="font-medium text-foreground">{profile.username}</p>
                <p>RIVET Studios</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
