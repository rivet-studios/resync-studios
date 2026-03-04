import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Shield,
  FileText,
  ShoppingBag,
  MessageSquare,
  Users,
  Calendar,
  X,
  Search,
} from "lucide-react";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);

  const filterOptions = [
    { id: "policies", label: "Policies", icon: Shield },
    { id: "posts", label: "Posts", icon: FileText },
    { id: "products", label: "Products", icon: ShoppingBag },
    { id: "topics", label: "Topics", icon: MessageSquare },
    { id: "members", label: "Members", icon: Users },
    { id: "date", label: "Date Filters", icon: Calendar },
  ];

  const toggleFilter = (filterId: string) => {
    setFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    );
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-[#121212] border-white/5 p-0 overflow-hidden shadow-2xl">
        <div className="p-6 space-y-6">
          {/* Search Input Area */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-white/60 transition-colors" />
            <Input
              placeholder="Search policies, posts, products, topics and members..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/[0.03] border-white/5 h-14 pl-12 pr-12 text-lg text-white placeholder:text-white/20 focus:bg-white/[0.05] focus:border-white/10 transition-all rounded-xl"
              autoFocus
            />
            <button 
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/5 rounded-md text-white/30 hover:text-white/60 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filters Area */}
          <div className="flex flex-wrap items-center gap-3 px-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/30 mr-2">
              Filter by:
            </span>
            {filterOptions.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant="ghost"
                onClick={() => toggleFilter(id)}
                className={`h-9 px-4 gap-2 rounded-lg text-sm font-medium transition-all ${
                  filters.includes(id) 
                    ? "bg-white/10 text-white shadow-lg" 
                    : "bg-white/[0.02] text-white/40 hover:bg-white/5 hover:text-white/60"
                }`}
              >
                <Icon className="w-4 h-4 opacity-70" />
                {label}
                {id === "date" && <span className="opacity-40">⌄</span>}
              </Button>
            ))}
          </div>

          {/* Results/Placeholder Area */}
          <div className="min-h-[240px] flex flex-col items-center justify-center text-center space-y-4 py-8">
            {!query ? (
              <>
                <p className="text-white/40 text-sm font-medium">Start typing to search...</p>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] rounded-md border border-white/5">
                  <span className="text-[10px] font-bold text-white/30">⌘ K</span>
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">to focus</span>
                </div>
              </>
            ) : (
              <p className="text-white/30 text-sm">No results found for "{query}"</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
