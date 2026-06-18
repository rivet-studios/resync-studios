import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation, useRoute, Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertForumThreadSchema, type ForumCategory, type ForumThread, type User } from "@shared/schema";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface ThreadDetail extends ForumThread {
  author?: User;
  category?: ForumCategory;
}

const staffRanks = [
  "Trial Moderator", "Moderator", "Administrator", "Senior Administrator",
  "Developer", "Staff Internal Affairs", "Team Member", "Staff Department Director",
  "Operations Manager", "Company Director",
];

function isStaffUser(user: any): boolean {
  return user?.isAdmin || user?.isModerator ||
    staffRanks.includes(user?.userRank) ||
    (user?.additionalRanks || []).some((r: string) => staffRanks.includes(r));
}

const editFormSchema = insertForumThreadSchema
  .omit({ authorId: true, isPinned: true, isLocked: true, viewCount: true, replyCount: true, upvotes: true, lastReplyAt: true })
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

  const { data: thread, isLoading: threadLoading } = useQuery<ThreadDetail>({
    queryKey: ["/api/forums/threads", threadId],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<ForumCategory[]>({
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
    values: thread ? {
      title: thread.title,
      content: thread.content,
      categoryId: thread.categoryId,
    } : undefined,
  });

  const mutation = useMutation({
    mutationFn: async (values: EditFormValues) => {
      const res = await apiRequest("PATCH", `/api/forums/threads/${threadId}`, values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forums/threads", threadId] });
      queryClient.invalidateQueries({ queryKey: ["/api/forums/threads"] });
      toast({
        title: "Thread Updated",
        description: "Your changes have been saved successfully.",
      });
      setLocation(`/forums/thread/${threadId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message || "Failed to update thread.",
      });
    },
  });

  if (threadLoading || categoriesLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <Link href="/forums">
          <Button variant="ghost" size="sm" data-testid="button-back-forums">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forums
          </Button>
        </Link>
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <h3 className="font-semibold mb-2">Thread Not Found</h3>
            <p className="text-muted-foreground">This thread may have been deleted.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <Link href={`/forums/thread/${threadId}`}>
          <Button variant="ghost" size="sm" data-testid="button-back-thread">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Thread
          </Button>
        </Link>
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <h3 className="font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to edit this thread.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <Link href={`/forums/thread/${threadId}`}>
          <Button variant="ghost" size="sm" data-testid="button-back-thread">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Thread
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold" data-testid="heading-edit-thread">Edit Thread</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!isStaff}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!isStaff && (
                        <p className="text-xs text-muted-foreground">Only staff can change the category.</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Thread title"
                          {...field}
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Thread content..."
                          className="min-h-[200px] resize-none"
                          {...field}
                          data-testid="textarea-content"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setLocation(`/forums/thread/${threadId}`)}
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
                    {mutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
