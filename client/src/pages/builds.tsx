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
  Swords,
  Plus,
  Search,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Star,
  Gamepad2,
  Filter,
} from "lucide-react";
import type { Build, User } from "@shared/schema";

const games = [
  "Roblox",
  "Fortnite",
  "Valorant",
  "Apex Legends",
  "Call of Duty",
  "League of Legends",
  "Overwatch 2",
  "Other",
];

const categories = [
  "PvP Build",
  "PvE Build",
  "Speedrun",
  "Meta Guide",
  "Loadout",
  "Strategy",
  "Other",
];

const createBuildSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().max(300).optional(),
  game: z.string().min(1, "Please select a game"),
  character: z.string().optional(),
  category: z.string().optional(),
  content: z.string().min(50, "Content must be at least 50 characters"),
});

type CreateBuildForm = z.infer<typeof createBuildSchema>;

interface BuildWithAuthor extends Build {
  author?: User;
  userVote?: boolean | null;
}

export default function Builds() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGame, setFilterGame] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const { data: builds, isLoading } = useQuery<BuildWithAuthor[]>({
    queryKey: ["/api/builds"],
  });

  const form = useForm<CreateBuildForm>({
    resolver: zodResolver(createBuildSchema),
    defaultValues: {
      title: "",
      description: "",
      game: "",
      character: "",
      category: "",
      content: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateBuildForm) => {
      const response = await apiRequest("POST", "/api/builds", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Build shared!", description: "Your build is now live for the community." });
      queryClient.invalidateQueries({ queryKey: ["/api/builds"] });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create build.", variant: "destructive" });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ buildId, isUpvote }: { buildId: string; isUpvote: boolean }) => {
      const response = await apiRequest("POST", `/api/builds/${buildId}/vote`, { isUpvote });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/builds"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to vote.", variant: "destructive" });
    },
  });

  const filteredBuilds = builds?.filter((build) => {
    const matchesSearch = build.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      build.game.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame = filterGame === "all" || build.game === filterGame;
    const matchesCategory = filterCategory === "all" || build.category === filterCategory;
    return matchesSearch && matchesGame && matchesCategory;
  });

  const onSubmit = (data: CreateBuildForm) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Builds & Meta</h1>
          <p className="text-muted-foreground mt-1">Share and discover game strategies</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-build">
              <Plus className="w-4 h-4 mr-2" />
              Share Build
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Share Your Build</DialogTitle>
              <DialogDescription>Help the community with your strategies</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Ultimate DPS Build for..." {...field} data-testid="input-build-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Quick summary of your build..." {...field} data-testid="input-build-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="game"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Game</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-build-game">
                              <SelectValue placeholder="Select game" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {games.map((game) => (
                              <SelectItem key={game} value={game}>{game}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="character"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Character/Class</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Warrior" {...field} data-testid="input-build-character" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-build-category">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Build Details</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Explain your build in detail... Include items, skills, stats, rotation, tips, etc."
                          className="min-h-[200px]"
                          {...field}
                          data-testid="input-build-content"
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
                  data-testid="button-submit-build"
                >
                  {createMutation.isPending ? "Sharing..." : "Share Build"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search builds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-build-search"
              />
            </div>
            <Select value={filterGame} onValueChange={setFilterGame}>
              <SelectTrigger className="w-full sm:w-40" data-testid="filter-build-game">
                <Gamepad2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Games" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                {games.map((game) => (
                  <SelectItem key={game} value={game}>{game}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-40" data-testid="filter-build-category">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Builds Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </>
        ) : filteredBuilds && filteredBuilds.length > 0 ? (
          filteredBuilds.map((build) => (
            <Card key={build.id} className="hover-elevate" data-testid={`card-build-${build.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">{build.game}</Badge>
                      {build.category && (
                        <Badge variant="outline">{build.category}</Badge>
                      )}
                      {build.isFeatured && (
                        <Badge className="bg-yellow-500/10 text-yellow-500 border-0 gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base line-clamp-2">{build.title}</CardTitle>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={build.author?.profileImageUrl || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {build.author?.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {build.author?.username || 'Anonymous'}
                  </span>
                  {build.author?.vipTier && build.author.vipTier !== 'none' && (
                    <VipBadge tier={build.author.vipTier as any} size="sm" showLabel={false} />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {build.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{build.description}</p>
                )}
                
                {build.character && (
                  <Badge variant="outline" className="gap-1">
                    <Swords className="w-3 h-3" />
                    {build.character}
                  </Badge>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <button 
                      className={`flex items-center gap-1 text-sm ${build.userVote === true ? 'text-green-500' : 'text-muted-foreground'} hover:text-green-500 transition-colors`}
                      onClick={() => voteMutation.mutate({ buildId: build.id, isUpvote: true })}
                      data-testid={`button-upvote-${build.id}`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {build.upvotes}
                    </button>
                    <button 
                      className={`flex items-center gap-1 text-sm ${build.userVote === false ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500 transition-colors`}
                      onClick={() => voteMutation.mutate({ buildId: build.id, isUpvote: false })}
                      data-testid={`button-downvote-${build.id}`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      {build.downvotes}
                    </button>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      {build.viewCount}
                    </span>
                  </div>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/builds/${build.id}`}>View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full border-dashed">
            <CardContent className="p-12 text-center">
              <Swords className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No Builds Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterGame || filterCategory 
                  ? "Try adjusting your filters"
                  : "Be the first to share a build!"}
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Share Build
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
