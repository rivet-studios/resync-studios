import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronRight,
  Star,
  Package,
  Crown,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductWithSubmitter extends Product {
  submitter: { id: string; username: string; userRank: string } | null;
}

function ProductBadges({ product }: { product: ProductWithSubmitter }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {product.isCommunityProvided && (
        <Badge
          variant="secondary"
          className="bg-gray-600/80 text-gray-100 text-[10px] font-medium border-0"
          data-testid={`badge-community-${product.id}`}
        >
          Community Provided
        </Badge>
      )}
      {product.isFeatured && (
        <Badge
          className="bg-blue-600/90 text-white text-[10px] font-medium border-0 hover:bg-blue-600"
          data-testid={`badge-featured-${product.id}`}
        >
          <Star className="w-3 h-3 mr-0.5" />
          Featured
        </Badge>
      )}
      {product.isLimitedEdition && (
        <Badge
          className="bg-yellow-500/90 text-black text-[10px] font-semibold border-0 hover:bg-yellow-500"
          data-testid={`badge-limited-${product.id}`}
        >
          <Crown className="w-3 h-3 mr-0.5" />
          LIMITED EDITION
        </Badge>
      )}
      {product.isVerified && (
        <Badge
          className="bg-green-600/90 text-white text-[10px] font-medium border-0 hover:bg-green-600"
          data-testid={`badge-verified-${product.id}`}
        >
          <Sparkles className="w-3 h-3 mr-0.5" />
          VERIFIED
        </Badge>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: ProductWithSubmitter }) {
  return (
    <Link href={`/store/product/${product.id}`}>
      <div
        className="group cursor-pointer"
        data-testid={`card-product-${product.id}`}
      >
        <div className="aspect-[4/3] bg-[#1a1a1a] rounded-lg overflow-hidden mb-3">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-10 h-10 text-white/15" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <ProductBadges product={product} />
          <h3
            className="font-semibold text-white text-sm leading-tight line-clamp-1"
            data-testid={`text-product-name-${product.id}`}
          >
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
          {product.submitter && (
            <p className="text-[11px] text-white/30">
              by {product.submitter.username}
            </p>
          )}
          <p
            className="text-white font-semibold text-base"
            data-testid={`text-price-${product.id}`}
          >
            ${(product.price / 100).toFixed(2)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function FeaturedCard({ product }: { product: ProductWithSubmitter }) {
  return (
    <Link href={`/store/product/${product.id}`}>
      <div
        className="relative group cursor-pointer overflow-hidden rounded-lg"
        data-testid={`card-featured-${product.id}`}
      >
        <div className="aspect-[16/10] bg-[#1a1a1a]">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-white/10" />
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-white font-semibold text-lg leading-tight mb-1">
            {product.name}
          </h3>
          <p className="text-white/60 text-sm">Shop now</p>
        </div>
      </div>
    </Link>
  );
}

const CATEGORIES = [
  {
    name: "Rosewood Vehicle Addons",
    description: "Vehicle Inserts",
    gradient: "from-slate-700 to-slate-900",
  },
  {
    name: "Rosewood LEO Vehicles",
    description: "Custom vehicle inserts for Law Enforcement",
    gradient: "from-zinc-600 to-zinc-800",
  },
  {
    name: "Rosewood Civilian Vehicles",
    description: "Custom vehicle inserts for civilian",
    gradient: "from-neutral-600 to-neutral-800",
  },
  {
    name: "Addons",
    description: "Miscellaneous products",
    gradient: "from-stone-600 to-stone-800",
  },
];

export default function Store() {
  const { data: products = [], isLoading } = useQuery<ProductWithSubmitter[]>({
    queryKey: ["/api/products"],
  });

  const featuredProducts = products.filter((p) => p.isFeatured);
  const allProducts = products;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-14 animate-in fade-in duration-500">
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2
                className="text-xl font-semibold tracking-tight text-white"
                data-testid="heading-shop-category"
              >
                Shop by category
              </h2>
              <p className="text-sm text-white/40 mt-1">
                Browse our most popular products
              </p>
            </div>
            <Link
              href="/marketplace"
              className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1"
              data-testid="link-browse-categories"
            >
              Browse all categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => {
              const count = products.filter(
                (p) => p.category === cat.name,
              ).length;
              return (
                <div
                  key={cat.name}
                  className={`relative rounded-lg overflow-hidden cursor-pointer group bg-gradient-to-br ${cat.gradient} aspect-[3/2]`}
                  data-testid={`card-category-${cat.name}`}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-semibold text-white text-sm">
                      {cat.name}
                    </h3>
                    {count > 0 && (
                      <p className="text-white/50 text-xs mt-0.5">
                        {count} {count === 1 ? "product" : "products"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {featuredProducts.length > 0 && (
          <section className="space-y-5">
            <div>
              <h2
                className="text-xl font-semibold tracking-tight text-white"
                data-testid="heading-featured"
              >
                Featured products
              </h2>
              <p className="text-sm text-white/40 mt-1">
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
              className="text-xl font-semibold tracking-tight text-white"
              data-testid="heading-all-products"
            >
              All Products
            </h2>
            <p className="text-sm text-white/40 mt-1">
              {allProducts.length}{" "}
              {allProducts.length === 1 ? "product" : "products"} available
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-5 w-1/4" />
                </div>
              ))}
            </div>
          ) : allProducts.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="w-12 h-12 text-white/15 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">No products yet</h3>
              <p className="text-white/40 text-sm mb-6">
                Be the first to submit a product to the marketplace
              </p>
              <Link href="/marketplace">
                <span
                  className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/20 px-5 py-2.5 rounded-lg transition-colors"
                  data-testid="button-submit-first-product"
                >
                  Submit a Product <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
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
            <div
              className="flex items-center justify-between border border-white/10 hover:border-white/20 rounded-lg p-6 transition-colors cursor-pointer group"
              data-testid="link-vip-plans"
            >
              <div>
                <h3 className="text-white font-semibold text-base">
                  VIP Subscriptions
                </h3>
                <p className="text-white/40 text-sm mt-1">
                  Unlock exclusive perks — Bronze VIP, Diamond VIP, and
                  Founder's Edition
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0" />
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
