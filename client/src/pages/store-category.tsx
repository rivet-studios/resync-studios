import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronRight,
  Star,
  Package,
  Crown,
  Sparkles,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductWithSubmitter extends Product {
  submitter: { id: string; username: string; userRank: string } | null;
}

function ProductCard({ product }: { product: ProductWithSubmitter }) {
  return (
    <Link href={`/store/product/${product.id}`}>
      <Card
        className="group cursor-pointer hover-elevate overflow-visible"
        data-testid={`card-product-${product.id}`}
      >
        <div className="aspect-[4/3] bg-muted rounded-t-xl overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Package className="w-16 h-16 text-muted-foreground/20" />
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {product.isFeatured && (
              <Badge variant="default" className="text-[10px] font-medium">
                <Star className="w-3 h-3 mr-0.5" />
                Featured
              </Badge>
            )}
            {product.isLimitedEdition && (
              <Badge variant="destructive" className="text-[10px] font-semibold">
                <Crown className="w-3 h-3 mr-0.5" />
                LIMITED
              </Badge>
            )}
            {product.isVerified && (
              <Badge variant="secondary" className="text-[10px] font-medium">
                <Sparkles className="w-3 h-3 mr-0.5" />
                Verified
              </Badge>
            )}
            {product.isCommunityProvided && (
              <Badge variant="outline" className="text-[10px] font-medium">
                Community
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
            {product.name}
          </h3>
          <p className="text-primary font-bold text-sm">
            ${(product.price / 100).toFixed(2)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function StoreCategory() {
  const params = useParams<{ category: string }>();
  const categoryName = decodeURIComponent(params.category || "");

  const { data: products = [], isLoading } = useQuery<ProductWithSubmitter[]>({
    queryKey: ["/api/products"],
  });

  const categoryProducts = products.filter((p) => p.category === categoryName);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/store" className="hover:text-foreground transition-colors" data-testid="link-back-store">
            Store
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">{categoryName}</span>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground" data-testid="heading-category-name">
              {categoryName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {categoryProducts.length} {categoryProducts.length === 1 ? "product" : "products"} available
            </p>
          </div>
          <Link href="/store">
            <Button variant="outline" size="sm" data-testid="button-back-store">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Store
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <div className="space-y-3 p-0">
                  <Skeleton className="aspect-[4/3] w-full rounded-t-xl rounded-b-none" />
                  <div className="p-4 pt-0 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-5 w-1/4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : categoryProducts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-foreground font-semibold mb-2" data-testid="text-no-category-products">
                No products in this category
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                Check back later for new products
              </p>
              <Link href="/store">
                <Button variant="outline" data-testid="button-browse-all">
                  Browse All Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
