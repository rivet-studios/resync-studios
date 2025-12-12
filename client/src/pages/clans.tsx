import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
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
  Users,
  Plus,
  Search,
  Crown,
  UserPlus,
  Shield,
  Gamepad2,
  MessageSquare,
} from "lucide-react";
import { SiDiscord } from "react-icons/si";
import type { Clan, User } from "@shared/schema";

const createClanSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50),
  tag: z
    .string()
    .min(2, "Tag must be at least 2 characters")
    .max(6, "Tag must be 6 characters or less")
    .toUpperCase(),
  description: z.string().max(500).optional(),
  primaryGame: z.string().optional(),
  discordInvite: z.string().url().optional().or(z.literal("")),
  requirements: z.string().max(500).optional(),
});

type CreateClanForm = z.infer<typeof createClanSchema>;

interface ClanWithOwner extends Clan {
  owner?: User;
}

export default function Clans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: clans, isLoading } = useQuery<ClanWithOwner[]>({
    queryKey: ["/api/clans"],
  });

  const form = useForm<CreateClanForm>({
    resolver: zodResolver(createClanSchema),
    defaultValues: {
      name: "",
      tag: "",
      description: "",
      primaryGame: "",
      discordInvite: "",
      requirements: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateClanForm) => {
      const response = await apiRequest("POST", "/api/clans", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Clan created!", description: "Your clan is now live." });
      queryClient.invalidateQueries({ queryKey: ["/api/clans"] });
      setIsCreateOpen(false);
      form.reset();
    },
    // Ensure an error code is returned from the API to handle specific cases like duplicate name/tag errors - this is just a placeholder for now and should be replaced with actual error handling based on the API response code and message. For example, if the API returns a 409 status code with a message "Clan name already exists", we should show a toast with that message. If the API returns a 409 status code with a message "Clan tag already exists", we should show a toast with that message. If the API returns a 400 status code with a message "Invalid clan data", we should show a toast with that message. If the API returns a 500 status code with a message "Internal server error", we should show a toast with that message. If the API returns a 401 status code with a message "Unauthorized", we should show a toast with that message. If the API returns a 403 status code with a message "Forbidden", we should show a toast with that message. If the API returns a 404 status code with a message "Not found", we should show a toast with that message. If the API returns a 429 status code with a message "Too many requests", we should show a toast with that message. If the API returns a 503 status code with a message "Service unavailable", we should show a toast with that message. If the API returns a 504 status code with a message "Gateway timeout", we should show a toast with that message. If the API returns a 502 status code with a message "Bad gateway", we should show a toast with that message.
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create clan.",
        variant: "destructive",
      });
    },
  });

  const joinMutation = useMutation({
    mutationFn: async (clanId: string) => {
      const response = await apiRequest(
        "POST",
        `/api/clans/${clanId}/join`,
        {},
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request sent!",
        description: "Your join request has been sent.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/clans"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send join request.",
        variant: "destructive",
      });
    },
  });

  const filteredClans = clans?.filter(
    (clan) =>
      clan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clan.tag.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const onSubmit = (data: CreateClanForm) => {
    createMutation.mutate(data);
  };

  const canCreateClan = user?.vipTier === "none" || user?.vipTier === "any";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Clan Hubs
          </h1>
          <p className="text-muted-foreground mt-1">
            Find and join gaming communities
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={!canCreateClan && !user?.clanId}
              data-testid="button-create-clan"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Clan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Your Clan</DialogTitle>
              <DialogDescription>Build your gaming community</DialogDescription>
            </DialogHeader>
            {canCreateClan ? (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Clan Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Epic Gamers"
                              {...field}
                              data-testid="input-clan-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tag"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tag</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="EPIC"
                              maxLength={6}
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.value.toUpperCase())
                              }
                              data-testid="input-clan-tag"
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell others about your clan..."
                            className="resize-none"
                            {...field}
                            data-testid="input-clan-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryGame"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Game</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Roblox"
                              {...field}
                              data-testid="input-clan-game"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="discordInvite"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discord Invite</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://discord.gg/..."
                              {...field}
                              data-testid="input-clan-discord"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requirements (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any requirements to join..."
                            className="resize-none"
                            {...field}
                            data-testid="input-clan-requirements"
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
                    data-testid="button-submit-clan"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Clan"}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="text-center py-6">
                <Crown className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">VIP Required</h3>
                <p className="text-muted-foreground mb-4">
                  You need Diamond VIP or higher to create a clan.
                </p>
                <Button asChild>
                  <Link href="/vip">Upgrade to VIP</Link>
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-clan-search"
            />
          </div>
        </CardContent>
      </Card>

      {/* Your Clan Banner */}
      {user?.clanId && (
        <Card className="bg-gradient-to-r from-primary/10 to-chart-3/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Your Clan</h3>
                  <p className="text-muted-foreground">
                    Role: {user.clanRole || "Member"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/clans/${user.clanId}/chat`}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Clan Chat
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/clans/${user.clanId}`}>View Clan</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clans Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </>
        ) : filteredClans && filteredClans.length > 0 ? (
          filteredClans.map((clan) => (
            <Card
              key={clan.id}
              className="hover-elevate"
              data-testid={`card-clan-${clan.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {clan.name}
                        <Badge variant="outline" className="text-xs">
                          [{clan.tag}]
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="w-5 h-5">
                          <AvatarImage
                            src={clan.owner?.profileImageUrl || undefined}
                          />
                          <AvatarFallback className="text-[10px]">
                            {clan.owner?.username?.[0]?.toUpperCase() || "O"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          {clan.owner?.username || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {clan.isRecruiting && (
                    <Badge className="bg-green-500/10 text-green-500 border-0">
                      Recruiting
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {clan.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {clan.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Users className="w-3 h-3" />
                    {clan.memberCount}/{clan.maxMembers}
                  </Badge>
                  {clan.primaryGame && (
                    <Badge variant="outline" className="gap-1">
                      <Gamepad2 className="w-3 h-3" />
                      {clan.primaryGame}
                    </Badge>
                  )}
                  {clan.discordInvite && (
                    <Badge variant="outline" className="gap-1">
                      <SiDiscord className="w-3 h-3" />
                      Discord
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/clans/${clan.id}`}>View Details</Link>
                  </Button>
                  {clan.isRecruiting &&
                    clan.ownerId !== user?.id &&
                    user?.clanId !== clan.id && (
                      <Button
                        size="sm"
                        onClick={() => joinMutation.mutate(clan.id)}
                        disabled={joinMutation.isPending}
                        data-testid={`button-join-clan-${clan.id}`}
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Join
                      </Button>
                    )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full border-dashed">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No Clans Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Be the first to create a clan!"}
              </p>
              {canCreateClan && (
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Clan
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
