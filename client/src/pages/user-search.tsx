import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  ArrowRight,
  CalendarDays,
  FileText,
  Filter,
  Package,
  Search,
  SlidersHorizontal,
  User as UserIcon,
  X,
} from "lucide-react";
import type { User } from "@shared/schema";
import { UserRankBadge } from "@/components/user-rank-badge";
import { VerifiedBadge } from "@/components/verified-badge";

const CONTENT_TYPES = [
  "Policy",
  "Post",
  "Product",
  "Topic",
  "Member",
] as const;

const SORT_OPTIONS = ["Relevance", "Date", "Title", "Author"];
const ORDER_OPTIONS = ["Descending", "Ascending"];
const RESULT_OPTIONS = ["10", "20", "50", "100"];

type ContentType = (typeof CONTENT_TYPES)[number];

function SectionLabel({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon?: typeof Filter;
}) {
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

function ResultHeader({
  label,
  count,
  icon: Icon,
}: {
  label: string;
  count: number;
  icon: typeof UserIcon;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-white/[0.05] bg-white/[0.025]">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <p className="text-xs font-semibold text-foreground">{label}</p>
      </div>

      <Badge
        variant="outline"
        className="text-[10px] h-5 px-2 border-white/[0.08] text-muted-foreground"
      >
        {count}
      </Badge>
    </div>
  );
}

function EmptySearchState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="py-20 px-6 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4">
        <Search className="w-5 h-5 text-muted-foreground" />
      </div>

      <p className="text-sm font-semibold text-foreground">{title}</p>

      <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");

  const [contentTypes, setContentTypes] = useState<
    Record<ContentType, boolean>
  >({
    Policy: true,
    Post: true,
    Product: true,
    Topic: true,
    Member: true,
  });

  const [sortBy, setSortBy] = useState("Relevance");
  const [order, setOrder] = useState("Descending");
  const [createdAfter, setCreatedAfter] = useState("");
  const [createdBefore, setCreatedBefore] = useState("");
  const [updatedAfter, setUpdatedAfter] = useState("");
  const [updatedBefore, setUpdatedBefore] = useState("");
  const [resultsPerPage, setResultsPerPage] = useState("20");

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users", { search: appliedQuery }],
    queryFn: async () => {
      if (!appliedQuery || !contentTypes.Member) return [];

      const res = await fetch(
        `/api/users?search=${encodeURIComponent(appliedQuery)}`,
      );

      if (!res.ok) return [];

      return res.json();
    },
    enabled: !!appliedQuery,
  });

  const { data: posts, isLoading: postsLoading } = useQuery<any[]>({
    queryKey: ["/api/blog", { search: appliedQuery }],
    queryFn: async () => {
      if (!appliedQuery || !contentTypes.Post) return [];

      const res = await fetch("/api/blog");

      if (!res.ok) return [];

      const all = await res.json();

      return all.filter(
        (post: any) =>
          post.title?.toLowerCase().includes(appliedQuery.toLowerCase()) ||
          post.content?.toLowerCase().includes(appliedQuery.toLowerCase()),
      );
    },
    enabled: !!appliedQuery,
  });

  const { data: products, isLoading: productsLoading } = useQuery<any[]>({
    queryKey: ["/api/products", { search: appliedQuery }],
    queryFn: async () => {
      if (!appliedQuery || !contentTypes.Product) return [];

      const res = await fetch("/api/products");

      if (!res.ok) return [];

      const all = await res.json();

      return all.filter(
        (product: any) =>
          product.name?.toLowerCase().includes(appliedQuery.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(appliedQuery.toLowerCase()),
      );
    },
    enabled: !!appliedQuery,
  });

  const isLoading = usersLoading || postsLoading || productsLoading;

  const counts = {
    Policy: 0,
    Post: appliedQuery ? posts?.length ?? 0 : 0,
    Product: appliedQuery ? products?.length ?? 0 : 0,
    Topic: 0,
    Member: appliedQuery ? users?.length ?? 0 : 0,
  };

  const handleApply = () => {
    setAppliedQuery(query.trim());
  };

  const clearSearch = () => {
    setQuery("");
    setAppliedQuery("");
  };

  const toggleType = (type: ContentType) => {
    setContentTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const hasResults =
    !!appliedQuery &&
    ((contentTypes.Member && (users?.length ?? 0) > 0) ||
      (contentTypes.Post && (posts?.length ?? 0) > 0) ||
      (contentTypes.Product && (products?.length ?? 0) > 0));

  const activeFilterCount = CONTENT_TYPES.filter(
    (type) => !contentTypes[type],
  ).length;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-8">
          {/* Header */}
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="h-7 px-2.5 gap-1.5 border-white/[0.08] bg-white/[0.025] text-muted-foreground"
              >
                <Search className="w-3.5 h-3.5" />
                Global Search
              </Badge>

              {appliedQuery && (
                <Badge
                  variant="outline"
                  className="h-7 px-2.5 border-white/[0.08] bg-white/[0.025] text-muted-foreground"
                >
                  {counts.Member +
                    counts.Post +
                    counts.Product}{" "}
                  result
                  {counts.Member + counts.Post + counts.Product === 1
                    ? ""
                    : "s"}
                </Badge>
              )}
            </div>

            <div>
              <h1
                className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
                data-testid="heading-search"
              >
                Search RIVET
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                Find members, posts, products, policies, and community
                content across the RIVET platform.
              </p>
            </div>
          </header>

          {/* Search bar */}
          <section className="relative">
            <div className="relative rounded-2xl border border-white/[0.09] bg-white/[0.035] shadow-2xl shadow-black/10 p-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4 text-muted-foreground" />
                </div>

                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleApply();
                  }}
                  placeholder="Search members, posts, products..."
                  className="flex-1 bg-transparent border-0 shadow-none text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0 px-1 h-10"
                  data-testid="input-search-query"
                />

                {query && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearSearch}
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}

                <Button
                  onClick={handleApply}
                  className="h-10 px-5 shrink-0 font-semibold"
                  data-testid="button-apply-filters"
                >
                  Search
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </section>

          <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-5 items-start">
            {/* Filters */}
            <aside className="rounded-2xl border border-white/[0.07] bg-white/[0.025] overflow-hidden lg:sticky lg:top-6">
              <div className="px-5 py-4 border-b border-white/[0.06]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Search filters
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Refine your results
                    </p>
                  </div>

                  <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <div className="p-5 space-y-7">
                {/* Content */}
                <div className="space-y-3">
                  <SectionLabel icon={Filter}>Content type</SectionLabel>

                  <div className="space-y-2">
                    {CONTENT_TYPES.map((type) => (
                      <div
                        key={type}
                        className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/[0.025] transition-colors"
                      >
                        <Checkbox
                          id={`type-${type}`}
                          checked={contentTypes[type]}
                          onCheckedChange={() => toggleType(type)}
                          data-testid={`checkbox-type-${type.toLowerCase()}`}
                        />

                        <label
                          htmlFor={`type-${type}`}
                          className="text-sm text-foreground/80 cursor-pointer flex-1 select-none"
                        >
                          {type}
                        </label>

                        <span className="text-[11px] tabular-nums text-muted-foreground">
                          {counts[type]}
                        </span>
                      </div>
                    ))}
                  </div>

                  {activeFilterCount > 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      {activeFilterCount} type
                      {activeFilterCount === 1 ? "" : "s"} excluded
                    </p>
                  )}
                </div>

                {/* Sorting */}
                <div className="space-y-3">
                  <SectionLabel>Sorting</SectionLabel>

                  <div className="space-y-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger
                        className="h-9 bg-white/[0.025] border-white/[0.08] text-xs"
                        data-testid="select-sort-by"
                      >
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={order} onValueChange={setOrder}>
                      <SelectTrigger
                        className="h-9 bg-white/[0.025] border-white/[0.08] text-xs"
                        data-testid="select-sort-order"
                      >
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        {ORDER_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-3">
                  <SectionLabel icon={CalendarDays}>
                    Date filters
                  </SectionLabel>

                  <div className="grid grid-cols-1 gap-3">
                    {[
                      {
                        label: "Created after",
                        value: createdAfter,
                        setValue: setCreatedAfter,
                        id: "input-created-after",
                      },
                      {
                        label: "Created before",
                        value: createdBefore,
                        setValue: setCreatedBefore,
                        id: "input-created-before",
                      },
                      {
                        label: "Updated after",
                        value: updatedAfter,
                        setValue: setUpdatedAfter,
                        id: "input-updated-after",
                      },
                      {
                        label: "Updated before",
                        value: updatedBefore,
                        setValue: setUpdatedBefore,
                        id: "input-updated-before",
                      },
                    ].map((field) => (
                      <div key={field.id} className="space-y-1.5">
                        <p className="text-[11px] text-muted-foreground">
                          {field.label}
                        </p>

                        <Input
                          type="date"
                          value={field.value}
                          onChange={(event) =>
                            field.setValue(event.target.value)
                          }
                          className="h-9 bg-white/[0.025] border-white/[0.08] text-xs"
                          style={{ colorScheme: "dark" }}
                          data-testid={field.id}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Result limit */}
                <div className="space-y-3">
                  <SectionLabel>Results per type</SectionLabel>

                  <Select
                    value={resultsPerPage}
                    onValueChange={setResultsPerPage}
                  >
                    <SelectTrigger
                      className="h-9 bg-white/[0.025] border-white/[0.08] text-xs"
                      data-testid="select-results-per-page"
                    >
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {RESULT_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option} results
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full h-9 font-semibold"
                  onClick={handleApply}
                  data-testid="button-apply-filters"
                >
                  Apply filters
                </Button>
              </div>
            </aside>

            {/* Results */}
            <main className="min-w-0">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] overflow-hidden min-h-[420px]">
                {!appliedQuery ? (
                  <EmptySearchState
                    title="Ready when you are"
                    description="Enter a search query above to search across the RIVET platform."
                  />
                ) : isLoading ? (
                  <div className="py-24 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-white/[0.1] border-t-primary animate-spin" />
                    <p className="text-xs text-muted-foreground mt-4">
                      Searching RIVET...
                    </p>
                  </div>
                ) : !hasResults ? (
                  <EmptySearchState
                    title="No results found"
                    description="Try another search term, enable more content types, or adjust your filters."
                  />
                ) : (
                  <div className="divide-y divide-white/[0.05]">
                    {/* Members */}
                    {contentTypes.Member &&
                      users &&
                      users.length > 0 && (
                        <section>
                          <ResultHeader
                            label="Members"
                            count={users.length}
                            icon={UserIcon}
                          />

                          <div className="divide-y divide-white/[0.04]">
                            {users
                              .slice(0, parseInt(resultsPerPage))
                              .map((user) => (
                                <Link
                                  key={user.id}
                                  href={`/profile/${user.id}`}
                                >
                                  <div
                                    className="px-5 py-4 flex items-center gap-3.5 hover:bg-white/[0.025] transition-colors cursor-pointer group"
                                    data-testid={`result-member-${user.id}`}
                                  >
                                    <Avatar className="w-10 h-10 shrink-0 border border-white/[0.08]">
                                      <AvatarImage
                                        src={
                                          user.profileImageUrl || undefined
                                        }
                                      />

                                      <AvatarFallback className="text-xs bg-white/[0.04]">
                                        <UserIcon className="w-4 h-4 text-muted-foreground" />
                                      </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-foreground truncate flex items-center gap-1.5">
                                        {user.username}

                                        <VerifiedBadge
                                          isVerified={(user as any).isVerified}
                                          size="sm"
                                        />
                                      </p>

                                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                                        {user.userRank || "Members"}
                                      </p>
                                    </div>

                                    <UserRankBadge
                                      rank={user.userRank || "Members"}
                                      size="sm"
                                    />

                                    <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
                                  </div>
                                </Link>
                              ))}
                          </div>
                        </section>
                      )}

                    {/* Posts */}
                    {contentTypes.Post &&
                      posts &&
                      posts.length > 0 && (
                        <section>
                          <ResultHeader
                            label="Posts"
                            count={posts.length}
                            icon={FileText}
                          />

                          <div className="divide-y divide-white/[0.04]">
                            {posts
                              .slice(0, parseInt(resultsPerPage))
                              .map((post: any) => (
                                <Link
                                  key={post.id}
                                  href={`/blog/${post.id}`}
                                >
                                  <div
                                    className="px-5 py-4 hover:bg-white/[0.025] transition-colors cursor-pointer group"
                                    data-testid={`result-post-${post.id}`}
                                  >
                                    <div className="flex items-start gap-4">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">
                                          {post.title}
                                        </p>

                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                                          {post.content?.slice(0, 180)}
                                        </p>
                                      </div>

                                      <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0 mt-0.5" />
                                    </div>
                                  </div>
                                </Link>
                              ))}
                          </div>
                        </section>
                      )}

                    {/* Products */}
                    {contentTypes.Product &&
                      products &&
                      products.length > 0 && (
                        <section>
                          <ResultHeader
                            label="Products"
                            count={products.length}
                            icon={Package}
                          />

                          <div className="divide-y divide-white/[0.04]">
                            {products
                              .slice(0, parseInt(resultsPerPage))
                              .map((product: any) => (
                                <Link
                                  key={product.id}
                                  href={`/store/product/${product.id}`}
                                >
                                  <div
                                    className="px-5 py-4 hover:bg-white/[0.025] transition-colors cursor-pointer group"
                                    data-testid={`result-product-${product.id}`}
                                  >
                                    <div className="flex items-start gap-4">
                                      {product.imageUrl ? (
                                        <img
                                          src={product.imageUrl}
                                          alt=""
                                          className="w-12 h-12 rounded-lg object-cover border border-white/[0.08] shrink-0"
                                        />
                                      ) : (
                                        <div className="w-12 h-12 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0">
                                          <Package className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                      )}

                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">
                                          {product.name}
                                        </p>

                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                                          {product.description?.slice(0, 140)}
                                        </p>

                                        {product.price !== undefined && (
                                          <p className="text-xs font-medium text-foreground mt-2">
                                            {product.price === 0
                                              ? "Free"
                                              : `$${(
                                                  product.price / 100
                                                ).toFixed(2)}`}
                                          </p>
                                        )}
                                      </div>

                                      <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0 mt-0.5" />
                                    </div>
                                  </div>
                                </Link>
                              ))}
                          </div>
                        </section>
                      )}
                  </div>
                )}
              </div>

              {/* Search summary */}
              {appliedQuery && !isLoading && (
                <div className="flex flex-wrap items-center justify-between gap-3 mt-3 px-1">
                  <p className="text-[11px] text-muted-foreground">
                    Search results for{" "}
                    <span className="text-foreground font-medium">
                      “{appliedQuery}”
                    </span>
                  </p>

                  <p className="text-[11px] text-muted-foreground">
                    {counts.Member + counts.Post + counts.Product} total
                    result
                    {counts.Member + counts.Post + counts.Product === 1
                      ? ""
                      : "s"}
                  </p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}