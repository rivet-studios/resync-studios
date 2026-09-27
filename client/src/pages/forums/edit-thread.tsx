import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation, useRoute, Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  insertForumThreadSchema,
  type ForumCategory,
  type ForumThread,
  type User,
} from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  FileText,
  Lock,
  MessageSquare,
  Save,
  Shield,
} from "lucide-react";

interface ThreadDetail extends ForumThread {
  author?: User;
  category?: ForumCategory;
}

const staffRanks = [
  "Trial Moderator",
  "Moderator",
  "Administrator",
  "Senior Administrator",
  "Developer",
  "Staff Internal Affairs",
  "Team Member",
  "Staff Department Director",
  "Operations Manager",
  "Company Director",
];

function isStaffUser(user: any): boolean {
  return (
    user?.isAdmin ||
    user?.isModerator ||
    staffRanks.includes(user?.userRank) ||
    (user?.additionalRanks || []).some((r: string) =>
      staffRanks.includes(r)
    )
  );
}

const editFormSchema = insertForumThreadSchema
  .omit({
    authorId: true,
    isPinned: true,
    isLocked: true,
    viewCount: true,
    replyCount: true,
    upvotes: true,
    lastReplyAt: true,
  })
  .extend({
    categoryId: z.string().min(1, "Please select a category"),
    title: z.string().min(3, "Title must be at least 3 characters"),
    content: z.string().min(10, "Content must be at least 10 characters"),
  });

type EditFormValues = z.infer<typeof editFormSchema>;

export default function EditThread() {
  const [, params] = useRoute("/forums/thread/:id/edit");
  const threadId = params?.id || "";

  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    data: thread,
    isLoading: threadLoading,
  } = useQuery<ThreadDetail>({
    queryKey: ["/api/forums/threads", threadId],
  });

  const {
    data: categories,
    isLoading: categoriesLoading,
  } = useQuery<ForumCategory[]>({
    queryKey: ["/api/forums/categories"],
  });

  const isStaff = isStaffUser(user);
  const isAuthor = thread?.authorId === user?.id;
  const canEdit = isStaff || isAuthor;

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: "",
    },
    values: thread
      ? {
          title: thread.title,
          content: thread.content,
          categoryId: thread.categoryId,
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: async (values: EditFormValues) => {
      const res = await apiRequest(
        "PATCH",
        `/api/forums/threads/${threadId}`,
        values
      );

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/forums/threads", threadId],
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/forums/threads"],
      });

      toast({
        title: "Thread updated",
        description: "Your changes have been saved successfully.",
      });

      setLocation(`/forums/thread/${threadId}`);
    },

    onError: (error: any) => {
      toast({
        title: "Unable to update thread",
        description:
          error.message || "Failed to update thread.",
        variant: "destructive",
      });
    },
  });

  if (threadLoading || categoriesLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        <Skeleton className="h-5 w-32" />

        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-80" />
        </div>

        <Skeleton className="h-[520px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        <Link href="/forums">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground hover:text-foreground"
            data-testid="button-back-forums"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Forums
          </Button>
        </Link>

        <Card className="border-dashed border-white/10 bg-transparent">
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-muted-foreground/30" />
            </div>

            <h3 className="font-semibold mb-1">
              Thread Not Found
            </h3>

            <p className="text-sm text-muted-foreground">
              This thread may have been deleted or is no longer available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        <Link href={`/forums/thread/${threadId}`}>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground hover:text-foreground"
            data-testid="button-back-thread"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Thread
          </Button>
        </Link>

        <Card className="border-dashed border-white/10 bg-transparent">
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-muted-foreground/30" />
            </div>

            <h3 className="font-semibold mb-1">
              Access Denied
            </h3>

            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              You don't have permission to edit this thread.
            </p>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="mt-5"
            >
              <Link href={`/forums/thread/${threadId}`}>
                Return to Thread
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-500">
        {/* Back navigation */}
        <Link href={`/forums/thread/${threadId}`}>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground hover:text-foreground mb-5"
            disabled={mutation.isPending}
            data-testid="button-back-thread"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Thread
          </Button>
        </Link>

        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
            <FileText className="w-3.5 h-3.5" />
            Community
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1
                className="text-3xl font-bold tracking-tight"
                data-testid="heading-edit-thread"
              >
                Edit Thread
              </h1>

              <p className="text-sm text-muted-foreground mt-1.5">
                Update the title, category, or content of your discussion.
              </p>
            </div>

            {isStaff && (
              <Badge
                variant="outline"
                className="hidden sm:flex items-center gap-1.5 shrink-0"
              >
                <Shield className="w-3 h-3" />
                Staff
              </Badge>
            )}
          </div>
        </div>

        {/* Editor */}
        <Card className="border-white/10 bg-[#0d0d0d] overflow-hidden shadow-sm">
          <CardContent className="p-5 sm:p-7">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) =>
                  mutation.mutate(data)
                )}
                className="space-y-7"
              >
                {/* Thread details */}
                <div className="flex items-center gap-3 pb-1">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold">
                      Discussion Details
                    </h2>

                    <p className="text-xs text-muted-foreground mt-0.5">
                      Make changes to your discussion below.
                    </p>
                  </div>
                </div>

                {/* Category */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>

                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!isStaff || mutation.isPending}
                      >
                        <FormControl>
                          <SelectTrigger
                            className="h-11 bg-white/[0.03] border-white/10"
                            data-testid="select-category"
                          >
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {categories?.map((cat) => (
                            <SelectItem
                              key={cat.id}
                              value={cat.id}
                            >
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {!isStaff && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <Lock className="w-3 h-3" />
                          <span>
                            Only staff can change the category.
                          </span>
                        </div>
                      )}

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>

                      <FormControl>
                        <Input
                          placeholder="Thread title"
                          className="h-12 bg-white/[0.03] border-white/10 text-base"
                          {...field}
                          disabled={mutation.isPending}
                          data-testid="input-title"
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Content */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-3">
                        <FormLabel>Content</FormLabel>

                        <span className="text-[11px] text-muted-foreground">
                          Markdown supported
                        </span>
                      </div>

                      <FormControl>
                        <Textarea
                          placeholder="Thread content..."
                          className="min-h-[260px] bg-white/[0.03] border-white/10 resize-y leading-relaxed"
                          {...field}
                          disabled={mutation.isPending}
                          data-testid="textarea-content"
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Editor information */}
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />

                    <div>
                      <p className="text-xs font-medium">
                        Editing this discussion
                      </p>

                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Your changes will replace the current title and
                        content. Existing replies, reactions, and thread
                        activity will remain intact.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <p className="hidden sm:block text-xs text-muted-foreground">
                    Changes are saved when you select Save Changes.
                  </p>

                  <div className="flex items-center gap-2 ml-auto">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        setLocation(`/forums/thread/${threadId}`)
                      }
                      disabled={mutation.isPending}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      disabled={mutation.isPending}
                      data-testid="button-save"
                    >
                      {mutation.isPending ? (
                        <>
                          <span className="mr-2 h-3.5 w-3.5 rounded-full border-2 border-current border-r-transparent animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}