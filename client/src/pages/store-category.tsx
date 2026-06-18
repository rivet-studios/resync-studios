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
} from "lucide-react";
import type { Product } from "@shared/schema";
import {
  isParentCategory,
  getParentCategory,
  CATEGORY_TREE,
  type CategoryNode,
} from "@/lib/store-categories";

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
          <p className="text-foreground font-semibold text-sm">
            {product.price === 0 ? "Free" : `$${(product.price / 100).toFixed(2)}`}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function SubcategoryCard({ name, productCount }: { name: string; productCount: number }) {
  return (
    <Link href={`/store/category/${encodeURIComponent(name)}`}>
      <Card
        className="cursor-pointer hover-elevate overflow-visible"
        data-testid={`card-subcategory-${name}`}
      >
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Folder className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm leading-tight">{name}</h3>
            {productCount > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {productCount} {productCount === 1 ? "product" : "products"}
              </p>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
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

  const isParent = isParentCategory(categoryName);
  const parentNode: CategoryNode | undefined = isParent
    ? CATEGORY_TREE.find((c) => c.name === categoryName)
    : undefined;
  const parentCat = getParentCategory(categoryName);

  const directProducts = products.filter((p) => p.category === categoryName);

  const allProductsInParent = isParent && parentNode?.children
    ? products.filter(
        (p) =>
          p.category === categoryName ||
          parentNode.children!.includes(p.category ?? ""),
      )
    : directProducts;

  const totalCount = isParent ? allProductsInParent.length : directProducts.length;

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <Link href="/store" className="hover:text-foreground transition-colors" data-testid="link-back-store">
            Store
          </Link>
          {parentCat && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link
                href={`/store/category/${encodeURIComponent(parentCat.name)}`}
                className="hover:text-foreground transition-colors"
                data-testid="link-back-parent"
              >
                {parentCat.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">{categoryName}</span>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1
              className="text-2xl font-bold tracking-tight text-foreground"
              data-testid="heading-category-name"
            >
              {categoryName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isParent
                ? `${parentNode?.children?.length ?? 0} subcategories · ${totalCount} ${totalCount === 1 ? "product" : "products"} total`
                : `${totalCount} ${totalCount === 1 ? "product" : "products"} available`}
            </p>
          </div>
          <Link href={parentCat ? `/store/category/${encodeURIComponent(parentCat.name)}` : "/store"}>
            <Button variant="outline" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-1" />
              {parentCat ? `Back to ${parentCat.name}` : "Back to Store"}
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {isParent && parentNode?.children && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Subcategories</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Browse by type</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {parentNode.children.map((childName) => {
                    const childCount = products.filter(
                      (p) => p.category === childName,
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

            {directProducts.length > 0 && (
              <section className="space-y-4">
                {isParent && (
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Products</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Directly in this category
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {directProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {!isParent && directProducts.length === 0 && (
              <Card>
                <CardContent className="py-16 text-center">
                  <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3
                    className="text-foreground font-semibold mb-2"
                    data-testid="text-no-category-products"
                  >
                    No products in this category
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Check back later for new products
                  </p>
                  <Link href={parentCat ? `/store/category/${encodeURIComponent(parentCat.name)}` : "/store"}>
                    <Button variant="outline" data-testid="button-browse-all">
                      Browse All Products
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {isParent && allProductsInParent.length === 0 && (
              <Card>
                <CardContent className="py-10 text-center">
                  <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No products available in this category yet
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
