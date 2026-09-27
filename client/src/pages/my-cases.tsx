import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  FileText,
  Scale,
  Shield,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  ChevronRight,
  Gavel,
  ClipboardList,
  MessageSquare,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

function getReportStatusStyle(status: string) {
  switch (status?.toLowerCase()) {
    case "pending":
      return {
        bg: "bg-yellow-500/10",
        text: "text-yellow-400",
        border: "border-yellow-500/10",
        icon: Clock,
        label: "Pending",
      };
    case "reviewed":
      return {
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        border: "border-blue-500/10",
        icon: Eye,
        label: "Reviewed",
      };
    case "action_taken":
      return {
        bg: "bg-green-500/10",
        text: "text-green-400",
        border: "border-green-500/10",
        icon: CheckCircle,
        label: "Action Taken",
      };
    case "dismissed":
      return {
        bg: "bg-white/5",
        text: "text-white/40",
        border: "border-white/5",
        icon: XCircle,
        label: "Dismissed",
      };
    default:
      return {
        bg: "bg-white/5",
        text: "text-white/40",
        border: "border-white/5",
        icon: AlertCircle,
        label: status || "Unknown",
      };
  }
}

function getAppealStatusStyle(status: string) {
  switch (status?.toLowerCase()) {
    case "pending":
      return {
        bg: "bg-yellow-500/10",
        text: "text-yellow-400",
        border: "border-yellow-500/10",
        icon: Clock,
        label: "Pending",
      };
    case "approved":
      return {
        bg: "bg-green-500/10",
        text: "text-green-400",
        border: "border-green-500/10",
        icon: CheckCircle,
        label: "Approved",
      };
    case "denied":
      return {
        bg: "bg-red-500/10",
        text: "text-red-400",
        border: "border-red-500/10",
        icon: XCircle,
        label: "Denied",
      };
    default:
      return {
        bg: "bg-white/5",
        text: "text-white/40",
        border: "border-white/5",
        icon: AlertCircle,
        label: status || "Unknown",
      };
  }
}

function formatDate(date: string | Date | null | undefined) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatStatus(status: string) {
  return status
    ? status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "Unknown";
}

export default function MyCases() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: myReports = [], isLoading: reportsLoading } = useQuery<any[]>({
    queryKey: ["/api/reports/my"],
    enabled: !!user,
  });

  const { data: myAppeals = [], isLoading: appealsLoading } = useQuery<any[]>({
    queryKey: ["/api/appeals/my"],
    enabled: !!user,
  });

  if (authLoading || reportsLoading || appealsLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-2xl" />
            ))}
          </div>

          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-5">
            <Shield className="w-7 h-7 text-white/20" />
          </div>

          <h1 className="text-lg font-semibold text-white mb-2">
            Sign in required
          </h1>

          <p className="text-sm text-white/40 leading-relaxed mb-6">
            Please sign in to view your submitted reports, appeals, and their
            current status.
          </p>

          <Button
            asChild
            className="bg-white text-black hover:bg-white/90 rounded-xl px-6"
            data-testid="button-login-redirect"
          >
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  const pendingReports = myReports.filter(
    (report: any) => report.status?.toLowerCase() === "pending",
  ).length;

  const activeAppeals = myAppeals.filter(
    (appeal: any) => appeal.status?.toLowerCase() === "pending",
  ).length;

  const resolvedReports = myReports.filter((report: any) =>
    ["action_taken", "dismissed"].includes(report.status?.toLowerCase()),
  ).length;

  const resolvedAppeals = myAppeals.filter((appeal: any) =>
    ["approved", "denied"].includes(appeal.status?.toLowerCase()),
  ).length;

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="mt-1 shrink-0 rounded-xl text-white/40 hover:text-white hover:bg-white/5"
              asChild
              data-testid="button-back-dashboard"
            >
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/5 flex items-center justify-center">
                  <Gavel className="w-3.5 h-3.5 text-white/50" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
                  Account & Moderation
                </span>
              </div>

              <h1
                className="text-3xl sm:text-4xl font-semibold tracking-tight text-white"
                data-testid="text-cases-title"
              >
                My Cases
              </h1>

              <p className="text-sm text-white/40 mt-2 max-w-2xl">
                Track reports you have submitted and appeals associated with
                your account.
              </p>
            </div>
          </div>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          <Card className="bg-card/60 border-white/5 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-white/25">
                  Reports
                </span>
              </div>
              <p className="text-2xl font-semibold text-white">
                {myReports.length}
              </p>
              <p className="text-xs text-white/35 mt-1">Submitted</p>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-white/5 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-400" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-white/25">
                  Pending
                </span>
              </div>
              <p className="text-2xl font-semibold text-white">
                {pendingReports + activeAppeals}
              </p>
              <p className="text-xs text-white/35 mt-1">Awaiting review</p>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-white/5 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Scale className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-white/25">
                  Appeals
                </span>
              </div>
              <p className="text-2xl font-semibold text-white">
                {myAppeals.length}
              </p>
              <p className="text-xs text-white/35 mt-1">Submitted</p>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-white/5 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-white/25">
                  Resolved
                </span>
              </div>
              <p className="text-2xl font-semibold text-white">
                {resolvedReports + resolvedAppeals}
              </p>
              <p className="text-xs text-white/35 mt-1">Cases resolved</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-10">
          {/* Reports */}
          <section>
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-white/40" />
                  <h2 className="text-sm font-semibold text-white">
                    Submitted Reports
                  </h2>
                </div>
                <p className="text-xs text-white/30">
                  Reports you've submitted to RIVET staff.
                </p>
              </div>

              <Badge className="bg-white/[0.04] border border-white/5 text-white/40 rounded-lg px-2.5 py-1">
                {myReports.length}
              </Badge>
            </div>

            {myReports.length > 0 ? (
              <div className="space-y-3">
                {myReports.map((report: any) => {
                  const style = getReportStatusStyle(report.status);
                  const StatusIcon = style.icon;

                  return (
                    <Card
                      key={report.id}
                      className="group bg-card/70 border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors"
                      data-testid={`card-my-report-${report.id}`}
                    >
                      <CardContent className="p-0">
                        <div className="p-5 sm:p-6">
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-10 h-10 rounded-xl ${style.bg} border ${style.border} flex items-center justify-center shrink-0`}
                            >
                              <StatusIcon
                                className={`w-4 h-4 ${style.text}`}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge
                                  className={`${style.bg} ${style.text} border ${style.border} rounded-lg text-[11px] px-2.5 py-1`}
                                >
                                  {style.label}
                                </Badge>

                                {report.targetType && (
                                  <Badge className="bg-white/[0.04] text-white/40 border border-white/5 rounded-lg text-[11px] px-2.5 py-1">
                                    {formatStatus(report.targetType)}
                                  </Badge>
                                )}
                              </div>

                              <h3 className="text-sm font-medium text-white leading-relaxed">
                                {report.reason}
                              </h3>

                              {report.details && (
                                <p className="text-sm text-white/40 mt-2 leading-relaxed">
                                  {report.details}
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-4 text-[11px] text-white/25">
                                <span>
                                  Submitted {formatDate(report.createdAt)}
                                </span>
                                {report.id && (
                                  <>
                                    <span className="text-white/10">•</span>
                                    <span className="font-mono">
                                      Case #{String(report.id).slice(0, 8)}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/25 transition-colors shrink-0 mt-1 hidden sm:block" />
                          </div>

                          {report.moderatorNotes && (
                            <div className="mt-5 ml-0 sm:ml-14 rounded-xl bg-white/[0.025] border border-white/5 p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="w-3.5 h-3.5 text-white/25" />
                                <p className="text-[10px] text-white/30 uppercase tracking-[0.12em] font-semibold">
                                  Staff Response
                                </p>
                              </div>
                              <p className="text-sm text-white/50 leading-relaxed">
                                {report.moderatorNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="bg-card/50 border-white/5 rounded-2xl">
                <CardContent className="py-12 px-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="w-5 h-5 text-white/15" />
                  </div>
                  <h3 className="text-sm font-medium text-white/60">
                    No reports submitted
                  </h3>
                  <p className="text-xs text-white/30 mt-1 max-w-xs mx-auto">
                    Reports you submit through RIVET will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Appeals */}
          <section>
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="w-4 h-4 text-white/40" />
                  <h2 className="text-sm font-semibold text-white">
                    Appeals
                  </h2>
                </div>
                <p className="text-xs text-white/30">
                  Track appeals you've submitted for moderation decisions.
                </p>
              </div>

              <Badge className="bg-white/[0.04] border border-white/5 text-white/40 rounded-lg px-2.5 py-1">
                {myAppeals.length}
              </Badge>
            </div>

            {myAppeals.length > 0 ? (
              <div className="space-y-3">
                {myAppeals.map((appeal: any) => {
                  const style = getAppealStatusStyle(appeal.status);
                  const StatusIcon = style.icon;

                  return (
                    <Card
                      key={appeal.id}
                      className="group bg-card/70 border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors"
                      data-testid={`card-my-appeal-${appeal.id}`}
                    >
                      <CardContent className="p-0">
                        <div className="p-5 sm:p-6">
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-10 h-10 rounded-xl ${style.bg} border ${style.border} flex items-center justify-center shrink-0`}
                            >
                              <StatusIcon
                                className={`w-4 h-4 ${style.text}`}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge
                                  className={`${style.bg} ${style.text} border ${style.border} rounded-lg text-[11px] px-2.5 py-1`}
                                >
                                  {style.label}
                                </Badge>

                                {appeal.banId && (
                                  <Badge className="bg-white/[0.04] text-white/40 border border-white/5 rounded-lg text-[11px] px-2.5 py-1 font-mono">
                                    Ban #{String(appeal.banId).slice(0, 8)}
                                  </Badge>
                                )}
                              </div>

                              <h3 className="text-sm font-medium text-white leading-relaxed">
                                {appeal.reason}
                              </h3>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-4 text-[11px] text-white/25">
                                <span>
                                  Submitted {formatDate(appeal.createdAt)}
                                </span>
                                {appeal.id && (
                                  <>
                                    <span className="text-white/10">•</span>
                                    <span className="font-mono">
                                      Case #{String(appeal.id).slice(0, 8)}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/25 transition-colors shrink-0 mt-1 hidden sm:block" />
                          </div>

                          {appeal.reviewNotes && (
                            <div className="mt-5 ml-0 sm:ml-14 rounded-xl bg-white/[0.025] border border-white/5 p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="w-3.5 h-3.5 text-white/25" />
                                <p className="text-[10px] text-white/30 uppercase tracking-[0.12em] font-semibold">
                                  Staff Response
                                </p>
                              </div>
                              <p className="text-sm text-white/50 leading-relaxed">
                                {appeal.reviewNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="bg-card/50 border-white/5 rounded-2xl">
                <CardContent className="py-12 px-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-4">
                    <Scale className="w-5 h-5 text-white/15" />
                  </div>
                  <h3 className="text-sm font-medium text-white/60">
                    No appeals submitted
                  </h3>
                  <p className="text-xs text-white/30 mt-1 max-w-xs mx-auto">
                    Appeals associated with your account will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </section>
        </div>

        {/* Footer note */}
        <div className="mt-10 pt-6 border-t border-white/5">
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-white/20 mt-0.5 shrink-0" />
            <p className="text-xs text-white/25 leading-relaxed">
              Case information is private to your account. Staff responses and
              status updates will appear here as your cases are reviewed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}