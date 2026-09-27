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
  Folder,
  Layers3,
  ShoppingBag,
  Tag,
} from "lucide-react";
import type { Product } from "@shared/schema";
import {
  isParentCategory,
  getParentCategory,
  CATEGORY_TREE,
  type CategoryNode,
} from "@/lib/store-categories";

interface ProductWithSubmitter extends Product {
  submitter: {
    id: string;
    username: string;
    userRank: string;
  } | null;
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
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/60 to-muted/20">
              <Package className="h-14 w-14 text-muted-foreground/15" />
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

        <CardContent className="flex h-[150px] flex-col p-4">
          <div className="mb-2 flex min-h-[20px] flex-wrap gap-1.5">
            {product.isVerified && (
              <Badge
                variant="secondary"
                className="border border-border/50 bg-muted/50 text-[10px] font-medium"
              >
                <Sparkles className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            )}

            {product.isCommunityProvided && (
              <Badge
                variant="outline"
                className="text-[10px] font-medium"
              >
                Community
              </Badge>
            )}
          </div>

          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
            {product.name}
          </h3>

          <div className="mt-auto flex items-center justify-between gap-3 pt-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Price
              </p>
              <p className="text-sm font-semibold text-foreground">
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

function SubcategoryCard({
  name,
  productCount,
}: {
  name: string;
  productCount: number;
}) {
  return (
    <Link href={`/store/category/${encodeURIComponent(name)}`}>
      <Card
        className="group cursor-pointer border-border/60 bg-card/60 transition-all duration-200 hover:border-border hover:bg-card hover:shadow-md"
        data-testid={`card-subcategory-${name}`}
      >
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/30 transition-colors group-hover:bg-muted/50">
            <Folder className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-foreground">
                {name}
              </h3>

              {productCount > 0 && (
                <Badge
                  variant="outline"
                  className="shrink-0 px-1.5 py-0 text-[9px] text-muted-foreground"
                >
                  {productCount}
                </Badge>
              )}
            </div>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {productCount === 0
                ? "No products yet"
                : `${productCount} ${
                    productCount === 1 ? "product" : "products"
                  } available`}
            </p>
          </div>

          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
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
            <Skeleton className="h-4 w-1/3" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function StoreCategory() {
  const params = useParams<{ category: string }>();
  const categoryName = decodeURIComponent(params.category || "");

  const { data: products = [], isLoading } = useQuery<
    ProductWithSubmitter[]
  >({
    queryKey: ["/api/products"],
  });

  const isParent = isParentCategory(categoryName);

  const parentNode: CategoryNode | undefined = isParent
    ? CATEGORY_TREE.find((category) => category.name === categoryName)
    : undefined;

  const parentCat = getParentCategory(categoryName);

  const directProducts = products.filter(
    (product) => product.category === categoryName,
  );

  const allProductsInParent =
    isParent && parentNode?.children
      ? products.filter(
          (product) =>
            product.category === categoryName ||
            parentNode.children!.includes(product.category ?? ""),
        )
      : directProducts;

  const totalCount = isParent
    ? allProductsInParent.length
    : directProducts.length;

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        {/* Breadcrumbs */}
        <nav
          className="mb-8 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
          aria-label="Breadcrumb"
        >
          <Link
            href="/store"
            className="transition-colors hover:text-foreground"
            data-testid="link-back-store"
          >
            Store
          </Link>

          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />

          {parentCat && (
            <>
              <Link
                href={`/store/category/${encodeURIComponent(parentCat.name)}`}
                className="transition-colors hover:text-foreground"
                data-testid="link-back-parent"
              >
                {parentCat.name}
              </Link>

              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
            </>
          )}

          <span className="font-medium text-foreground">{categoryName}</span>
        </nav>

        {/* Category Header */}
        <div className="mb-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-muted/30">
                  {isParent ? (
                    <Layers3 className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Tag className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Store Category
                </span>
              </div>

              <h1
                className="text-3xl font-bold tracking-tight text-foreground md:text-4xl"
                data-testid="heading-category-name"
              >
                {categoryName}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {isParent
                  ? `${parentNode?.children?.length ?? 0} subcategories and ${totalCount} ${
                      totalCount === 1 ? "product" : "products"
                    } across this collection.`
                  : `${totalCount} ${
                      totalCount === 1 ? "product" : "products"
                    } currently available in this category.`}
              </p>
            </div>

            <Link
              href={
                parentCat
                  ? `/store/category/${encodeURIComponent(parentCat.name)}`
                  : "/store"
              }
            >
              <Button
                variant="outline"
                size="sm"
                className="border-border/60 bg-background/50"
                data-testid="button-back"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {parentCat ? `Back to ${parentCat.name}` : "Back to Store"}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          {!isLoading && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-border/60 bg-muted/20 px-2.5 py-1 text-xs"
              >
                <ShoppingBag className="mr-1.5 h-3 w-3" />
                {totalCount} {totalCount === 1 ? "Product" : "Products"}
              </Badge>

              {isParent && parentNode?.children && (
                <Badge
                  variant="outline"
                  className="border-border/60 bg-muted/20 px-2.5 py-1 text-xs"
                >
                  <Folder className="mr-1.5 h-3 w-3" />
                  {parentNode.children.length} Subcategories
                </Badge>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-8">
            {isParent && (
              <section>
                <div className="mb-4 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {[...Array(4)].map((_, index) => (
                    <Skeleton
                      key={index}
                      className="h-[76px] w-full rounded-xl"
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="mb-4 space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>

              <ProductGridSkeleton />
            </section>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Subcategories */}
            {isParent && parentNode?.children && (
              <section>
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-foreground">
                      Subcategories
                    </h2>

                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />

                    <span className="text-xs text-muted-foreground">
                      {parentNode.children.length} available
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Browse the store by product type.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {parentNode.children.map((childName) => {
                    const childCount = products.filter(
                      (product) => product.category === childName,
                    ).length;

                    return (
                      <SubcategoryCard
                        key={childName}
                        name={childName}
                        productCount={childCount}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {/* Direct products */}
            {directProducts.length > 0 && (
              <section>
                {isParent && (
                  <div className="mb-5">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-foreground">
                        Products
                      </h2>

                      <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />

                      <span className="text-xs text-muted-foreground">
                        Directly in {categoryName}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Products assigned directly to this category.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {directProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty child category */}
            {!isParent && directProducts.length === 0 && (
              <Card className="overflow-hidden border-border/60 bg-card/50">
                <CardContent className="flex flex-col items-center justify-center px-6 py-20 text-center">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-muted/30">
                    <Package className="h-6 w-6 text-muted-foreground/50" />
                  </div>

                  <h3
                    className="font-semibold text-foreground"
                    data-testid="text-no-category-products"
                  >
                    No products in this category
                  </h3>

                  <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
                    There are currently no products listed here. Check back
                    later as the RIVET Store continues to grow.
                  </p>

                  <Link
                    href={
                      parentCat
                        ? `/store/category/${encodeURIComponent(
                            parentCat.name,
                          )}`
                        : "/store"
                    }
                  >
                    <Button
                      variant="outline"
                      className="mt-6 border-border/60"
                      data-testid="button-browse-all"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {parentCat
                        ? `Back to ${parentCat.name}`
                        : "Browse All Products"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Empty parent category */}
            {isParent && allProductsInParent.length === 0 && (
              <Card className="border-border/60 bg-card/50">
                <CardContent className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-muted/30">
                    <Package className="h-5 w-5 text-muted-foreground/50" />
                  </div>

                  <p className="text-sm font-medium text-foreground">
                    No products available yet
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Products will appear here when they are added to this
                    category.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 border-t border-border/50 pt-6">
          <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>RIVET Store</span>

            <span>
              {isLoading
                ? "Loading catalog..."
                : `${totalCount} ${
                    totalCount === 1 ? "product" : "products"
                  } in this view`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}