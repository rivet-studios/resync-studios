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
      items.push({
        type: "ban",
        date: ban.createdAt,
        data: ban,
      });
    });

    reports.forEach((report: any) => {
      items.push({
        type: "report",
        date: report.createdAt,
        data: report,
      });
    });

    pendingAppeals.forEach((appeal: any) => {
      items.push({
        type: "appeal",
        date: appeal.createdAt,
        data: appeal,
      });
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
      case "7days":
        now.setDate(now.getDate() + 7);
        return now.toISOString();
      case "30days":
        now.setDate(now.getDate() + 30);
        return now.toISOString();
      default:
        return null;
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#050505]">
        <Skeleton className="h-[600px] w-full max-w-[1400px] rounded-xl" />
      </div>
    );
  }

  if (!isMod) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#050505]">
        <Card className="w-full max-w-md bg-[#121212] border-white/5">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500" />
              <div>
                <h2 className="font-semibold text-xl text-white uppercase tracking-tight">Access Denied</h2>
                <p className="text-white/40 text-sm mt-2">
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
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "bans", label: "Ban Management", icon: Ban },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "appeals", label: "Appeals", icon: Scale },
  ];

  function getActivityIcon(type: string) {
    switch (type) {
      case "ban": return <Ban className="w-4 h-4 text-red-400" />;
      case "report": return <FileText className="w-4 h-4 text-yellow-400" />;
      case "appeal": return <Scale className="w-4 h-4 text-blue-400" />;
      default: return <History className="w-4 h-4 text-white/40" />;
    }
  }

  function getActivityLabel(item: { type: string; data: any }) {
    switch (item.type) {
      case "ban":
        return `Ban issued on ${item.data.user?.username || item.data.userId} — ${item.data.reason}`;
      case "report":
        return `Report (${item.data.status}) — ${item.data.reason}`;
      case "appeal":
        return `Appeal (${item.data.status}) from ${item.data.user?.username || item.data.userId}`;
      default:
        return "Unknown activity";
    }
  }

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <div className="w-64 border-r border-white/5 flex flex-col p-4 space-y-2">
        <div className="flex items-center gap-3 px-4 py-6 mb-4">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-semibold text-sm italic">RS</span>
          </div>
          <span className="font-semibold text-sm tracking-tight uppercase">ModCP</span>
        </div>
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === item.id
                ? "bg-white/5 text-white"
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
            data-testid={`button-modcp-tab-${item.id}`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-8 space-y-8 overflow-y-auto">
        {activeTab === "dashboard" && (
          <>
            <h1 className="text-4xl font-semibold tracking-tight uppercase">Moderator Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-[#121212] border-white/5 rounded-xl overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-white/40">
                    <Ban className="w-4 h-4" />
                    <CardTitle className="text-[10px] font-semibold uppercase tracking-widest">Active Bans</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-semibold mb-1" data-testid="text-active-bans-count">{activeBans.filter((b: any) => b.isActive).length || "—"}</div>
                </CardContent>
              </Card>
              <Card className="bg-[#121212] border-white/5 rounded-xl overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-white/40">
                    <FileText className="w-4 h-4" />
                    <CardTitle className="text-[10px] font-semibold uppercase tracking-widest">Open Reports</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-semibold mb-1" data-testid="text-open-reports-count">{reports.filter((r: any) => r.status === "Pending").length || "—"}</div>
                </CardContent>
              </Card>
              <Card className="bg-[#121212] border-white/5 rounded-xl overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-white/40">
                    <Scale className="w-4 h-4" />
                    <CardTitle className="text-[10px] font-semibold uppercase tracking-widest">Pending Appeals</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-semibold mb-1" data-testid="text-pending-appeals-count">{pendingAppeals.filter((a: any) => a.status === "pending").length || "—"}</div>
                </CardContent>
              </Card>
              <Card className="bg-[#121212] border-white/5 rounded-xl overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-white/40">
                    <Clock className="w-4 h-4" />
                    <CardTitle className="text-[10px] font-semibold uppercase tracking-widest">Mod Since</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold mb-1">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</div>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-[#121212] border-white/5 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-white/40" />
                <h4 className="font-semibold uppercase tracking-tight">Recent Activity</h4>
              </div>
              {activityFeed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <History className="w-12 h-12 text-white/10 mx-auto mb-2" />
                  <p className="text-xs font-bold text-white/10 uppercase tracking-widest">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activityFeed.map((item, index) => (
                    <div
                      key={`${item.type}-${item.data.id}-${index}`}
                      className="flex items-start gap-3 bg-white/5 rounded-xl p-3"
                      data-testid={`row-activity-${index}`}
                    >
                      <div className="mt-0.5">{getActivityIcon(item.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80 truncate">{getActivityLabel(item)}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">
                          {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          item.type === "ban" ? "border-red-500/30 text-red-400" :
                          item.type === "report" ? "border-yellow-500/30 text-yellow-400" :
                          "border-blue-500/30 text-blue-400"
                        }
                      >
                        {item.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {activeTab === "bans" && (
          <>
            <h1 className="text-4xl font-semibold tracking-tight uppercase">Ban Management</h1>
            <Card className="bg-[#121212] border-white/5 rounded-xl p-6">
              <h3 className="font-semibold uppercase tracking-tight text-lg mb-4 flex items-center gap-2">
                <Gavel className="w-5 h-5" /> Issue New Ban
              </h3>
              <div className="space-y-4">
                <div className="relative">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">Search User</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
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
                      className="bg-white/5 border-white/5 rounded-xl pl-10"
                      data-testid="input-ban-user-search"
                    />
                  </div>
                  {banUserId && banUsername && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="border-white/10 text-white/70">
                        <Users className="w-3 h-3 mr-1" />
                        {banUsername}
                      </Badge>
                      <button
                        onClick={() => {
                          setBanUserId("");
                          setBanUsername("");
                          setUserSearchQuery("");
                        }}
                        className="text-white/30 text-xs"
                        data-testid="button-clear-user-selection"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {showUserDropdown && userSearchQuery.length >= 2 && searchResults.length > 0 && !banUserId && (
                    <div className="absolute z-10 w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl max-h-48 overflow-y-auto">
                      {searchResults.map((u: any) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setBanUserId(u.id);
                            setBanUsername(u.username || u.email);
                            setUserSearchQuery(u.username || u.email);
                            setShowUserDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 flex items-center gap-2"
                          data-testid={`option-user-${u.id}`}
                        >
                          <Users className="w-3 h-3 text-white/30" />
                          <span className="text-white/80">{u.username || "—"}</span>
                          <span className="text-white/30 text-xs">{u.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {showUserDropdown && userSearchQuery.length >= 2 && searchResults.length === 0 && !banUserId && (
                    <div className="absolute z-10 w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl p-3">
                      <p className="text-xs text-white/30 text-center">No users found</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">Reason</label>
                  <Textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Reason for ban..."
                    className="bg-white/5 border-white/5 rounded-xl"
                    data-testid="input-ban-reason"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">Duration</label>
                  <Select value={banDuration} onValueChange={setBanDuration}>
                    <SelectTrigger className="bg-white/5 border-white/5 rounded-xl" data-testid="select-ban-duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1day">1 Day</SelectItem>
                      <SelectItem value="7days">7 Days</SelectItem>
                      <SelectItem value="30days">30 Days</SelectItem>
                      <SelectItem value="permanent">Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => {
                    if (!banUserId || !banReason) return;
                    const isPermanent = banDuration === "permanent";
                    const expiresAt = calculateExpiresAt(banDuration);
                    createBanMutation.mutate({
                      userId: banUserId,
                      reason: banReason,
                      isPermanent,
                      ...(expiresAt ? { expiresAt } : {}),
                    });
                  }}
                  disabled={!banUserId || !banReason || createBanMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                  data-testid="button-issue-ban"
                >
                  {createBanMutation.isPending ? "Issuing..." : "Issue Ban"}
                </Button>
              </div>
            </Card>

            <Card className="bg-[#121212] border-white/5 rounded-xl p-6">
              <h3 className="font-semibold uppercase tracking-tight text-lg mb-4">Active Bans</h3>
              <div className="space-y-3">
                {activeBans.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-8">No active bans</p>
                ) : (
                  activeBans.filter((b: any) => b.isActive).map((ban: any) => (
                    <div key={ban.id} className="bg-white/5 rounded-xl p-4 flex items-start justify-between gap-4" data-testid={`row-ban-${ban.id}`}>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm">{ban.user?.username || ban.userId}</span>
                          <Badge variant="outline" className={ban.isPermanent ? "border-red-500/50 text-red-400" : "border-yellow-500/50 text-yellow-400"}>
                            {ban.isPermanent ? "Permanent" : "Temporary"}
                          </Badge>
                          {ban.expiresAt && !ban.isPermanent && (
                            <span className="text-[10px] text-white/30">
                              Expires: {new Date(ban.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/50">{ban.reason}</p>
                        <p className="text-[10px] text-white/30">
                          Banned by: {ban.bannedByUser?.username || ban.bannedBy} | {new Date(ban.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => liftBanMutation.mutate(ban.id)}
                        disabled={liftBanMutation.isPending}
                        className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                        data-testid={`button-lift-ban-${ban.id}`}
                      >
                        Lift Ban
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </>
        )}

        {activeTab === "reports" && (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h1 className="text-4xl font-semibold tracking-tight uppercase">Reports</h1>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-white/40" />
                <Select value={reportFilter} onValueChange={setReportFilter}>
                  <SelectTrigger className="bg-white/5 border-white/5 rounded-xl w-[160px]" data-testid="select-report-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Reviewed">Reviewed</SelectItem>
                    <SelectItem value="Dismissed">Dismissed</SelectItem>
                    <SelectItem value="Action Taken">Action Taken</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3">
              {filteredReports.length === 0 ? (
                <Card className="bg-[#121212] border-white/5 rounded-xl p-8 text-center">
                  <p className="text-white/40">No reports to review{reportFilter !== "All" ? ` with status "${reportFilter}"` : ""}</p>
                </Card>
              ) : (
                filteredReports.map((report: any) => (
                  <Card key={report.id} className="bg-[#121212] border-white/5 rounded-xl p-6" data-testid={`card-report-${report.id}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/modcp/case/report/${report.id}`}>
                            <span className="text-[10px] text-blue-400 hover:text-blue-300 cursor-pointer font-semibold uppercase tracking-wider" data-testid={`link-view-report-${report.id}`}>View Case</span>
                          </Link>
                          <Badge
                            variant={report.status === "Pending" ? "default" : "secondary"}
                            className={
                              report.status === "Pending"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : report.status === "Action Taken"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-white/10 text-white/50"
                            }
                          >
                            {report.status}
                          </Badge>
                          <span className="text-xs text-white/30">{report.targetType}</span>
                        </div>
                        <p className="font-bold text-sm">{report.reason}</p>
                        {report.details && <p className="text-xs text-white/50">{report.details}</p>}
                        <p className="text-[10px] text-white/30">
                          Target: {report.targetId} | Reporter: {report.reporterId} | {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                        {report.moderatorNotes && (
                          <div className="bg-white/5 rounded-lg p-3 mt-2">
                            <p className="text-xs text-white/50">
                              <span className="font-bold">Mod Notes:</span> {report.moderatorNotes}
                            </p>
                          </div>
                        )}
                        {report.status === "Pending" && (
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <Input
                              placeholder="Moderator notes..."
                              value={reportNotes[report.id] || ""}
                              onChange={(e) => setReportNotes((prev) => ({ ...prev, [report.id]: e.target.value }))}
                              className="bg-white/5 border-white/5 rounded-lg text-xs flex-1"
                              data-testid={`input-report-notes-${report.id}`}
                            />
                            <Button
                              size="sm"
                              onClick={() => updateReportMutation.mutate({ id: report.id, status: "Reviewed", moderatorNotes: reportNotes[report.id] })}
                              className="bg-blue-600 hover:bg-blue-700"
                              data-testid={`button-review-report-${report.id}`}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" /> Reviewed
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateReportMutation.mutate({ id: report.id, status: "Action Taken", moderatorNotes: reportNotes[report.id] })}
                              className="bg-green-600 hover:bg-green-700"
                              data-testid={`button-action-report-${report.id}`}
                            >
                              Action Taken
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReportMutation.mutate({ id: report.id, status: "Dismissed", moderatorNotes: reportNotes[report.id] })}
                              className="border-white/10"
                              data-testid={`button-dismiss-report-${report.id}`}
                            >
                              <XCircle className="w-3 h-3 mr-1" /> Dismiss
                            </Button>
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

        {activeTab === "appeals" && (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h1 className="text-4xl font-semibold tracking-tight uppercase">Appeals Queue</h1>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-white/40" />
                <Select value={appealFilter} onValueChange={setAppealFilter}>
                  <SelectTrigger className="bg-white/5 border-white/5 rounded-xl w-[160px]" data-testid="select-appeal-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3">
              {filteredAppeals.length === 0 ? (
                <Card className="bg-[#121212] border-white/5 rounded-xl p-8 text-center">
                  <p className="text-white/40">No appeals to review{appealFilter !== "All" ? ` with status "${appealFilter}"` : ""}</p>
                </Card>
              ) : (
                filteredAppeals.map((appeal: any) => (
                  <Card key={appeal.id} className="bg-[#121212] border-white/5 rounded-xl p-6" data-testid={`card-appeal-${appeal.id}`}>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/modcp/case/appeal/${appeal.id}`}>
                          <span className="text-[10px] text-blue-400 hover:text-blue-300 cursor-pointer font-semibold uppercase tracking-wider" data-testid={`link-view-appeal-${appeal.id}`}>View Case</span>
                        </Link>
                        <Badge
                          className={
                            appeal.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : appeal.status === "approved"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }
                        >
                          {appeal.status}
                        </Badge>
                        <span className="font-bold text-sm">{appeal.user?.username || appeal.userId}</span>
                        {appeal.user?.email && (
                          <span className="text-xs text-white/30">{appeal.user.email}</span>
                        )}
                      </div>
                      <p className="text-sm text-white/70">{appeal.reason}</p>
                      <p className="text-[10px] text-white/30">
                        Submitted: {new Date(appeal.createdAt).toLocaleDateString()}
                        {appeal.banId && ` | Ban ID: ${appeal.banId}`}
                      </p>
                      {appeal.status === "pending" && (
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <Input
                            placeholder="Review notes..."
                            value={appealNotes[appeal.id] || ""}
                            onChange={(e) => setAppealNotes((prev) => ({ ...prev, [appeal.id]: e.target.value }))}
                            className="bg-white/5 border-white/5 rounded-lg text-xs flex-1"
                            data-testid={`input-appeal-notes-${appeal.id}`}
                          />
                          <Button
                            size="sm"
                            onClick={() => updateAppealMutation.mutate({ id: appeal.id, status: "approved", reviewNotes: appealNotes[appeal.id] })}
                            className="bg-green-600 hover:bg-green-700"
                            data-testid={`button-approve-appeal-${appeal.id}`}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => updateAppealMutation.mutate({ id: appeal.id, status: "denied", reviewNotes: appealNotes[appeal.id] })}
                            data-testid={`button-deny-appeal-${appeal.id}`}
                          >
                            <XCircle className="w-3 h-3 mr-1" /> Deny
                          </Button>
                        </div>
                      )}
                      {appeal.reviewNotes && (
                        <div className="bg-white/5 rounded-lg p-3 mt-2">
                          <p className="text-xs text-white/50">
                            <span className="font-bold">Review Notes:</span> {appeal.reviewNotes}
                          </p>
                        </div>
                      )}
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