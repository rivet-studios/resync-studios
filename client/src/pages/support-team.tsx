import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle2, Clock3, Filter, Inbox, Loader2, MessageSquare,
  Search, Send, ShieldAlert, UserRound,
} from "lucide-react";

type Person = { id: string; username: string | null; email: string | null; userRank?: string | null };
type Message = { id: string; body: string; isInternal: boolean | null; createdAt: string | null; author: Person | null };
type Ticket = { id: string; ticketNumber: string; subject: string; description: string; category: string; priority: string; status: string; createdAt: string | null; updatedAt: string | null; requester?: Person | null; assignee?: Person | null; messages?: Message[] };

const statuses = ["all", "open", "in_progress", "awaiting_user", "resolved", "closed"];
const priorities = ["all", "low", "normal", "high", "urgent"];
const staffRanks = new Set(["Appeals Moderator", "Community Moderator", "Community Administrator", "Community Senior Administrator", "Gameplay Engineer", "Creative Designer", "Team Member", "Staff Department Director", "Operations Manager", "Company Director"]);

function isStaff(user: any) {
  return !!user && (user.isAdmin || user.isModerator || staffRanks.has(user.userRank) || (user.additionalRanks || []).some((rank: string) => staffRanks.has(rank)));
}
function dateLabel(date: string | null | undefined) {
  return date ? new Date(date).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—";
}
function nameOf(person?: Person | null) { return person?.username || person?.email || "Unknown user"; }
function statusName(status: string) { return status.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase()); }
function statusTone(status: string) {
  if (status === "closed" || status === "resolved") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (status === "open") return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  return "bg-amber-500/15 text-amber-400 border-amber-500/30";
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
  const queryParams = new URLSearchParams({ status, priority });
  if (search.trim()) queryParams.set("search", search.trim());
  const { data: tickets = [], isLoading: queueLoading } = useQuery<Ticket[]>({
    queryKey: [`/api/support/team/tickets?${queryParams.toString()}`],
    enabled: permitted,
  });
  const { data: members = [] } = useQuery<Person[]>({
    queryKey: ["/api/support/team/members"],
    enabled: permitted,
  });
  const { data: selectedTicket, isLoading: detailLoading } = useQuery<Ticket>({
    queryKey: [`/api/support/tickets/${selectedId}`],
    enabled: permitted && !!selectedId,
  });

  useEffect(() => {
    if (!selectedId && tickets.length) setSelectedId(tickets[0].id);
  }, [tickets, selectedId]);
  useEffect(() => {
    if (selectedTicket) setAssignedToId(selectedTicket.assignee?.id || "unassigned");
  }, [selectedTicket]);

  const updateTicket = useMutation({
    mutationFn: async (updates: Record<string, unknown>) => apiRequest("PATCH", `/api/support/tickets/${selectedId}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/support/tickets/${selectedId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/support/team/tickets?${queryParams.toString()}`] });
      toast({ title: "Ticket updated" });
    },
    onError: (error: Error) => toast({ title: "Could not update ticket", description: error.message, variant: "destructive" }),
  });
  const sendMessage = useMutation({
    mutationFn: async () => apiRequest("POST", `/api/support/tickets/${selectedId}/messages`, { body: reply, isInternal: internal }),
    onSuccess: () => {
      setReply("");
      setInternal(false);
      queryClient.invalidateQueries({ queryKey: [`/api/support/tickets/${selectedId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/support/team/tickets?${queryParams.toString()}`] });
    },
    onError: (error: Error) => toast({ title: "Could not send message", description: error.message, variant: "destructive" }),
  });

  if (authLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!permitted) return <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-4"><ShieldAlert className="h-12 w-12 mx-auto text-destructive" /><h1 className="text-2xl font-bold">Team access required</h1><p className="text-muted-foreground">This portal is restricted to authorized support team members.</p></div>;

  return (
    <div className="max-w-[1500px] mx-auto px-4 py-8 space-y-7" data-testid="support-team-page">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div><Badge variant="outline" className="gap-2 mb-2"><ShieldAlert className="h-3.5 w-3.5" /> Team workspace</Badge><h1 className="text-3xl font-bold tracking-tight">Support queue</h1><p className="text-muted-foreground mt-1">Triage, respond to, and manage customer tickets.</p></div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Inbox className="h-4 w-4" /> {tickets.length} visible ticket{tickets.length === 1 ? "" : "s"}</div>
      </div>
      <Card>
        <CardContent className="p-4 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by ticket number or subject" className="pl-9" data-testid="input-team-ticket-search" /></div>
          <div className="flex gap-3"><Select value={status} onValueChange={setStatus}><SelectTrigger className="w-[170px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger><SelectContent>{statuses.map((item) => <SelectItem key={item} value={item}>{item === "all" ? "All statuses" : statusName(item)}</SelectItem>)}</SelectContent></Select><Select value={priority} onValueChange={setPriority}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent>{priorities.map((item) => <SelectItem key={item} value={item}>{item === "all" ? "All priorities" : item[0].toUpperCase() + item.slice(1)}</SelectItem>)}</SelectContent></Select></div>
        </CardContent>
      </Card>
      <div className="grid xl:grid-cols-[380px_1fr] gap-5">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/50"><CardTitle className="text-base">Incoming tickets</CardTitle><CardDescription>Newest activity appears first.</CardDescription></CardHeader>
          <CardContent className="p-0">
            {queueLoading ? <div className="p-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : tickets.length === 0 ? <div className="p-10 text-center text-sm text-muted-foreground"><CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-emerald-400" />Nothing matches these filters.</div> : <div className="divide-y divide-border/50 max-h-[680px] overflow-y-auto">{tickets.map((ticket) => <button key={ticket.id} onClick={() => setSelectedId(ticket.id)} className={`w-full text-left p-4 space-y-2 hover:bg-muted/40 transition-colors ${selectedId === ticket.id ? "bg-primary/10 border-l-2 border-primary" : ""}`} data-testid={`team-ticket-row-${ticket.id}`}><div className="flex gap-2 items-start"><span className="font-medium truncate flex-1">{ticket.subject}</span><Badge variant="outline" className={`text-[10px] shrink-0 ${statusTone(ticket.status)}`}>{statusName(ticket.status)}</Badge></div><div className="flex items-center justify-between gap-2 text-xs text-muted-foreground"><span className="truncate">{ticket.requester?.username || ticket.ticketNumber}</span><span className="capitalize">{ticket.priority}</span></div><p className="text-xs text-muted-foreground">{dateLabel(ticket.updatedAt)}</p></button>)}</div>}
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          {!selectedId ? <div className="min-h-[600px] flex items-center justify-center text-muted-foreground">Select a ticket to begin.</div> : detailLoading || !selectedTicket ? <div className="min-h-[600px] flex items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div> : <>
            <CardHeader className="border-b border-border/50 space-y-4"><div className="flex flex-col sm:flex-row sm:items-start gap-3"><div className="flex-1"><p className="text-xs text-muted-foreground">{selectedTicket.ticketNumber} · {selectedTicket.category}</p><CardTitle className="text-xl mt-1">{selectedTicket.subject}</CardTitle><CardDescription className="mt-2">From {nameOf(selectedTicket.requester)} · Opened {dateLabel(selectedTicket.createdAt)}</CardDescription></div><Badge variant="outline" className={statusTone(selectedTicket.status)}>{statusName(selectedTicket.status)}</Badge></div><div className="grid sm:grid-cols-3 gap-3"><Select value={selectedTicket.status} onValueChange={(value) => updateTicket.mutate({ status: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statuses.slice(1).map((item) => <SelectItem key={item} value={item}>{statusName(item)}</SelectItem>)}</SelectContent></Select><Select value={selectedTicket.priority} onValueChange={(value) => updateTicket.mutate({ priority: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{priorities.slice(1).map((item) => <SelectItem key={item} value={item}>{item[0].toUpperCase() + item.slice(1)} priority</SelectItem>)}</SelectContent></Select><Select value={assignedToId} onValueChange={(value) => { setAssignedToId(value); updateTicket.mutate({ assignedToId: value === "unassigned" ? null : value }); }}><SelectTrigger><UserRound className="h-4 w-4 mr-2" /><SelectValue placeholder="Assign ticket" /></SelectTrigger><SelectContent><SelectItem value="unassigned">Unassigned</SelectItem>{members.map((member) => <SelectItem key={member.id} value={member.id}>{nameOf(member)}</SelectItem>)}</SelectContent></Select></div></CardHeader>
            <CardContent className="p-0 flex flex-col">
              <div className="p-5 space-y-4 max-h-[470px] overflow-y-auto">{(selectedTicket.messages || []).map((message) => <div key={message.id} className="flex gap-3"><div className={`max-w-[88%] rounded-xl px-4 py-3 ${message.isInternal ? "bg-amber-500/10 border border-amber-500/30" : message.author?.id === user?.id ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"}`}><div className="flex flex-wrap items-center gap-2 text-xs opacity-70 mb-1"><span>{message.isInternal ? "Internal note" : nameOf(message.author)}</span><span>{dateLabel(message.createdAt)}</span></div><p className="whitespace-pre-wrap text-sm">{message.body}</p></div></div>)}</div>
              <div className="border-t border-border/50 p-4 space-y-3"><Textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder={internal ? "Add an internal note for the team…" : "Reply to the customer…"} className="min-h-24" maxLength={10000} data-testid="input-team-reply" /><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer"><Checkbox checked={internal} onCheckedChange={(checked) => setInternal(checked === true)} /> Internal note (customer will not see this)</label><Button onClick={() => sendMessage.mutate()} disabled={sendMessage.isPending || !reply.trim()}><Send className="h-4 w-4 mr-2" /> {internal ? "Add note" : "Send reply"}</Button></div></div>
            </CardContent>
          </>}
        </Card>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="h-4 w-4" /> Use internal notes for handoffs; customer-facing replies change the ticket to Awaiting user.</div>
    </div>
  );
}