import { useEffect, useState } from "react";
import { Link } from "wouter";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  HelpCircle,
  Inbox,
  Info,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  ShieldCheck,
  Ticket,
  X,
} from "lucide-react";

type SupportPerson = {
  id: string;
  username: string | null;
  email: string | null;
  userRank?: string | null;
};

type SupportMessage = {
  id: string;
  body: string;
  isInternal: boolean | null;
  createdAt: string | null;
  author: SupportPerson | null;
};

type SupportTicket = {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  closedAt: string | null;
  requester?: SupportPerson | null;
  assignee?: SupportPerson | null;
  messages?: SupportMessage[];
};

const categories = [
  "General",
  "Account",
  "Billing",
  "Technical",
  "Moderation",
  "Partnership",
];

const priorities = ["low", "normal", "high", "urgent"];

function formatDate(date: string | null | undefined) {
  return date
    ? new Date(date).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";
}

function statusLabel(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(status: string) {
  if (status === "closed" || status === "resolved") {
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  }

  if (status === "open") {
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  }

  return "bg-amber-500/10 text-amber-500 border-amber-500/20";
}

function priorityClass(priority: string) {
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

function displayName(person?: SupportPerson | null) {
  return person?.username || person?.email || "Support member";
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-semibold ${statusClass(status)}`}
    >
      {statusLabel(status)}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-semibold ${priorityClass(priority)}`}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
}

export default function Support() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [selectedId, setSelectedId] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [priority, setPriority] = useState("normal");
  const [reply, setReply] = useState("");

  const {
    data: tickets = [],
    isLoading: ticketsLoading,
  } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support/tickets/my"],
    enabled: !!user,
  });

  const {
    data: selectedTicket,
    isLoading: detailLoading,
  } = useQuery<SupportTicket>({
    queryKey: [`/api/support/tickets/${selectedId}`],
    enabled: !!selectedId,
  });

  useEffect(() => {
    if (!selectedId && tickets.length > 0) {
      setSelectedId(tickets[0].id);
    }
  }, [tickets, selectedId]);

  const createTicket = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST",
        "/api/support/tickets",
        {
          subject,
          description,
          category,
          priority,
        },
      );

      return response.json() as Promise<SupportTicket>;
    },

    onSuccess: (ticket) => {
      toast({
        title: "Ticket submitted",
        description: `${ticket.ticketNumber} is now in the support queue.`,
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/support/tickets/my"],
      });

      setSelectedId(ticket.id);
      setShowComposer(false);
      setSubject("");
      setDescription("");
      setCategory("General");
      setPriority("normal");
    },

    onError: (error: Error) => {
      toast({
        title: "Could not submit ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendReply = useMutation({
    mutationFn: async () =>
      apiRequest(
        "POST",
        `/api/support/tickets/${selectedId}/messages`,
        {
          body: reply,
        },
      ),

    onSuccess: () => {
      setReply("");

      queryClient.invalidateQueries({
        queryKey: [`/api/support/tickets/${selectedId}`],
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/support/tickets/my"],
      });
    },

    onError: (error: Error) => {
      toast({
        title: "Could not send reply",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (status: "open" | "closed") =>
      apiRequest(
        "PATCH",
        `/api/support/tickets/${selectedId}`,
        { status },
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/support/tickets/${selectedId}`],
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/support/tickets/my"],
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

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <HelpCircle className="h-6 w-6" />
        </div>

        <h1 className="mt-5 text-3xl font-bold tracking-tight">
          Support is here to help
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Sign in to create a ticket and view conversations with the RIVET
          Studios team.
        </p>

        <Button asChild className="mt-6">
          <Link href="/login">
            Sign in to continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-transparent text-foreground"
      data-testid="support-page"
    >
      <div className="mx-auto max-w-[1500px] px-4 py-8 md:px-6 md:py-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="gap-1.5 border-primary/20 bg-primary/5 text-primary"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  Help Center
                </Badge>

                <span className="text-xs text-muted-foreground">
                  RIVET Studios Support
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                How can we help?
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Create a support request or continue an existing conversation
                with the RIVET Studios team.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => setShowComposer(true)}
                data-testid="button-new-ticket"
              >
                <Plus className="mr-2 h-4 w-4" />
                New ticket
              </Button>

              <Button variant="outline" asChild>
                <Link href="/knowledge-base">
                  Browse FAQs
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Quick information */}
        <section className="mb-6 grid gap-3 md:grid-cols-3">
          <Card className="border-border/60 bg-card/50">
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/5 text-primary">
                <MessageSquare className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-medium">Talk to the team</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Open a ticket whenever you need direct assistance.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/50">
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground">
                <Clock3 className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-medium">Keep everything together</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Replies and updates stay attached to your ticket.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/50">
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-medium">Private support</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Your support conversations are limited to you and authorized
                  staff.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* New ticket composer */}
        {showComposer && (
          <Card
            className="mb-6 overflow-hidden border-primary/25 bg-card/70 shadow-sm"
            data-testid="ticket-composer"
          >
            <CardHeader className="border-b border-border/50 px-5 py-5 md:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Plus className="h-4 w-4" />
                    </div>

                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">
                      New request
                    </span>
                  </div>

                  <CardTitle className="text-lg">
                    Open a support ticket
                  </CardTitle>

                  <CardDescription className="mt-1">
                    Include enough detail for the team to investigate your
                    request efficiently.
                  </CardDescription>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowComposer(false)}
                  aria-label="Close ticket form"
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 p-5 md:p-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Subject
                </label>

                <Input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="What do you need help with?"
                  maxLength={200}
                  data-testid="input-ticket-subject"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Category
                  </label>

                  <Select
                    value={category}
                    onValueChange={setCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>

                    <SelectContent>
                      {categories.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Priority
                  </label>

                  <Select
                    value={priority}
                    onValueChange={setPriority}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>

                    <SelectContent>
                      {priorities.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item.charAt(0).toUpperCase() + item.slice(1)}{" "}
                          priority
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label className="text-xs font-medium text-muted-foreground">
                    Description
                  </label>

                  <span className="text-[10px] text-muted-foreground/60">
                    Be specific where possible
                  </span>
                </div>

                <Textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe the issue, what you expected, what happened, and any helpful context."
                  className="min-h-36 resize-y"
                  maxLength={10000}
                  data-testid="input-ticket-description"
                />
              </div>

              <div className="flex flex-col gap-3 rounded-lg border border-border/50 bg-muted/[0.12] p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2.5">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                  <p className="text-xs leading-5 text-muted-foreground">
                    Do not include passwords, authentication codes, or full
                    payment details in your ticket.
                  </p>
                </div>

                <Button
                  onClick={() => createTicket.mutate()}
                  disabled={
                    createTicket.isPending ||
                    subject.trim().length < 5 ||
                    description.trim().length < 10
                  }
                  data-testid="button-submit-ticket"
                  className="shrink-0"
                >
                  {createTicket.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Submit ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main support workspace */}
        <div className="grid min-h-[600px] gap-5 lg:grid-cols-[370px_minmax(0,1fr)]">
          {/* Ticket list */}
          <Card className="flex min-h-0 flex-col overflow-hidden border-border/60 bg-card/60 shadow-sm">
            <CardHeader className="border-b border-border/50 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Inbox className="h-4 w-4 text-muted-foreground" />
                    Your tickets

                    <Badge
                      variant="secondary"
                      className="ml-1 text-[10px]"
                    >
                      {tickets.length}
                    </Badge>
                  </CardTitle>

                  <CardDescription className="mt-1 text-xs">
                    Your recent support conversations.
                  </CardDescription>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowComposer(true)}
                  aria-label="Create new ticket"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
              {ticketsLoading ? (
                <div className="flex min-h-[500px] items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Loading your tickets...
                    </span>
                  </div>
                </div>
              ) : tickets.length === 0 ? (
                <div className="flex min-h-[500px] flex-col items-center justify-center px-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-muted/20">
                    <Ticket className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <p className="mt-4 text-sm font-semibold">
                    No tickets yet
                  </p>

                  <p className="mt-1.5 max-w-xs text-xs leading-5 text-muted-foreground">
                    When you need assistance, start a new conversation with
                    the RIVET support team.
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-5"
                    onClick={() => setShowComposer(true)}
                  >
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    Create a ticket
                  </Button>
                </div>
              ) : (
                <div className="h-full max-h-[700px] overflow-y-auto">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => setSelectedId(ticket.id)}
                      className={`group relative w-full border-b border-border/40 px-4 py-4 text-left transition-colors last:border-b-0 ${
                        selectedId === ticket.id
                          ? "bg-primary/[0.07]"
                          : "hover:bg-muted/30"
                      }`}
                      data-testid={`ticket-row-${ticket.id}`}
                    >
                      {selectedId === ticket.id && (
                        <span className="absolute inset-y-0 left-0 w-0.5 bg-primary" />
                      )}

                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                            selectedId === ticket.id
                              ? "border-primary/20 bg-primary/10 text-primary"
                              : "border-border/60 bg-muted/30 text-muted-foreground"
                          }`}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2">
                            <span className="min-w-0 flex-1 truncate text-sm font-medium">
                              {ticket.subject}
                            </span>

                            <ChevronRight
                              className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                                selectedId === ticket.id
                                  ? "text-primary"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <StatusBadge status={ticket.status} />
                            <PriorityBadge
                              priority={ticket.priority}
                            />
                          </div>

                          <div className="mt-2.5 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                            <span className="font-mono">
                              {ticket.ticketNumber}
                            </span>

                            <span>
                              {formatDate(ticket.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ticket detail */}
          <Card className="flex min-h-0 flex-col overflow-hidden border-border/60 bg-card/60 shadow-sm">
            {!selectedId ? (
              <div className="flex min-h-[600px] flex-col items-center justify-center px-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-muted/20">
                  <MessageSquare className="h-6 w-6 text-muted-foreground/50" />
                </div>

                <h2 className="mt-5 text-base font-semibold">
                  Select a ticket
                </h2>

                <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
                  Choose one of your tickets to view the conversation and
                  send a reply.
                </p>
              </div>
            ) : detailLoading || !selectedTicket ? (
              <div className="flex min-h-[600px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Loading conversation...
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

                        <CardTitle className="text-xl leading-tight">
                          {selectedTicket.subject}
                        </CardTitle>
                      </div>

                      <StatusBadge status={selectedTicket.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5" />
                        Opened {formatDate(selectedTicket.createdAt)}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span className="capitalize">
                          {selectedTicket.priority}
                        </span>{" "}
                        priority
                      </span>

                      {selectedTicket.assignee && (
                        <span>
                          Assigned to{" "}
                          {displayName(selectedTicket.assignee)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {/* Conversation */}
                <CardContent className="flex min-h-0 flex-1 flex-col p-0">
                  <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-6">
                    {/* Original request */}
                    <div className="mb-6 rounded-xl border border-border/50 bg-muted/[0.12] p-4">
                      <div className="mb-2.5 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted/40">
                          <Ticket className="h-3 w-3 text-muted-foreground" />
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
                      {(selectedTicket.messages || []).map(
                        (message) => {
                          const isMine =
                            message.author?.id === user.id;

                          return (
                            <div
                              key={message.id}
                              className={`flex ${
                                isMine
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                                  isMine
                                    ? "bg-primary text-primary-foreground"
                                    : "border border-border/50 bg-muted/40"
                                }`}
                              >
                                <div
                                  className={`mb-1.5 flex flex-wrap items-center gap-2 text-[10px] ${
                                    isMine
                                      ? "text-primary-foreground/65"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  <span className="font-medium">
                                    {isMine
                                      ? "You"
                                      : displayName(
                                          message.author,
                                        )}
                                  </span>

                                  <span className="opacity-60">
                                    {formatDate(message.createdAt)}
                                  </span>
                                </div>

                                <p className="whitespace-pre-wrap text-sm leading-6">
                                  {message.body}
                                </p>
                              </div>
                            </div>
                          );
                        },
                      )}

                      {(selectedTicket.messages || []).length ===
                        0 && (
                        <div className="py-10 text-center">
                          <MessageSquare className="mx-auto h-7 w-7 text-muted-foreground/30" />

                          <p className="mt-3 text-xs text-muted-foreground">
                            No replies have been added yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Composer */}
                  <div className="border-t border-border/50 bg-muted/[0.06] p-4 md:p-5">
                    <div className="rounded-xl border border-border/60 bg-background/30">
                      <Textarea
                        value={reply}
                        onChange={(event) =>
                          setReply(event.target.value)
                        }
                        placeholder={
                          selectedTicket.status === "closed"
                            ? "Reply to reopen this ticket…"
                            : "Write a reply…"
                        }
                        className="min-h-24 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                        maxLength={10000}
                        data-testid="input-ticket-reply"
                      />

                      <div className="flex flex-col gap-3 border-t border-border/40 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-2 text-[10px] leading-4 text-muted-foreground">
                          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                          <span>
                            Never share passwords, authentication codes,
                            or full payment details.
                          </span>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          {selectedTicket.status !== "closed" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateStatus.mutate("closed")
                              }
                              disabled={updateStatus.isPending}
                            >
                              {updateStatus.isPending ? (
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                              )}
                              Close ticket
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateStatus.mutate("open")
                              }
                              disabled={updateStatus.isPending}
                            >
                              {updateStatus.isPending ? (
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              ) : null}
                              Reopen
                            </Button>
                          )}

                          <Button
                            size="sm"
                            onClick={() => sendReply.mutate()}
                            disabled={
                              sendReply.isPending || !reply.trim()
                            }
                          >
                            {sendReply.isPending ? (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Send className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            Send reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-border/50 bg-card/40 px-4 py-3.5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span>
              Support conversations are visible only to you and authorized
              RIVET team members.
            </span>
          </div>

          <Link
            href="/knowledge-base"
            className="flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Need a quick answer?
            <span>Browse FAQs</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}