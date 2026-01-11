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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Palette,
  Download,
  Package,
  Gift,
  Lock,
  ArrowRight,
} from "lucide-react";
import { SiDiscord, SiRoblox } from "react-icons/si";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30).optional(),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const SETTINGS_TABS = [
  { id: "account", label: "Account", icon: User, category: "Core Settings" },
  { id: "appearance", label: "Appearance", icon: Palette, category: "Core Settings" },
  { id: "connections", label: "Integrations", icon: LinkIcon, category: "Core Settings" },
  { id: "billing", label: "Billing", icon: CreditCard, category: "Account Management" },
  { id: "payments", label: "Payment Method", icon: CreditCard, category: "Account Management" },
  { id: "subscription", label: "Subscription", icon: Crown, category: "Account Management" },
  { id: "downloads", label: "Downloads", icon: Download, category: "Resources" },
  { id: "orders", label: "Orders", icon: Package, category: "Account Management" },
];

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [theme, setTheme] = useState("light");
  
  const params = new URLSearchParams(window.location.search);
  const initialTab = params.get('tab') || 'account';
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

  // Group tabs by category
  const groupedTabs = SETTINGS_TABS.reduce((acc, tab) => {
    const category = tab.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(tab);
    return acc;
  }, {} as Record<string, typeof SETTINGS_TABS>);

  return (
    <div className="flex gap-6 max-w-6xl mx-auto">
      {/* Left Sidebar Navigation */}
      <div className="w-full sm:w-56 flex-shrink-0">
        <div className="sticky top-0 space-y-6">
          {Object.entries(groupedTabs).map(([category, tabs]) => (
            <div key={category} className="space-y-2">
              <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {category}
              </p>
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors data-[active=true]:bg-primary data-[active=true]:text-primary-foreground hover:bg-muted ${
                        isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                      }`}
                      data-active={isActive}
                      data-testid={`settings-tab-${tab.id}`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 space-y-6">
        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">Account Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your account information and profile</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your public profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
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
                            Your public display name. Must be unique.
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
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === "appearance" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">Appearance</h1>
              <p className="text-muted-foreground mt-1">Customize how RIVET Studios looks for you</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Choose your preferred color scheme</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormLabel>Theme Mode</FormLabel>
                <Select value={theme} onValueChange={(value) => {
                  setTheme(value);
                  localStorage.setItem("react-studios-theme", value);
                }}>
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  Your theme preference is saved locally.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === "connections" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">Integrations</h1>
              <p className="text-muted-foreground mt-1">Link your gaming accounts and services</p>
            </div>

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
                      onClick={() => {}}
                      disabled={!robloxUsername}
                      data-testid="button-verify-roblox"
                    >
                      Verify
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">Billing</h1>
              <p className="text-muted-foreground mt-1">Manage your billing information</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">No billing information on file</p>
                <Button 
                  onClick={() => toast({ title: "Feature coming soon", description: "Billing address management will be available soon." })}
                  data-testid="button-add-billing"
                >
                  Add Billing Address
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payment Method Tab */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">Payment Methods</h1>
              <p className="text-muted-foreground mt-1">Manage your payment methods</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">No payment methods on file</p>
                <Button 
                  onClick={() => toast({ title: "Feature coming soon", description: "Payment method management will be available soon." })}
                  data-testid="button-add-payment"
                >
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === "subscription" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">VIP Subscription</h1>
              <p className="text-muted-foreground mt-1">Manage your VIP membership</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                {user?.vipTier && user.vipTier !== 'none' ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
                      <div>
                        <h4 className="font-semibold">Current Plan</h4>
                        <VipBadge tier={user.vipTier as any} />
                      </div>
                      <Button variant="outline" asChild>
                        <Link href="/vip">Change Plan</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Crown className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No Active Subscription</h3>
                    <p className="text-muted-foreground mb-4">
                      Upgrade to VIP to unlock exclusive features!
                    </p>
                    <Button asChild>
                      <Link href="/vip">View VIP Plans</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Downloads Tab */}
        {activeTab === "downloads" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">Downloads</h1>
              <p className="text-muted-foreground mt-1">Access downloadable resources</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Available Downloads</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No downloads available at this time</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">Orders</h1>
              <p className="text-muted-foreground mt-1">View your order history</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No orders on file</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
