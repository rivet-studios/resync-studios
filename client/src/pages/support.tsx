import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle, CheckCircle2, Clock3, HelpCircle, Inbox, Loader2,
  MessageSquare, Plus, Send, ShieldCheck, Ticket, X,
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

const categories = ["General", "Account", "Billing", "Technical", "Moderation", "Partnership"];
const priorities = ["low", "normal", "high", "urgent"];

function formatDate(date: string | null | undefined) {
  return date
    ? new Date(date).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : "—";
}

function statusLabel(status: string) {
  return status.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(status: string) {
  if (status === "closed" || status === "resolved") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (status === "urgent" || status === "open") return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  return "bg-amber-500/15 text-amber-400 border-amber-500/30";
}

function displayName(person?: SupportPerson | null) {
  return person?.username || person?.email || "Support member";
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

  const { data: tickets = [], isLoading: ticketsLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support/tickets/my"],
    enabled: !!user,
  });
  const { data: selectedTicket, isLoading: detailLoading } = useQuery<SupportTicket>({
    queryKey: [`/api/support/tickets/${selectedId}`],
    enabled: !!selectedId,
  });

  useEffect(() => {
    if (!selectedId && tickets.length > 0) setSelectedId(tickets[0].id);
  }, [tickets, selectedId]);

  const createTicket = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/support/tickets", {
        subject, description, category, priority,
      });
      return response.json() as Promise<SupportTicket>;
    },
    onSuccess: (ticket) => {
      toast({ title: "Ticket submitted", description: `${ticket.ticketNumber} is now in the support queue.` });
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets/my"] });
      setSelectedId(ticket.id);
      setShowComposer(false);
      setSubject("");
      setDescription("");
      setCategory("General");
      setPriority("normal");
    },
    onError: (error: Error) => toast({ title: "Could not submit ticket", description: error.message, variant: "destructive" }),
  });

  const sendReply = useMutation({
    mutationFn: async () => apiRequest("POST", `/api/support/tickets/${selectedId}/messages`, { body: reply }),
    onSuccess: () => {
      setReply("");
      queryClient.invalidateQueries({ queryKey: [`/api/support/tickets/${selectedId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets/my"] });
    },
    onError: (error: Error) => toast({ title: "Could not send reply", description: error.message, variant: "destructive" }),
  });

  const updateStatus = useMutation({
    mutationFn: async (status: "open" | "closed") =>
      apiRequest("PATCH", `/api/support/tickets/${selectedId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/support/tickets/${selectedId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets/my"] });
    },
    onError: (error: Error) => toast({ title: "Could not update ticket", description: error.message, variant: "destructive" }),
  });

  if (authLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
        <HelpCircle className="h-12 w-12 mx-auto text-primary" />
        <h1 className="text-3xl font-bold">Support is here to help</h1>
        <p className="text-muted-foreground">Sign in to create a ticket and view conversations with the RIVET Studios team.</p>
        <Button asChild><Link href="/login">Sign in to continue</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8" data-testid="support-page">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <Badge variant="outline" className="gap-2"><HelpCircle className="h-3.5 w-3.5" /> Help Center</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">How can we help?</h1>
          <p className="text-muted-foreground">Create a ticket or continue an existing conversation with our team.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowComposer(true)} data-testid="button-new-ticket"><Plus className="h-4 w-4 mr-2" /> New ticket</Button>
          <Button variant="outline" asChild><Link href="/knowledge-base">Browse FAQs</Link></Button>
        </div>
      </div>

      {showComposer && (
        <Card className="border-primary/30" data-testid="ticket-composer">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div><CardTitle>Open a support ticket</CardTitle><CardDescription>Include enough detail for the team to investigate quickly.</CardDescription></div>
            <Button variant="ghost" size="icon" onClick={() => setShowComposer(false)} aria-label="Close ticket form"><X className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="What do you need help with?" maxLength={200} data-testid="input-ticket-subject" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger><SelectContent>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
              <Select value={priority} onValueChange={setPriority}><SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger><SelectContent>{priorities.map((item) => <SelectItem key={item} value={item}>{item[0].toUpperCase() + item.slice(1)} priority</SelectItem>)}</SelectContent></Select>
            </div>
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the issue, what you expected, and any helpful context." className="min-h-32" maxLength={10000} data-testid="input-ticket-description" />
            <div className="flex justify-end"><Button onClick={() => createTicket.mutate()} disabled={createTicket.isPending || subject.trim().length < 5 || description.trim().length < 10} data-testid="button-submit-ticket">{createTicket.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />} Submit ticket</Button></div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-[360px_1fr] gap-5 min-h-[560px]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/50"><CardTitle className="flex items-center gap-2 text-base"><Inbox className="h-4 w-4" /> Your tickets <Badge variant="secondary" className="ml-auto">{tickets.length}</Badge></CardTitle></CardHeader>
          <CardContent className="p-0">
            {ticketsLoading ? <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : tickets.length === 0 ? (
              <div className="p-8 text-center space-y-3"><Ticket className="h-8 w-8 mx-auto text-muted-foreground" /><p className="font-medium">No tickets yet</p><p className="text-sm text-muted-foreground">When you need us, start a new conversation.</p></div>
            ) : (
              <div className="divide-y divide-border/50">{tickets.map((ticket) => (
                <button key={ticket.id} onClick={() => setSelectedId(ticket.id)} className={`w-full text-left p-4 space-y-2 transition-colors hover:bg-muted/40 ${selectedId === ticket.id ? "bg-primary/10 border-l-2 border-primary" : ""}`} data-testid={`ticket-row-${ticket.id}`}>
                  <div className="flex items-start gap-2"><span className="font-medium truncate flex-1">{ticket.subject}</span><Badge variant="outline" className={`text-[10px] shrink-0 ${statusClass(ticket.status)}`}>{statusLabel(ticket.status)}</Badge></div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{ticket.ticketNumber}</span><span>{formatDate(ticket.updatedAt)}</span></div>
                </button>
              ))}</div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          {!selectedId ? <div className="h-full min-h-[560px] flex flex-col items-center justify-center text-center p-8"><MessageSquare className="h-10 w-10 text-muted-foreground mb-3" /><p className="font-medium">Select a ticket to view the conversation</p></div> : detailLoading || !selectedTicket ? <div className="h-full min-h-[560px] flex items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div> : (
            <>
              <CardHeader className="border-b border-border/50 space-y-3">
                <div className="flex items-start gap-3"><div className="flex-1"><p className="text-xs text-muted-foreground">{selectedTicket.ticketNumber} · {selectedTicket.category}</p><CardTitle className="text-xl mt-1">{selectedTicket.subject}</CardTitle></div><Badge variant="outline" className={statusClass(selectedTicket.status)}>{statusLabel(selectedTicket.status)}</Badge></div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> Opened {formatDate(selectedTicket.createdAt)}</span><span className="capitalize">{selectedTicket.priority} priority</span>{selectedTicket.assignee && <span>Assigned to {displayName(selectedTicket.assignee)}</span>}</div>
              </CardHeader>
              <CardContent className="p-0 flex flex-col min-h-[465px]">
                <div className="flex-1 p-5 space-y-4 max-h-[460px] overflow-y-auto">
                  {(selectedTicket.messages || []).map((message) => <div key={message.id} className={`flex gap-3 ${message.author?.id === user.id ? "justify-end" : ""}`}><div className={`max-w-[85%] rounded-xl px-4 py-3 ${message.author?.id === user.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}><div className="flex items-center gap-2 text-xs opacity-70 mb-1"><span>{message.author?.id === user.id ? "You" : displayName(message.author)}</span><span>{formatDate(message.createdAt)}</span></div><p className="whitespace-pre-wrap text-sm">{message.body}</p></div></div>)}
                </div>
                <div className="border-t border-border/50 p-4 space-y-3">
                  <Textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder={selectedTicket.status === "closed" ? "Reply to reopen this ticket…" : "Write a reply…"} className="min-h-20" maxLength={10000} data-testid="input-ticket-reply" />
                  <div className="flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground">Never share passwords or full payment details.</p><div className="flex gap-2">{selectedTicket.status !== "closed" ? <Button variant="outline" size="sm" onClick={() => updateStatus.mutate("closed")} disabled={updateStatus.isPending}><CheckCircle2 className="h-4 w-4 mr-1.5" /> Close ticket</Button> : <Button variant="outline" size="sm" onClick={() => updateStatus.mutate("open")} disabled={updateStatus.isPending}>Reopen</Button>}<Button size="sm" onClick={() => sendReply.mutate()} disabled={sendReply.isPending || !reply.trim()}><Send className="h-4 w-4 mr-1.5" /> Send reply</Button></div></div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-primary" /> Support replies are visible only to you and authorized team members.</div>
    </div>
  );
}