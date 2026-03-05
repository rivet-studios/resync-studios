import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Target,
  Users,
  Swords,
  MessageSquare,
  Crown,
  ArrowRight,
  Activity,
  User as UserIcon,
  Shield,
  LayoutDashboard,
} from "lucide-react";
import { SiDiscord, SiRoblox } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50/30">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center">
          <Shield className="w-10 h-10 text-slate-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900 uppercase tracking-tight">
            Access Restricted
          </h2>
          <p className="text-slate-500 font-medium">
            Please sign in to view your dashboard.
          </p>
        </div>
        <Button
          asChild
          className="bg-slate-900 text-white hover:bg-slate-800 h-12 px-8 font-bold rounded-xl shadow-xl"
        >
          <Link href="/login">Login to Account</Link>
        </Button>
      </div>
    );
  }

  const quickActions = [
    {
      icon: LayoutDashboard,
      label: "Admin CP",
      href: "/admincp",
      color: "text-red-500",
      hide: !user.isAdmin,
    },
    {
      icon: Shield,
      label: "Mod CP",
      href: "/modcp",
      color: "text-teal-500",
      hide: !user.isModerator && !user.isAdmin,
    },
    {
      icon: MessageSquare,
      label: "Forums",
      href: "/forums",
      color: "text-blue-500",
    },
  ].filter((a) => !a.hide);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl font-semibold text-slate-900 uppercase tracking-tight">
              Dashboard
            </h1>
          </div>
          <p className="text-slate-500 font-medium text-lg">
            Welcome back,{" "}
            <span className="text-slate-900 font-bold">{user?.username}</span>.
            Here's your overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user?.vipTier && user.vipTier !== "none" ? (
            <Badge className="bg-amber-400 text-white font-semibold rounded-xl px-4 py-2 text-sm shadow-lg border-none uppercase">
              {user.vipTier.replace("_", " ")}
            </Badge>
          ) : (
            <Button
              className="bg-slate-900 text-white hover:bg-slate-800 h-12 px-6 font-bold rounded-xl shadow-xl"
              asChild
            >
              <Link href="/store/subscriptions">
                <Crown className="w-5 h-5 mr-2 text-amber-400" />
                Upgrade to VIP
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
                      Posts
                    </p>
                    <p className="text-3xl font-semibold text-slate-900">
                      {(user as any).totalPosts || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
                      Reputation
                    </p>
                    <p className="text-3xl font-semibold text-slate-900">
                      {(user as any).reputation || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-shadow md:col-span-1 col-span-2">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-teal-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
                      Status
                    </p>
                    <p className="text-3xl font-semibold text-slate-900 uppercase">
                      Active
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Featured Content Area */}
          <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 pb-4 border-b border-slate-50 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold text-slate-900 uppercase tracking-tight">
                Recent Activity
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="font-bold text-slate-400"
                asChild
              >
                <Link href="/forums">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <MessageSquare className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-medium">
                    No recent activity to show.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Quick Actions */}
          <Card className="border-none shadow-xl bg-slate-900 rounded-[2rem] overflow-hidden text-white">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-1 gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="ghost"
                    className="w-full justify-start h-14 rounded-2xl hover:bg-white/10 text-white font-bold text-lg group"
                    asChild
                  >
                    <Link href={action.href}>
                      <action.icon
                        className={`w-6 h-6 mr-4 ${action.color} group-hover:scale-110 transition-transform`}
                      />
                      {action.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Account Linking */}
          {(!user?.discordId || !user?.robloxId) && (
            <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                  Security & Linking
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-4">
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Complete your profile by linking your accounts to unlock
                  exclusive community features.
                </p>
                <div className="space-y-2">
                  {!user?.discordId && (
                    <Button
                      className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold h-12 rounded-xl"
                      asChild
                    >
                      <Link href="/settings">
                        <SiDiscord className="w-5 h-5 mr-3" />
                        Link Discord
                      </Link>
                    </Button>
                  )}
                  {!user?.robloxId && (
                    <Button
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold h-12 rounded-xl"
                      asChild
                    >
                      <Link href="/settings">
                        <SiRoblox className="w-5 h-5 mr-3" />
                        Link Roblox
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
