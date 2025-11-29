import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VipBadge } from "@/components/vip-badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import {
  User,
  Link as LinkIcon,
  CreditCard,
  Bell,
  Shield,
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertCircle,
  Crown,
} from "lucide-react";
import { SiDiscord, SiRoblox } from "react-icons/si";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30).optional(),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  
  const params = new URLSearchParams(window.location.search);
  const initialTab = params.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const newParams = new URLSearchParams(window.location.search);
    const tab = newParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [location]);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      bio: user?.bio || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const response = await apiRequest("PATCH", "/api/users/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Profile updated!", description: "Your changes have been saved." });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    },
  });

  const linkDiscordMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/discord/link", {});
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to start Discord linking.", variant: "destructive" });
    },
  });

  const unlinkDiscordMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/discord/unlink", {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Discord unlinked", description: "Your Discord account has been disconnected." });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to unlink Discord.", variant: "destructive" });
    },
  });

  const verifyRobloxMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await apiRequest("POST", "/api/roblox/verify", { username });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Verification started", description: "Please complete the verification in Roblox." });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to start Roblox verification.", variant: "destructive" });
    },
  });

  const unlinkRobloxMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/roblox/unlink", {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Roblox unlinked", description: "Your Roblox account has been disconnected." });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to unlink Roblox.", variant: "destructive" });
    },
  });

  const onSubmitProfile = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const [robloxUsername, setRobloxUsername] = useState("");

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="gap-2" data-testid="tab-profile">
            <User className="w-4 h-4 hidden sm:block" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="connections" className="gap-2" data-testid="tab-connections">
            <LinkIcon className="w-4 h-4 hidden sm:block" />
            Connections
          </TabsTrigger>
          <TabsTrigger value="subscription" className="gap-2" data-testid="tab-subscription">
            <CreditCard className="w-4 h-4 hidden sm:block" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2" data-testid="tab-notifications">
            <Bell className="w-4 h-4 hidden sm:block" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage 
                    src={user?.profileImageUrl || undefined} 
                    className="object-cover"
                  />
                  <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Profile Photo</p>
                  <p className="text-sm text-muted-foreground">
                    Your profile photo is managed by your login provider
                  </p>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="your_username" {...field} data-testid="input-settings-username" />
                        </FormControl>
                        <FormDescription>
                          This is your public display name. It must be unique.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell others about yourself..."
                            className="resize-none"
                            {...field}
                            data-testid="input-settings-bio"
                          />
                        </FormControl>
                        <FormDescription>
                          A short description that appears on your profile.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>
                Link your gaming accounts to unlock features and sync data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Discord Connection */}
              <div className="flex items-start justify-between p-4 rounded-lg border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#5865F2]/10 flex items-center justify-center">
                    <SiDiscord className="w-6 h-6 text-[#5865F2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">Discord</h4>
                      {user?.discordId ? (
                        <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-500">
                          <CheckCircle className="w-3 h-3" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <XCircle className="w-3 h-3" />
                          Not Connected
                        </Badge>
                      )}
                    </div>
                    {user?.discordId ? (
                      <p className="text-sm text-muted-foreground mt-1">
                        Connected as <span className="font-medium">{user.discordUsername}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        Connect your Discord to access the full server and receive VIP roles automatically.
                      </p>
                    )}
                  </div>
                </div>
                {user?.discordId ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => unlinkDiscordMutation.mutate()}
                    disabled={unlinkDiscordMutation.isPending}
                    data-testid="button-unlink-discord"
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button 
                    size="sm"
                    onClick={() => linkDiscordMutation.mutate()}
                    disabled={linkDiscordMutation.isPending}
                    data-testid="button-link-discord"
                  >
                    Connect
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>

              {/* Roblox Connection */}
              <div className="flex items-start justify-between p-4 rounded-lg border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <SiRoblox className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">Roblox</h4>
                      {user?.robloxId ? (
                        <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-500">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <XCircle className="w-3 h-3" />
                          Not Verified
                        </Badge>
                      )}
                    </div>
                    {user?.robloxId ? (
                      <p className="text-sm text-muted-foreground mt-1">
                        Verified as <span className="font-medium">{user.robloxDisplayName || user.robloxUsername}</span>
                      </p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Verify your Roblox account to receive in-game VIP perks.
                        </p>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Your Roblox username"
                            value={robloxUsername}
                            onChange={(e) => setRobloxUsername(e.target.value)}
                            className="max-w-xs"
                            data-testid="input-roblox-username"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {user?.robloxId ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => unlinkRobloxMutation.mutate()}
                    disabled={unlinkRobloxMutation.isPending}
                    data-testid="button-unlink-roblox"
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button 
                    size="sm"
                    onClick={() => verifyRobloxMutation.mutate(robloxUsername)}
                    disabled={!robloxUsername || verifyRobloxMutation.isPending}
                    data-testid="button-verify-roblox"
                  >
                    Verify
                  </Button>
                )}
              </div>

              {/* VIP Role Sync Info */}
              {user?.vipTier && user.vipTier !== 'none' && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm">VIP Role Sync</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your <VipBadge tier={user.vipTier as any} size="sm" /> status is automatically synced.
                        {user.discordId 
                          ? " Your Discord role is active." 
                          : " Connect Discord to receive your role."}
                        {user.robloxId 
                          ? " Your Roblox perks are active." 
                          : " Verify Roblox to receive in-game perks."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>VIP Subscription</CardTitle>
              <CardDescription>Manage your VIP membership</CardDescription>
            </CardHeader>
            <CardContent>
              {user?.vipTier && user.vipTier !== 'none' ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/10 to-chart-3/10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Crown className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Current Plan</h4>
                        <VipBadge tier={user.vipTier as any} />
                      </div>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href="/vip">Change Plan</Link>
                    </Button>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground">Next Billing Date</p>
                      <p className="font-semibold">December 29, 2025</p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-semibold">Visa ending in 4242</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline">Update Payment Method</Button>
                    <Button variant="outline" className="text-destructive">Cancel Subscription</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Crown className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No Active Subscription</h3>
                  <p className="text-muted-foreground mb-4">
                    Upgrade to VIP to unlock exclusive features and perks!
                  </p>
                  <Button asChild>
                    <Link href="/vip">View VIP Plans</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Notification settings coming soon</p>
                <p className="text-sm mt-1">
                  You'll be able to customize your notification preferences here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
