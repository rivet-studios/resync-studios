import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Flag,
  ArrowLeft,
} from "lucide-react";
import { ReportDialog } from "@/components/report-dialog";
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

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (threadLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 py-8 px-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 py-8 px-4">
        <Link href="/forums">
          <Button variant="ghost">
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

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-8 px-4">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/forums">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forums
          </Button>
        </Link>

        {/* Thread Title */}
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {thread.category && <Badge variant="outline">{thread.category.name}</Badge>}
            {thread.isPinned && <Badge variant="secondary">Pinned</Badge>}
            {thread.isLocked && (
              <Badge variant="outline" className="gap-1">
                <Lock className="w-3 h-3" />
                Locked
              </Badge>
            )}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">{thread.title}</h1>
        </div>

        {/* Thread Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {thread.viewCount} views
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            {thread.replyCount} replies
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            {thread.upvotes} upvotes
          </span>
        </div>
      </div>

      {/* Original Post */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={thread.author?.profileImageUrl || undefined} />
              <AvatarFallback>{thread.author?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {(() => {
                  const rc = rankConfig[(thread.author as any)?.userRank || ""];
                  const isLifetime = (thread.author as any)?.userRank === "Lifetime" && rc?.isGradient;
                  return (
                    <span
                      className="font-semibold"
                      style={isLifetime ? {
                        color: "transparent",
                        backgroundImage: rc.gradient,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                      } : undefined}
                    >
                      {thread.author?.username || 'Anonymous'}
                    </span>
                  );
                })()}
                {thread.author?.vipTier && thread.author.vipTier !== 'none' && (
                  <VipBadge tier={thread.author.vipTier as any} size="sm" showLabel={false} />
                )}
              </div>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(thread.createdAt!)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
            {thread.content}
          </p>
          {user && thread.author?.id !== user.id && (
            <div className="flex justify-end mt-4 pt-3 border-t border-white/5">
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

      {/* Replies Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Replies ({thread.replyCount})</h2>

        {/* Reply Form */}
        {user && !thread.isLocked && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Your Reply</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Write your reply..."
                            className="min-h-[120px]"
                            {...field}
                            data-testid="input-reply-content"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={replyMutation.isPending}
                    data-testid="button-submit-reply"
                  >
                    {replyMutation.isPending ? "Posting..." : "Post Reply"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {thread.isLocked && (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center text-muted-foreground">
              <Lock className="w-6 h-6 mx-auto mb-2" />
              This thread is locked and no new replies can be added.
            </CardContent>
          </Card>
        )}

        {/* Replies List */}
        {thread.replies && thread.replies.length > 0 ? (
          <div className="space-y-3">
            {thread.replies.map((reply) => (
              <Card key={reply.id} data-testid={`card-reply-${reply.id}`}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={reply.author?.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {reply.author?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {(() => {
                          const rc = rankConfig[(reply.author as any)?.userRank || ""];
                          const isLifetime = (reply.author as any)?.userRank === "Lifetime" && rc?.isGradient;
                          return (
                            <span
                              className="font-semibold"
                              style={isLifetime ? {
                                color: "transparent",
                                backgroundImage: rc.gradient,
                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",
                              } : undefined}
                            >
                              {reply.author?.username || 'Anonymous'}
                            </span>
                          );
                        })()}
                        {reply.author?.vipTier && reply.author.vipTier !== 'none' && (
                          <VipBadge tier={reply.author.vipTier as any} size="sm" showLabel={false} />
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(reply.createdAt!)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
                    {reply.content}
                  </p>
                  {user && reply.author?.id !== user.id && (
                    <div className="flex justify-end mt-4 pt-3 border-t border-white/5">
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
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No Replies Yet</h3>
              <p className="text-muted-foreground">Be the first to reply to this thread!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
