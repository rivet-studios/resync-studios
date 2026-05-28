import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import logoSvg from "@assets/logo.svg";
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
  MessageSquareText,
  Calendar,
  User,
  ArrowRight,
  Pin,
  Lock,
  Unlock,
  Trash2,
  FolderOpen,
  PinOff,
  TriangleAlert,
  ShieldAlert,
  CircleSlash,
  ClipboardList,
  Zap,
  UserPlus,
} from "lucide-react";
import { VerifiedBadge } from "@/components/verified-badge";

const MODCP_TAB_IDS = [
  "dashboard",
  "bans",
  "reports",
  "appeals",
  "warnings",
  "mass-warning",
  "escalations",
  "forums",
  "audit",
];

export default function ModCP() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [, tabParams] = useRoute("/modcp/:tab");
  const resolveInitialTab = () => {
    const fromPath = tabParams?.tab;
    if (fromPath && MODCP_TAB_IDS.includes(fromPath)) return fromPath;
    const fromQuery = new URLSearchParams(window.location.search).get("tab");
    if (fromQuery && MODCP_TAB_IDS.includes(fromQuery)) return fromQuery;
    return "dashboard";
  };
  const [activeTab, setActiveTabState] = useState<string>(resolveInitialTab);
  // Keep activeTab in sync when the URL changes (back/forward, deep links).
  useEffect(() => {
    const fromPath = tabParams?.tab;
    if (fromPath && MODCP_TAB_IDS.includes(fromPath) && fromPath !== activeTab) {
      setActiveTabState(fromPath);
    }
  }, [tabParams?.tab]);
  const setActiveTab = (tabId: string) => {
    setActiveTabState(tabId);
    const target = `/modcp/${tabId}`;
    if (location !== target) navigate(target);
  };
  const [banUserId, setBanUserId] = useState("");
  const [banUsername, setBanUsername] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("permanent");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [reportNotes, setReportNotes] = useState<Record<string, string>>({});
  const [appealNotes, setAppealNotes] = useState<Record<string, string>>({});
  const [reportFilter, setReportFilter] = useState("all");
  const [appealFilter, setAppealFilter] = useState("all");
  const [forumSearchQuery, setForumSearchQuery] = useState("");
  const [forumFilter, setForumFilter] = useState<"all" | "pinned" | "locked">(
    "all",
  );
  const [moveThreadId, setMoveThreadId] = useState<string | null>(null);
  const [moveCategoryId, setMoveCategoryId] = useState("");
  const [warningUserId, setWarningUserId] = useState("");
  const [warningUsername, setWarningUsername] = useState("");
  const [warningReason, setWarningReason] = useState("");
  const [warningSeverity, setWarningSeverity] = useState<
    "Verbal" | "Written" | "Final"
  >("Verbal");
  const [warningSearchQuery, setWarningSearchQuery] = useState("");
  const [showWarningUserDropdown, setShowWarningUserDropdown] = useState(false);
  const [warningFilter, setWarningFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [auditActionFilter, setAuditActionFilter] = useState("All");
  const [auditActorFilter, setAuditActorFilter] = useState("");
  const [auditTargetFilter, setAuditTargetFilter] = useState("");
  const [massWarningUserIds, setMassWarningUserIds] = useState<string[]>([]);
  const [massWarningUsernames, setMassWarningUsernames] = useState<
    Record<string, string>
  >({});
  const [massWarningReason, setMassWarningReason] = useState("");
  const [massWarningSeverity, setMassWarningSeverity] = useState<
    "Verbal" | "Written" | "Final"
  >("Verbal");
  const [massWarningSearchQuery, setMassWarningSearchQuery] = useState("");
  const [showMassWarningDropdown, setShowMassWarningDropdown] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const userId = params.get("userId");
    if (tab) setActiveTab(tab);
    if (userId && tab === "warnings") {
      setWarningUserId(userId);
      fetch(`/api/users/${userId}`, { credentials: "include" })
        .then((r) => r.json())
        .then((u) => {
          if (u?.username) setWarningUsername(u.username);
        })
        .catch(() => {});
    }
    if (userId && tab === "bans") {
      setBanUserId(userId);
      fetch(`/api/users/${userId}`, { credentials: "include" })
        .then((r) => r.json())
        .then((u) => {
          if (u?.username) setBanUsername(u.username);
        })
        .catch(() => {});
    }
  }, []);

  const staffRanks = [
    "Community Moderator",
    "Community Administrator",
    "Community Senior Administrator",
    "Gameplay Engineer",
    "Creative Designer",
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
      const res = await fetch(
        `/api/admin/search-users?q=${encodeURIComponent(userSearchQuery)}`,
        {
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: isMod && activeTab === "bans" && userSearchQuery.length >= 2,
  });

  const { data: warnings = [], isLoading: warningsLoading } = useQuery<any[]>({
    queryKey: ["/api/warnings"],
    enabled: isMod && (activeTab === "warnings" || activeTab === "dashboard"),
  });

  const { data: warningSearchResults = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/search-users", warningSearchQuery],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/search-users?q=${encodeURIComponent(warningSearchQuery)}`,
        {
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled:
      isMod && activeTab === "warnings" && warningSearchQuery.length >= 2,
  });

  const { data: forumThreads = [], isLoading: threadsLoading } = useQuery<
    any[]
  >({
    queryKey: ["/api/forums/threads"],
    enabled: isMod && (activeTab === "forums" || activeTab === "dashboard"),
  });

  const { data: forumCategories = [] } = useQuery<any[]>({
    queryKey: ["/api/forums/categories"],
    enabled: isMod && activeTab === "forums",
  });

  const { data: moderationLogs = [], isLoading: logsLoading } = useQuery<any[]>(
    {
      queryKey: ["/api/moderation-logs"],
      enabled: isMod && (activeTab === "audit" || activeTab === "dashboard"),
    },
  );

  const { data: escalations = [], isLoading: escalationsLoading } = useQuery<
    any[]
  >({
    queryKey: ["/api/warnings/escalations"],
    enabled:
      isMod && (activeTab === "escalations" || activeTab === "dashboard"),
  });

  const { data: massWarningSearchResults = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/search-users", massWarningSearchQuery],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/search-users?q=${encodeURIComponent(massWarningSearchQuery)}`,
        {
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled:
      isMod &&
      activeTab === "mass-warning" &&
      massWarningSearchQuery.length >= 2,
  });

  const massWarningMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/warnings/mass", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: `Mass warning issued to ${massWarningUserIds.length} users`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/warnings"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/warnings/escalations"],
      });
      setMassWarningUserIds([]);
      setMassWarningUsernames({});
      setMassWarningReason("");
      setMassWarningSeverity("Verbal");
      setMassWarningSearchQuery("");
    },
    onError: (e: any) => {
      toast({
        title: "Failed to issue mass warning",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const usersAtRisk = useMemo(() => {
    const warningsByUser: Record<
      string,
      {
        count: number;
        username: string;
        userId: string;
        warnings: any[];
        isVerified?: boolean;
      }
    > = {};
    warnings
      .filter((w: any) => w.isActive)
      .forEach((w: any) => {
        const uid = w.userId;
        if (!warningsByUser[uid]) {
          warningsByUser[uid] = {
            count: 0,
            username: w.user?.username || uid,
            userId: uid,
            warnings: [],
            isVerified: w.user?.isVerified ?? false,
          };
        }
        warningsByUser[uid].count++;
        warningsByUser[uid].warnings.push(w);
      });
    return Object.values(warningsByUser)
      .filter((u) => u.count >= 2)
      .sort((a, b) => b.count - a.count);
  }, [warnings]);

  const reportPriority = useMemo(() => {
    const targetCounts: Record<string, number> = {};
    reports.forEach((r: any) => {
      if (r.targetId) {
        targetCounts[r.targetId] = (targetCounts[r.targetId] || 0) + 1;
      }
    });
    return targetCounts;
  }, [reports]);

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

    items.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    return items.slice(0, 15);
  }, [activeBans, reports, pendingAppeals]);

  const filteredReports = useMemo(() => {
    if (reportFilter === "all") return reports;
    return reports.filter((r: any) => r.status === reportFilter);
  }, [reports, reportFilter]);

  const filteredAppeals = useMemo(() => {
    if (appealFilter === "all") return pendingAppeals;
    return pendingAppeals.filter((a: any) => a.status === appealFilter);
  }, [pendingAppeals, appealFilter]);

  const activeBanCount = activeBans.filter((b: any) => b.isActive).length;
  const openReportsCount = reports.filter(
    (r: any) => r.status === "pending",
  ).length;
  const pendingAppealsCount = pendingAppeals.filter(
    (a: any) => a.status === "pending",
  ).length;
  const resolvedReportsCount = reports.filter(
    (r: any) => r.status !== "pending",
  ).length;
  const activeWarningsCount = warnings.filter((w: any) => w.isActive).length;

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
      toast({
        title: "Failed to issue ban",
        description: e.message,
        variant: "destructive",
      });
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
      toast({
        title: "Failed to lift ban",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ id, status, moderatorNotes }: any) => {
      const res = await apiRequest("PATCH", `/api/reports/${id}`, {
        status,
        moderatorNotes,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Report updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
    },
    onError: (e: any) => {
      toast({
        title: "Failed to update report",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const updateAppealMutation = useMutation({
    mutationFn: async ({ id, status, reviewNotes }: any) => {
      const res = await apiRequest("PATCH", `/api/appeals/${id}`, {
        status,
        reviewNotes,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Appeal updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/appeals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bans"] });
    },
    onError: (e: any) => {
      toast({
        title: "Failed to update appeal",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      const res = await apiRequest("PATCH", `/api/forums/threads/${id}`, {
        isPinned,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Thread pin status updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/forums/threads"] });
    },
    onError: (e: any) => {
      toast({
        title: "Failed to update thread",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const toggleLockMutation = useMutation({
    mutationFn: async ({ id, isLocked }: { id: string; isLocked: boolean }) => {
      const res = await apiRequest("PATCH", `/api/forums/threads/${id}`, {
        isLocked,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Thread lock status updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/forums/threads"] });
    },
    onError: (e: any) => {
      toast({
        title: "Failed to update thread",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const deleteThreadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/forums/threads/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Thread deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/forums/threads"] });
    },
    onError: (e: any) => {
      toast({
        title: "Failed to delete thread",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const moveThreadMutation = useMutation({
    mutationFn: async ({
      id,
      categoryId,
    }: {
      id: string;
      categoryId: string;
    }) => {
      const res = await apiRequest("PATCH", `/api/forums/threads/${id}`, {
        categoryId,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Thread moved successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/forums/threads"] });
      setMoveThreadId(null);
      setMoveCategoryId("");
    },
    onError: (e: any) => {
      toast({
        title: "Failed to move thread",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const createWarningMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/warnings", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Warning issued successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/warnings"] });
      setWarningUserId("");
      setWarningUsername("");
      setWarningReason("");
      setWarningSeverity("Verbal");
      setWarningSearchQuery("");
    },
    onError: (e: any) => {
      toast({
        title: "Failed to issue warning",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const deactivateWarningMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/warnings/${id}`, {
        isActive: false,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Warning deactivated" });
      queryClient.invalidateQueries({ queryKey: ["/api/warnings"] });
    },
    onError: (e: any) => {
      toast({
        title: "Failed to deactivate warning",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const filteredWarnings = useMemo(() => {
    if (warningFilter === "all") return warnings;
    if (warningFilter === "active")
      return warnings.filter((w: any) => w.isActive);
    return warnings.filter((w: any) => !w.isActive);
  }, [warnings, warningFilter]);

  const filteredForumThreads = useMemo(() => {
    let threads = forumThreads;
    if (forumFilter === "pinned")
      threads = threads.filter((t: any) => t.isPinned);
    if (forumFilter === "locked")
      threads = threads.filter((t: any) => t.isLocked);
    if (forumSearchQuery.trim()) {
      const q = forumSearchQuery.toLowerCase();
      threads = threads.filter(
        (t: any) =>
          t.title?.toLowerCase().includes(q) ||
          t.author?.username?.toLowerCase().includes(q),
      );
    }
    return threads;
  }, [forumThreads, forumFilter, forumSearchQuery]);

  const forumReports = useMemo(() => {
    return reports.filter(
      (r: any) => r.targetType === "thread" || r.targetType === "reply",
    );
  }, [reports]);

  const filteredLogs = useMemo(() => {
    let logs = moderationLogs;
    if (auditActionFilter !== "All") {
      logs = logs.filter((l: any) => l.action === auditActionFilter);
    }
    if (auditActorFilter.trim()) {
      const q = auditActorFilter.toLowerCase();
      logs = logs.filter(
        (l: any) =>
          l.actor?.username?.toLowerCase().includes(q) ||
          l.actorId?.toLowerCase().includes(q),
      );
    }
    if (auditTargetFilter.trim()) {
      const q = auditTargetFilter.toLowerCase();
      logs = logs.filter(
        (l: any) =>
          l.target?.username?.toLowerCase().includes(q) ||
          l.targetId?.toLowerCase().includes(q) ||
          l.targetType?.toLowerCase().includes(q),
      );
    }
    return logs;
  }, [moderationLogs, auditActionFilter, auditActorFilter, auditTargetFilter]);

  const auditActionTypes = useMemo(() => {
    const actions = new Set<string>();
    moderationLogs.forEach((l: any) => {
      if (l.action) actions.add(l.action);
    });
    return Array.from(actions).sort();
  }, [moderationLogs]);

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
      case "1day":
        return "1 Day";
      case "3days":
        return "3 Days";
      case "7days":
        return "7 Days";
      case "14days":
        return "14 Days";
      case "30days":
        return "30 Days";
      case "90days":
        return "90 Days";
      case "permanent":
        return "Permanent";
      default:
        return duration;
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
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "approved":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "denied":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "in review":
      case "reviewed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "action_taken":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "dismissed":
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
                <h2
                  className="font-semibold text-xl uppercase tracking-tight"
                  data-testid="text-access-denied"
                >
                  Access Denied
                </h2>
                <p className="text-muted-foreground text-sm mt-2">
                  You do not have permission to access the Moderator Control
                  Panel.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sidebarItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      count: undefined,
    },
    {
      id: "bans",
      label: "Ban Management",
      icon: Ban,
      count: activeBanCount || undefined,
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      count: openReportsCount || undefined,
    },
    {
      id: "appeals",
      label: "Appeals",
      icon: Scale,
      count: pendingAppealsCount || undefined,
    },
    {
      id: "warnings",
      label: "Warnings",
      icon: TriangleAlert,
      count: activeWarningsCount || undefined,
    },
    {
      id: "mass-warning",
      label: "Mass Warning",
      icon: Users,
      count: undefined,
    },
    {
      id: "escalations",
      label: "Escalation Tracker",
      icon: Zap,
      count: escalations.length || undefined,
    },
    {
      id: "forums",
      label: "Forum Moderation",
      icon: MessageSquareText,
      count:
        forumReports.filter((r: any) => r.status === "pending").length ||
        undefined,
    },
    { id: "audit", label: "Audit Log", icon: ClipboardList, count: undefined },
  ];

  function getActivityIcon(type: string) {
    switch (type) {
      case "ban":
        return <Ban className="w-4 h-4 text-red-400" />;
      case "report":
        return <FileText className="w-4 h-4 text-yellow-400" />;
      case "appeal":
        return <Scale className="w-4 h-4 text-blue-400" />;
      default:
        return <History className="w-4 h-4 text-muted-foreground" />;
    }
  }

  function getAuditIcon(action: string) {
    const lower = action.toLowerCase();
    if (lower.includes("ban") && lower.includes("lift"))
      return <Unlock className="w-4 h-4 text-green-400" />;
    if (lower.includes("ban")) return <Ban className="w-4 h-4 text-red-400" />;
    if (lower.includes("report"))
      return <FileText className="w-4 h-4 text-yellow-400" />;
    if (lower.includes("appeal") && lower.includes("approve"))
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (lower.includes("appeal") && lower.includes("deny"))
      return <XCircle className="w-4 h-4 text-red-400" />;
    if (lower.includes("appeal"))
      return <Scale className="w-4 h-4 text-blue-400" />;
    if (lower.includes("warn"))
      return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    if (
      lower.includes("pin") ||
      lower.includes("lock") ||
      lower.includes("thread") ||
      lower.includes("forum")
    )
      return <MessageSquareText className="w-4 h-4 text-purple-400" />;
    if (lower.includes("delete") || lower.includes("remove"))
      return <Trash2 className="w-4 h-4 text-red-400" />;
    return <ClipboardList className="w-4 h-4 text-muted-foreground" />;
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
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground">
      <div className="md:w-64 border-b md:border-b-0 md:border-r border-border flex md:flex-col p-3 md:p-4 gap-1 md:space-y-1 overflow-x-auto md:overflow-x-visible">
        <div className="hidden md:flex items-center gap-3 px-4 py-6 mb-2">
          <div className="w-8 h-8 bg-foreground rounded-md flex items-center justify-center">
            <img src={logoSvg} alt="ModCP" className="h-10 w-auto" data-testid="img-logo" />
            <span className="text-[10px] text-muted-foreground">
              {user?.username}
            </span>
          </div>
        </div>

        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-md font-medium text-xs md:text-sm transition-colors md:w-full text-left whitespace-nowrap ${
              activeTab === item.id
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover-elevate"
            }`}
            data-testid={`button-modcp-tab-${item.id}`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline flex-1">{item.label}</span>
            {item.count !== undefined && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 hidden md:inline-flex"
              >
                {item.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto">
        {activeTab === "dashboard" && (
          <>
            <div>
              <h1
                className="text-2xl font-semibold tracking-tight"
                data-testid="text-modcp-title"
              >
                Moderator Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Overview of moderation activity and pending items.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card
                className="hover-elevate cursor-pointer"
                onClick={() => setActiveTab("bans")}
              >
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Active Bans
                  </CardTitle>
                  <Ban className="w-4 h-4 text-red-400" />
                </CardHeader>
                <CardContent>
                  <div
                    className="text-3xl font-bold"
                    data-testid="text-active-bans-count"
                  >
                    {activeBanCount || "0"}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {activeBans.length} total bans
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="hover-elevate cursor-pointer"
                onClick={() => setActiveTab("reports")}
              >
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Open Reports
                  </CardTitle>
                  <FileText className="w-4 h-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div
                    className="text-3xl font-bold"
                    data-testid="text-open-reports-count"
                  >
                    {openReportsCount || "0"}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {resolvedReportsCount} resolved
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="hover-elevate cursor-pointer"
                onClick={() => setActiveTab("appeals")}
              >
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Pending Appeals
                  </CardTitle>
                  <Scale className="w-4 h-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div
                    className="text-3xl font-bold"
                    data-testid="text-pending-appeals-count"
                  >
                    {pendingAppealsCount || "0"}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {pendingAppeals.length} total appeals
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Mod Since
                  </CardTitle>
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "—"}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {user?.userRank}
                    </span>
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
                      <p className="text-sm font-medium">
                        Items requiring attention
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {openReportsCount > 0 &&
                          `${openReportsCount} pending report${openReportsCount !== 1 ? "s" : ""}`}
                        {openReportsCount > 0 &&
                          pendingAppealsCount > 0 &&
                          " and "}
                        {pendingAppealsCount > 0 &&
                          `${pendingAppealsCount} pending appeal${pendingAppealsCount !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {openReportsCount > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab("reports")}
                          data-testid="button-go-reports"
                        >
                          Reports <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                      {pendingAppealsCount > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab("appeals")}
                          data-testid="button-go-appeals"
                        >
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
                    <p className="text-sm text-muted-foreground">
                      No recent activity
                    </p>
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
                          <p className="text-sm truncate">
                            {getActivityLabel(item)}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {getRelativeTime(item.date)}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={getStatusBadgeClasses(
                            item.type === "ban"
                              ? item.data.isActive
                                ? "pending"
                                : "dismissed"
                              : item.data.status || "pending",
                          )}
                        >
                          {item.type === "ban"
                            ? item.data.isActive
                              ? "Active"
                              : "Lifted"
                            : item.data.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {usersAtRisk.length > 0 && (
              <Card
                className="border-orange-500/20"
                data-testid="card-users-at-risk"
              >
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-tight flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-orange-400" />
                    Users at Risk
                  </CardTitle>
                  <Badge variant="secondary">{usersAtRisk.length}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">
                    Users with 2 or more active warnings that may require
                    escalation.
                  </p>
                  <div className="space-y-2">
                    {usersAtRisk.map((u) => (
                      <div
                        key={u.userId}
                        className="flex items-center justify-between gap-4 rounded-md p-3 bg-muted/50"
                        data-testid={`row-at-risk-${u.userId}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-md bg-orange-500/10 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-orange-400" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-sm inline-flex items-center gap-1">
                              {u.username}
                              <VerifiedBadge
                                isVerified={u.isVerified}
                                size="sm"
                              />
                            </span>
                            <div className="flex items-center gap-2 flex-wrap mt-0.5">
                              {u.warnings.map((w: any) => (
                                <Badge
                                  key={w.id}
                                  variant="outline"
                                  className={`text-[10px] ${
                                    w.severity === "Final"
                                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                                      : w.severity === "Written"
                                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                        : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                  }`}
                                >
                                  {w.severity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant="secondary"
                            className={`text-[10px] ${u.count >= 3 ? "bg-red-500/20 text-red-400" : "bg-orange-500/20 text-orange-400"}`}
                          >
                            {u.count} warnings
                          </Badge>
                          {u.count >= 3 && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setBanUserId(u.userId);
                                setBanUsername(u.username);
                                setBanReason(
                                  `Accumulated ${u.count} active warnings`,
                                );
                                setActiveTab("bans");
                              }}
                              data-testid={`button-escalate-ban-${u.userId}`}
                            >
                              <Ban className="w-3 h-3 mr-1" /> Escalate to Ban
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setWarningUserId(u.userId);
                              setWarningUsername(u.username);
                              setActiveTab("warnings");
                            }}
                            data-testid={`button-view-warnings-${u.userId}`}
                          >
                            View Warnings
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {activeTab === "bans" && (
          <>
            <div>
              <h1
                className="text-2xl font-semibold tracking-tight"
                data-testid="text-bans-title"
              >
                Ban Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Issue and manage user bans.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-tight flex items-center gap-2">
                  <Gavel className="w-4 h-4" /> Issue New Ban
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                    Search User
                  </label>
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
                  {showUserDropdown &&
                    userSearchQuery.length >= 2 &&
                    searchResults.length > 0 &&
                    !banUserId && (
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
                              <span className="font-medium">
                                {u.username || "—"}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {u.email}
                              </span>
                            </button>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  {showUserDropdown &&
                    userSearchQuery.length >= 2 &&
                    searchResults.length === 0 &&
                    !banUserId && (
                      <Card className="absolute z-10 w-full mt-1">
                        <CardContent className="p-4">
                          <p className="text-xs text-muted-foreground text-center">
                            No users found
                          </p>
                        </CardContent>
                      </Card>
                    )}
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                    Reason Template
                  </label>
                  <Select value="" onValueChange={(v) => setBanReason(v)}>
                    <SelectTrigger data-testid="select-ban-reason-template">
                      <SelectValue placeholder="Select a common reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Harassment or bullying of other community members">
                        harassment/bullying
                      </SelectItem>
                      <SelectItem value="Unauthorized Access / Underage">
                        UA / Underage
                      </SelectItem>
                      <SelectItem value="Violation of Terms of Service">
                        V-TOS
                      </SelectItem>
                      <SelectItem value="Posting inappropriate, offensive, or NSFW content">
                      Posting inappropriate, offensive, or NSFW content 
                      </SelectItem>
                      <SelectItem value="Use of cheats, exploits, or unauthorized modifications">
                        Cheating / EXP
                      </SelectItem>
                      <SelectItem value="Impersonating staff or other community members">
                        Impersonation
                      </SelectItem>
                      <SelectItem value="Admin Discretion">
                        AD
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                    Reason
                  </label>
                  <Textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Reason for ban.."
                    className="resize-none"
                    data-testid="input-ban-reason"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                    Duration
                  </label>
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
                    {banDuration !== "permanent" &&
                      ` — Expires ${new Date(
                        Date.now() +
                          (banDuration === "1day"
                            ? 86400000
                            : banDuration === "3days"
                              ? 259200000
                              : banDuration === "7days"
                                ? 604800000
                                : banDuration === "14days"
                                  ? 1209600000
                                  : banDuration === "30days"
                                    ? 2592000000
                                    : banDuration === "90days"
                                      ? 7776000000
                                      : 0),
                      ).toLocaleDateString()}`}
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={
                        !banUserId || !banReason || createBanMutation.isPending
                      }
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
                        You are about to ban <strong>{banUsername}</strong> for{" "}
                        <strong>{getDurationLabel(banDuration)}</strong>.
                        <br />
                        Reason: {banReason}
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
                <CardTitle className="text-sm font-semibold uppercase tracking-tight">
                  Active Bans
                </CardTitle>
                <Badge variant="secondary">{activeBanCount}</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activeBans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Shield className="w-10 h-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No active bans
                      </p>
                    </div>
                  ) : (
                    activeBans
                      .filter((b: any) => b.isActive)
                      .map((ban: any) => (
                        <div
                          key={ban.id}
                          className="flex items-start justify-between gap-4 rounded-md border border-border p-4"
                          data-testid={`row-ban-${ban.id}`}
                        >
                          <div className="flex gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-md bg-red-500/10 flex items-center justify-center shrink-0">
                              <Ban className="w-4 h-4 text-red-400" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm inline-flex items-center gap-1">
                                  {ban.user?.username || ban.userId}
                                  <VerifiedBadge
                                    isVerified={ban.user?.isVerified}
                                    size="sm"
                                  />
                                </span>
                                <Badge
                                  variant="outline"
                                  className={
                                    ban.isPermanent
                                      ? "border-red-500/30 text-red-400"
                                      : "border-yellow-500/30 text-yellow-400"
                                  }
                                >
                                  {ban.isPermanent ? "Permanent" : "Temporary"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {ban.reason}
                              </p>
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
                                    Expires:{" "}
                                    {new Date(
                                      ban.expiresAt,
                                    ).toLocaleDateString()}
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
                                  Are you sure you want to lift the ban on{" "}
                                  <strong>
                                    {ban.user?.username || ban.userId}
                                  </strong>
                                  ? This action cannot be undone.
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
                <h1
                  className="text-2xl font-semibold tracking-tight"
                  data-testid="text-reports-title"
                >
                  Reports
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredReports.length} report
                  {filteredReports.length !== 1 ? "s" : ""}{" "}
                  {reportFilter !== "All"
                    ? `with status "${reportFilter}"`
                    : "total"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={reportFilter} onValueChange={setReportFilter}>
                  <SelectTrigger
                    className="w-[160px]"
                    data-testid="select-report-filter"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="action_taken">Action Taken</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
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
                        No reports
                        {reportFilter !== "All"
                          ? ` with status "${reportFilter}"`
                          : " to review"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredReports.map((report: any) => (
                  <Card
                    key={report.id}
                    data-testid={`card-report-${report.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-md bg-yellow-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant="outline"
                                className={getStatusBadgeClasses(report.status)}
                              >
                                {report.status}
                              </Badge>
                              {(reportPriority[report.targetId] || 0) > 1 && (
                                <Badge
                                  variant="outline"
                                  className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]"
                                  data-testid={`badge-priority-${report.id}`}
                                >
                                  <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />{" "}
                                  High Priority
                                </Badge>
                              )}
                              {report.targetType === "user" && (
                                <Badge
                                  variant="outline"
                                  className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]"
                                >
                                  User Report
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {report.targetType}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {getRelativeTime(report.createdAt)}
                              </span>
                            </div>
                            <Link href={`/modcp/case/report/${report.id}`}>
                              <Button
                                size="sm"
                                variant="ghost"
                                data-testid={`link-view-report-${report.id}`}
                              >
                                <Eye className="w-3 h-3 mr-1" /> View Case
                              </Button>
                            </Link>
                          </div>

                          <p className="font-medium text-sm">{report.reason}</p>
                          {report.details && (
                            <p className="text-xs text-muted-foreground">
                              {report.details}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                            <span>
                              Target:{" "}
                              <span className="font-mono">
                                {report.targetId}
                              </span>
                            </span>
                            <span>
                              Reporter:{" "}
                              <span className="font-mono">
                                {report.reporterId}
                              </span>
                            </span>
                          </div>

                          {report.moderatorNotes && (
                            <div className="bg-muted rounded-md p-3">
                              <p className="text-xs text-muted-foreground">
                                <span className="font-semibold">
                                  Mod Notes:
                                </span>{" "}
                                {report.moderatorNotes}
                              </p>
                            </div>
                          )}

                          {report.status === "pending" && (
                            <div className="flex items-center gap-2 pt-2 flex-wrap">
                              <Input
                                placeholder="Moderator notes..."
                                value={reportNotes[report.id] || ""}
                                onChange={(e) =>
                                  setReportNotes((prev) => ({
                                    ...prev,
                                    [report.id]: e.target.value,
                                  }))
                                }
                                className="text-xs flex-1"
                                data-testid={`input-report-notes-${report.id}`}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateReportMutation.mutate({
                                    id: report.id,
                                    status: "reviewed",
                                    moderatorNotes: reportNotes[report.id],
                                  })
                                }
                                disabled={updateReportMutation.isPending}
                                data-testid={`button-review-report-${report.id}`}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" /> In
                                Review
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateReportMutation.mutate({
                                    id: report.id,
                                    status: "action_taken",
                                    moderatorNotes: reportNotes[report.id],
                                  })
                                }
                                disabled={updateReportMutation.isPending}
                                data-testid={`button-action-report-${report.id}`}
                              >
                                Action Taken
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateReportMutation.mutate({
                                    id: report.id,
                                    status: "dismissed",
                                    moderatorNotes: reportNotes[report.id],
                                  })
                                }
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
                <h1
                  className="text-2xl font-semibold tracking-tight"
                  data-testid="text-appeals-title"
                >
                  Appeals Queue
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredAppeals.length} appeal
                  {filteredAppeals.length !== 1 ? "s" : ""}{" "}
                  {appealFilter !== "All"
                    ? `with status "${appealFilter}"`
                    : "total"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={appealFilter} onValueChange={setAppealFilter}>
                  <SelectTrigger
                    className="w-[160px]"
                    data-testid="select-appeal-filter"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
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
                        No appeals
                        {appealFilter !== "All"
                          ? ` with status "${appealFilter}"`
                          : " to review"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredAppeals.map((appeal: any) => (
                  <Card
                    key={appeal.id}
                    data-testid={`card-appeal-${appeal.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Scale className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant="outline"
                                className={getStatusBadgeClasses(appeal.status)}
                              >
                                {appeal.status}
                              </Badge>
                              <span className="font-semibold text-sm inline-flex items-center gap-1">
                                {appeal.user?.username || appeal.userId}
                                <VerifiedBadge
                                  isVerified={appeal.user?.isVerified}
                                  size="sm"
                                />
                              </span>
                              {appeal.user?.email && (
                                <span className="text-xs text-muted-foreground">
                                  {appeal.user.email}
                                </span>
                              )}
                            </div>
                            <Link href={`/modcp/case/appeal/${appeal.id}`}>
                              <Button
                                size="sm"
                                variant="ghost"
                                data-testid={`link-view-appeal-${appeal.id}`}
                              >
                                <Eye className="w-3 h-3 mr-1" /> View Case
                              </Button>
                            </Link>
                          </div>

                          <p className="text-sm text-muted-foreground">
                            {appeal.reason}
                          </p>

                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {getRelativeTime(appeal.createdAt)}
                            </span>
                            {appeal.banId && (
                              <span>
                                Ban ID:{" "}
                                <span className="font-mono">
                                  {appeal.banId}
                                </span>
                              </span>
                            )}
                          </div>

                          {appeal.reviewNotes && (
                            <div className="bg-muted rounded-md p-3">
                              <p className="text-xs text-muted-foreground">
                                <span className="font-semibold">
                                  Review Notes:
                                </span>{" "}
                                {appeal.reviewNotes}
                              </p>
                            </div>
                          )}

                          {appeal.status === "pending" && (
                            <div className="flex items-center gap-2 pt-2 flex-wrap">
                              <Input
                                placeholder="Review notes..."
                                value={appealNotes[appeal.id] || ""}
                                onChange={(e) =>
                                  setAppealNotes((prev) => ({
                                    ...prev,
                                    [appeal.id]: e.target.value,
                                  }))
                                }
                                className="text-xs flex-1"
                                data-testid={`input-appeal-notes-${appeal.id}`}
                              />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    data-testid={`button-approve-appeal-${appeal.id}`}
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />{" "}
                                    Approve
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Approve Appeal
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Approving this appeal will lift the
                                      associated ban for{" "}
                                      <strong>
                                        {appeal.user?.username || appeal.userId}
                                      </strong>
                                      . Are you sure?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        updateAppealMutation.mutate({
                                          id: appeal.id,
                                          status: "approved",
                                          reviewNotes: appealNotes[appeal.id],
                                        })
                                      }
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
                                    <AlertDialogTitle>
                                      Deny Appeal
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will deny the appeal from{" "}
                                      <strong>
                                        {appeal.user?.username || appeal.userId}
                                      </strong>
                                      . Their ban will remain active.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        updateAppealMutation.mutate({
                                          id: appeal.id,
                                          status: "denied",
                                          reviewNotes: appealNotes[appeal.id],
                                        })
                                      }
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
        {activeTab === "warnings" && (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1
                  className="text-2xl font-semibold tracking-tight"
                  data-testid="text-warnings-title"
                >
                  Warning Management
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Issue and manage user warnings.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={warningFilter === "all" ? "default" : "outline"}
                  onClick={() => setWarningFilter("all")}
                  data-testid="button-filter-warnings-all"
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={warningFilter === "active" ? "default" : "outline"}
                  onClick={() => setWarningFilter("active")}
                  data-testid="button-filter-warnings-active"
                >
                  Active
                </Button>
                <Button
                  size="sm"
                  variant={warningFilter === "inactive" ? "default" : "outline"}
                  onClick={() => setWarningFilter("inactive")}
                  data-testid="button-filter-warnings-inactive"
                >
                  Inactive
                </Button>
              </div>
            </div>

            <Card data-testid="card-escalation-path">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-tight flex items-center gap-2">
                  <Scale className="w-4 h-4 text-muted-foreground" />
                  Warning Escalation Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    {
                      label: "Verbal Warning",
                      color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                    },
                    {
                      label: "Written Warning",
                      color:
                        "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                    },
                    {
                      label: "Final Warning",
                      color: "bg-red-500/20 text-red-400 border-red-500/30",
                    },
                    {
                      label: "Ban",
                      color: "bg-red-600/20 text-red-500 border-red-600/30",
                    },
                  ].map((step, i) => (
                    <div key={step.label} className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={step.color}
                        data-testid={`badge-escalation-${i}`}
                      >
                        {step.label}
                      </Badge>
                      {i < 3 && (
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Users progress through this escalation path. After a Final
                  Warning, the next step is a ban. Users with 3+ active warnings
                  are flagged for ban escalation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-tight flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-muted-foreground" />
                  Issue Warning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={warningUsername || warningSearchQuery}
                      onChange={(e) => {
                        setWarningSearchQuery(e.target.value);
                        setWarningUsername("");
                        setWarningUserId("");
                        setShowWarningUserDropdown(true);
                      }}
                      onFocus={() => setShowWarningUserDropdown(true)}
                      placeholder="Search user to warn..."
                      className="pl-10"
                      data-testid="input-warning-user-search"
                    />
                  </div>
                  {showWarningUserDropdown &&
                    warningSearchResults.length > 0 &&
                    !warningUserId && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 border border-border rounded-md bg-popover shadow-md max-h-48 overflow-y-auto">
                        {warningSearchResults.map((u: any) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              setWarningUserId(u.id);
                              setWarningUsername(u.username || u.email);
                              setWarningSearchQuery("");
                              setShowWarningUserDropdown(false);
                            }}
                            className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm hover-elevate"
                            data-testid={`button-select-warning-user-${u.id}`}
                          >
                            <User className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium">
                              {u.username || u.email}
                            </span>
                            {u.userRank && (
                              <span className="text-xs text-muted-foreground ml-auto">
                                {u.userRank}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Select
                    value={warningSeverity}
                    onValueChange={(v) =>
                      setWarningSeverity(v as "Verbal" | "Written" | "Final")
                    }
                  >
                    <SelectTrigger
                      className="w-[160px]"
                      data-testid="select-warning-severity"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Verbal">Verbal</SelectItem>
                      <SelectItem value="Written">Written</SelectItem>
                      <SelectItem value="Final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex-1">
                    <Input
                      value={warningReason}
                      onChange={(e) => setWarningReason(e.target.value)}
                      placeholder="Reason for warning..."
                      data-testid="input-warning-reason"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    disabled={
                      !warningUserId ||
                      !warningReason.trim() ||
                      createWarningMutation.isPending
                    }
                    onClick={() => {
                      createWarningMutation.mutate({
                        userId: warningUserId,
                        reason: warningReason,
                        severity: warningSeverity,
                        issuedBy: user?.id,
                      });
                    }}
                    data-testid="button-issue-warning"
                  >
                    <TriangleAlert className="w-4 h-4 mr-1" />
                    {createWarningMutation.isPending
                      ? "Issuing..."
                      : "Issue Warning"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-tight flex items-center gap-2">
                  <TriangleAlert className="w-4 h-4 text-muted-foreground" />
                  Warnings
                </CardTitle>
                <Badge variant="secondary">{filteredWarnings.length}</Badge>
              </CardHeader>
              <CardContent>
                {warningsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-md" />
                    ))}
                  </div>
                ) : filteredWarnings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <TriangleAlert className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {warningFilter !== "all"
                        ? `No ${warningFilter} warnings`
                        : "No warnings issued yet"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredWarnings.map((warning: any) => (
                      <div
                        key={warning.id}
                        className={`flex items-start gap-3 rounded-md p-3 ${warning.isActive ? "bg-muted/50" : "bg-muted/20 opacity-60"}`}
                        data-testid={`row-warning-${warning.id}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                            warning.severity === "Final"
                              ? "bg-red-500/10"
                              : warning.severity === "Written"
                                ? "bg-yellow-500/10"
                                : "bg-blue-500/10"
                          }`}
                        >
                          <TriangleAlert
                            className={`w-4 h-4 ${
                              warning.severity === "Final"
                                ? "text-red-400"
                                : warning.severity === "Written"
                                  ? "text-yellow-400"
                                  : "text-blue-400"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className={
                                warning.severity === "Final"
                                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                                  : warning.severity === "Written"
                                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                    : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              }
                            >
                              {warning.severity}
                            </Badge>
                            <span className="font-semibold text-sm inline-flex items-center gap-1">
                              {warning.user?.username || warning.userId}
                              <VerifiedBadge
                                isVerified={warning.user?.isVerified}
                                size="sm"
                              />
                            </span>
                            {!warning.isActive && (
                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                              >
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {warning.reason}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {warning.createdAt
                                ? getRelativeTime(warning.createdAt)
                                : ""}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Issued by:{" "}
                              {warning.issuer?.username || warning.issuedBy}
                            </span>
                            {warning.expiresAt && (
                              <span>
                                Expires:{" "}
                                {new Date(
                                  warning.expiresAt,
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        {warning.isActive && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                data-testid={`button-deactivate-warning-${warning.id}`}
                              >
                                <CircleSlash className="w-3 h-3 mr-1" /> Rescind
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Rescind Warning
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to deactivate this{" "}
                                  {warning.severity.toLowerCase()} warning for{" "}
                                  <strong>
                                    {warning.user?.username || warning.userId}
                                  </strong>
                                  ?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    deactivateWarningMutation.mutate(warning.id)
                                  }
                                  data-testid={`button-confirm-deactivate-warning-${warning.id}`}
                                >
                                  Rescind Warning
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
        {activeTab === "mass-warning" && (
          <>
            <div>
              <h1
                className="text-2xl font-semibold tracking-tight"
                data-testid="text-mass-warning-title"
              >
                Mass Warning
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Issue the same warning to multiple users at once.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-tight flex items-center gap-2">
                  <Users className="w-4 h-4" /> Select Users
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={massWarningSearchQuery}
                      onChange={(e) => {
                        setMassWarningSearchQuery(e.target.value);
                        setShowMassWarningDropdown(true);
                      }}
                      onFocus={() => setShowMassWarningDropdown(true)}
                      placeholder="Search users to add..."
                      className="pl-10"
                      data-testid="input-mass-warning-search"
                    />
                  </div>
                  {showMassWarningDropdown &&
                    massWarningSearchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 border border-border rounded-md bg-popover shadow-md max-h-48 overflow-y-auto">
                        {massWarningSearchResults
                          .filter(
                            (u: any) => !massWarningUserIds.includes(u.id),
                          )
                          .map((u: any) => (
                            <button
                              key={u.id}
                              onClick={() => {
                                setMassWarningUserIds((prev) => [
                                  ...prev,
                                  u.id,
                                ]);
                                setMassWarningUsernames((prev) => ({
                                  ...prev,
                                  [u.id]: u.username || u.email,
                                }));
                                setMassWarningSearchQuery("");
                                setShowMassWarningDropdown(false);
                              }}
                              className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm hover-elevate"
                              data-testid={`button-add-mass-user-${u.id}`}
                            >
                              <UserPlus className="w-3 h-3 text-muted-foreground" />
                              <span className="font-medium">
                                {u.username || u.email}
                              </span>
                              {u.userRank && (
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {u.userRank}
                                </span>
                              )}
                            </button>
                          ))}
                      </div>
                    )}
                </div>

                {massWarningUserIds.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {massWarningUserIds.map((uid) => (
                      <Badge
                        key={uid}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <User className="w-3 h-3" />
                        {massWarningUsernames[uid] || uid}
                        <button
                          onClick={() => {
                            setMassWarningUserIds((prev) =>
                              prev.filter((id) => id !== uid),
                            );
                            setMassWarningUsernames((prev) => {
                              const next = { ...prev };
                              delete next[uid];
                              return next;
                            });
                          }}
                          className="ml-1"
                          data-testid={`button-remove-mass-user-${uid}`}
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 flex-wrap">
                  <Select
                    value={massWarningSeverity}
                    onValueChange={(v) =>
                      setMassWarningSeverity(
                        v as "Verbal" | "Written" | "Final",
                      )
                    }
                  >
                    <SelectTrigger
                      className="w-[160px]"
                      data-testid="select-mass-warning-severity"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Verbal">Verbal</SelectItem>
                      <SelectItem value="Written">Written</SelectItem>
                      <SelectItem value="Final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex-1">
                    <Input
                      value={massWarningReason}
                      onChange={(e) => setMassWarningReason(e.target.value)}
                      placeholder="Reason for warning..."
                      data-testid="input-mass-warning-reason"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        disabled={
                          massWarningUserIds.length === 0 ||
                          !massWarningReason.trim() ||
                          massWarningMutation.isPending
                        }
                        data-testid="button-issue-mass-warning"
                      >
                        <TriangleAlert className="w-4 h-4 mr-1" />
                        {massWarningMutation.isPending
                          ? "Issuing..."
                          : `Issue Warning to ${massWarningUserIds.length} User${massWarningUserIds.length !== 1 ? "s" : ""}`}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Confirm Mass Warning
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          You are about to issue a{" "}
                          <strong>{massWarningSeverity}</strong> warning to{" "}
                          <strong>{massWarningUserIds.length}</strong> user
                          {massWarningUserIds.length !== 1 ? "s" : ""}.
                          <br />
                          Reason: {massWarningReason}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            massWarningMutation.mutate({
                              userIds: massWarningUserIds,
                              reason: massWarningReason,
                              severity: massWarningSeverity,
                            });
                          }}
                          data-testid="button-confirm-mass-warning"
                        >
                          Issue Warnings
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "escalations" && (
          <>
            <div>
              <h1
                className="text-2xl font-semibold tracking-tight"
                data-testid="text-escalations-title"
              >
                Escalation Tracker
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Users with multiple active warnings. Users with 3+ warnings are
                flagged for potential ban.
              </p>
            </div>

            {escalationsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-md" />
                ))}
              </div>
            ) : escalations.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center">
                    <Zap className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No users with multiple active warnings
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {escalations.map((esc: any) => (
                  <Card
                    key={esc.userId}
                    className={esc.suggestBan ? "border-red-500/30" : ""}
                    data-testid={`card-escalation-${esc.userId}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${esc.suggestBan ? "bg-red-500/10" : "bg-yellow-500/10"}`}
                          >
                            {esc.suggestBan ? (
                              <Ban className="w-5 h-5 text-red-400" />
                            ) : (
                              <TriangleAlert className="w-5 h-5 text-yellow-400" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm inline-flex items-center gap-1">
                                {esc.username}
                                <VerifiedBadge
                                  isVerified={esc.isVerified}
                                  size="sm"
                                />
                              </span>
                              <Badge variant="outline" className="text-[10px]">
                                {esc.userRank}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={
                                  esc.suggestBan
                                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                                    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                }
                              >
                                {esc.warningCount} active warning
                                {esc.warningCount !== 1 ? "s" : ""}
                              </Badge>
                            </div>
                            {esc.suggestBan && (
                              <p className="text-xs text-red-400 font-medium flex items-center gap-1">
                                <Zap className="w-3 h-3" /> Ban recommended - 3+
                                active warnings
                              </p>
                            )}
                            <div className="space-y-1 mt-2">
                              {esc.warnings.map((w: any, i: number) => (
                                <div
                                  key={w.id || i}
                                  className="flex items-center gap-2 text-xs text-muted-foreground"
                                >
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] ${
                                      w.severity === "Final"
                                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                                        : w.severity === "Written"
                                          ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                          : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                    }`}
                                  >
                                    {w.severity}
                                  </Badge>
                                  <span className="truncate">{w.reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveTab("warnings");
                              setWarningUserId(esc.userId);
                              setWarningUsername(esc.username);
                            }}
                            data-testid={`button-view-warnings-${esc.userId}`}
                          >
                            <Eye className="w-3 h-3 mr-1" /> View
                          </Button>
                          {esc.suggestBan && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setActiveTab("bans");
                                setBanUserId(esc.userId);
                                setBanUsername(esc.username);
                                setUserSearchQuery(esc.username);
                              }}
                              data-testid={`button-ban-escalated-${esc.userId}`}
                            >
                              <Ban className="w-3 h-3 mr-1" /> Ban User
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "forums" && (
          <>
            <div>
              <h1
                className="text-2xl font-semibold tracking-tight"
                data-testid="text-forums-title"
              >
                Forum Moderation
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage forum threads, review reported content, and moderate
                discussions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Threads
                  </CardTitle>
                  <MessageSquareText className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div
                    className="text-3xl font-bold"
                    data-testid="text-total-threads"
                  >
                    {forumThreads.length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Pinned Threads
                  </CardTitle>
                  <Pin className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div
                    className="text-3xl font-bold"
                    data-testid="text-pinned-threads"
                  >
                    {forumThreads.filter((t: any) => t.isPinned).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Locked Threads
                  </CardTitle>
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div
                    className="text-3xl font-bold"
                    data-testid="text-locked-threads"
                  >
                    {forumThreads.filter((t: any) => t.isLocked).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {forumReports.filter((r: any) => r.status === "pending").length >
              0 && (
              <Card className="border-yellow-500/20">
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-tight flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    Reported Forum Content
                  </CardTitle>
                  <Badge variant="secondary">
                    {
                      forumReports.filter((r: any) => r.status === "pending")
                        .length
                    }{" "}
                    pending
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  {forumReports
                    .filter((r: any) => r.status === "pending")
                    .map((report: any) => (
                      <div
                        key={report.id}
                        className="flex items-center gap-3 p-3 rounded-md bg-muted/50"
                        data-testid={`row-forum-report-${report.id}`}
                      >
                        <div className="w-8 h-8 rounded-md bg-yellow-500/10 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {report.reason}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {report.targetType === "thread"
                              ? "Thread"
                              : "Reply"}{" "}
                            &middot;{" "}
                            {report.createdAt
                              ? getRelativeTime(report.createdAt)
                              : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateReportMutation.mutate({
                                id: report.id,
                                status: "action_taken",
                                moderatorNotes: "",
                              })
                            }
                            data-testid={`button-action-report-${report.id}`}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> Action
                            Taken
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              updateReportMutation.mutate({
                                id: report.id,
                                status: "dismissed",
                                moderatorNotes: "",
                              })
                            }
                            data-testid={`button-dismiss-report-${report.id}`}
                          >
                            <XCircle className="w-3 h-3 mr-1" /> Dismiss
                          </Button>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-tight flex items-center gap-2">
                  <MessageSquareText className="w-4 h-4 text-muted-foreground" />
                  Thread Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={forumSearchQuery}
                      onChange={(e) => setForumSearchQuery(e.target.value)}
                      placeholder="Search threads by title or author..."
                      className="pl-10"
                      data-testid="input-forum-search"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant={forumFilter === "all" ? "default" : "outline"}
                      onClick={() => setForumFilter("all")}
                      data-testid="button-filter-all"
                    >
                      All
                    </Button>
                    <Button
                      size="sm"
                      variant={forumFilter === "pinned" ? "default" : "outline"}
                      onClick={() => setForumFilter("pinned")}
                      data-testid="button-filter-pinned"
                    >
                      <Pin className="w-3 h-3 mr-1" /> Pinned
                    </Button>
                    <Button
                      size="sm"
                      variant={forumFilter === "locked" ? "default" : "outline"}
                      onClick={() => setForumFilter("locked")}
                      data-testid="button-filter-locked"
                    >
                      <Lock className="w-3 h-3 mr-1" /> Locked
                    </Button>
                  </div>
                </div>

                {threadsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-md" />
                    ))}
                  </div>
                ) : filteredForumThreads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <MessageSquareText className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {forumSearchQuery || forumFilter !== "all"
                        ? "No threads match your filters"
                        : "No forum threads found"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredForumThreads.map((thread: any) => (
                      <div
                        key={thread.id}
                        className="flex items-center gap-3 rounded-md p-3 hover-elevate"
                        data-testid={`row-forum-thread-${thread.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/forums/thread/${thread.id}`}>
                              <span
                                className="text-sm font-medium hover:underline cursor-pointer"
                                data-testid={`link-thread-${thread.id}`}
                              >
                                {thread.title}
                              </span>
                            </Link>
                            {thread.isPinned && (
                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                              >
                                <Pin className="w-2.5 h-2.5 mr-0.5" /> Pinned
                              </Badge>
                            )}
                            {thread.isLocked && (
                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                              >
                                <Lock className="w-2.5 h-2.5 mr-0.5" /> Locked
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            by {thread.author?.username || "Unknown"} &middot;{" "}
                            {thread.category?.name || "Uncategorized"} &middot;{" "}
                            {thread.replyCount || 0} replies &middot;{" "}
                            {thread.createdAt
                              ? getRelativeTime(thread.createdAt)
                              : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              togglePinMutation.mutate({
                                id: thread.id,
                                isPinned: !thread.isPinned,
                              })
                            }
                            title={thread.isPinned ? "Unpin" : "Pin"}
                            data-testid={`button-pin-thread-${thread.id}`}
                          >
                            {thread.isPinned ? (
                              <PinOff className="w-4 h-4" />
                            ) : (
                              <Pin className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              toggleLockMutation.mutate({
                                id: thread.id,
                                isLocked: !thread.isLocked,
                              })
                            }
                            title={thread.isLocked ? "Unlock" : "Lock"}
                            data-testid={`button-lock-thread-${thread.id}`}
                          >
                            {thread.isLocked ? (
                              <Unlock className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setMoveThreadId(
                                moveThreadId === thread.id ? null : thread.id,
                              );
                              setMoveCategoryId("");
                            }}
                            title="Move to category"
                            data-testid={`button-move-thread-${thread.id}`}
                          >
                            <FolderOpen className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Delete thread"
                                data-testid={`button-delete-thread-${thread.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Thread
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &ldquo;
                                  {thread.title}&rdquo;? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    deleteThreadMutation.mutate(thread.id)
                                  }
                                  data-testid={`button-confirm-delete-thread-${thread.id}`}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        {moveThreadId === thread.id && (
                          <div className="flex items-center gap-2 ml-2">
                            <Select
                              value={moveCategoryId}
                              onValueChange={setMoveCategoryId}
                            >
                              <SelectTrigger
                                className="w-[180px]"
                                data-testid={`select-move-category-${thread.id}`}
                              >
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {forumCategories
                                  .filter(
                                    (c: any) => c.id !== thread.categoryId,
                                  )
                                  .map((c: any) => (
                                    <SelectItem key={c.id} value={c.id}>
                                      {c.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              disabled={
                                !moveCategoryId || moveThreadMutation.isPending
                              }
                              onClick={() =>
                                moveThreadMutation.mutate({
                                  id: thread.id,
                                  categoryId: moveCategoryId,
                                })
                              }
                              data-testid={`button-confirm-move-${thread.id}`}
                            >
                              Move
                            </Button>
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
        {activeTab === "audit" && (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1
                  className="text-2xl font-semibold tracking-tight"
                  data-testid="text-audit-title"
                >
                  Audit Log
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredLogs.length} entr
                  {filteredLogs.length !== 1 ? "ies" : "y"}{" "}
                  {auditActionFilter !== "All" ||
                  auditActorFilter ||
                  auditTargetFilter
                    ? "(filtered)"
                    : "total"}
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                    <Select
                      value={auditActionFilter}
                      onValueChange={setAuditActionFilter}
                    >
                      <SelectTrigger
                        className="w-[180px]"
                        data-testid="select-audit-action-filter"
                      >
                        <SelectValue placeholder="Action type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Actions</SelectItem>
                        {auditActionTypes.map((action) => (
                          <SelectItem key={action} value={action}>
                            {action}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative flex-1 min-w-[150px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={auditActorFilter}
                      onChange={(e) => setAuditActorFilter(e.target.value)}
                      placeholder="Filter by actor..."
                      className="pl-10"
                      data-testid="input-audit-actor-filter"
                    />
                  </div>
                  <div className="relative flex-1 min-w-[150px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={auditTargetFilter}
                      onChange={(e) => setAuditTargetFilter(e.target.value)}
                      placeholder="Filter by target..."
                      className="pl-10"
                      data-testid="input-audit-target-filter"
                    />
                  </div>
                  {(auditActionFilter !== "All" ||
                    auditActorFilter ||
                    auditTargetFilter) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAuditActionFilter("All");
                        setAuditActorFilter("");
                        setAuditTargetFilter("");
                      }}
                      data-testid="button-clear-audit-filters"
                    >
                      <XCircle className="w-3 h-3 mr-1" /> Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-tight flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-muted-foreground" />
                  Activity Timeline
                </CardTitle>
                <Badge variant="secondary">{filteredLogs.length}</Badge>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-14 w-full rounded-md" />
                    ))}
                  </div>
                ) : filteredLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <ClipboardList className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {auditActionFilter !== "All" ||
                      auditActorFilter ||
                      auditTargetFilter
                        ? "No log entries match your filters"
                        : "No moderation activity recorded yet"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredLogs.map((log: any) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 rounded-md p-3 hover-elevate"
                        data-testid={`row-audit-log-${log.id}`}
                      >
                        <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
                          {getAuditIcon(log.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px]">
                              {log.action}
                            </Badge>
                            <span className="text-sm font-medium">
                              {log.actor?.username || log.actorId}
                            </span>
                            {log.targetId && (
                              <>
                                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {log.target?.username || log.targetId}
                                </span>
                              </>
                            )}
                            {log.targetType && (
                              <span className="text-[11px] text-muted-foreground">
                                ({log.targetType})
                              </span>
                            )}
                          </div>
                          {log.details && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {log.details}
                            </p>
                          )}
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {log.createdAt
                              ? getRelativeTime(log.createdAt)
                              : "Unknown"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
