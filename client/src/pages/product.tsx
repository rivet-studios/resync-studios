import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation, useSearch } from "wouter";
import { useState, useEffect } from "react";
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
  CheckCircle,
  ArrowUpRight,
  ShieldCheck,
  UserRound,
  Tag,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Product, Payment } from "@shared/schema";

interface ProductWithSubmitter extends Product {
  submitter: {
    id: string;
    username: string;
    userRank: string;
  } | null;
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
  const cart: {
    productId: string;
    name: string;
    price: number;
    imageUrl: string | null;
    quantity: number;
  }[] = JSON.parse(localStorage.getItem("rivet_cart") || "[]");

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

function StarRating({
  rating,
  onRate,
  interactive = false,
  size = "md",
}: {
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
          className={
            interactive
              ? "cursor-pointer hover:scale-110 transition-transform"
              : "cursor-default"
          }
          data-testid={`star-${i}`}
        >
          <Star
            className={`${starSize} ${
              i <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-white/15"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { user } = useAuth();
  const { toast } = useToast();

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(search);

    if (params.get("free_granted") === "true") {
      if (params.get("already") === "true") {
        toast({
          title: "Already claimed",
          description: "You already have this product.",
        });
      } else {
        toast({
          title: "Product claimed!",
          description: "The product has been added to your library.",
        });

        queryClient.invalidateQueries({
          queryKey: ["/api/payments/my"],
        });
      }

      window.history.replaceState(
        {},
        "",
        `/store/product/${id}`,
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery<ProductWithSubmitter[]>({
    queryKey: ["/api/products"],
  });

  const { data: myPayments = [] } = useQuery<Payment[]>({
    queryKey: ["/api/payments/my"],
    enabled: !!user,
  });

  const product = products.find((p) => p.id === id);

  const isFree = product?.price === 0;

  const alreadyClaimed =
    isFree &&
    myPayments.some((p) => p.tierId === `product:${id}`);

  const teamRanks = [
    "Team Member",
    "Gameplay Engineer",
    "Creative Designer",
    "Staff Department Director",
    "Operations Manager",
    "Company Director",
  ];

  const userRanks = [
    user?.userRank,
    ...((user?.additionalRanks as string[]) || []),
  ].filter(Boolean) as string[];

  const canTakeFree =
    !!user &&
    (user.isAdmin ||
      userRanks.includes("Vehicle Tester") ||
      userRanks.some((rank) => teamRanks.includes(rank)));

  const attachments =
    (product?.attachments as string[] | null) ?? [];

  const {
    data: reviews = [],
  } = useQuery<ReviewData[]>({
    queryKey: ["/api/products", id, "reviews"],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}/reviews`);

      if (!res.ok) return [];

      const data = await res.json();

      return Array.isArray(data) ? data : [];
    },
    enabled: !!id,
  });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length
      : 0;

  const userReview = reviews.find(
    (review) => review.userId === user?.id,
  );

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "POST",
        "/api/stripe/product-checkout",
        {
          productId: product!.id,
        },
      );

      return res.json();
    },

    onSuccess: (data: { url: string; free?: boolean }) => {
      if (data.url) {
        if (data.free) {
          queryClient.invalidateQueries({
            queryKey: ["/api/payments/my"],
          });
        }

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
      const res = await apiRequest(
        "POST",
        `/api/products/${id}/reviews`,
        {
          rating: reviewRating,
          comment: reviewComment.trim() || null,
        },
      );

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/products", id, "reviews"],
      });

      toast({
        title: "Review submitted",
      });

      setReviewRating(0);
      setReviewComment("");
    },

    onError: () => {
      toast({
        title: "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(
        "DELETE",
        `/api/products/${id}/reviews`,
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/products", id, "reviews"],
      });

      toast({
        title: "Review deleted",
      });
    },

    onError: () => {
      toast({
        title: "Failed to delete review",
        variant: "destructive",
      });
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
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Skeleton className="h-5 w-32 mb-8" />

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12">
            <Skeleton className="aspect-square w-full rounded-3xl" />

            <div className="space-y-5">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-4/5" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
          <Package className="w-7 h-7 text-white/15" />
        </div>

        <div className="text-center">
          <h2
            className="text-xl font-semibold text-white"
            data-testid="text-product-error"
          >
            Failed to load product
          </h2>

          <p className="text-sm text-white/35 mt-2">
            Something went wrong. Please try again later.
          </p>
        </div>

        <Button
          variant="outline"
          className="border-white/10 bg-white/[0.02] rounded-xl"
          asChild
          data-testid="button-back-to-store"
        >
          <Link href="/store">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Store
          </Link>
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
          <Package className="w-7 h-7 text-white/15" />
        </div>

        <div className="text-center">
          <h2
            className="text-xl font-semibold text-white"
            data-testid="text-product-not-found"
          >
            Product not found
          </h2>

          <p className="text-sm text-white/35 mt-2">
            This product may have been removed or is no longer available.
          </p>
        </div>

        <Button
          variant="outline"
          className="border-white/10 bg-white/[0.02] rounded-xl"
          asChild
          data-testid="button-back-to-store"
        >
          <Link href="/store">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Store
          </Link>
        </Button>
      </div>
    );
  }

  const otherReviews = reviews.filter(
    (review) => review.userId !== user?.id,
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb */}
        <div className="mb-7">
          <Link href="/store">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white/35 hover:text-white transition-colors cursor-pointer"
              data-testid="link-back-to-store"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back to Store
            </span>
          </Link>
        </div>

        {/* Product Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="relative">
            <div
              className="aspect-square rounded-3xl overflow-hidden bg-card/60 border border-white/5 shadow-2xl shadow-black/20"
              data-testid="product-image-container"
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  data-testid="img-product"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/[0.015]">
                  <Package className="w-24 h-24 text-white/[0.06]" />
                </div>
              )}
            </div>

            {/* Image status strip */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 flex-wrap">
                {product.isVerified && (
                  <Badge
                    className="bg-black/70 backdrop-blur-md text-white border border-white/10 rounded-lg"
                    data-testid="badge-verified"
                  >
                    <Sparkles className="w-3 h-3 mr-1 text-green-400" />
                    Verified
                  </Badge>
                )}

                {product.isFeatured && (
                  <Badge
                    className="bg-black/70 backdrop-blur-md text-white border border-white/10 rounded-lg"
                    data-testid="badge-featured"
                  >
                    <Star className="w-3 h-3 mr-1 text-blue-400" />
                    Featured
                  </Badge>
                )}

                {product.isLimitedEdition && (
                  <Badge
                    className="bg-black/70 backdrop-blur-md text-white border border-white/10 rounded-lg"
                    data-testid="badge-limited"
                  >
                    <Crown className="w-3 h-3 mr-1 text-yellow-400" />
                    Limited Edition
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              {product.isCommunityProvided && (
                <Badge
                  variant="secondary"
                  className="bg-white/[0.06] text-white/60 border border-white/5 text-[10px] font-medium rounded-lg"
                  data-testid="badge-community"
                >
                  Community Provided
                </Badge>
              )}

              {product.isFeatured && (
                <Badge
                  className="bg-blue-500/10 text-blue-400 border border-blue-500/10 text-[10px] font-medium rounded-lg"
                  data-testid="badge-featured"
                >
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}

              {product.isLimitedEdition && (
                <Badge
                  className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/10 text-[10px] font-medium rounded-lg"
                  data-testid="badge-limited"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Limited Edition
                </Badge>
              )}

              {product.isVerified && (
                <Badge
                  className="bg-green-500/10 text-green-400 border border-green-500/10 text-[10px] font-medium rounded-lg"
                  data-testid="badge-verified"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            <h1
              className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight"
              data-testid="text-product-name"
            >
              {product.name}
            </h1>

            {product.category && (
              <div
                className="flex items-center gap-1.5 mt-3 text-sm text-white/35"
                data-testid="text-product-category"
              >
                <Tag className="w-3.5 h-3.5" />
                {product.category}
              </div>
            )}

            {reviews.length > 0 && (
              <div className="flex items-center gap-2.5 mt-5">
                <StarRating rating={Math.round(avgRating)} size="sm" />

                <span className="text-sm font-medium text-white/65">
                  {avgRating.toFixed(1)}
                </span>

                <span className="text-sm text-white/25">
                  ·
                </span>

                <span className="text-sm text-white/35">
                  {reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>
            )}

            <div className="mt-7">
              <p
                className="text-3xl sm:text-4xl font-semibold text-white tracking-tight"
                data-testid="text-product-price"
              >
                {isFree
                  ? "Free"
                  : `$${(product.price / 100).toFixed(2)}`}
              </p>

              {!isFree && (
                <p className="text-xs text-white/25 mt-1">
                  One-time purchase
                </p>
              )}
            </div>

            {product.description && (
              <div className="mt-7">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-5 h-5 rounded-md bg-white/[0.04] flex items-center justify-center">
                    <FileText className="w-3 h-3 text-white/35" />
                  </div>

                  <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35">
                    Description
                  </h2>
                </div>

                <p
                  className="text-sm text-white/55 leading-7"
                  data-testid="text-product-description"
                >
                  {product.description}
                </p>
              </div>
            )}

            {/* Purchase Panel */}
            <div className="mt-8 rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5">
              {isFree ? (
                alreadyClaimed ? (
                  <div
                    className="flex items-center gap-3 rounded-xl border border-green-500/10 bg-green-500/[0.06] px-4 py-3.5"
                    data-testid="banner-already-claimed"
                  >
                    <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-green-400">
                        Already claimed
                      </p>

                      <p className="text-xs text-green-400/50 mt-0.5">
                        This product is in your library.
                      </p>
                    </div>
                  </div>
                ) : canTakeFree ? (
                  <Button
                    className="w-full bg-white text-black hover:bg-white/90 rounded-xl"
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
                    Claim for Free
                  </Button>
                ) : (
                  <div className="flex items-center gap-3 py-2">
                    <ShieldCheck className="w-5 h-5 text-white/20 shrink-0" />

                    <div>
                      <p
                        className="text-sm font-medium text-white/50"
                        data-testid="text-free-product-notice"
                      >
                        Tester access only
                      </p>

                      <p className="text-xs text-white/25 mt-0.5">
                        This free product is currently reserved for
                        authorized testers.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  <Button
                    className="w-full bg-white text-black hover:bg-white/90 rounded-xl"
                    size="lg"
                    onClick={() => {
                      if (!user) {
                        toast({
                          title: "Login required",
                          description:
                            "Please log in to purchase this product.",
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
                    className="w-full border-white/10 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl"
                    size="lg"
                    onClick={handleAddToCart}
                    data-testid="button-add-to-cart"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              )}

              <p className="text-[10px] text-white/20 text-center mt-3">
                Secure checkout powered by RIVET
              </p>
            </div>

            {/* Submitter */}
            {product.submitter && (
              <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.015] px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/5 flex items-center justify-center shrink-0">
                    <UserRound className="w-3.5 h-3.5 text-white/30" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-white/20">
                      Submitted by
                    </p>

                    <Link href={`/profile/${product.submitter.id}`}>
                      <span
                        className="text-xs font-medium text-white/55 hover:text-white transition-colors cursor-pointer"
                        data-testid="link-submitter"
                      >
                        {product.submitter.username}
                      </span>
                    </Link>
                  </div>
                </div>

                <ArrowUpRight className="w-3.5 h-3.5 text-white/15 shrink-0" />
              </div>
            )}
          </div>
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <section
            className="mt-12 pt-8 border-t border-white/5"
            data-testid="section-attachments"
          >
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Product Files
                </h2>

                <p className="text-xs text-white/30 mt-1">
                  Files and resources included with this product.
                </p>
              </div>

              <Badge className="bg-white/[0.04] border border-white/5 text-white/35 rounded-lg">
                {attachments.length}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attachments.map((url, idx) => {
                const fileName =
                  url.split("/").pop() || `Attachment ${idx + 1}`;

                return (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-xl border border-white/5 bg-card/50 px-4 py-3.5 hover:border-white/10 hover:bg-white/[0.03] transition-colors"
                    data-testid={`link-attachment-${idx}`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/5 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-white/30" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/55 group-hover:text-white transition-colors truncate">
                        {fileName}
                      </p>

                      <p className="text-[10px] text-white/20 mt-0.5">
                        Downloadable file
                      </p>
                    </div>

                    <Download className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="mt-12 pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-white/35" />

                <h2
                  className="text-lg font-semibold text-white"
                  data-testid="heading-reviews"
                >
                  Reviews
                </h2>

                <Badge className="bg-white/[0.04] border border-white/5 text-white/35 rounded-lg">
                  {reviews.length}
                </Badge>
              </div>

              <p className="text-xs text-white/30 mt-1">
                Feedback from members who have used this product.
              </p>
            </div>

            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <StarRating
                  rating={Math.round(avgRating)}
                  size="sm"
                />

                <span className="text-sm font-medium text-white/60">
                  {avgRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Review composer */}
          {user && !userReview && (
            <Card className="bg-card/60 border-white/5 rounded-2xl mb-4">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white/30" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white">
                      Write a Review
                    </p>

                    <p className="text-xs text-white/25 mt-0.5">
                      Share your experience with this product.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <StarRating
                    rating={reviewRating}
                    onRate={setReviewRating}
                    interactive
                  />

                  <Textarea
                    placeholder="Share your thoughts about this product..."
                    value={reviewComment}
                    onChange={(e) =>
                      setReviewComment(e.target.value)
                    }
                    className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 min-h-[100px] resize-none rounded-xl focus-visible:ring-white/10"
                    data-testid="textarea-review"
                  />

                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="rounded-lg"
                      onClick={() => reviewMutation.mutate()}
                      disabled={
                        reviewRating === 0 ||
                        reviewMutation.isPending
                      }
                      data-testid="button-submit-review"
                    >
                      {reviewMutation.isPending
                        ? "Submitting..."
                        : "Submit Review"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current user's review */}
          {userReview && (
            <Card className="bg-blue-500/[0.03] border-blue-500/10 rounded-2xl mb-4">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarImage
                        src={
                          userReview.profileImageUrl ||
                          undefined
                        }
                      />
                      <AvatarFallback className="bg-white/[0.05] text-white/50">
                        {userReview.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">
                          {userReview.username}
                        </p>

                        <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/10 text-[9px] rounded-md">
                          Your Review
                        </Badge>
                      </div>

                      <div className="mt-1">
                        <StarRating
                          rating={userReview.rating}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/30 hover:text-red-400 hover:bg-red-500/5 text-xs rounded-lg"
                    onClick={() =>
                      deleteReviewMutation.mutate()
                    }
                    disabled={deleteReviewMutation.isPending}
                    data-testid="button-delete-review"
                  >
                    {deleteReviewMutation.isPending
                      ? "Deleting..."
                      : "Delete"}
                  </Button>
                </div>

                {userReview.comment && (
                  <p className="text-sm text-white/50 leading-relaxed mt-4">
                    {userReview.comment}
                  </p>
                )}

                <p className="text-[11px] text-white/20 mt-3">
                  Your review
                </p>
              </CardContent>
            </Card>
          )}

          {/* Existing reviews */}
          {otherReviews.length > 0 ? (
            <div className="space-y-3">
              {otherReviews.map((review) => (
                <Card
                  key={review.id}
                  className="bg-card/60 border-white/5 rounded-2xl"
                  data-testid={`card-review-${review.id}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-9 h-9 shrink-0">
                        <AvatarImage
                          src={
                            review.profileImageUrl ||
                            undefined
                          }
                        />

                        <AvatarFallback className="bg-white/[0.04] text-white/40">
                          {review.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <p className="text-sm font-medium text-white/75">
                            {review.username}
                          </p>

                          <span className="text-[11px] text-white/20">
                            {review.createdAt
                              ? formatDistanceToNow(
                                  new Date(review.createdAt),
                                  {
                                    addSuffix: true,
                                  },
                                )
                              : ""}
                          </span>
                        </div>

                        <div className="mt-1.5">
                          <StarRating
                            rating={review.rating}
                            size="sm"
                          />
                        </div>

                        {review.comment && (
                          <p className="text-sm text-white/45 leading-relaxed mt-3">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            !userReview && (
              <Card className="bg-card/50 border-white/5 rounded-2xl">
                <CardContent className="py-12 px-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-5 h-5 text-white/15" />
                  </div>

                  <h3 className="text-sm font-medium text-white/60">
                    No reviews yet
                  </h3>

                  <p className="text-xs text-white/30 mt-1 max-w-xs mx-auto">
                    Be the first to share your experience with this
                    product.
                  </p>
                </CardContent>
              </Card>
            )
          )}
        </section>

        {/* Bottom store navigation */}
        <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/25">
              Looking for something else?
            </p>

            <Link href="/store">
              <span className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">
                Browse the RIVET Store
              </span>
            </Link>
          </div>

          <Link href="/store">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/35 hover:text-white hover:bg-white/5 rounded-lg"
            >
              View Store
              <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}