import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ShoppingBag,
  MessageSquare,
  Users,
  X,
  Search,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "wouter";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  image?: string;
}

interface SearchResults {
  members: SearchResult[];
  topics: SearchResult[];
  products: SearchResult[];
  posts: SearchResult[];
}

const CATEGORIES = [
  { id: "members", label: "Members", icon: Users },
  { id: "topics", label: "Topics", icon: MessageSquare },
  { id: "products", label: "Products", icon: ShoppingBag },
  { id: "posts", label: "Posts", icon: FileText },
] as const;

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [, navigate] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebouncedQuery("");
    }
  }, [open]);

  const { data: results, isLoading } = useQuery<SearchResults>({
    queryKey: [`/api/search?q=${encodeURIComponent(debouncedQuery)}`],
    enabled: debouncedQuery.length >= 2,
  });

  const toggleFilter = (filterId: string) => {
    setFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    );
  };

  const handleNavigate = useCallback((url: string) => {
    navigate(url);
    onOpenChange(false);
  }, [navigate, onOpenChange]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange]);

  const visibleCategories = filters.length > 0
    ? CATEGORIES.filter((c) => filters.includes(c.id))
    : CATEGORIES;

  const hasResults = results && visibleCategories.some(
    (c) => (results[c.id as keyof SearchResults] || []).length > 0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-[#121212] border-white/5 p-0 overflow-hidden shadow-2xl [&>button]:hidden">
        <div className="p-6 space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-white/60 transition-colors" />
            <Input
              placeholder="Search members, topics, products, posts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/[0.03] border-white/5 h-14 pl-12 pr-12 text-lg text-white placeholder:text-white/20 focus:bg-white/[0.05] focus:border-white/10 transition-all rounded-xl"
              autoFocus
              data-testid="input-search"
            />
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/5 rounded-md text-white/30 hover:text-white/60 transition-all"
              data-testid="button-close-search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 px-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/30 mr-2">
              Filter:
            </span>
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant="ghost"
                onClick={() => toggleFilter(id)}
                className={`h-9 px-4 gap-2 rounded-lg text-sm font-medium transition-all ${
                  filters.includes(id)
                    ? "bg-white/10 text-white shadow-lg"
                    : "bg-white/[0.02] text-white/40 hover:bg-white/5 hover:text-white/60"
                }`}
                data-testid={`button-filter-${id}`}
              >
                <Icon className="w-4 h-4 opacity-70" />
                {label}
              </Button>
            ))}
          </div>

          <div className="min-h-[200px] max-h-[400px] overflow-y-auto">
            {!debouncedQuery || debouncedQuery.length < 2 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 space-y-4">
                <p className="text-white/40 text-sm font-medium">Start typing to search...</p>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] rounded-md border border-white/5">
                  <span className="text-[10px] font-bold text-white/30">⌘ K</span>
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">to focus</span>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-white/30" />
              </div>
            ) : !hasResults ? (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <p className="text-white/30 text-sm">No results found for "{debouncedQuery}"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleCategories.map(({ id, label, icon: Icon }) => {
                  const items = results?.[id as keyof SearchResults] || [];
                  if (items.length === 0) return null;
                  return (
                    <div key={id}>
                      <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                        <Icon className="w-4 h-4 text-white/30" />
                        <span className="text-xs font-bold uppercase tracking-widest text-white/30">
                          {label}
                        </span>
                        <span className="text-xs text-white/20">({items.length})</span>
                      </div>
                      <div className="space-y-0.5">
                        {items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleNavigate(item.url)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left group"
                            data-testid={`search-result-${id}-${item.id}`}
                          >
                            {id === "members" && item.image ? (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={item.image} />
                                <AvatarFallback>{item.title?.[0]?.toUpperCase()}</AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center flex-shrink-0">
                                <Icon className="w-4 h-4 text-white/30" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{item.title}</p>
                              <p className="text-xs text-white/40 truncate">{item.description}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-white/30 transition-colors flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
