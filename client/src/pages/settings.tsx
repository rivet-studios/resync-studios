import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTheme } from "@/components/theme-provider";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import {
  User,
  Link as LinkIcon,
  CreditCard,
  Crown,
  Palette,
  Download,
  Package,
  ExternalLink,
  Trash2,
  AlertTriangle,
  Sun,
  Moon,
  Monitor,
  ImagePlus,
  Calendar,
  ShieldAlert,
} from "lucide-react";
import { SiDiscord, SiRoblox } from "react-icons/si";

const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .optional(),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
  signature: z
    .string()
    .max(500, "Signature must be 500 characters or less")
    .optional(),
  profileImageUrl: z
    .string()
    .url("Must be a valid URL")
    .or(z.literal(""))
    .optional(),
  dateOfBirth: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const SETTINGS_TABS = [
  { id: "account", label: "Account", icon: User, category: "Core Settings" },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
    category: "Core Settings",
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: LinkIcon,
    category: "Core Settings",
  },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
    category: "Account Management",
  },
  {
    id: "payments",
    label: "Payment Methods",
    icon: CreditCard,
    category: "Account Management",
  },
  {
    id: "subscription",
    label: "Subscription",
    icon: Crown,
    category: "Account Management",
  },
  {
    id: "downloads",
    label: "Downloads",
    icon: Download,
    category: "Resources",
  },
  {
    id: "orders",
    label: "Order History",
    icon: Package,
    category: "Account Management",
  },
  {
    id: "danger",
    label: "Danger Zone",
    icon: ShieldAlert,
    category: "Account Management",
  },
];

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const { theme, setTheme } = useTheme();
  const [navLayout, setNavLayout] = useState(
    () => localStorage.getItem("resync-nav-layout") || "top",
  );

  const params = new URLSearchParams(window.location.search);
  const initialTab = params.get("tab") || "account";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const newParams = new URLSearchParams(window.location.search);
    const tab = newParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [location]);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      bio: user?.bio || "",
      signature: (user as any)?.signature || "",
      profileImageUrl: user?.profileImageUrl || "",
      dateOfBirth: (user as any)?.dateOfBirth || "",
    },
  });

  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const response = await apiRequest("PATCH", "/api/users/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description:
          "Failed to update profile. Contact support to manually update profile.",
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/users/account");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      queryClient.clear();
      navigate("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: "Failed to start Discord linking.",
        variant: "destructive",
      });
    },
  });

  const unlinkDiscordMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/discord/unlink", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Discord unlinked",
        description: "Your Discord account has been disconnected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description:
          "Failed to unlink Discord. Contact support to have it removed manually.",
        variant: "destructive",
      });
    },
  });

  const unlinkRobloxMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/roblox/unlink", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Roblox unlinked",
        description: "Your Roblox account has been disconnected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description:
          "Failed to unlink Roblox connection. Contact support to have it removed manually.",
        variant: "destructive",
      });
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

  const groupedTabs = SETTINGS_TABS.reduce(
    (acc, tab) => {
      const category = tab.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(tab);
      return acc;
    },
    {} as Record<string, typeof SETTINGS_TABS>,
  );

  return (
    <div className="flex gap-6 max-w-6xl mx-auto py-8 px-4">
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
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      } ${tab.id === "danger" ? "text-red-400" : ""}`}
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

      <div className="flex-1 space-y-6">
        {activeTab === "account" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">
                Account Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your account information and profile
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your public profile details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmitProfile)}
                    className="space-y-6"
                  >
                    <div className="flex items-start gap-6">
                      <div className="flex flex-col items-center gap-2">
                        <Avatar className="w-24 h-24">
                          <AvatarImage
                            src={form.watch("profileImageUrl") || user?.profileImageUrl || undefined}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-xl">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ImagePlus className="w-3 h-3" />
                          <span>Set below</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-4">
                        <FormField
                          control={form.control}
                          name="profileImageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Profile Image URL</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://example.com/your-avatar.png"
                                  {...field}
                                  data-testid="input-settings-profile-image"
                                />
                              </FormControl>
                              <FormDescription>
                                Enter a direct link to an image. Supports PNG, JPG, GIF, and WebP.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="your_username"
                              {...field}
                              data-testid="input-settings-username"
                            />
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

                    <FormField
                      control={form.control}
                      name="signature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Signature</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Your custom signature... Supports **markdown** formatting."
                              className="resize-vertical min-h-[80px]"
                              rows={3}
                              {...field}
                              data-testid="input-settings-signature"
                            />
                          </FormControl>
                          <FormDescription>
                            Appears at the bottom of your profile and posts. Supports basic markdown formatting.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Date of Birth
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              data-testid="input-settings-dob"
                            />
                          </FormControl>
                          <FormDescription className="flex items-start gap-2">
                            <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                            <span>
                              This is private information and will <strong>never</strong> be shown publicly on your profile or to other users. It is only used for age verification and compliance purposes.
                            </span>
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
                      {updateProfileMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">
                Appearance
              </h1>
              <p className="text-muted-foreground mt-1">
                Customize how RIVET Studios looks for you
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>
                  Choose your preferred color scheme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "light" as const, label: "Light", icon: Sun },
                    { value: "system" as const, label: "System", icon: Monitor },
                    { value: "dark" as const, label: "Dark", icon: Moon },
                  ].map((option) => {
                    const Icon = option.icon;
                    const isSelected = theme === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-white/10 hover:border-white/20"
                        }`}
                        data-testid={`button-theme-${option.value}`}
                      >
                        <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Navigation Layout</CardTitle>
                <CardDescription>
                  Choose how the navigation bar is displayed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "top", label: "Top Navigation", description: "Classic horizontal navigation bar at the top" },
                    { value: "sidebar", label: "Side Navigation", description: "Vertical sidebar navigation on the left" },
                  ].map((option) => {
                    const isSelected = navLayout === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setNavLayout(option.value);
                          localStorage.setItem("resync-nav-layout", option.value);
                          toast({
                            title: "Layout updated",
                            description: `Navigation set to ${option.label.toLowerCase()}. Refresh to see changes.`,
                          });
                        }}
                        className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-white/10 hover:border-white/20"
                        }`}
                        data-testid={`button-nav-${option.value}`}
                      >
                        <div className={`w-full h-16 rounded-lg border ${isSelected ? "border-primary/30" : "border-white/10"} relative overflow-hidden`}>
                          {option.value === "top" ? (
                            <>
                              <div className={`w-full h-3 ${isSelected ? "bg-primary/20" : "bg-white/5"}`} />
                              <div className="p-1 space-y-1">
                                <div className={`w-3/4 h-1.5 rounded ${isSelected ? "bg-primary/10" : "bg-white/5"}`} />
                                <div className={`w-1/2 h-1.5 rounded ${isSelected ? "bg-primary/10" : "bg-white/5"}`} />
                              </div>
                            </>
                          ) : (
                            <div className="flex h-full">
                              <div className={`w-5 h-full ${isSelected ? "bg-primary/20" : "bg-white/5"}`} />
                              <div className="flex-1 p-1 space-y-1">
                                <div className={`w-3/4 h-1.5 rounded ${isSelected ? "bg-primary/10" : "bg-white/5"}`} />
                                <div className={`w-1/2 h-1.5 rounded ${isSelected ? "bg-primary/10" : "bg-white/5"}`} />
                              </div>
                            </div>
                          )}
                        </div>
                        <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                          {option.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "integrations" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-semibold text-4xl tracking-tight uppercase">Integrations</h1>
              <p className="text-white/40 font-bold uppercase tracking-tight mt-1">
                Link your accounts and services
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#121212] border-white/5 rounded-3xl p-6 flex flex-col justify-between">
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-[#5865F2]/10 flex items-center justify-center">
                    <SiDiscord className="w-8 h-8 text-[#5865F2]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-xl uppercase tracking-tight">Discord</h4>
                      {user?.discordId ? (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 rounded-lg text-[10px] font-semibold uppercase">Connected</Badge>
                      ) : (
                        <Badge className="bg-white/5 text-white/40 border-white/10 rounded-lg text-[10px] font-semibold uppercase tracking-widest">Not Linked</Badge>
                      )}
                    </div>
                    <p className="text-xs font-bold text-white/40 uppercase leading-tight">
                      {user?.discordId 
                        ? `Connected as ${user.discordUsername}` 
                        : "Connect Discord to sync roles and verify account."}
                    </p>
                  </div>
                </div>
                {user?.discordId ? (
                  <Button
                    variant="outline"
                    className="w-full border-white/5 hover:bg-white/5 h-12 rounded-xl font-semibold uppercase tracking-tight text-xs"
                    onClick={() => unlinkDiscordMutation.mutate()}
                    disabled={unlinkDiscordMutation.isPending}
                    data-testid="button-unlink-discord"
                  >
                    Unlink Account
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-[#5865F2] hover:bg-[#4752C4] h-12 rounded-xl font-semibold uppercase tracking-tight text-xs transition-all"
                    onClick={() => linkDiscordMutation.mutate()}
                    disabled={linkDiscordMutation.isPending}
                    data-testid="button-link-discord"
                  >
                    Link Discord <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                )}
              </Card>

              <Card className="bg-[#121212] border-white/5 rounded-3xl p-6 flex flex-col justify-between">
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                    <SiRoblox className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-xl uppercase tracking-tight">Roblox</h4>
                      {user?.robloxId ? (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 rounded-lg text-[10px] font-semibold uppercase">Linked</Badge>
                      ) : (
                        <Badge className="bg-white/5 text-white/40 border-white/10 rounded-lg text-[10px] font-semibold uppercase tracking-widest">Not Linked</Badge>
                      )}
                    </div>
                    <p className="text-xs font-bold text-white/40 uppercase leading-tight">
                      {user?.robloxId 
                        ? `Linked as ${user.robloxDisplayName || user.robloxUsername}` 
                        : "Link Roblox to receive your in-game rewards."}
                    </p>
                  </div>
                </div>
                {user?.robloxId ? (
                  <Button
                    variant="outline"
                    className="w-full border-white/5 hover:bg-white/5 h-12 rounded-xl font-semibold uppercase tracking-tight text-xs"
                    onClick={() => unlinkRobloxMutation.mutate()}
                    disabled={unlinkRobloxMutation.isPending}
                    data-testid="button-unlink-roblox"
                  >
                    Unlink Account
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Username" 
                      className="bg-white/5 border-white/5 rounded-xl h-12 flex-1"
                      value={robloxUsername}
                      onChange={(e) => setRobloxUsername(e.target.value)}
                      data-testid="input-roblox-username"
                    />
                    <Button
                      className="bg-white text-black hover:bg-white/90 px-6 h-12 rounded-xl font-semibold uppercase tracking-tight text-xs"
                      disabled={!robloxUsername}
                      data-testid="button-verify-roblox"
                    >
                      Verify
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">
                Billing
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your billing information
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  No billing information on file
                </p>
                <Button
                  onClick={() =>
                    toast({
                      title: "Feature coming soon",
                      description:
                        "Billing address management will be available soon.",
                    })
                  }
                  data-testid="button-add-billing"
                >
                  Add Billing Address
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">
                Payment Methods
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your payment methods
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  No payment methods on file
                </p>
                <Button
                  onClick={() =>
                    toast({
                      title: "Feature coming soon",
                      description:
                        "Payment method management will be available soon.",
                    })
                  }
                  data-testid="button-add-payment"
                >
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "subscription" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">
                Subscriptions
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your VIP membership
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                {user?.vipTier && user.vipTier !== "none" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
                      <div>
                        <h4 className="font-semibold">Current Plan</h4>
                        <VipBadge tier={user.vipTier as any} />
                      </div>
                      <Button variant="outline" asChild>
                        <Link href="/store/subscriptions">Change Plan</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Crown className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">
                      No Active Subscription
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Upgrade to VIP to unlock exclusive features!
                    </p>
                    <Button asChild>
                      <Link href="/vip" data-testid="link-view-vip-plans">View Membership Plans</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "downloads" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">
                Downloads
              </h1>
              <p className="text-muted-foreground mt-1">
                Access downloadable resources
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Available Downloads</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No downloads available at this time
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">
                Orders
              </h1>
              <p className="text-muted-foreground mt-1">
                View your order history
              </p>
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

        {activeTab === "danger" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-red-500">
                Danger Zone
              </h1>
              <p className="text-muted-foreground mt-1">
                Irreversible actions for your account
              </p>
            </div>

            <Card className="border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <Trash2 className="w-5 h-5" />
                  Delete Account
                </CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold text-red-400">
                        This action is permanent and cannot be undone.
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Your profile, posts, and all content will be permanently removed</li>
                        <li>Your forum threads and replies will be deleted</li>
                        <li>All linked accounts (Discord, Roblox) will be disconnected</li>
                        <li>Active subscriptions will be cancelled immediately</li>
                        <li>You will not be able to recover your account or data</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <FormLabel className="text-sm text-muted-foreground">
                    Type <span className="font-mono font-semibold text-red-400">DELETE</span> to confirm
                  </FormLabel>
                  <Input
                    placeholder="Type DELETE to confirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="border-red-500/20"
                    data-testid="input-delete-confirm"
                  />

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        disabled={deleteConfirmText !== "DELETE" || deleteAccountMutation.isPending}
                        className="w-full"
                        data-testid="button-delete-account"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deleteAccountMutation.isPending ? "Deleting..." : "Delete My Account"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete your account and all of your data. This action cannot be undone and your account cannot be recovered.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteAccountMutation.mutate()}
                          className="bg-red-600 hover:bg-red-700"
                          data-testid="button-confirm-delete"
                        >
                          Yes, delete my account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
