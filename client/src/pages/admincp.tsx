import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
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
  Settings,
  FileText,
  Folder,
  Ban,
  Scale,
  TrendingUp,
  Activity,
  ChevronRight,
  Megaphone,
  RefreshCw,
  Server,
  Database,
  Wifi,
  WifiOff,
  Check,
  X,
  Edit3,
  BarChart3,
  ShoppingBag,
  CreditCard,
  Clock,
  UserCheck,
  Crown,
  History,
  UserPlus,
  Bell,
  Calendar,
  CheckSquare,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [editingPolicy, setEditingPolicy] = useState<string | null>(null);
  const [policyTitle, setPolicyTitle] = useState("");
  const [policyContent, setPolicyContent] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryGroup, setNewCategoryGroup] = useState("");
  const [newCategoryOrder, setNewCategoryOrder] = useState("0");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryDescription, setEditCategoryDescription] = useState("");
  const [editCategoryGroup, setEditCategoryGroup] = useState("");
  const [editCategoryOrder, setEditCategoryOrder] = useState("0");
  const [inlineEditUserId, setInlineEditUserId] = useState<string | null>(null);
  const [inlineEditRank, setInlineEditRank] = useState("");
  const [usersSubTab, setUsersSubTab] = useState<"list" | "role-history" | "bulk">("list");
  const [bulkSelectedUserIds, setBulkSelectedUserIds] = useState<string[]>([]);
  const [bulkRank, setBulkRank] = useState("");
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerContent, setBannerContent] = useState("");
  const [quickViewUserId, setQuickViewUserId] = useState<string | null>(null);

  const adminRanks = [
    "Developer",
    "Staff Internal Affairs",
    "Team Member",
    "Staff Department Director",
    "Operations Manager",
    "Company Director",
  ];

  const isAdmin =
    user?.isAdmin ||
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
    enabled: !!isAdmin && (activeTab === "users" || activeTab === "dashboard"),
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

  const { data: forumCategories = [], isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ["/api/forums/categories"],
    enabled: !!isAdmin && activeTab === "forums",
  });

  const { data: forumStats } = useQuery<{ totalThreads: number; totalReplies: number; totalCategories: number }>({
    queryKey: ["/api/admin/forum-stats"],
    enabled: !!isAdmin && activeTab === "forums",
  });

  const { data: quickViewWarnings = [] } = useQuery<any[]>({
    queryKey: ["/api/warnings/user", quickViewUserId],
    queryFn: async () => {
      const res = await fetch(`/api/warnings/user/${quickViewUserId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!isAdmin && !!quickViewUserId,
  });

  const { data: quickViewBans = [] } = useQuery<any[]>({
    queryKey: ["/api/bans"],
    enabled: !!isAdmin && !!quickViewUserId,
  });

  const quickViewUser = useMemo(() => {
    if (!quickViewUserId) return null;
    return allUsers.find((u: any) => u.id === quickViewUserId) || null;
  }, [quickViewUserId, allUsers]);

  const quickViewUserBans = useMemo(() => {
    if (!quickViewUserId) return [];
    return quickViewBans.filter((b: any) => b.userId === quickViewUserId);
  }, [quickViewUserId, quickViewBans]);

  const { data: roleHistory = [], isLoading: roleHistoryLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/role-history"],
    enabled: !!isAdmin && activeTab === "users" && usersSubTab === "role-history",
  });

  const accountAgeDistribution = useMemo(() => {
    if (!allUsers.length) return [];
    const now = new Date();
    const buckets: Record<string, number> = {
      "< 1 week": 0,
      "1-4 weeks": 0,
      "1-3 months": 0,
      "3-6 months": 0,
      "6-12 months": 0,
      "1+ year": 0,
    };
    allUsers.forEach((u: any) => {
      if (!u.createdAt) return;
      const created = new Date(u.createdAt);
      const diffDays = Math.floor((now.getTime() - created.getTime()) / 86400000);
      if (diffDays < 7) buckets["< 1 week"]++;
      else if (diffDays < 28) buckets["1-4 weeks"]++;
      else if (diffDays < 90) buckets["1-3 months"]++;
      else if (diffDays < 180) buckets["3-6 months"]++;
      else if (diffDays < 365) buckets["6-12 months"]++;
      else buckets["1+ year"]++;
    });
    return Object.entries(buckets).map(([label, count]) => ({ label, count }));
  }, [allUsers]);

  const bulkRankMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/bulk-rank-change", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: `Rank updated for ${bulkSelectedUserIds.length} users` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/role-history"] });
      setBulkSelectedUserIds([]);
      setBulkRank("");
    },
    onError: (e: any) => {
      toast({ title: "Failed to bulk update ranks", description: e.message, variant: "destructive" });
    },
  });

  const createBannerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/announcements", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Banner announcement created" });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setBannerTitle("");
      setBannerContent("");
    },
    onError: (e: any) => {
      toast({ title: "Failed to create banner", description: e.message, variant: "destructive" });
    },
  });

  const staffActivity = useMemo(() => {
    const staffCounts: Record<string, { username: string; count: number; lastAction: string }> = {};
    activity.forEach((item: any) => {
      const actorId = item.actorId;
      if (!actorId) return;
      if (!staffCounts[actorId]) {
        const staffUser = allUsers.find((u: any) => u.id === actorId);
        staffCounts[actorId] = { username: staffUser?.username || actorId.substring(0, 8), count: 0, lastAction: "" };
      }
      staffCounts[actorId].count++;
      if (!staffCounts[actorId].lastAction || new Date(item.createdAt) > new Date(staffCounts[actorId].lastAction)) {
        staffCounts[actorId].lastAction = item.createdAt;
      }
    });
    return Object.entries(staffCounts)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [activity, allUsers]);

  const rankBreakdown = useMemo(() => {
    if (!allUsers.length) return [];
    const counts: Record<string, number> = {};
    allUsers.forEach((u: any) => {
      const rank = u.userRank || "Member";
      counts[rank] = (counts[rank] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([rank, count]) => ({ rank, count }))
      .sort((a, b) => b.count - a.count);
  }, [allUsers]);

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

  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/forum-categories", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Category created" });
      queryClient.invalidateQueries({ queryKey: ["/api/forums/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/forum-stats"] });
      setNewCategoryName("");
      setNewCategoryDescription("");
      setNewCategoryGroup("");
      setNewCategoryOrder("0");
    },
    onError: (e: any) => {
      toast({ title: "Failed to create category", description: e.message, variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await apiRequest("PATCH", `/api/admin/forum-categories/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Category updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/forums/categories"] });
      setEditingCategoryId(null);
    },
    onError: (e: any) => {
      toast({ title: "Failed to update category", description: e.message, variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/forum-categories/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Category deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/forums/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/forum-stats"] });
    },
    onError: (e: any) => {
      toast({ title: "Failed to delete category", description: e.message, variant: "destructive" });
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
      setInlineEditUserId(null);
      setInlineEditRank("");
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
      <div className="flex items-center justify-center min-h-[60vh] bg-background">
        <Skeleton className="h-[600px] w-full max-w-[1400px] rounded-md" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive" />
              <div>
                <h2 className="font-semibold text-xl text-foreground uppercase tracking-tight">
                  Access Denied
                </h2>
                <p className="text-muted-foreground text-sm mt-2">
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
    "Customer Relations",
    "Appeals Moderator",
    "Trial Moderator",
    "Moderator",
    "Administrator",
    "Senior Administrator",
    "Developer",
    "Staff Internal Affairs",
    "Team Member",
    "Staff Department Director",
    "Operations Manager",
    "Company Director",
    "Banned",
  ];

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "forums", label: "Forums", icon: MessageSquare },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "policies", label: "Policies", icon: Scale },
    { id: "reports", label: "Reports", icon: AlertTriangle },
  ];

  const displayUsers = userSearch.length >= 2 ? searchResults : allUsers;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "ban":
        return <Ban className="w-4 h-4 text-destructive" />;
      case "report":
        return <FileText className="w-4 h-4 text-yellow-400" />;
      case "appeal":
        return <Scale className="w-4 h-4 text-blue-400" />;
      case "user":
        return <UserCheck className="w-4 h-4 text-green-400" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "ban":
        return "bg-destructive/20";
      case "report":
        return "bg-yellow-500/20";
      case "appeal":
        return "bg-blue-500/20";
      case "user":
        return "bg-green-500/20";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="w-56 border-r border-border flex flex-col p-3 gap-1">
        <div className="flex items-center gap-3 px-3 py-4 mb-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <span className="font-semibold text-xs tracking-tight uppercase text-foreground block">
              Admin Panel
            </span>
            <span className="text-[10px] text-muted-foreground">
              {user?.username}
            </span>
          </div>
        </div>
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm transition-colors text-left ${
              activeTab === item.id
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover-elevate"
            }`}
            data-testid={`button-admincp-tab-${item.id}`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {activeTab === "dashboard" && (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1
                  className="text-2xl font-semibold tracking-tight text-foreground"
                  data-testid="text-admincp-title"
                >
                  Administrator Dashboard
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Platform overview and quick actions
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  queryClient.invalidateQueries({
                    queryKey: ["/api/admin/stats"],
                  })
                }
                data-testid="button-refresh-stats"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Members",
                  value: stats?.totalUsers,
                  icon: Users,
                  sub: "Registered accounts",
                  color: "text-blue-400",
                  bg: "bg-blue-500/10",
                },
                {
                  label: "Forum Activity",
                  value:
                    (stats?.totalThreads || 0) + (stats?.totalReplies || 0),
                  icon: MessageSquare,
                  sub: `${stats?.totalThreads || 0} threads, ${stats?.totalReplies || 0} replies`,
                  color: "text-green-400",
                  bg: "bg-green-500/10",
                },
                {
                  label: "Active Bans",
                  value: stats?.activeBans,
                  icon: Ban,
                  sub: "Currently enforced",
                  color: "text-red-400",
                  bg: "bg-red-500/10",
                },
                {
                  label: "Pending Items",
                  value:
                    (stats?.pendingReports || 0) +
                    (stats?.pendingAppeals || 0),
                  icon: AlertTriangle,
                  sub: `${stats?.pendingReports || 0} reports, ${stats?.pendingAppeals || 0} appeals`,
                  color: "text-yellow-400",
                  bg: "bg-yellow-500/10",
                },
              ].map((stat) => (
                <Card key={stat.label} data-testid={`card-stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {stat.label}
                      </span>
                      <div
                        className={`w-8 h-8 rounded-md ${stat.bg} flex items-center justify-center`}
                      >
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                    </div>
                    <div
                      className="text-3xl font-semibold text-foreground mb-1"
                      data-testid={`text-stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}
                    >
                      {statsLoading ? (
                        <Skeleton className="h-9 w-16" />
                      ) : (
                        (stat.value ?? 0).toLocaleString()
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{stat.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <Card className="lg:col-span-2" data-testid="card-system-health">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                    System Health
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px]">
                    Live
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      label: "Application Server",
                      icon: Server,
                      status: "Operational",
                      ok: true,
                    },
                    {
                      label: "Database",
                      icon: Database,
                      status: "Connected",
                      ok: true,
                    },
                    {
                      label: "Site Status",
                      icon: siteSettings?.isOffline ? WifiOff : Wifi,
                      status: siteSettings?.isOffline ? "Offline Mode" : "Online",
                      ok: !siteSettings?.isOffline,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-4 p-3 rounded-md bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          {item.label}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          item.ok
                            ? "border-green-500/30 text-green-400 text-[10px]"
                            : "border-yellow-500/30 text-yellow-400 text-[10px]"
                        }
                      >
                        {item.ok ? (
                          <Check className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2" data-testid="card-platform-stats">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                    Platform Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        label: "Products",
                        value: stats?.totalProducts || 0,
                        icon: ShoppingBag,
                      },
                      {
                        label: "Announcements",
                        value: stats?.totalAnnouncements || 0,
                        icon: Megaphone,
                      },
                      {
                        label: "Payments",
                        value: stats?.totalPayments || 0,
                        icon: CreditCard,
                      },
                      {
                        label: "Threads",
                        value: stats?.totalThreads || 0,
                        icon: MessageSquare,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="p-3 rounded-md bg-secondary/50 flex items-center gap-3"
                      >
                        <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            {item.label}
                          </p>
                          <p className="text-lg font-semibold text-foreground">
                            {item.value.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {rankBreakdown.length > 0 && (
              <Card data-testid="card-rank-breakdown">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                    User Rank Breakdown
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px]">
                    {allUsers.length} total
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {rankBreakdown.slice(0, 12).map(({ rank, count }) => (
                      <div
                        key={rank}
                        className="flex items-center justify-between p-2.5 rounded-md bg-secondary/50"
                        data-testid={`rank-breakdown-${rank}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Crown className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span className="text-xs text-foreground truncate">
                            {rank}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground ml-2 shrink-0">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                    Recent Activity
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px]">
                    {activity.length} events
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {activity.length === 0 ? (
                      <div className="text-center py-12">
                        <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-xs text-muted-foreground">
                          No recent activity
                        </p>
                      </div>
                    ) : (
                      activity.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 p-3 rounded-md bg-secondary/30 hover-elevate"
                          data-testid={`activity-${item.id}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${getActivityColor(item.type)}`}
                          >
                            {getActivityIcon(item.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant="outline"
                                className="text-[10px]"
                              >
                                {item.type}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(item.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-foreground/70 mt-1 truncate">
                              {item.description}
                            </p>
                            {item.actorId && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                Actor: {item.actorId.substring(0, 8)}...
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setActiveTab("announcements")}
                      data-testid="button-quick-announcement"
                    >
                      <Plus className="w-4 h-4 mr-3" /> New Announcement
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setActiveTab("users")}
                      data-testid="button-quick-users"
                    >
                      <Users className="w-4 h-4 mr-3" /> Manage Users
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setActiveTab("reports")}
                      data-testid="button-quick-reports"
                    >
                      <FileText className="w-4 h-4 mr-3" /> View Reports
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setActiveTab("settings")}
                      data-testid="button-quick-settings"
                    >
                      <Settings className="w-4 h-4 mr-3" /> Platform Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-destructive/30 bg-destructive/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-destructive">
                      Emergency
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-3">
                      Enable maintenance mode to take the site offline.
                    </p>
                    <Button
                      variant="destructive"
                      className="w-full"
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
                      <WifiOff className="w-4 h-4 mr-2" />
                      Enable Offline Mode
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {staffActivity.length > 0 && (
              <Card data-testid="card-staff-activity">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                    Staff Activity
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px]">
                    Most Active
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {staffActivity.map((staff, i) => (
                      <div
                        key={staff.id}
                        className="flex items-center justify-between gap-4 p-3 rounded-md bg-secondary/30"
                        data-testid={`row-staff-activity-${staff.id}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                            {i + 1}
                          </div>
                          <span className="font-medium text-sm text-foreground truncate">
                            {staff.username}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <Badge variant="secondary" className="text-[10px]">
                            {staff.count} action{staff.count !== 1 ? "s" : ""}
                          </Badge>
                          {staff.lastAction && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(staff.lastAction).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card data-testid="card-system-banner">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    Quick Banner Announcement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">Create a quick site-wide banner announcement.</p>
                  <Input
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    placeholder="Banner title..."
                    data-testid="input-banner-title"
                  />
                  <Textarea
                    value={bannerContent}
                    onChange={(e) => setBannerContent(e.target.value)}
                    placeholder="Banner message..."
                    className="resize-none min-h-[80px]"
                    data-testid="input-banner-content"
                  />
                  <Button
                    onClick={() => {
                      if (!bannerTitle || !bannerContent) return;
                      createBannerMutation.mutate({
                        title: bannerTitle,
                        content: bannerContent,
                        category: "Important",
                        isPublished: true,
                      });
                    }}
                    disabled={!bannerTitle || !bannerContent || createBannerMutation.isPending}
                    className="w-full"
                    data-testid="button-create-banner"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    {createBannerMutation.isPending ? "Publishing..." : "Publish Banner"}
                  </Button>
                </CardContent>
              </Card>

              <Card data-testid="card-account-age-stats">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Account Age Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {accountAgeDistribution.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No data available</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {accountAgeDistribution.map(({ label, count }) => {
                        const maxCount = Math.max(...accountAgeDistribution.map((d) => d.count), 1);
                        const pct = Math.round((count / maxCount) * 100);
                        return (
                          <div key={label} className="space-y-1" data-testid={`age-bucket-${label.replace(/\s/g, "-")}`}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-muted-foreground">{label}</span>
                              <span className="text-xs font-medium text-foreground">{count}</span>
                            </div>
                            <div className="w-full h-2 rounded-md bg-secondary overflow-hidden">
                              <div
                                className="h-full rounded-md bg-primary/60 transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === "users" && (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  User Management
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Search, view, and manage user roles
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={usersSubTab === "list" ? "default" : "outline"}
                  onClick={() => setUsersSubTab("list")}
                  data-testid="button-users-subtab-list"
                >
                  <Users className="w-3 h-3 mr-1" /> Users
                </Button>
                <Button
                  size="sm"
                  variant={usersSubTab === "role-history" ? "default" : "outline"}
                  onClick={() => setUsersSubTab("role-history")}
                  data-testid="button-users-subtab-role-history"
                >
                  <History className="w-3 h-3 mr-1" /> Role History
                </Button>
                <Button
                  size="sm"
                  variant={usersSubTab === "bulk" ? "default" : "outline"}
                  onClick={() => setUsersSubTab("bulk")}
                  data-testid="button-users-subtab-bulk"
                >
                  <CheckSquare className="w-3 h-3 mr-1" /> Bulk Actions
                </Button>
              </div>
            </div>

            {usersSubTab === "role-history" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                    Role Change History
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px]">{roleHistory.length}</Badge>
                </CardHeader>
                <CardContent>
                  {roleHistoryLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-14 w-full rounded-md" />
                      ))}
                    </div>
                  ) : roleHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No role changes recorded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-[600px] overflow-y-auto">
                      {roleHistory.map((log: any) => {
                        let meta: any = {};
                        try { meta = JSON.parse(log.metadata || "{}"); } catch {}
                        return (
                          <div
                            key={log.id}
                            className="flex items-center gap-3 p-3 rounded-md bg-secondary/30"
                            data-testid={`row-role-history-${log.id}`}
                          >
                            <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
                              <Crown className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium">{log.target?.username || log.targetId?.substring(0, 8)}</span>
                                {meta.oldRank && (
                                  <>
                                    <Badge variant="outline" className="text-[10px]">{meta.oldRank}</Badge>
                                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                  </>
                                )}
                                {meta.newRank && (
                                  <Badge variant="secondary" className="text-[10px]">{meta.newRank}</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5 flex-wrap">
                                <span>by {log.actor?.username || log.actorId?.substring(0, 8)}</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {usersSubTab === "bulk" && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                    Bulk Rank Change
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground">Select users from the list below and assign them a new rank all at once.</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Select value={bulkRank} onValueChange={setBulkRank}>
                      <SelectTrigger className="w-[200px]" data-testid="select-bulk-rank">
                        <SelectValue placeholder="Select rank..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allRankOptions.map((rank) => (
                          <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      disabled={bulkSelectedUserIds.length === 0 || !bulkRank || bulkRankMutation.isPending}
                      onClick={() => {
                        bulkRankMutation.mutate({ userIds: bulkSelectedUserIds, userRank: bulkRank });
                      }}
                      data-testid="button-apply-bulk-rank"
                    >
                      {bulkRankMutation.isPending ? "Applying..." : `Apply to ${bulkSelectedUserIds.length} User${bulkSelectedUserIds.length !== 1 ? "s" : ""}`}
                    </Button>
                    {bulkSelectedUserIds.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBulkSelectedUserIds([])}
                        data-testid="button-clear-bulk-selection"
                      >
                        Clear Selection
                      </Button>
                    )}
                  </div>
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-10"
                      data-testid="input-bulk-user-search"
                    />
                  </div>
                  <div className="space-y-1 max-h-[500px] overflow-y-auto">
                    {displayUsers.map((u: any) => (
                      <div
                        key={u.id}
                        className="flex items-center gap-3 p-3 rounded-md bg-secondary/30 hover-elevate cursor-pointer"
                        onClick={() => {
                          setBulkSelectedUserIds((prev) =>
                            prev.includes(u.id) ? prev.filter((id) => id !== u.id) : [...prev, u.id]
                          );
                        }}
                        data-testid={`row-bulk-user-${u.id}`}
                      >
                        <Checkbox
                          checked={bulkSelectedUserIds.includes(u.id)}
                          onCheckedChange={(checked) => {
                            setBulkSelectedUserIds((prev) =>
                              checked ? [...prev, u.id] : prev.filter((id) => id !== u.id)
                            );
                          }}
                          data-testid={`checkbox-bulk-user-${u.id}`}
                        />
                        <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-muted-foreground font-semibold text-xs uppercase shrink-0">
                          {(u.username || u.email || "?")[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground truncate">{u.username || "No username"}</div>
                          <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">{u.userRank || "Member"}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {usersSubTab === "list" && (
              <>
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10"
                    data-testid="input-user-search"
                  />
                </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                  {userSearch
                    ? `Search Results (${displayUsers.length})`
                    : `All Users (${displayUsers.length})`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-14 w-full rounded-md" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1 max-h-[600px] overflow-y-auto">
                    {displayUsers.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                          No users found
                        </p>
                      </div>
                    ) : (
                      displayUsers.map((u: any) => (
                        <div key={u.id}>
                        <div
                          className="flex items-center justify-between gap-4 p-3 rounded-md bg-secondary/30 hover-elevate cursor-pointer"
                          data-testid={`row-user-${u.id}`}
                          onClick={() => setQuickViewUserId(quickViewUserId === u.id ? null : u.id)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center text-muted-foreground font-semibold text-sm uppercase shrink-0">
                              {(u.username || u.email || "?")[0]}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-sm text-foreground truncate">
                                {u.username || "No username"}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {u.email}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                            {inlineEditUserId === u.id ? (
                              <div className="flex items-center gap-2">
                                <Select
                                  value={inlineEditRank}
                                  onValueChange={setInlineEditRank}
                                >
                                  <SelectTrigger
                                    className="w-40"
                                    data-testid={`select-inline-rank-${u.id}`}
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
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    if (inlineEditRank) {
                                      updateRankMutation.mutate({
                                        userId: u.id,
                                        userRank: inlineEditRank,
                                      });
                                    }
                                  }}
                                  disabled={
                                    !inlineEditRank ||
                                    updateRankMutation.isPending
                                  }
                                  data-testid={`button-save-rank-${u.id}`}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setInlineEditUserId(null);
                                    setInlineEditRank("");
                                  }}
                                  data-testid={`button-cancel-rank-${u.id}`}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {u.userRank || "Member"}
                                </Badge>
                                {u.isAdmin && (
                                  <Badge variant="secondary" className="text-[10px]">
                                    Admin
                                  </Badge>
                                )}
                                {u.isModerator && (
                                  <Badge variant="secondary" className="text-[10px]">
                                    Mod
                                  </Badge>
                                )}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setInlineEditUserId(u.id);
                                    setInlineEditRank(u.userRank || "Member");
                                  }}
                                  data-testid={`button-edit-rank-${u.id}`}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        {quickViewUserId === u.id && quickViewUser && (
                          <div className="mt-1 p-4 rounded-md bg-secondary/50 space-y-3" data-testid={`panel-quick-view-${u.id}`}>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Rank</p>
                                <p className="text-sm font-medium text-foreground">{quickViewUser.userRank || "Member"}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">VIP Tier</p>
                                <p className="text-sm font-medium text-foreground">{quickViewUser.vipTier || "None"}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Joined</p>
                                <p className="text-sm font-medium text-foreground">{quickViewUser.createdAt ? new Date(quickViewUser.createdAt).toLocaleDateString() : "Unknown"}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Warnings</p>
                                <p className="text-sm font-medium text-foreground">{quickViewWarnings.length} ({quickViewWarnings.filter((w: any) => w.isActive).length} active)</p>
                              </div>
                            </div>
                            {quickViewUser.bio && (
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Bio</p>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{quickViewUser.bio}</p>
                              </div>
                            )}
                            {(quickViewUser.additionalRanks || []).length > 0 && (
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Additional Ranks</p>
                                <div className="flex gap-1 flex-wrap">
                                  {quickViewUser.additionalRanks.map((r: string) => (
                                    <Badge key={r} variant="outline" className="text-[10px]">{r}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {quickViewUserBans.length > 0 && (
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Ban History</p>
                                <div className="space-y-1">
                                  {quickViewUserBans.slice(0, 3).map((b: any) => (
                                    <div key={b.id} className="flex items-center gap-2 text-xs">
                                      <Badge variant="outline" className={b.isActive ? "bg-red-500/20 text-red-400 border-red-500/30 text-[10px]" : "text-[10px]"}>
                                        {b.isActive ? "Active" : "Lifted"}
                                      </Badge>
                                      <span className="text-muted-foreground truncate">{b.reason}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button size="sm" variant="outline" asChild>
                                <a href={`/user/${u.id}`} data-testid={`link-view-profile-${u.id}`}>View Profile</a>
                              </Button>
                              <Button size="sm" variant="outline" asChild>
                                <a href={`/modcp?tab=warnings&userId=${u.id}`} data-testid={`link-view-user-warnings-${u.id}`}>View Warnings</a>
                              </Button>
                            </div>
                          </div>
                        )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
              </>
            )}
          </>
        )}

        {activeTab === "settings" && (
          <>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Platform Settings
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Configure site behavior and maintenance mode
              </p>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                  Site Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between gap-4 p-4 rounded-md bg-secondary/50">
                  <div className="flex items-center gap-3">
                    {siteSettings?.isOffline ? (
                      <WifiOff className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <Wifi className="w-5 h-5 text-green-400" />
                    )}
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        Offline Mode
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {siteSettings?.isOffline
                          ? "Site is currently offline"
                          : "Site is live and accessible"}
                      </p>
                    </div>
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
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                  Platform Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                      icon: ShoppingBag,
                    },
                    {
                      label: "Bans",
                      value: stats?.activeBans || 0,
                      icon: Ban,
                    },
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
                      className="p-3 rounded-md bg-secondary/50 flex items-center gap-3"
                    >
                      <stat.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {stat.label}
                        </p>
                        <p className="text-xl font-semibold text-foreground">
                          {stat.value.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "forums" && (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1
                  className="text-2xl font-semibold tracking-tight text-foreground"
                  data-testid="text-admincp-forums-title"
                >
                  Forum Management
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage forum categories and view statistics
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/forums/categories"] });
                  queryClient.invalidateQueries({ queryKey: ["/api/admin/forum-stats"] });
                }}
                data-testid="button-refresh-forum-stats"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Total Threads", value: forumStats?.totalThreads || 0, icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-500/10" },
                { label: "Total Replies", value: forumStats?.totalReplies || 0, icon: MessageSquare, color: "text-green-400", bg: "bg-green-500/10" },
                { label: "Categories", value: forumStats?.totalCategories || 0, icon: Folder, color: "text-purple-400", bg: "bg-purple-500/10" },
              ].map((stat) => (
                <Card key={stat.label} data-testid={`card-forum-stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {stat.label}
                      </span>
                      <div className={`w-8 h-8 rounded-md ${stat.bg} flex items-center justify-center`}>
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="text-3xl font-semibold text-foreground" data-testid={`text-forum-stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}>
                      {stat.value.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card data-testid="card-create-category">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                  Create Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Name
                    </label>
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Category name..."
                      data-testid="input-category-name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Group
                    </label>
                    <Input
                      value={newCategoryGroup}
                      onChange={(e) => setNewCategoryGroup(e.target.value)}
                      placeholder="e.g. Community, Staff..."
                      data-testid="input-category-group"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Description
                  </label>
                  <Textarea
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder="Category description..."
                    data-testid="input-category-description"
                  />
                </div>
                <div className="w-32">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Order
                  </label>
                  <Input
                    type="number"
                    value={newCategoryOrder}
                    onChange={(e) => setNewCategoryOrder(e.target.value)}
                    data-testid="input-category-order"
                  />
                </div>
                <Button
                  onClick={() => {
                    if (!newCategoryName) return;
                    createCategoryMutation.mutate({
                      name: newCategoryName,
                      description: newCategoryDescription || undefined,
                      group: newCategoryGroup || undefined,
                      order: parseInt(newCategoryOrder) || 0,
                    });
                  }}
                  disabled={!newCategoryName || createCategoryMutation.isPending}
                  data-testid="button-create-category"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="card-categories-list">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                  Forum Categories
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  {forumCategories.length}
                </Badge>
              </CardHeader>
              <CardContent>
                {categoriesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : forumCategories.length === 0 ? (
                  <div className="text-center py-12">
                    <Folder className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No forum categories yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {forumCategories.map((cat: any) => (
                      <div
                        key={cat.id}
                        className="p-4 rounded-md bg-secondary/30"
                        data-testid={`row-category-${cat.id}`}
                      >
                        {editingCategoryId === cat.id ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
                                <Input
                                  value={editCategoryName}
                                  onChange={(e) => setEditCategoryName(e.target.value)}
                                  data-testid={`input-edit-category-name-${cat.id}`}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Group</label>
                                <Input
                                  value={editCategoryGroup}
                                  onChange={(e) => setEditCategoryGroup(e.target.value)}
                                  data-testid={`input-edit-category-group-${cat.id}`}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                              <Textarea
                                value={editCategoryDescription}
                                onChange={(e) => setEditCategoryDescription(e.target.value)}
                                data-testid={`input-edit-category-description-${cat.id}`}
                              />
                            </div>
                            <div className="w-32">
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Order</label>
                              <Input
                                type="number"
                                value={editCategoryOrder}
                                onChange={(e) => setEditCategoryOrder(e.target.value)}
                                data-testid={`input-edit-category-order-${cat.id}`}
                              />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                size="sm"
                                onClick={() => {
                                  updateCategoryMutation.mutate({
                                    id: cat.id,
                                    name: editCategoryName,
                                    description: editCategoryDescription || undefined,
                                    group: editCategoryGroup || undefined,
                                    order: parseInt(editCategoryOrder) || 0,
                                  });
                                }}
                                disabled={!editCategoryName || updateCategoryMutation.isPending}
                                data-testid={`button-save-category-${cat.id}`}
                              >
                                <Check className="w-3 h-3 mr-1.5" />
                                {updateCategoryMutation.isPending ? "Saving..." : "Save"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingCategoryId(null)}
                                data-testid={`button-cancel-edit-category-${cat.id}`}
                              >
                                <X className="w-3 h-3 mr-1.5" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-medium text-sm text-foreground">
                                  {cat.name}
                                </span>
                                {cat.group && (
                                  <Badge variant="outline" className="text-[10px]">
                                    {cat.group}
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-[10px]">
                                  Order: {cat.order ?? 0}
                                </Badge>
                              </div>
                              {cat.description && (
                                <p className="text-xs text-muted-foreground">
                                  {cat.description}
                                </p>
                              )}
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {cat.threadCount || 0} threads
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setEditingCategoryId(cat.id);
                                  setEditCategoryName(cat.name);
                                  setEditCategoryDescription(cat.description || "");
                                  setEditCategoryGroup(cat.group || "");
                                  setEditCategoryOrder(String(cat.order ?? 0));
                                }}
                                data-testid={`button-edit-category-${cat.id}`}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteCategoryMutation.mutate(cat.id)}
                                data-testid={`button-delete-category-${cat.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "announcements" && (
          <>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Announcements
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Create and manage site-wide announcements
              </p>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                  Create Announcement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Title
                  </label>
                  <Input
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    placeholder="Announcement title..."
                    data-testid="input-announcement-title"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Content
                  </label>
                  <Textarea
                    value={announcementContent}
                    onChange={(e) => setAnnouncementContent(e.target.value)}
                    placeholder="Write your announcement..."
                    className="min-h-[150px]"
                    data-testid="input-announcement-content"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Category
                    </label>
                    <Select
                      value={announcementCategory}
                      onValueChange={setAnnouncementCategory}
                    >
                      <SelectTrigger data-testid="select-announcement-category">
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
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Image URL (optional)
                    </label>
                    <Input
                      value={announcementImageUrl}
                      onChange={(e) => setAnnouncementImageUrl(e.target.value)}
                      placeholder="https://..."
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                  Existing Announcements
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  {announcements.length}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {announcements.length === 0 ? (
                    <div className="text-center py-12">
                      <Megaphone className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No announcements yet
                      </p>
                    </div>
                  ) : (
                    announcements.map((ann: any) => (
                      <div
                        key={ann.id}
                        className="flex items-start justify-between gap-4 p-4 rounded-md bg-secondary/30"
                        data-testid={`row-announcement-${ann.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-sm text-foreground">
                              {ann.title}
                            </span>
                            {ann.category && (
                              <Badge variant="outline" className="text-[10px]">
                                {ann.category}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {ann.content}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(ann.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            deleteAnnouncementMutation.mutate(ann.id)
                          }
                          data-testid={`button-delete-announcement-${ann.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "policies" && (
          <>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Policies Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Edit and manage site policies. Changes are saved to the database
                and reflected on the public policy pages.
              </p>
            </div>

            {editingPolicy ? (
              <Card data-testid="card-policy-editor">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">
                    Editing: {policySlugMap[editingPolicy] || editingPolicy}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Title
                    </label>
                    <Input
                      value={policyTitle}
                      onChange={(e) => setPolicyTitle(e.target.value)}
                      placeholder="Policy title"
                      data-testid="input-policy-title"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Content (HTML)
                    </label>
                    <Textarea
                      value={policyContent}
                      onChange={(e) => setPolicyContent(e.target.value)}
                      className="min-h-[400px] font-mono text-sm"
                      placeholder="Policy content in HTML format..."
                      data-testid="input-policy-content"
                    />
                  </div>
                  <div className="flex gap-3 flex-wrap">
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
                      data-testid="button-cancel-policy"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {Object.entries(policySlugMap).map(([slug, label]) => {
                  const existing = policiesData.find(
                    (p: any) => p.slug === slug,
                  );
                  return (
                    <Card
                      key={slug}
                      data-testid={`card-policy-${slug}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <h3 className="font-medium text-sm text-foreground">
                                {label}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {existing
                                  ? `Last updated: ${new Date(existing.updatedAt).toLocaleDateString()}`
                                  : "Using default content"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {existing && (
                              <Badge
                                variant="outline"
                                className="border-green-500/30 text-green-400 text-[10px]"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Customized
                              </Badge>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingPolicy(slug);
                                setPolicyTitle(existing?.title || label);
                                setPolicyContent(existing?.content || "");
                              }}
                              data-testid={`button-edit-policy-${slug}`}
                            >
                              <Edit3 className="w-3 h-3 mr-1.5" />
                              {existing ? "Edit" : "Customize"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === "reports" && (
          <>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                System Reports
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Review submitted reports and take action
              </p>
            </div>
            <div className="space-y-2">
              {reports.length === 0 ? (
                <Card>
                  <CardContent className="p-8">
                    <div className="text-center">
                      <AlertTriangle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No reports to review
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                reports.map((report: any) => (
                  <Card
                    key={report.id}
                    data-testid={`card-report-${report.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant={
                                report.status === "pending"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                report.status === "pending"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : report.status === "action_taken"
                                    ? "bg-green-500/20 text-green-400"
                                    : report.status === "reviewed"
                                      ? "bg-blue-500/20 text-blue-400"
                                      : ""
                              }
                            >
                              {report.status}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {report.targetType}
                            </Badge>
                          </div>
                          <p className="font-medium text-sm text-foreground">
                            {report.reason}
                          </p>
                          {report.details && (
                            <p className="text-xs text-muted-foreground">
                              {report.details}
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(report.createdAt).toLocaleDateString()} |
                            Target: {report.targetId?.substring(0, 8)}... |
                            Reporter: {report.reporterId?.substring(0, 8)}...
                          </p>
                          {report.moderatorNotes && (
                            <div className="bg-secondary/50 rounded-md p-3 mt-2">
                              <p className="text-xs text-muted-foreground">
                                <span className="font-semibold text-foreground">
                                  Mod Notes:
                                </span>{" "}
                                {report.moderatorNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
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
