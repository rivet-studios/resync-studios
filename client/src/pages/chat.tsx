import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, AlertCircle } from "lucide-react";
import type { ChatMessage, User } from "@shared/schema";

interface ChatMessageWithAuthor extends ChatMessage {
  author?: User;
}

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessageWithAuthor[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch initial messages
  const { data: initialMessages, isLoading } = useQuery<ChatMessageWithAuthor[]>({
    queryKey: ["/api/chat"],
  });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Connect WebSocket
  useEffect(() => {
    if (!user) return;

    setIsConnecting(true);
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/chat/ws`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("✅ Chat connected");
      setIsConnecting(false);
      // Send authentication
      ws.send(
        JSON.stringify({
          type: "auth",
          userId: user.id,
          username: user.username || "Anonymous",
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "message") {
          const newMessage: ChatMessageWithAuthor = {
            id: data.id,
            senderId: data.senderId,
            content: data.content,
            recipientId: null,
            clanId: null,
            createdAt: new Date(data.createdAt),
            isRead: false,
            author: {
              id: data.senderId,
              username: data.username || "Anonymous",
              email: "",
            } as User,
          };
          setMessages((prev) => [...prev, newMessage]);
        }
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to chat. Retrying...",
        variant: "destructive",
      });
    };

    ws.onclose = () => {
      console.log("❌ Chat disconnected");
      setIsConnecting(false);
    };

    wsRef.current = ws;

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [user, toast]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim()) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast({
        title: "Error",
        description: "Not connected to chat.",
        variant: "destructive",
      });
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: "message",
        content: messageText,
      })
    );

    setMessageText("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-chat">
          Community Chat
        </h1>
        <p className="text-muted-foreground">
          Real-time chat with the RESYNC Studios community
        </p>
      </div>

      <Card className="flex flex-col h-[600px]">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>General Discussion</CardTitle>
              <CardDescription>
                {isConnecting ? "Connecting..." : "Connected"}
              </CardDescription>
            </div>
            <div
              className={`h-3 w-3 rounded-full ${
                isConnecting ? "bg-yellow-500" : "bg-green-500"
              }`}
            />
          </div>
        </CardHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
                  data-testid={`message-${msg.id}`}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage
                      src={msg.author?.profileImageUrl || ""}
                      alt={msg.author?.username}
                    />
                    <AvatarFallback>
                      {msg.author?.username?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <p className="text-sm font-semibold">
                        {msg.author?.username || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <p className="text-sm break-words text-foreground">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <CardContent className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={isConnecting || !wsRef.current}
              data-testid="input-chat-message"
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isConnecting || !messageText.trim() || !wsRef.current}
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
