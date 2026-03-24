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
import { MessageSquare, Send, Search, ArrowLeft, Loader2 } from "lucide-react";
import { useSearch } from "wouter";

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(params.get("user"));
  const [messageText, setMessageText] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: convsLoading } = useQuery<any[]>({
    queryKey: ["/api/messages"],
    enabled: !!user,
    refetchInterval: 10000,
  });

  const { data: messages = [], isLoading: msgsLoading } = useQuery<any[]>({
    queryKey: ["/api/messages", selectedUserId],
    enabled: !!user && !!selectedUserId,
    refetchInterval: 5000,
  });

  const { data: allUsers = [] } = useQuery<any[]>({
    queryKey: ["/api/users", userSearch],
    queryFn: async () => {
      if (!userSearch.trim()) return [];
      const res = await fetch(`/api/users?search=${encodeURIComponent(userSearch)}`);
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
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) {
    return (
      <div className="container mx-auto max-w-4xl p-6 text-center py-20">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">Sign in to view messages</h2>
        <p className="text-muted-foreground">You need to be logged in to send and receive messages.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6" data-testid="text-messages-title">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
        <Card className="md:col-span-1 flex flex-col">
          <CardHeader className="pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9"
                data-testid="input-user-search"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-2 space-y-1">
            {userSearch.length >= 2 ? (
              allUsers.filter((u: any) => u.id !== user.id).map((u: any) => (
                <button
                  key={u.id}
                  onClick={() => { setSelectedUserId(u.id); setUserSearch(""); }}
                  className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-secondary transition-colors text-left"
                  data-testid={`button-user-${u.id}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={u.profileImageUrl} />
                    <AvatarFallback>{(u.username || "?")[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">{u.username}</span>
                </button>
              ))
            ) : convsLoading ? (
              <div className="space-y-2 p-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">Search for a user to start chatting</p>
              </div>
            ) : (
              conversations.map((conv: any) => (
                <button
                  key={conv.partner_id}
                  onClick={() => setSelectedUserId(conv.partner_id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors text-left ${
                    selectedUserId === conv.partner_id ? "bg-secondary" : "hover:bg-secondary/50"
                  }`}
                  data-testid={`button-conv-${conv.partner_id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.partner_id.substring(0, 8)}...</p>
                    <p className="text-xs text-muted-foreground truncate">{conv.last_message}</p>
                  </div>
                  {conv.unread_count > 0 && (
                    <Badge variant="default" className="text-[10px] h-5 px-1.5">{conv.unread_count}</Badge>
                  )}
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 flex flex-col">
          {selectedUserId ? (
            <>
              <CardHeader className="pb-2 border-b">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedUserId(null)}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedUserInfo?.profileImageUrl} />
                    <AvatarFallback>{(selectedUserInfo?.username || "?")[0]}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-sm" data-testid="text-chat-username">
                    {selectedUserInfo?.username || "Loading..."}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}
                      data-testid={`message-${msg.id}`}
                    >
                      <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                        msg.senderId === user.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}>
                        <p>{msg.content}</p>
                        <p className="text-[10px] opacity-60 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="p-3 border-t">
                <form
                  onSubmit={(e) => { e.preventDefault(); if (messageText.trim()) sendMutation.mutate(); }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    data-testid="input-message"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!messageText.trim() || sendMutation.isPending}
                    data-testid="button-send"
                  >
                    {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Select a conversation or search for a user</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
