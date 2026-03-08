import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  Shield,
  AlertTriangle,
  Scale,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  Loader2,
} from "lucide-react";

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "pending": return "bg-yellow-500/20 text-yellow-400";
    case "approved": return "bg-green-500/20 text-green-400";
    case "denied": return "bg-red-500/20 text-red-400";
    case "reviewed": return "bg-blue-500/20 text-blue-400";
    case "action taken": return "bg-green-500/20 text-green-400";
    case "dismissed": return "bg-white/10 text-white/50";
    default: return "bg-white/10 text-white/50";
  }
}

export default function CaseDetail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState("");

  const isReport = type === "report";
  const isAppeal = type === "appeal";
  const isBan = type === "ban";

  const { data: reports = [], isLoading: reportsLoading, isError: reportsError } = useQuery<any[]>({
    queryKey: ["/api/reports"],
    enabled: isReport,
  });

  const { data: appeals = [], isLoading: appealsLoading, isError: appealsError } = useQuery<any[]>({
    queryKey: ["/api/appeals"],
    enabled: isAppeal,
  });

  const { data: bans = [], isLoading: bansLoading, isError: bansError } = useQuery<any[]>({
    queryKey: ["/api/bans"],
    enabled: isBan,
  });

  const caseData = isReport
    ? reports.find((r: any) => r.id === id)
    : isAppeal
      ? appeals.find((a: any) => a.id === id)
      : bans.find((b: any) => b.id === id);

  const queryLoading = (isReport && reportsLoading) || (isAppeal && appealsLoading) || (isBan && bansLoading);
  const queryError = (isReport && reportsError) || (isAppeal && appealsError) || (isBan && bansError);

  const updateReportMutation = useMutation({
    mutationFn: async ({ status, moderatorNotes }: { status: string; moderatorNotes: string }) => {
      const res = await apiRequest("PATCH", `/api/reports/${id}`, { status, moderatorNotes });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Report updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      setNotes("");
    },
    onError: (e: Error) => {
      toast({ title: "Failed to update report", description: e.message, variant: "destructive" });
    },
  });

  const updateAppealMutation = useMutation({
    mutationFn: async ({ status, reviewNotes }: { status: string; reviewNotes: string }) => {
      const res = await apiRequest("PATCH", `/api/appeals/${id}`, { status, reviewNotes });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Appeal updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/appeals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bans"] });
      setNotes("");
    },
    onError: (e: Error) => {
      toast({ title: "Failed to update appeal", description: e.message, variant: "destructive" });
    },
  });

  const liftBanMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/bans/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Ban lifted" });
      queryClient.invalidateQueries({ queryKey: ["/api/bans"] });
    },
    onError: (e: Error) => {
      toast({ title: "Failed to lift ban", description: e.message, variant: "destructive" });
    },
  });

  if (!type || !["report", "appeal", "ban"].includes(type)) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white/40">
        Invalid case type
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4 text-white">
        <Shield className="w-16 h-16 text-red-400/30" />
        <h2 className="text-xl font-semibold">Unable to load case</h2>
        <p className="text-white/40 text-sm">You may not have permission to view this case.</p>
        <Link href="/modcp">
          <Button variant="outline" className="border-white/10" data-testid="button-back-to-modcp">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to ModCP
          </Button>
        </Link>
      </div>
    );
  }

  if (queryLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4 text-white">
        <FileText className="w-16 h-16 text-white/15" />
        <h2 className="text-xl font-semibold">Case not found</h2>
        <Link href="/modcp">
          <Button variant="outline" className="border-white/10" data-testid="button-back-to-modcp">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to ModCP
          </Button>
        </Link>
      </div>
    );
  }

  const isPending = isReport ? caseData.status === "Pending" : isAppeal ? caseData.status === "pending" : caseData.isActive;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-500">
        <Link href="/modcp">
          <span className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors cursor-pointer" data-testid="link-back-modcp">
            <ChevronLeft className="w-4 h-4" /> Back to ModCP
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
            {isReport ? <AlertTriangle className="w-6 h-6 text-yellow-400" /> :
             isAppeal ? <Scale className="w-6 h-6 text-blue-400" /> :
             <Shield className="w-6 h-6 text-red-400" />}
          </div>
          <div>
            <h1 className="text-2xl font-semibold" data-testid="text-case-title">
              {isReport ? "Report" : isAppeal ? "Appeal" : "Ban"} Case
            </h1>
            <p className="text-sm text-white/30">ID: {id}</p>
          </div>
          <Badge className={getStatusColor(isReport || isAppeal ? caseData.status : (caseData.isActive ? "Pending" : "Resolved"))} data-testid="badge-case-status">
            {isReport || isAppeal ? caseData.status : (caseData.isActive ? "Active" : "Lifted")}
          </Badge>
        </div>

        <Card className="bg-[#121212] border-white/5 rounded-xl">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Case Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isReport && (
                <>
                  <div>
                    <span className="text-xs text-white/30">Reason</span>
                    <p className="text-sm text-white font-medium" data-testid="text-case-reason">{caseData.reason}</p>
                  </div>
                  {caseData.details && (
                    <div>
                      <span className="text-xs text-white/30">Details</span>
                      <p className="text-sm text-white/70" data-testid="text-case-details">{caseData.details}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-white/30">Target Type</span>
                    <p className="text-sm text-white/70">{caseData.targetType}</p>
                  </div>
                  <div>
                    <span className="text-xs text-white/30">Target ID</span>
                    <p className="text-sm text-white/70 font-mono text-xs">{caseData.targetId}</p>
                  </div>
                  <div>
                    <span className="text-xs text-white/30">Reporter</span>
                    <p className="text-sm text-white/70 font-mono text-xs">{caseData.reporterId}</p>
                  </div>
                  <div>
                    <span className="text-xs text-white/30">Submitted</span>
                    <p className="text-sm text-white/70 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(caseData.createdAt).toLocaleString()}
                    </p>
                  </div>
                </>
              )}

              {isAppeal && (
                <>
                  <div className="md:col-span-2">
                    <span className="text-xs text-white/30">Appeal Reason</span>
                    <p className="text-sm text-white font-medium" data-testid="text-case-reason">{caseData.reason}</p>
                  </div>
                  <div>
                    <span className="text-xs text-white/30">User</span>
                    <p className="text-sm text-white/70">{caseData.user?.username || caseData.userId}</p>
                  </div>
                  {caseData.banId && (
                    <div>
                      <span className="text-xs text-white/30">Related Ban</span>
                      <Link href={`/modcp/case/ban/${caseData.banId}`}>
                        <span className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer">{caseData.banId}</span>
                      </Link>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-white/30">Submitted</span>
                    <p className="text-sm text-white/70 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(caseData.createdAt).toLocaleString()}
                    </p>
                  </div>
                </>
              )}

              {isBan && (
                <>
                  <div className="md:col-span-2">
                    <span className="text-xs text-white/30">Ban Reason</span>
                    <p className="text-sm text-white font-medium" data-testid="text-case-reason">{caseData.reason}</p>
                  </div>
                  <div>
                    <span className="text-xs text-white/30">Banned User</span>
                    <p className="text-sm text-white/70">{caseData.userId}</p>
                  </div>
                  <div>
                    <span className="text-xs text-white/30">Issued By</span>
                    <p className="text-sm text-white/70">{caseData.issuedBy || "System"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-white/30">Duration</span>
                    <p className="text-sm text-white/70">
                      {caseData.isPermanent ? "Permanent" : caseData.expiresAt ? `Expires ${new Date(caseData.expiresAt).toLocaleDateString()}` : "Temporary"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-white/30">Prior Rank</span>
                    <p className="text-sm text-white/70">{caseData.priorRank || "Unknown"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-white/30">Issued</span>
                    <p className="text-sm text-white/70 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(caseData.createdAt).toLocaleString()}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {caseData.moderatorNotes && (
          <Card className="bg-[#121212] border-white/5 rounded-xl">
            <CardContent className="p-6 space-y-3">
              <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Moderator Notes</h3>
              <p className="text-sm text-white/70" data-testid="text-mod-notes">{caseData.moderatorNotes}</p>
            </CardContent>
          </Card>
        )}

        {caseData.reviewNotes && (
          <Card className="bg-[#121212] border-white/5 rounded-xl">
            <CardContent className="p-6 space-y-3">
              <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Review Notes</h3>
              <p className="text-sm text-white/70" data-testid="text-review-notes">{caseData.reviewNotes}</p>
            </CardContent>
          </Card>
        )}

        {isPending && (
          <Card className="bg-[#121212] border-white/5 rounded-xl">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Actions</h3>

              <Textarea
                placeholder="Add notes about this case..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-white/5 border-white/10 text-white resize-none min-h-[100px]"
                data-testid="input-case-notes"
              />

              <div className="flex flex-wrap gap-3">
                {isReport && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => updateReportMutation.mutate({ status: "Reviewed", moderatorNotes: notes })}
                      disabled={updateReportMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                      data-testid="button-mark-reviewed"
                    >
                      {updateReportMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                      Mark Reviewed
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateReportMutation.mutate({ status: "Action Taken", moderatorNotes: notes })}
                      disabled={updateReportMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                      data-testid="button-action-taken"
                    >
                      Action Taken
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateReportMutation.mutate({ status: "Dismissed", moderatorNotes: notes })}
                      disabled={updateReportMutation.isPending}
                      className="border-white/10"
                      data-testid="button-dismiss"
                    >
                      <XCircle className="w-3 h-3 mr-1" /> Dismiss
                    </Button>
                  </>
                )}

                {isAppeal && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => updateAppealMutation.mutate({ status: "approved", reviewNotes: notes })}
                      disabled={updateAppealMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                      data-testid="button-approve"
                    >
                      {updateAppealMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                      Approve Appeal
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateAppealMutation.mutate({ status: "denied", reviewNotes: notes })}
                      disabled={updateAppealMutation.isPending}
                      className="bg-red-600 hover:bg-red-700"
                      data-testid="button-deny"
                    >
                      <XCircle className="w-3 h-3 mr-1" /> Deny Appeal
                    </Button>
                  </>
                )}

                {isBan && caseData.isActive && (
                  <Button
                    size="sm"
                    onClick={() => liftBanMutation.mutate()}
                    disabled={liftBanMutation.isPending}
                    className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                    variant="outline"
                    data-testid="button-lift-ban"
                  >
                    {liftBanMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                    Lift Ban
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
