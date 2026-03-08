import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  User as UserIcon,
  Calendar,
  ChevronRight,
  Flag,
  MessageSquare,
  Eye,
  Clock,
  FileText,
  Shield,
  PenLine,
} from "lucide-react";
import type { User, ForumThread } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { ReportDialog } from "@/components/report-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { formatDistanceToNow, format } from "date-fns";
import { VipBadge } from "@/components/vip-badge";
import { rankConfig } from "@/components/user-rank-badge";

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const userId = id || currentUser?.id;

  const { data: profile, isLoading } = useQuery<User>({
    queryKey: ["/api/users", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
    enabled: !!userId,
  });

  const { data: allThreads } = useQuery<
    (ForumThread & { author?: User; category?: { name: string } })[]
  >({
    queryKey: ["/api/forums/threads"],
    enabled: !!userId,
  });

  const userThreads =
    allThreads
      ?.filter((t) => t.authorId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      )
      .slice(0, 5) || [];

  const totalPosts =
    allThreads?.filter((t) => t.authorId === userId).length || 0;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full rounded-md" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
        <Skeleton className="h-48 w-full rounded-md" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <UserIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <p
          className="text-muted-foreground text-lg"
          data-testid="text-user-not-found"
        >
          User not found
        </p>
      </div>
    );
  }

  const vipBadgeStyles: Record<string, string> = {
    Lifetime:
      "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
    "Founders Edition VIP":
      "border-red-500 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30",
    "Diamond VIP":
      "border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30",
    "Sapphire VIP":
      "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30",
    "Bronze VIP":
      "border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  };

  const rankBadgeStyles: Record<string, string> = {
    "Company Director":
      "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
    "Operations Manager":
      "border-red-500 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30",
    Moderator:
      "border-green-500 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30",
    Administrator:
      "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30",
    "Senior Administrator":
      "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
    Developer:
      "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30",
    "Trial Moderator":
      "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/30",
    "Team Member":
      "border-gray-400 bg-gray-50 text-gray-600 dark:bg-white/5 dark:text-white/60 dark:border-white/10",
    "Active Member":
      "border-gray-300 bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-white/50 dark:border-white/10",
    "Trusted Member":
      "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/30",
    "Customer Relations":
      "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30",
    "Appeals Moderator":
      "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30",
    "Staff Internal Affairs":
      "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30",
    "Staff Department Director":
      "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
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
  const defaultStyle =
    "border-gray-300 bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-white/50 dark:border-white/10";

  const rc = rankConfig[profile.userRank || ""];
  const isLifetimeGradient = profile.userRank === "Lifetime" && rc?.isGradient;

  const joinDate = profile.createdAt ? new Date(profile.createdAt) : null;
  const memberDuration = joinDate ? formatDistanceToNow(joinDate) : "recently";
  const joinDateFormatted = joinDate
    ? format(joinDate, "MMMM d, yyyy")
    : "Unknown";

  const isStaff = profile.isModerator || profile.isAdmin;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/dashboard"
            className="hover:text-foreground transition-colors"
            data-testid="link-breadcrumb-dashboard"
          >
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span
            className="text-foreground font-medium"
            data-testid="text-breadcrumb-username"
          >
            {profile.username}
          </span>
        </div>
        {currentUser && currentUser.id !== profile.id && (
          <ReportDialog
            targetId={profile.id}
            targetType="user"
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                data-testid="button-report-user"
              >
                <Flag className="w-3.5 h-3.5" />
                Report
              </Button>
            }
          />
        )}
      </div>

      <Card data-testid="card-profile">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative shrink-0">
              <Avatar
                className="w-28 h-28 md:w-32 md:h-32 border-2 border-border"
                data-testid="img-avatar"
              >
                <AvatarImage src={profile.profileImageUrl || undefined} />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <UserIcon className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              {isStaff && (
                <div
                  className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5"
                  data-testid="indicator-staff"
                >
                  <Shield className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1
                  className="text-3xl sm:text-4xl font-bold tracking-tight"
                  style={
                    isLifetimeGradient
                      ? {
                          color: "transparent",
                          backgroundImage: rc.gradient,
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                        }
                      : { color: "var(--foreground)" }
                  }
                  data-testid="text-username"
                >
                  {profile.username}
                </h1>
                {profile.vipTier && profile.vipTier !== "none" && (
                  <VipBadge tier={profile.vipTier as any} size="lg" />
                )}
              </div>

              {profile.bio && (
                <p
                  className="text-sm text-muted-foreground max-w-lg"
                  data-testid="text-bio"
                >
                  {profile.bio}
                </p>
              )}

              <div
                className="flex flex-wrap gap-2 justify-center md:justify-start"
                data-testid="container-badges"
              >
                {vipLabel && (
                  <Badge
                    variant="outline"
                    className={`rounded-md text-xs font-semibold border ${vipBadgeStyles[vipLabel] || defaultStyle}`}
                    data-testid="badge-vip-tier"
                  >
                    {vipLabel}
                  </Badge>
                )}
                {profile.userRank && profile.userRank !== "Active Members" && (
                  <Badge
                    variant="outline"
                    className={`rounded-md text-xs font-semibold border ${rankBadgeStyles[profile.userRank] || defaultStyle}`}
                    data-testid="badge-rank"
                  >
                    {profile.userRank}
                  </Badge>
                )}
                {(profile as any).additionalRanks?.map((rank: string) => (
                  <Badge
                    key={rank}
                    variant="outline"
                    className={`rounded-md text-xs font-semibold border ${rankBadgeStyles[rank] || defaultStyle}`}
                    data-testid={`badge-additional-${rank}`}
                  >
                    {rank}
                  </Badge>
                ))}
                <Badge
                  variant="outline"
                  className={`rounded-md text-xs font-semibold border ${defaultStyle}`}
                  data-testid="badge-active"
                >
                  Active Member
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-muted-foreground justify-center md:justify-start">
                <div
                  className="flex items-center gap-1.5"
                  data-testid="text-member-since"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Member for {memberDuration}</span>
                </div>
                <div
                  className="flex items-center gap-1.5"
                  data-testid="text-joined-date"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined {joinDateFormatted}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card data-testid="stat-threads">
          <CardContent className="p-4 text-center">
            <FileText className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold text-foreground">{totalPosts}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Forum Threads
            </p>
          </CardContent>
        </Card>
        <Card data-testid="stat-member-duration">
          <CardContent className="p-4 text-center">
            <Clock className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {joinDate
                ? Math.max(
                    1,
                    Math.floor(
                      (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24),
                    ),
                  )
                : 0}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Days Active</p>
          </CardContent>
        </Card>
        <Card data-testid="stat-rank">
          <CardContent className="p-4 text-center">
            <Shield className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-bold text-foreground truncate">
              {profile.userRank || "Active Members"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Rank</p>
          </CardContent>
        </Card>
        <Card data-testid="stat-vip">
          <CardContent className="p-4 text-center">
            <UserIcon className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-bold text-foreground truncate">
              {vipLabel || "None"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">VIP Tier</p>
          </CardContent>
        </Card>
      </div>

      {profile.discordUsername || profile.robloxUsername ? (
        <Card data-testid="card-linked-accounts">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Linked Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6 space-y-3">
            {profile.discordUsername && (
              <div
                className="flex items-center gap-3"
                data-testid="linked-discord"
              >
                <div className="w-8 h-8 rounded-full bg-[#5865F2]/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#5865F2]">D</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {profile.discordUsername}
                  </p>
                  <p className="text-xs text-muted-foreground">Discord</p>
                </div>
              </div>
            )}
            {profile.robloxUsername && (
              <div
                className="flex items-center gap-3"
                data-testid="linked-roblox"
              >
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-red-500">R</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {profile.robloxDisplayName || profile.robloxUsername}
                  </p>
                  <p className="text-xs text-muted-foreground">Roblox</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card data-testid="card-signature">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <PenLine className="w-4 h-4 text-muted-foreground" />
            Signature
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="text-sm text-muted-foreground leading-relaxed">
            {profile.signature ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: profile.signature }}
              />
            ) : (
              <div className="space-y-0.5">
                <p className="font-medium text-foreground">
                  {profile.username}
                </p>
                <p>RIVET Studios</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-activity">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            Recent Forum Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          {userThreads.length > 0 ? (
            <div className="space-y-1">
              {userThreads.map((thread, index) => (
                <div key={thread.id}>
                  <Link
                    href={`/forums/thread/${thread.id}`}
                    className="flex items-start gap-3 p-3 rounded-md hover-elevate transition-colors"
                    data-testid={`link-thread-${thread.id}`}
                  >
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {thread.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {thread.category && <span>{thread.category.name}</span>}
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {thread.viewCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {thread.replyCount || 0}
                        </span>
                        <span>
                          {thread.createdAt
                            ? formatDistanceToNow(new Date(thread.createdAt), {
                                addSuffix: true,
                              })
                            : "recently"}
                        </span>
                      </div>
                    </div>
                  </Link>
                  {index < userThreads.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                No forum activity yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
