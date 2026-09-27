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
  Folder,
  Store as StoreIcon,
} from "lucide-react";
import type { Product } from "@shared/schema";
import { CATEGORY_TREE, type CategoryNode } from "@/lib/store-categories";

interface ProductWithSubmitter extends Product {
  submitter: {
    id: string;
    username: string;
    userRank: string;
  } | null;
}

function ProductBadges({ product }: { product: ProductWithSubmitter }) {
  return (
    <div className="flex min-h-[20px] flex-wrap gap-1.5">
      {product.isFeatured && (
        <Badge
          variant="default"
          className="text-[10px] font-medium"
          data-testid={`badge-featured-${product.id}`}
        >
          <Star className="mr-1 h-3 w-3 fill-current" />
          Featured
        </Badge>
      )}

      {product.isLimitedEdition && (
        <Badge
          variant="destructive"
          className="text-[10px] font-semibold"
          data-testid={`badge-limited-${product.id}`}
        >
          <Crown className="mr-1 h-3 w-3" />
          LIMITED
        </Badge>
      )}

      {product.isVerified && (
        <Badge
          variant="secondary"
          className="border border-border/50 bg-muted/50 text-[10px] font-medium"
          data-testid={`badge-verified-${product.id}`}
        >
          <Sparkles className="mr-1 h-3 w-3" />
          Verified
        </Badge>
      )}

      {product.isCommunityProvided && (
        <Badge
          variant="outline"
          className="text-[10px] font-medium"
          data-testid={`badge-community-${product.id}`}
        >
          Community Provided
        </Badge>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: ProductWithSubmitter }) {
  return (
    <Link href={`/store/product/${product.id}`}>
      <Card
        className="group h-full cursor-pointer overflow-hidden border-border/60 bg-card/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-lg"
        data-testid={`card-product-${product.id}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted/40">
          {product.imageUrl ? (
            <>
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                data-testid={`img-product-${product.id}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/50 to-muted/20">
              <Package className="h-12 w-12 text-muted-foreground/20" />
            </div>
          )}

          {(product.isFeatured || product.isLimitedEdition) && (
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {product.isFeatured && (
                <Badge className="border border-white/10 bg-black/70 text-[10px] font-medium text-white backdrop-blur-md">
                  <Star className="mr-1 h-3 w-3 fill-current" />
                  Featured
                </Badge>
              )}

              {product.isLimitedEdition && (
                <Badge className="border border-red-400/20 bg-red-500/80 text-[10px] font-semibold text-white backdrop-blur-md">
                  <Crown className="mr-1 h-3 w-3" />
                  Limited
                </Badge>
              )}
            </div>
          )}
        </div>

        <CardContent className="flex min-h-[172px] flex-col p-4">
          <ProductBadges product={product} />

          <h3
            className="mt-2 line-clamp-1 text-sm font-semibold leading-tight text-foreground"
            data-testid={`text-product-name-${product.id}`}
          >
            {product.name}
          </h3>

          {product.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          {product.submitter && (
            <p className="mt-2 text-[11px] text-muted-foreground/60">
              by {product.submitter.username}
            </p>
          )}

          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                Price
              </p>
              <p
                className="mt-0.5 text-base font-semibold text-foreground"
                data-testid={`text-price-${product.id}`}
              >
                {product.price === 0
                  ? "Free"
                  : `$${(product.price / 100).toFixed(2)}`}
              </p>
            </div>

            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border/50 bg-muted/20 opacity-50 transition-all group-hover:translate-x-0.5 group-hover:opacity-100">
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function FeaturedCard({
  product,
  featuredIndex,
}: {
  product: ProductWithSubmitter;
  featuredIndex: number;
}) {
  return (
    <Link href={`/store/product/${product.id}`}>
      <div
        className={`group relative h-full cursor-pointer overflow-hidden rounded-xl border border-border/50 bg-muted/20 ${
          featuredIndex === 0 ? "min-h-[360px]" : "min-h-[175px]"
        }`}
        data-testid={`card-featured-${product.id}`}
      >
        <div className="absolute inset-0 bg-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              data-testid={`img-featured-${product.id}`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/60 to-muted/20">
              <Package className="h-14 w-14 text-muted-foreground/20" />
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5" />

        <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
          <div className="mb-2 flex flex-wrap gap-1.5">
            <Badge className="border border-white/10 bg-white/10 text-[10px] text-white backdrop-blur-md">
              <Star className="mr-1 h-3 w-3 fill-current" />
              Featured
            </Badge>

            {product.isLimitedEdition && (
              <Badge className="border border-red-400/20 bg-red-500/80 text-[10px] text-white backdrop-blur-md">
                <Crown className="mr-1 h-3 w-3" />
                Limited
              </Badge>
            )}

            {product.isVerified && (
              <Badge className="border border-white/10 bg-black/40 text-[10px] text-white backdrop-blur-md">
                <Sparkles className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>

          <h3
            className={`font-semibold leading-tight text-white ${
              featuredIndex === 0 ? "text-xl md:text-2xl" : "text-lg"
            }`}
          >
            {product.name}
          </h3>

          {product.description && featuredIndex === 0 && (
            <p className="mt-1.5 line-clamp-2 max-w-xl text-sm leading-relaxed text-white/65">
              {product.description}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-white/75">
              {product.price === 0
                ? "Free"
                : `$${(product.price / 100).toFixed(2)}`}
            </p>

            <span className="flex items-center gap-1.5 text-xs font-medium text-white/60 transition-colors group-hover:text-white">
              View product
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

const CATEGORY_ICONS: Record<string, typeof Tag> = {
  "Serrano Vehicle Addons": Tag,
  Addons: Sparkles,
};

function getCategoryProductCount(
  cat: CategoryNode,
  products: ProductWithSubmitter[],
): number {
  let count = products.filter((product) => product.category === cat.name)
    .length;

  if (cat.children) {
    for (const child of cat.children) {
      count += products.filter(
        (product) => product.category === child,
      ).length;
    }
  }

  return count;
}

function CategoryCard({
  category,
  products,
}: {
  category: CategoryNode;
  products: ProductWithSubmitter[];
}) {
  const count = getCategoryProductCount(category, products);
  const IconComponent = CATEGORY_ICONS[category.name] ?? Folder;
  const hasChildren = !!category.children?.length;

  return (
    <Link
      href={`/store/category/${encodeURIComponent(category.name)}`}
      key={category.name}
    >
      <Card
        className="group h-full cursor-pointer border-border/60 bg-card/60 transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-md"
        data-testid={`card-category-${category.name}`}
      >
        <CardContent className="flex aspect-[3/2] flex-col justify-between p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-muted/30 transition-colors group-hover:bg-muted/50">
              <IconComponent className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
            </div>

            <ChevronRight className="mt-1 h-4 w-4 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
                {category.name}
              </h3>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              {hasChildren
                ? `${category.children!.length} ${
                    category.children!.length === 1
                      ? "subcategory"
                      : "subcategories"
                  }`
                : count > 0
                  ? `${count} ${count === 1 ? "product" : "products"}`
                  : category.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {[...Array(8)].map((_, index) => (
        <Card
          key={index}
          className="overflow-hidden border-border/60 bg-card/50"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none" />

          <div className="space-y-3 p-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-5 w-1/4" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function Store() {
  const { data: products = [], isLoading } = useQuery<
    ProductWithSubmitter[]
  >({
    queryKey: ["/api/products"],
  });

  const featuredProducts = products.filter((product) => product.isFeatured);
  const allProducts = products;

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        {/* Store Header */}
        <section className="mb-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <StoreIcon className="h-3.5 w-3.5" />
                RIVET Studios Store
              </div>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Store
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Browse products, addons, community submissions, and exclusive
                RIVET offerings.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-border/60 bg-muted/20 px-2.5 py-1 text-xs"
              >
                <ShoppingBag className="mr-1.5 h-3 w-3" />
                {isLoading
                  ? "Loading"
                  : `${allProducts.length} ${
                      allProducts.length === 1 ? "Product" : "Products"
                    }`}
              </Badge>

              <Link href="/marketplace">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border/60 bg-background/50"
                  data-testid="link-browse-categories"
                >
                  Marketplace
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-14 space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="text-xl font-semibold tracking-tight text-foreground"
                  data-testid="heading-shop-category"
                >
                  Shop by category
                </h2>

                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span className="text-xs text-muted-foreground">
                  {CATEGORY_TREE.length} categories
                </span>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Browse the catalog by product type.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <Skeleton
                  key={index}
                  className="aspect-[3/2] w-full rounded-xl"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {CATEGORY_TREE.map((category) => (
                <CategoryCard
                  key={category.name}
                  category={category}
                  products={products}
                />
              ))}
            </div>
          )}
        </section>

        {/* Featured */}
        {featuredProducts.length > 0 && (
          <section className="mb-14 space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="text-xl font-semibold tracking-tight text-foreground"
                  data-testid="heading-featured"
                >
                  Featured products
                </h2>

                <Badge
                  variant="outline"
                  className="border-border/60 bg-muted/20 text-[10px] uppercase tracking-wider"
                >
                  Curated
                </Badge>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Selected products currently highlighted by RIVET Studios.
              </p>
            </div>

            <div className="grid min-h-[360px] grid-cols-1 gap-3 md:grid-cols-2 md:grid-rows-2">
              {featuredProducts.slice(0, 4).map((product, index) => (
                <div
                  key={product.id}
                  className={index === 0 ? "md:row-span-2" : ""}
                >
                  <FeaturedCard
                    product={product}
                    featuredIndex={index}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Products */}
        <section className="mb-14 space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                className="text-xl font-semibold tracking-tight text-foreground"
                data-testid="heading-all-products"
              >
                All Products
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {isLoading
                  ? "Loading the catalog..."
                  : `${allProducts.length} ${
                      allProducts.length === 1 ? "product" : "products"
                    } available`}
              </p>
            </div>

            {!isLoading && allProducts.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Package className="h-3.5 w-3.5" />
                Full catalog
              </div>
            )}
          </div>

          {isLoading ? (
            <ProductGridSkeleton />
          ) : allProducts.length === 0 ? (
            <Card className="border-border/60 bg-card/50">
              <CardContent className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-muted/30">
                  <Package className="h-6 w-6 text-muted-foreground/50" />
                </div>

                <h3
                  className="font-semibold text-foreground"
                  data-testid="text-no-products"
                >
                  No products yet
                </h3>

                <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
                  The RIVET Store does not have any products listed yet. Be the
                  first to submit one to the marketplace.
                </p>

                <Link href="/marketplace">
                  <Button
                    variant="outline"
                    className="mt-6 border-border/60"
                    data-testid="button-submit-first-product"
                  >
                    Submit a Product
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* VIP */}
        <section>
          <Link href="/store/subscriptions">
            <Card
              className="group cursor-pointer overflow-hidden border-border/60 bg-card/60 transition-all duration-200 hover:border-border hover:bg-card hover:shadow-md"
              data-testid="link-vip-plans"
            >
              <CardContent className="relative flex items-center justify-between gap-5 overflow-hidden p-6 md:p-7">
                <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/[0.05] blur-2xl transition-all duration-500 group-hover:bg-primary/[0.09]" />

                <div className="relative flex min-w-0 items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                    <Crown className="h-5 w-5 text-primary" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">
                        VIP Subscriptions
                      </h3>

                      <Badge
                        variant="outline"
                        className="border-primary/20 bg-primary/5 text-[9px] uppercase tracking-wider text-primary"
                      >
                        Exclusive
                      </Badge>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Unlock exclusive perks with Bronze VIP, Diamond VIP, or
                      Founder's Edition.
                    </p>
                  </div>
                </div>

                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/20 transition-transform duration-200 group-hover:translate-x-0.5">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* Footer */}
        <div className="mt-10 border-t border-border/50 pt-6">
          <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>RIVET Studios Store</span>

            <span>
              {isLoading
                ? "Catalog loading..."
                : `${allProducts.length} ${
                    allProducts.length === 1 ? "product" : "products"
                  } currently listed`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}