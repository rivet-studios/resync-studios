import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useRoute, Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { VipBadge } from "@/components/vip-badge";
import { rankConfig } from "@/components/user-rank-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MessageSquare,
  Eye,
  ThumbsUp,
  Clock,
  Lock,
  Pin,
  Flag,
  ArrowLeft,
  Send,
  MoreVertical,
  Trash2,
  Pencil,
  Unlock,
  PinOff,
  FolderInput,
  Shield,
} from "lucide-react";
import { ReportDialog } from "@/components/report-dialog";
import { formatDistanceToNow } from "date-fns";
import type { ForumThread, ForumReply, User, ForumCategory } from "@shared/schema";

const STAFF_RANKS = [
  "Trial Moderator", "Moderator", "Administrator", "Senior Administrator",
  "Developer", "Staff Internal Affairs", "Team Member", "Staff Department Director",
  "Operations Manager", "Company Director",
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

const replySchema = z.object({
  content: z.string().min(5, "Reply must be at least 5 characters"),
});

type ReplyForm = z.infer<typeof replySchema>;

interface ThreadDetail extends ForumThread {
  author?: User;
  category?: ForumCategory;
  replies?: (ForumReply & { author?: User })[];
}

function RankUsername({ user, className = "" }: { user?: User | null; className?: string }) {
  if (!user) return <span className={`text-muted-foreground ${className}`}>Anonymous</span>;
  const rc = rankConfig[(user as any)?.userRank || ""];
  const isGradient = rc?.isGradient;
  return (
    <span
      className={`font-semibold ${className}`}
      style={isGradient ? {
        color: "transparent",
        backgroundImage: rc.gradient,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
      } : rc?.color ? { color: rc.color } : undefined}
    >
      {user.username}
    </span>
  );
}

export default function ForumThread() {
  const [, params] = useRoute("/forums/thread/:id");
  const threadId = params?.id || "";
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState("");
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [deleteThreadDialogOpen, setDeleteThreadDialogOpen] = useState(false);
  const [deleteReplyId, setDeleteReplyId] = useState<string | null>(null);

  const isStaff = isStaffUser(user);

  const form = useForm<ReplyForm>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      content: "",
    },
  });

  const { data: thread, isLoading: threadLoading } = useQuery<ThreadDetail>({
    queryKey: ["/api/forums/threads", threadId],
  });

  const { data: categories = [] } = useQuery<ForumCategory[]>({
    queryKey: ["/api/forums/categories"],
    enabled: isStaff,
  });

  const replyMutation = useMutation({
    mutationFn: async (data: ReplyForm) => {
      const response = await apiRequest("POST", `/api/forums/threads/${threadId}/replies`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Reply posted!", description: "Your response has been added." });
      queryClient.invalidateQueries({ queryKey: ["/api/forums/threads", threadId] });
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to post reply.", variant: "destructive" });
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: async (isPinned: boolean) => {
      const response = await apiRequest("PATCH", `/api/forums/threads/${threadId}`, { isPinned });
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({ title: data.isPinned ? "Thread pinned" : "Thread unpinned" });
      queryClient.invalidateQueries({ queryKey: ["/api/forums/threads", threadId] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update thread.", variant: "destructive" });
    },
  });

  const toggleLockMutation = useMutation({
    mutationFn: async (isLocked: boolean) => {
      const response = await apiRequest("PATCH", `/api/forums/threads/${threadId}`, { isLocked });
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({ title: data.isLocked ? "Thread locked" : "Thread unlocked" });
      queryClient.invalidateQueries({ queryKey: ["/api/forums/threads", threadId] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update thread.", variant: "destructive" });
    },
  });

  const deleteThreadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/forums/threads/${threadId}`);
    },
    onSuccess: () => {
      toast({ title: "Thread deleted", description: "The thread has been removed." });
      queryClient.invalidateQueries({ queryKey: ["/api/forums/threads"] });
      navigate("/forums");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete thread.", variant: "destructive" });
    },
  });

  const moveThreadMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await apiRequest("PATCH", `/api/forums/threads/${threadId}`, { categoryId });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Thread moved", description: "The thread has been moved to the new category." });
      queryClient.invalidateQueries({ queryKey: ["/api/forums/threads", threadId] });
      setMoveDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to move thread.", variant: "destructive" });
    },
  });

  const deleteReplyMutation = useMutation({
    mutationFn: async (replyId: string) => {
      await apiRequest("DELETE", `/api/forums/replies/${replyId}`);
    },
    onSuccess: () => {
      toast({ title: "Reply deleted", description: "The reply has been removed." });
      queryClient.invalidateQueries({ queryKey: ["/api/forums/threads", threadId] });
      setDeleteReplyId(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete reply.", variant: "destructive" });
    },
  });

  const editReplyMutation = useMutation({
    mutationFn: async ({ replyId, content }: { replyId: string; content: string }) => {
      const response = await apiRequest("PATCH", `/api/forums/replies/${replyId}`, { content });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Reply updated", description: "Your changes have been saved." });
      queryClient.invalidateQueries({ queryKey: ["/api/forums/threads", threadId] });
      setEditingReplyId(null);
      setEditReplyContent("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update reply.", variant: "destructive" });
    },
  });

  const onSubmit = (data: ReplyForm) => {
    replyMutation.mutate(data);
  };

  if (threadLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 py-8 px-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 py-8 px-4">
        <Link href="/forums">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forums
          </Button>
        </Link>
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Thread Not Found</h3>
            <p className="text-muted-foreground">This thread may have been deleted.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const replyCount = thread.replies?.length ?? thread.replyCount ?? 0;
  const isThreadAuthor = user && thread.authorId === user.id;
  const canEditThread = isStaff || isThreadAuthor;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Link href="/forums">
            <Button variant="ghost" size="sm" data-testid="button-back-forums">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Forums
            </Button>
          </Link>

          {isStaff && (
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <Shield className="w-3 h-3" />
                Staff
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-staff-actions">
                    <MoreVertical className="w-4 h-4 mr-1.5" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Thread Moderation</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => togglePinMutation.mutate(!thread.isPinned)}
                    disabled={togglePinMutation.isPending}
                    data-testid="button-toggle-pin"
                  >
                    {thread.isPinned ? (
                      <><PinOff className="w-4 h-4 mr-2" /> Unpin Thread</>
                    ) : (
                      <><Pin className="w-4 h-4 mr-2" /> Pin Thread</>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toggleLockMutation.mutate(!thread.isLocked)}
                    disabled={toggleLockMutation.isPending}
                    data-testid="button-toggle-lock"
                  >
                    {thread.isLocked ? (
                      <><Unlock className="w-4 h-4 mr-2" /> Unlock Thread</>
                    ) : (
                      <><Lock className="w-4 h-4 mr-2" /> Lock Thread</>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedCategoryId(thread.categoryId || "");
                      setMoveDialogOpen(true);
                    }}
                    data-testid="button-move-thread"
                  >
                    <FolderInput className="w-4 h-4 mr-2" /> Move Thread
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteThreadDialogOpen(true)}
                    data-testid="button-delete-thread"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Thread
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {thread.category && (
              <Badge variant="outline" data-testid="badge-category">{thread.category.name}</Badge>
            )}
            {thread.isPinned && (
              <Badge variant="secondary" className="gap-1">
                <Pin className="w-3 h-3" />
                Pinned
              </Badge>
            )}
            {thread.isLocked && (
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <Lock className="w-3 h-3" />
                Locked
              </Badge>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold leading-tight" data-testid="heading-thread-title">
            {thread.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5" data-testid="stat-views">
              <Eye className="w-4 h-4" />
              {thread.viewCount || 0} views
            </span>
            <span className="flex items-center gap-1.5" data-testid="stat-replies">
              <MessageSquare className="w-4 h-4" />
              {replyCount} replies
            </span>
            <span className="flex items-center gap-1.5" data-testid="stat-upvotes">
              <ThumbsUp className="w-4 h-4" />
              {thread.upvotes || 0} upvotes
            </span>
          </div>
        </div>

        <Card data-testid="card-original-post">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={thread.author?.profileImageUrl || undefined} />
                <AvatarFallback>{thread.author?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <RankUsername user={thread.author} />
                  {thread.author?.vipTier && thread.author.vipTier !== 'none' && (
                    <VipBadge tier={thread.author.vipTier as any} size="sm" showLabel={false} />
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {thread.createdAt
                    ? formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })
                    : "recently"}
                </span>
              </div>
            </div>

            <div className="mt-4 pl-0 sm:pl-14">
              <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words" data-testid="text-thread-content">
                {thread.content}
              </p>
            </div>

            <div className="flex items-center justify-end mt-4 pt-3 border-t gap-2 flex-wrap">
              {canEditThread && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground"
                  asChild
                  data-testid="button-edit-thread"
                >
                  <Link href={`/forums/thread/${threadId}/edit`}>
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                </Button>
              )}
              {user && thread.author?.id !== user.id && (
                <ReportDialog
                  targetId={thread.id}
                  targetType="thread"
                  trigger={
                    <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" data-testid="button-report-thread">
                      <Flag className="w-3.5 h-3.5" />
                      Report
                    </Button>
                  }
                />
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold" data-testid="heading-replies">
              Replies ({replyCount})
            </h2>
          </div>

          {thread.replies && thread.replies.length > 0 ? (
            <div className="space-y-3">
              {thread.replies.map((reply) => {
                const isReplyAuthor = user && reply.authorId === user.id;
                const canEditReply = isStaff || isReplyAuthor;
                const canDeleteReply = isStaff;
                const isEditing = editingReplyId === reply.id;

                return (
                  <Card key={reply.id} data-testid={`card-reply-${reply.id}`}>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <Avatar className="w-9 h-9 flex-shrink-0">
                          <AvatarImage src={reply.author?.profileImageUrl || undefined} />
                          <AvatarFallback>
                            {reply.author?.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <RankUsername user={reply.author} />
                              {reply.author?.vipTier && reply.author.vipTier !== 'none' && (
                                <VipBadge tier={reply.author.vipTier as any} size="sm" showLabel={false} />
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {reply.createdAt
                                ? formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })
                                : "recently"}
                            </span>
                          </div>

                          {isEditing ? (
                            <div className="mt-2 space-y-2">
                              <Textarea
                                value={editReplyContent}
                                onChange={(e) => setEditReplyContent(e.target.value)}
                                className="min-h-[80px] resize-none"
                                data-testid={`input-edit-reply-${reply.id}`}
                              />
                              <div className="flex items-center justify-end gap-2 flex-wrap">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingReplyId(null);
                                    setEditReplyContent("");
                                  }}
                                  data-testid={`button-cancel-edit-reply-${reply.id}`}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  disabled={editReplyMutation.isPending || editReplyContent.trim().length < 5}
                                  onClick={() => editReplyMutation.mutate({ replyId: reply.id, content: editReplyContent })}
                                  data-testid={`button-save-edit-reply-${reply.id}`}
                                >
                                  {editReplyMutation.isPending ? "Saving..." : "Save"}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words mt-2" data-testid={`text-reply-content-${reply.id}`}>
                              {reply.content}
                            </p>
                          )}

                          {!isEditing && (canEditReply || canDeleteReply || (user && reply.author?.id !== user.id)) && (
                            <div className="flex items-center justify-end mt-3 pt-2 border-t gap-2 flex-wrap">
                              {canEditReply && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1.5 text-muted-foreground"
                                  onClick={() => {
                                    setEditingReplyId(reply.id);
                                    setEditReplyContent(reply.content);
                                  }}
                                  data-testid={`button-edit-reply-${reply.id}`}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  Edit
                                </Button>
                              )}
                              {canDeleteReply && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1.5 text-destructive"
                                  onClick={() => setDeleteReplyId(reply.id)}
                                  data-testid={`button-delete-reply-${reply.id}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </Button>
                              )}
                              {user && reply.author?.id !== user.id && (
                                <ReportDialog
                                  targetId={reply.id}
                                  targetType="reply"
                                  trigger={
                                    <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" data-testid={`button-report-reply-${reply.id}`}>
                                      <Flag className="w-3.5 h-3.5" />
                                      Report
                                    </Button>
                                  }
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-10 text-center">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                <h3 className="font-semibold mb-1 text-sm">No Replies Yet</h3>
                <p className="text-xs text-muted-foreground">Be the first to reply to this thread!</p>
              </CardContent>
            </Card>
          )}

          {thread.isLocked && (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center text-muted-foreground">
                <Lock className="w-5 h-5 mx-auto mb-2" />
                <p className="text-sm">This thread is locked. No new replies can be added.</p>
              </CardContent>
            </Card>
          )}

          {user && !thread.isLocked && (
            <Card data-testid="card-reply-form">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-3 sm:gap-4">
                  <Avatar className="w-9 h-9 flex-shrink-0 mt-1">
                    <AvatarImage src={user.profileImageUrl || undefined} />
                    <AvatarFallback>{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Write your reply..."
                                  className="min-h-[100px] resize-none"
                                  {...field}
                                  data-testid="input-reply-content"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            size="sm"
                            disabled={replyMutation.isPending}
                            data-testid="button-submit-reply"
                          >
                            <Send className="w-3.5 h-3.5 mr-1.5" />
                            {replyMutation.isPending ? "Posting..." : "Post Reply"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog open={deleteThreadDialogOpen} onOpenChange={setDeleteThreadDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Thread</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this thread? This action cannot be undone and will also remove all replies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-thread">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteThreadMutation.mutate()}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete-thread"
            >
              {deleteThreadMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteReplyId} onOpenChange={(open) => { if (!open) setDeleteReplyId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reply</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this reply? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-reply">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deleteReplyId) deleteReplyMutation.mutate(deleteReplyId); }}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete-reply"
            >
              {deleteReplyMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Thread</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">Select the category to move this thread to:</p>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger data-testid="select-move-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} data-testid={`option-category-${cat.id}`}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMoveDialogOpen(false)} data-testid="button-cancel-move">
              Cancel
            </Button>
            <Button
              onClick={() => { if (selectedCategoryId) moveThreadMutation.mutate(selectedCategoryId); }}
              disabled={!selectedCategoryId || selectedCategoryId === thread.categoryId || moveThreadMutation.isPending}
              data-testid="button-confirm-move"
            >
              {moveThreadMutation.isPending ? "Moving..." : "Move Thread"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
