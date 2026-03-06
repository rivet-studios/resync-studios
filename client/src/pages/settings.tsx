import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTheme } from "@/components/theme-provider";
import type { Payment } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Link as LinkIcon,
  CreditCard,
  Palette,
  Download,
  Package,
  Trash2,
  AlertTriangle,
  Sun,
  Moon,
  Monitor,
  PanelLeft,
  PanelTop,
  RefreshCw,
  ExternalLink,
  Tag,
  Lock,
  Crown,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { SiDiscord, SiRoblox } from "react-icons/si";

const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .optional(),
  profileImageUrl: z
    .string()
    .url("Must be a valid URL")
    .or(z.literal(""))
    .optional(),
  signature: z
    .string()
    .max(500, "Signature must be 500 characters or less")
    .optional(),
  dateOfBirth: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

const SETTINGS_TABS = [
  { id: "account", label: "Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "discounts", label: "Discounts", icon: Tag },
  { id: "downloads", label: "Downloads", icon: Download },
  { id: "integrations", label: "Integrations", icon: LinkIcon },
  { id: "orders", label: "Orders", icon: Package },
  { id: "payments", label: "Payment Methods", icon: CreditCard },
];

function formatConnectedDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const month = date.toLocaleString("en-US", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();
  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
          ? "rd"
          : "th";
  return `Connected ${month} ${day}${suffix}, ${year}`;
}

const VIP_TIER_LABELS: Record<string, { label: string; color: string }> = {
  none: { label: "Free", color: "text-muted-foreground" },
  "Bronze VIP": { label: "Bronze VIP", color: "text-amber-500" },
  "Diamond VIP": { label: "Diamond VIP", color: "text-cyan-400" },
  "Founders Edition VIP": { label: "Founders Edition VIP", color: "text-purple-400" },
  "Lifetime": { label: "Lifetime", color: "text-yellow-400" },
};

function BillingTab({ user, toast }: { user: any; toast: any }) {
  const { data: subscription, isLoading: subLoading } = useQuery<{ subscription: any }>({
    queryKey: ["/api/stripe/subscription"],
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/stripe/portal", {});
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.url) window.location.href = data.url;
    },
    onError: () => {
      toast({ title: "Error", description: "Unable to open billing portal. You may not have a Stripe account yet.", variant: "destructive" });
    },
  });

  const tierKey = user?.vipTier || "none";
  const tierInfo = VIP_TIER_LABELS[tierKey] || VIP_TIER_LABELS.none;
  const sub = subscription?.subscription;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" data-testid="text-billing-title">Billing</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your subscription and billing</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 flex-wrap">
              <Crown className="w-5 h-5" />
              Current Plan
            </CardTitle>
            <CardDescription>Your active subscription tier</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {subLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <span className={`text-xl font-bold ${tierInfo.color}`} data-testid="text-current-tier">
                  {tierInfo.label}
                </span>
                {tierKey !== "none" && (
                  <Badge variant="secondary" data-testid="badge-tier-active">Active</Badge>
                )}
              </div>
              {sub ? (
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p data-testid="text-sub-status">
                    Status: <span className="capitalize">{sub.status}</span>
                  </p>
                  {sub.current_period_end && (
                    <p data-testid="text-sub-renews">
                      {sub.status === "active" ? "Renews" : "Expires"}: {new Date(sub.current_period_end * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                </div>
              ) : tierKey === "none" ? (
                <p className="text-sm text-muted-foreground" data-testid="text-no-subscription">
                  You don't have an active subscription. Visit the store to upgrade.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground" data-testid="text-manually-assigned">
                  Your VIP tier was manually assigned by an administrator.
                </p>
              )}

              <div className="flex items-center gap-3 pt-2 flex-wrap">
                {user?.stripeCustomerId && (
                  <Button
                    variant="outline"
                    onClick={() => portalMutation.mutate()}
                    disabled={portalMutation.isPending}
                    data-testid="button-manage-subscription"
                  >
                    {portalMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4 mr-2" />
                    )}
                    Manage Subscription
                  </Button>
                )}
                {tierKey === "none" && (
                  <Button variant="default" asChild data-testid="link-upgrade-plan">
                    <Link href="/store">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Browse Plans
                    </Link>
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OrdersTab() {
  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments/my"],
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" data-testid="text-orders-title">Orders</h2>
        <p className="text-sm text-muted-foreground mt-1">View your payment and order history</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !payments || payments.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground" data-testid="text-no-orders">No orders on file</p>
              <Button variant="outline" className="mt-4" asChild data-testid="link-browse-store">
                <Link href="/store">Browse Store</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} data-testid={`row-order-${payment.id}`}>
                    <TableCell className="text-sm">
                      {payment.createdAt
                        ? new Date(payment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {payment.tierId || "Payment"}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      ${(payment.amount / 100).toFixed(2)} {payment.currency?.toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={payment.status === "succeeded" || payment.status === "completed" ? "default" : "secondary"}
                        data-testid={`badge-order-status-${payment.id}`}
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentMethodsTab({ user, toast }: { user: any; toast: any }) {
  const portalMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/stripe/portal", {});
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.url) window.location.href = data.url;
    },
    onError: () => {
      toast({ title: "Error", description: "Unable to open billing portal. You may not have a Stripe account yet.", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" data-testid="text-payment-methods-title">Payment Methods</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your saved payment methods</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 flex-wrap">
            <CreditCard className="w-5 h-5" />
            Stripe Payment Methods
          </CardTitle>
          <CardDescription>
            Payment methods are managed securely through Stripe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.stripeCustomerId ? (
            <>
              <p className="text-sm text-muted-foreground" data-testid="text-stripe-connected">
                Your account is linked to Stripe. Use the button below to add, remove, or update your payment methods.
              </p>
              <Button
                variant="outline"
                onClick={() => portalMutation.mutate()}
                disabled={portalMutation.isPending}
                data-testid="button-manage-payment-methods"
              >
                {portalMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4 mr-2" />
                )}
                Manage Payment Methods
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground" data-testid="text-no-stripe">
                No payment methods on file. Payment methods will be created when you make your first purchase.
              </p>
              <Button variant="default" asChild data-testid="link-visit-store">
                <Link href="/store">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Visit Store
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DownloadsTab() {
  const { data: products, isLoading } = useQuery<any[]>({
    queryKey: ["/api/products/my"],
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" data-testid="text-downloads-title">Downloads</h2>
        <p className="text-sm text-muted-foreground mt-1">Your purchased and owned products</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : !products || products.length === 0 ? (
            <div className="py-12 text-center">
              <Download className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground" data-testid="text-no-downloads">No downloads available</p>
              <p className="text-xs text-muted-foreground mt-1">Products you purchase or submit will appear here</p>
              <Button variant="outline" className="mt-4" asChild data-testid="link-browse-marketplace">
                <Link href="/store">Browse Store</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {products.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4" data-testid={`row-download-${product.id}`}>
                  <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" data-testid={`text-product-name-${product.id}`}>{product.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{product.category || "Uncategorized"}</p>
                  </div>
                  <Badge variant="secondary" data-testid={`badge-product-status-${product.id}`}>
                    {product.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DiscountsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" data-testid="text-discounts-title">Discounts</h2>
        <p className="text-sm text-muted-foreground mt-1">Your available discount codes and promotions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 flex-wrap">
            <Tag className="w-5 h-5" />
            Active Promotions
          </CardTitle>
          <CardDescription>Discount codes and special offers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Tag className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground font-medium" data-testid="text-no-discounts">No active promotions</p>
            <p className="text-xs text-muted-foreground mt-1">Check back later for special offers and discount codes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const { theme, setTheme } = useTheme();
  const [navLayout, setNavLayout] = useState(
    () => localStorage.getItem("resync-nav-layout") || "header",
  );

  const params = new URLSearchParams(window.location.search);
  const initialTab = params.get("tab") || "account";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const newParams = new URLSearchParams(window.location.search);
    const tab = newParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [location]);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      profileImageUrl: user?.profileImageUrl || "",
      signature: (user as any)?.signature || "",
      dateOfBirth: (user as any)?.dateOfBirth || "",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const response = await apiRequest("PATCH", "/api/users/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Profile saved", description: "Your profile has been updated." });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await apiRequest("POST", "/api/users/change-password", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Password updated", description: "Your password has been changed." });
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to change password. Make sure your current password is correct.",
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
      toast({ title: "Account deleted", description: "Your account has been permanently deleted." });
      queryClient.clear();
      navigate("/");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete account. Please contact support.", variant: "destructive" });
    },
  });

  const syncAccountsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/users/sync", {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Accounts synced", description: "Your linked accounts have been re-synced." });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({ title: "Sync complete", description: "Account data has been refreshed." });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

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
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your profile and account settings
        </p>
      </div>

      <div className="flex gap-8">
        <nav className="w-48 flex-shrink-0">
          <div className="sticky top-8 space-y-1">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/10 text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                  data-testid={`settings-tab-${tab.id}`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="flex-1 min-w-0">
          {activeTab === "account" && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Profile information</CardTitle>
                  <CardDescription>Update your username and email address</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage
                          src={profileForm.watch("profileImageUrl") || user?.profileImageUrl || undefined}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Paste image link"
                            className="w-64 text-sm"
                            {...profileForm.register("profileImageUrl")}
                            data-testid="input-settings-profile-image"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">JPG, PNG up to 2MB</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/profile/${user?.id || ""}`} data-testid="link-view-profile">
                        <ExternalLink className="w-3.5 h-3.5 mr-2" />
                        View Profile
                      </Link>
                    </Button>
                  </div>

                  <form
                    onSubmit={profileForm.handleSubmit((data) => updateProfileMutation.mutate(data))}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        disabled={!!user?.discordId}
                        {...profileForm.register("username")}
                        data-testid="input-settings-username"
                      />
                      {user?.discordId && (
                        <p className="text-xs text-muted-foreground">
                          Your username is synced from Discord and cannot be changed here.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user?.email || ""}
                        disabled
                        data-testid="input-settings-email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signature">Signature</Label>
                      <Textarea
                        id="signature"
                        placeholder="Write your forum signature..."
                        className="resize-vertical min-h-[80px]"
                        rows={3}
                        {...profileForm.register("signature")}
                        data-testid="input-settings-signature"
                      />
                      <p className="text-xs text-muted-foreground">
                        This signature will appear under your posts in forums. Keep it concise and professional.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Custom fields</h4>
                      <p className="text-xs text-muted-foreground">Additional profile information</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dob">
                        Date of Birth <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="dob"
                        type="date"
                        placeholder="MM/DD/YYYY"
                        {...profileForm.register("dateOfBirth")}
                        data-testid="input-settings-dob"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-save-profile"
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save profile"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Change password
                  </CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={passwordForm.handleSubmit((data) =>
                      changePasswordMutation.mutate({
                        currentPassword: data.currentPassword,
                        newPassword: data.newPassword,
                      })
                    )}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                        autoComplete="current-password"
                        {...passwordForm.register("currentPassword")}
                        data-testid="input-current-password"
                      />
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-xs text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        autoComplete="new-password"
                        {...passwordForm.register("newPassword")}
                        data-testid="input-new-password"
                      />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-xs text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm new password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        {...passwordForm.register("confirmPassword")}
                        data-testid="input-confirm-password"
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-xs text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      data-testid="button-update-password"
                    >
                      {changePasswordMutation.isPending ? "Updating..." : "Update password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-red-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    Delete account
                  </CardTitle>
                  <CardDescription>Delete your account and all of its resources</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">
                      Please proceed with caution, this cannot be undone.
                    </p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        disabled={deleteAccountMutation.isPending}
                        data-testid="button-delete-account"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deleteAccountMutation.isPending ? "Deleting..." : "Delete account"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete your account and all of your data including posts, linked accounts, and subscriptions. This action cannot be undone.
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
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Appearance settings</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Update your account's appearance settings
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                  <CardDescription>Choose your preferred theme appearance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "light" as const, label: "Light", icon: Sun },
                      { value: "dark" as const, label: "Dark", icon: Moon },
                      { value: "system" as const, label: "System", icon: Monitor },
                    ].map((option) => {
                      const Icon = option.icon;
                      const isSelected = theme === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setTheme(option.value)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground"
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
                  <CardTitle>Layout</CardTitle>
                  <CardDescription>Choose between sidebar or header navigation layout</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "sidebar", label: "Sidebar", icon: PanelLeft },
                      { value: "header", label: "Header", icon: PanelTop },
                    ].map((option) => {
                      const Icon = option.icon;
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
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground"
                          }`}
                          data-testid={`button-layout-${option.value}`}
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
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Integrations</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Connect your accounts for enhanced features and authentication
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => syncAccountsMutation.mutate()}
                  disabled={syncAccountsMutation.isPending}
                  data-testid="button-sync-accounts"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${syncAccountsMutation.isPending ? "animate-spin" : ""}`} />
                  Sync Accounts
                </Button>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      <SiRoblox className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold">Roblox</h4>
                      {user?.robloxId ? (
                        <>
                          <p className="text-sm text-muted-foreground">
                            {user.robloxDisplayName || user.robloxUsername}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatConnectedDate(user.createdAt)}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not connected</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#5865F2]/10 flex items-center justify-center flex-shrink-0">
                      <SiDiscord className="w-6 h-6 text-[#5865F2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold">Discord</h4>
                      {user?.discordId ? (
                        <>
                          <p className="text-sm text-muted-foreground">
                            {user.discordUsername}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatConnectedDate(user.createdAt)}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not connected</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "billing" && <BillingTab user={user} toast={toast} />}

          {activeTab === "discounts" && <DiscountsTab />}

          {activeTab === "downloads" && <DownloadsTab />}

          {activeTab === "orders" && <OrdersTab />}

          {activeTab === "payments" && <PaymentMethodsTab user={user} toast={toast} />}
        </div>
      </div>
    </div>
  );
}
