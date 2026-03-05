import { useState } from "react";
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
} from "lucide-react";

export default function ModCP() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [banUserId, setBanUserId] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banIsPermanent, setBanIsPermanent] = useState("true");
  const [reportNotes, setReportNotes] = useState<Record<string, string>>({});
  const [appealNotes, setAppealNotes] = useState<Record<string, string>>({});

  const staffRanks = [
    "RS Volunteer Staff",
    "RS Trust & Safety Team",
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

  const { data: allUsers = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: isMod && activeTab === "bans",
  });

  const createBanMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/bans", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Ban issued successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/bans"] });
      setBanUserId("");
      setBanReason("");
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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#050505]">
        <Skeleton className="h-[600px] w-full max-w-[1400px] rounded-3xl" />
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
                <h2 className="font-black text-xl text-white uppercase tracking-tighter">Access Denied</h2>
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

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <div className="w-64 border-r border-white/5 flex flex-col p-4 space-y-2">
        <div className="flex items-center gap-3 px-4 py-6 mb-4">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-sm italic">RS</span>
          </div>
          <span className="font-black text-sm tracking-tighter uppercase">ModCP</span>
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
            <h1 className="text-4xl font-black tracking-tighter uppercase">Moderator Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-[#121212] border-white/5 rounded-3xl overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-white/40">
                    <Ban className="w-4 h-4" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest">Active Bans</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black mb-1">{activeBans.filter((b: any) => b.isActive).length || "—"}</div>
                </CardContent>
              </Card>
              <Card className="bg-[#121212] border-white/5 rounded-3xl overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-white/40">
                    <FileText className="w-4 h-4" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest">Open Reports</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black mb-1">{reports.filter((r: any) => r.status === "Pending").length || "—"}</div>
                </CardContent>
              </Card>
              <Card className="bg-[#121212] border-white/5 rounded-3xl overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-white/40">
                    <Scale className="w-4 h-4" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest">Pending Appeals</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black mb-1">{pendingAppeals.filter((a: any) => a.status === "pending").length || "—"}</div>
                </CardContent>
              </Card>
              <Card className="bg-[#121212] border-white/5 rounded-3xl overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-white/40">
                    <Clock className="w-4 h-4" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest">Mod Since</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-black mb-1">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</div>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-[#121212] border-white/5 rounded-3xl p-8 min-h-[200px] flex flex-col items-center justify-center">
              <History className="w-12 h-12 text-white/10 mx-auto mb-2" />
              <h4 className="font-black uppercase tracking-tighter text-white/40">Recent Activity</h4>
              <p className="text-xs font-bold text-white/10 uppercase tracking-widest">Select a tab to manage moderation</p>
            </Card>
          </>
        )}

        {activeTab === "bans" && (
          <>
            <h1 className="text-4xl font-black tracking-tighter uppercase">Ban Management</h1>
            <Card className="bg-[#121212] border-white/5 rounded-3xl p-6">
              <h3 className="font-black uppercase tracking-tighter text-lg mb-4 flex items-center gap-2">
                <Gavel className="w-5 h-5" /> Issue New Ban
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">User ID</label>
                  <Input
                    value={banUserId}
                    onChange={(e) => setBanUserId(e.target.value)}
                    placeholder="Enter user ID to ban"
                    className="bg-white/5 border-white/5 rounded-xl"
                    data-testid="input-ban-user-id"
                  />
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
                  <Select value={banIsPermanent} onValueChange={setBanIsPermanent}>
                    <SelectTrigger className="bg-white/5 border-white/5 rounded-xl" data-testid="select-ban-duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Permanent</SelectItem>
                      <SelectItem value="false">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => {
                    if (!banUserId || !banReason) return;
                    createBanMutation.mutate({
                      userId: banUserId,
                      reason: banReason,
                      isPermanent: banIsPermanent === "true",
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

            <Card className="bg-[#121212] border-white/5 rounded-3xl p-6">
              <h3 className="font-black uppercase tracking-tighter text-lg mb-4">Active Bans</h3>
              <div className="space-y-3">
                {activeBans.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-8">No active bans</p>
                ) : (
                  activeBans.filter((b: any) => b.isActive).map((ban: any) => (
                    <div key={ban.id} className="bg-white/5 rounded-xl p-4 flex items-start justify-between gap-4" data-testid={`row-ban-${ban.id}`}>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{ban.user?.username || ban.userId}</span>
                          <Badge variant="outline" className={ban.isPermanent ? "border-red-500/50 text-red-400" : "border-yellow-500/50 text-yellow-400"}>
                            {ban.isPermanent ? "Permanent" : "Temporary"}
                          </Badge>
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
            <h1 className="text-4xl font-black tracking-tighter uppercase">Reports</h1>
            <div className="space-y-3">
              {reports.length === 0 ? (
                <Card className="bg-[#121212] border-white/5 rounded-3xl p-8 text-center">
                  <p className="text-white/40">No reports to review</p>
                </Card>
              ) : (
                reports.map((report: any) => (
                  <Card key={report.id} className="bg-[#121212] border-white/5 rounded-3xl p-6" data-testid={`card-report-${report.id}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
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
                        {report.status === "Pending" && (
                          <div className="flex items-center gap-2 mt-3">
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
            <h1 className="text-4xl font-black tracking-tighter uppercase">Appeals Queue</h1>
            <div className="space-y-3">
              {pendingAppeals.length === 0 ? (
                <Card className="bg-[#121212] border-white/5 rounded-3xl p-8 text-center">
                  <p className="text-white/40">No appeals to review</p>
                </Card>
              ) : (
                pendingAppeals.map((appeal: any) => (
                  <Card key={appeal.id} className="bg-[#121212] border-white/5 rounded-3xl p-6" data-testid={`card-appeal-${appeal.id}`}>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
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
                        <div className="flex items-center gap-2 mt-3">
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
