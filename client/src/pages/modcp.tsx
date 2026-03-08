import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
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
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Users,
  Shield,
  AlertTriangle,
  Ban,
  FileText,
  Clock,
  History,
  LayoutDashboard,
  Gavel,
  Scale,
  CheckCircle,
  XCircle,
  Filter,
  TrendingUp,
  Eye,
  MessageSquare,
  Calendar,
  User,
  ArrowRight,
} from "lucide-react";

export default function ModCP() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [banUserId, setBanUserId] = useState("");
  const [banUsername, setBanUsername] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("permanent");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [reportNotes, setReportNotes] = useState<Record<string, string>>({});
  const [appealNotes, setAppealNotes] = useState<Record<string, string>>({});
  const [reportFilter, setReportFilter] = useState("All");
  const [appealFilter, setAppealFilter] = useState("All");

  const staffRanks = [
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
  ];

  const isMod =
    user?.isAdmin ||
    user?.isModerator ||
    staffRanks.includes(user?.userRank || "") ||
    (user?.additionalRanks || []).some((r: string) => staffRanks.includes(r));

  const { data: activeBans = [] } = useQuery<any[]>({
    queryKey: ["/api/bans"],
    enabled: isMod && (activeTab === "bans" || activeTab === "dashboard"),
  });

  const { data: reports = [] } = useQuery<any[]>({
    queryKey: ["/api/reports"],
    enabled: isMod && (activeTab === "reports" || activeTab === "dashboard"),
  });

  const { data: pendingAppeals = [] } = useQuery<any[]>({
    queryKey: ["/api/appeals"],
    enabled: isMod && (activeTab === "appeals" || activeTab === "dashboard"),
  });

  const { data: searchResults = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/search-users", userSearchQuery],
    queryFn: async () => {
      const res = await fetch(`/api/admin/search-users?q=${encodeURIComponent(userSearchQuery)}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: isMod && activeTab === "bans" && userSearchQuery.length >= 2,
  });

  const activityFeed = useMemo(() => {
    const items: Array<{ type: string; date: string; data: any }> = [];

    activeBans.forEach((ban: any) => {
      items.push({ type: "ban", date: ban.createdAt, data: ban });
    });

    reports.forEach((report: any) => {
      items.push({ type: "report", date: report.createdAt, data: report });
    });

    pendingAppeals.forEach((appeal: any) => {
      items.push({ type: "appeal", date: appeal.createdAt, data: appeal });
    });

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items.slice(0, 15);
  }, [activeBans, reports, pendingAppeals]);

  const filteredReports = useMemo(() => {
    if (reportFilter === "All") return reports;
    return reports.filter((r: any) => r.status === reportFilter);
  }, [reports, reportFilter]);

  const filteredAppeals = useMemo(() => {
    if (appealFilter === "All") return pendingAppeals;
    return pendingAppeals.filter((a: any) => a.status === appealFilter);
  }, [pendingAppeals, appealFilter]);

  const activeBanCount = activeBans.filter((b: any) => b.isActive).length;
  const openReportsCount = reports.filter((r: any) => r.status === "Pending").length;
  const pendingAppealsCount = pendingAppeals.filter((a: any) => a.status === "Pending").length;
  const resolvedReportsCount = reports.filter((r: any) => r.status !== "Pending").length;

  const createBanMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/bans", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Ban issued successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/bans"] });
      setBanUserId("");
      setBanUsername("");
      setBanReason("");
      setBanDuration("permanent");
      setUserSearchQuery("");
    },
    onError: (e: any) => {
      toast({ title: "Failed to issue ban", description: e.message, variant: "destructive" });
    },
  });

  const liftBanMutation = useMutation({
    mutationFn: async (banId: string) => {
      const res = await apiRequest("DELETE", `/api/bans/${banId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Ban lifted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/bans"] });
    },
    onError: (e: any) => {
      toast({ title: "Failed to lift ban", description: e.message, variant: "destructive" });
    },
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ id, status, moderatorNotes }: any) => {
      const res = await apiRequest("PATCH", `/api/reports/${id}`, { status, moderatorNotes });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Report updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
    },
    onError: (e: any) => {
      toast({ title: "Failed to update report", description: e.message, variant: "destructive" });
    },
  });

  const updateAppealMutation = useMutation({
    mutationFn: async ({ id, status, reviewNotes }: any) => {
      const res = await apiRequest("PATCH", `/api/appeals/${id}`, { status, reviewNotes });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Appeal updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/appeals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bans"] });
    },
    onError: (e: any) => {
      toast({ title: "Failed to update appeal", description: e.message, variant: "destructive" });
    },
  });

  function calculateExpiresAt(duration: string): string | null {
    if (duration === "permanent") return null;
    const now = new Date();
    switch (duration) {
      case "1day":
        now.setDate(now.getDate() + 1);
        return now.toISOString();
      case "3days":
        now.setDate(now.getDate() + 3);
        return now.toISOString();
      case "7days":
        now.setDate(now.getDate() + 7);
        return now.toISOString();
      case "14days":
        now.setDate(now.getDate() + 14);
        return now.toISOString();
      case "30days":
        now.setDate(now.getDate() + 30);
        return now.toISOString();
      case "90days":
        now.setDate(now.getDate() + 90);
        return now.toISOString();
      default:
        return null;
    }
  }

  function getDurationLabel(duration: string): string {
    switch (duration) {
      case "1day": return "1 Day";
      case "3days": return "3 Days";
      case "7days": return "7 Days";
      case "14days": return "14 Days";
      case "30days": return "30 Days";
      case "90days": return "90 Days";
      case "permanent": return "Permanent";
      default: return duration;
    }
  }

  function getRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  function getStatusBadgeClasses(status: string): string {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Approved":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Denied":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "In Review":
      case "Reviewed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Action Taken":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Dismissed":
        return "bg-white/10 text-white/50 border-white/10";
      default:
        return "bg-white/10 text-white/50 border-white/10";
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-background">
        <Skeleton className="h-[600px] w-full max-w-[1400px] rounded-md" />
      </div>
    );
  }

  if (!isMod) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive" />
              <div>
                <h2 className="font-semibold text-xl uppercase tracking-tight" data-testid="text-access-denied">Access Denied</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  You do not have permission to access the Moderator Control Panel.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, count: undefined },
    { id: "bans", label: "Ban Management", icon: Ban, count: activeBanCount || undefined },
    { id: "reports", label: "Reports", icon: FileText, count: openReportsCount || undefined },
    { id: "appeals", label: "Appeals", icon: Scale, count: pendingAppealsCount || undefined },
  ];

  function getActivityIcon(type: string) {
    switch (type) {
      case "ban": return <Ban className="w-4 h-4 text-red-400" />;
      case "report": return <FileText className="w-4 h-4 text-yellow-400" />;
      case "appeal": return <Scale className="w-4 h-4 text-blue-400" />;
      default: return <History className="w-4 h-4 text-muted-foreground" />;
    }
  }

  function getActivityLabel(item: { type: string; data: any }) {
    switch (item.type) {
      case "ban":
        return `Ban issued on ${item.data.user?.username || item.data.userId}`;
      case "report":
        return `Report: ${item.data.reason}`;
      case "appeal":
        return `Appeal from ${item.data.user?.username || item.data.userId}`;
      default:
        return "Unknown activity";
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="w-64 border-r border-border flex flex-col p-4 space-y-1">
        <div className="flex items-center gap-3 px-4 py-6 mb-2">
          <div className="w-8 h-8 bg-foreground rounded-md flex items-center justify-center">
            <Shield className="w-4 h-4 text-background" />
          </div>
          <div>
            <span className="font-semibold text-sm tracking-tight uppercase block">ModCP</span>
            <span className="text-[10px] text-muted-foreground">{user?.username}</span>
          </div>
        </div>

        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-md font-medium text-sm transition-colors w-full text-left ${
              activeTab === item.id
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover-elevate"
            }`}
            data-testid={`button-modcp-tab-${item.id}`}
          >
            <item.icon className="w-4 h-4" />
            <span className="flex-1">{item.label}</span>
            {item.count !== undefined && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {item.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 p-8 space-y-6 overflow-y-auto">
        {activeTab === "dashboard" && (
          <>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-modcp-title">Moderator Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Overview of moderation activity and pending items.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover-elevate cursor-pointer" onClick={() => setActiveTab("bans")}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Bans</CardTitle>
                  <Ban className="w-4 h-4 text-red-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="text-active-bans-count">{activeBanCount || "0"}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-muted-foreground">{activeBans.length} total bans</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate cursor-pointer" onClick={() => setActiveTab("reports")}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Open Reports</CardTitle>
                  <FileText className="w-4 h-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="text-open-reports-count">{openReportsCount || "0"}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{resolvedReportsCount} resolved</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate cursor-pointer" onClick={() => setActiveTab("appeals")}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Appeals</CardTitle>
                  <Scale className="w-4 h-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="text-pending-appeals-count">{pendingAppealsCount || "0"}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-muted-foreground">{pendingAppeals.length} total appeals</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mod Since</CardTitle>
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{user?.userRank}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {(openReportsCount > 0 || pendingAppealsCount > 0) && (
              <Card className="border-yellow-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Items requiring attention</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {openReportsCount > 0 && `${openReportsCount} pending report${openReportsCount !== 1 ? "s" : ""}`}
                        {openReportsCount > 0 && pendingAppealsCount > 0 && " and "}
                        {pendingAppealsCount > 0 && `${pendingAppealsCount} pending appeal${pendingAppealsCount !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {openReportsCount > 0 && (
                        <Button size="sm" variant="outline" onClick={() => setActiveTab("reports")} data-testid="button-go-reports">
                          Reports <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                      {pendingAppealsCount > 0 && (
                        <Button size="sm" variant="outline" onClick={() => setActiveTab("appeals")} data-testid="button-go-appeals">
                          Appeals <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-tight flex items-center gap-2">
                  <History className="w-4 h-4 text-muted-foreground" />
                  Recent Activity
                </CardTitle>
                <Badge variant="secondary">{activityFeed.length}</Badge>
              </CardHeader>
              <CardContent>
                {activityFeed.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <History className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {activityFeed.map((item, index) => (
                      <div
                        key={`${item.type}-${item.data.id}-${index}`}
                        className="flex items-center gap-3 rounded-md p-2.5 hover-elevate"
                        data-testid={`row-activity-${index}`}
                      >
                        <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                          {getActivityIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{getActivityLabel(item)}</p>
                          <p className="text-[11px] text-muted-foreground">{getRelativeTime(item.date)}</p>
                        </div>
                        <Badge variant="outline" className={getStatusBadgeClasses(
                          item.type === "ban" ? (item.data.isActive ? "Pending" : "Dismissed") :
                          item.data.status || "Pending"
                        )}>
                          {item.type === "ban" ? (item.data.isActive ? "Active" : "Lifted") : item.data.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "bans" && (
          <>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-bans-title">Ban Management</h1>
              <p className="text-sm text-muted-foreground mt-1">Issue and manage user bans.</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-tight flex items-center gap-2">
                  <Gavel className="w-4 h-4" /> Issue New Ban
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Search User</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={userSearchQuery}
                      onChange={(e) => {
                        setUserSearchQuery(e.target.value);
                        setShowUserDropdown(true);
                        if (!e.target.value) {
                          setBanUserId("");
                          setBanUsername("");
                        }
                      }}
                      onFocus={() => setShowUserDropdown(true)}
                      placeholder="Search by username or email..."
                      className="pl-10"
                      data-testid="input-ban-user-search"
                    />
                  </div>
                  {banUserId && banUsername && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary">
                        <User className="w-3 h-3 mr-1" />
                        {banUsername}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setBanUserId("");
                          setBanUsername("");
                          setUserSearchQuery("");
                        }}
                        data-testid="button-clear-user-selection"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {showUserDropdown && userSearchQuery.length >= 2 && searchResults.length > 0 && !banUserId && (
                    <Card className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto">
                      <CardContent className="p-1">
                        {searchResults.map((u: any) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              setBanUserId(u.id);
                              setBanUsername(u.username || u.email);
                              setUserSearchQuery(u.username || u.email);
                              setShowUserDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm rounded-md hover-elevate flex items-center gap-3"
                            data-testid={`option-user-${u.id}`}
                          >
                            <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                              <User className="w-3 h-3 text-muted-foreground" />
                            </div>
                            <span className="font-medium">{u.username || "—"}</span>
                            <span className="text-muted-foreground text-xs">{u.email}</span>
                          </button>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  {showUserDropdown && userSearchQuery.length >= 2 && searchResults.length === 0 && !banUserId && (
                    <Card className="absolute z-10 w-full mt-1">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground text-center">No users found</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Reason</label>
                  <Textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Reason for ban..."
                    className="resize-none"
                    data-testid="input-ban-reason"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Duration</label>
                  <Select value={banDuration} onValueChange={setBanDuration}>
                    <SelectTrigger data-testid="select-ban-duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1day">1 Day</SelectItem>
                      <SelectItem value="3days">3 Days</SelectItem>
                      <SelectItem value="7days">7 Days</SelectItem>
                      <SelectItem value="14days">14 Days</SelectItem>
                      <SelectItem value="30days">30 Days</SelectItem>
                      <SelectItem value="90days">90 Days</SelectItem>
                      <SelectItem value="permanent">Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Selected: {getDurationLabel(banDuration)}
                    {banDuration !== "permanent" && ` — Expires ${new Date(Date.now() + (
                      banDuration === "1day" ? 86400000 :
                      banDuration === "3days" ? 259200000 :
                      banDuration === "7days" ? 604800000 :
                      banDuration === "14days" ? 1209600000 :
                      banDuration === "30days" ? 2592000000 :
                      banDuration === "90days" ? 7776000000 : 0
                    )).toLocaleDateString()}`}
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={!banUserId || !banReason || createBanMutation.isPending}
                      variant="destructive"
                      data-testid="button-issue-ban"
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      {createBanMutation.isPending ? "Issuing..." : "Issue Ban"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Ban</AlertDialogTitle>
                      <AlertDialogDescription>
                        You are about to ban <strong>{banUsername}</strong> for <strong>{getDurationLabel(banDuration)}</strong>.
                        <br />Reason: {banReason}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          const isPermanent = banDuration === "permanent";
                          const expiresAt = calculateExpiresAt(banDuration);
                          createBanMutation.mutate({
                            userId: banUserId,
                            reason: banReason,
                            isPermanent,
                            ...(expiresAt ? { expiresAt } : {}),
                          });
                        }}
                        data-testid="button-confirm-ban"
                      >
                        Issue Ban
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-tight">Active Bans</CardTitle>
                <Badge variant="secondary">{activeBanCount}</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activeBans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Shield className="w-10 h-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">No active bans</p>
                    </div>
                  ) : (
                    activeBans.filter((b: any) => b.isActive).map((ban: any) => (
                      <div key={ban.id} className="flex items-start justify-between gap-4 rounded-md border border-border p-4" data-testid={`row-ban-${ban.id}`}>
                        <div className="flex gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-md bg-red-500/10 flex items-center justify-center shrink-0">
                            <Ban className="w-4 h-4 text-red-400" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm">{ban.user?.username || ban.userId}</span>
                              <Badge variant="outline" className={ban.isPermanent ? "border-red-500/30 text-red-400" : "border-yellow-500/30 text-yellow-400"}>
                                {ban.isPermanent ? "Permanent" : "Temporary"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{ban.reason}</p>
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {ban.bannedByUser?.username || ban.bannedBy}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {getRelativeTime(ban.createdAt)}
                              </span>
                              {ban.expiresAt && !ban.isPermanent && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Expires: {new Date(ban.expiresAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={liftBanMutation.isPending}
                              data-testid={`button-lift-ban-${ban.id}`}
                            >
                              Lift Ban
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Lift Ban</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to lift the ban on <strong>{ban.user?.username || ban.userId}</strong>?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => liftBanMutation.mutate(ban.id)}
                                data-testid={`button-confirm-lift-ban-${ban.id}`}
                              >
                                Lift Ban
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "reports" && (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-reports-title">Reports</h1>
                <p className="text-sm text-muted-foreground mt-1">{filteredReports.length} report{filteredReports.length !== 1 ? "s" : ""} {reportFilter !== "All" ? `with status "${reportFilter}"` : "total"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={reportFilter} onValueChange={setReportFilter}>
                  <SelectTrigger className="w-[160px]" data-testid="select-report-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Review">In Review</SelectItem>
                    <SelectItem value="Reviewed">Reviewed</SelectItem>
                    <SelectItem value="Action Taken">Action Taken</SelectItem>
                    <SelectItem value="Dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredReports.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-10 h-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No reports{reportFilter !== "All" ? ` with status "${reportFilter}"` : " to review"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredReports.map((report: any) => (
                  <Card key={report.id} data-testid={`card-report-${report.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-md bg-yellow-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className={getStatusBadgeClasses(report.status)}>
                                {report.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{report.targetType}</span>
                              <span className="text-[11px] text-muted-foreground">{getRelativeTime(report.createdAt)}</span>
                            </div>
                            <Link href={`/modcp/case/report/${report.id}`}>
                              <Button size="sm" variant="ghost" data-testid={`link-view-report-${report.id}`}>
                                <Eye className="w-3 h-3 mr-1" /> View Case
                              </Button>
                            </Link>
                          </div>

                          <p className="font-medium text-sm">{report.reason}</p>
                          {report.details && <p className="text-xs text-muted-foreground">{report.details}</p>}

                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                            <span>Target: <span className="font-mono">{report.targetId}</span></span>
                            <span>Reporter: <span className="font-mono">{report.reporterId}</span></span>
                          </div>

                          {report.moderatorNotes && (
                            <div className="bg-muted rounded-md p-3">
                              <p className="text-xs text-muted-foreground">
                                <span className="font-semibold">Mod Notes:</span> {report.moderatorNotes}
                              </p>
                            </div>
                          )}

                          {report.status === "Pending" && (
                            <div className="flex items-center gap-2 pt-2 flex-wrap">
                              <Input
                                placeholder="Moderator notes..."
                                value={reportNotes[report.id] || ""}
                                onChange={(e) => setReportNotes((prev) => ({ ...prev, [report.id]: e.target.value }))}
                                className="text-xs flex-1"
                                data-testid={`input-report-notes-${report.id}`}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateReportMutation.mutate({ id: report.id, status: "In Review", moderatorNotes: reportNotes[report.id] })}
                                disabled={updateReportMutation.isPending}
                                data-testid={`button-review-report-${report.id}`}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" /> In Review
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => updateReportMutation.mutate({ id: report.id, status: "Action Taken", moderatorNotes: reportNotes[report.id] })}
                                disabled={updateReportMutation.isPending}
                                data-testid={`button-action-report-${report.id}`}
                              >
                                Action Taken
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateReportMutation.mutate({ id: report.id, status: "Dismissed", moderatorNotes: reportNotes[report.id] })}
                                disabled={updateReportMutation.isPending}
                                data-testid={`button-dismiss-report-${report.id}`}
                              >
                                <XCircle className="w-3 h-3 mr-1" /> Dismiss
                              </Button>
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

        {activeTab === "appeals" && (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-appeals-title">Appeals Queue</h1>
                <p className="text-sm text-muted-foreground mt-1">{filteredAppeals.length} appeal{filteredAppeals.length !== 1 ? "s" : ""} {appealFilter !== "All" ? `with status "${appealFilter}"` : "total"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={appealFilter} onValueChange={setAppealFilter}>
                  <SelectTrigger className="w-[160px]" data-testid="select-appeal-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredAppeals.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Scale className="w-10 h-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No appeals{appealFilter !== "All" ? ` with status "${appealFilter}"` : " to review"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredAppeals.map((appeal: any) => (
                  <Card key={appeal.id} data-testid={`card-appeal-${appeal.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Scale className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className={getStatusBadgeClasses(appeal.status)}>
                                {appeal.status}
                              </Badge>
                              <span className="font-semibold text-sm">{appeal.user?.username || appeal.userId}</span>
                              {appeal.user?.email && (
                                <span className="text-xs text-muted-foreground">{appeal.user.email}</span>
                              )}
                            </div>
                            <Link href={`/modcp/case/appeal/${appeal.id}`}>
                              <Button size="sm" variant="ghost" data-testid={`link-view-appeal-${appeal.id}`}>
                                <Eye className="w-3 h-3 mr-1" /> View Case
                              </Button>
                            </Link>
                          </div>

                          <p className="text-sm text-muted-foreground">{appeal.reason}</p>

                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {getRelativeTime(appeal.createdAt)}
                            </span>
                            {appeal.banId && (
                              <span>Ban ID: <span className="font-mono">{appeal.banId}</span></span>
                            )}
                          </div>

                          {appeal.reviewNotes && (
                            <div className="bg-muted rounded-md p-3">
                              <p className="text-xs text-muted-foreground">
                                <span className="font-semibold">Review Notes:</span> {appeal.reviewNotes}
                              </p>
                            </div>
                          )}

                          {appeal.status === "Pending" && (
                            <div className="flex items-center gap-2 pt-2 flex-wrap">
                              <Input
                                placeholder="Review notes..."
                                value={appealNotes[appeal.id] || ""}
                                onChange={(e) => setAppealNotes((prev) => ({ ...prev, [appeal.id]: e.target.value }))}
                                className="text-xs flex-1"
                                data-testid={`input-appeal-notes-${appeal.id}`}
                              />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    data-testid={`button-approve-appeal-${appeal.id}`}
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" /> Approve
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Approve Appeal</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Approving this appeal will lift the associated ban for <strong>{appeal.user?.username || appeal.userId}</strong>. Are you sure?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => updateAppealMutation.mutate({ id: appeal.id, status: "Approved", reviewNotes: appealNotes[appeal.id] })}
                                      data-testid={`button-confirm-approve-${appeal.id}`}
                                    >
                                      Approve
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    data-testid={`button-deny-appeal-${appeal.id}`}
                                  >
                                    <XCircle className="w-3 h-3 mr-1" /> Deny
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Deny Appeal</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will deny the appeal from <strong>{appeal.user?.username || appeal.userId}</strong>. Their ban will remain active.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => updateAppealMutation.mutate({ id: appeal.id, status: "Denied", reviewNotes: appealNotes[appeal.id] })}
                                      data-testid={`button-confirm-deny-${appeal.id}`}
                                    >
                                      Deny
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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
