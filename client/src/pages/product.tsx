import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronLeft,
  Package,
  Star,
  Crown,
  Sparkles,
  ShoppingCart,
  CreditCard,
  Loader2,
  MessageSquare,
  FileText,
  Download,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Product } from "@shared/schema";

interface ProductWithSubmitter extends Product {
  submitter: { id: string; username: string; userRank: string } | null;
}

interface ReviewData {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  username: string;
  profileImageUrl: string | null;
}

function addToCart(product: ProductWithSubmitter) {
  const cart: { productId: string; name: string; price: number; imageUrl: string | null; quantity: number }[] =
    JSON.parse(localStorage.getItem("rivet_cart") || "[]");
  const existing = cart.find((item) => item.productId === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
    });
  }
  localStorage.setItem("rivet_cart", JSON.stringify(cart));
}

function StarRating({ rating, onRate, interactive = false, size = "md" }: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
  size?: "sm" | "md";
}) {
  const starSize = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(i)}
          className={interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}
          data-testid={`star-${i}`}
        >
          <Star
            className={`${starSize} ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-white/20"}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const { data: products = [], isLoading, isError } = useQuery<ProductWithSubmitter[]>({
    queryKey: ["/api/products"],
  });

  const product = products.find((p) => p.id === id);
  const isFree = product?.price === 0;

  // Vehicle Testers (and Team Members / admins) may "purchase" free products
  // so they can test them before public release.
  const teamRanks = [
    "Team Member",
    "Gameplay Engineer",
    "Creative Designer",
    "Staff Department Director",
    "Operations Manager",
    "Company Director",
  ];
  const userRanks = [user?.userRank, ...((user?.additionalRanks as string[]) || [])].filter(Boolean) as string[];
  const canTakeFree =
    !!user &&
    (user.isAdmin ||
      userRanks.includes("Vehicle Tester") ||
      userRanks.some((r) => teamRanks.includes(r)));
  const attachments = (product?.attachments as string[] | null) ?? [];

  const { data: reviews = [] } = useQuery<ReviewData[]>({
    queryKey: ["/api/products", id, "reviews"],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}/reviews`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!id,
  });

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const userReview = reviews.find((r) => r.userId === user?.id);

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/stripe/product-checkout", {
        productId: product!.id,
      });
      return res.json();
    },
    onSuccess: (data: { url: string }) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (err: Error) => {
      toast({
        title: "Checkout failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment.trim() || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", id, "reviews"] });
      toast({ title: "Review submitted" });
      setReviewRating(0);
      setReviewComment("");
    },
    onError: () => {
      toast({ title: "Failed to submit review", variant: "destructive" });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/products/${id}/reviews`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", id, "reviews"] });
      toast({ title: "Review deleted" });
    },
  });

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center gap-4 px-4">
        <Package className="w-16 h-16 text-white/15" />
        <h2 className="text-xl font-semibold" data-testid="text-product-error">
          Failed to load product
        </h2>
        <p className="text-sm text-white/40">Something went wrong. Please try again later.</p>
        <Link href="/store">
          <Button variant="outline" className="border-white/10" data-testid="button-back-to-store">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Store
          </Button>
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center gap-4 px-4">
        <Package className="w-16 h-16 text-white/15" />
        <h2 className="text-xl font-semibold" data-testid="text-product-not-found">
          Product not found
        </h2>
        <Link href="/store">
          <Button variant="outline" className="border-white/10" data-testid="button-back-to-store">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Store
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-in fade-in duration-500">
        <Link href="/store">
          <span
            className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors mb-8 cursor-pointer"
            data-testid="link-back-to-store"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Store
          </span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 mt-6">
          <div className="aspect-square bg-card rounded-xl overflow-hidden" data-testid="product-image-container">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                data-testid="img-product"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-20 h-20 text-white/10" />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {product.isCommunityProvided && (
                  <Badge
                    variant="secondary"
                    className="bg-gray-600/80 text-gray-100 text-[10px] font-medium border-0"
                    data-testid="badge-community"
                  >
                    Community Provided
                  </Badge>
                )}
                {product.isFeatured && (
                  <Badge
                    className="bg-blue-600/90 text-white text-[10px] font-medium border-0 hover:bg-blue-600"
                    data-testid="badge-featured"
                  >
                    <Star className="w-3 h-3 mr-0.5" />
                    Featured
                  </Badge>
                )}
                {product.isLimitedEdition && (
                  <Badge
                    className="bg-yellow-500/90 text-black text-[10px] font-semibold border-0 hover:bg-yellow-500"
                    data-testid="badge-limited"
                  >
                    <Crown className="w-3 h-3 mr-0.5" />
                    LIMITED EDITION
                  </Badge>
                )}
                {product.isVerified && (
                  <Badge
                    className="bg-green-600/90 text-white text-[10px] font-medium border-0 hover:bg-green-600"
                    data-testid="badge-verified"
                  >
                    <Sparkles className="w-3 h-3 mr-0.5" />
                    VERIFIED
                  </Badge>
                )}
              </div>

              <h1
                className="text-2xl font-semibold tracking-tight"
                data-testid="text-product-name"
              >
                {product.name}
              </h1>

              {product.category && (
                <p className="text-sm text-white/40" data-testid="text-product-category">
                  {product.category}
                </p>
              )}

              {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={Math.round(avgRating)} />
                  <span className="text-sm text-white/50">
                    {avgRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}
            </div>

            <p
              className="text-3xl font-semibold"
              data-testid="text-product-price"
            >
              {isFree ? "Free" : `$${(product.price / 100).toFixed(2)}`}
            </p>

            {product.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-white/60">Description</h3>
                <p
                  className="text-sm text-white/70 leading-relaxed"
                  data-testid="text-product-description"
                >
                  {product.description}
                </p>
              </div>
            )}

            {attachments.length > 0 && (
              <div className="space-y-2" data-testid="section-attachments">
                <h3 className="text-sm font-medium text-white/60">
                  Attachments ({attachments.length})
                </h3>
                <ul className="space-y-1.5">
                  {attachments.map((url, idx) => (
                    <li key={url}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                        data-testid={`link-attachment-${idx}`}
                      >
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate flex-1">
                          {url.split("/").pop() || url}
                        </span>
                        <Download className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.submitter && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/30">Submitted by</span>
                <Link href={`/profile/${product.submitter.id}`}>
                  <span
                    className="text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
                    data-testid="link-submitter"
                  >
                    {product.submitter.username}
                  </span>
                </Link>
              </div>
            )}

            <div className="border-t border-white/10 pt-6 space-y-3">
              {isFree ? (
                canTakeFree ? (
                  <Button
                    className="w-full bg-white text-black hover:bg-white/90"
                    size="lg"
                    onClick={() => checkoutMutation.mutate()}
                    disabled={checkoutMutation.isPending}
                    data-testid="button-claim-free"
                  >
                    {checkoutMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Get for Testing (Free)
                  </Button>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-white/40" data-testid="text-free-product-notice">
                      This product is reserved for Vehicle Testers
                    </p>
                  </div>
                )
              ) : (
                <>
                  <Button
                    className="w-full bg-white text-black hover:bg-white/90"
                    size="lg"
                    onClick={() => {
                      if (!user) {
                        toast({
                          title: "Login required",
                          description: "Please log in to purchase this product.",
                          variant: "destructive",
                        });
                        return;
                      }
                      checkoutMutation.mutate();
                    }}
                    disabled={checkoutMutation.isPending}
                    data-testid="button-buy-now"
                  >
                    {checkoutMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4 mr-2" />
                    )}
                    Buy Now
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-white/10"
                    size="lg"
                    onClick={handleAddToCart}
                    data-testid="button-add-to-cart"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2" data-testid="heading-reviews">
              <MessageSquare className="w-5 h-5" />
              Reviews ({reviews.length})
            </h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={Math.round(avgRating)} size="sm" />
                <span className="text-sm text-white/50">{avgRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {user && !userReview && (
            <Card className="bg-card border-white/5">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-medium text-white/70">Write a Review</p>
                <StarRating rating={reviewRating} onRate={setReviewRating} interactive />
                <Textarea
                  placeholder="Share your thoughts about this product..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="bg-white/5 border-white/10 text-white min-h-[80px] resize-none"
                  data-testid="textarea-review"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => reviewMutation.mutate()}
                    disabled={reviewRating === 0 || reviewMutation.isPending}
                    data-testid="button-submit-review"
                  >
                    {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {userReview && (
            <Card className="bg-card border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={userReview.profileImageUrl || undefined} />
                      <AvatarFallback>{userReview.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{userReview.username}</p>
                      <StarRating rating={userReview.rating} size="sm" />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/40 text-xs"
                    onClick={() => deleteReviewMutation.mutate()}
                    data-testid="button-delete-review"
                  >
                    Delete
                  </Button>
                </div>
                {userReview.comment && (
                  <p className="text-sm text-white/60 mt-2">{userReview.comment}</p>
                )}
                <p className="text-xs text-white/30 mt-1">Your review</p>
              </CardContent>
            </Card>
          )}

          {reviews.filter((r) => r.userId !== user?.id).length > 0 ? (
            <div className="space-y-3">
              {reviews
                .filter((r) => r.userId !== user?.id)
                .map((review) => (
                  <Card key={review.id} className="bg-card border-white/5" data-testid={`card-review-${review.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={review.profileImageUrl || undefined} />
                          <AvatarFallback>{review.username?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{review.username}</p>
                          <div className="flex items-center gap-2">
                            <StarRating rating={review.rating} size="sm" />
                            <span className="text-xs text-white/30">
                              {review.createdAt
                                ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })
                                : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-white/60 ml-11">{review.comment}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            !userReview && (
              <p className="text-sm text-white/30 text-center py-6">No reviews yet. Be the first to review!</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
