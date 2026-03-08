import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useRoute, Link } from "wouter";
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
} from "lucide-react";
import { ReportDialog } from "@/components/report-dialog";
import { formatDistanceToNow } from "date-fns";
import type { ForumThread, ForumReply, User, ForumCategory } from "@shared/schema";

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

  const form = useForm<ReplyForm>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      content: "",
    },
  });

  const { data: thread, isLoading: threadLoading } = useQuery<ThreadDetail>({
    queryKey: ["/api/forums/threads", threadId],
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-500">
        <Link href="/forums">
          <Button variant="ghost" size="sm" data-testid="button-back-forums">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forums
          </Button>
        </Link>

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

            {user && thread.author?.id !== user.id && (
              <div className="flex justify-end mt-4 pt-3 border-t">
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
              </div>
            )}
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
              {thread.replies.map((reply, index) => (
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

                        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words mt-2" data-testid={`text-reply-content-${reply.id}`}>
                          {reply.content}
                        </p>

                        {user && reply.author?.id !== user.id && (
                          <div className="flex justify-end mt-3 pt-2 border-t">
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
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
    </div>
  );
}
