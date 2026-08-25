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
import { Link } from "wouter";
import { Search, User as UserIcon } from "lucide-react";
import type { User } from "@shared/schema";
import { UserRankBadge } from "@/components/user-rank-badge";
import { VerifiedBadge } from "@/components/verified-badge";

const CONTENT_TYPES = ["Policy", "Post", "Product", "Topic", "Member"] as const;
const SORT_OPTIONS = ["Relevance", "Date", "Title", "Author"];
const ORDER_OPTIONS = ["Descending", "Ascending"];
const RESULT_OPTIONS = ["10", "20", "50", "100"];

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [contentTypes, setContentTypes] = useState<Record<string, boolean>>({
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
      const res = await fetch(`/api/users?search=${encodeURIComponent(appliedQuery)}`);
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
        (p: any) =>
          p.title?.toLowerCase().includes(appliedQuery.toLowerCase()) ||
          p.content?.toLowerCase().includes(appliedQuery.toLowerCase()),
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
        (p: any) =>
          p.name?.toLowerCase().includes(appliedQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(appliedQuery.toLowerCase()),
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

  const handleApply = () => setAppliedQuery(query);
  const toggleType = (type: string) =>
    setContentTypes((prev) => ({ ...prev, [type]: !prev[type] }));

  const hasResults =
    appliedQuery &&
    ((contentTypes.Member && (users?.length ?? 0) > 0) ||
      (contentTypes.Post && (posts?.length ?? 0) > 0) ||
      (contentTypes.Product && (products?.length ?? 0) > 0));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      <div>
        <h1
          className="text-2xl font-bold text-foreground"
          data-testid="heading-search"
        >
          Search
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Search across topics, posts, policies, products, and members
        </p>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 space-y-5">
        <div>
          <p className="text-sm font-semibold text-foreground">Filters</p>
          <p className="text-xs text-muted-foreground">
            Refine your search results
          </p>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-medium text-muted-foreground">Content:</p>
          {CONTENT_TYPES.map((type) => (
            <div key={type} className="flex items-center gap-2.5">
              <Checkbox
                id={`type-${type}`}
                checked={contentTypes[type]}
                onCheckedChange={() => toggleType(type)}
                data-testid={`checkbox-type-${type.toLowerCase()}`}
                className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:border-white"
              />
              <label
                htmlFor={`type-${type}`}
                className="text-sm text-foreground/80 cursor-pointer flex-1 select-none"
              >
                {type}
              </label>
              <span className="text-xs text-muted-foreground tabular-nums">
                ({counts[type as keyof typeof counts]})
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Sorting:</p>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger
              className="bg-white/5 border-white/10 text-foreground text-sm h-9"
              data-testid="select-sort-by"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={order} onValueChange={setOrder}>
            <SelectTrigger
              className="bg-white/5 border-white/10 text-foreground text-sm h-9"
              data-testid="select-sort-order"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Dates:</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                label: "Created after:",
                val: createdAfter,
                set: setCreatedAfter,
                id: "input-created-after",
              },
              {
                label: "Created before:",
                val: createdBefore,
                set: setCreatedBefore,
                id: "input-created-before",
              },
              {
                label: "Updated after:",
                val: updatedAfter,
                set: setUpdatedAfter,
                id: "input-updated-after",
              },
              {
                label: "Updated before:",
                val: updatedBefore,
                set: setUpdatedBefore,
                id: "input-updated-before",
              },
            ].map(({ label, val, set, id }) => (
              <div key={id}>
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <Input
                  type="date"
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  className="bg-white/5 border-white/10 text-foreground text-xs h-8"
                  style={{ colorScheme: "dark" }}
                  data-testid={id}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Results:</p>
          <Select value={resultsPerPage} onValueChange={setResultsPerPage}>
            <SelectTrigger
              className="bg-white/5 border-white/10 text-foreground text-sm h-9"
              data-testid="select-results-per-page"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESULT_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          className="w-full font-semibold bg-white text-black hover:bg-white/90"
          onClick={handleApply}
          data-testid="button-apply-filters"
        >
          Apply filters
        </Button>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="Search policies, posts, products, topics and members..."
            className="bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 px-0 h-8 text-sm"
            data-testid="input-search-query"
          />
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] overflow-hidden min-h-[180px]">
        {!appliedQuery ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/[0.06] flex items-center justify-center">
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Start searching
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Enter a search query and click "Apply filters" to find topics,
                posts, policies, products, and members.
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        ) : !hasResults ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/[0.06] flex items-center justify-center">
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                No results found
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try different search terms or adjust your filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {contentTypes.Member && users && users.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-white/[0.02]">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Members ({users.length})
                  </p>
                </div>
                {users.slice(0, parseInt(resultsPerPage)).map((user) => (
                  <Link key={user.id} href={`/profile/${user.id}`}>
                    <div
                      className="px-4 py-3 flex items-center gap-3 hover:bg-white/[0.03] cursor-pointer transition-colors"
                      data-testid={`result-member-${user.id}`}
                    >
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarImage
                          src={user.profileImageUrl || undefined}
                        />
                        <AvatarFallback className="text-xs bg-white/5">
                          <UserIcon className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate flex items-center gap-1">
                          {user.username}
                          <VerifiedBadge
                            isVerified={(user as any).isVerified}
                            size="sm"
                          />
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.userRank || "Members"}
                        </p>
                      </div>
                      <UserRankBadge
                        rank={user.userRank || "Members"}
                        size="sm"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {contentTypes.Post && posts && posts.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-white/[0.02]">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Posts ({posts.length})
                  </p>
                </div>
                {posts.slice(0, parseInt(resultsPerPage)).map((post: any) => (
                  <Link key={post.id} href={`/blog/${post.id}`}>
                    <div
                      className="px-4 py-3 hover:bg-white/[0.03] cursor-pointer transition-colors"
                      data-testid={`result-post-${post.id}`}
                    >
                      <p className="text-sm font-medium text-foreground truncate">
                        {post.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {post.content?.slice(0, 120)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {contentTypes.Product && products && products.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-white/[0.02]">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Products ({products.length})
                  </p>
                </div>
                {products
                  .slice(0, parseInt(resultsPerPage))
                  .map((product: any) => (
                    <Link
                      key={product.id}
                      href={`/store/product/${product.id}`}
                    >
                      <div
                        className="px-4 py-3 hover:bg-white/[0.03] cursor-pointer transition-colors"
                        data-testid={`result-product-${product.id}`}
                      >
                        <p className="text-sm font-medium text-foreground truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {product.description?.slice(0, 80)}
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
