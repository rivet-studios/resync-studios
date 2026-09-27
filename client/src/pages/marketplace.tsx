import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";
import { generateUploadButton } from "@uploadthing/react";
import "@uploadthing/react/styles.css";
import type { OurFileRouter } from "../../../server/uploadthing";

const UploadButton = generateUploadButton<OurFileRouter>();

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Trash2,
  Pencil,
  X,
  FileText,
  Package,
  Send,
  ShieldCheck,
  Star,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  DollarSign,
  ShoppingBag,
  Store,
  ArrowUpRight,
  Lock,
  Image as ImageIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const submitProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      "Price must be 0 or more",
    ),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().url("Must be a valid URL").or(z.literal("")),
  attachments: z.array(z.string().url()).default([]),
});

type SubmitProductForm = z.infer<typeof submitProductSchema>;

const editProductSchema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  price: z
    .string()
    .min(1, "Required")
    .refine(
      (v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0,
      "Price must be 0 or more",
    ),
  category: z.string().min(1, "Required"),
  imageUrl: z.string().url("Must be a valid URL").or(z.literal("")),
  attachments: z.array(z.string().url()).default([]),
});

type EditProductForm = z.infer<typeof editProductSchema>;

const CATEGORIES = [
  "Serrano Vehicle Addons",
  "Serrano Civilian Vehicles",
  "Serrano LEO Vehicles",
  "Serrano EMS Vehicles",
  "Serrano Fire Vehicles",
  "Addons",
];

type MarketplaceStats = {
  totalProducts: number;
  approvedProducts: number;
  pendingProducts: number;
  totalSales: number;
  totalCommission: number;
  recentSales: any[];
};

function StatusBadge({ status }: { status: string | null }) {
  if (status === "approved") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
        data-testid="badge-status-approved"
      >
        <CheckCircle2 className="w-3 h-3 mr-1.5" />
        Approved
      </Badge>
    );
  }

  if (status === "denied") {
    return (
      <Badge
        variant="outline"
        className="border-red-500/20 bg-red-500/10 text-red-400"
        data-testid="badge-status-denied"
      >
        <XCircle className="w-3 h-3 mr-1.5" />
        Denied
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-amber-500/20 bg-amber-500/10 text-amber-400"
      data-testid="badge-status-pending"
    >
      <Clock className="w-3 h-3 mr-1.5" />
      Pending
    </Badge>
  );
}

function DashboardStats({ stats }: { stats: MarketplaceStats }) {
  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      description: "Your submissions",
      icon: Package,
    },
    {
      title: "Approved",
      value: stats.approvedProducts,
      description: "Available for sale",
      icon: CheckCircle2,
    },
    {
      title: "Pending Review",
      value: stats.pendingProducts,
      description: "Awaiting moderation",
      icon: Clock,
    },
    {
      title: "Total Sales",
      value: `$${(stats.totalSales / 100).toFixed(2)}`,
      description: "Gross marketplace sales",
      icon: DollarSign,
    },
  ];

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      data-testid="marketplace-stats"
    >
      {statCards.map((stat) => (
        <Card
          key={stat.title}
          className="border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.04] transition-colors"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {stat.title}
                </p>

                <p
                  className="text-xl font-semibold tracking-tight mt-1"
                  data-testid={`stat-${stat.title
                    .toLowerCase()
                    .replace(/\s/g, "-")}`}
                >
                  {stat.value}
                </p>

                <p className="text-[11px] text-muted-foreground mt-1 truncate">
                  {stat.description}
                </p>
              </div>

              <div className="w-9 h-9 shrink-0 rounded-lg bg-white/[0.05] flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AttachmentList({
  attachments,
  onRemove,
  testPrefix,
}: {
  attachments: string[];
  onRemove: (index: number) => void;
  testPrefix?: string;
}) {
  if (!attachments.length) return null;

  return (
    <ul className="space-y-1.5">
      {attachments.map((url, idx) => (
        <li
          key={`${url}-${idx}`}
          className="group flex items-center justify-between gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2"
          data-testid={
            testPrefix ? `attachment-row-${idx}` : undefined
          }
        >
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 min-w-0 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />

            <span className="truncate">
              {url.split("/").pop() || url}
            </span>

            <ArrowUpRight className="w-3 h-3 shrink-0 opacity-40" />
          </a>

          <button
            type="button"
            aria-label="Remove attachment"
            onClick={() => onRemove(idx)}
            className="shrink-0 p-1 rounded text-muted-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            data-testid={
              testPrefix
                ? `button-remove-attachment-${idx}`
                : undefined
            }
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function Marketplace() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const teamRanks = [
    "Team Member",
    "Gameplay Engineer",
    "Creative Designer",
    "Staff Department Director",
    "Operations Manager",
    "Company Director",
  ];

  const isOpsManager =
    user?.isAdmin ||
    teamRanks.includes(user?.userRank || "") ||
    (user?.additionalRanks || []).some((r: string) =>
      teamRanks.includes(r),
    );

  const form = useForm<SubmitProductForm>({
    resolver: zodResolver(submitProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      category: "",
      imageUrl: "",
      attachments: [],
    },
  });

  const submitAttachments = form.watch("attachments") ?? [];

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const editForm = useForm<EditProductForm>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      category: "",
      imageUrl: "",
      attachments: [],
    },
  });

  const editAttachments = editForm.watch("attachments") ?? [];

  function openEdit(product: Product) {
    setEditingProduct(product);

    editForm.reset({
      name: product.name,
      description: product.description ?? "",
      price: ((product.price ?? 0) / 100).toFixed(2),
      category: product.category ?? "",
      imageUrl: product.imageUrl ?? "",
      attachments: (product.attachments as string[] | null) ?? [],
    });
  }

  const { data: myProducts, isLoading: myProductsLoading } =
    useQuery<Product[]>({
      queryKey: ["/api/products/my"],
      enabled: isAuthenticated,
    });

  const {
    data: marketplaceStats,
    isLoading: statsLoading,
  } = useQuery<MarketplaceStats>({
    queryKey: ["/api/marketplace/stats"],
    enabled: isAuthenticated,
  });

  const {
    data: allProducts,
    isLoading: allProductsLoading,
  } = useQuery<Product[]>({
    queryKey: ["/api/products/all"],
    enabled: !!isOpsManager,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: SubmitProductForm) => {
      const priceInCents = Math.round(
        parseFloat(data.price) * 100,
      );

      await apiRequest("POST", "/api/products", {
        name: data.name,
        description: data.description,
        price: priceInCents,
        category: data.category,
        imageUrl: data.imageUrl || null,
        attachments: data.attachments ?? [],
      });
    },

    onSuccess: () => {
      toast({
        title: "Product submitted",
        description:
          "Your product has been submitted for review.",
      });

      form.reset();

      queryClient.invalidateQueries({
        queryKey: ["/api/products/my"],
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/marketplace/stats"],
      });
    },

    onError: (error: Error) => {
      toast({
        title: "Failed to submit product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      reviewNotes,
    }: {
      id: string;
      status: string;
      reviewNotes: string;
    }) => {
      await apiRequest("PATCH", `/api/products/${id}/review`, {
        status,
        reviewNotes,
      });
    },

    onSuccess: () => {
      toast({
        title: "Product review updated",
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/products/all"],
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/products/my"],
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/marketplace/stats"],
      });
    },

    onError: (error: Error) => {
      toast({
        title: "Failed to update review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: EditProductForm;
    }) => {
      const priceInCents = Math.round(
        parseFloat(data.price) * 100,
      );

      await apiRequest("PATCH", `/api/products/${id}`, {
        name: data.name,
        description: data.description,
        price: priceInCents,
        category: data.category,
        imageUrl: data.imageUrl || null,
        attachments: data.attachments ?? [],
      });
    },

    onSuccess: () => {
      toast({
        title: "Product updated",
        description: "The product has been updated successfully.",
      });

      setEditingProduct(null);

      queryClient.invalidateQueries({
        queryKey: ["/api/products/all"],
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/products"],
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/products/my"],
      });
    },

    onError: (error: Error) => {
      toast({
        title: "Failed to update product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },

    onSuccess: () => {
      toast({
        title: "Product deleted",
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/products/all"],
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/products"],
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/products/my"],
      });
    },

    onError: (error: Error) => {
      toast({
        title: "Failed to delete product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const badgeMutation = useMutation({
    mutationFn: async ({
      id,
      badges,
    }: {
      id: string;
      badges: {
        isFeatured: boolean;
        isLimitedEdition: boolean;
        isVerified: boolean;
      };
    }) => {
      await apiRequest("PATCH", `/api/products/${id}/badges`, badges);
    },

    onSuccess: () => {
      toast({
        title: "Badges updated",
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/products/all"],
      });
    },

    onError: (error: Error) => {
      toast({
        title: "Failed to update badges",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [reviewNotes, setReviewNotes] = useState<
    Record<string, string>
  >({});

  function onSubmit(data: SubmitProductForm) {
    submitMutation.mutate(data);
  }

  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-52" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>

        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      data-testid="page-marketplace"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-in fade-in duration-500">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
            <Store className="w-3.5 h-3.5" />
            RIVET Marketplace
          </div>

          <div className="flex items-start justify-between gap-5">
            <div>
              <h1
                className="text-3xl sm:text-4xl font-bold tracking-tight"
                data-testid="text-marketplace-title"
              >
                Marketplace
              </h1>

              <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                Submit, manage, and review products available through
                the RIVET Marketplace.
              </p>
            </div>

            {isOpsManager && (
              <Badge
                variant="outline"
                className="hidden sm:flex gap-1.5 border-white/10 bg-white/[0.03] shrink-0"
              >
                <ShieldCheck className="w-3 h-3" />
                Marketplace Staff
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        {isAuthenticated && (
          <div className="mb-8">
            {statsLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-28 w-full rounded-xl"
                  />
                ))}
              </div>
            ) : marketplaceStats ? (
              <DashboardStats stats={marketplaceStats} />
            ) : null}
          </div>
        )}

        {/* Main navigation */}
        <Tabs defaultValue="products" className="w-full">
          <div className="border-b border-white/[0.07] mb-6">
            <TabsList className="h-auto w-full justify-start gap-1 bg-transparent p-0 overflow-x-auto">
              <TabsTrigger
                value="products"
                className="relative h-11 rounded-none border-b-2 border-transparent bg-transparent px-4 text-xs text-muted-foreground shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                data-testid="tab-products"
              >
                <Package className="w-3.5 h-3.5 mr-2" />
                My Products
              </TabsTrigger>

              <TabsTrigger
                value="submit"
                className="relative h-11 rounded-none border-b-2 border-transparent bg-transparent px-4 text-xs text-muted-foreground shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                data-testid="tab-submit"
              >
                <Send className="w-3.5 h-3.5 mr-2" />
                Submit Product
              </TabsTrigger>

              {isOpsManager && (
                <TabsTrigger
                  value="review"
                  className="relative h-11 rounded-none border-b-2 border-transparent bg-transparent px-4 text-xs text-muted-foreground shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                  data-testid="tab-review"
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-2" />
                  Review Queue

                  {marketplaceStats?.pendingProducts ? (
                    <span className="ml-2 min-w-5 h-5 px-1.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] flex items-center justify-center">
                      {marketplaceStats.pendingProducts}
                    </span>
                  ) : null}
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* My Products */}
          <TabsContent
            value="products"
            className="mt-0 focus-visible:outline-none"
          >
            {!isAuthenticated ? (
              <Card className="border-dashed border-white/10 bg-transparent">
                <CardContent className="py-16 text-center">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-4 text-muted-foreground/30" />

                  <h3 className="font-semibold">
                    Sign in to view your products
                  </h3>

                  <p className="text-sm text-muted-foreground mt-1">
                    Your marketplace submissions will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card
                className="border-white/[0.07] bg-white/[0.02] overflow-hidden"
                data-testid="card-my-submissions"
              >
                <CardHeader className="border-b border-white/[0.06] px-5 sm:px-6 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        My Submissions
                      </CardTitle>

                      <CardDescription className="mt-1">
                        Track products you've submitted to the marketplace.
                      </CardDescription>
                    </div>

                    {myProducts && myProducts.length > 0 && (
                      <Badge
                        variant="outline"
                        className="border-white/10 bg-white/[0.03]"
                      >
                        {myProducts.length}{" "}
                        {myProducts.length === 1
                          ? "product"
                          : "products"}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {myProductsLoading ? (
                    <div className="p-5 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton
                          key={i}
                          className="h-16 w-full rounded-lg"
                        />
                      ))}
                    </div>
                  ) : !myProducts ||
                    myProducts.length === 0 ? (
                    <div className="py-16 px-6 text-center">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                        <Package className="w-5 h-5 text-muted-foreground/40" />
                      </div>

                      <p
                        className="text-sm font-medium"
                        data-testid="text-no-submissions"
                      >
                        No products submitted
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        Submit your first product to get started.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/[0.06]">
                      {myProducts.map((product) => (
                        <div
                          key={product.id}
                          className="p-4 sm:p-5 hover:bg-white/[0.015] transition-colors"
                          data-testid={`row-product-${product.id}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-11 h-11 shrink-0 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center overflow-hidden">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-4 h-4 text-muted-foreground/40" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3
                                  className="text-sm font-semibold truncate"
                                  data-testid={`text-product-name-${product.id}`}
                                >
                                  {product.name}
                                </h3>

                                <StatusBadge
                                  status={product.status}
                                />
                              </div>

                              <div className="flex items-center gap-2 flex-wrap mt-1.5 text-xs text-muted-foreground">
                                <span
                                  data-testid={`text-product-category-${product.id}`}
                                >
                                  {product.category}
                                </span>

                                <span className="text-muted-foreground/30">
                                  •
                                </span>

                                <span
                                  data-testid={`text-product-price-${product.id}`}
                                >
                                  ${(
                                    (product.price ?? 0) /
                                    100
                                  ).toFixed(2)}
                                </span>
                              </div>

                              {product.reviewNotes && (
                                <div
                                  className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
                                  data-testid={`text-review-notes-${product.id}`}
                                >
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">
                                    Review Notes
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {product.reviewNotes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Submit Product */}
          <TabsContent
            value="submit"
            className="mt-0 focus-visible:outline-none"
          >
            {isAuthenticated ? (
              <Card
                className="border-white/[0.07] bg-white/[0.02] overflow-hidden"
                data-testid="card-submit-product"
              >
                <CardHeader className="border-b border-white/[0.06] px-5 sm:px-7 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
                      <Send className="w-4 h-4 text-muted-foreground" />
                    </div>

                    <div>
                      <CardTitle className="text-base">
                        Submit a Product
                      </CardTitle>

                      <CardDescription className="mt-1">
                        Submit a product for marketplace review.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 sm:p-7">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Product Name</FormLabel>

                              <FormControl>
                                <Input
                                  placeholder="Enter product name"
                                  className="h-11 bg-white/[0.025] border-white/10"
                                  {...field}
                                  data-testid="input-product-name"
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Description</FormLabel>

                              <FormControl>
                                <Textarea
                                  placeholder="Describe your product, its features, and what buyers should know."
                                  className="min-h-[150px] bg-white/[0.025] border-white/10 resize-y leading-relaxed"
                                  {...field}
                                  data-testid="input-product-description"
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price (USD)</FormLabel>

                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.00"
                                  min="0.00"
                                  placeholder="9.99"
                                  className="h-11 bg-white/[0.025] border-white/10"
                                  {...field}
                                  data-testid="input-product-price"
                                />
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

                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className="h-11 bg-white/[0.025] border-white/10"
                                    data-testid="select-product-category"
                                  >
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>

                                <SelectContent>
                                  {CATEGORIES.map((cat) => (
                                    <SelectItem
                                      key={cat}
                                      value={cat}
                                      data-testid={`select-option-${cat
                                        .toLowerCase()
                                        .replace(/\s/g, "-")}`}
                                    >
                                      {cat}
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
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Product Image URL</FormLabel>

                              <FormControl>
                                <Input
                                  placeholder="https://example.com/image.png"
                                  className="h-11 bg-white/[0.025] border-white/10"
                                  {...field}
                                  data-testid="input-product-image-url"
                                />
                              </FormControl>

                              <p className="text-[11px] text-muted-foreground">
                                Optional. Provide a direct URL to the
                                product's primary image.
                              </p>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Attachments */}
                      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>

                          <div>
                            <p className="text-sm font-medium">
                              Supporting Files
                            </p>

                            <p className="text-xs text-muted-foreground mt-0.5">
                              Upload up to 10 images, PDFs, audio,
                              video, archives, or other supporting files.
                            </p>
                          </div>
                        </div>

                        <UploadButton
                          endpoint="productAttachmentUploader"
                          onClientUploadComplete={(res) => {
                            if (res?.length) {
                              form.setValue("attachments", [
                                ...submitAttachments,
                                ...res.map((r) => r.url),
                              ]);

                              toast({
                                title: `${res.length} file(s) uploaded`,
                              });
                            }
                          }}
                          onUploadError={(error: Error) => {
                            toast({
                              title: "Upload failed",
                              description: error.message,
                              variant: "destructive",
                            });
                          }}
                        />

                        <AttachmentList
                          attachments={submitAttachments}
                          testPrefix="submit"
                          onRemove={(idx) =>
                            form.setValue(
                              "attachments",
                              submitAttachments.filter(
                                (_, i) => i !== idx,
                              ),
                            )
                          }
                        />
                      </div>

                      {/* Submission notice */}
                      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
                        <div className="flex items-start gap-3">
                          <ShieldCheck className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />

                          <div>
                            <p className="text-xs font-medium">
                              Review process
                            </p>

                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              Submitted products are reviewed before
                              they become available on the marketplace.
                              You'll be able to track the review status
                              from My Products.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button
                          type="submit"
                          disabled={submitMutation.isPending}
                          data-testid="button-submit-product"
                        >
                          {submitMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5 mr-2" />
                              Submit Product
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-white/10 bg-transparent">
                <CardContent className="py-16 text-center">
                  <Lock className="w-9 h-9 mx-auto mb-4 text-muted-foreground/30" />

                  <h3 className="font-semibold">
                    Sign in required
                  </h3>

                  <p className="text-sm text-muted-foreground mt-1">
                    Please sign in to submit products to the marketplace.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Review Queue */}
          {isOpsManager && (
            <TabsContent
              value="review"
              className="mt-0 focus-visible:outline-none"
            >
              <Card
                className="border-white/[0.07] bg-white/[0.02] overflow-hidden"
                data-testid="card-products-review"
              >
                <CardHeader className="border-b border-white/[0.06] px-5 sm:px-6 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                        Products in Review
                      </CardTitle>

                      <CardDescription className="mt-1">
                        Review submissions and manage approved products.
                      </CardDescription>
                    </div>

                    {allProducts && (
                      <Badge
                        variant="outline"
                        className="border-white/10 bg-white/[0.03]"
                      >
                        {allProducts.length} total
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-5">
                  {allProductsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton
                          key={i}
                          className="h-36 w-full rounded-xl"
                        />
                      ))}
                    </div>
                  ) : !allProducts ||
                    allProducts.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-5 h-5 text-muted-foreground/40" />
                      </div>

                      <p
                        className="text-sm font-medium"
                        data-testid="text-no-products-review"
                      >
                        Review queue is empty
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        There are currently no products requiring review.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {allProducts.map((product) => (
                        <Card
                          key={product.id}
                          className="border-white/[0.07] bg-white/[0.02] overflow-hidden"
                          data-testid={`card-review-product-${product.id}`}
                        >
                          <CardContent className="p-4 sm:p-5 space-y-4">
                            {/* Product header */}
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-16 shrink-0 rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden flex items-center justify-center">
                                {product.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    data-testid={`img-product-${product.id}`}
                                  />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-muted-foreground/30" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h3
                                        className="font-semibold text-sm"
                                        data-testid={`text-review-product-name-${product.id}`}
                                      >
                                        {product.name}
                                      </h3>

                                      <StatusBadge
                                        status={product.status}
                                      />
                                    </div>

                                    <p className="text-xs text-muted-foreground mt-1">
                                      {product.category}
                                      <span className="mx-1.5 text-muted-foreground/30">
                                        •
                                      </span>
                                      ${(
                                        (product.price ?? 0) /
                                        100
                                      ).toFixed(2)}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap mt-3">
                                  {product.isFeatured && (
                                    <Badge
                                      variant="outline"
                                      className="border-amber-500/20 bg-amber-500/10 text-amber-400 text-[10px]"
                                    >
                                      <Star className="w-3 h-3 mr-1" />
                                      Featured
                                    </Badge>
                                  )}

                                  {product.isLimitedEdition && (
                                    <Badge
                                      variant="outline"
                                      className="border-purple-500/20 bg-purple-500/10 text-purple-400 text-[10px]"
                                    >
                                      <Sparkles className="w-3 h-3 mr-1" />
                                      Limited
                                    </Badge>
                                  )}

                                  {product.isVerified && (
                                    <Badge
                                      variant="outline"
                                      className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[10px]"
                                    >
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] px-3.5 py-3">
                              <p className="text-xs leading-relaxed text-muted-foreground">
                                {product.description}
                              </p>
                            </div>

                            {/* Pending review */}
                            {product.status === "pending" && (
                              <div className="space-y-3 pt-1">
                                <Input
                                  placeholder="Review notes (optional)"
                                  value={
                                    reviewNotes[product.id] || ""
                                  }
                                  onChange={(e) =>
                                    setReviewNotes((prev) => ({
                                      ...prev,
                                      [product.id]: e.target.value,
                                    }))
                                  }
                                  className="h-10 bg-white/[0.025] border-white/10"
                                  data-testid={`input-review-notes-${product.id}`}
                                />

                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                                    disabled={
                                      reviewMutation.isPending
                                    }
                                    onClick={() =>
                                      reviewMutation.mutate({
                                        id: product.id,
                                        status: "approved",
                                        reviewNotes:
                                          reviewNotes[product.id] ||
                                          "",
                                      })
                                    }
                                    data-testid={`button-approve-${product.id}`}
                                  >
                                    {reviewMutation.isPending ? (
                                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                    )}
                                    Approve
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={
                                      reviewMutation.isPending
                                    }
                                    onClick={() =>
                                      reviewMutation.mutate({
                                        id: product.id,
                                        status: "denied",
                                        reviewNotes:
                                          reviewNotes[product.id] ||
                                          "",
                                      })
                                    }
                                    data-testid={`button-deny-${product.id}`}
                                  >
                                    {reviewMutation.isPending ? (
                                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                    ) : (
                                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                    )}
                                    Deny
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Approved management */}
                            {product.status === "approved" && (
                              <div className="border-t border-white/[0.06] pt-4 space-y-4">
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
                                    Marketplace Badges
                                  </p>

                                  <div className="flex flex-wrap gap-x-5 gap-y-3">
                                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                                      <Checkbox
                                        checked={
                                          product.isFeatured ??
                                          false
                                        }
                                        onCheckedChange={(checked) =>
                                          badgeMutation.mutate({
                                            id: product.id,
                                            badges: {
                                              isFeatured: !!checked,
                                              isLimitedEdition:
                                                product.isLimitedEdition ??
                                                false,
                                              isVerified:
                                                product.isVerified ??
                                                false,
                                            },
                                          })
                                        }
                                        data-testid={`checkbox-featured-${product.id}`}
                                      />
                                      Featured
                                    </label>

                                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                                      <Checkbox
                                        checked={
                                          product.isLimitedEdition ??
                                          false
                                        }
                                        onCheckedChange={(checked) =>
                                          badgeMutation.mutate({
                                            id: product.id,
                                            badges: {
                                              isFeatured:
                                                product.isFeatured ??
                                                false,
                                              isLimitedEdition:
                                                !!checked,
                                              isVerified:
                                                product.isVerified ??
                                                false,
                                            },
                                          })
                                        }
                                        data-testid={`checkbox-limited-edition-${product.id}`}
                                      />
                                      Limited Edition
                                    </label>

                                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                                      <Checkbox
                                        checked={
                                          product.isVerified ?? false
                                        }
                                        onCheckedChange={(checked) =>
                                          badgeMutation.mutate({
                                            id: product.id,
                                            badges: {
                                              isFeatured:
                                                product.isFeatured ??
                                                false,
                                              isLimitedEdition:
                                                product.isLimitedEdition ??
                                                false,
                                              isVerified: !!checked,
                                            },
                                          })
                                        }
                                        data-testid={`checkbox-verified-${product.id}`}
                                      />
                                      Verified
                                    </label>
                                  </div>
                                </div>

                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-white/10"
                                    onClick={() =>
                                      openEdit(product)
                                    }
                                    data-testid={`button-edit-${product.id}`}
                                  >
                                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                                    Edit
                                  </Button>

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                        data-testid={`button-delete-${product.id}`}
                                      >
                                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                        Delete
                                      </Button>
                                    </AlertDialogTrigger>

                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Delete this product?
                                        </AlertDialogTitle>

                                        <AlertDialogDescription>
                                          "{product.name}" will be
                                          permanently removed from the
                                          marketplace and archived in
                                          Stripe. This cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>

                                      <AlertDialogFooter>
                                        <AlertDialogCancel
                                          data-testid={`button-cancel-delete-${product.id}`}
                                        >
                                          Cancel
                                        </AlertDialogCancel>

                                        <AlertDialogAction
                                          onClick={() =>
                                            deleteMutation.mutate(
                                              product.id,
                                            )
                                          }
                                          data-testid={`button-confirm-delete-${product.id}`}
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Edit Product Dialog */}
      <Dialog
        open={!!editingProduct}
        onOpenChange={(open) =>
          !open && setEditingProduct(null)
        }
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-white/10 bg-[#0d0d0d]">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center">
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </div>

              <div>
                <DialogTitle>Edit Product</DialogTitle>

                <DialogDescription className="mt-1">
                  Update the marketplace listing and supporting
                  information.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit((data) => {
                if (editingProduct) {
                  editMutation.mutate({
                    id: editingProduct.id,
                    data,
                  });
                }
              })}
              className="space-y-5 pt-2"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>

                    <FormControl>
                      <Input
                        className="h-11 bg-white/[0.025] border-white/10"
                        {...field}
                        data-testid="input-edit-name"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>

                    <FormControl>
                      <Textarea
                        className="min-h-[130px] bg-white/[0.025] border-white/10 resize-y"
                        {...field}
                        data-testid="input-edit-description"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (USD)</FormLabel>

                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="h-11 bg-white/[0.025] border-white/10"
                          {...field}
                          data-testid="input-edit-price"
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>

                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className="h-11 bg-white/[0.025] border-white/10"
                            data-testid="select-edit-category"
                          >
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem
                              key={cat}
                              value={cat}
                            >
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Image URL</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.png"
                        className="h-11 bg-white/[0.025] border-white/10"
                        {...field}
                        data-testid="input-edit-image-url"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Edit attachments */}
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium">
                    Attachments
                  </p>

                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manage supporting files attached to this product.
                  </p>
                </div>

                <UploadButton
                  endpoint="productAttachmentUploader"
                  onClientUploadComplete={(res) => {
                    if (res?.length) {
                      editForm.setValue("attachments", [
                        ...editAttachments,
                        ...res.map((r) => r.url),
                      ]);

                      toast({
                        title: `${res.length} file(s) uploaded`,
                      });
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast({
                      title: "Upload failed",
                      description: error.message,
                      variant: "destructive",
                    });
                  }}
                />

                <AttachmentList
                  attachments={editAttachments}
                  onRemove={(idx) =>
                    editForm.setValue(
                      "attachments",
                      editAttachments.filter(
                        (_, i) => i !== idx,
                      ),
                    )
                  }
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingProduct(null)}
                  disabled={editMutation.isPending}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={editMutation.isPending}
                  data-testid="button-save-edit"
                >
                  {editMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}