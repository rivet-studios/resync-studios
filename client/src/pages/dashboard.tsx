import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { VipBadge } from "@/components/vip-badge";
import { Link } from "wouter";
import {
  Target,
  Users,
  Swords,
  MessageSquare,
  Crown,
  ArrowRight,
  TrendingUp,
  Clock,
  Activity,
} from "lucide-react";
import { SiDiscord, SiRoblox } from "react-icons/si";
import type { LfgPost, Build, ForumThread, Clan } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: recentLfg, isLoading: lfgLoading } = useQuery<LfgPost[]>({
    queryKey: ["/api/lfg", "recent"],
  });

  const { data: recentBuilds, isLoading: buildsLoading } = useQuery<Build[]>({
    queryKey: ["/api/builds", "recent"],
  });

  const { data: stats } = useQuery<{
    totalMembers: number;
    activeLfg: number;
    totalClans: number;
    totalBuilds: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const quickActions = [
    { icon: Target, label: "Find Group", href: "/lfg", color: "text-chart-1" },
    { icon: Users, label: "Browse Clans", href: "/clans", color: "text-chart-2" },
    { icon: Swords, label: "View Builds", href: "/builds", color: "text-chart-3" },
    { icon: MessageSquare, label: "Forums", href: "/forums", color: "text-chart-4" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Welcome back, {user?.firstName || user?.username || "Player"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening in the community today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user?.vipTier && user.vipTier !== 'none' ? (
            <VipBadge tier={user.vipTier as any} />
          ) : (
            <Button variant="outline" asChild size="sm">
              <Link href="/vip">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to VIP
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Account Linking Status */}
      {(!user?.discordId || !user?.robloxId) && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold">Complete Your Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    Link your accounts to unlock full features and exclusive perks.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!user?.discordId && (
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/settings?tab=connections">
                      <SiDiscord className="w-4 h-4 mr-2" />
                      Link Discord
                    </Link>
                  </Button>
                )}
                {!user?.robloxId && (
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/settings?tab=connections">
                      <SiRoblox className="w-4 h-4 mr-2" />
                      Link Roblox
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalMembers?.toLocaleString() || '---'}</p>
                <p className="text-xs text-muted-foreground">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.activeLfg || '---'}</p>
                <p className="text-xs text-muted-foreground">Active LFG Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalClans || '---'}</p>
                <p className="text-xs text-muted-foreground">Active Clans</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                <Swords className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalBuilds || '---'}</p>
                <p className="text-xs text-muted-foreground">Shared Builds</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Card key={action.label} className="hover-elevate">
            <Link href={action.href}>
              <CardContent className="p-4 flex flex-col items-center text-center cursor-pointer">
                <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-3 ${action.color}`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="font-medium text-sm">{action.label}</span>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent LFG Posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <div>
              <CardTitle className="text-lg">Active LFG Posts</CardTitle>
              <CardDescription>Players looking for groups right now</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/lfg">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {lfgLoading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : recentLfg && recentLfg.length > 0 ? (
              recentLfg.slice(0, 3).map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{post.game}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {post.playersJoined}/{post.playersNeeded} players
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/lfg/${post.id}`}>Join</Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No active LFG posts</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/lfg">Create one now</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Builds */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <div>
              <CardTitle className="text-lg">Trending Builds</CardTitle>
              <CardDescription>Top-rated builds from the community</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/builds">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {buildsLoading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : recentBuilds && recentBuilds.length > 0 ? (
              recentBuilds.slice(0, 3).map((build) => (
                <div key={build.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                      <Swords className="w-5 h-5 text-chart-3" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{build.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{build.game}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {build.upvotes} upvotes
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/builds/${build.id}`}>View</Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Swords className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No builds shared yet</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/builds">Share your first build</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Your Clan */}
      {user?.clanId ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <div>
              <CardTitle className="text-lg">Your Clan</CardTitle>
              <CardDescription>Stay connected with your team</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/clans/${user.clanId}`}>
                View Clan
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Clan Name</p>
                <p className="text-sm text-muted-foreground">Your role: {user.clanRole || 'Member'}</p>
              </div>
              <Button asChild>
                <Link href={`/clans/${user.clanId}/chat`}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Clan Chat
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Join a Clan</h3>
            <p className="text-muted-foreground mb-4">
              Connect with players, compete together, and build lasting friendships.
            </p>
            <Button asChild>
              <Link href="/clans">
                Browse Clans
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
