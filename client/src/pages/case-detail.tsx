import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

import {
  AlertTriangle,
  ArrowRight,
  Ban,
  CheckCircle,
  ChevronLeft,
  Clock,
  FileText,
  Gavel,
  Loader2,
  Scale,
  Shield,
  User,
  XCircle,
} from "lucide-react";

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

    case "approved":
    case "action_taken":
      return "bg-green-500/10 text-green-400 border-green-500/20";

    case "denied":
      return "bg-red-500/10 text-red-400 border-red-500/20";

    case "in review":
    case "in_review":
    case "reviewed":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";

    case "dismissed":
    case "resolved":
      return "bg-white/5 text-white/50 border-white/10";

    default:
      return "bg-white/5 text-white/50 border-white/10";
  }
}

function getCaseTypeLabel(type: string) {
  switch (type) {
    case "report":
      return "Report";
    case "appeal":
      return "Appeal";
    case "ban":
      return "Ban";
    default:
      return "Case";
  }
}

function getCaseDescription(type: string) {
  switch (type) {
    case "report":
      return "Community report submitted for moderation review.";
    case "appeal":
      return "Ban appeal submitted for staff review.";
    case "ban":
      return "Moderation action currently recorded against a user.";
    default:
      return "Moderation case record.";
  }
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value: any) {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString();
}

function CaseIcon({
  type,
  className = "w-6 h-6",
}: {
  type: string;
  className?: string;
}) {
  if (type === "report") {
    return <AlertTriangle className={`${className} text-yellow-400`} />;
  }

  if (type === "appeal") {
    return <Scale className={`${className} text-blue-400`} />;
  }

  return <Shield className={`${className} text-red-400`} />;
}

function DetailItem({
  label,
  children,
  icon,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wider text-white/30">
          {label}
        </span>
      </div>

      <div className="text-sm text-white/75 break-words">
        {children}
      </div>
    </div>
  );
}

export default function CaseDetail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [notes, setNotes] = useState("");

  const normalizedType = type?.toLowerCase();

  const isReport = normalizedType === "report";
  const isAppeal = normalizedType === "appeal";
  const isBan = normalizedType === "ban";

  const validType =
    normalizedType === "report" ||
    normalizedType === "appeal" ||
    normalizedType === "ban";

  const {
    data: reports = [],
    isLoading: reportsLoading,
    isError: reportsError,
  } = useQuery<any[]>({
    queryKey: ["/api/reports"],
    enabled: validType,
  });

  const {
    data: appeals = [],
    isLoading: appealsLoading,
    isError: appealsError,
  } = useQuery<any[]>({
    queryKey: ["/api/appeals"],
    enabled: validType,
  });

  const {
    data: bans = [],
    isLoading: bansLoading,
    isError: bansError,
  } = useQuery<any[]>({
    queryKey: ["/api/bans"],
    enabled: validType,
  });

  const caseData = isReport
    ? reports.find((report: any) => report.id === id)
    : isAppeal
      ? appeals.find((appeal: any) => appeal.id === id)
      : bans.find((ban: any) => ban.id === id);

  const queryLoading =
    (isReport && reportsLoading) ||
    (isAppeal && appealsLoading) ||
    (isBan && bansLoading);

  const queryError =
    (isReport && reportsError) ||
    (isAppeal && appealsError) ||
    (isBan && bansError);

  const updateReportMutation = useMutation({
    mutationFn: async ({
      status,
      moderatorNotes,
    }: {
      status: string;
      moderatorNotes: string;
    }) => {
      const res = await apiRequest("PATCH", `/api/reports/${id}`, {
        status,
        moderatorNotes,
      });

      return res.json();
    },

    onSuccess: () => {
      toast({ title: "Report updated" });

      queryClient.invalidateQueries({
        queryKey: ["/api/reports"],
      });

      setNotes("");
    },

    onError: (error: Error) => {
      toast({
        title: "Failed to update report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAppealMutation = useMutation({
    mutationFn: async ({
      status,
      reviewNotes,
    }: {
      status: string;
      reviewNotes: string;
    }) => {
      const res = await apiRequest("PATCH", `/api/appeals/${id}`, {
        status,
        reviewNotes,
      });

      return res.json();
    },

    onSuccess: () => {
      toast({ title: "Appeal updated" });

      queryClient.invalidateQueries({
        queryKey: ["/api/appeals"],
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/bans"],
      });

      setNotes("");
    },

    onError: (error: Error) => {
      toast({
        title: "Failed to update appeal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const liftBanMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/bans/${id}`);
      return res.json();
    },

    onSuccess: () => {
      toast({ title: "Ban lifted" });

      queryClient.invalidateQueries({
        queryKey: ["/api/bans"],
      });
    },

    onError: (error: Error) => {
      toast({
        title: "Failed to lift ban",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!validType) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center px-6">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-white/10" />

          <h2 className="text-lg font-semibold text-white">
            Invalid case type
          </h2>

          <p className="mt-1 text-sm text-white/35">
            The requested moderation case type does not exist.
          </p>

          <Link href="/modcp">
            <Button
              variant="outline"
              className="mt-6 border-white/10 bg-white/[0.02]"
              data-testid="button-back-to-modcp"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to ModCP
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (queryLoading) {
    return (
      <div className="min-h-screen bg-transparent text-foreground">
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/10 flex items-center justify-center mx-auto mb-5">
            <Shield className="w-7 h-7 text-red-400/60" />
          </div>

          <h2 className="text-xl font-semibold text-white">
            Unable to load case
          </h2>

          <p className="mt-2 text-sm text-white/40">
            You may not have permission to view this case, or the case could
            not be retrieved.
          </p>

          <Link href="/modcp">
            <Button
              variant="outline"
              className="mt-6 border-white/10"
              data-testid="button-back-to-modcp"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to ModCP
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-5">
            <FileText className="w-7 h-7 text-white/15" />
          </div>

          <h2 className="text-xl font-semibold text-white">
            Case not found
          </h2>

          <p className="mt-2 text-sm text-white/35">
            This case may have been removed or no longer exists.
          </p>

          <Link href="/modcp">
            <Button
              variant="outline"
              className="mt-6 border-white/10"
              data-testid="button-back-to-modcp"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to ModCP
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isActionable = isReport
    ? caseData.status === "pending"
    : isAppeal
      ? caseData.status === "pending"
      : caseData.isActive;

  const caseUserId = isReport
    ? caseData.targetId
    : caseData.userId;

  const relatedReports = useMemo(() => {
    if (!caseUserId) return [];

    return reports
      .filter(
        (report: any) =>
          report.id !== id &&
          (report.targetId === caseUserId ||
            report.reporterId === caseUserId),
      )
      .slice(0, 5);
  }, [reports, caseUserId, id]);

  const relatedAppeals = useMemo(() => {
    if (!caseUserId) return [];

    return appeals
      .filter(
        (appeal: any) =>
          appeal.id !== id && appeal.userId === caseUserId,
      )
      .slice(0, 5);
  }, [appeals, caseUserId, id]);

  const relatedBans = useMemo(() => {
    if (!caseUserId) return [];

    return bans
      .filter(
        (ban: any) =>
          ban.id !== id && ban.userId === caseUserId,
      )
      .slice(0, 5);
  }, [bans, caseUserId, id]);

  const hasRelatedCases =
    relatedReports.length > 0 ||
    relatedAppeals.length > 0 ||
    relatedBans.length > 0;

  const caseStatus = isReport || isAppeal
    ? formatStatus(caseData.status || "Unknown")
    : caseData.isActive
      ? "Active"
      : "Lifted";

  const statusClass = isReport || isAppeal
    ? getStatusColor(caseData.status)
    : caseData.isActive
      ? "bg-red-500/10 text-red-400 border-red-500/20"
      : "bg-white/5 text-white/50 border-white/10";

  const currentMutationPending =
    updateReportMutation.isPending ||
    updateAppealMutation.isPending ||
    liftBanMutation.isPending;

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-8 md:py-10 space-y-6 animate-in fade-in duration-500">

        {/* Breadcrumb */}
        <Link href="/modcp">
          <span
            className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors cursor-pointer"
            data-testid="link-back-modcp"
          >
            <ChevronLeft className="w-4 h-4" />
            ModCP
          </span>
        </Link>

        {/* Case Header */}
        <Card className="bg-card/80 border-white/5 rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6 md:p-7">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                <div className="flex items-start gap-4 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isReport
                        ? "bg-yellow-500/10"
                        : isAppeal
                          ? "bg-blue-500/10"
                          : "bg-red-500/10"
                    }`}
                  >
                    <CaseIcon type={normalizedType!} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1
                        className="text-xl md:text-2xl font-semibold text-white"
                        data-testid="text-case-title"
                      >
                        {getCaseTypeLabel(normalizedType!)} Case
                      </h1>

                      <Badge
                        variant="outline"
                        className={`text-[11px] ${statusClass}`}
                        data-testid="badge-case-status"
                      >
                        {caseStatus}
                      </Badge>
                    </div>

                    <p className="mt-1.5 text-sm text-white/35">
                      {getCaseDescription(normalizedType!)}
                    </p>

                    <p className="mt-2 text-xs font-mono text-white/20">
                      Case ID: {id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-white/30 shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(caseData.createdAt)}
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 bg-white/[0.015] px-6 md:px-7 py-3.5">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/35">
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  {getCaseTypeLabel(normalizedType!)}
                </span>

                {caseUserId && (
                  <span className="inline-flex items-center gap-1.5 font-mono">
                    <User className="w-3.5 h-3.5" />
                    {caseUserId}
                  </span>
                )}

                {isBan && caseData.issuedBy && (
                  <span className="inline-flex items-center gap-1.5">
                    <Gavel className="w-3.5 h-3.5" />
                    Issued by {caseData.issuedBy}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Case Details */}
        <Card className="bg-card/80 border-white/5 rounded-2xl">
          <CardContent className="p-6 md:p-7 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Case Details
              </h2>

              <p className="mt-1 text-xs text-white/30">
                Information recorded for this moderation case.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

              {isReport && (
                <>
                  <DetailItem
                    label="Reason"
                    icon={
                      <AlertTriangle className="w-3 h-3 text-yellow-400/70" />
                    }
                    wide
                  >
                    <span
                      className="text-white font-medium"
                      data-testid="text-case-reason"
                    >
                      {caseData.reason || "No reason provided"}
                    </span>
                  </DetailItem>

                  {caseData.details && (
                    <DetailItem label="Details" wide>
                      <p
                        className="text-white/65 whitespace-pre-wrap leading-relaxed"
                        data-testid="text-case-details"
                      >
                        {caseData.details}
                      </p>
                    </DetailItem>
                  )}

                  <DetailItem label="Target Type">
                    {caseData.targetType || "Unknown"}
                  </DetailItem>

                  <DetailItem label="Target ID">
                    <span className="font-mono text-xs text-white/55">
                      {caseData.targetId || "Unknown"}
                    </span>
                  </DetailItem>

                  <DetailItem label="Reporter">
                    <span className="font-mono text-xs text-white/55">
                      {caseData.reporterId || "Unknown"}
                    </span>
                  </DetailItem>

                  <DetailItem label="Submitted">
                    {formatDate(caseData.createdAt)}
                  </DetailItem>
                </>
              )}

              {isAppeal && (
                <>
                  <DetailItem
                    label="Appeal Reason"
                    icon={
                      <Scale className="w-3 h-3 text-blue-400/70" />
                    }
                    wide
                  >
                    <span
                      className="text-white font-medium"
                      data-testid="text-case-reason"
                    >
                      {caseData.reason || "No reason provided"}
                    </span>
                  </DetailItem>

                  <DetailItem label="User">
                    {caseData.user?.username || caseData.userId || "Unknown"}
                  </DetailItem>

                  <DetailItem label="Submitted">
                    {formatDate(caseData.createdAt)}
                  </DetailItem>

                  {caseData.banId && (
                    <DetailItem label="Related Ban">
                      <Link href={`/modcp/case/ban/${caseData.banId}`}>
                        <span className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 cursor-pointer transition-colors font-mono text-xs">
                          {caseData.banId}
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </Link>
                    </DetailItem>
                  )}
                </>
              )}

              {isBan && (
                <>
                  <DetailItem
                    label="Ban Reason"
                    icon={
                      <Shield className="w-3 h-3 text-red-400/70" />
                    }
                    wide
                  >
                    <span
                      className="text-white font-medium"
                      data-testid="text-case-reason"
                    >
                      {caseData.reason || "No reason provided"}
                    </span>
                  </DetailItem>

                  <DetailItem label="Banned User">
                    <span className="font-mono text-xs text-white/55">
                      {caseData.userId || "Unknown"}
                    </span>
                  </DetailItem>

                  <DetailItem label="Issued By">
                    {caseData.issuedBy || "System"}
                  </DetailItem>

                  <DetailItem label="Duration">
                    {caseData.isPermanent
                      ? "Permanent"
                      : caseData.expiresAt
                        ? `Expires ${new Date(
                            caseData.expiresAt,
                          ).toLocaleDateString()}`
                        : "Temporary"}
                  </DetailItem>

                  <DetailItem label="Prior Rank">
                    {caseData.priorRank || "Unknown"}
                  </DetailItem>

                  <DetailItem label="Issued">
                    {formatDate(caseData.createdAt)}
                  </DetailItem>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Existing Notes */}
        {(caseData.moderatorNotes || caseData.reviewNotes) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {caseData.moderatorNotes && (
              <Card className="bg-card/80 border-white/5 rounded-2xl">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-white/30" />

                    <h3 className="text-sm font-semibold text-white">
                      Moderator Notes
                    </h3>
                  </div>

                  <div className="rounded-xl bg-white/[0.025] border border-white/5 p-4">
                    <p
                      className="text-sm text-white/60 whitespace-pre-wrap leading-relaxed"
                      data-testid="text-mod-notes"
                    >
                      {caseData.moderatorNotes}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {caseData.reviewNotes && (
              <Card className="bg-card/80 border-white/5 rounded-2xl">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-white/30" />

                    <h3 className="text-sm font-semibold text-white">
                      Review Notes
                    </h3>
                  </div>

                  <div className="rounded-xl bg-white/[0.025] border border-white/5 p-4">
                    <p
                      className="text-sm text-white/60 whitespace-pre-wrap leading-relaxed"
                      data-testid="text-review-notes"
                    >
                      {caseData.reviewNotes}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Actions */}
        {isActionable && (
          <Card className="bg-card/80 border-white/5 rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="px-6 md:px-7 py-5 border-b border-white/5">
                <h2 className="text-sm font-semibold text-white">
                  Case Actions
                </h2>

                <p className="mt-1 text-xs text-white/30">
                  Record a moderation decision for this case.
                </p>
              </div>

              <div className="p-6 md:p-7 space-y-5">
                <Textarea
                  placeholder={
                    isAppeal
                      ? "Add review notes..."
                      : isReport
                        ? "Add moderator notes..."
                        : "Add notes before taking action..."
                  }
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="bg-white/[0.025] border-white/10 text-white placeholder:text-white/20 resize-none min-h-[120px] rounded-xl focus-visible:ring-white/10"
                  data-testid="input-case-notes"
                />

                <div className="flex flex-wrap gap-2.5">

                  {isReport && (
                    <>
                      <Button
                        size="sm"
                        onClick={() =>
                          updateReportMutation.mutate({
                            status: "reviewed",
                            moderatorNotes: notes,
                          })
                        }
                        disabled={currentMutationPending}
                        className="bg-blue-600 hover:bg-blue-700"
                        data-testid="button-mark-reviewed"
                      >
                        {updateReportMutation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                        )}

                        Mark In Review
                      </Button>

                      <Button
                        size="sm"
                        onClick={() =>
                          updateReportMutation.mutate({
                            status: "action_taken",
                            moderatorNotes: notes,
                          })
                        }
                        disabled={currentMutationPending}
                        className="bg-green-600 hover:bg-green-700"
                        data-testid="button-action-taken"
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                        Action Taken
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateReportMutation.mutate({
                            status: "dismissed",
                            moderatorNotes: notes,
                          })
                        }
                        disabled={currentMutationPending}
                        className="border-white/10 bg-white/[0.02]"
                        data-testid="button-dismiss"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1.5" />
                        Dismiss
                      </Button>
                    </>
                  )}

                  {isAppeal && (
                    <>
                      <Button
                        size="sm"
                        onClick={() =>
                          updateAppealMutation.mutate({
                            status: "approved",
                            reviewNotes: notes,
                          })
                        }
                        disabled={currentMutationPending}
                        className="bg-green-600 hover:bg-green-700"
                        data-testid="button-approve"
                      >
                        {updateAppealMutation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                        )}

                        Approve Appeal
                      </Button>

                      <Button
                        size="sm"
                        onClick={() =>
                          updateAppealMutation.mutate({
                            status: "denied",
                            reviewNotes: notes,
                          })
                        }
                        disabled={currentMutationPending}
                        className="bg-red-600 hover:bg-red-700"
                        data-testid="button-deny"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1.5" />
                        Deny Appeal
                      </Button>
                    </>
                  )}

                  {isBan && caseData.isActive && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => liftBanMutation.mutate()}
                      disabled={currentMutationPending}
                      className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                      data-testid="button-lift-ban"
                    >
                      {liftBanMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      )}

                      Lift Ban
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Related Cases */}
        {hasRelatedCases && (
          <Card
            className="bg-card/80 border-white/5 rounded-2xl"
            data-testid="card-related-cases"
          >
            <CardContent className="p-6 md:p-7 space-y-5">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Related Cases
                </h2>

                <p className="mt-1 text-xs text-white/30">
                  Other moderation records involving the same user.
                </p>
              </div>

              <div className="space-y-5">

                {relatedReports.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-white/30 flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-yellow-400/70" />
                      Reports
                      <span className="text-white/15">
                        ({relatedReports.length})
                      </span>
                    </p>

                    {relatedReports.map((report: any) => (
                      <Link
                        key={report.id}
                        href={`/modcp/case/report/${report.id}`}
                      >
                        <div
                          className="group flex items-center justify-between gap-4 p-3.5 rounded-xl bg-white/[0.025] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer"
                          data-testid={`related-report-${report.id}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm text-white/70 truncate">
                                {report.reason || "Report"}
                              </p>

                              <p className="text-[11px] text-white/20 font-mono mt-0.5">
                                {report.id}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${getStatusColor(
                                report.status,
                              )}`}
                            >
                              {formatStatus(report.status)}
                            </Badge>

                            <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {relatedAppeals.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-white/30 flex items-center gap-1.5">
                      <Scale className="w-3 h-3 text-blue-400/70" />
                      Appeals
                      <span className="text-white/15">
                        ({relatedAppeals.length})
                      </span>
                    </p>

                    {relatedAppeals.map((appeal: any) => (
                      <Link
                        key={appeal.id}
                        href={`/modcp/case/appeal/${appeal.id}`}
                      >
                        <div
                          className="group flex items-center justify-between gap-4 p-3.5 rounded-xl bg-white/[0.025] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer"
                          data-testid={`related-appeal-${appeal.id}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                              <Scale className="w-3.5 h-3.5 text-blue-400" />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm text-white/70 truncate">
                                {appeal.reason || "Appeal"}
                              </p>

                              <p className="text-[11px] text-white/20 font-mono mt-0.5">
                                {appeal.id}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${getStatusColor(
                                appeal.status,
                              )}`}
                            >
                              {formatStatus(appeal.status)}
                            </Badge>

                            <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {relatedBans.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-white/30 flex items-center gap-1.5">
                      <Ban className="w-3 h-3 text-red-400/70" />
                      Bans
                      <span className="text-white/15">
                        ({relatedBans.length})
                      </span>
                    </p>

                    {relatedBans.map((ban: any) => (
                      <Link
                        key={ban.id}
                        href={`/modcp/case/ban/${ban.id}`}
                      >
                        <div
                          className="group flex items-center justify-between gap-4 p-3.5 rounded-xl bg-white/[0.025] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer"
                          data-testid={`related-ban-${ban.id}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                              <Ban className="w-3.5 h-3.5 text-red-400" />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm text-white/70 truncate">
                                {ban.reason || "Ban"}
                              </p>

                              <p className="text-[11px] text-white/20 font-mono mt-0.5">
                                {ban.id}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                ban.isActive
                                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                                  : "bg-white/5 text-white/50 border-white/10"
                              }`}
                            >
                              {ban.isActive ? "Active" : "Lifted"}
                            </Badge>

                            <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bottom navigation */}
        <div className="flex items-center justify-between pt-2 pb-8">
          <Link href="/modcp">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/40 hover:text-white hover:bg-white/5"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to ModCP
            </Button>
          </Link>

          <span className="text-[11px] text-white/15 font-mono">
            {getCaseTypeLabel(normalizedType!)} / {id}
          </span>
        </div>
      </div>
    </div>
  );
}
