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
  ChevronRight,
  User,
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
  author?: {
    id: string;
    username: string;
    profileImageUrl?: string | null;
  };
};

type Thread = {
  id: string;
  title: string;
  replyCount?: number;
  viewCount?: number;
  createdAt?: string;
  author?: {
    username?: string;
  };
};

const formatPrice = (cents: number) =>
  cents === 0 ? "Free" : `$${(cents / 100).toFixed(2)}`;

const readingTime = (text?: string | null) => {
  if (!text) return 1;

  const words = text
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.round(words / 200));
};

function SectionHeader({
  eyebrow,
  title,
  description,
  icon,
  href,
  linkLabel,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-6 flex-wrap">
      <div className="space-y-2">
        {eyebrow && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
            {eyebrow}
          </p>
        )}

        <div className="flex items-center gap-2.5">
          {icon && (
            <span className="text-primary shrink-0">
              {icon}
            </span>
          )}

          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
        </div>

        {description && (
          <p className="text-sm text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {href && linkLabel && (
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="group gap-1.5 text-xs"
        >
          <Link href={href}>
            {linkLabel}
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      )}
    </div>
  );
}

function ProductCard({
  product,
  badgeLabel,
  badgeClass,
  icon,
  title,
  accentClass,
}: {
  product: Product;
  badgeLabel: string;
  badgeClass: string;
  icon: React.ReactNode;
  title: string;
  accentClass: string;
}) {
  return (
    <Card className="group overflow-hidden border-border/50 bg-card/50 transition-all duration-300 hover:border-border hover:bg-card/80 hover:-translate-y-0.5">
      <div className="relative overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full aspect-[16/9] object-cover transition-transform duration-500 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="w-full aspect-[16/9] bg-muted/30 flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-muted-foreground/30" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        <Badge
          variant="outline"
          className={`absolute top-3 left-3 backdrop-blur-md bg-black/40 text-[10px] uppercase tracking-[0.12em] ${badgeClass}`}
        >
          {badgeLabel}
        </Badge>
      </div>

      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className={accentClass}>{icon}</span>
          <span
            className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${accentClass}`}
          >
            {title}
          </span>
        </div>

        <h3 className="text-base font-semibold text-foreground line-clamp-1">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 mt-5">
          <span className="text-sm font-semibold text-foreground">
            {formatPrice(product.price)}
          </span>

          <Button
            asChild
            variant="secondary"
            size="sm"
            className="group/button"
          >
            <Link href="/store">
              View product
              <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover/button:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyProductCard({
  title,
  icon,
  message,
  accentClass,
}: {
  title: string;
  icon: React.ReactNode;
  message: string;
  accentClass: string;
}) {
  return (
    <Card className="border-dashed border-border/60 bg-card/20">
      <CardContent className="min-h-[300px] p-8 flex flex-col items-center justify-center text-center">
        <div className="w-11 h-11 rounded-full border border-border/60 bg-muted/20 flex items-center justify-center mb-4">
          {icon}
        </div>

        <p
          className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${accentClass}`}
        >
          {title}
        </p>

        <p className="text-base font-semibold text-foreground mt-2">
          {message}
        </p>

        <p className="text-sm text-muted-foreground mt-1">
          No products are currently available.
        </p>

        <Button
          asChild
          variant="secondary"
          size="sm"
          className="mt-5"
        >
          <Link href="/store">
            <Store className="w-3.5 h-3.5 mr-1.5" />
            Browse store
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  const { data: products = [], isLoading: productsLoading } =
    useQuery<Product[]>({
      queryKey: ["/api/products"],
      enabled: !!user,
    });

  const { data: blogs = [], isLoading: blogsLoading } =
    useQuery<Blog[]>({
      queryKey: ["/api/blog"],
      enabled: !!user,
    });

  const { data: threads = [], isLoading: threadsLoading } =
    useQuery<Thread[]>({
      queryKey: ["/api/forums/threads"],
      enabled: !!user,
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-96 max-w-full" />
          </div>

          <Skeleton className="h-[320px] rounded-xl" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Skeleton className="h-[360px] rounded-xl" />
            <Skeleton className="h-[360px] rounded-xl" />
            <Skeleton className="h-[360px] rounded-xl" />
          </div>

          <Skeleton className="h-[300px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-border/60 bg-card/70">
          <CardContent className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/60 flex items-center justify-center mx-auto mb-5">
              <Shield className="w-6 h-6 text-muted-foreground" />
            </div>

            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-primary">
              RIVET Studios™
            </p>

            <h2 className="text-2xl font-semibold tracking-tight text-foreground mt-2">
              Sign in required
            </h2>

            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Sign in to access your RIVET dashboard, community activity,
              store content and support information.
            </p>

            <Button asChild className="mt-6">
              <Link href="/login">
                Login to account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const approved = products.filter(
    (p) => !p.status || p.status === "approved",
  );

  const sortedByDate = [...approved].sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime(),
  );

  const newestProduct = sortedByDate[0];

  const popularProduct = [...approved]
    .sort(
      (a, b) =>
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime(),
    )
    .find((p) => p.id !== newestProduct?.id);

  const featuredProduct =
    approved.find(
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
        (b.replyCount || 0) +
        (b.viewCount || 0) -
        ((a.replyCount || 0) + (a.viewCount || 0)),
    )
    .slice(0, 5);

  const displayName =
    user.username ||
    user.firstName ||
    "Member";

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient dashboard header */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute -bottom-40 left-1/4 w-[24rem] h-[20rem] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.08))]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-start justify-between gap-8">
            <div className="max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                RIVET Studios™
              </p>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground mt-3">
                Welcome back, {displayName}.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground mt-3 max-w-2xl leading-relaxed">
                Your central hub for the RIVET community. Catch up on what's
                happening, discover new content and keep up with the latest
                discussions.
              </p>
            </div>

            <div className="hidden sm:flex shrink-0 w-11 h-11 rounded-full border border-border/60 bg-card/60 items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        {/* Store */}
        <section data-testid="section-top-rated">
          <SectionHeader
            eyebrow="RIVET Store"
            title="Discover something new."
            description="Explore the latest products and community offerings available through RIVET."
            icon={<ShoppingCart className="w-5 h-5" />}
            href="/store"
            linkLabel="Browse store"
          />

          <div className="mt-6">
            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Skeleton className="h-[380px] rounded-xl" />
                <Skeleton className="h-[380px] rounded-xl" />
                <Skeleton className="h-[380px] rounded-xl" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {newestProduct ? (
                  <ProductCard
                    product={newestProduct}
                    title="Newest arrival"
                    icon={<Sparkles className="w-3.5 h-3.5" />}
                    accentClass="text-sky-400"
                    badgeLabel="New"
                    badgeClass="text-sky-300 border-sky-400/30"
                  />
                ) : (
                  <EmptyProductCard
                    title="Newest arrival"
                    icon={<Sparkles className="w-5 h-5 text-sky-400" />}
                    accentClass="text-sky-400"
                    message="Nothing new right now"
                  />
                )}

                {popularProduct ? (
                  <ProductCard
                    product={popularProduct}
                    title="Popular"
                    icon={<Star className="w-3.5 h-3.5" />}
                    accentClass="text-foreground"
                    badgeLabel="Popular"
                    badgeClass="text-foreground border-border/70"
                  />
                ) : (
                  <EmptyProductCard
                    title="Popular"
                    icon={<Star className="w-5 h-5 text-muted-foreground" />}
                    accentClass="text-foreground"
                    message="No popular products yet"
                  />
                )}

                {featuredProduct ? (
                  <ProductCard
                    product={featuredProduct}
                    title="Featured"
                    icon={<Sparkles className="w-3.5 h-3.5" />}
                    accentClass="text-rose-400"
                    badgeLabel="Featured"
                    badgeClass="text-rose-300 border-rose-400/30"
                  />
                ) : (
                  <EmptyProductCard
                    title="Featured"
                    icon={<Sparkles className="w-5 h-5 text-rose-400" />}
                    accentClass="text-rose-400"
                    message="No featured products"
                  />
                )}
              </div>
            )}
          </div>
        </section>

        {/* Blog */}
        <section data-testid="section-latest-blog">
          <SectionHeader
            eyebrow="From RIVET"
            title="Latest from the studio."
            description="News, articles and updates from across RIVET Studios™."
            icon={<Rss className="w-5 h-5" />}
            href="/blog"
            linkLabel="View all posts"
          />

          <div className="mt-6">
            {blogsLoading ? (
              <Skeleton className="h-[360px] rounded-xl" />
            ) : featuredBlog ? (
              <Link href={`/blog/${featuredBlog.id}`}>
                <Card className="group overflow-hidden border-border/50 bg-card/50 hover:bg-card/70 transition-all duration-300 cursor-pointer">
                  <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
                    {featuredBlog.imageUrl ? (
                      <div className="relative min-h-[260px] lg:min-h-[360px] overflow-hidden">
                        <img
                          src={featuredBlog.imageUrl}
                          alt={featuredBlog.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/10" />
                      </div>
                    ) : (
                      <div className="min-h-[260px] lg:min-h-[360px] bg-muted/20 flex items-center justify-center">
                        <Rss className="w-10 h-10 text-muted-foreground/20" />
                      </div>
                    )}

                    <CardContent className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                      <div className="flex items-center gap-3 flex-wrap mb-5">
                        {featuredBlog.isFeatured && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] uppercase tracking-[0.12em] bg-primary/10 text-primary border border-primary/20"
                          >
                            Featured
                          </Badge>
                        )}

                        {featuredBlog.createdAt && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(
                              featuredBlog.createdAt,
                            ).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground leading-tight">
                        {featuredBlog.title}
                      </h3>

                      {featuredBlog.excerpt && (
                        <p className="text-sm sm:text-base text-muted-foreground mt-4 leading-relaxed line-clamp-4">
                          {featuredBlog.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-7 flex-wrap">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          {featuredBlog.viewCount ??
                            featuredBlog.views ??
                            0}{" "}
                          views
                        </span>

                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {featuredBlog.commentCount ??
                            featuredBlog.commentsCount ??
                            0}{" "}
                          comments
                        </span>

                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {readingTime(
                            featuredBlog.content ||
                              featuredBlog.excerpt,
                          )}{" "}
                          min read
                        </span>
                      </div>

                      {featuredBlog.author && (
                        <div className="flex items-center gap-2.5 mt-7 pt-5 border-t border-border/40">
                          {featuredBlog.author.profileImageUrl ? (
                            <img
                              src={featuredBlog.author.profileImageUrl}
                              alt={featuredBlog.author.username}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary">
                              {featuredBlog.author.username
                                ?.slice(0, 2)
                                .toUpperCase()}
                            </div>
                          )}

                          <span className="text-xs font-medium text-foreground">
                            {featuredBlog.author.username}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-7 text-sm font-medium text-primary">
                        Read article
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            ) : (
              <Card className="border-dashed border-border/60 bg-card/20">
                <CardContent className="min-h-[260px] p-10 text-center flex flex-col items-center justify-center">
                  <Rss className="w-9 h-9 text-muted-foreground/25 mb-4" />

                  <p className="text-base font-semibold text-foreground">
                    No posts yet
                  </p>

                  <p className="text-sm text-muted-foreground mt-1">
                    Check back later for news and updates from RIVET.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Forums */}
        <section data-testid="section-trending-topics">
          <SectionHeader
            eyebrow="Community"
            title="What's happening."
            description="See what the RIVET community is talking about right now."
            icon={<Flame className="w-5 h-5" />}
            href="/forums"
            linkLabel="Explore forums"
          />

          <div className="mt-6">
            {threadsLoading ? (
              <Skeleton className="h-[300px] rounded-xl" />
            ) : trendingThreads.length > 0 ? (
              <Card className="overflow-hidden border-border/50 bg-card/40">
                <CardContent className="p-2">
                  {trendingThreads.map((thread, index) => (
                    <Link
                      key={thread.id}
                      href={`/forums/thread/${thread.id}`}
                    >
                      <div
                        className="group flex items-center gap-4 p-4 sm:p-5 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                        data-testid={`card-thread-${thread.id}`}
                      >
                        <div className="hidden sm:flex w-8 text-xs font-mono text-muted-foreground/50 justify-center shrink-0">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="w-10 h-10 rounded-lg border border-orange-400/15 bg-orange-400/5 flex items-center justify-center shrink-0">
                          <Flame className="w-4 h-4 text-orange-400" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {thread.title}
                          </p>

                          {thread.author?.username && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              Started by {thread.author.username}
                            </p>
                          )}
                        </div>

                        <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {thread.replyCount || 0}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            {thread.viewCount || 0}
                          </span>
                        </div>

                        <ChevronRight className="w-4 h-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-border/60 bg-card/20">
                <CardContent className="min-h-[240px] p-10 text-center flex flex-col items-center justify-center">
                  <Flame className="w-9 h-9 text-orange-400/30 mb-4" />

                  <p className="text-base font-semibold text-foreground">
                    Nothing is trending yet
                  </p>

                  <p className="text-sm text-muted-foreground mt-1">
                    Start a conversation and get the community talking.
                  </p>

                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="mt-5"
                  >
                    <Link href="/forums">
                      Explore forums
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Support */}
        <section data-testid="section-support-tickets">
          <SectionHeader
            eyebrow="Support"
            title="Need a hand?"
            description="Manage your support requests and get assistance from the RIVET team."
            icon={<LifeBuoy className="w-5 h-5" />}
            href="/support"
            linkLabel="Open support"
          />

          <div className="mt-6">
            <Card className="overflow-hidden border-border/50 bg-card/40">
              <CardContent className="p-7 sm:p-9">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-lg border border-blue-400/15 bg-blue-400/5 flex items-center justify-center shrink-0">
                      <LifeBuoy className="w-5 h-5 text-blue-400" />
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        No active support tickets
                      </h3>

                      <p className="text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">
                        You don't currently have any active support tickets.
                        If you need assistance, our support team is available
                        to help.
                      </p>
                    </div>
                  </div>

                  <Button asChild variant="secondary" className="shrink-0">
                    <Link href="/support">
                      <Plus className="w-4 h-4 mr-1.5" />
                      New support ticket
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}