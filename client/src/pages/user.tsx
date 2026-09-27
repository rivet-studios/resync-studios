import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { MarkdownContent } from "@/components/markdown-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
  AlertTriangle,
  ScrollText,
  StickyNote,
  Plus,
  Trash2,
  Ban,
  Activity,
  ExternalLink,
  UserRound,
  CircleCheck,
  Hash,
  Users,
} from "lucide-react";
import type {
  User,
  ForumThread,
  Warning,
  ModerationLog,
  StaffNote,
} from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { ReportDialog } from "@/components/report-dialog";
import { formatDistanceToNow, format } from "date-fns";
import { VipBadge } from "@/components/vip-badge";
import {
  rankConfig,
  getUsernameColor,
} from "@/components/user-rank-badge";
import { VerifiedBadge } from "@/components/verified-badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const staffRanks = [
  "Appeals Moderator",
  "Customer Relations",
  "Community Moderator",
  "Community Administrator",
  "Community Senior Administrator",
  "Creative Designer",
  "Gameplay Engineer",
  "Team Member",
  "Staff Department Director",
  "Operations Manager",
  "Company Director",
];

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
  "Community Moderator":
    "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/30",
  "Community Administrator":
    "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30",
  "Community Senior Administrator":
    "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
  "Gameplay Engineer":
    "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30",
  "Creative Designer":
    "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30",
  "Team Member":
    "border-gray-400 bg-gray-50 text-gray-600 dark:bg-white/5 dark:text-white/60 dark:border-white/10",
  "Active Members":
    "border-gray-300 bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-white/50 dark:border-white/10",
  "Trusted Member":
    "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/30",
  "Customer Relations":
    "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30",
  "Appeals Moderator":
    "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30",
  "Staff Department Director":
    "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30",
};

function getVipLabel(tier: string) {
  if (tier === "founders_edition") return "Founders Edition VIP";
  if (tier === "diamond") return "Diamond VIP";
  if (tier === "sapphire") return "Sapphire VIP";
  if (tier === "bronze") return "Bronze VIP";
  if (tier === "lifetime") return "Lifetime";
  return null;
}

function formatDateValue(date: string | Date | null | undefined) {
  if (!date) return "Unknown";
  return format(new Date(date), "MMMM d, yyyy");
}

function relativeDate(date: string | Date | null | undefined) {
  if (!date) return "recently";

  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
  });
}

function StatCard({
  icon: Icon,
  value,
  label,
  testId,
}: {
  icon: typeof FileText;
  value: React.ReactNode;
  label: string;
  testId: string;
}) {
  return (
    <Card
      className="border-border/60 bg-card/60"
      data-testid={testId}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-foreground truncate">
              {value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {label}
            </p>
          </div>

          <div className="w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const userId = id || currentUser?.id;

  const isStaffViewer =
    currentUser?.isModerator ||
    currentUser?.isAdmin ||
    staffRanks.includes(currentUser?.userRank || "") ||
    (currentUser?.additionalRanks || []).some((rank: string) =>
      staffRanks.includes(rank),
    );

  const [newNote, setNewNote] = useState("");

  const { data: profile, isLoading } = useQuery<User>({
    queryKey: ["/api/profile", userId],
    queryFn: async () => {
      const res = await fetch(`/api/profile/${userId}`);

      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }

      return res.json();
    },
    enabled: !!userId,
  });

  const { data: allThreads } = useQuery<
    (ForumThread & {
      author?: User;
      category?: { name: string };
    })[]
  >({
    queryKey: ["/api/forums/threads"],
    enabled: !!userId,
  });

  const { data: userWarnings } = useQuery<Warning[]>({
    queryKey: ["/api/warnings/user", userId],
    enabled: !!userId && !!isStaffViewer,
  });

  const { data: staffNotes } = useQuery<StaffNote[]>({
    queryKey: ["/api/staff-notes", userId],
    enabled: !!userId && !!isStaffViewer,
  });

  const { data: modLogs } = useQuery<ModerationLog[]>({
    queryKey: ["/api/moderation-logs/user", userId],
    enabled: !!userId && !!isStaffViewer,
  });

  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/staff-notes", {
        userId,
        authorId: currentUser?.id,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/staff-notes", userId],
      });

      setNewNote("");

      toast({
        title: "Note added",
      });
    },
    onError: () => {
      toast({
        title: "Failed to add note",
        variant: "destructive",
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      await apiRequest("DELETE", `/api/staff-notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/staff-notes", userId],
      });

      toast({
        title: "Note deleted",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete note",
        variant: "destructive",
      });
    },
  });

  const userThreads =
    allThreads
      ?.filter((thread) => thread.authorId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      )
      .slice(0, 5) || [];

  const totalPosts =
    allThreads?.filter((thread) => thread.authorId === userId).length || 0;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-28" />
        </div>

        <Skeleton className="h-72 w-full rounded-2xl" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>

        <Skeleton className="h-52 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-border/60 flex items-center justify-center mx-auto mb-5">
          <UserIcon className="w-6 h-6 text-muted-foreground" />
        </div>

        <p
          className="text-xl font-semibold text-foreground"
          data-testid="text-user-not-found"
        >
          User not found
        </p>

        <p className="text-sm text-muted-foreground mt-2">
          The profile you're looking for could not be located.
        </p>

        <Link href="/dashboard">
          <Button variant="outline" className="mt-6">
            Return to dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const vipLabel = getVipLabel(profile.vipTier || "");

  const defaultStyle =
    "border-gray-300 bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-white/50 dark:border-white/10";

  const usernameStyle = getUsernameColor(
    profile.vipTier,
    profile.userRank,
    (profile as any).additionalRanks,
  );

  const joinDate = profile.createdAt
    ? new Date(profile.createdAt)
    : null;

  const memberDuration = joinDate
    ? formatDistanceToNow(joinDate)
    : "recently";

  const joinDateFormatted = formatDateValue(joinDate);

  const isStaff =
    profile.isModerator || profile.isAdmin;

  const rc = rankConfig[profile.userRank || ""];

  const allRanks = [
    ...(profile.userRank && profile.userRank !== "Members"
      ? [profile.userRank]
      : []),
    ...((profile as any).additionalRanks || []),
  ];

  const uniqueRanks = [...new Set(allRanks)];

  const vipRanks = [
    "Lifetime",
    "Founders Edition VIP",
    "Diamond VIP",
    "Bronze VIP",
  ];

  const communityRanks = [
    "Members",
    "Active Member",
    "Trusted Member",
    "Community Partner",
    "Vehicle Tester",
    "Retired Team Member",
  ];

  const vipRanksForDisplay = uniqueRanks.filter((rank) =>
    vipRanks.includes(rank),
  );

  const communityRanksForDisplay = uniqueRanks.filter((rank) =>
    communityRanks.includes(rank),
  );

  const staffRanksForDisplay = uniqueRanks.filter(
    (rank) =>
      !vipRanks.includes(rank) &&
      !communityRanks.includes(rank),
  );

  if (vipLabel && !vipRanksForDisplay.includes(vipLabel)) {
    vipRanksForDisplay.unshift(vipLabel);
  }

  const orderedRanks = [
    ...vipRanksForDisplay,
    ...communityRanksForDisplay,
    ...staffRanksForDisplay,
  ];

  if (orderedRanks.length === 0) {
    orderedRanks.push("Active Members");
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* Breadcrumb / actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
            <Link
              href="/dashboard"
              className="hover:text-foreground transition-colors"
              data-testid="link-breadcrumb-dashboard"
            >
              Dashboard
            </Link>

            <ChevronRight className="w-3.5 h-3.5 shrink-0" />

            <span
              className="text-foreground font-medium truncate"
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
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-muted-foreground"
                  data-testid="button-report-user"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Report profile
                </Button>
              }
            />
          )}
        </div>

        {/* Profile hero */}
        <Card
          data-testid="card-profile"
          className="overflow-hidden border-border/60 bg-card/70"
        >
          {(profile as any).profileBannerUrl ? (
            <div
              className="h-40 sm:h-52 lg:h-60 w-full overflow-hidden bg-muted"
              data-testid="img-profile-banner"
            >
              <img
                src={(profile as any).profileBannerUrl}
                alt="Profile banner"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-20 sm:h-28 bg-gradient-to-br from-primary/15 via-transparent to-transparent border-b border-border/50" />
          )}

          <CardContent className="px-5 sm:px-8 pb-7 pt-0">
            <div
              className={`flex flex-col md:flex-row gap-6 items-center md:items-end ${
                (profile as any).profileBannerUrl
                  ? "-mt-16 sm:-mt-20"
                  : "-mt-12"
              }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <Avatar
                  className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-background shadow-xl"
                  data-testid="img-avatar"
                >
                  <AvatarImage
                    src={profile.profileImageUrl || undefined}
                  />

                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <UserIcon className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>

                {isStaff && (
                  <div
                    className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-2 border-4 border-background"
                    data-testid="indicator-staff"
                    title="Staff member"
                  >
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Identity */}
              <div className="flex-1 min-w-0 text-center md:text-left pb-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  <h1
                    className={`text-3xl sm:text-4xl font-bold tracking-tight ${
                      usernameStyle.className || ""
                    }`}
                    style={
                      usernameStyle.color
                        ? { color: usernameStyle.color }
                        : undefined
                    }
                    data-testid="text-username"
                  >
                    <span className="inline-flex items-center gap-2">
                      {profile.username}
                      <VerifiedBadge
                        isVerified={(profile as any).isVerified}
                        size="lg"
                      />
                    </span>
                  </h1>

                  {profile.vipTier &&
                    profile.vipTier !== "none" && (
                      <VipBadge
                        tier={profile.vipTier as any}
                        size="lg"
                      />
                    )}
                </div>

                {profile.bio && (
                  <p
                    className="text-sm text-muted-foreground leading-relaxed max-w-2xl mt-2"
                    data-testid="text-bio"
                  >
                    {profile.bio}
                  </p>
                )}

                {/* Rank badges */}
                <div
                  className="flex flex-wrap gap-1.5 mt-4 justify-center md:justify-start"
                  data-testid="container-badges"
                >
                  {orderedRanks.map((rank) => (
                    <Badge
                      key={rank}
                      variant="outline"
                      className={`rounded-md text-[11px] font-semibold border ${
                        vipBadgeStyles[rank] ||
                        rankBadgeStyles[rank] ||
                        defaultStyle
                      }`}
                      data-testid={`badge-rank-${rank
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {rank}
                    </Badge>
                  ))}
                </div>

                {/* Member metadata */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-4 text-xs text-muted-foreground justify-center md:justify-start">
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

        {/* Profile stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={FileText}
            value={totalPosts}
            label="Forum threads"
            testId="stat-threads"
          />

          <StatCard
            icon={Clock}
            value={
              joinDate
                ? Math.max(
                    1,
                    Math.floor(
                      (Date.now() - joinDate.getTime()) /
                        (1000 * 60 * 60 * 24),
                    ),
                  )
                : 0
            }
            label="Days active"
            testId="stat-member-duration"
          />

          <StatCard
            icon={Shield}
            value={profile.userRank || "Active Members"}
            label="Primary rank"
            testId="stat-rank"
          />

          <StatCard
            icon={CircleCheck}
            value={vipLabel || "None"}
            label="Subscription tier"
            testId="stat-vip"
          />
        </div>

        {/* Account information */}
        <div className="grid lg:grid-cols-2 gap-5">
          {(profile.discordUsername || profile.robloxUsername) && (
            <Card
              data-testid="card-linked-accounts"
              className="border-border/60 bg-card/60"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  Linked Accounts
                </CardTitle>
              </CardHeader>

              <CardContent className="pb-6 space-y-3">
                {profile.discordUsername && (
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/20"
                    data-testid="linked-discord"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#5865F2]/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#5865F2]">
                        D
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {profile.discordUsername}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Discord
                      </p>
                    </div>
                  </div>
                )}

                {profile.robloxUsername && (
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/20"
                    data-testid="linked-roblox"
                  >
                    <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-red-500">
                        R
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {profile.robloxDisplayName ||
                          profile.robloxUsername}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Roblox
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Signature */}
          <Card
            data-testid="card-signature"
            className={`border-border/60 bg-card/60 ${
              profile.discordUsername || profile.robloxUsername
                ? ""
                : "lg:col-span-2"
            }`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <PenLine className="w-4 h-4 text-muted-foreground" />
                Signature
              </CardTitle>
            </CardHeader>

            <CardContent className="pb-6">
              <div className="text-sm text-muted-foreground leading-relaxed">
                {profile.signature ? (
                  <MarkdownContent content={profile.signature} />
                ) : (
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                    <p className="font-medium text-foreground">
                      {profile.username}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      RIVET Studios
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forum activity */}
        <Card
          data-testid="card-activity"
          className="border-border/60 bg-card/60 overflow-hidden"
        >
          <CardHeader className="pb-4 border-b border-border/50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  Recent Forum Activity
                </CardTitle>

                <p className="text-xs text-muted-foreground mt-1">
                  The latest threads started by {profile.username}.
                </p>
              </div>

              <Badge variant="outline" className="text-[10px]">
                {totalPosts} thread{totalPosts === 1 ? "" : "s"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {userThreads.length > 0 ? (
              <div>
                {userThreads.map((thread, index) => (
                  <div key={thread.id}>
                    <Link
                      href={`/forums/thread/${thread.id}`}
                      className="flex items-start gap-4 px-5 py-4 hover:bg-muted/30 transition-colors group"
                      data-testid={`link-thread-${thread.id}`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {thread.title}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[11px] text-muted-foreground">
                          {thread.category && (
                            <span className="flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              {thread.category.name}
                            </span>
                          )}

                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {thread.viewCount || 0}
                          </span>

                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {thread.replyCount || 0}
                          </span>

                          <span>
                            {relativeDate(thread.createdAt)}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0 mt-1" />
                    </Link>

                    {index < userThreads.length - 1 && (
                      <Separator />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-14 text-center px-5">
                <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-5 h-5 text-muted-foreground/50" />
                </div>

                <p className="text-sm font-medium text-foreground">
                  No forum activity yet
                </p>

                <p className="text-xs text-muted-foreground mt-1">
                  Threads started by this member will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Staff workspace */}
        {isStaffViewer && profile && currentUser && (
          <section
            className="space-y-5 pt-4"
            data-testid="section-staff-tools"
          >
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.035]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />

              <div className="relative p-5 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div>
                    <Badge
                      variant="outline"
                      className="gap-1.5 border-primary/20 bg-primary/5"
                    >
                      <Shield className="w-3 h-3" />
                      Staff workspace
                    </Badge>

                    <h2 className="text-xl font-bold mt-3">
                      Moderation & member management
                    </h2>

                    <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                      Review account history, document staff notes, and access
                      moderation controls for this member.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/modcp?tab=warnings&userId=${profile.id}`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid="button-issue-warning"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                        Issue warning
                      </Button>
                    </Link>

                    <Link
                      href={`/modcp?tab=bans&userId=${profile.id}`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid="button-issue-ban"
                      >
                        <Ban className="w-3.5 h-3.5 mr-1.5" />
                        Issue ban
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning history */}
            <Card
              data-testid="card-warning-history"
              className="border-border/60 bg-card/60"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                      Warning History

                      {userWarnings &&
                        userWarnings.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="ml-1"
                            data-testid="badge-warning-count"
                          >
                            {userWarnings.length}
                          </Badge>
                        )}
                    </CardTitle>

                    <p className="text-xs text-muted-foreground mt-1">
                      Recorded warnings associated with this account.
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pb-6">
                {userWarnings && userWarnings.length > 0 ? (
                  <div className="space-y-3">
                    {userWarnings.map((warning) => {
                      const severityStyles: Record<string, string> = {
                        Verbal:
                          "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400",
                        Written:
                          "bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400",
                        Final:
                          "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400",
                      };

                      return (
                        <div
                          key={warning.id}
                          className={`p-4 rounded-xl border border-border/60 bg-muted/15 ${
                            !warning.isActive ? "opacity-50" : ""
                          }`}
                          data-testid={`warning-item-${warning.id}`}
                        >
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge
                              variant="secondary"
                              className={
                                severityStyles[warning.severity] || ""
                              }
                              data-testid={`badge-severity-${warning.id}`}
                            >
                              {warning.severity}
                            </Badge>

                            {!warning.isActive && (
                              <Badge
                                variant="outline"
                                className="text-[10px]"
                                data-testid={`badge-inactive-${warning.id}`}
                              >
                                Inactive
                              </Badge>
                            )}

                            <span className="text-[11px] text-muted-foreground ml-auto">
                              {relativeDate(warning.createdAt)}
                            </span>
                          </div>

                          <p
                            className="text-sm text-foreground leading-relaxed"
                            data-testid={`text-warning-reason-${warning.id}`}
                          >
                            {warning.reason}
                          </p>

                          <p className="text-xs text-muted-foreground mt-2">
                            Issued by: {warning.issuedBy}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                      <CircleCheck className="w-5 h-5 text-emerald-500/70" />
                    </div>

                    <p className="text-sm font-medium text-foreground">
                      No warnings on record
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      There are currently no recorded warnings for this user.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Staff notes */}
            <Card
              data-testid="card-staff-notes"
              className="border-border/60 bg-card/60"
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-muted-foreground" />
                  Staff Notes

                  {staffNotes &&
                    staffNotes.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1"
                        data-testid="badge-notes-count"
                      >
                        {staffNotes.length}
                      </Badge>
                    )}
                </CardTitle>

                <p className="text-xs text-muted-foreground mt-1">
                  Internal notes are visible to authorized staff only.
                </p>
              </CardHeader>

              <CardContent className="pb-6 space-y-4">
                <div className="rounded-xl border border-border/60 bg-muted/15 p-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Textarea
                      value={newNote}
                      onChange={(event) =>
                        setNewNote(event.target.value)
                      }
                      placeholder="Add an internal staff note about this user..."
                      className="resize-none text-sm min-h-20 bg-background/50"
                      rows={3}
                      data-testid="input-staff-note"
                    />

                    <Button
                      size="sm"
                      className="sm:self-end"
                      disabled={
                        !newNote.trim() ||
                        addNoteMutation.isPending
                      }
                      onClick={() =>
                        addNoteMutation.mutate(newNote.trim())
                      }
                      data-testid="button-add-note"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Add note
                    </Button>
                  </div>
                </div>

                {staffNotes && staffNotes.length > 0 ? (
                  <div className="space-y-2">
                    {staffNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-4 rounded-xl border border-border/60 bg-muted/10 flex gap-3"
                        data-testid={`note-item-${note.id}`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                          <StickyNote className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm text-foreground leading-relaxed whitespace-pre-wrap"
                            data-testid={`text-note-content-${note.id}`}
                          >
                            {note.content}
                          </p>

                          <p className="text-[11px] text-muted-foreground mt-2">
                            By {note.authorId} ·{" "}
                            {relativeDate(note.createdAt)}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() =>
                            deleteNoteMutation.mutate(note.id)
                          }
                          disabled={deleteNoteMutation.isPending}
                          data-testid={`button-delete-note-${note.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <StickyNote className="w-7 h-7 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No staff notes yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Moderation history */}
            <Card
              data-testid="card-moderation-history"
              className="border-border/60 bg-card/60 overflow-hidden"
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  Moderation History
                </CardTitle>

                <p className="text-xs text-muted-foreground mt-1">
                  Recent moderation actions associated with this account.
                </p>
              </CardHeader>

              <CardContent className="p-0">
                {modLogs && modLogs.length > 0 ? (
                  <div>
                    {modLogs.slice(0, 10).map((log, index) => (
                      <div key={log.id}>
                        <div
                          className="flex items-start gap-3 px-5 py-4"
                          data-testid={`modlog-item-${log.id}`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                            <ScrollText className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-medium text-foreground"
                              data-testid={`text-modlog-action-${log.id}`}
                            >
                              {log.action}
                            </p>

                            {log.details && (
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {log.details}
                              </p>
                            )}

                            <p className="text-[11px] text-muted-foreground mt-2">
                              By {log.actorId} ·{" "}
                              {relativeDate(log.createdAt)}
                            </p>
                          </div>
                        </div>

                        {index <
                          Math.min(modLogs.length, 10) - 1 && (
                          <Separator />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <Activity className="w-7 h-7 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No moderation actions on record
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 pt-2 pb-4 text-[11px] text-muted-foreground">
          <UserRound className="w-3.5 h-3.5" />
          <span>RIVET Studios member profile</span>
        </div>
      </div>
    </div>
  );
}