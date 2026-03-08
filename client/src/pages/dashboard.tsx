import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRankBadge } from "@/components/user-rank-badge";
import { VipBadge } from "@/components/vip-badge";
import { Link } from "wouter";
import {
  ShoppingCart,
  Rss,
  Flame,
  Gavel,
  ArrowRight,
  Shield,
  MessageSquare,
  Crown,
  Plus,
  User,
  FileText,
  AlertTriangle,
  Eye,
  Clock,
  Store,
  BookOpen,
  MessagesSquare,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ["/api/products"],
    enabled: !!user,
  });

  const { data: blogs = [] } = useQuery<any[]>({
    queryKey: ["/api/blog"],
    enabled: !!user,
  });

  const { data: threads = [] } = useQuery<any[]>({
    queryKey: ["/api/forums/threads"],
    enabled: !!user,
  });

  const { data: myReports = [] } = useQuery<any[]>({
    queryKey: ["/api/reports/my"],
    enabled: !!user,
  });

  const { data: myAppeals = [] } = useQuery<any[]>({
    queryKey: ["/api/appeals/my"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Skeleton className="h-24 rounded-md" />
          <Skeleton className="h-24 rounded-md" />
          <Skeleton className="h-24 rounded-md" />
          <Skeleton className="h-24 rounded-md" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-[280px] rounded-md" />
          <Skeleton className="h-[280px] rounded-md" />
          <Skeleton className="h-[280px] rounded-md" />
          <Skeleton className="h-[280px] rounded-md" />
        </div>
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
          <h2 className="text-xl font-semibold text-foreground" data-testid="text-access-restricted">Access Restricted</h2>
          <p className="text-muted-foreground text-sm">Please sign in to view your dashboard.</p>
        </div>
        <Button asChild data-testid="button-login-redirect">
          <Link href="/login">Login to Account</Link>
        </Button>
      </div>
    );
  }

  const totalCases = myReports.length + myAppeals.length;
  const pendingCases = myReports.filter((r: any) => r.status === "Pending").length +
    myAppeals.filter((a: any) => a.status === "Pending" || a.status === "pending").length;
  const topProducts = products.slice(0, 3);
  const latestBlogs = blogs.slice(0, 3);
  const trendingThreads = threads.slice(0, 3);

  const userInitials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <Card data-testid="card-welcome-header">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={user.profileImageUrl ?? undefined} alt={user.username ?? undefined} />
              <AvatarFallback className="text-lg font-semibold">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-semibold text-foreground" data-testid="text-dashboard-title">
                  Welcome back, {user.username}
                </h1>
                {user.vipTier && user.vipTier !== "none" && (
                  <VipBadge tier={user.vipTier as any} size="sm" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <UserRankBadge rank={(user as any).rank || undefined} size="sm" />
                <span className="text-sm text-muted-foreground">
                  Here's what's happening across the platform
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="hover-elevate" data-testid="stat-products">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Store className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-foreground">{products.length}</p>
                <p className="text-xs text-muted-foreground">Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate" data-testid="stat-threads">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <MessagesSquare className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-foreground">{threads.length}</p>
                <p className="text-xs text-muted-foreground">Threads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate" data-testid="stat-blogs">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-foreground">{blogs.length}</p>
                <p className="text-xs text-muted-foreground">Blog Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate" data-testid="stat-cases">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Gavel className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-foreground">{totalCases}</p>
                <p className="text-xs text-muted-foreground">
                  {pendingCases > 0 ? `${pendingCases} pending` : "Cases"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-quick-actions">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground mr-1">Quick Actions</span>
            <Button variant="outline" size="sm" asChild data-testid="action-create-thread">
              <Link href="/forums/create">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                New Thread
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild data-testid="action-browse-store">
              <Link href="/store">
                <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                Browse Store
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild data-testid="action-view-profile">
              <Link href={`/user/${user.id}`}>
                <User className="w-3.5 h-3.5 mr-1.5" />
                View Profile
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild data-testid="action-submit-report">
              <Link href="/support">
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                Support
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card data-testid="card-products-section">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <ShoppingCart className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Top Rated Products</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Latest and trending products</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1" asChild data-testid="link-browse-store">
              <Link href="/store">Browse <ArrowRight className="w-3 h-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {topProducts.length > 0 ? (
              topProducts.map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 rounded-md bg-muted/50 hover-elevate"
                  data-testid={`card-product-${product.id}`}
                >
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {product.isFeatured && <Badge variant="secondary" className="text-[10px]">Featured</Badge>}
                      {product.isCommunityProvided && <Badge variant="outline" className="text-[10px]">Community</Badge>}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">${(product.price / 100).toFixed(2)}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <ShoppingCart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No products available yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Check back later for new items</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-blog-section">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Rss className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Latest Blog Posts</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Articles and announcements</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1" asChild data-testid="link-view-blogs">
              <Link href="/blog">View all <ArrowRight className="w-3 h-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {latestBlogs.length > 0 ? (
              latestBlogs.map((blog: any) => (
                <Link key={blog.id} href={`/blog/${blog.id}`}>
                  <div
                    className="flex items-start gap-3 p-3 rounded-md bg-muted/50 hover-elevate cursor-pointer"
                    data-testid={`card-blog-${blog.id}`}
                  >
                    {blog.imageUrl ? (
                      <img src={blog.imageUrl} alt={blog.title} className="w-10 h-10 rounded-md object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <Rss className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{blog.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {blog.isFeatured && <Badge variant="secondary" className="text-[10px]">Featured</Badge>}
                        <span className="text-xs text-muted-foreground">
                          {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-10">
                <Rss className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No blog posts yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">New articles will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-forums-section">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Trending Topics</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Active forum discussions</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1" asChild data-testid="link-view-forums">
              <Link href="/forums">View all <ArrowRight className="w-3 h-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {trendingThreads.length > 0 ? (
              trendingThreads.map((thread: any) => (
                <Link key={thread.id} href={`/forums/thread/${thread.id}`}>
                  <div
                    className="flex items-center gap-3 p-3 rounded-md bg-muted/50 hover-elevate cursor-pointer"
                    data-testid={`card-thread-${thread.id}`}
                  >
                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{thread.title}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> {thread.replyCount || 0}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {thread.viewCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-10">
                <Flame className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No trending topics right now</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Start a discussion in the forums</p>
                <Button variant="outline" size="sm" className="mt-3" asChild data-testid="link-explore-forums">
                  <Link href="/forums">Explore Forums</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-cases-section">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Gavel className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Your Cases</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Reports & appeals you've submitted</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1" asChild data-testid="link-open-cases">
              <Link href="/my-cases">View all <ArrowRight className="w-3 h-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {totalCases > 0 ? (
              <>
                {myReports.slice(0, 2).map((report: any) => (
                  <div
                    key={report.id}
                    className="p-3 rounded-md bg-muted/50"
                    data-testid={`card-case-report-${report.id}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <p className="text-sm font-medium text-foreground truncate">{report.reason}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">Report</Badge>
                          <span className="text-xs text-muted-foreground">{report.targetType}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : ""}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] shrink-0 ${
                          report.status === "Pending" ? "bg-yellow-500/10 text-yellow-500 dark:text-yellow-400" :
                          report.status === "Action Taken" ? "bg-green-500/10 text-green-600 dark:text-green-400" :
                          report.status === "Reviewed" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                          ""
                        }`}
                        data-testid={`badge-status-report-${report.id}`}
                      >
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {myAppeals.slice(0, 2).map((appeal: any) => (
                  <div
                    key={appeal.id}
                    className="p-3 rounded-md bg-muted/50"
                    data-testid={`card-case-appeal-${appeal.id}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Gavel className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <p className="text-sm font-medium text-foreground truncate">{appeal.reason}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">Appeal</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {appeal.createdAt ? new Date(appeal.createdAt).toLocaleDateString() : ""}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] shrink-0 ${
                          (appeal.status === "pending" || appeal.status === "Pending") ? "bg-yellow-500/10 text-yellow-500 dark:text-yellow-400" :
                          (appeal.status === "approved" || appeal.status === "Approved") ? "bg-green-500/10 text-green-600 dark:text-green-400" :
                          "bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}
                        data-testid={`badge-status-appeal-${appeal.id}`}
                      >
                        {appeal.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-10">
                <Gavel className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No submitted reports or appeals</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Your moderation cases will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
