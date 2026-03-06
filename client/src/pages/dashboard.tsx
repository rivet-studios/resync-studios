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
  Gavel,
  ArrowRight,
  Shield,
  MessageSquare,
  Crown,
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
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] rounded-2xl" />
          <Skeleton className="h-[300px] rounded-2xl" />
          <Skeleton className="h-[300px] rounded-2xl" />
          <Skeleton className="h-[300px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Shield className="w-8 h-8 text-slate-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">Access Restricted</h2>
          <p className="text-slate-500 text-sm">Please sign in to view your dashboard.</p>
        </div>
        <Button asChild className="bg-slate-900 text-white rounded-lg px-6" data-testid="button-login-redirect">
          <Link href="/login">Login to Account</Link>
        </Button>
      </div>
    );
  }

  const totalCases = myReports.length + myAppeals.length;
  const topProducts = products.slice(0, 3);
  const latestBlogs = blogs.slice(0, 3);
  const trendingThreads = threads.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white" data-testid="text-dashboard-title">
            Welcome back, {user.username}
          </h1>
          <p className="text-sm text-white/50 mt-1">Here's what's happening across the platform</p>
        </div>
        {user.vipTier && user.vipTier !== "none" && (
          <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/20 font-medium" data-testid="badge-vip">
            <Crown className="w-3 h-3 mr-1" />
            {user.vipTier.replace("_", " ")}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#121212] border-white/5 rounded-2xl overflow-hidden" data-testid="card-products-section">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Top Rated Products</h2>
                  <p className="text-xs text-white/40">View the most recent, latest, and trending products</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-white/40 hover:text-white text-xs gap-1" asChild data-testid="link-browse-store">
                <Link href="/store">Browse Store <ArrowRight className="w-3 h-3" /></Link>
              </Button>
            </div>

            <div className="space-y-3">
              {topProducts.length > 0 ? (
                topProducts.map((product: any) => (
                  <div key={product.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors" data-testid={`card-product-${product.id}`}>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-white/20" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {product.isFeatured && <Badge className="bg-blue-500/10 text-blue-400 border-none text-[10px] px-1.5 py-0">Featured</Badge>}
                        {product.isCommunityProvided && <Badge className="bg-white/5 text-white/40 border-none text-[10px] px-1.5 py-0">Community</Badge>}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-white/60">${(product.price / 100).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="w-8 h-8 text-white/10 mx-auto mb-2" />
                  <p className="text-xs text-white/30">No products available yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#121212] border-white/5 rounded-2xl overflow-hidden" data-testid="card-blog-section">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Rss className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Latest Blog Posts</h2>
                  <p className="text-xs text-white/40">Stay updated with our latest articles and insights</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-white/40 hover:text-white text-xs gap-1" asChild data-testid="link-view-blogs">
                <Link href="/blog">View blogs <ArrowRight className="w-3 h-3" /></Link>
              </Button>
            </div>

            <div className="space-y-3">
              {latestBlogs.length > 0 ? (
                latestBlogs.map((blog: any) => (
                  <Link key={blog.id} href={`/blog/${blog.id}`}>
                    <div className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors cursor-pointer" data-testid={`card-blog-${blog.id}`}>
                      <div className="flex items-start gap-3">
                        {blog.imageUrl ? (
                          <img src={blog.imageUrl} alt={blog.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                            <Rss className="w-4 h-4 text-white/20" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{blog.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {blog.isFeatured && <Badge className="bg-blue-500/10 text-blue-400 border-none text-[10px] px-1.5 py-0">Featured</Badge>}
                            <span className="text-[10px] text-white/30">{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : ""}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <Rss className="w-8 h-8 text-white/10 mx-auto mb-2" />
                  <p className="text-xs text-white/30">No blog posts yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#121212] border-white/5 rounded-2xl overflow-hidden" data-testid="card-forums-section">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Trending Topics</h2>
                  <p className="text-xs text-white/40">The most engaging forum discussions right now</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-white/40 hover:text-white text-xs gap-1" asChild data-testid="link-view-forums">
                <Link href="/forums">View forums <ArrowRight className="w-3 h-3" /></Link>
              </Button>
            </div>

            <div className="space-y-3">
              {trendingThreads.length > 0 ? (
                trendingThreads.map((thread: any) => (
                  <Link key={thread.id} href={`/forums/thread/${thread.id}`}>
                    <div className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors cursor-pointer" data-testid={`card-thread-${thread.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                          <MessageSquare className="w-4 h-4 text-white/20" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{thread.title}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[10px] text-white/30">{thread.replyCount || 0} replies</span>
                            <span className="text-[10px] text-white/30">{thread.viewCount || 0} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <Flame className="w-8 h-8 text-white/10 mx-auto mb-2" />
                  <p className="text-xs text-white/30">No trending topics right now</p>
                  <Button variant="ghost" size="sm" className="text-white/30 mt-2 text-xs" asChild>
                    <Link href="/forums">Explore Forums</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#121212] border-white/5 rounded-2xl overflow-hidden" data-testid="card-cases-section">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Gavel className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Your Moderation Cases</h2>
                  <p className="text-xs text-white/40">View your submitted reports & appeals</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-white/40 hover:text-white text-xs gap-1" asChild data-testid="link-open-cases">
                <Link href="/my-cases">Open Cases <ArrowRight className="w-3 h-3" /></Link>
              </Button>
            </div>

            <div className="space-y-3">
              {totalCases > 0 ? (
                <>
                  {myReports.slice(0, 2).map((report: any) => (
                    <div key={report.id} className="p-3 rounded-xl bg-white/[0.03]" data-testid={`card-case-report-${report.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">Report: {report.reason}</p>
                          <span className="text-[10px] text-white/30">{report.targetType} • {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : ""}</span>
                        </div>
                        <Badge className={`text-[10px] px-2 py-0.5 border-none ${
                          report.status === "Pending" ? "bg-yellow-500/10 text-yellow-400" :
                          report.status === "Action Taken" ? "bg-green-500/10 text-green-400" :
                          report.status === "Reviewed" ? "bg-blue-500/10 text-blue-400" :
                          "bg-white/5 text-white/40"
                        }`}>
                          {report.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {myAppeals.slice(0, 2).map((appeal: any) => (
                    <div key={appeal.id} className="p-3 rounded-xl bg-white/[0.03]" data-testid={`card-case-appeal-${appeal.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">Appeal: {appeal.reason}</p>
                          <span className="text-[10px] text-white/30">{appeal.createdAt ? new Date(appeal.createdAt).toLocaleDateString() : ""}</span>
                        </div>
                        <Badge className={`text-[10px] px-2 py-0.5 border-none ${
                          appeal.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                          appeal.status === "approved" ? "bg-green-500/10 text-green-400" :
                          "bg-red-500/10 text-red-400"
                        }`}>
                          {appeal.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-8">
                  <Gavel className="w-8 h-8 text-white/10 mx-auto mb-2" />
                  <p className="text-xs text-white/30">No submitted reports or appeals</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
