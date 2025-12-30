import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { MessageSquare, Plus, Search, MessageCircle } from "lucide-react";
import type { ForumCategory, ForumThread, User } from "@shared/schema";

const createThreadSchema = z.object({
  categoryId: z.string().min(1, "Please select a category"),
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  content: z.string().min(20, "Content must be at least 20 characters"),
});

type CreateThreadForm = z.infer<typeof createThreadSchema>;

interface ThreadWithAuthor extends ForumThread {
  locked: any;
  pinned: any;
  author?: User;
  category?: ForumCategory;
}

export default function Forums() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: categories, isLoading: categoriesLoading } = useQuery<
    ForumCategory[]
  >({
    queryKey: ["/api/forums/categories"],
  });

  const { data: threads, isLoading: threadsLoading } = useQuery<
    ThreadWithAuthor[]
  >({
    queryKey: ["/api/forums/threads", selectedCategory],
  });

  const form = useForm<CreateThreadForm>({
    resolver: zodResolver(createThreadSchema),
    defaultValues: {
      categoryId: "",
      title: "",
      content: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateThreadForm) => {
      const response = await apiRequest("POST", "/api/forums/threads", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thread created!",
        description: "Your discussion has been posted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forums/threads"] });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create thread.",
        variant: "destructive",
      });
    },
  });

  const filteredThreads = threads?.filter((thread) =>
    thread.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const onSubmit = (data: CreateThreadForm) => {
    createMutation.mutate(data);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Forums</h1>
            <p className="text-muted-foreground mt-2">
              Connect with our community and get support
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-thread">
                <Plus className="w-4 h-4 mr-2" />
                New Thread
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Discussion Thread</DialogTitle>
                <DialogDescription>
                  Start a new discussion with the community
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
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
                            placeholder="Thread title..."
                            {...field}
                            data-testid="input-thread-title"
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
                            placeholder="Write your message..."
                            rows={6}
                            {...field}
                            data-testid="textarea-thread-content"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      data-testid="button-post-thread"
                    >
                      {createMutation.isPending ? "Posting..." : "Post Thread"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-forum-search"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Forums Grid */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar - Categories */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={selectedCategory === "" ? "default" : "ghost"}
                className="w-full justify-start text-sm"
                onClick={() => setSelectedCategory("")}
                data-testid="filter-all-categories"
              >
                All Categories
              </Button>
              {categoriesLoading ? (
                <>
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </>
              ) : (
                categories?.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    data-testid={`filter-category-${cat.id}`}
                  >
                    {cat.name}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {threads?.filter((t) => t.categoryId === cat.id).length ||
                        0}
                    </span>
                  </Button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Threads */}
        <div className="lg:col-span-3 space-y-3">
          {threadsLoading ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : filteredThreads?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">
                  No discussions yet. Be the first to start one!
                </p>
                <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                  Create Thread
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredThreads?.map((thread) => (
              <Card
                key={thread.id}
                className="hover:border-primary/50 transition-colors cursor-pointer overflow-hidden"
              >
                <Link href={`/forums/thread/${thread.id}`} className="block">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex gap-3">
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarImage
                          src={thread.author?.profileImageUrl || undefined}
                        />
                        <AvatarFallback>
                          {thread.author?.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <h3 className="font-semibold truncate text-sm">
                            {thread.title}
                          </h3>
                          {thread.pinned && (
                            <Badge variant="secondary" className="text-xs">
                              Pinned
                            </Badge>
                          )}
                          {thread.locked && (
                            <Badge variant="secondary" className="text-xs">
                              Locked
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>
                            Started by {thread.author?.username || "Anonymous"}
                          </span>
                          <span>•</span>
                          <span>
                            {formatTimeAgo(new Date(thread.createdAt))}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground ml-13">
                      <span className="font-medium">
                        {thread.content ? `${thread.content.substring(0, 100)}...` : ""}
                      </span>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {thread.replyCount || 0}
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
