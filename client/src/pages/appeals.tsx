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
import { Loader2, ShieldAlert, FileText, Gavel, AlertCircle } from "lucide-react";

const STAFF_RANKS = [
  "Appeal Analyst",
  "Appeals Moderator",
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
  "RS Trust & Safety Team",
  "Quality Assurance Team",
  "Quality Assurance Lead",
  "Moderator",
  "Administrator",
  "Senior Administrator",
];

function isStaffUser(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.isAdmin || user.isModerator) return true;
  if (user.userRank && STAFF_RANKS.includes(user.userRank)) return true;
  if (user.additionalRanks) {
    return user.additionalRanks.some((r) => r && STAFF_RANKS.includes(r));
  }
  return false;
}

function getStatusVariant(status: string | null): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "approved":
      return "default";
    case "denied":
      return "destructive";
    case "pending":
    default:
      return "secondary";
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

  const { data: myAppeals = [], isLoading: appealsLoading } = useQuery<Appeal[]>({
    queryKey: ["/api/appeals/my"],
    enabled: !!user,
  });

  const { data: allAppeals = [], isLoading: queueLoading } = useQuery<(Appeal & { user?: User })[]>({
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
      toast({ title: "Appeal submitted", description: "Your appeal has been submitted for review." });
      setSelectedBanId("");
      setAppealReason("");
      queryClient.invalidateQueries({ queryKey: ["/api/appeals/my"] });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const reviewAppeal = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/appeals/${id}`, {
        status,
        reviewNotes: reviewNotes[id] || "",
      });
    },
    onSuccess: () => {
      toast({ title: "Appeal updated", description: "The appeal has been reviewed." });
      queryClient.invalidateQueries({ queryKey: ["/api/appeals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appeals/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bans/my"] });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" data-testid="loading-auth">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4" data-testid="not-authenticated">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">You must be logged in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-8" style={{ backgroundColor: "#050505" }} data-testid="appeals-page">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white" data-testid="text-page-title">Appeals</h1>

        <section data-testid="section-active-bans">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Your Active Bans
          </h2>
          {bansLoading ? (
            <div className="flex justify-center py-8" data-testid="loading-bans">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : activeBans.length === 0 ? (
            <Card style={{ backgroundColor: "#121212", borderColor: "#1e1e1e" }} data-testid="no-bans-message">
              <CardContent className="py-6">
                <p className="text-center text-muted-foreground">You have no active bans.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeBans.map((ban) => (
                <Card key={ban.id} style={{ backgroundColor: "#121212", borderColor: "#1e1e1e" }} data-testid={`card-ban-${ban.id}`}>
                  <CardContent className="py-4 space-y-2">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-1">
                        <p className="text-white font-medium" data-testid={`text-ban-reason-${ban.id}`}>{ban.reason}</p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-ban-date-${ban.id}`}>
                          Banned on: {ban.createdAt ? new Date(ban.createdAt).toLocaleDateString() : "Unknown"}
                        </p>
                      </div>
                      <Badge variant={ban.isPermanent ? "destructive" : "secondary"} data-testid={`badge-ban-type-${ban.id}`}>
                        {ban.isPermanent ? "Permanent" : "Temporary"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {activeBans.length > 0 && (
          <section data-testid="section-submit-appeal">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Submit Appeal
            </h2>
            <Card style={{ backgroundColor: "#121212", borderColor: "#1e1e1e" }}>
              <CardContent className="py-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Select Ban</label>
                  <Select value={selectedBanId} onValueChange={setSelectedBanId} data-testid="select-ban">
                    <SelectTrigger data-testid="select-ban-trigger">
                      <SelectValue placeholder="Select a ban to appeal" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeBans.map((ban) => (
                        <SelectItem key={ban.id} value={ban.id} data-testid={`select-ban-option-${ban.id}`}>
                          {ban.reason} ({ban.createdAt ? new Date(ban.createdAt).toLocaleDateString() : "Unknown date"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Reason for Appeal</label>
                  <Textarea
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    placeholder="Explain why your ban should be lifted..."
                    className="min-h-[120px]"
                    data-testid="textarea-appeal-reason"
                  />
                </div>
                <Button
                  onClick={() => submitAppeal.mutate()}
                  disabled={!selectedBanId || !appealReason.trim() || submitAppeal.isPending}
                  data-testid="button-submit-appeal"
                >
                  {submitAppeal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Appeal
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        <section data-testid="section-your-appeals">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Appeals
          </h2>
          {appealsLoading ? (
            <div className="flex justify-center py-8" data-testid="loading-appeals">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : myAppeals.length === 0 ? (
            <Card style={{ backgroundColor: "#121212", borderColor: "#1e1e1e" }} data-testid="no-appeals-message">
              <CardContent className="py-6">
                <p className="text-center text-muted-foreground">You haven't submitted any appeals.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myAppeals.map((appeal) => (
                <Card key={appeal.id} style={{ backgroundColor: "#121212", borderColor: "#1e1e1e" }} data-testid={`card-appeal-${appeal.id}`}>
                  <CardContent className="py-4 space-y-2">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-1">
                        <p className="text-white" data-testid={`text-appeal-reason-${appeal.id}`}>{appeal.reason}</p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-appeal-date-${appeal.id}`}>
                          Submitted: {appeal.createdAt ? new Date(appeal.createdAt).toLocaleDateString() : "Unknown"}
                        </p>
                        {appeal.reviewNotes && (
                          <p className="text-sm text-muted-foreground" data-testid={`text-appeal-review-notes-${appeal.id}`}>
                            Review Notes: {appeal.reviewNotes}
                          </p>
                        )}
                      </div>
                      <Badge variant={getStatusVariant(appeal.status)} data-testid={`badge-appeal-status-${appeal.id}`}>
                        {appeal.status || "pending"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {isStaff && (
          <section data-testid="section-appeals-queue">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              Appeals Queue
            </h2>
            {queueLoading ? (
              <div className="flex justify-center py-8" data-testid="loading-queue">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : allAppeals.length === 0 ? (
              <Card style={{ backgroundColor: "#121212", borderColor: "#1e1e1e" }} data-testid="no-queue-message">
                <CardContent className="py-6">
                  <p className="text-center text-muted-foreground">No pending appeals.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {allAppeals.map((appeal) => (
                  <Card key={appeal.id} style={{ backgroundColor: "#121212", borderColor: "#1e1e1e" }} data-testid={`card-queue-appeal-${appeal.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <CardTitle className="text-base text-white" data-testid={`text-queue-user-${appeal.id}`}>
                          User: {(appeal as any).user?.username || appeal.userId}
                        </CardTitle>
                        <Badge variant={getStatusVariant(appeal.status)} data-testid={`badge-queue-status-${appeal.id}`}>
                          {appeal.status || "pending"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-white text-sm" data-testid={`text-queue-reason-${appeal.id}`}>{appeal.reason}</p>
                      <p className="text-xs text-muted-foreground" data-testid={`text-queue-date-${appeal.id}`}>
                        Submitted: {appeal.createdAt ? new Date(appeal.createdAt).toLocaleDateString() : "Unknown"}
                      </p>
                      {appeal.status === "pending" && (
                        <div className="space-y-3 pt-2 border-t border-white/10">
                          <Textarea
                            value={reviewNotes[appeal.id] || ""}
                            onChange={(e) =>
                              setReviewNotes((prev) => ({ ...prev, [appeal.id]: e.target.value }))
                            }
                            placeholder="Review notes (optional)..."
                            className="min-h-[80px]"
                            data-testid={`textarea-review-notes-${appeal.id}`}
                          />
                          <div className="flex items-center gap-3 flex-wrap">
                            <Button
                              onClick={() => reviewAppeal.mutate({ id: appeal.id, status: "approved" })}
                              disabled={reviewAppeal.isPending}
                              data-testid={`button-approve-${appeal.id}`}
                            >
                              {reviewAppeal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => reviewAppeal.mutate({ id: appeal.id, status: "denied" })}
                              disabled={reviewAppeal.isPending}
                              data-testid={`button-deny-${appeal.id}`}
                            >
                              {reviewAppeal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Deny
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
