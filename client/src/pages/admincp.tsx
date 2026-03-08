import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Shield,
  Plus,
  Trash2,
  AlertTriangle,
  LayoutDashboard,
  Users,
  MessageSquare,
  Search,
  Clock,
  Settings,
  FileText,
  Ban,
  Scale,
  TrendingUp,
  Activity,
  ChevronRight,
  Eye,
  EyeOff,
  Megaphone,
  RefreshCw,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalThreads: number;
  totalReplies: number;
  totalProducts: number;
  activeBans: number;
  pendingReports: number;
  pendingAppeals: number;
  totalPayments: number;
  totalAnnouncements: number;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  targetId: string;
  actorId: string;
  createdAt: string;
}

export default function AdminCP() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userSearch, setUserSearch] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementCategory, setAnnouncementCategory] = useState("General");
  const [announcementImageUrl, setAnnouncementImageUrl] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRank, setSelectedRank] = useState("");
  const [editingPolicy, setEditingPolicy] = useState<string | null>(null);
  const [policyTitle, setPolicyTitle] = useState("");
  const [policyContent, setPolicyContent] = useState("");

  const adminRanks = [
    "Community Developer",
    "Staff Internal Affairs",
    "Company Representative",
    "Team Member",
    "MI Trust & Safety Director",
    "Staff Department Director",
    "Operations Manager",
    "Company Director",
  ];

  const isAdmin =
    adminRanks.includes(user?.userRank || "") ||
    (user?.additionalRanks || []).some((r) => adminRanks.includes(r)) ||
    user?.email?.toLowerCase().endsWith("@resyncstudios.com");

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!isAdmin,
    refetchInterval: 30000,
  });

  const { data: activity = [] } = useQuery<ActivityItem[]>({
    queryKey: ["/api/admin/activity"],
    enabled: !!isAdmin && activeTab === "dashboard",
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!isAdmin && activeTab === "users",
  });

  const { data: searchResults = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/search-users", userSearch],
    queryFn: async () => {
      if (!userSearch.trim()) return [];
      const res = await fetch(
        `/api/admin/search-users?q=${encodeURIComponent(userSearch)}`,
      );
      return res.json();
    },
    enabled: !!isAdmin && userSearch.length >= 2,
  });

  const [offlineMessage, setOfflineMessage] = useState("");
  const [offlineMessageDirty, setOfflineMessageDirty] = useState(false);

  const { data: siteSettings } = useQuery<any>({
    queryKey: ["/api/admin/site-settings"],
    enabled: !!isAdmin && activeTab === "settings",
  });

  const { data: announcements = [] } = useQuery<any[]>({
    queryKey: ["/api/blog"],
    enabled:
      !!isAdmin && (activeTab === "announcements" || activeTab === "dashboard"),
  });

  const { data: reports = [] } = useQuery<any[]>({
    queryKey: ["/api/reports"],
    enabled:
      !!isAdmin && (activeTab === "reports" || activeTab === "dashboard"),
  });

  const { data: policiesData = [] } = useQuery<any[]>({
    queryKey: ["/api/policies"],
    enabled: !!isAdmin && activeTab === "policies",
  });

  const policySlugMap: Record<string, string> = {
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    "community-rules": "Community Rules",
    guidelines: "Guidelines",
    dmca: "DMCA Policy",
    "leo-guidelines": "LEO Guidelines",
    "volunteer-staff-agreement": "Volunteer Staff Agreement",
    "project-rosewood-rules": "Project Rosewood Rules",
  };

  const savePolicyMutation = useMutation({
    mutationFn: async ({
      slug,
      title,
      content,
    }: {
      slug: string;
      title: string;
      content: string;
    }) => {
      const res = await apiRequest("PUT", `/api/policies/${slug}`, {
        title,
        content,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Policy updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      setEditingPolicy(null);
      setPolicyTitle("");
      setPolicyContent("");
    },
    onError: (e: any) => {
      toast({
        title: "Failed to update policy",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const updateSiteSettingsMutation = useMutation({
    mutationFn: async (updates: any) => {
      const res = await apiRequest(
        "PATCH",
        "/api/admin/site-settings",
        updates,
      );
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Site settings updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-settings"] });
    },
    onError: (e: any) => {
      toast({
        title: "Failed to update settings",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/announcements", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Announcement created" });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setAnnouncementTitle("");
      setAnnouncementContent("");
      setAnnouncementCategory("General");
      setAnnouncementImageUrl("");
    },
    onError: (e: any) => {
      toast({
        title: "Failed to create announcement",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/announcements/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Announcement deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
    },
  });

  const updateRankMutation = useMutation({
    mutationFn: async ({
      userId,
      userRank,
    }: {
      userId: string;
      userRank: string;
    }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}/rank`, {
        userRank,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "User rank updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setSelectedUserId("");
      setSelectedRank("");
    },
    onError: (e: any) => {
      toast({
        title: "Failed to update rank",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#050505]">
        <Skeleton className="h-[600px] w-full max-w-[1400px] rounded-xl" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#050505]">
        <Card className="w-full max-w-md bg-[#121212] border-white/5">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500" />
              <div>
                <h2 className="font-semibold text-xl text-white uppercase tracking-tight">
                  Access Denied
                </h2>
                <p className="text-white/40 text-sm mt-2">
                  You do not have permission to access the Administrator Control
                  Panel.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allRankOptions = [
    "Member",
    "Active Member",
    "Trusted Member",
    "Community Partner",
    "Bronze VIP",
    "Diamond VIP",
    "Founders Edition VIP",
    "Lifetime",
    "Vehicle Tester",
    "Report Analyst",
    "Appeal Analyst",
    "Quality Assurance Team",
    "Quality Assurance Lead",
    "RS Volunteer Staff",
    "RS Trust & Safety Team",
    "Customer Relations",
    "Appeals Moderator",
    "Community Moderator",
    "Community Senior Moderator",
    "Community Administrator",
    "Community Senior Administrator",
    "Community Developer",
    "Staff Internal Affairs",
    "Company Representative",
    "Team Member",
    "MI Trust & Safety Director",
    "Staff Department Director",
    "Operations Manager",
    "Company Director",
    "Banned",
  ];

  const sidebarItems = [
    { id: "dashboard", label: "Admin Dashboard", icon: LayoutDashboard },
    { id: "users", label: "User Management", icon: Users },
    { id: "settings", label: "Platform Settings", icon: Settings },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "policies", label: "Policies", icon: Scale },
    { id: "reports", label: "System Reports", icon: AlertTriangle },
  ];

  const displayUsers = userSearch.length >= 2 ? searchResults : allUsers;

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <div className="w-64 border-r border-white/5 flex flex-col p-4 space-y-2">
        <div className="flex items-center gap-3 px-4 py-6 mb-4">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-semibold text-sm italic">RS</span>
          </div>
          <span className="font-semibold text-sm tracking-tight uppercase">
            RIVET Studios™
          </span>
        </div>
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${
              activeTab === item.id
                ? "bg-white/5 text-white"
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
            data-testid={`button-admincp-tab-${item.id}`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-8 space-y-8 overflow-y-auto">
        {activeTab === "dashboard" && (
          <>
            <div className="flex items-center justify-between">
              <h1
                className="text-4xl font-semibold tracking-tight uppercase"
                data-testid="text-admincp-title"
              >
                Administrator Dashboard
              </h1>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  queryClient.invalidateQueries({
                    queryKey: ["/api/admin/stats"],
                  })
                }
                className="border-white/10"
                data-testid="button-refresh-stats"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-[#121212] border-white/5 rounded-xl overflow-hidden group">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-white/40 group-hover:text-white transition-colors">
                    <Users className="w-4 h-4" />
                    <CardTitle className="text-[10px] font-semibold uppercase tracking-widest">
                      Total Members
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-4xl font-semibold mb-1"
                    data-testid="text-total-members"
                  >
                    {statsLoading ? (
                      <Skeleton className="h-10 w-20" />
                    ) : (
                      stats?.totalUsers?.toLocaleString() ?? "—"
                    )}
                  </div>
                  <div className="text-xs font-bold text-white/20 uppercase tracking-tight">
                    Registered accounts
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#121212] border-white/5 rounded-xl overflow-hidden group">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-white/40 group-hover:text-white transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <CardTitle className="text-[10px] font-semibold uppercase tracking-widest">
                      Forum Posts
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-4xl font-semibold mb-1"
                    data-testid="text-forum-posts"
                  >
                    {statsLoading ? (
                      <Skeleton className="h-10 w-20" />
                    ) : (
                      (
                        (stats?.totalThreads || 0) + (stats?.totalReplies || 0)
                      ).toLocaleString()
                    )}
                  </div>
                  <div className="text-xs font-bold text-white/20 uppercase tracking-tight">
                    {stats?.totalThreads || 0} threads,{" "}
                    {stats?.totalReplies || 0} replies
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#121212] border-white/5 rounded-xl overflow-hidden group">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-white/40 group-hover:text-white transition-colors">
                    <Ban className="w-4 h-4" />
                    <CardTitle className="text-[10px] font-semibold uppercase tracking-widest">
                      Active Bans
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-4xl font-semibold mb-1"
                    data-testid="text-active-bans"
                  >
                    {statsLoading ? (
                      <Skeleton className="h-10 w-20" />
                    ) : (
                      stats?.activeBans || 0
                    )}
                  </div>
                  <div className="text-xs font-bold text-white/20 uppercase tracking-tight">
                    Currently enforced
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#121212] border-white/5 rounded-xl overflow-hidden group">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-white/40 group-hover:text-white transition-colors">
                    <AlertTriangle className="w-4 h-4" />
                    <CardTitle className="text-[10px] font-semibold uppercase tracking-widest">
                      Pending Reports
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-4xl font-semibold mb-1"
                    data-testid="text-pending-reports"
                  >
                    {statsLoading ? (
                      <Skeleton className="h-10 w-20" />
                    ) : (
                      stats?.pendingReports || 0
                    )}
                  </div>
                  <div className="text-xs font-bold text-white/20 uppercase tracking-tight">
                    {stats?.pendingAppeals || 0} pending appeals
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-[#121212] border-white/5 rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold uppercase tracking-tight">
                    Recent Activity
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-white/10 text-white/40"
                  >
                    {activity.length} events
                  </Badge>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {activity.length === 0 ? (
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 text-white/10 mx-auto mb-4" />
                      <p className="text-xs font-semibold text-white/20 uppercase tracking-widest">
                        No recent activity
                      </p>
                    </div>
                  ) : (
                    activity.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                        data-testid={`activity-${item.id}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            item.type === "ban"
                              ? "bg-red-500/20"
                              : item.type === "report"
                                ? "bg-yellow-500/20"
                                : "bg-blue-500/20"
                          }`}
                        >
                          {item.type === "ban" ? (
                            <Ban className="w-4 h-4 text-red-400" />
                          ) : item.type === "report" ? (
                            <FileText className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <Scale className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                item.type === "ban"
                                  ? "border-red-500/30 text-red-400"
                                  : item.type === "report"
                                    ? "border-yellow-500/30 text-yellow-400"
                                    : "border-blue-500/30 text-blue-400"
                              }`}
                            >
                              {item.type}
                            </Badge>
                            <span className="text-[10px] text-white/30">
                              {new Date(item.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-white/70 mt-1 truncate">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="bg-[#121212] border-white/5 rounded-xl p-8">
                  <h3 className="text-xl font-semibold uppercase tracking-tight mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-white/5 rounded-xl font-bold"
                      onClick={() => setActiveTab("announcements")}
                      data-testid="button-quick-announcement"
                    >
                      <Plus className="w-4 h-4 mr-3" /> New Announcement
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-white/5 rounded-xl font-bold"
                      onClick={() => setActiveTab("users")}
                      data-testid="button-quick-users"
                    >
                      <Users className="w-4 h-4 mr-3" /> Manage Users
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-white/5 rounded-xl font-bold"
                      onClick={() => setActiveTab("reports")}
                      data-testid="button-quick-reports"
                    >
                      <FileText className="w-4 h-4 mr-3" /> View Reports
                    </Button>
                  </div>
                </Card>

                <Card className="bg-[#121212] border-white/5 rounded-xl p-8">
                  <h3 className="text-xl font-semibold uppercase tracking-tight mb-2">
                    Platform Stats
                  </h3>
                  <div className="space-y-3 mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Products</span>
                      <span className="font-bold">
                        {stats?.totalProducts || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Announcements</span>
                      <span className="font-bold">
                        {stats?.totalAnnouncements || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Payments</span>
                      <span className="font-bold">
                        {stats?.totalPayments || 0}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="bg-red-500/10 border-red-500/20 rounded-xl p-8">
                  <h3 className="text-xl font-semibold uppercase tracking-tight text-red-500 mb-2">
                    Emergency
                  </h3>
                  <p className="text-xs font-bold text-red-500/60 uppercase mb-4">
                    Maintenance Mode
                  </p>
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 rounded-xl font-semibold uppercase tracking-tight active:scale-95 transition-all"
                    onClick={() => {
                      updateSiteSettingsMutation.mutate({
                        isOffline: true,
                        offlineMessage:
                          "Site is temporarily under maintenance.",
                      });
                    }}
                    disabled={updateSiteSettingsMutation.isPending}
                    data-testid="button-emergency-offline"
                  >
                    Enable Offline Mode
                  </Button>
                </Card>
              </div>
            </div>
          </>
        )}

        {activeTab === "users" && (
          <>
            <h1 className="text-4xl font-semibold tracking-tight uppercase">
              User Management
            </h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <Input
                placeholder="Search users by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-10 bg-white/5 border-white/5 rounded-xl w-full max-w-md"
                data-testid="input-user-search"
              />
            </div>

            <Card className="bg-[#121212] border-white/5 rounded-xl p-6">
              <h3 className="font-semibold uppercase tracking-tight text-lg mb-4">
                Change User Rank
              </h3>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">
                    User ID
                  </label>
                  <Input
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    placeholder="Paste user ID or select from list below"
                    className="bg-white/5 border-white/5 rounded-xl"
                    data-testid="input-rank-user-id"
                  />
                </div>
                <div className="w-64">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">
                    New Rank
                  </label>
                  <Select value={selectedRank} onValueChange={setSelectedRank}>
                    <SelectTrigger
                      className="bg-white/5 border-white/5 rounded-xl"
                      data-testid="select-rank"
                    >
                      <SelectValue placeholder="Select rank" />
                    </SelectTrigger>
                    <SelectContent>
                      {allRankOptions.map((rank) => (
                        <SelectItem key={rank} value={rank}>
                          {rank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => {
                    if (selectedUserId && selectedRank) {
                      updateRankMutation.mutate({
                        userId: selectedUserId,
                        userRank: selectedRank,
                      });
                    }
                  }}
                  disabled={
                    !selectedUserId ||
                    !selectedRank ||
                    updateRankMutation.isPending
                  }
                  data-testid="button-update-rank"
                >
                  {updateRankMutation.isPending ? "Updating..." : "Update Rank"}
                </Button>
              </div>
            </Card>

            <Card className="bg-[#121212] border-white/5 rounded-xl p-6">
              <h3 className="font-semibold uppercase tracking-tight text-lg mb-4">
                {userSearch
                  ? `Search Results (${displayUsers.length})`
                  : `All Users (${displayUsers.length})`}
              </h3>
              {usersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {displayUsers.length === 0 ? (
                    <p className="text-white/40 text-sm text-center py-8">
                      No users found
                    </p>
                  ) : (
                    displayUsers.map((u: any) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer"
                        onClick={() => setSelectedUserId(u.id)}
                        data-testid={`row-user-${u.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 font-bold text-sm uppercase">
                            {(u.username || u.email || "?")[0]}
                          </div>
                          <div>
                            <div className="font-bold text-sm">
                              {u.username || "No username"}
                            </div>
                            <div className="text-xs text-white/30">
                              {u.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="border-white/10 text-white/50 text-xs"
                          >
                            {u.userRank || "Member"}
                          </Badge>
                          {u.isAdmin && (
                            <Badge className="bg-red-500/20 text-red-400 text-[10px]">
                              Admin
                            </Badge>
                          )}
                          {u.isModerator && (
                            <Badge className="bg-blue-500/20 text-blue-400 text-[10px]">
                              Mod
                            </Badge>
                          )}
                          <ChevronRight className="w-4 h-4 text-white/20" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>
          </>
        )}

        {activeTab === "settings" && (
          <>
            <h1 className="text-4xl font-semibold tracking-tight uppercase">
              Platform Settings
            </h1>

            <Card className="bg-[#121212] border-white/5 rounded-xl p-8">
              <h3 className="text-xl font-semibold uppercase tracking-tight mb-6">
                Site Status
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">Offline Mode</p>
                    <p className="text-xs text-white/40 mt-1">
                      Take the site offline for maintenance
                    </p>
                  </div>
                  <Switch
                    checked={siteSettings?.isOffline || false}
                    onCheckedChange={(checked) => {
                      updateSiteSettingsMutation.mutate({ isOffline: checked });
                    }}
                    data-testid="switch-offline-mode"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">
                    Offline Message
                  </label>
                  <Textarea
                    value={
                      offlineMessageDirty
                        ? offlineMessage
                        : siteSettings?.offlineMessage || ""
                    }
                    onChange={(e) => {
                      setOfflineMessage(e.target.value);
                      setOfflineMessageDirty(true);
                    }}
                    placeholder="Message shown when site is offline..."
                    className="bg-white/5 border-white/5 rounded-xl"
                    data-testid="textarea-offline-message"
                  />
                  {offlineMessageDirty && (
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        updateSiteSettingsMutation.mutate({ offlineMessage });
                        setOfflineMessageDirty(false);
                      }}
                      disabled={updateSiteSettingsMutation.isPending}
                      data-testid="button-save-offline-message"
                    >
                      Save Message
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            <Card className="bg-[#121212] border-white/5 rounded-xl p-8">
              <h3 className="text-xl font-semibold uppercase tracking-tight mb-6">
                Platform Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  {
                    label: "Users",
                    value: stats?.totalUsers || 0,
                    icon: Users,
                  },
                  {
                    label: "Threads",
                    value: stats?.totalThreads || 0,
                    icon: MessageSquare,
                  },
                  {
                    label: "Products",
                    value: stats?.totalProducts || 0,
                    icon: TrendingUp,
                  },
                  { label: "Bans", value: stats?.activeBans || 0, icon: Ban },
                  {
                    label: "Reports",
                    value: stats?.pendingReports || 0,
                    icon: FileText,
                  },
                  {
                    label: "Appeals",
                    value: stats?.pendingAppeals || 0,
                    icon: Scale,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <div className="flex items-center gap-2 text-white/40 mb-2">
                      <stat.icon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-semibold uppercase tracking-widest">
                        {stat.label}
                      </span>
                    </div>
                    <div className="text-2xl font-semibold">
                      {stat.value.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {activeTab === "announcements" && (
          <>
            <h1 className="text-4xl font-semibold tracking-tight uppercase">
              Announcements
            </h1>

            <Card className="bg-[#121212] border-white/5 rounded-xl p-8">
              <h3 className="text-xl font-semibold uppercase tracking-tight mb-6">
                Create Announcement
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">
                    Title
                  </label>
                  <Input
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    placeholder="Announcement title..."
                    className="bg-white/5 border-white/5 rounded-xl"
                    data-testid="input-announcement-title"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">
                    Content
                  </label>
                  <Textarea
                    value={announcementContent}
                    onChange={(e) => setAnnouncementContent(e.target.value)}
                    placeholder="Write your announcement..."
                    className="bg-white/5 border-white/5 rounded-xl min-h-[150px]"
                    data-testid="input-announcement-content"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">
                      Category
                    </label>
                    <Select
                      value={announcementCategory}
                      onValueChange={setAnnouncementCategory}
                    >
                      <SelectTrigger
                        className="bg-white/5 border-white/5 rounded-xl"
                        data-testid="select-announcement-category"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Update">Update</SelectItem>
                        <SelectItem value="Event">Event</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Important">Important</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">
                      Image URL (optional)
                    </label>
                    <Input
                      value={announcementImageUrl}
                      onChange={(e) => setAnnouncementImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="bg-white/5 border-white/5 rounded-xl"
                      data-testid="input-announcement-image"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (!announcementTitle || !announcementContent) return;
                    createAnnouncementMutation.mutate({
                      title: announcementTitle,
                      content: announcementContent,
                      category: announcementCategory,
                      imageUrl: announcementImageUrl || undefined,
                      isPublished: true,
                    });
                  }}
                  disabled={
                    !announcementTitle ||
                    !announcementContent ||
                    createAnnouncementMutation.isPending
                  }
                  data-testid="button-create-announcement"
                >
                  {createAnnouncementMutation.isPending
                    ? "Publishing..."
                    : "Publish Announcement"}
                </Button>
              </div>
            </Card>

            <Card className="bg-[#121212] border-white/5 rounded-xl p-8">
              <h3 className="text-xl font-semibold uppercase tracking-tight mb-6">
                Existing Announcements ({announcements.length})
              </h3>
              <div className="space-y-3">
                {announcements.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-8">
                    No announcements yet
                  </p>
                ) : (
                  announcements.map((ann: any) => (
                    <div
                      key={ann.id}
                      className="flex items-start justify-between p-4 rounded-xl bg-white/[0.02]"
                      data-testid={`row-announcement-${ann.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">{ann.title}</span>
                          {ann.category && (
                            <Badge
                              variant="outline"
                              className="border-white/10 text-white/40 text-[10px]"
                            >
                              {ann.category}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-white/50 truncate">
                          {ann.content}
                        </p>
                        <p className="text-[10px] text-white/30 mt-1">
                          {new Date(ann.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          deleteAnnouncementMutation.mutate(ann.id)
                        }
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 shrink-0 ml-4"
                        data-testid={`button-delete-announcement-${ann.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </>
        )}

        {activeTab === "policies" && (
          <>
            <h1
              className="text-4xl font-semibold tracking-tight uppercase"
              data-testid="text-policies-title"
            >
              Policies Management
            </h1>
            <p className="text-white/40 text-sm">
              Edit and manage site policies. Changes are saved to the database
              and reflected on the public policy pages.
            </p>

            {editingPolicy ? (
              <Card
                className="bg-[#121212] border-white/5 rounded-xl"
                data-testid="card-policy-editor"
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Editing: {policySlugMap[editingPolicy] || editingPolicy}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-1.5 block">
                      Title
                    </label>
                    <Input
                      value={policyTitle}
                      onChange={(e) => setPolicyTitle(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Policy title"
                      data-testid="input-policy-title"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-1.5 block">
                      Content (HTML)
                    </label>
                    <Textarea
                      value={policyContent}
                      onChange={(e) => setPolicyContent(e.target.value)}
                      className="bg-white/5 border-white/10 text-white min-h-[400px] font-mono text-sm"
                      placeholder="Policy content in HTML format..."
                      data-testid="input-policy-content"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() =>
                        savePolicyMutation.mutate({
                          slug: editingPolicy,
                          title: policyTitle,
                          content: policyContent,
                        })
                      }
                      disabled={
                        savePolicyMutation.isPending ||
                        !policyTitle ||
                        !policyContent
                      }
                      className="bg-white text-black font-semibold"
                      data-testid="button-save-policy"
                    >
                      {savePolicyMutation.isPending
                        ? "Saving..."
                        : "Save Policy"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingPolicy(null);
                        setPolicyTitle("");
                        setPolicyContent("");
                      }}
                      className="border-white/10 text-white/70"
                      data-testid="button-cancel-policy"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {Object.entries(policySlugMap).map(([slug, label]) => {
                  const existing = policiesData.find(
                    (p: any) => p.slug === slug,
                  );
                  return (
                    <Card
                      key={slug}
                      className="bg-[#121212] border-white/5 rounded-xl p-5"
                      data-testid={`card-policy-${slug}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{label}</h3>
                          <p className="text-xs text-white/30 mt-0.5">
                            {existing
                              ? `Last updated: ${new Date(existing.updatedAt).toLocaleDateString()}`
                              : "Using default content (not yet customized)"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {existing && (
                            <Badge className="bg-green-500/20 text-green-400 text-[10px]">
                              Customized
                            </Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10 text-white/70 text-xs"
                            onClick={() => {
                              setEditingPolicy(slug);
                              setPolicyTitle(existing?.title || label);
                              setPolicyContent(existing?.content || "");
                            }}
                            data-testid={`button-edit-policy-${slug}`}
                          >
                            <FileText className="w-3 h-3 mr-1.5" />
                            {existing ? "Edit" : "Customize"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === "reports" && (
          <>
            <h1 className="text-4xl font-semibold tracking-tight uppercase">
              System Reports
            </h1>
            <div className="space-y-3">
              {reports.length === 0 ? (
                <Card className="bg-[#121212] border-white/5 rounded-xl p-8 text-center">
                  <p className="text-white/40">No reports to review</p>
                </Card>
              ) : (
                reports.map((report: any) => (
                  <Card
                    key={report.id}
                    className="bg-[#121212] border-white/5 rounded-xl p-6"
                    data-testid={`card-report-${report.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              report.status === "Pending"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              report.status === "Pending"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : report.status === "Action Taken"
                                  ? "bg-green-500/20 text-green-400"
                                  : report.status === "Reviewed"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : "bg-white/10 text-white/50"
                            }
                          >
                            {report.status}
                          </Badge>
                          <span className="text-xs text-white/30">
                            {report.targetType}
                          </span>
                        </div>
                        <p className="font-bold text-sm">{report.reason}</p>
                        {report.details && (
                          <p className="text-xs text-white/50">
                            {report.details}
                          </p>
                        )}
                        <p className="text-[10px] text-white/30">
                          Target: {report.targetId} | Reporter:{" "}
                          {report.reporterId} |{" "}
                          {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                        {report.moderatorNotes && (
                          <div className="bg-white/5 rounded-lg p-3 mt-2">
                            <p className="text-xs text-white/50">
                              <span className="font-bold">Mod Notes:</span>{" "}
                              {report.moderatorNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
