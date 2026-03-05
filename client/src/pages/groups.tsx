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
import type { Groups, User } from "@shared/schema";

const createGroupSchema = z.object({
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

type CreateGroupForm = z.infer<typeof createGroupSchema>;

interface GroupWithOwner extends Groups {
  owner?: User;
}

export default function Groups() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: groups, isLoading } = useQuery<GroupWithOwner[]>({
    queryKey: ["/api/groups"],
  });

  const form = useForm<CreateGroupForm>({
    resolver: zodResolver(createGroupSchema),
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
    mutationFn: async (data: CreateGroupForm) => {
      const response = await apiRequest("POST", "/api/groups", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Group created!",
        description: "Your group is now live.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setIsCreateOpen(false);
      form.reset();
    },
    // Ensure an error code is returned from the API to handle specific cases like duplicate name/tag errors - this is just a placeholder for now and should be replaced with actual error handling based on the API response code and message. For example, if the API returns a 409 status code with a message "Group name already exists", we should show a toast with that message. If the API returns a 409 status code with a message "Group tag already exists", we should show a toast with that message. If the API returns a 400 status code with a message "Invalid group data", we should show a toast with that message. If the API returns a 500 status code with a message "Internal server error", we should show a toast with that message. If the API returns a 401 status code with a message "Unauthorized", we should show a toast with that message. If the API returns a 403 status code with a message "Forbidden", we should show a toast with that message. If the API returns a 404 status code with a message "Not found", we should show a toast with that message. If the API returns a 429 status code with a message "Too many requests", we should show a toast with that message. If the API returns a 503 status code with a message "Service unavailable", we should show a toast with that message. If the API returns a 504 status code with a message "Gateway timeout", we should show a toast with that message. If the API returns a 502 status code with a message "Bad gateway", we should show a toast with that message.
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create group.",
        variant: "destructive",
      });
    },
  });

  const joinMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const response = await apiRequest(
        "POST",
        `/api/groups/${groupId}/join`,
        {},
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request sent!",
        description: "Your join request has been sent.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send join request.",
        variant: "destructive",
      });
    },
  });

  const filteredGroups = groups?.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.tag.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const onSubmit = (data: CreateGroupForm) => {
    createMutation.mutate(data);
  };

  const canCreateGroup =
    user?.vipTier === "none" ||
    user?.vipTier === "Bronze VIP" ||
    user?.vipTier === "Diamond VIP" ||
    user?.vipTier === "Founders Edition VIP" ||
    user?.vipTier === "Lifetime";

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Group Hubs
          </h1>
          <p className="text-muted-foreground mt-1">
            Find and join Project Catalina groups.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={!canCreateGroup && !user?.groupId}
              data-testid="button-create-clan"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Your Catalina Group</DialogTitle>
              <DialogDescription>
                Build your Project Catalina faction
              </DialogDescription>
            </DialogHeader>
            {canCreateGroup ? (
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
                          <FormLabel>Group Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Catalina Car Spotters"
                              {...field}
                              data-testid="input-group-name"
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
                              placeholder="CAR"
                              maxLength={6}
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.value.toUpperCase())
                              }
                              data-testid="input-group-tag"
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
                            placeholder="What do the Catalina Car Spotters do..."
                            className="resize-none"
                            {...field}
                            data-testid="input-group-description"
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
                              placeholder="Project Catalina"
                              {...field}
                              data-testid="input-group-game"
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
                              data-testid="input-group-discord"
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
                            data-testid="input-group-requirements"
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
                    data-testid="button-submit-group"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Group"}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="text-center py-6">
                <Crown className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">
                  Anyone can create a group without VIP!
                </h3>
                <p className="text-muted-foreground mb-4">
                  Group creation no longer requires a membership as of January
                  20th, 2026!!
                </p>
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
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-group-search"
            />
          </div>
        </CardContent>
      </Card>

      {/* Your Group Banner */}
      {user?.groupId && (
        <Card className="bg-gradient-to-r from-primary/10 to-chart-3/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Your Group</h3>
                  <p className="text-muted-foreground">
                    Role: {user.groupRole || "Member"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/groups/${user.groupId}/chat`}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Group Chat
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/groups/${user.groupId}`}>View Group</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Groups Grid */}
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
        ) : filteredGroups && filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <Card
              key={group.id}
              className="hover-elevate"
              data-testid={`card-group-${group.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {group.name}
                        <Badge variant="outline" className="text-xs">
                          [{group.tag}]
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="w-5 h-5">
                          <AvatarImage
                            src={group.owner?.profileImageUrl || undefined}
                          />
                          <AvatarFallback className="text-[10px]">
                            {group.owner?.username?.[0]?.toUpperCase() || "O"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          {group.owner?.username || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {group.isRecruiting && (
                    <Badge className="bg-green-500/10 text-green-500 border-0">
                      Recruiting
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {group.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Users className="w-3 h-3" />
                    {group.memberCount}/{group.maxMembers}
                  </Badge>
                  {group.primaryGame && (
                    <Badge variant="outline" className="gap-1">
                      <Gamepad2 className="w-3 h-3" />
                      {group.primaryGame}
                    </Badge>
                  )}
                  {group.discordInvite && (
                    <Badge variant="outline" className="gap-1">
                      <SiDiscord className="w-3 h-3" />
                      Discord
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/groups/${group.id}`}>View Details</Link>
                  </Button>
                  {group.isRecruiting &&
                    group.ownerId !== user?.id &&
                    user?.groupId !== group.id && (
                      <Button
                        size="sm"
                        onClick={() => joinMutation.mutate(group.id)}
                        disabled={joinMutation.isPending}
                        data-testid={`button-join-group-${group.id}`}
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
              <h3 className="font-semibold mb-2">No Groups Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Be the first to create a group!"}
              </p>
              {canCreateGroup && (
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
