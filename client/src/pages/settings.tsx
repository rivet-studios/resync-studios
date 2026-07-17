import { useState, useEffect } from "react";
import { useLocation, useSearch, useRoute } from "wouter";
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
import { UploadButton } from "@uploadthing/react";
import "@uploadthing/react/styles.css";
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
  RefreshCw,
  ExternalLink,
  Tag,
  Lock,
  Crown,
  ShoppingBag,
  Loader2,
  Camera,
  PanelLeft,
  PanelTop,
  Shield,
  Upload,
  Smartphone,
  Copy,
  CheckCircle,
} from "lucide-react";
import { SiDiscord, SiRoblox } from "react-icons/si";
import { useNavigationLayout } from "@/hooks/use-navigation-layout";

const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .optional(),
  profileImageUrl: z
    .string()
    .refine(
      (val) =>
        val === "" || val.startsWith("/uploads/") || /^https?:\/\//.test(val),
      {
        message: "Must be a valid URL or uploaded image path",
      },
    )
    .optional(),
  signature: z
    .string()
    .max(500, "Signature must be 500 characters or less")
    .optional(),
  dateOfBirth: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(5, "Password must be at least 5 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
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
  { id: "security", label: "Security", icon: Shield },
  { id: "payments", label: "Payment Methods", icon: CreditCard },
];

function formatConnectedDate(
  dateStr: string | Date | null | undefined,
): string {
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
  "Founders Edition VIP": {
    label: "Founders Edition VIP",
    color: "text-purple-400",
  },
  Lifetime: { label: "Lifetime", color: "text-yellow-400" },
};

function BillingTab({ user, toast }: { user: any; toast: any }) {
  const { data: subscription, isLoading: subLoading } = useQuery<{
    subscription: any;
  }>({
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
      toast({
        title: "Error",
        description:
          "Unable to open billing portal. You may not have a Stripe account yet.",
        variant: "destructive",
      });
    },
  });

  const tierKey = user?.vipTier || "none";
  const tierInfo = VIP_TIER_LABELS[tierKey] || VIP_TIER_LABELS.none;
  const sub = subscription?.subscription;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" data-testid="text-billing-title">
          Billing
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your subscription and billing
        </p>
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
                <span
                  className={`text-xl font-bold ${tierInfo.color}`}
                  data-testid="text-current-tier"
                >
                  {tierInfo.label}
                </span>
                {tierKey !== "none" && (
                  <Badge variant="secondary" data-testid="badge-tier-active">
                    Active
                  </Badge>
                )}
              </div>
              {sub ? (
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p data-testid="text-sub-status">
                    Status: <span className="capitalize">{sub.status}</span>
                  </p>
                  {sub.current_period_end && (
                    <p data-testid="text-sub-renews">
                      {sub.status === "active" ? "Renews" : "Expires"}:{" "}
                      {new Date(
                        sub.current_period_end * 1000,
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              ) : tierKey === "none" ? (
                <p
                  className="text-sm text-muted-foreground"
                  data-testid="text-no-subscription"
                >
                  You don't have an active subscription. Visit the store to
                  upgrade.
                </p>
              ) : (
                <p
                  className="text-sm text-muted-foreground"
                  data-testid="text-manually-assigned"
                >
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
                  <Button
                    variant="default"
                    asChild
                    data-testid="link-upgrade-plan"
                  >
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
        <h2 className="text-lg font-semibold" data-testid="text-orders-title">
          Orders
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          View your payment and order history
        </p>
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
              <p className="text-muted-foreground" data-testid="text-no-orders">
                No orders on file
              </p>
              <Button
                variant="outline"
                className="mt-4"
                asChild
                data-testid="link-browse-store"
              >
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
                  <TableRow
                    key={payment.id}
                    data-testid={`row-order-${payment.id}`}
                  >
                    <TableCell className="text-sm">
                      {payment.createdAt
                        ? new Date(payment.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {payment.tierId || "Payment"}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      ${(payment.amount / 100).toFixed(2)}{" "}
                      {payment.currency?.toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.status === "succeeded" ||
                          payment.status === "completed"
                            ? "default"
                            : "secondary"
                        }
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
      toast({
        title: "Error",
        description:
          "Unable to open billing portal. You may not have a Stripe account yet.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-lg font-semibold"
          data-testid="text-payment-methods-title"
        >
          Payment Methods
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your saved payment methods
        </p>
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
              <p
                className="text-sm text-muted-foreground"
                data-testid="text-stripe-connected"
              >
                Your account is linked to Stripe. Use the button below to add,
                remove, or update your payment methods.
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
              <p
                className="text-sm text-muted-foreground"
                data-testid="text-no-stripe"
              >
                No payment methods on file. Payment methods will be created when
                you make your first purchase.
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
        <h2
          className="text-lg font-semibold"
          data-testid="text-downloads-title"
        >
          Downloads
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your purchased and owned products
        </p>
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
              <p
                className="text-muted-foreground"
                data-testid="text-no-downloads"
              >
                No downloads available
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Products you purchase or submit will appear here
              </p>
              <Button
                variant="outline"
                className="mt-4"
                asChild
                data-testid="link-browse-marketplace"
              >
                <Link href="/store">Browse Store</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {products.map((product) => (
                  <div
                      key={product.id}
                      className="flex items-center gap-4 p-4"
                      data-testid={`row-download-${product.id}`}
                  >
                      <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {product.attachments ? (
                              <img
                                  src={product.attachments}
                                  alt={product.name}
                                  className="w-full h-full object-cover" />
                              
                          ) : (
                              <Package className="w-5 h-5 text-muted-foreground" />
                          )}
                      </div>
                      <div className="flex-1 min-w-0">
                          <p
                              className="font-medium text-sm truncate"
                              data-testid={`text-product-name-${product.id}`}
                          >
                              {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                              {product.category || "Uncategorized"}
                          </p>
                      </div>
                      <Badge
                          variant="secondary"
                          data-testid={`badge-product-status-${product.id}`}
                      >
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

interface MyDiscount {
  id: string;
  code: string;
  description: string | null;
  discountType: "percent" | "fixed";
  amount: number;
  status: "active" | "used" | "expired";
  expiresAt: string | null;
  usedAt: string | null;
  createdAt: string;
}

function DiscountsTab() {
  const [copied, setCopied] = useState<string | null>(null);

  const { data: myDiscounts, isLoading } = useQuery<MyDiscount[]>({
    queryKey: ["/api/discounts/my"],
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const statusBadge = (d: MyDiscount) => {
    if (d.status === "active")
      return (
        <Badge className="bg-green-500/15 text-green-500 border-green-500/20 hover:bg-green-500/15" data-testid={`badge-discount-status-${d.id}`}>
          Active
        </Badge>
      );
    if (d.status === "used")
      return (
        <Badge variant="secondary" data-testid={`badge-discount-status-${d.id}`}>
          Used
        </Badge>
      );
    return (
      <Badge variant="outline" className="text-muted-foreground" data-testid={`badge-discount-status-${d.id}`}>
        Expired
      </Badge>
    );
  };

  const formatAmount = (d: MyDiscount) =>
    d.discountType === "percent"
      ? `${d.amount}% off`
      : `$${(d.amount / 100).toFixed(2)} off`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" data-testid="text-discounts-title">
          Discounts
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Discount codes assigned to your account
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !myDiscounts || myDiscounts.length === 0 ? (
            <div className="py-12 text-center">
              <Tag className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground font-medium" data-testid="text-no-discounts">
                No discount codes yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Discount codes assigned to your account will appear here
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myDiscounts.map((d) => (
                  <TableRow key={d.id} data-testid={`row-discount-${d.id}`}>
                    <TableCell>
                      <button
                        onClick={() => d.status === "active" && copyCode(d.code)}
                        disabled={d.status !== "active"}
                        className="flex items-center gap-2 group"
                        title={d.status === "active" ? "Click to copy" : undefined}
                        data-testid={`button-copy-discount-${d.id}`}
                      >
                        <span className={`font-mono font-semibold text-sm ${d.status === "active" ? "text-foreground" : "text-muted-foreground line-through"}`}>
                          {d.code}
                        </span>
                        {d.status === "active" && (
                          copied === d.code
                            ? <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                            : <Copy className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {d.description || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {formatAmount(d)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {d.usedAt
                        ? `Used ${new Date(d.usedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                        : d.expiresAt
                        ? new Date(d.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "Never"}
                    </TableCell>
                    <TableCell>{statusBadge(d)}</TableCell>
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

function SecurityTab() {
  const { toast } = useToast();
  const [setupStep, setSetupStep] = useState<
    "idle" | "scanning" | "verifying" | "complete"
  >("idle");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedBackup, setCopiedBackup] = useState(false);

  const { data: securityInfo, isLoading } = useQuery<{
    twoFactorEnabled: boolean;
    hasPassword: boolean;
    hasDiscord: boolean;
    activeSessions: number;
  }>({
    queryKey: ["/api/auth/security-info"],
  });

  const setupMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/2fa/setup");
      return res.json();
    },
    onSuccess: (data: any) => {
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setSetupStep("scanning");
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to start 2FA setup",
        variant: "destructive",
      });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/2fa/verify", {
        token: verifyCode,
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      setBackupCodes(data.backupCodes || []);
      setSetupStep("complete");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/security-info"] });
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Invalid Code",
        description: err.message || "The code you entered is incorrect.",
        variant: "destructive",
      });
    },
  });

  const disableMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/2fa/disable", {
        token: disableCode,
      });
      return res.json();
    },
    onSuccess: () => {
      setDisableCode("");
      setSetupStep("idle");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/security-info"] });
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to disable 2FA",
        variant: "destructive",
      });
    },
  });

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
    toast({
      title: "Copied",
      description: "Backup codes copied to clipboard.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" data-testid="text-security-title">
          Security
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account security settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="w-5 h-5" />
            Two-Factor Authentication (2FA)
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account using an
            authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {securityInfo?.twoFactorEnabled && setupStep !== "complete" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-500 font-medium">
                  2FA is enabled
                </span>
              </div>
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Enter a code from your authenticator app or a backup code to
                  disable 2FA:
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter 2FA code"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value)}
                    maxLength={8}
                    data-testid="input-disable-2fa"
                  />
                  <Button
                    variant="destructive"
                    onClick={() => disableMutation.mutate()}
                    disabled={!disableCode || disableMutation.isPending}
                    data-testid="button-disable-2fa"
                  >
                    {disableMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Disable"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : setupStep === "idle" ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use an authenticator app like Google Authenticator, Authy, or
                1Password to generate one-time codes.
              </p>
              <Button
                onClick={() => setupMutation.mutate()}
                disabled={setupMutation.isPending}
                data-testid="button-enable-2fa"
              >
                {setupMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Shield className="w-4 h-4 mr-2" />
                )}
                Enable 2FA
              </Button>
            </div>
          ) : setupStep === "scanning" ? (
            <div className="space-y-4">
              <p className="text-sm font-medium">Step 1: Scan the QR code</p>
              <p className="text-sm text-muted-foreground">
                Open your authenticator app and scan this QR code:
              </p>
              <div className="flex justify-center py-4 bg-white rounded-lg">
                <img
                  src={qrCode}
                  alt="2FA QR Code"
                  className="w-48 h-48"
                  data-testid="img-2fa-qr"
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Or enter this key manually:
                </p>
                <code
                  className="block text-xs bg-muted p-2 rounded font-mono break-all"
                  data-testid="text-2fa-secret"
                >
                  {secret}
                </code>
              </div>
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm font-medium">
                  Step 2: Enter the code from your app
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="6-digit code"
                    value={verifyCode}
                    onChange={(e) =>
                      setVerifyCode(
                        e.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    maxLength={6}
                    data-testid="input-verify-2fa"
                  />
                  <Button
                    onClick={() => verifyMutation.mutate()}
                    disabled={
                      verifyCode.length !== 6 || verifyMutation.isPending
                    }
                    data-testid="button-verify-2fa"
                  >
                    {verifyMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSetupStep("idle")}
                data-testid="button-cancel-2fa"
              >
                Cancel
              </Button>
            </div>
          ) : setupStep === "complete" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-500 font-medium">
                  2FA has been enabled successfully
                </span>
              </div>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3">
                <p className="text-sm font-semibold text-destructive">
                  Save your backup codes
                </p>
                <p className="text-xs text-muted-foreground">
                  Store these codes somewhere safe. You can use them to access
                  your account if you lose your authenticator device. Each code
                  can only be used once.
                </p>
                <div className="grid grid-cols-2 gap-2 bg-muted rounded-md p-3">
                  {backupCodes.map((code, i) => (
                    <code
                      key={i}
                      className="text-xs font-mono"
                      data-testid={`text-backup-code-${i}`}
                    >
                      {code}
                    </code>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyBackupCodes}
                  data-testid="button-copy-backup-codes"
                >
                  {copiedBackup ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" /> Copy Codes
                    </>
                  )}
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSetupStep("idle")}
                data-testid="button-done-2fa"
              >
                Done
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-5 h-5" />
            Account Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm">Password</span>
              <Badge
                variant={securityInfo?.hasPassword ? "default" : "secondary"}
                data-testid="badge-password-status"
              >
                {securityInfo?.hasPassword ? "Set" : "Not Set"}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm">Discord Linked</span>
              <Badge
                variant={securityInfo?.hasDiscord ? "default" : "secondary"}
                data-testid="badge-discord-status"
              >
                {securityInfo?.hasDiscord ? "Linked" : "Not Linked"}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm">Two-Factor Auth</span>
              <Badge
                variant={
                  securityInfo?.twoFactorEnabled ? "default" : "secondary"
                }
                data-testid="badge-2fa-status"
              >
                {securityInfo?.twoFactorEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Active Sessions</span>
              <Badge variant="secondary" data-testid="badge-sessions-count">
                {securityInfo?.activeSessions || 0}
              </Badge>
            </div>
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
  const [fontSize, setFontSize] = useState(
    () => localStorage.getItem("resync-font-size") || "normal",
  );
  const [reduceMotion, setReduceMotion] = useState(
    () => localStorage.getItem("resync-reduce-motion") === "true",
  );
  const { layout: navLayout, setLayout: setNavLayout } = useNavigationLayout();

  const searchString = useSearch();
  const [, tabParams] = useRoute("/settings/:tab");
  const validTabIds = SETTINGS_TABS.map((t) => t.id);

  const resolveInitialTab = () => {
    const fromPath = tabParams?.tab;
    if (fromPath && validTabIds.includes(fromPath)) return fromPath;
    const fromQuery = new URLSearchParams(window.location.search).get("tab");
    if (fromQuery && validTabIds.includes(fromQuery)) return fromQuery;
    return "account";
  };

  const [activeTab, setActiveTab] = useState(resolveInitialTab);

  // Sync URL -> state when the user navigates (back/forward, direct links).
  useEffect(() => {
    const fromPath = tabParams?.tab;
    if (fromPath && validTabIds.includes(fromPath) && fromPath !== activeTab) {
      setActiveTab(fromPath);
      return;
    }
    const fromQuery = new URLSearchParams(searchString).get("tab");
    if (
      fromQuery &&
      validTabIds.includes(fromQuery) &&
      fromQuery !== activeTab
    ) {
      setActiveTab(fromQuery);
    }
  }, [tabParams?.tab, searchString]);

  // Sync state -> URL when the user clicks a tab.
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const target = `/settings/${tabId}`;
    if (location !== target) navigate(target);
  };

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
      toast({
        title: "Profile saved",
        description: "Your profile has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const response = await apiRequest(
        "POST",
        "/api/users/change-password",
        data,
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been changed.",
      });
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error?.message ||
          "Failed to change password. Make sure your current password is correct.",
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
        description: "Your account has been permanently deleted",
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

  const syncAccountsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/users/sync", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Accounts synced",
        description: "Your linked accounts have been re-synced.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Sync complete",
        description: "Account data has been refreshed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  // Show a toast when we come back from the Roblox OAuth callback.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("roblox");
    if (!status) return;
    if (status === "linked") {
      toast({
        title: "Roblox Linked",
        description: "Your Roblox account has been successfully linked.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } else if (status === "error") {
      const reason = params.get("reason") || "unknown";
      const reasonText: Record<string, string> = {
        "already-linked":
          "That Roblox account is already linked to a different account.",
        "not-configured":
          "Roblox sign-in isn't configured. Please contact the site developer or an administrator. Email support at <mailto:support@rivetstudiosus.com>.",
        "invalid-state":
          "The link request expired or was tampered with. Please try again.",
        "session-mismatch":
          "Your session changed during the link flow. Please sign in and try again.",
        "token-exchange":
          "Roblox rejected the link request. Please try again. If the issue persists, contact Roblox or email support at <mailto:support@rivetstudiosus.com>.",
      };
      toast({
        title: "Couldn't link Roblox",
        description: reasonText[reason] || `Roblox link failed (${reason}).`,
        variant: "destructive",
      });
    }
    // Strip the query string so we don't keep re-toasting on refresh.
    const url = new URL(window.location.href);
    url.searchParams.delete("roblox");
    url.searchParams.delete("reason");
    window.history.replaceState({}, "", url.toString());
  }, []);

  const unlinkDiscord = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/discord/unlink", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Discord unlinked",
        description: "Your Discord account has been unlinked.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unlink Discord account.",
        variant: "destructive",
      });
    },
  });

  const unlinkRoblox = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/roblox/unlink", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Roblox unlinked",
        description: "Your Roblox account has been unlinked.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to unlink Roblox account.",
        variant: "destructive",
      });
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

      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        <nav className="md:w-48 flex-shrink-0">
          <div className="flex md:flex-col md:sticky md:top-8 gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 md:gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                  data-testid={`settings-tab-${tab.id}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{tab.label}</span>
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
                  <CardDescription>
                    Update your username and email address
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative group">
                        <Avatar className="w-16 h-16">
                          <AvatarImage
                            src={
                              profileForm.watch("profileImageUrl") ||
                              user?.profileImageUrl ||
                              undefined
                            }
                            className="object-cover"
                          />
                          <AvatarFallback className="text-lg">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <label
                          htmlFor="avatar-upload"
                          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Camera className="w-5 h-5 text-white" />
                        </label>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Paste image link"
                            className="w-full sm:w-64 text-sm"
                            {...profileForm.register("profileImageUrl")}
                            data-testid="input-settings-profile-image"
                          />
                          <span className="text-xs text-muted-foreground">
                            or
                          </span>
                              <UploadButton
                                endpoint="avatarUploader"
                                    onClientUploadComplete={(res) => {
                                      if (res && res.length > 0) {
                                        profileForm.setValue("profileImageUrl", res[0].url);
                                    toast({ 
                                      title: "Avatar uploaded to cloud!", 
                                      description: "Save your changes to update your profile." 
                                    });
                                  }
                                }}
                                onUploadError={(error: Error) => {
                                  toast({ 
                                    title: "Upload failed", 
                                    description: error.message, 
                                    variant: "destructive" 
                                  });
                                }}
                              />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG, GIF, WebP up to 5MB
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/profile/${user?.id || ""}`}
                        data-testid="link-view-profile"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-2" />
                        View Profile
                      </Link>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Profile Banner
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Upload a cover image for your profile (JPG, PNG, GIF, WebP
                      up to 10MB)
                    </p>
                    {(user as any)?.profileBannerUrl && (
                      <div className="h-24 w-full rounded-md overflow-hidden border border-border">
                        <img
                          src={(user as any).profileBannerUrl}
                          alt="Current banner"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        id="banner-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                        data-testid="input-banner-upload"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 10 * 1024 * 1024) {
                            toast({
                              title: "File too large",
                              description: "Max file size is 10MB",
                              variant: "destructive",
                            });
                            return;
                          }
                          const formData = new FormData();
                          formData.append("banner", file);
                          try {
                            const res = await fetch(
                              "/api/users/profile/banner",
                              {
                                method: "POST",
                                body: formData,
                                credentials: "include",
                              },
                            );
                            const data = await res.json();
                            if (res.ok) {
                              queryClient.invalidateQueries({
                                queryKey: ["/api/auth/user"],
                              });
                              toast({ title: "Banner updated" });
                            } else {
                              toast({
                                title: "Upload failed",
                                description: data.message,
                                variant: "destructive",
                              });
                            }
                          } catch {
                            toast({
                              title: "Upload failed",
                              description: "Please try again",
                              variant: "destructive",
                            });
                          }
                          e.target.value = "";
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document.getElementById("banner-upload")?.click()
                        }
                        data-testid="button-upload-banner"
                      >
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        Upload Banner
                      </Button>
                    </div>
                  </div>

                  <form
                    onSubmit={profileForm.handleSubmit((data) =>
                      updateProfileMutation.mutate(data),
                    )}
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
                          Your username is synced from Discord and cannot be
                          changed here.
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
                        placeholder="Write your signature..."
                        className="resize-vertical min-h-[80px]"
                        rows={3}
                        {...profileForm.register("signature")}
                        data-testid="input-settings-signature"
                      />
                      <p className="text-xs text-muted-foreground">
                        This signature will appear under your posts in forums.
                        Keep it concise and professional.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Custom fields</h4>
                      <p className="text-xs text-muted-foreground">
                        Additional profile information
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dob">
                        Date of Birth <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="dob"
                        type="date"
                        placeholder="DD/MM/YYYY"
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
                      {updateProfileMutation.isPending
                        ? "Saving..."
                        : "Save profile"}
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
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={passwordForm.handleSubmit((data) =>
                      changePasswordMutation.mutate({
                        currentPassword: data.currentPassword,
                        newPassword: data.newPassword,
                      }),
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
                        <p className="text-xs text-red-500">
                          {
                            passwordForm.formState.errors.currentPassword
                              .message
                          }
                        </p>
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
                        <p className="text-xs text-red-500">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm new password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        {...passwordForm.register("confirmPassword")}
                        data-testid="input-confirm-password"
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-xs text-red-500">
                          {
                            passwordForm.formState.errors.confirmPassword
                              .message
                          }
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      data-testid="button-update-password"
                    >
                      {changePasswordMutation.isPending
                        ? "Updating..."
                        : "Update password"}
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
                  <CardDescription>
                    Delete your account and all of its resources
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">
                      Please proceed with caution, this cannot be undone.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-orange-400">
                      Note from developers: We are currently in the process of
                      creating a restricted cloud storage for deleted data and
                      accounts to prevent unauthorized account deletion.
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
                        {deleteAccountMutation.isPending
                          ? "Deleting..."
                          : "Delete account"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete your account and all of
                          your data including posts, linked accounts, and
                          subscriptions. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-testid="button-cancel-delete">
                          Cancel
                        </AlertDialogCancel>
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
                  <CardDescription>
                    Choose your preferred theme appearance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { value: "light" as const, label: "Light", icon: Sun },
                      { value: "dark" as const, label: "Dark", icon: Moon },
                      {
                        value: "system" as const,
                        label: "System",
                        icon: Monitor,
                      },
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
                          <Icon
                            className={`w-6 h-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                          />
                          <span
                            className={`text-sm font-medium ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                          >
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
                  <CardTitle>Navigation Style</CardTitle>
                  <CardDescription>
                    Choose between a sidebar or header navigation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        value: "sidebar" as const,
                        label: "Sidebar",
                        icon: PanelLeft,
                      },
                      {
                        value: "header" as const,
                        label: "Header",
                        icon: PanelTop,
                      },
                    ].map((option) => {
                      const Icon = option.icon;
                      const isSelected = navLayout === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            setNavLayout(option.value);
                            toast({
                              title: "Navigation updated",
                              description: `Switched to ${option.label.toLowerCase()} navigation.`,
                            });
                          }}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground"
                          }`}
                          data-testid={`button-nav-${option.value}`}
                        >
                          <Icon
                            className={`w-6 h-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                          />
                          <span
                            className={`text-sm font-medium ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                          >
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
                  <CardTitle>Font Size</CardTitle>
                  <CardDescription>
                    Adjust the text size across the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { value: "small", label: "Small" },
                      { value: "normal", label: "Normal" },
                      { value: "large", label: "Large" },
                    ].map((option) => {
                      const isSelected = fontSize === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            setFontSize(option.value);
                            localStorage.setItem(
                              "resync-font-size",
                              option.value,
                            );
                            const root = document.documentElement;
                            root.classList.remove(
                              "text-sm",
                              "text-base",
                              "text-lg",
                            );
                            if (option.value === "small")
                              root.style.fontSize = "14px";
                            else if (option.value === "large")
                              root.style.fontSize = "18px";
                            else root.style.fontSize = "16px";
                            toast({
                              title: "Font size updated",
                              description: `Text size set to ${option.label.toLowerCase()}.`,
                            });
                          }}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground"
                          }`}
                          data-testid={`button-font-${option.value}`}
                        >
                          <span
                            className={`font-medium ${option.value === "small" ? "text-xs" : option.value === "large" ? "text-lg" : "text-sm"} ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                          >
                            Aa
                          </span>
                          <span
                            className={`text-sm font-medium ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                          >
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
                  <CardTitle>Accessibility</CardTitle>
                  <CardDescription>
                    Motion and animation preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Reduce motion</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Disable animations and transitions
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const newVal = !reduceMotion;
                        setReduceMotion(newVal);
                        localStorage.setItem(
                          "resync-reduce-motion",
                          String(newVal),
                        );
                        if (newVal) {
                          document.documentElement.classList.add(
                            "reduce-motion",
                          );
                        } else {
                          document.documentElement.classList.remove(
                            "reduce-motion",
                          );
                        }
                        toast({
                          title: newVal
                            ? "Reduced motion enabled"
                            : "Reduced motion disabled",
                          description: newVal
                            ? "Animations have been minimized."
                            : "Animations have been restored.",
                        });
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        reduceMotion ? "bg-primary" : "bg-muted"
                      }`}
                      data-testid="toggle-reduce-motion"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          reduceMotion ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
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
                    Connect your accounts for enhanced features and
                    authentication
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => syncAccountsMutation.mutate()}
                  disabled={syncAccountsMutation.isPending}
                  data-testid="button-sync-accounts"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${syncAccountsMutation.isPending ? "animate-spin" : ""}`}
                  />
                  Sync Accounts
                </Button>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
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
                            Linked{" "}
                            {user.robloxLinkedAt
                              ? new Date(
                                  user.robloxLinkedAt,
                                ).toLocaleDateString()
                              : ""}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Not connected
                        </p>
                      )}
                    </div>
                    {user?.robloxId ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => unlinkRoblox.mutate()}
                        disabled={unlinkRoblox.isPending}
                        data-testid="button-unlink-roblox"
                      >
                        {unlinkRoblox.isPending ? "Unlinking..." : "Unlink"}
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          window.location.href = "/api/auth/roblox";
                        }}
                        data-testid="button-link-roblox"
                      >
                        Link Account
                      </Button>
                    )}
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
                            {formatConnectedDate(
                              (user as any).discordLinkedAt || user.createdAt,
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Not connected
                        </p>
                      )}
                    </div>
                    {user?.discordId ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => unlinkDiscord.mutate()}
                        disabled={unlinkDiscord.isPending}
                        data-testid="button-unlink-discord"
                      >
                        {unlinkDiscord.isPending ? "Unlinking..." : "Unlink"}
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          window.location.href = "/api/auth/discord";
                        }}
                        data-testid="button-link-discord"
                      >
                        Link Account
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "billing" && <BillingTab user={user} toast={toast} />}

          {activeTab === "discounts" && <DiscountsTab />}

          {activeTab === "downloads" && <DownloadsTab />}

          {activeTab === "orders" && <OrdersTab />}

          {activeTab === "payments" && (
            <PaymentMethodsTab user={user} toast={toast} />
          )}

          {activeTab === "security" && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}
