import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VipBadge } from "@/components/vip-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRankBadge, FormattedUsername } from "@/components/user-rank-badge";
import { Link } from "wouter";
import { Calendar, Edit, CheckCircle, Lock } from "lucide-react";
import { SiDiscord, SiRoblox } from "react-icons/si";
import type { User } from "@shared/schema";

interface ProfileParams {
  id?: string;
}

export default function Profile() {
  const { user: currentUser, isLoading: currentUserLoading } = useAuth();
  const [params] = useState<ProfileParams>({});
  const location = useLocation()[0];

  // Extract user ID from URL if viewing another user's profile
  const userId = params.id || currentUser?.id;

  // If viewing own profile, use current user data
  // In a real app, you'd fetch the profile data from an API endpoint
  const user =
    currentUser && (!params.id || params.id === currentUser.id)
      ? currentUser
      : null;

  const isLoading = currentUserLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 space-y-4">
        <h1 className="text-2xl font-bold">User Not Found</h1>
        <p className="text-muted-foreground">
          The user you're looking for doesn't exist or you don't have permission
          to view their profile.
        </p>
        <Button asChild>
          <Link href="/forums">Back to Forums</Link>
        </Button>
      </div>
    );
  }

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const getDisplayName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || "User";
  };

  return (
    <div className="space-y-8">
      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="space-y-6 p-6">
            {/* Avatar and Basic Info */}
            <div className="flex gap-6">
              <Avatar className="w-24 h-24 border-2 border-primary shrink-0">
                <AvatarImage
                  src={user.profileImageUrl || undefined}
                  alt={getDisplayName()}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{getDisplayName()}</h1>

                {/* Badges Row - Display multiple ranks */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {user.userRank && user.userRank !== "member" && (
                    <UserRankBadge rank={user.userRank} size="sm" />
                  )}
                  {user.secondaryUserRank &&
                    user.secondaryUserRank !== "member" && (
                      <UserRankBadge rank={user.secondaryUserRank} size="sm" />
                    )}
                  {user.tertiaryUserRank &&
                    user.tertiaryUserRank !== "member" && (
                      <UserRankBadge rank={user.tertiaryUserRank} size="sm" />
                    )}
                  {user.vipTier && user.vipTier !== "none" && (
                    <div className="flex items-center">
                      <VipBadge tier={user.vipTier as any} />
                    </div>
                  )}
                </div>

                {/* Member Timeline */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Member since{" "}
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Unknown"}
                  </div>
                  <div>
                    Joined{" "}
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Unknown"}
                  </div>
                </div>

                {/* Edit Button */}
                {!params.id && (
                  <Button variant="outline" size="sm" asChild className="mt-4">
                    <Link href="/settings">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature Section */}
      {(user.bio || user.discordUsername) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Signature</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.bio && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {user.bio}
              </p>
            )}
            {user.discordUsername && (
              <div className="text-sm">
                <span className="font-semibold">{user.discordUsername}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
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
                  Status
                </p>
                <Badge variant="outline" className="gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                  Online
                </Badge>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Member since
                </p>
                <p className="text-sm">
                  {user.createdAt
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
                  Posts
                </p>
                <p className="text-sm">{user.totalPosts || 0}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Reputation
                </p>
                <p className="text-sm">{user.reputation || 0}</p>
              </div>
            </CardContent>
          </Card>

          {/* Linked Accounts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Linked Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-card border border-border/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <SiDiscord className="w-4 h-4 text-[#5865F2]" />
                  <span className="text-sm font-medium">Discord</span>
                </div>
                {user.discordId ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  !params.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-auto p-0 text-xs"
                    >
                      <Link href="/settings?tab=connections">Link</Link>
                    </Button>
                  )
                )}
              </div>
              <div className="flex items-center justify-between p-3 bg-card border border-border/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <SiRoblox className="w-4 h-4" />
                  <span className="text-sm font-medium">Roblox</span>
                </div>
                {user.robloxId ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  !params.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-auto p-0 text-xs"
                    >
                      <Link href="/settings?tab=connections">Link</Link>
                    </Button>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center">
              <CardContent className="p-4">
                <p className="text-2xl font-bold">{user.totalPosts || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Posts</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <p className="text-2xl font-bold">{user.gamesPlayed || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Games Played
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <p className="text-2xl font-bold">{user.reputation || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Reputation</p>
              </CardContent>
            </Card>
          </div>

          {/* Activity / About Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  Username
                </p>
                <p className="text-sm font-medium">
                  @{user.username || "unknown"}
                </p>
              </div>
              {user.bio && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Bio
                  </p>
                  <p className="text-sm text-muted-foreground">{user.bio}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  Member Status
                </p>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-sm">Active Member</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
