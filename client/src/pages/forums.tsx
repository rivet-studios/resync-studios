import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { VipBadge } from "@/components/vip-badge";
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
import {
  MessageSquare,
  Plus,
  Search,
  Eye,
  MessagesSquare,
  Pin,
  Lock,
  ThumbsUp,
  Clock,
} from "lucide-react";
import type { ForumCategory, ForumThread, User } from "@shared/schema";

const createThreadSchema = z.object({
  categoryId: z.string().min(1, "Please select a category"),
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  content: z.string().min(20, "Content must be at least 20 characters"),
});

type CreateThreadForm = z.infer<typeof createThreadSchema>;

interface ThreadWithAuthor extends ForumThread {
  author?: User;
  category?: ForumCategory;
}

export default function Forums() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: categories, isLoading: categoriesLoading } = useQuery<ForumCategory[]>({
    queryKey: ["/api/forums/categories"],
  });

  const { data: threads, isLoading: threadsLoading } = useQuery<ThreadWithAuthor[]>({
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
      toast({ title: "Thread created!", description: "Your discussion has been posted." });
      queryClient.invalidateQueries({ queryKey: ["/api/forums/threads"] });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create thread.", variant: "destructive" });
    },
  });

  const filteredThreads = threads?.filter((thread) =>
    thread.title.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Community Forums</h1>
          <p className="text-muted-foreground mt-1">Discuss, share, and connect</p>
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
              <DialogTitle>Create New Thread</DialogTitle>
              <DialogDescription>Start a new discussion</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-thread-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
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
                        <Input placeholder="What's your discussion about?" {...field} data-testid="input-thread-title" />
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
                          placeholder="Write your post here..."
                          className="min-h-[200px]"
                          {...field}
                          data-testid="input-thread-content"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createMutation.isPending}
                  data-testid="button-submit-thread"
                >
                  {createMutation.isPending ? "Creating..." : "Create Thread"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <Button
                variant={selectedCategory === "" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedCategory("")}
                data-testid="button-category-all"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                All Discussions
              </Button>
              {categoriesLoading ? (
                <>
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </>
              ) : (
                categories?.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.id)}
                    data-testid={`button-category-${category.id}`}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {category.name}
                    {category.threadCount > 0 && (
                      <Badge variant="outline" className="ml-auto">
                        {category.threadCount}
                      </Badge>
                    )}
                  </Button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Threads List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search threads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-thread-search"
                />
              </div>
            </CardContent>
          </Card>

          {/* Threads */}
          {threadsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : filteredThreads && filteredThreads.length > 0 ? (
            <div className="space-y-3">
              {filteredThreads.map((thread) => (
                <Card key={thread.id} className="hover-elevate" data-testid={`card-thread-${thread.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10 hidden sm:flex">
                        <AvatarImage src={thread.author?.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {thread.author?.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {thread.isPinned && (
                            <Badge variant="secondary" className="gap-1">
                              <Pin className="w-3 h-3" />
                              Pinned
                            </Badge>
                          )}
                          {thread.isLocked && (
                            <Badge variant="outline" className="gap-1">
                              <Lock className="w-3 h-3" />
                              Locked
                            </Badge>
                          )}
                          {thread.category && (
                            <Badge variant="outline">{thread.category.name}</Badge>
                          )}
                        </div>
                        <Link href={`/forums/thread/${thread.id}`}>
                          <h3 className="font-semibold text-base hover:text-primary transition-colors line-clamp-1">
                            {thread.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <Avatar className="w-5 h-5 sm:hidden">
                              <AvatarImage src={thread.author?.profileImageUrl || undefined} />
                              <AvatarFallback className="text-[10px]">
                                {thread.author?.username?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span>{thread.author?.username || 'Anonymous'}</span>
                            {thread.author?.vipTier && thread.author.vipTier !== 'none' && (
                              <VipBadge tier={thread.author.vipTier as any} size="sm" showLabel={false} />
                            )}
                          </div>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {thread.viewCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessagesSquare className="w-4 h-4" />
                            {thread.replyCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            {thread.upvotes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTimeAgo(thread.createdAt!)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Threads Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Try adjusting your search" : "Start the first discussion!"}
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Thread
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
