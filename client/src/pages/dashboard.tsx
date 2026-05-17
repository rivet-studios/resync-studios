import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  ShoppingCart,
  Rss,
  Flame,
  ArrowRight,
  Shield,
  Store,
  Sparkles,
  Star,
  Eye,
  MessageSquare,
  Clock,
  LifeBuoy,
  ExternalLink,
  Plus,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  isFeatured?: boolean;
  isCommunityProvided?: boolean;
  status?: string;
  createdAt?: string;
};

type Blog = {
  id: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  isFeatured?: boolean;
  views?: number;
  viewCount?: number;
  commentsCount?: number;
  commentCount?: number;
  createdAt?: string;
  authorId?: string;
  author?: { id: string; username: string; profileImageUrl?: string | null };
};

type Thread = {
  id: string;
  title: string;
  replyCount?: number;
  viewCount?: number;
  createdAt?: string;
  author?: { username?: string };
};

const formatPrice = (cents: number) =>
  cents === 0 ? "Free" : `$${(cents / 100).toFixed(2)}`;

const readingTime = (text?: string | null) => {
  if (!text) return 1;
  const words = text.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
};

function ProductCard({
  product,
  badgeLabel,
  badgeClass,
  icon,
  iconClass,
  title,
  titleClass,
  testId,
}: {
  product: Product;
  badgeLabel: string;
  badgeClass: string;
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  titleClass: string;
  testId: string;
}) {
  return (
    <Card
      className="overflow-hidden flex flex-col bg-card/60 border-border/60"
      data-testid={testId}
    >
      <div className="p-4 pb-3 flex items-center justify-between gap-2">
        <div className={`flex items-center gap-2 font-semibold ${titleClass}`}>
          <span className={iconClass}>{icon}</span>
          <span>{title}</span>
        </div>
        <Badge
          variant="outline"
          className={`text-[10px] uppercase tracking-wide ${badgeClass}`}
        >
          {badgeLabel}
        </Badge>
      </div>
      <div className="px-4">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full aspect-[16/9] object-cover rounded-md"
            data-testid={`img-product-${product.id}`}
          />
        ) : (
          <div className="w-full aspect-[16/9] rounded-md bg-muted/40 flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <CardContent className="flex-1 flex flex-col p-4 pt-3">
        <p
          className="text-sm font-semibold text-foreground line-clamp-1"
          data-testid={`text-product-name-${product.id}`}
        >
          {product.name}
        </p>
        {product.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {product.description}
          </p>
        )}
        <p
          className="text-base font-bold text-foreground mt-2"
          data-testid={`text-product-price-${product.id}`}
        >
          {formatPrice(product.price)}
        </p>
        <Button
          asChild
          variant="secondary"
          size="sm"
          className="mt-3 w-full"
          data-testid={`button-view-product-${product.id}`}
        >
          <Link href={`/store`}>View product</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyProductCard({
  title,
  titleClass,
  icon,
  iconClass,
  message,
  testId,
}: {
  title: string;
  titleClass: string;
  icon: React.ReactNode;
  iconClass: string;
  message: string;
  testId: string;
}) {
  return (
    <Card
      className="overflow-hidden flex flex-col bg-card/40 border-dashed border-border/60"
      data-testid={testId}
    >
      <div className="p-4 pb-3 flex items-center justify-between gap-2">
        <div className={`flex items-center gap-2 font-semibold ${titleClass}`}>
          <span className={iconClass}>{icon}</span>
          <span>{title}</span>
        </div>
      </div>
      <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[280px]">
        <p className="text-base font-semibold text-foreground">{message}</p>
        <p className="text-xs text-muted-foreground mt-1">No products available</p>
        <Button
          asChild
          variant="secondary"
          size="sm"
          className="mt-4"
          data-testid={`button-shop-store-${testId}`}
        >
          <Link href="/store">
            <Store className="w-3.5 h-3.5 mr-1.5" />
            Shop store
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: !!user,
  });

  const { data: blogs = [], isLoading: blogsLoading } = useQuery<Blog[]>({
    queryKey: ["/api/blog"],
    enabled: !!user,
  });

  const { data: threads = [], isLoading: threadsLoading } = useQuery<Thread[]>({
    queryKey: ["/api/forums/threads"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-[360px] rounded-md" />
          <Skeleton className="h-[360px] rounded-md" />
          <Skeleton className="h-[360px] rounded-md" />
        </div>
        <Skeleton className="h-[280px] rounded-md" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Shield className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h2
            className="text-xl font-semibold text-foreground"
            data-testid="text-access-restricted"
          >
            Access Restricted
          </h2>
          <p className="text-muted-foreground text-sm">
            Please sign in to view your dashboard.
          </p>
        </div>
        <Button asChild data-testid="button-login-redirect">
          <Link href="/login">Login to Account</Link>
        </Button>
      </div>
    );
  }

  // Real-data picks for the three "Top rated products" cards.
  const approved = products.filter((p) => !p.status || p.status === "approved");
  const sortedByDate = [...approved].sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime(),
  );
  const newestProduct = sortedByDate[0];
  // "Most popular" = oldest approved product still on sale (proxy until a
  // sales/views metric exists). Distinct from Newest so the cards don't dupe.
  const popularProduct = [...approved]
    .sort(
      (a, b) =>
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime(),
    )
    .find((p) => p.id !== newestProduct?.id);
  const featuredProduct = approved.find(
    (p) =>
      p.isFeatured &&
      p.id !== newestProduct?.id &&
      p.id !== popularProduct?.id,
  ) || approved.find((p) => p.isFeatured);

  const featuredBlog =
    blogs.find((b) => b.isFeatured) ||
    [...blogs].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    )[0];

  const trendingThreads = [...threads]
    .sort(
      (a, b) =>
        (b.replyCount || 0) + (b.viewCount || 0) -
        ((a.replyCount || 0) + (a.viewCount || 0)),
    )
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-[#000000f7]">
      <h1
        className="text-2xl font-semibold tracking-tight text-foreground"
        data-testid="text-dashboard-title"
      >
        Dashboard
      </h1>
      {/* Top rated products */}
      <section className="space-y-4" data-testid="section-top-rated">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Top rated products
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              View the most recent, latest and trending products
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs gap-1"
            data-testid="link-browse-store"
          >
            <Link href="/store">
              Browse store <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-[360px] rounded-md" />
            <Skeleton className="h-[360px] rounded-md" />
            <Skeleton className="h-[360px] rounded-md" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {newestProduct ? (
              <ProductCard
                product={newestProduct}
                title="Newest Arrivals"
                titleClass="text-sky-400"
                icon={<Sparkles className="w-4 h-4" />}
                iconClass="text-sky-400"
                badgeLabel="New"
                badgeClass="text-sky-400 border-sky-400/40 bg-sky-400/10"
                testId="card-newest-arrivals"
              />
            ) : (
              <EmptyProductCard
                title="Newest Arrivals"
                titleClass="text-sky-400"
                icon={<Sparkles className="w-4 h-4" />}
                iconClass="text-sky-400"
                message="Most popular"
                testId="card-newest-empty"
              />
            )}

            {popularProduct ? (
              <ProductCard
                product={popularProduct}
                title="Most popular"
                titleClass="text-foreground"
                icon={<Star className="w-4 h-4" />}
                iconClass="text-muted-foreground"
                badgeLabel="Popular"
                badgeClass="text-foreground border-border bg-muted/40"
                testId="card-most-popular"
              />
            ) : (
              <EmptyProductCard
                title="Most popular"
                titleClass="text-foreground"
                icon={<Star className="w-4 h-4" />}
                iconClass="text-muted-foreground"
                message="Most popular"
                testId="card-popular-empty"
              />
            )}

            {featuredProduct ? (
              <ProductCard
                product={featuredProduct}
                title="Featured Products"
                titleClass="text-rose-400"
                icon={<Sparkles className="w-4 h-4" />}
                iconClass="text-rose-400"
                badgeLabel="Featured"
                badgeClass="text-rose-400 border-rose-400/40 bg-rose-400/10"
                testId="card-featured-products"
              />
            ) : (
              <EmptyProductCard
                title="Featured Products"
                titleClass="text-rose-400"
                icon={<Sparkles className="w-4 h-4" />}
                iconClass="text-rose-400"
                message="No featured products"
                testId="card-featured-empty"
              />
            )}
          </div>
        )}
      </section>
      {/* Latest blog posts */}
      <section className="space-y-4" data-testid="section-latest-blog">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <Rss className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-foreground">
                Latest blog posts
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Stay updated with our latest articles and insights
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs gap-1"
            data-testid="link-view-blog"
          >
            <Link href="/blog">
              View blog <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
        </div>

        {blogsLoading ? (
          <Skeleton className="h-[280px] rounded-md" />
        ) : featuredBlog ? (
          <Link href={`/blog/${featuredBlog.id}`}>
            <Card
              className="overflow-hidden hover-elevate cursor-pointer"
              data-testid={`card-blog-${featuredBlog.id}`}
            >
              <CardContent className="p-5">
                {featuredBlog.imageUrl && (
                  <img
                    src={featuredBlog.imageUrl}
                    alt={featuredBlog.title}
                    className="w-full max-w-md aspect-[16/9] object-cover rounded-md mb-4"
                  />
                )}
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  {featuredBlog.isFeatured && (
                    <Badge
                      variant="secondary"
                      className="bg-violet-500/15 text-violet-400 border-violet-400/30 text-[10px]"
                    >
                      Featured
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {featuredBlog.createdAt
                      ? new Date(featuredBlog.createdAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )
                      : ""}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {featuredBlog.viewCount ?? featuredBlog.views ?? 0} views
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {featuredBlog.commentCount ??
                      featuredBlog.commentsCount ??
                      0}{" "}
                    comments
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {readingTime(featuredBlog.content || featuredBlog.excerpt)}{" "}
                    min read
                  </span>
                </div>
                <h3
                  className="text-lg font-semibold text-foreground"
                  data-testid={`text-blog-title-${featuredBlog.id}`}
                >
                  {featuredBlog.title}
                </h3>
                {featuredBlog.excerpt && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                    {featuredBlog.excerpt}
                  </p>
                )}
                {featuredBlog.author && (
                  <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary">
                      {featuredBlog.author.username?.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="font-medium text-foreground">
                      {featuredBlog.author.username}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Card data-testid="card-blog-empty">
            <CardContent className="p-10 text-center">
              <Rss className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">
                No blog posts yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Check back later for new articles.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
      {/* Trending topics */}
      <section className="space-y-4" data-testid="section-trending-topics">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-semibold text-foreground">
                Trending topics
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              The most engaging forum discussions right now
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs gap-1"
            data-testid="link-explore-forums-top"
          >
            <Link href="/forums">
              Explore forums <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
        </div>

        {threadsLoading ? (
          <Skeleton className="h-[220px] rounded-md" />
        ) : trendingThreads.length > 0 ? (
          <Card>
            <CardContent className="p-2">
              {trendingThreads.map((thread) => (
                <Link key={thread.id} href={`/forums/thread/${thread.id}`}>
                  <div
                    className="flex items-center justify-between gap-3 p-3 rounded-md hover-elevate cursor-pointer"
                    data-testid={`card-thread-${thread.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-md bg-orange-500/10 flex items-center justify-center shrink-0">
                        <Flame className="w-4 h-4 text-orange-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {thread.title}
                        </p>
                        {thread.author?.username && (
                          <p className="text-xs text-muted-foreground truncate">
                            by {thread.author.username}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {thread.replyCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {thread.viewCount || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card
            className="bg-card/40 border-dashed"
            data-testid="card-trending-empty"
          >
            <CardContent className="p-10 text-center min-h-[220px] flex flex-col items-center justify-center">
              <p className="text-base font-semibold text-foreground">
                No trending topics
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Check back later for updated content.
              </p>
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="mt-4"
                data-testid="button-explore-forums-empty"
              >
                <Link href="/forums">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Explore Forums
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
      {/* Recent support tickets */}
      <section className="space-y-4" data-testid="section-support-tickets">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-foreground">
                Recent support tickets
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Your most recent active tickets
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs gap-1"
            data-testid="link-open-support"
          >
            <Link href="/support">
              Open support tickets <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
        </div>

        <Card
          className="bg-card/40 border-dashed"
          data-testid="card-support-empty"
        >
          <CardContent className="p-10 text-center min-h-[200px] flex flex-col items-center justify-center">
            <p className="text-base font-semibold text-foreground">
              No support tickets
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Open a new support ticket to get started.
            </p>
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="mt-4"
              data-testid="button-new-support-ticket"
            >
              <Link href="/support">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                New Support Ticket
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
