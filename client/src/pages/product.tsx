import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  Package,
  Star,
  Crown,
  Sparkles,
  ShoppingCart,
  CreditCard,
  Loader2,
} from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductWithSubmitter extends Product {
  submitter: { id: string; username: string; userRank: string } | null;
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

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: products = [], isLoading, isError } = useQuery<ProductWithSubmitter[]>({
    queryKey: ["/api/products"],
  });

  const product = products.find((p) => p.id === id);

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
        <div className="max-w-5xl mx-auto px-6 py-12">
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
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center gap-4">
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
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center gap-4">
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
      <div className="max-w-5xl mx-auto px-6 py-12 animate-in fade-in duration-500">
        <Link href="/store">
          <span
            className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors mb-8 cursor-pointer"
            data-testid="link-back-to-store"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Store
          </span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
          <div className="aspect-square bg-[#121212] rounded-xl overflow-hidden" data-testid="product-image-container">
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
            </div>

            <p
              className="text-3xl font-semibold"
              data-testid="text-product-price"
            >
              ${(product.price / 100).toFixed(2)}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
