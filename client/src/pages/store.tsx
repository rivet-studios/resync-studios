import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
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
  ArrowRight,
  ShoppingBag,
  Tag,
} from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductWithSubmitter extends Product {
  submitter: { id: string; username: string; userRank: string } | null;
}

function ProductBadges({ product }: { product: ProductWithSubmitter }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {product.isFeatured && (
        <Badge
          variant="default"
          className="text-[10px] font-medium"
          data-testid={`badge-featured-${product.id}`}
        >
          <Star className="w-3 h-3 mr-0.5" />
          Featured
        </Badge>
      )}
      {product.isLimitedEdition && (
        <Badge
          variant="destructive"
          className="text-[10px] font-semibold"
          data-testid={`badge-limited-${product.id}`}
        >
          <Crown className="w-3 h-3 mr-0.5" />
          LIMITED
        </Badge>
      )}
      {product.isVerified && (
        <Badge
          variant="secondary"
          className="text-[10px] font-medium"
          data-testid={`badge-verified-${product.id}`}
        >
          <Sparkles className="w-3 h-3 mr-0.5" />
          Verified
        </Badge>
      )}
      {product.isCommunityProvided && (
        <Badge
          variant="outline"
          className="text-[10px] font-medium"
          data-testid={`badge-community-${product.id}`}
        >
          Community
        </Badge>
      )}
    </div>
  );
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
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-10 h-10 text-muted-foreground/30" />
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <ProductBadges product={product} />
          <h3
            className="font-semibold text-foreground text-sm leading-tight line-clamp-1"
            data-testid={`text-product-name-${product.id}`}
          >
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
          {product.submitter && (
            <p className="text-[11px] text-muted-foreground/70">
              by {product.submitter.username}
            </p>
          )}
          <p
            className="text-foreground font-semibold text-base"
            data-testid={`text-price-${product.id}`}
          >
            ${(product.price / 100).toFixed(2)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function FeaturedCard({ product }: { product: ProductWithSubmitter }) {
  return (
    <Link href={`/store/product/${product.id}`}>
      <div
        className="relative group cursor-pointer overflow-hidden rounded-xl h-full"
        data-testid={`card-featured-${product.id}`}
      >
        <div className="aspect-[16/10] bg-muted h-full">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Badge variant="default" className="text-[10px]">
              <Star className="w-3 h-3 mr-0.5" />
              Featured
            </Badge>
            {product.isLimitedEdition && (
              <Badge variant="destructive" className="text-[10px]">
                <Crown className="w-3 h-3 mr-0.5" />
                LIMITED
              </Badge>
            )}
          </div>
          <h3 className="text-white font-semibold text-lg leading-tight mb-1">
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-2">
            <p className="text-white/70 text-sm font-medium">
              ${(product.price / 100).toFixed(2)}
            </p>
            <span className="text-white/50 text-xs flex items-center gap-1">
              Shop now <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

const CATEGORIES = [
  {
    name: "Rosewood Vehicle Addons",
    description: "Vehicle Inserts",
    icon: Tag,
  },
  {
    name: "Rosewood LEO Vehicles",
    description: "Custom vehicle inserts for Law Enforcement",
    icon: ShoppingBag,
  },
  {
    name: "Rosewood Civilian Vehicles",
    description: "Custom vehicle inserts for civilian",
    icon: Package,
  },
  {
    name: "Addons",
    description: "Miscellaneous products",
    icon: Sparkles,
  },
];

export default function Store() {
  const { data: products = [], isLoading } = useQuery<ProductWithSubmitter[]>({
    queryKey: ["/api/products"],
  });

  const featuredProducts = products.filter((p) => p.isFeatured);
  const allProducts = products;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-14 animate-in fade-in duration-500">
        <section className="space-y-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2
                className="text-xl font-semibold tracking-tight text-foreground"
                data-testid="heading-shop-category"
              >
                Shop by category
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Browse our most popular products
              </p>
            </div>
            <Link
              href="/marketplace"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              data-testid="link-browse-categories"
            >
              View marketplace <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => {
              const count = products.filter(
                (p) => p.category === cat.name,
              ).length;
              const IconComponent = cat.icon;
              return (
                <Link href={`/store/category/${encodeURIComponent(cat.name)}`} key={cat.name}>
                <Card
                  className="cursor-pointer hover-elevate overflow-visible"
                  data-testid={`card-category-${cat.name}`}
                >
                  <CardContent className="p-4 flex flex-col justify-between aspect-[3/2]">
                    <div className="flex items-center justify-center w-9 h-9 rounded-md bg-muted">
                      <IconComponent className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm leading-tight">
                        {cat.name}
                      </h3>
                      {count > 0 && (
                        <p className="text-muted-foreground text-xs mt-0.5">
                          {count} {count === 1 ? "product" : "products"}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {featuredProducts.length > 0 && (
          <section className="space-y-5">
            <div>
              <h2
                className="text-xl font-semibold tracking-tight text-foreground"
                data-testid="heading-featured"
              >
                Featured products
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Our most popular products
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {featuredProducts.slice(0, 4).map((product, i) => (
                <div
                  key={product.id}
                  className={i === 0 ? "md:row-span-2" : ""}
                >
                  <FeaturedCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-5">
          <div>
            <h2
              className="text-xl font-semibold tracking-tight text-foreground"
              data-testid="heading-all-products"
            >
              All Products
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {allProducts.length}{" "}
              {allProducts.length === 1 ? "product" : "products"} available
            </p>
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
          ) : allProducts.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3
                  className="text-foreground font-semibold mb-2"
                  data-testid="text-no-products"
                >
                  No products yet
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Be the first to submit a product to the marketplace
                </p>
                <Link href="/marketplace">
                  <Button
                    variant="outline"
                    data-testid="button-submit-first-product"
                  >
                    Submit a Product <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        <section>
          <Link href="/store/subscriptions">
            <Card
              className="hover-elevate cursor-pointer overflow-visible"
              data-testid="link-vip-plans"
            >
              <CardContent className="flex items-center justify-between gap-4 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold text-base">
                      VIP Subscriptions
                    </h3>
                    <p className="text-muted-foreground text-sm mt-0.5">
                      Unlock exclusive perks — Bronze VIP, Diamond VIP, and
                      Founder's Edition
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </CardContent>
            </Card>
          </Link>
        </section>
      </div>
    </div>
  );
}
