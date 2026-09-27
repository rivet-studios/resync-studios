import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Ban, Appeal, User } from "@shared/schema";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Loader2,
  ShieldAlert,
  FileText,
  Gavel,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
} from "lucide-react";

const STAFF_RANKS = [
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

function isStaffUser(user: User | null | undefined): boolean {
  if (!user) return false;

  if (user.isAdmin || user.isModerator) return true;

  if (user.userRank && STAFF_RANKS.includes(user.userRank)) {
    return true;
  }

  if (user.additionalRanks) {
    return user.additionalRanks.some(
      (r) => r && STAFF_RANKS.includes(r),
    );
  }

  return false;
}

function getStatusVariant(
  status: string | null,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status?.toLowerCase()) {
    case "approved":
      return "default";

    case "denied":
      return "destructive";

    case "pending":
    default:
      return "secondary";
  }
}

function formatStatus(status: string | null): string {
  return (status || "pending")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "Unknown";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getAppealStatusIcon(status: string | null) {
  switch (status?.toLowerCase()) {
    case "approved":
      return CheckCircle2;

    case "denied":
      return XCircle;

    default:
      return Clock;
  }
}

export default function AppealsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [selectedBanId, setSelectedBanId] = useState("");
  const [appealReason, setAppealReason] = useState("");
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const isStaff = isStaffUser(user);

  const { data: myBans = [], isLoading: bansLoading } = useQuery<Ban[]>({
    queryKey: ["/api/bans/my"],
    enabled: !!user,
  });

  const { data: myAppeals = [], isLoading: appealsLoading } = useQuery<
    Appeal[]
  >({
    queryKey: ["/api/appeals/my"],
    enabled: !!user,
  });

  const { data: allAppeals = [], isLoading: queueLoading } = useQuery<
    (Appeal & { user?: User })[]
  >({
    queryKey: ["/api/appeals"],
    enabled: isStaff,
  });

  const activeBans = myBans.filter((b) => b.isActive);

  const submitAppeal = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/appeals", {
        banId: selectedBanId,
        reason: appealReason,
      });
    },

    onSuccess: () => {
      toast({
        title: "Appeal submitted",
        description: "Your appeal has been submitted for review.",
      });

      setSelectedBanId("");
      setAppealReason("");

      queryClient.invalidateQueries({
        queryKey: ["/api/appeals/my"],
      });
    },

    onError: (err: Error) => {
      toast({
        title: "Unable to submit appeal",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const reviewAppeal = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: string;
    }) => {
      await apiRequest("PATCH", `/api/appeals/${id}`, {
        status,
        reviewNotes: reviewNotes[id] || "",
      });
    },

    onSuccess: () => {
      toast({
        title: "Appeal updated",
        description: "The appeal has been reviewed.",
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/appeals"],
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/appeals/my"],
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/bans/my"],
      });
    },

    onError: (err: Error) => {
      toast({
        title: "Unable to update appeal",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        data-testid="loading-auth"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Loading account...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center px-4"
        data-testid="not-authenticated"
      >
        <div className="max-w-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted border border-border/50 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="h-6 w-6 text-muted-foreground/60" />
          </div>

          <h1 className="text-xl font-semibold">
            Authentication required
          </h1>

          <p className="text-sm text-muted-foreground mt-2">
            You must be logged in to view and manage your appeals.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background"
      data-testid="appeals-page"
    >
      {/* Header */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-48 right-1/4 w-[32rem] h-[24rem] rounded-full bg-primary/[0.07] blur-[130px]" />
          <div className="absolute -bottom-56 -left-32 w-[28rem] h-[28rem] rounded-full bg-primary/[0.04] blur-[130px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl border border-primary/15 bg-primary/[0.07] text-primary flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                Account & Moderation
              </p>

              <h1
                className="text-3xl sm:text-4xl font-semibold tracking-tight mt-2"
                data-testid="text-page-title"
              >
                Appeals
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                Review active moderation actions, submit appeals, and track
                the status of your submissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Active bans */}
        <section data-testid="section-active-bans">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
                Account status
              </p>

              <h2 className="text-xl font-semibold mt-1 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                Active bans
              </h2>

              <p className="text-sm text-muted-foreground mt-1">
                Current moderation actions associated with your account.
              </p>
            </div>

            {activeBans.length > 0 && (
              <Badge variant="destructive">
                {activeBans.length} active
              </Badge>
            )}
          </div>

          {bansLoading ? (
            <Card className="border-border/50">
              <CardContent className="py-12 flex justify-center">
                <Loader2
                  className="h-5 w-5 animate-spin text-muted-foreground"
                  data-testid="loading-bans"
                />
              </CardContent>
            </Card>
          ) : activeBans.length === 0 ? (
            <Card
              className="border-dashed border-border/60 bg-card/20"
              data-testid="no-bans-message"
            >
              <CardContent className="py-10 text-center">
                <div className="w-11 h-11 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-5 h-5 text-muted-foreground/50" />
                </div>

                <p className="text-sm font-medium">
                  No active bans
                </p>

                <p className="text-xs text-muted-foreground mt-1">
                  There are currently no active moderation actions on your
                  account.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {activeBans.map((ban) => (
                <Card
                  key={ban.id}
                  className="border-border/50 bg-card/40 overflow-hidden"
                  data-testid={`card-ban-${ban.id}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/15 text-destructive flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <p
                              className="font-medium text-foreground"
                              data-testid={`text-ban-reason-${ban.id}`}
                            >
                              {ban.reason}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                              <span
                                className="text-xs text-muted-foreground"
                                data-testid={`text-ban-date-${ban.id}`}
                              >
                                Issued {formatDate(ban.createdAt)}
                              </span>
                            </div>
                          </div>

                          <Badge
                            variant={
                              ban.isPermanent
                                ? "destructive"
                                : "secondary"
                            }
                            data-testid={`badge-ban-type-${ban.id}`}
                          >
                            {ban.isPermanent
                              ? "Permanent"
                              : "Temporary"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Submit appeal */}
        {activeBans.length > 0 && (
          <section data-testid="section-submit-appeal">
            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
                Dispute a moderation action
              </p>

              <h2 className="text-xl font-semibold mt-1 flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Submit an appeal
              </h2>

              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Provide the relevant context for your appeal. Appeals are
                reviewed by authorized RIVET staff.
              </p>
            </div>

            <Card className="border-border/50 bg-card/40">
              <CardContent className="p-5 sm:p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Ban
                  </label>

                  <Select
                    value={selectedBanId}
                    onValueChange={setSelectedBanId}
                    data-testid="select-ban"
                  >
                    <SelectTrigger
                      className="bg-background/50"
                      data-testid="select-ban-trigger"
                    >
                      <SelectValue placeholder="Select a ban to appeal" />
                    </SelectTrigger>

                    <SelectContent>
                      {activeBans.map((ban) => (
                        <SelectItem
                          key={ban.id}
                          value={ban.id}
                          data-testid={`select-ban-option-${ban.id}`}
                        >
                          {ban.reason} — {formatDate(ban.createdAt)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Reason for appeal
                  </label>

                  <Textarea
                    value={appealReason}
                    onChange={(e) =>
                      setAppealReason(e.target.value)
                    }
                    placeholder="Explain why you believe this moderation action should be reviewed..."
                    className="min-h-[140px] resize-y bg-background/50 border-border/60"
                    data-testid="textarea-appeal-reason"
                  />

                  <p className="text-[11px] text-muted-foreground">
                    Include relevant context and information that may help
                    staff assess the appeal.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => submitAppeal.mutate()}
                    disabled={
                      !selectedBanId ||
                      !appealReason.trim() ||
                      submitAppeal.isPending
                    }
                    data-testid="button-submit-appeal"
                  >
                    {submitAppeal.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Submit appeal
                    {!submitAppeal.isPending && (
                      <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* User appeals */}
        <section data-testid="section-your-appeals">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
                Submission history
              </p>

              <h2 className="text-xl font-semibold mt-1 flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Your appeals
              </h2>

              <p className="text-sm text-muted-foreground mt-1">
                Track appeals you have previously submitted.
              </p>
            </div>

            {myAppeals.length > 0 && (
              <Badge variant="outline">
                {myAppeals.length}{" "}
                {myAppeals.length === 1 ? "appeal" : "appeals"}
              </Badge>
            )}
          </div>

          {appealsLoading ? (
            <Card className="border-border/50">
              <CardContent className="py-12 flex justify-center">
                <Loader2
                  className="h-5 w-5 animate-spin text-muted-foreground"
                  data-testid="loading-appeals"
                />
              </CardContent>
            </Card>
          ) : myAppeals.length === 0 ? (
            <Card
              className="border-dashed border-border/60 bg-card/20"
              data-testid="no-appeals-message"
            >
              <CardContent className="py-10 text-center">
                <div className="w-11 h-11 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-5 h-5 text-muted-foreground/50" />
                </div>

                <p className="text-sm font-medium">
                  No appeals submitted
                </p>

                <p className="text-xs text-muted-foreground mt-1">
                  Your submitted appeals will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myAppeals.map((appeal) => {
                const StatusIcon = getAppealStatusIcon(
                  appeal.status,
                );

                return (
                  <Card
                    key={appeal.id}
                    className="border-border/50 bg-card/40"
                    data-testid={`card-appeal-${appeal.id}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center shrink-0">
                          <StatusIcon className="w-4 h-4 text-muted-foreground" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                              <p
                                className="text-sm font-medium text-foreground"
                                data-testid={`text-appeal-reason-${appeal.id}`}
                              >
                                {appeal.reason}
                              </p>

                              <p
                                className="text-xs text-muted-foreground mt-1"
                                data-testid={`text-appeal-date-${appeal.id}`}
                              >
                                Submitted{" "}
                                {formatDate(appeal.createdAt)}
                              </p>
                            </div>

                            <Badge
                              variant={getStatusVariant(
                                appeal.status,
                              )}
                              data-testid={`badge-appeal-status-${appeal.id}`}
                            >
                              {formatStatus(appeal.status)}
                            </Badge>
                          </div>

                          {appeal.reviewNotes && (
                            <div
                              className="mt-4 rounded-xl border border-border/50 bg-muted/20 px-4 py-3"
                              data-testid={`text-appeal-review-notes-${appeal.id}`}
                            >
                              <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-muted-foreground mb-1">
                                Review notes
                              </p>

                              <p className="text-sm text-foreground/80 leading-relaxed">
                                {appeal.reviewNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Staff queue */}
        {isStaff && (
          <section
            data-testid="section-appeals-queue"
            className="pt-4 border-t border-border/40"
          >
            <div className="flex items-end justify-between gap-4 mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
                  Staff workspace
                </p>

                <h2 className="text-xl font-semibold mt-1 flex items-center gap-2">
                  <Gavel className="h-4 w-4 text-muted-foreground" />
                  Appeals queue
                </h2>

                <p className="text-sm text-muted-foreground mt-1">
                  Review and process submitted member appeals.
                </p>
              </div>

              {allAppeals.filter(
                (appeal) => appeal.status === "pending",
              ).length > 0 && (
                <Badge variant="secondary">
                  {
                    allAppeals.filter(
                      (appeal) => appeal.status === "pending",
                    ).length
                  }{" "}
                  pending
                </Badge>
              )}
            </div>

            {queueLoading ? (
              <Card className="border-border/50">
                <CardContent className="py-12 flex justify-center">
                  <Loader2
                    className="h-5 w-5 animate-spin text-muted-foreground"
                    data-testid="loading-queue"
                  />
                </CardContent>
              </Card>
            ) : allAppeals.length === 0 ? (
              <Card
                className="border-dashed border-border/60 bg-card/20"
                data-testid="no-queue-message"
              >
                <CardContent className="py-10 text-center">
                  <div className="w-11 h-11 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-center mx-auto mb-4">
                    <Gavel className="w-5 h-5 text-muted-foreground/50" />
                  </div>

                  <p className="text-sm font-medium">
                    No appeals in the queue
                  </p>

                  <p className="text-xs text-muted-foreground mt-1">
                    There are currently no appeals awaiting review.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {allAppeals.map((appeal) => {
                  const isPending = appeal.status === "pending";

                  return (
                    <Card
                      key={appeal.id}
                      className="border-border/50 bg-card/40 overflow-hidden"
                      data-testid={`card-queue-appeal-${appeal.id}`}
                    >
                      <CardHeader className="pb-3 border-b border-border/40">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
                              Appeal
                            </p>

                            <CardTitle
                              className="text-base mt-1"
                              data-testid={`text-queue-user-${appeal.id}`}
                            >
                              {(appeal as any).user?.username ||
                                appeal.userId}
                            </CardTitle>

                            <p
                              className="text-xs text-muted-foreground mt-1"
                              data-testid={`text-queue-date-${appeal.id}`}
                            >
                              Submitted{" "}
                              {formatDate(appeal.createdAt)}
                            </p>
                          </div>

                          <Badge
                            variant={getStatusVariant(
                              appeal.status,
                            )}
                            data-testid={`badge-queue-status-${appeal.id}`}
                          >
                            {formatStatus(appeal.status)}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="p-5 space-y-5">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-muted-foreground mb-2">
                            Appeal reason
                          </p>

                          <p
                            className="text-sm text-foreground/85 leading-relaxed"
                            data-testid={`text-queue-reason-${appeal.id}`}
                          >
                            {appeal.reason}
                          </p>
                        </div>

                        {appeal.reviewNotes && !isPending && (
                          <div className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3">
                            <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-muted-foreground mb-1">
                              Review notes
                            </p>

                            <p className="text-sm text-foreground/80 leading-relaxed">
                              {appeal.reviewNotes}
                            </p>
                          </div>
                        )}

                        {isPending && (
                          <div className="pt-4 border-t border-border/40 space-y-4">
                            <div className="space-y-2">
                              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                Review notes
                              </label>

                              <Textarea
                                value={
                                  reviewNotes[appeal.id] || ""
                                }
                                onChange={(e) =>
                                  setReviewNotes((prev) => ({
                                    ...prev,
                                    [appeal.id]:
                                      e.target.value,
                                  }))
                                }
                                placeholder="Add notes for the appeal decision (optional)..."
                                className="min-h-[90px] resize-y bg-background/50 border-border/60"
                                data-testid={`textarea-review-notes-${appeal.id}`}
                              />
                            </div>

                            <div className="flex items-center justify-end gap-2 flex-wrap">
                              <Button
                                onClick={() =>
                                  reviewAppeal.mutate({
                                    id: appeal.id,
                                    status: "approved",
                                  })
                                }
                                disabled={
                                  reviewAppeal.isPending
                                }
                                data-testid={`button-approve-${appeal.id}`}
                              >
                                {reviewAppeal.isPending && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}

                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                Approve appeal
                              </Button>

                              <Button
                                variant="destructive"
                                onClick={() =>
                                  reviewAppeal.mutate({
                                    id: appeal.id,
                                    status: "denied",
                                  })
                                }
                                disabled={
                                  reviewAppeal.isPending
                                }
                                data-testid={`button-deny-${appeal.id}`}
                              >
                                {reviewAppeal.isPending && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}

                                <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                Deny appeal
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}