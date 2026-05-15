import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MarkdownContent } from "@/components/markdown-content";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import type { FaqEntry } from "@shared/schema";

const ADMIN_RANKS = [
  "Developer",
  "Staff Internal Affairs",
  "Team Member",
  "Staff Department Director",
  "Operations Manager",
  "Company Director",
];

function hasRank(user: any, ranks: string[]): boolean {
  if (!user) return false;
  if (ranks.includes(user.userRank || "")) return true;
  if ((user.additionalRanks || []).some((r: string) => ranks.includes(r)))
    return true;
  return false;
}

function isAdmin(user: any): boolean {
  return (
    !!user &&
    (user.isAdmin ||
      hasRank(user, ADMIN_RANKS) ||
      user.email?.toLowerCase().endsWith("@resyncstudios.com"))
  );
}

export default function FAQ() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FaqEntry | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "General",
    sortOrder: 0,
  });

  const { data: entries = [], isLoading } = useQuery<FaqEntry[]>({
    queryKey: ["/api/faq"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/faq", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faq"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "FAQ entry created" });
    },
    onError: () =>
      toast({ title: "Failed to create FAQ entry", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await apiRequest("PUT", `/api/admin/faq/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faq"] });
      setDialogOpen(false);
      setEditingEntry(null);
      resetForm();
      toast({ title: "FAQ entry updated" });
    },
    onError: () =>
      toast({ title: "Failed to update FAQ entry", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/faq/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faq"] });
      toast({ title: "FAQ entry deleted" });
    },
    onError: () =>
      toast({ title: "Failed to delete FAQ entry", variant: "destructive" }),
  });

  const resetForm = () =>
    setFormData({ question: "", answer: "", category: "General", sortOrder: 0 });

  const startEdit = (entry: FaqEntry) => {
    setEditingEntry(entry);
    setFormData({
      question: entry.question,
      answer: entry.answer,
      category: entry.category,
      sortOrder: entry.sortOrder || 0,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.question.trim() || !formData.answer.trim()) return;
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const categories = [
    "all",
    ...new Set(entries.map((e) => e.category)),
  ];

  const filtered = entries.filter((e) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      e.question.toLowerCase().includes(q) ||
      e.answer.toLowerCase().includes(q);
    const matchesCategory =
      selectedCategory === "all" || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const grouped = filtered.reduce<Record<string, FaqEntry[]>>((acc, entry) => {
    if (!acc[entry.category]) acc[entry.category] = [];
    acc[entry.category].push(entry);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-foreground"
            data-testid="text-faq-title"
          >
            Knowledge base
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Browse our articles and documentation
          </p>
        </div>
        {isAdmin(user) && (
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingEntry(null);
                resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="shrink-0"
                data-testid="button-add-faq"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add article
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? "Edit Article" : "Add Article"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Question</Label>
                  <Input
                    value={formData.question}
                    onChange={(e) =>
                      setFormData({ ...formData, question: e.target.value })
                    }
                    placeholder="Enter question"
                    data-testid="input-faq-question"
                  />
                </div>
                <div>
                  <Label>Answer</Label>
                  <Textarea
                    value={formData.answer}
                    onChange={(e) =>
                      setFormData({ ...formData, answer: e.target.value })
                    }
                    placeholder="Enter answer (supports Markdown)"
                    rows={5}
                    data-testid="input-faq-answer"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="e.g. General, Account, Store"
                    data-testid="input-faq-category"
                  />
                </div>
                <div>
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    data-testid="input-faq-sort"
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="w-full"
                  data-testid="button-faq-submit"
                >
                  {editingEntry ? "Update" : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 bg-white/5 border-white/10 text-foreground h-9 text-sm"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-faq-search"
            />
          </div>
          <Button
            className="bg-white text-black hover:bg-white/90 h-9 px-4 font-semibold shrink-0"
            onClick={() => {}}
            data-testid="button-faq-search-submit"
          >
            Search
          </Button>
        </div>

        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger
              className="bg-white/5 border-white/10 text-foreground h-8 text-xs flex-1"
              data-testid="select-faq-category"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all" ? "All categories" : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger
              className="bg-white/5 border-white/10 text-foreground h-8 text-xs flex-1"
              data-testid="select-faq-type"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="article">Article</SelectItem>
              <SelectItem value="guide">Guide</SelectItem>
              <SelectItem value="faq">FAQ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] py-16 flex flex-col items-center gap-3 text-center px-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/[0.06] flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              No articles found
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your filters or check back later.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, items]) => (
            <div
              key={category}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  {category}
                </p>
                <span className="text-xs text-muted-foreground">
                  {items.length} article{items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="px-4">
                <Accordion type="multiple">
                  {items.map((entry) => (
                    <AccordionItem
                      key={entry.id}
                      value={entry.id}
                      className="border-white/[0.04]"
                    >
                      <AccordionTrigger
                        className="text-left text-sm hover:no-underline py-3"
                        data-testid={`faq-question-${entry.id}`}
                      >
                        <div className="flex items-center gap-2 flex-1 pr-4">
                          <span className="text-foreground/90">
                            {entry.question}
                          </span>
                          {isAdmin(user) && (
                            <div
                              className="flex items-center gap-1 ml-auto shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() => startEdit(entry)}
                                data-testid={`button-edit-faq-${entry.id}`}
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive/60 hover:text-destructive"
                                onClick={() => deleteMutation.mutate(entry.id)}
                                data-testid={`button-delete-faq-${entry.id}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent
                        className="pb-4"
                        data-testid={`faq-answer-${entry.id}`}
                      >
                        <MarkdownContent
                          content={entry.answer}
                          className="text-sm text-muted-foreground"
                        />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
