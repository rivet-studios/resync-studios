import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VipBadge } from "@/components/vip-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRankBadge, FormattedUsername } from "@/components/user-rank-badge";
import { Link } from "wouter";
import {
  User,
  Settings,
  Shield,
  Trophy,
  Target,
  Swords,
  MessageSquare,
  Calendar,
  Edit,
  Crown,
  CheckCircle,
  XCircle,
  Heart,
  Zap,
  Users,
} from "lucide-react";
import { SiDiscord, SiRoblox } from "react-icons/si";

export default function Profile() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.username || "User";
  };

  return (
    <div className="space-y-6">
      {/* Profile Header with Cover */}
      <Card className="overflow-hidden border-primary/20">
        <div className="h-40 bg-gradient-to-r from-primary/30 via-chart-3/30 to-chart-2/30 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, #8b5cf6, transparent 50%), radial-gradient(circle at 80% 80%, #ec4899, transparent 50%)",
            }}
          />
        </div>
        <CardContent className="relative pb-8">
          <div className="flex flex-col sm:flex-row gap-6 -mt-20">
            <Avatar className="w-32 h-32 border-4 border-background shadow-lg shrink-0">
              <AvatarImage
                src={user?.profileImageUrl || undefined}
                alt={getDisplayName()}
                className="object-cover"
              />
              <AvatarFallback className="text-4xl font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{getDisplayName()}</h1>
                {user?.userRank && user.userRank !== "member" && (
                  <UserRankBadge rank={user.userRank} />
                )}
                {user?.secondaryUserRank &&
                  user.secondaryUserRank !== "active_member" && (
                    <UserRankBadge rank={user.secondaryUserRank} />
                  )}
                {user?.vipTier && user.vipTier !== "none" && (
                  <VipBadge tier={user.vipTier as any} />
                )}
              </div>
              {user?.username && (
                <FormattedUsername
                  rank={user?.userRank}
                  username={`@${user.username}`}
                  className="mb-2"
                />
              )}
              {user?.bio && (
                <p className="text-muted-foreground mb-4 max-w-2xl">
                  {user.bio}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button variant="default" size="sm" asChild>
                  <Link href="/settings">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Member Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Member Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Joined
                </p>
                <p className="text-sm">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Last Active
                </p>
                <p className="text-sm">Today</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Content Count
                </p>
                <p className="text-sm">
                  {(user?.totalPosts || 0) + (user?.reputation || 0)} items
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Linked Accounts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Linked Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <SiDiscord className="w-4 h-4 text-[#5865F2]" />
                  <span className="text-sm font-medium">Discord</span>
                </div>
                {user?.discordId ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-auto p-0"
                  >
                    <Link href="/settings?tab=connections">Link</Link>
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <SiRoblox className="w-4 h-4" />
                  <span className="text-sm font-medium">Roblox</span>
                </div>
                {user?.robloxId ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-auto p-0"
                  >
                    <Link href="/settings?tab=connections">Link</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* VIP Status Card */}
          {user?.vipTier === "none" || !user?.vipTier ? (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/20 to-primary/10">
              <CardContent className="p-6 text-center space-y-3">
                <Crown className="w-12 h-12 mx-auto text-primary" />
                <div>
                  <h3 className="font-bold text-lg mb-1">Get VIP</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Unlock exclusive perks & premium features
                  </p>
                </div>
                <Button className="w-full" asChild>
                  <Link href="/vip">View Plans</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/20 to-chart-3/20">
              <CardContent className="p-6 text-center space-y-3">
                <VipBadge tier={user.vipTier as any} size="lg" />
                <div>
                  <p className="text-sm font-semibold">VIP Member</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Thank you for supporting the community!
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/vip">Manage Subscription</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex justify-center mb-2">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold">{user?.totalPosts || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">LFG Posts</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex justify-center mb-2">
                  <Swords className="w-6 h-6 text-chart-2" />
                </div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Builds Shared
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex justify-center mb-2">
                  <MessageSquare className="w-6 h-6 text-chart-3" />
                </div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Forum Posts
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex justify-center mb-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold">{user?.reputation || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Reputation</p>
              </CardContent>
            </Card>
          </div>

          {/* Clan Membership */}
          {user?.clanId ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Clan Membership</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Clan Name</p>
                    <p className="text-sm text-muted-foreground">
                      {user.clanRole || "Member"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/clans/${user.clanId}`}>View Clan</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* VIP Package */}
          {user?.vipTier && user.vipTier !== "none" && (
            <Card className="border-primary/40 bg-gradient-to-r from-primary/10 via-chart-3/10 to-primary/10">
              <CardHeader className="border-b border-primary/20 pb-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-primary" />
                  <div>
                    <CardTitle>Your VIP Package</CardTitle>
                    <CardDescription>Premium member benefits</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">
                          Exclusive Discord Role
                        </p>
                        <p className="text-xs text-muted-foreground">
                          VIP badge in server
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Priority Support</p>
                        <p className="text-xs text-muted-foreground">
                          Fast-tracked assistance
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">
                          Exclusive Features
                        </p>
                        <p className="text-xs text-muted-foreground">
                          VIP-only content
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Team Bypass</p>
                        <p className="text-xs text-muted-foreground">
                          Skip team queues
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">
                          Community Recognition
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Special badge on profile
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Early Access</p>
                        <p className="text-xs text-muted-foreground">
                          New features first
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Your latest contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No recent activity yet</p>
                <p className="text-sm mt-1">
                  Start contributing to see your activity here!
                </p>
                <div className="flex justify-center gap-3 mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/lfg">Create LFG Post</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/forums">Join Forums</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Achievements</CardTitle>
              <CardDescription>Badges and milestones earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No achievements yet</p>
                <p className="text-sm mt-1">
                  Earn badges by participating in the community!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
