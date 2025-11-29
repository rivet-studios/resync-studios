import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VipBadge } from "@/components/vip-badge";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";
import { SiDiscord, SiRoblox } from "react-icons/si";

export default function Profile() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64 md:col-span-2" />
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

  const stats = [
    { icon: Target, label: "LFG Posts", value: user?.totalPosts || 0 },
    { icon: Swords, label: "Builds Shared", value: 0 },
    { icon: MessageSquare, label: "Forum Posts", value: 0 },
    { icon: Trophy, label: "Reputation", value: user?.reputation || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-chart-3/20 to-primary/20" />
        <CardContent className="relative pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-12">
            <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background">
              <AvatarImage 
                src={user?.profileImageUrl || undefined} 
                alt={getDisplayName()}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 sm:pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h1 className="text-2xl font-bold">{getDisplayName()}</h1>
                {user?.vipTier && user.vipTier !== 'none' && (
                  <VipBadge tier={user.vipTier as any} />
                )}
              </div>
              {user?.username && (
                <p className="text-muted-foreground">@{user.username}</p>
              )}
              {user?.bio && (
                <p className="mt-2 text-muted-foreground">{user.bio}</p>
              )}
            </div>
            <Button variant="outline" asChild>
              <Link href="/settings">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Stats & Links */}
        <div className="space-y-6">
          {/* Stats Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <stat.icon className="w-4 h-4" />
                    <span className="text-sm">{stat.label}</span>
                  </div>
                  <span className="font-semibold">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Linked Accounts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Linked Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SiDiscord className="w-5 h-5 text-[#5865F2]" />
                  <span className="text-sm">Discord</span>
                </div>
                {user?.discordId ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{user.discordUsername}</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/settings?tab=connections">Link</Link>
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SiRoblox className="w-5 h-5" />
                  <span className="text-sm">Roblox</span>
                </div>
                {user?.robloxId ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{user.robloxUsername}</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/settings?tab=connections">Link</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Clan Membership */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Clan</CardTitle>
            </CardHeader>
            <CardContent>
              {user?.clanId ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Clan Name</p>
                    <p className="text-sm text-muted-foreground">{user.clanRole || 'Member'}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/clans/${user.clanId}`}>View</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">Not in a clan</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/clans">Browse Clans</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* VIP Status */}
          {user?.vipTier === 'none' || !user?.vipTier ? (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6 text-center">
                <Crown className="w-10 h-10 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Upgrade to VIP</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get exclusive features, badges, and Discord roles!
                </p>
                <Button asChild>
                  <Link href="/vip">View Plans</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-primary/10 to-chart-3/10">
              <CardContent className="p-6 text-center">
                <VipBadge tier={user.vipTier as any} size="lg" />
                <p className="text-sm text-muted-foreground mt-3">
                  Thank you for being a VIP member!
                </p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href="/vip">Manage Subscription</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Activity */}
        <div className="md:col-span-2 space-y-6">
          {/* Member Since */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="w-5 h-5" />
                <span>
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  }) : 'Unknown'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Your latest contributions to the community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No recent activity</p>
                <p className="text-sm mt-1">Start by creating an LFG post or sharing a build!</p>
                <div className="flex justify-center gap-3 mt-4">
                  <Button variant="outline" asChild>
                    <Link href="/lfg">Create LFG Post</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/builds">Share a Build</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements (Placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Achievements</CardTitle>
              <CardDescription>Badges and milestones earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No achievements yet</p>
                <p className="text-sm mt-1">Complete activities to earn badges and achievements!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
