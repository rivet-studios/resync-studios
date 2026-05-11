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
import { Trash2, Pencil, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Send,
  ShieldCheck,
  Star,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  BarChart3,
  DollarSign,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";

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
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, "Price must be 0 or more"),
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
        variant="default"
        className="bg-green-600 border-green-600"
        data-testid="badge-status-approved"
      >
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Approved
      </Badge>
    );
  }
  if (status === "denied") {
    return (
      <Badge variant="destructive" data-testid="badge-status-denied">
        <XCircle className="w-3 h-3 mr-1" />
        Denied
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" data-testid="badge-status-pending">
      <Clock className="w-3 h-3 mr-1" />
      Pending
    </Badge>
  );
}

function DashboardStats({ stats }: { stats: MarketplaceStats }) {
  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-blue-400",
    },
    {
      title: "Approved",
      value: stats.approvedProducts,
      icon: CheckCircle2,
      color: "text-green-400",
    },
    {
      title: "Pending Review",
      value: stats.pendingProducts,
      icon: Clock,
      color: "text-yellow-400",
    },
    {
      title: "Total Sales",
      value: `$${(stats.totalSales / 100).toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-400",
    },
  ];

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
      data-testid="marketplace-stats"
    >
      {statCards.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
                <p
                  className="text-lg font-semibold"
                  data-testid={`stat-${stat.title.toLowerCase().replace(/\s/g, "-")}`}
                >
                  {stat.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Marketplace() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Team Member rank (and any other staff/admin rank) can review, edit, and
  // delete products. Mirrors the backend `isAdminUser` check.
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
    (user?.additionalRanks || []).some((r: string) => teamRanks.includes(r));

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

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

  const { data: myProducts, isLoading: myProductsLoading } = useQuery<
    Product[]
  >({
    queryKey: ["/api/products/my"],
    enabled: isAuthenticated,
  });

  const { data: marketplaceStats, isLoading: statsLoading } =
    useQuery<MarketplaceStats>({
      queryKey: ["/api/marketplace/stats"],
      enabled: isAuthenticated,
    });

  const { data: allProducts, isLoading: allProductsLoading } = useQuery<
    Product[]
  >({
    queryKey: ["/api/products/all"],
    enabled: !!isOpsManager,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: SubmitProductForm) => {
      const priceInCents = Math.round(parseFloat(data.price) * 100);
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
      toast({ title: "Product submitted for review" });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/products/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/stats"] });
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
      toast({ title: "Product review updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/products/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/my"] });
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
    mutationFn: async ({ id, data }: { id: string; data: EditProductForm }) => {
      const priceInCents = Math.round(parseFloat(data.price) * 100);
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
      toast({ title: "Product updated" });
      setEditingProduct(null);
      queryClient.invalidateQueries({ queryKey: ["/api/products/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/my"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update product", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Product deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/products/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/my"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete product", description: error.message, variant: "destructive" });
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
      toast({ title: "Badges updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/products/all"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update badges",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  function onSubmit(data: SubmitProductForm) {
    submitMutation.mutate(data);
  }

  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div
      className="max-w-5xl mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-500"
      data-testid="page-marketplace"
    >
      <div className="space-y-2">
        <h1
          className="text-2xl font-bold tracking-tight flex items-center gap-2"
          data-testid="text-marketplace-title"
        >
          <ShoppingBag className="w-6 h-6" />
          Marketplace
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your products, track sales, and grow your store.
        </p>
      </div>

      {isAuthenticated && (
        <>
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : marketplaceStats ? (
            <DashboardStats stats={marketplaceStats} />
          ) : null}
        </>
      )}

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="products" data-testid="tab-products">
            <Package className="w-4 h-4 mr-2" />
            My Products
          </TabsTrigger>
          <TabsTrigger value="submit" data-testid="tab-submit">
            <Send className="w-4 h-4 mr-2" />
            Submit Product
          </TabsTrigger>
          {isOpsManager && (
            <TabsTrigger value="review" data-testid="tab-review">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Review Queue
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="products">
          {!isAuthenticated ? (
            <Card className="bg-card border-border">
              <CardContent className="py-8 text-center text-muted-foreground">
                Please sign in to view your products.
              </CardContent>
            </Card>
          ) : (
            <Card
              className="bg-card border-border"
              data-testid="card-my-submissions"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  My Submissions
                </CardTitle>
                <CardDescription>
                  Track the status of your submitted products.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {myProductsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : !myProducts || myProducts.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    <p
                      className="text-sm text-muted-foreground"
                      data-testid="text-no-submissions"
                    >
                      You haven't submitted any products yet.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Switch to the "Submit Product" tab to get started.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Review Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myProducts.map((product) => (
                        <TableRow
                          key={product.id}
                          data-testid={`row-product-${product.id}`}
                        >
                          <TableCell
                            className="font-medium"
                            data-testid={`text-product-name-${product.id}`}
                          >
                            {product.name}
                          </TableCell>
                          <TableCell
                            data-testid={`text-product-category-${product.id}`}
                          >
                            {product.category}
                          </TableCell>
                          <TableCell
                            data-testid={`text-product-price-${product.id}`}
                          >
                            ${((product.price ?? 0) / 100).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={product.status} />
                          </TableCell>
                          <TableCell
                            className="text-sm text-muted-foreground"
                            data-testid={`text-review-notes-${product.id}`}
                          >
                            {product.reviewNotes || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="submit">
          {isAuthenticated ? (
            <Card
              className="bg-card border-border"
              data-testid="card-submit-product"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Submit a Product
                </CardTitle>
                <CardDescription>
                  Fill out the form below to submit a product for review.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter product name"
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
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your product"
                              {...field}
                              data-testid="input-product-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <SelectTrigger data-testid="select-product-category">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CATEGORIES.map((cat) => (
                                  <SelectItem
                                    key={cat}
                                    value={cat}
                                    data-testid={`select-option-${cat.toLowerCase().replace(/\s/g, "-")}`}
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
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL (optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/image.png"
                              {...field}
                              data-testid="input-product-image-url"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <FormLabel>Attachments (optional)</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Upload up to 10 supporting files (images, PDFs, audio,
                        video, archives, etc.).
                      </p>
                      <UploadButton
                        endpoint="productAttachmentUploader"
                        onClientUploadComplete={(res) => {
                          if (res?.length) {
                            form.setValue("attachments", [
                              ...submitAttachments,
                              ...res.map((r) => r.url),
                            ]);
                            toast({ title: `${res.length} file(s) uploaded` });
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
                      {submitAttachments.length > 0 && (
                        <ul className="space-y-1 text-xs">
                          {submitAttachments.map((url, idx) => (
                            <li
                              key={url}
                              className="flex items-center justify-between gap-2 rounded border border-border bg-secondary/40 px-2 py-1"
                              data-testid={`attachment-row-${idx}`}
                            >
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 truncate text-foreground hover:underline"
                              >
                                <FileText className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">
                                  {url.split("/").pop() || url}
                                </span>
                              </a>
                              <button
                                type="button"
                                aria-label="Remove attachment"
                                onClick={() =>
                                  form.setValue(
                                    "attachments",
                                    submitAttachments.filter((_, i) => i !== idx),
                                  )
                                }
                                className="text-muted-foreground hover:text-destructive"
                                data-testid={`button-remove-attachment-${idx}`}
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={submitMutation.isPending}
                      data-testid="button-submit-product"
                    >
                      {submitMutation.isPending && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Submit Product
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-8 text-center text-muted-foreground">
                Please sign in to submit products.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {isOpsManager && (
          <TabsContent value="review">
            <Card
              className="bg-card border-border"
              data-testid="card-products-review"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  Products in Review
                </CardTitle>
                <CardDescription>
                  Approve or deny submitted products.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allProductsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : !allProducts || allProducts.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <ShieldCheck className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    <p
                      className="text-sm text-muted-foreground"
                      data-testid="text-no-products-review"
                    >
                      No products to review.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allProducts.map((product) => (
                      <Card
                        key={product.id}
                        className="bg-secondary/30 border-border"
                        data-testid={`card-review-product-${product.id}`}
                      >
                        <CardContent className="pt-4 space-y-3">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className="font-semibold"
                                  data-testid={`text-review-product-name-${product.id}`}
                                >
                                  {product.name}
                                </span>
                                <StatusBadge status={product.status} />
                                {product.isFeatured && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    <Star className="w-3 h-3 mr-1" /> Featured
                                  </Badge>
                                )}
                                {product.isLimitedEdition && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    <Sparkles className="w-3 h-3 mr-1" />{" "}
                                    Limited
                                  </Badge>
                                )}
                                {product.isVerified && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    <CheckCircle2 className="w-3 h-3 mr-1" />{" "}
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {product.description}
                              </p>
                              <p className="text-sm">
                                Category: {product.category} | Price: $
                                {((product.price ?? 0) / 100).toFixed(2)}
                              </p>
                            </div>

                            {product.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-16 h-16 rounded-md object-cover"
                                data-testid={`img-product-${product.id}`}
                              />
                            )}
                          </div>

                          {product.status === "pending" && (
                            <div className="space-y-2">
                              <Input
                                placeholder="Review notes (optional)"
                                value={reviewNotes[product.id] || ""}
                                onChange={(e) =>
                                  setReviewNotes((prev) => ({
                                    ...prev,
                                    [product.id]: e.target.value,
                                  }))
                                }
                                data-testid={`input-review-notes-${product.id}`}
                              />
                              <div className="flex gap-2 flex-wrap">
                                <Button
                                  variant="default"
                                  className="bg-green-600 border-green-600"
                                  disabled={reviewMutation.isPending}
                                  onClick={() =>
                                    reviewMutation.mutate({
                                      id: product.id,
                                      status: "approved",
                                      reviewNotes:
                                        reviewNotes[product.id] || "",
                                    })
                                  }
                                  data-testid={`button-approve-${product.id}`}
                                >
                                  {reviewMutation.isPending && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  )}
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  disabled={reviewMutation.isPending}
                                  onClick={() =>
                                    reviewMutation.mutate({
                                      id: product.id,
                                      status: "denied",
                                      reviewNotes:
                                        reviewNotes[product.id] || "",
                                    })
                                  }
                                  data-testid={`button-deny-${product.id}`}
                                >
                                  {reviewMutation.isPending && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  )}
                                  Deny
                                </Button>
                              </div>
                            </div>
                          )}

                          {product.status === "approved" && (
                            <div className="flex items-center gap-4 flex-wrap pt-2 border-t border-border">
                              <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <Checkbox
                                  checked={product.isFeatured ?? false}
                                  onCheckedChange={(checked) =>
                                    badgeMutation.mutate({
                                      id: product.id,
                                      badges: {
                                        isFeatured: !!checked,
                                        isLimitedEdition:
                                          product.isLimitedEdition ?? false,
                                        isVerified: product.isVerified ?? false,
                                      },
                                    })
                                  }
                                  data-testid={`checkbox-featured-${product.id}`}
                                />
                                Featured
                              </label>
                              <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <Checkbox
                                  checked={product.isLimitedEdition ?? false}
                                  onCheckedChange={(checked) =>
                                    badgeMutation.mutate({
                                      id: product.id,
                                      badges: {
                                        isFeatured: product.isFeatured ?? false,
                                        isLimitedEdition: !!checked,
                                        isVerified: product.isVerified ?? false,
                                      },
                                    })
                                  }
                                  data-testid={`checkbox-limited-edition-${product.id}`}
                                />
                                Limited Edition
                              </label>
                              <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <Checkbox
                                  checked={product.isVerified ?? false}
                                  onCheckedChange={(checked) =>
                                    badgeMutation.mutate({
                                      id: product.id,
                                      badges: {
                                        isFeatured: product.isFeatured ?? false,
                                        isLimitedEdition:
                                          product.isLimitedEdition ?? false,
                                        isVerified: !!checked,
                                      },
                                    })
                                  }
                                  data-testid={`checkbox-verified-${product.id}`}
                                />
                                Verified
                              </label>
                              <div className="ml-auto flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEdit(product)}
                                  data-testid={`button-edit-${product.id}`}
                                >
                                  <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      data-testid={`button-delete-${product.id}`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete this product?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        "{product.name}" will be permanently
                                        removed from the marketplace and
                                        archived in Stripe. This cannot be
                                        undone.
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
                                          deleteMutation.mutate(product.id)
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

      <Dialog
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details. Setting a price above $0 on a previously
              free product will automatically mark it Verified and enable
              purchasing.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit((data) => {
                if (editingProduct) {
                  editMutation.mutate({ id: editingProduct.id, data });
                }
              })}
              className="space-y-3"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-name" />
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
                      <Textarea {...field} data-testid="input-edit-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
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
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-image-url" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormLabel>Attachments</FormLabel>
                <UploadButton
                  endpoint="productAttachmentUploader"
                  onClientUploadComplete={(res) => {
                    if (res?.length) {
                      editForm.setValue("attachments", [
                        ...editAttachments,
                        ...res.map((r) => r.url),
                      ]);
                      toast({ title: `${res.length} file(s) uploaded` });
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
                {editAttachments.length > 0 && (
                  <ul className="space-y-1 text-xs">
                    {editAttachments.map((url, idx) => (
                      <li
                        key={url}
                        className="flex items-center justify-between gap-2 rounded border border-border bg-secondary/40 px-2 py-1"
                      >
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 truncate text-foreground hover:underline"
                        >
                          <FileText className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {url.split("/").pop() || url}
                          </span>
                        </a>
                        <button
                          type="button"
                          aria-label="Remove attachment"
                          onClick={() =>
                            editForm.setValue(
                              "attachments",
                              editAttachments.filter((_, i) => i !== idx),
                            )
                          }
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingProduct(null)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editMutation.isPending}
                  data-testid="button-save-edit"
                >
                  {editMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
