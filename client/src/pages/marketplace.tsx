import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";
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
} from "lucide-react";

const submitProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Price must be a positive number"
  ),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().url("Must be a valid URL").or(z.literal("")),
});

type SubmitProductForm = z.infer<typeof submitProductSchema>;

const CATEGORIES = ["Game Assets", "Accessories", "Services", "Other"];

function StatusBadge({ status }: { status: string | null }) {
  if (status === "Approved") {
    return (
      <Badge variant="default" className="bg-green-600 border-green-600" data-testid="badge-status-approved">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Approved
      </Badge>
    );
  }
  if (status === "Denied") {
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

export default function Marketplace() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const isOpsManager =
    user?.userRank === "Operations Manager" ||
    user?.userRank === "Company Director" ||
    user?.isAdmin;

  const form = useForm<SubmitProductForm>({
    resolver: zodResolver(submitProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      category: "",
      imageUrl: "",
    },
  });

  const { data: myProducts, isLoading: myProductsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/my"],
    enabled: isAuthenticated,
  });

  const { data: allProducts, isLoading: allProductsLoading } = useQuery<Product[]>({
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
      });
    },
    onSuccess: () => {
      toast({ title: "Product submitted for review" });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/products/my"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to submit product", description: error.message, variant: "destructive" });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, reviewNotes }: { id: string; status: string; reviewNotes: string }) => {
      await apiRequest("PATCH", `/api/products/${id}/review`, { status, reviewNotes });
    },
    onSuccess: () => {
      toast({ title: "Product review updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/products/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/my"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update review", description: error.message, variant: "destructive" });
    },
  });

  const badgeMutation = useMutation({
    mutationFn: async ({ id, badges }: { id: string; badges: { isFeatured: boolean; isLimitedEdition: boolean; isVerified: boolean } }) => {
      await apiRequest("PATCH", `/api/products/${id}/badges`, badges);
    },
    onSuccess: () => {
      toast({ title: "Badges updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/products/all"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update badges", description: error.message, variant: "destructive" });
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
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 animate-in fade-in duration-500" data-testid="page-marketplace">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" data-testid="text-marketplace-title">
          <Package className="w-6 h-6" />
          Marketplace
        </h1>
        <p className="text-sm text-muted-foreground">
          Submit products for review and browse the community marketplace.
        </p>
      </div>

      {isAuthenticated ? (
        <Card className="bg-[#121212] border-[#1e1e1e]" data-testid="card-submit-product">
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} data-testid="input-product-name" />
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
                        <Textarea placeholder="Describe your product" {...field} data-testid="input-product-description" />
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
                          <Input type="number" step="0.01" min="0.01" placeholder="9.99" {...field} data-testid="input-product-price" />
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-product-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat} data-testid={`select-option-${cat.toLowerCase().replace(/\s/g, "-")}`}>
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
                        <Input placeholder="https://example.com/image.png" {...field} data-testid="input-product-image-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={submitMutation.isPending} data-testid="button-submit-product">
                  {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Submit Product
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-[#121212] border-[#1e1e1e]">
          <CardContent className="py-8 text-center text-muted-foreground">
            Please sign in to submit products.
          </CardContent>
        </Card>
      )}

      {isAuthenticated && (
        <Card className="bg-[#121212] border-[#1e1e1e]" data-testid="card-my-submissions">
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
              <p className="text-sm text-muted-foreground py-4" data-testid="text-no-submissions">
                You haven't submitted any products yet.
              </p>
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
                    <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                      <TableCell className="font-medium" data-testid={`text-product-name-${product.id}`}>
                        {product.name}
                      </TableCell>
                      <TableCell data-testid={`text-product-category-${product.id}`}>
                        {product.category}
                      </TableCell>
                      <TableCell data-testid={`text-product-price-${product.id}`}>
                        ${((product.price ?? 0) / 100).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={product.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground" data-testid={`text-review-notes-${product.id}`}>
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

      {isOpsManager && (
        <Card className="bg-[#121212] border-[#1e1e1e]" data-testid="card-products-review">
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
              <p className="text-sm text-muted-foreground py-4" data-testid="text-no-products-review">
                No products to review.
              </p>
            ) : (
              <div className="space-y-4">
                {allProducts.map((product) => (
                  <Card key={product.id} className="bg-[#0a0a0a] border-[#1e1e1e]" data-testid={`card-review-product-${product.id}`}>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold" data-testid={`text-review-product-name-${product.id}`}>
                              {product.name}
                            </span>
                            <StatusBadge status={product.status} />
                            {product.isFeatured && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="w-3 h-3 mr-1" /> Featured
                              </Badge>
                            )}
                            {product.isLimitedEdition && (
                              <Badge variant="secondary" className="text-xs">
                                <Sparkles className="w-3 h-3 mr-1" /> Limited
                              </Badge>
                            )}
                            {product.isVerified && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                          <p className="text-sm">
                            Category: {product.category} | Price: ${((product.price ?? 0) / 100).toFixed(2)}
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

                      {product.status === "Pending" && (
                        <div className="space-y-2">
                          <Input
                            placeholder="Review notes (optional)"
                            value={reviewNotes[product.id] || ""}
                            onChange={(e) =>
                              setReviewNotes((prev) => ({ ...prev, [product.id]: e.target.value }))
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
                                  reviewNotes: reviewNotes[product.id] || "",
                                })
                              }
                              data-testid={`button-approve-${product.id}`}
                            >
                              {reviewMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              disabled={reviewMutation.isPending}
                              onClick={() =>
                                reviewMutation.mutate({
                                  id: product.id,
                                  status: "denied",
                                  reviewNotes: reviewNotes[product.id] || "",
                                })
                              }
                              data-testid={`button-deny-${product.id}`}
                            >
                              {reviewMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                              Deny
                            </Button>
                          </div>
                        </div>
                      )}

                      {product.status === "Approved" && (
                        <div className="flex items-center gap-4 flex-wrap pt-2 border-t border-[#1e1e1e]">
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <Checkbox
                              checked={product.isFeatured ?? false}
                              onCheckedChange={(checked) =>
                                badgeMutation.mutate({
                                  id: product.id,
                                  badges: {
                                    isFeatured: !!checked,
                                    isLimitedEdition: product.isLimitedEdition ?? false,
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
                                    isLimitedEdition: product.isLimitedEdition ?? false,
                                    isVerified: !!checked,
                                  },
                                })
                              }
                              data-testid={`checkbox-verified-${product.id}`}
                            />
                            Verified
                          </label>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
