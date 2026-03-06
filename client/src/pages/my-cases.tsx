import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Gavel,
  FileText,
  Scale,
  Shield,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

function getReportStatusStyle(status: string) {
  switch (status) {
    case "Pending":
      return { bg: "bg-yellow-500/10", text: "text-yellow-400", icon: Clock };
    case "Reviewed":
      return { bg: "bg-blue-500/10", text: "text-blue-400", icon: Eye };
    case "Action Taken":
      return { bg: "bg-green-500/10", text: "text-green-400", icon: CheckCircle };
    case "Dismissed":
      return { bg: "bg-white/5", text: "text-white/40", icon: XCircle };
    default:
      return { bg: "bg-white/5", text: "text-white/40", icon: AlertCircle };
  }
}

function getAppealStatusStyle(status: string) {
  switch (status) {
    case "pending":
      return { bg: "bg-yellow-500/10", text: "text-yellow-400", icon: Clock };
    case "approved":
      return { bg: "bg-green-500/10", text: "text-green-400", icon: CheckCircle };
    case "denied":
      return { bg: "bg-red-500/10", text: "text-red-400", icon: XCircle };
    default:
      return { bg: "bg-white/5", text: "text-white/40", icon: AlertCircle };
  }
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
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[200px] rounded-2xl" />
        <Skeleton className="h-[200px] rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <Shield className="w-12 h-12 text-white/20" />
        <p className="text-white/50 text-sm">Please sign in to view your cases.</p>
        <Button asChild className="bg-white text-black rounded-lg" data-testid="button-login-redirect">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-white/40 hover:text-white" asChild data-testid="button-back-dashboard">
          <Link href="/dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-white" data-testid="text-cases-title">My Cases</h1>
          <p className="text-sm text-white/40">Track the status of your submitted reports and appeals</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-white/40" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
              Reports ({myReports.length})
            </h2>
          </div>

          {myReports.length > 0 ? (
            <div className="space-y-3">
              {myReports.map((report: any) => {
                const style = getReportStatusStyle(report.status);
                const StatusIcon = style.icon;
                return (
                  <Card key={report.id} className="bg-[#121212] border-white/5 rounded-xl overflow-hidden" data-testid={`card-my-report-${report.id}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`${style.bg} ${style.text} border-none text-xs px-2 py-0.5 gap-1`}>
                              <StatusIcon className="w-3 h-3" />
                              {report.status}
                            </Badge>
                            <Badge className="bg-white/5 text-white/40 border-none text-xs px-2 py-0.5">
                              {report.targetType}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-white">{report.reason}</p>
                          {report.details && (
                            <p className="text-xs text-white/40">{report.details}</p>
                          )}
                          <p className="text-[10px] text-white/20">
                            Submitted {report.createdAt ? new Date(report.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
                          </p>

                          {report.moderatorNotes && (
                            <div className="mt-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                              <p className="text-[10px] text-white/30 uppercase tracking-wide font-medium mb-1">Staff Response</p>
                              <p className="text-xs text-white/60">{report.moderatorNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-[#121212] border-white/5 rounded-xl">
              <CardContent className="p-8 text-center">
                <FileText className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-xs text-white/30">You haven't submitted any reports</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Scale className="w-4 h-4 text-white/40" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
              Appeals ({myAppeals.length})
            </h2>
          </div>

          {myAppeals.length > 0 ? (
            <div className="space-y-3">
              {myAppeals.map((appeal: any) => {
                const style = getAppealStatusStyle(appeal.status);
                const StatusIcon = style.icon;
                return (
                  <Card key={appeal.id} className="bg-[#121212] border-white/5 rounded-xl overflow-hidden" data-testid={`card-my-appeal-${appeal.id}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-2">
                          <Badge className={`${style.bg} ${style.text} border-none text-xs px-2 py-0.5 gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {appeal.status}
                          </Badge>
                          <p className="text-sm font-medium text-white">{appeal.reason}</p>
                          <p className="text-[10px] text-white/20">
                            Submitted {appeal.createdAt ? new Date(appeal.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
                            {appeal.banId && ` • Ban ID: ${appeal.banId}`}
                          </p>

                          {appeal.reviewNotes && (
                            <div className="mt-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                              <p className="text-[10px] text-white/30 uppercase tracking-wide font-medium mb-1">Staff Response</p>
                              <p className="text-xs text-white/60">{appeal.reviewNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-[#121212] border-white/5 rounded-xl">
              <CardContent className="p-8 text-center">
                <Scale className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-xs text-white/30">You haven't submitted any appeals</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
