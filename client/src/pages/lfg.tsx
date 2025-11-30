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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Target,
  Plus,
  Users,
  Clock,
  MapPin,
  Gamepad2,
  Filter,
  Search,
  UserPlus,
} from "lucide-react";
import type { LfgPost, User } from "@shared/schema";

const games = [
  "Roblox",
  "Fortnite",
  "Valorant",
  "Apex Legends",
  "Call of Duty",
  "Minecraft",
  "League of Legends",
  "Overwatch 2",
  "CS2",
  "Other",
];

const platforms = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile", "Cross-platform"];
const regions = ["NA East", "NA West", "EU West", "EU East", "Asia", "Oceania", "South America"];
const skillLevels = ["beginner", "intermediate", "advanced", "expert", "pro"];
const roles = ["tank", "dps", "support", "healer", "flex", "any"];

const createLfgSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().optional(),
  game: z.string().min(1, "Please select a game"),
  platform: z.string().min(1, "Please select a platform"),
  region: z.string().optional(),
  skillLevel: z.enum(["beginner", "intermediate", "advanced", "expert", "pro"]),
  roleNeeded: z.enum(["tank", "dps", "support", "healer", "flex", "any"]),
  playersNeeded: z.number().min(1).max(100),
});

type CreateLfgForm = z.infer<typeof createLfgSchema>;

interface LfgPostWithAuthor extends LfgPost {
  author?: User;
}

export default function LFG() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGame, setFilterGame] = useState<string>("all");
  const [filterSkill, setFilterSkill] = useState<string>("all");

  const { data: lfgPosts, isLoading } = useQuery<LfgPostWithAuthor[]>({
    queryKey: ["/api/lfg"],
  });

  const form = useForm<CreateLfgForm>({
    resolver: zodResolver(createLfgSchema),
    defaultValues: {
      title: "",
      description: "",
      game: "",
      platform: "",
      region: "",
      skillLevel: "intermediate",
      roleNeeded: "any",
      playersNeeded: 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateLfgForm) => {
      const response = await apiRequest("POST", "/api/lfg", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "LFG post created!", description: "Players can now join your group." });
      queryClient.invalidateQueries({ queryKey: ["/api/lfg"] });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create LFG post.", variant: "destructive" });
    },
  });

  const joinMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest("POST", `/api/lfg/${postId}/join`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Joined!", description: "You've joined the group." });
      queryClient.invalidateQueries({ queryKey: ["/api/lfg"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to join group.", variant: "destructive" });
    },
  });

  const filteredPosts = lfgPosts?.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.game.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame = filterGame === "all" || post.game === filterGame;
    const matchesSkill = filterSkill === "all" || post.skillLevel === filterSkill;
    return matchesSearch && matchesGame && matchesSkill;
  });

  const onSubmit = (data: CreateLfgForm) => {
    createMutation.mutate(data);
  };

  const getSkillColor = (skill: string) => {
    switch (skill) {
      case 'beginner': return 'bg-green-500/10 text-green-500';
      case 'intermediate': return 'bg-blue-500/10 text-blue-500';
      case 'advanced': return 'bg-purple-500/10 text-purple-500';
      case 'expert': return 'bg-orange-500/10 text-orange-500';
      case 'pro': return 'bg-red-500/10 text-red-500';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">LFG Matchmaking</h1>
          <p className="text-muted-foreground mt-1">Find teammates and join groups</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-lfg">
              <Plus className="w-4 h-4 mr-2" />
              Create LFG Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create LFG Post</DialogTitle>
              <DialogDescription>Find players to join your group</DialogDescription>
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
                        <Input placeholder="Looking for Ranked Players..." {...field} data-testid="input-lfg-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="game"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Game</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-lfg-game">
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
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-lfg-platform">
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {platforms.map((platform) => (
                              <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="skillLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skill Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-lfg-skill">
                              <SelectValue placeholder="Select skill" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {skillLevels.map((skill) => (
                              <SelectItem key={skill} value={skill} className="capitalize">{skill}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="roleNeeded"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role Needed</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-lfg-role">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role} value={role} className="capitalize">{role}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-lfg-region">
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regions.map((region) => (
                              <SelectItem key={region} value={region}>{region}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="playersNeeded"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Players Needed</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            max={100}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            data-testid="input-lfg-players"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell players more about your group..."
                          className="resize-none"
                          {...field}
                          data-testid="input-lfg-description"
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
                  data-testid="button-submit-lfg"
                >
                  {createMutation.isPending ? "Creating..." : "Create Post"}
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
                placeholder="Search LFG posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-lfg-search"
              />
            </div>
            <Select value={filterGame} onValueChange={setFilterGame}>
              <SelectTrigger className="w-full sm:w-40" data-testid="filter-lfg-game">
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
            <Select value={filterSkill} onValueChange={setFilterSkill}>
              <SelectTrigger className="w-full sm:w-40" data-testid="filter-lfg-skill">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Skills" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {skillLevels.map((skill) => (
                  <SelectItem key={skill} value={skill} className="capitalize">{skill}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* LFG Posts Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </>
        ) : filteredPosts && filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <Card key={post.id} className="hover-elevate" data-testid={`card-lfg-${post.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.author?.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {post.author?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{post.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {post.author?.username || 'Anonymous'}
                        </span>
                        {post.author?.vipTier && post.author.vipTier !== 'none' && (
                          <VipBadge tier={post.author.vipTier as any} size="sm" showLabel={false} />
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">{post.game}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {post.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.description}</p>
                )}
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Gamepad2 className="w-3 h-3" />
                    {post.platform}
                  </Badge>
                  {post.region && (
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="w-3 h-3" />
                      {post.region}
                    </Badge>
                  )}
                  <Badge className={`${getSkillColor(post.skillLevel || 'intermediate')} border-0 capitalize`}>
                    {post.skillLevel}
                  </Badge>
                  {post.roleNeeded !== 'any' && (
                    <Badge variant="outline" className="capitalize">{post.roleNeeded}</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {post.playersJoined}/{post.playersNeeded}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(post.createdAt!).toLocaleDateString()}
                    </span>
                  </div>
                  <Button 
                    size="sm"
                    disabled={post.authorId === user?.id || (post.playersJoined || 0) >= (post.playersNeeded || 1)}
                    onClick={() => joinMutation.mutate(post.id)}
                    data-testid={`button-join-${post.id}`}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    {post.authorId === user?.id ? 'Your Post' : 'Join'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-2 border-dashed">
            <CardContent className="p-12 text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No LFG Posts Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterGame || filterSkill 
                  ? "Try adjusting your filters"
                  : "Be the first to create an LFG post!"}
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create LFG Post
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
