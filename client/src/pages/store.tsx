import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingBag,
  ChevronRight,
  Star,
  Package,
  Crown,
  Sparkles,
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
          className="bg-gray-600/80 text-gray-100 text-[10px] font-semibold border-0"
          data-testid={`badge-community-${product.id}`}
        >
          Community Provided
        </Badge>
      )}
      {product.isFeatured && (
        <Badge
          className="bg-blue-600/90 text-white text-[10px] font-semibold border-0 hover:bg-blue-600"
          data-testid={`badge-featured-${product.id}`}
        >
          <Star className="w-3 h-3 mr-0.5" />
          Featured
        </Badge>
      )}
      {product.isLimitedEdition && (
        <Badge
          className="bg-yellow-500/90 text-black text-[10px] font-bold border-0 hover:bg-yellow-500"
          data-testid={`badge-limited-${product.id}`}
        >
          <Crown className="w-3 h-3 mr-0.5" />
          LIMITED EDITION
        </Badge>
      )}
      {product.isVerified && (
        <Badge
          className="bg-green-600/90 text-white text-[10px] font-semibold border-0 hover:bg-green-600"
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
    <Card
      className="bg-[#121212] border-white/10 overflow-hidden group hover:border-white/20 transition-colors"
      data-testid={`card-product-${product.id}`}
    >
      <div className="aspect-[4/3] bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Package className="w-12 h-12 text-white/20" />
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <ProductBadges product={product} />
        <div>
          <h3
            className="font-bold text-white text-sm truncate"
            data-testid={`text-product-name-${product.id}`}
          >
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-white/50 mt-1 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span
            className="text-white font-bold text-lg"
            data-testid={`text-price-${product.id}`}
          >
            ${(product.price / 100).toFixed(2)}
          </span>
          {product.submitter && (
            <span className="text-[11px] text-white/40">
              by {product.submitter.username}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const CATEGORIES = [
  { name: "Game Assets", icon: "🎮" },
  { name: "Accessories", icon: "🎨" },
  { name: "Services", icon: "🛠️" },
  { name: "Other", icon: "📦" },
];

export default function Store() {
  const { data: products = [], isLoading } = useQuery<ProductWithSubmitter[]>({
    queryKey: ["/api/products"],
  });

  const featuredProducts = products.filter((p) => p.isFeatured);
  const limitedProducts = products.filter((p) => p.isLimitedEdition);
  const allProducts = products;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-16 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
          <ShoppingBag className="w-8 h-8" />
          Store
        </h1>
        <p className="text-white/50 text-sm">
          Browse products from the community and RIVET Studios
        </p>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold tracking-tight text-white">
              Shop by category
            </h2>
            <p className="text-sm text-white/50">Browse our product categories</p>
          </div>
          <Link href="/marketplace">
            <Button
              variant="ghost"
              className="text-xs font-bold gap-1 group text-white/70 hover:text-white"
              data-testid="link-marketplace"
            >
              Submit a product
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const count = products.filter((p) => p.category === cat.name).length;
            return (
              <Card
                key={cat.name}
                className="bg-[#121212] border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                data-testid={`card-category-${cat.name}`}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <span className="text-3xl">{cat.icon}</span>
                  <h3 className="font-bold text-white text-sm">{cat.name}</h3>
                  <span className="text-[11px] text-white/40">
                    {count} {count === 1 ? "product" : "products"}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-500" />
              Featured Products
            </h2>
            <p className="text-sm text-white/50">Hand-picked by our team</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {limitedProducts.length > 0 && (
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Limited Edition
            </h2>
            <p className="text-sm text-white/50">Get them before they're gone</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {limitedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-white">
            All Products
          </h2>
          <p className="text-sm text-white/50">
            {allProducts.length} {allProducts.length === 1 ? "product" : "products"} available
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-[#121212] border-white/10">
                <Skeleton className="aspect-[4/3] w-full" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-6 w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : allProducts.length === 0 ? (
          <Card className="bg-[#121212] border-white/10">
            <CardContent className="p-12 text-center">
              <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">No products yet</h3>
              <p className="text-white/50 text-sm mb-4">
                Be the first to submit a product to the marketplace
              </p>
              <Link href="/marketplace">
                <Button data-testid="button-submit-first-product">
                  Submit a Product
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-white">
            VIP Subscriptions
          </h2>
          <p className="text-sm text-white/50">
            Unlock exclusive perks and benefits
          </p>
        </div>
        <Link href="/store/subscriptions">
          <Card className="bg-gradient-to-r from-[#121212] to-[#1a1a2e] border-white/10 hover:border-white/20 transition-colors cursor-pointer">
            <CardContent className="p-8 flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-white font-bold text-xl">Browse VIP Plans</h3>
                <p className="text-white/50 text-sm">
                  Bronze VIP, Diamond VIP, and Founder's Edition
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-white/50" />
            </CardContent>
          </Card>
        </Link>
      </section>
    </div>
  );
}
