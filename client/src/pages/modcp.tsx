import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type User } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Shield,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";

interface ForumThread {
  id: string;
  title: string;
  content: string;
  authorId: string;
  categoryId: string;
  isLocked: boolean;
  isPinned: boolean;
  createdAt: string;
  author?: { username: string };
}

interface ForumReply {
  id: string;
  content: string;
  threadId: string;
  authorId: string;
  createdAt: string;
  author?: { username: string };
}

export default function ModCP() {
  const { user } = useAuth() as { user?: User };
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Check if user is moderator or above
  const isMod =
    user?.userRank &&
    [
      "rs_trust_safety_team",
      "community_moderator",
      "community_senior_moderator",
      "community_administrator",
      "community_senior_administrator",
      "staff_department_director",
      "team_member",
      "operations_manager",
      "leadership_council",
      "company_director",
    ].includes(user.userRank);

  if (!isMod) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive" />
              <div>
                <h2 className="font-bold text-lg mb-2">Access Denied</h2>
                <p className="text-muted-foreground">
                  You don't have permission to access the Moderator Control
                  Panel.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: threads = [], isLoading: threadsLoading } = useQuery<
    ForumThread[]
  >({
    queryKey: ["/api/modcp/threads"],
  });

  const { data: replies = [], isLoading: repliesLoading } = useQuery<
    ForumReply[]
  >({
    queryKey: ["/api/modcp/replies"],
  });

  const lockThreadMutation = useMutation({
    mutationFn: async ({
      threadId,
      isLocked,
    }: {
      threadId: string;
      isLocked: boolean;
    }) => {
      await apiRequest("PATCH", `/api/modcp/threads/${threadId}/lock`, {
        isLocked,
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Thread updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/modcp/threads"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update thread",
        variant: "destructive",
      });
    },
  });

  const pinThreadMutation = useMutation({
    mutationFn: async ({
      threadId,
      isPinned,
    }: {
      threadId: string;
      isPinned: boolean;
    }) => {
      await apiRequest("PATCH", `/api/modcp/threads/${threadId}/pin`, {
        isPinned,
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Thread updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/modcp/threads"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update thread",
        variant: "destructive",
      });
    },
  });

  const deleteThreadMutation = useMutation({
    mutationFn: async (threadId: string) => {
      await apiRequest("DELETE", `/api/modcp/threads/${threadId}`, {});
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Thread deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/modcp/threads"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete thread",
        variant: "destructive",
      });
    },
  });

  const deleteReplyMutation = useMutation({
    mutationFn: async (replyId: string) => {
      await apiRequest("DELETE", `/api/modcp/replies/${replyId}`, {});
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Reply deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/modcp/replies"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete reply",
        variant: "destructive",
      });
    },
  });

  const filteredThreads = threads.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="font-display text-3xl font-bold">
            Moderator Control Panel
          </h1>
          <p className="text-muted-foreground">
            Manage forums, threads, and community content
          </p>
        </div>
      </div>

      <Tabs defaultValue="threads" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="threads">Threads</TabsTrigger>
          <TabsTrigger value="replies">Replies</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="threads" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search threads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-threads"
            />
          </div>

          {threadsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredThreads.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No threads found
                  </CardContent>
                </Card>
              ) : (
                filteredThreads.map((thread) => (
                  <Card key={thread.id} className="hover-elevate">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            {thread.title}
                            {thread.isPinned && (
                              <Badge variant="outline">Pinned</Badge>
                            )}
                            {thread.isLocked && (
                              <Badge variant="outline">Locked</Badge>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {thread.content.substring(0, 100)}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            By {thread.author?.username || "Unknown"} •{" "}
                            {new Date(thread.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              lockThreadMutation.mutate({
                                threadId: thread.id,
                                isLocked: !thread.isLocked,
                              })
                            }
                            data-testid={`button-lock-${thread.id}`}
                          >
                            {thread.isLocked ? (
                              <Unlock className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              pinThreadMutation.mutate({
                                threadId: thread.id,
                                isPinned: !thread.isPinned,
                              })
                            }
                            data-testid={`button-pin-${thread.id}`}
                          >
                            {thread.isPinned ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Thread
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this thread?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="flex gap-2">
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    deleteThreadMutation.mutate(thread.id)
                                  }
                                  className="bg-destructive"
                                >
                                  Delete
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="replies" className="space-y-4">
          {repliesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : (
            <div className="space-y-3">
              {replies.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No replies found
                  </CardContent>
                </Card>
              ) : (
                replies.map((reply) => (
                  <Card key={reply.id} className="hover-elevate">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm mb-2">{reply.content}</p>
                          <p className="text-xs text-muted-foreground">
                            By {reply.author?.username || "Unknown"} •{" "}
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Reply</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this reply?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex gap-2">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  deleteReplyMutation.mutate(reply.id)
                                }
                                className="bg-destructive"
                              >
                                Delete
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Actions</CardTitle>
              <CardDescription>Common moderator tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Button variant="outline" className="justify-start" disabled>
                  <Shield className="w-4 h-4 mr-2" />
                  View User Reports (Open Beta Testing)
                </Button>
                <Button variant="outline" className="justify-start" disabled>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  View Spam Reports (Open Beta Testing)
                </Button>
                <Button variant="outline" className="justify-start" disabled>
                  <Lock className="w-4 h-4 mr-2" />
                  Manage Bans (Open Beta Testing)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
