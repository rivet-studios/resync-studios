import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Filter,
  Inbox,
  Loader2,
  MessageSquare,
  Search,
  Send,
  ShieldAlert,
  UserRound,
  Users,
  X,
} from "lucide-react";

type Person = {
  id: string;
  username: string | null;
  email: string | null;
  userRank?: string | null;
};

type Message = {
  id: string;
  body: string;
  isInternal: boolean | null;
  createdAt: string | null;
  author: Person | null;
};

type Ticket = {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  requester?: Person | null;
  assignee?: Person | null;
  messages?: Message[];
};

const statuses = [
  "all",
  "open",
  "in_progress",
  "awaiting_user",
  "resolved",
  "closed",
];

const priorities = ["all", "low", "normal", "high", "urgent"];

const staffRanks = new Set([
  "Appeals Moderator",
  "Community Moderator",
  "Community Administrator",
  "Community Senior Administrator",
  "Gameplay Engineer",
  "Creative Designer",
  "Team Member",
  "Staff Department Director",
  "Operations Manager",
  "Company Director",
]);

function isStaff(user: any) {
  return (
    !!user &&
    (user.isAdmin ||
      user.isModerator ||
      staffRanks.has(user.userRank) ||
      (user.additionalRanks || []).some((rank: string) =>
        staffRanks.has(rank),
      ))
  );
}

function dateLabel(date: string | null | undefined) {
  return date
    ? new Date(date).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";
}

function nameOf(person?: Person | null) {
  return person?.username || person?.email || "Unknown user";
}

function statusName(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function priorityName(priority: string) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function statusTone(status: string) {
  if (status === "closed" || status === "resolved") {
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  }

  if (status === "open") {
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  }

  return "bg-amber-500/10 text-amber-500 border-amber-500/20";
}

function priorityTone(priority: string) {
  if (priority === "urgent") {
    return "bg-red-500/10 text-red-500 border-red-500/20";
  }

  if (priority === "high") {
    return "bg-orange-500/10 text-orange-500 border-orange-500/20";
  }

  if (priority === "low") {
    return "bg-muted text-muted-foreground border-border";
  }

  return "bg-blue-500/10 text-blue-500 border-blue-500/20";
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-semibold ${statusTone(status)}`}
    >
      {statusName(status)}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-semibold ${priorityTone(priority)}`}
    >
      {priorityName(priority)}
    </Badge>
  );
}

function TicketRow({
  ticket,
  selected,
  onClick,
}: {
  ticket: Ticket;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full border-b border-border/40 px-4 py-4 text-left transition-colors last:border-b-0 ${
        selected
          ? "bg-primary/[0.07]"
          : "hover:bg-muted/30"
      }`}
      data-testid={`team-ticket-row-${ticket.id}`}
    >
      {selected && (
        <span className="absolute inset-y-0 left-0 w-0.5 bg-primary" />
      )}

      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
            selected
              ? "border-primary/20 bg-primary/10 text-primary"
              : "border-border/60 bg-muted/30 text-muted-foreground"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 truncate text-sm font-medium">
              {ticket.subject}
            </p>

            <ChevronRight
              className={`mt-0.5 h-3.5 w-3.5 shrink-0 transition-transform ${
                selected
                  ? "text-primary"
                  : "text-muted-foreground/30 group-hover:translate-x-0.5 group-hover:text-muted-foreground"
              }`}
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span className="min-w-0 truncate">
              {ticket.requester?.username || ticket.ticketNumber}
            </span>

            <span className="shrink-0">
              {dateLabel(ticket.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function SupportTeam() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);
  const [assignedToId, setAssignedToId] = useState("unassigned");

  const permitted = isStaff(user);

  const queryParams = new URLSearchParams({
    status,
    priority,
  });

  if (search.trim()) {
    queryParams.set("search", search.trim());
  }

  const queueQueryKey = `/api/support/team/tickets?${queryParams.toString()}`;

  const { data: tickets = [], isLoading: queueLoading } = useQuery<Ticket[]>({
    queryKey: [queueQueryKey],
    enabled: permitted,
  });

  const { data: members = [] } = useQuery<Person[]>({
    queryKey: ["/api/support/team/members"],
    enabled: permitted,
  });

  const { data: selectedTicket, isLoading: detailLoading } =
    useQuery<Ticket>({
      queryKey: [`/api/support/tickets/${selectedId}`],
      enabled: permitted && !!selectedId,
    });

  useEffect(() => {
    if (!selectedId && tickets.length) {
      setSelectedId(tickets[0].id);
    }
  }, [tickets, selectedId]);

  useEffect(() => {
    if (selectedTicket) {
      setAssignedToId(selectedTicket.assignee?.id || "unassigned");
    }
  }, [selectedTicket]);

  const updateTicket = useMutation({
    mutationFn: async (updates: Record<string, unknown>) =>
      apiRequest(
        "PATCH",
        `/api/support/tickets/${selectedId}`,
        updates,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/support/tickets/${selectedId}`],
      });

      queryClient.invalidateQueries({
        queryKey: [queueQueryKey],
      });

      toast({
        title: "Ticket updated",
      });
    },

    onError: (error: Error) => {
      toast({
        title: "Could not update ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendMessage = useMutation({
    mutationFn: async () =>
      apiRequest(
        "POST",
        `/api/support/tickets/${selectedId}/messages`,
        {
          body: reply,
          isInternal: internal,
        },
      ),

    onSuccess: () => {
      setReply("");
      setInternal(false);

      queryClient.invalidateQueries({
        queryKey: [`/api/support/tickets/${selectedId}`],
      });

      queryClient.invalidateQueries({
        queryKey: [queueQueryKey],
      });
    },

    onError: (error: Error) => {
      toast({
        title: "Could not send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!permitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive">
          <ShieldAlert className="h-6 w-6" />
        </div>

        <h1 className="mt-5 text-2xl font-bold tracking-tight">
          Team access required
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This portal is restricted to authorized support team members.
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-transparent text-foreground"
      data-testid="support-team-page"
    >
      <div className="mx-auto max-w-[1600px] px-4 py-8 md:px-6 md:py-10">
        {/* Page header */}
        <header className="mb-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="gap-1.5 border-primary/20 bg-primary/5 text-primary"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Team workspace
                </Badge>

                <span className="text-xs text-muted-foreground">
                  Support Operations
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Support queue
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Triage incoming requests, coordinate support activity, and
                respond to RIVET community members.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3.5 py-2.5">
              <Inbox className="h-4 w-4 text-muted-foreground" />

              <div>
                <p className="text-xs font-medium">
                  {tickets.length} visible ticket
                  {tickets.length === 1 ? "" : "s"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Current queue
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <Card className="mb-5 border-border/60 bg-card/60 shadow-sm">
          <CardContent className="p-3">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by ticket number or subject"
                  className="h-10 border-border/60 bg-background/40 pl-9 pr-9"
                  data-testid="input-team-ticket-search"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-10 w-full border-border/60 bg-background/40 sm:w-[175px]">
                    <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {statuses.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item === "all"
                          ? "All statuses"
                          : statusName(item)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-10 w-full border-border/60 bg-background/40 sm:w-[155px]">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {priorities.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item === "all"
                          ? "All priorities"
                          : priorityName(item)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workspace */}
        <div className="grid min-h-[720px] gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
          {/* Queue */}
          <Card className="flex min-h-0 flex-col overflow-hidden border-border/60 bg-card/60 shadow-sm">
            <CardHeader className="border-b border-border/50 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">
                    Incoming tickets
                  </CardTitle>
                  <CardDescription className="mt-1 text-xs">
                    Newest activity appears first.
                  </CardDescription>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-muted/20">
                  <Inbox className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
              {queueLoading ? (
                <div className="flex h-full min-h-[500px] items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Loading queue...
                    </span>
                  </div>
                </div>
              ) : tickets.length === 0 ? (
                <div className="flex min-h-[500px] flex-col items-center justify-center px-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold">
                    Nothing matches these filters
                  </h3>

                  <p className="mt-1.5 max-w-xs text-xs leading-5 text-muted-foreground">
                    Try changing the status, priority, or search criteria.
                  </p>
                </div>
              ) : (
                <div className="h-full max-h-[720px] overflow-y-auto">
                  {tickets.map((ticket) => (
                    <TicketRow
                      key={ticket.id}
                      ticket={ticket}
                      selected={selectedId === ticket.id}
                      onClick={() => setSelectedId(ticket.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ticket detail */}
          <Card className="flex min-h-0 flex-col overflow-hidden border-border/60 bg-card/60 shadow-sm">
            {!selectedId ? (
              <div className="flex min-h-[650px] flex-col items-center justify-center px-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-muted/20">
                  <MessageSquare className="h-6 w-6 text-muted-foreground/50" />
                </div>

                <h2 className="mt-5 text-base font-semibold">
                  Select a ticket
                </h2>

                <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
                  Choose a ticket from the queue to review its details and
                  begin working on it.
                </p>
              </div>
            ) : detailLoading || !selectedTicket ? (
              <div className="flex min-h-[650px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Loading ticket...
                  </span>
                </div>
              </div>
            ) : (
              <>
                {/* Ticket header */}
                <CardHeader className="border-b border-border/50 px-5 py-5 md:px-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            {selectedTicket.ticketNumber}
                          </span>

                          <span className="text-muted-foreground/40">
                            /
                          </span>

                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {selectedTicket.category}
                          </span>
                        </div>

                        <CardTitle className="text-xl leading-tight md:text-2xl">
                          {selectedTicket.subject}
                        </CardTitle>

                        <CardDescription className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                          <span>
                            From {nameOf(selectedTicket.requester)}
                          </span>
                          <span className="text-muted-foreground/40">
                            •
                          </span>
                          <span>
                            Opened{" "}
                            {dateLabel(selectedTicket.createdAt)}
                          </span>
                        </CardDescription>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <StatusBadge status={selectedTicket.status} />
                        <PriorityBadge
                          priority={selectedTicket.priority}
                        />
                      </div>
                    </div>

                    {/* Ticket controls */}
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div>
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Status
                        </p>

                        <Select
                          value={selectedTicket.status}
                          onValueChange={(value) =>
                            updateTicket.mutate({ status: value })
                          }
                        >
                          <SelectTrigger className="h-9 border-border/60 bg-background/30 text-xs">
                            <SelectValue />
                          </SelectTrigger>

                          <SelectContent>
                            {statuses.slice(1).map((item) => (
                              <SelectItem key={item} value={item}>
                                {statusName(item)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Priority
                        </p>

                        <Select
                          value={selectedTicket.priority}
                          onValueChange={(value) =>
                            updateTicket.mutate({ priority: value })
                          }
                        >
                          <SelectTrigger className="h-9 border-border/60 bg-background/30 text-xs">
                            <SelectValue />
                          </SelectTrigger>

                          <SelectContent>
                            {priorities.slice(1).map((item) => (
                              <SelectItem key={item} value={item}>
                                {priorityName(item)} priority
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Assigned to
                        </p>

                        <Select
                          value={assignedToId}
                          onValueChange={(value) => {
                            setAssignedToId(value);

                            updateTicket.mutate({
                              assignedToId:
                                value === "unassigned" ? null : value,
                            });
                          }}
                        >
                          <SelectTrigger className="h-9 border-border/60 bg-background/30 text-xs">
                            <UserRound className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                            <SelectValue placeholder="Assign ticket" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="unassigned">
                              Unassigned
                            </SelectItem>

                            {members.map((member) => (
                              <SelectItem
                                key={member.id}
                                value={member.id}
                              >
                                {nameOf(member)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {/* Conversation */}
                <CardContent className="flex min-h-0 flex-1 flex-col p-0">
                  <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-6">
                    {/* Original ticket description */}
                    <div className="mb-6 rounded-xl border border-border/50 bg-muted/[0.12] p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted/40">
                          <MessageSquare className="h-3 w-3 text-muted-foreground" />
                        </div>

                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Original request
                        </span>
                      </div>

                      <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                        {selectedTicket.description}
                      </p>
                    </div>

                    <div className="mb-4 flex items-center gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Conversation
                      </span>
                      <div className="h-px flex-1 bg-border/50" />
                    </div>

                    <div className="space-y-4">
                      {(selectedTicket.messages || []).map((message) => {
                        const isMine = message.author?.id === user?.id;
                        const isInternal = !!message.isInternal;

                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isMine && !isInternal
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                                isInternal
                                  ? "border border-amber-500/20 bg-amber-500/[0.07]"
                                  : isMine
                                    ? "bg-primary text-primary-foreground"
                                    : "border border-border/50 bg-muted/40"
                              }`}
                            >
                              <div
                                className={`mb-1.5 flex flex-wrap items-center gap-2 text-[10px] ${
                                  isMine && !isInternal
                                    ? "text-primary-foreground/65"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {isInternal ? (
                                  <span className="font-semibold text-amber-500">
                                    Internal note
                                  </span>
                                ) : (
                                  <span className="font-medium">
                                    {nameOf(message.author)}
                                  </span>
                                )}

                                <span className="opacity-60">
                                  {dateLabel(message.createdAt)}
                                </span>
                              </div>

                              <p className="whitespace-pre-wrap text-sm leading-6">
                                {message.body}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      {(selectedTicket.messages || []).length === 0 && (
                        <div className="py-10 text-center">
                          <MessageSquare className="mx-auto h-7 w-7 text-muted-foreground/30" />
                          <p className="mt-3 text-xs text-muted-foreground">
                            No messages have been added to this ticket yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Composer */}
                  <div className="border-t border-border/50 bg-muted/[0.06] p-4 md:p-5">
                    <div
                      className={`rounded-xl border ${
                        internal
                          ? "border-amber-500/25 bg-amber-500/[0.03]"
                          : "border-border/60 bg-background/30"
                      }`}
                    >
                      {internal && (
                        <div className="flex items-center gap-2 border-b border-amber-500/15 px-3.5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-amber-500">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Internal team note
                        </div>
                      )}

                      <Textarea
                        value={reply}
                        onChange={(event) =>
                          setReply(event.target.value)
                        }
                        placeholder={
                          internal
                            ? "Add an internal note for the team…"
                            : "Reply to the customer…"
                        }
                        className="min-h-24 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                        maxLength={10000}
                        data-testid="input-team-reply"
                      />

                      <div className="flex flex-col gap-3 border-t border-border/40 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                          <Checkbox
                            checked={internal}
                            onCheckedChange={(checked) =>
                              setInternal(checked === true)
                            }
                          />

                          <span>
                            Internal note
                            <span className="ml-1 text-muted-foreground/60">
                              (customer will not see this)
                            </span>
                          </span>
                        </label>

                        <Button
                          onClick={() => sendMessage.mutate()}
                          disabled={
                            sendMessage.isPending || !reply.trim()
                          }
                          className="h-9 px-4 text-xs font-semibold"
                        >
                          {sendMessage.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-3.5 w-3.5" />
                              {internal ? "Add note" : "Send reply"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>

        {/* Footer guidance */}
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-border/50 bg-card/40 px-4 py-3.5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Clock3 className="h-3.5 w-3.5 shrink-0" />
            <span>
              Use internal notes for team handoffs. Customer-facing replies
              change the ticket to Awaiting user.
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{members.length} team members</span>
            <ArrowUpRight className="ml-1 h-3 w-3 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}