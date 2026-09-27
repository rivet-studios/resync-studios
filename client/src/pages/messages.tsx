import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { VerifiedBadge } from "@/components/verified-badge";
import { useSearch } from "wouter";
import {
  MessageSquare,
  Send,
  Search,
  ArrowLeft,
  Loader2,
  Users,
  ChevronRight,
  Circle,
} from "lucide-react";

function getInitial(username?: string | null) {
  return (username || "?").charAt(0).toUpperCase();
}

function formatMessageTime(date: string | Date) {
  const messageDate = new Date(date);

  if (Number.isNaN(messageDate.getTime())) {
    return "";
  }

  return messageDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchString = useSearch();

  const params = new URLSearchParams(searchString);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    params.get("user"),
  );
  const [messageText, setMessageText] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    data: conversations = [],
    isLoading: convsLoading,
  } = useQuery<any[]>({
    queryKey: ["/api/messages"],
    enabled: !!user,
    refetchInterval: 10000,
  });

  const {
    data: messages = [],
    isLoading: msgsLoading,
  } = useQuery<any[]>({
    queryKey: ["/api/messages", selectedUserId],
    enabled: !!user && !!selectedUserId,
    refetchInterval: 5000,
  });

  const { data: allUsers = [] } = useQuery<any[]>({
    queryKey: ["/api/users", userSearch],
    queryFn: async () => {
      if (!userSearch.trim()) return [];

      const res = await fetch(
        `/api/users?search=${encodeURIComponent(userSearch)}`,
      );

      return res.json();
    },
    enabled: userSearch.length >= 2,
  });

  const { data: selectedUserInfo } = useQuery<any>({
    queryKey: ["/api/users", selectedUserId, "profile"],
    queryFn: async () => {
      const res = await fetch(`/api/users/${selectedUserId}`);
      return res.json();
    },
    enabled: !!selectedUserId,
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/messages", {
        receiverId: selectedUserId,
        content: messageText,
      });

      return res.json();
    },
    onSuccess: () => {
      setMessageText("");

      queryClient.invalidateQueries({
        queryKey: ["/api/messages", selectedUserId],
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/messages"],
      });
    },
    onError: () => {
      toast({
        title: "Unable to send message",
        description: "Something went wrong while sending your message.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  if (!user) {
    return (
      <div
        className="min-h-screen px-4 py-12 md:px-6"
        data-testid="page-messages"
      >
        <div className="mx-auto max-w-3xl">
          <Card className="border-white/5 bg-white/[0.02]">
            <CardContent className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <MessageSquare className="h-7 w-7 text-white/40" />
              </div>

              <h2 className="text-xl font-semibold tracking-tight">
                Sign in to view messages
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                You need to be signed in to send and receive direct messages
                with other RIVET members.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 py-8 md:px-6 md:py-12"
      data-testid="page-messages"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-white/35">
              <MessageSquare className="h-3.5 w-3.5" />
              RIVET Community
            </div>

            <h1
              className="text-3xl font-bold tracking-tight"
              data-testid="text-messages-title"
            >
              Messages
            </h1>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Your private conversations with other members.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.025] px-3 py-2 text-xs text-white/45">
            <Users className="h-3.5 w-3.5" />
            <span>
              {conversations.length}{" "}
              {conversations.length === 1 ? "conversation" : "conversations"}
            </span>
          </div>
        </div>

        {/* Messaging Interface */}
        <div className="grid h-[calc(100vh-220px)] min-h-[600px] grid-cols-1 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.015] shadow-2xl shadow-black/10 md:grid-cols-[300px_minmax(0,1fr)]">
          {/* Conversation Sidebar */}
          <aside
            className={`flex min-h-0 flex-col border-white/5 md:border-r ${
              selectedUserId ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="border-b border-white/5 p-4">
              <div className="mb-3">
                <h2 className="text-sm font-semibold">Conversations</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Select a conversation or find a member.
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                <Input
                  placeholder="Search members..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="h-10 border-white/10 bg-white/[0.03] pl-9 text-sm placeholder:text-white/25 focus-visible:ring-1"
                  data-testid="input-user-search"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {/* User Search Results */}
              {userSearch.length >= 2 ? (
                <div className="space-y-1">
                  <div className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
                    Members
                  </div>

                  {allUsers.filter((u: any) => u.id !== user.id).length ===
                  0 ? (
                    <div className="px-3 py-10 text-center">
                      <Search className="mx-auto mb-2 h-7 w-7 text-white/20" />
                      <p className="text-xs text-muted-foreground">
                        No members found.
                      </p>
                    </div>
                  ) : (
                    allUsers
                      .filter((u: any) => u.id !== user.id)
                      .map((u: any) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setSelectedUserId(u.id);
                            setUserSearch("");
                          }}
                          className="group flex w-full items-center gap-3 rounded-xl border border-transparent p-2.5 text-left transition-all hover:border-white/5 hover:bg-white/[0.04]"
                          data-testid={`button-user-${u.id}`}
                        >
                          <Avatar className="h-9 w-9 shrink-0 border border-white/10">
                            <AvatarImage src={u.profileImageUrl} />
                            <AvatarFallback className="bg-white/[0.06] text-xs text-white/60">
                              {getInitial(u.username)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate text-sm font-medium">
                                {u.username}
                              </span>

                              <VerifiedBadge
                                isVerified={u.isVerified}
                                size="sm"
                              />
                            </div>

                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              Start a conversation
                            </p>
                          </div>

                          <ChevronRight className="h-4 w-4 shrink-0 text-white/20 transition-transform group-hover:translate-x-0.5 group-hover:text-white/40" />
                        </button>
                      ))
                  )}
                </div>
              ) : convsLoading ? (
                <div className="space-y-2 p-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl p-2.5"
                    >
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-2.5 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-5 py-12 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/5 bg-white/[0.03]">
                    <MessageSquare className="h-5 w-5 text-white/30" />
                  </div>

                  <p className="text-sm font-medium">No conversations yet</p>

                  <p className="mt-1.5 max-w-[220px] text-xs leading-5 text-muted-foreground">
                    Search for another member above to start a private
                    conversation.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conv: any) => {
                    const isSelected = selectedUserId === conv.partner_id;

                    return (
                      <button
                        key={conv.partner_id}
                        onClick={() =>
                          setSelectedUserId(conv.partner_id)
                        }
                        className={`group relative flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-all ${
                          isSelected
                            ? "border-white/10 bg-white/[0.07]"
                            : "border-transparent hover:border-white/5 hover:bg-white/[0.035]"
                        }`}
                        data-testid={`button-conv-${conv.partner_id}`}
                      >
                        {isSelected && (
                          <div className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-primary" />
                        )}

                        <div className="relative shrink-0">
                          <Avatar className="h-10 w-10 border border-white/10">
                            <AvatarFallback className="bg-white/[0.06] text-xs text-white/60">
                              {conv.partner_id
                                ? conv.partner_id.substring(0, 2).toUpperCase()
                                : "??"}
                            </AvatarFallback>
                          </Avatar>

                          {conv.unread_count > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium">
                              {conv.partner_id
                                ? `${conv.partner_id.substring(0, 8)}...`
                                : "Unknown member"}
                            </p>

                            {conv.unread_count > 0 && (
                              <Badge
                                variant="default"
                                className="ml-auto h-5 min-w-5 shrink-0 rounded-full px-1.5 text-[10px]"
                              >
                                {conv.unread_count}
                              </Badge>
                            )}
                          </div>

                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {conv.last_message || "No messages yet"}
                          </p>
                        </div>

                        <ChevronRight
                          className={`h-4 w-4 shrink-0 transition-all ${
                            isSelected
                              ? "text-white/40"
                              : "text-white/10 group-hover:text-white/30"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* Chat Panel */}
          <section
            className={`min-h-0 flex-col ${
              selectedUserId ? "flex" : "hidden md:flex"
            }`}
          >
            {selectedUserId ? (
              <>
                {/* Chat Header */}
                <header className="flex items-center gap-3 border-b border-white/5 px-4 py-3.5 md:px-5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 md:hidden"
                    onClick={() => setSelectedUserId(null)}
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>

                  <Avatar className="h-9 w-9 border border-white/10">
                    <AvatarImage src={selectedUserInfo?.profileImageUrl} />
                    <AvatarFallback className="bg-white/[0.06] text-xs text-white/60">
                      {getInitial(selectedUserInfo?.username)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <CardTitle
                        className="truncate text-sm font-semibold"
                        data-testid="text-chat-username"
                      >
                        {selectedUserInfo?.username || "Loading..."}
                      </CardTitle>

                      <VerifiedBadge
                        isVerified={selectedUserInfo?.isVerified}
                        size="sm"
                      />
                    </div>

                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Circle className="h-2 w-2 fill-current text-green-400" />
                      Private conversation
                    </div>
                  </div>
                </header>

                {/* Messages */}
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6">
                  {msgsLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-white/40" />
                        <p className="text-xs text-muted-foreground">
                          Loading conversation...
                        </p>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="max-w-sm text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/5 bg-white/[0.03]">
                          <MessageSquare className="h-5 w-5 text-white/30" />
                        </div>

                        <h3 className="text-sm font-semibold">
                          Start the conversation
                        </h3>

                        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                          Send a message to{" "}
                          {selectedUserInfo?.username || "this member"} to get
                          things started.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mx-auto max-w-3xl space-y-3">
                      {messages.map((msg: any) => {
                        const isOwnMessage = msg.senderId === user.id;

                        return (
                          <div
                            key={msg.id}
                            className={`flex ${
                              isOwnMessage
                                ? "justify-end"
                                : "justify-start"
                            }`}
                            data-testid={`message-${msg.id}`}
                          >
                            <div
                              className={`group max-w-[82%] sm:max-w-[70%] ${
                                isOwnMessage
                                  ? "items-end"
                                  : "items-start"
                              }`}
                            >
                              <div
                                className={`rounded-2xl px-3.5 py-2.5 text-sm leading-5 shadow-sm ${
                                  isOwnMessage
                                    ? "rounded-br-md bg-primary text-primary-foreground"
                                    : "rounded-bl-md border border-white/5 bg-white/[0.05] text-foreground"
                                }`}
                              >
                                <p className="whitespace-pre-wrap break-words">
                                  {msg.content}
                                </p>
                              </div>

                              <p
                                className={`mt-1 px-1 text-[10px] text-muted-foreground/60 ${
                                  isOwnMessage
                                    ? "text-right"
                                    : "text-left"
                                }`}
                              >
                                {formatMessageTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Composer */}
                <div className="border-t border-white/5 bg-white/[0.01] p-3 md:p-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();

                      if (
                        messageText.trim() &&
                        !sendMutation.isPending
                      ) {
                        sendMutation.mutate();
                      }
                    }}
                    className="mx-auto flex max-w-3xl items-center gap-2"
                  >
                    <Input
                      placeholder="Write a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="h-11 border-white/10 bg-white/[0.035] px-3.5 text-sm placeholder:text-white/25 focus-visible:ring-1"
                      data-testid="input-message"
                    />

                    <Button
                      type="submit"
                      size="icon"
                      className="h-11 w-11 shrink-0 rounded-xl"
                      disabled={
                        !messageText.trim() || sendMutation.isPending
                      }
                      data-testid="button-send"
                    >
                      {sendMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>

                  <p className="mx-auto mt-2 max-w-3xl px-1 text-[10px] text-muted-foreground/40">
                    Messages are private between you and the recipient.
                  </p>
                </div>
              </>
            ) : (
              <CardContent className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03]">
                  <MessageSquare className="h-7 w-7 text-white/25" />
                </div>

                <h2 className="text-base font-semibold">
                  Your messages
                </h2>

                <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
                  Select a conversation from the sidebar or search for another
                  member to start a private conversation.
                </p>

                <div className="mt-5 flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-white/35">
                  <Search className="h-3.5 w-3.5" />
                  Search for a member to get started
                </div>
              </CardContent>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}