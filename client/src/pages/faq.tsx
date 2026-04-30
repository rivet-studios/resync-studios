import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MarkdownContent } from "@/components/markdown-content";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Search, Plus, Pencil, Trash2, HelpCircle } from "lucide-react";
import type { FaqEntry } from "@shared/schema";

const ADMIN_RANKS = [
  "Developer", "Staff Internal Affairs", "Team Member",
  "Staff Department Director", "Operations Manager", "Company Director",
];

function hasRank(user: any, ranks: string[]): boolean {
  if (!user) return false;
  if (ranks.includes(user.userRank || "")) return true;
  if ((user.additionalRanks || []).some((r: string) => ranks.includes(r))) return true;
  return false;
}

function isAdmin(user: any): boolean {
  return !!user && (user.isAdmin || hasRank(user, ADMIN_RANKS) || user.email?.toLowerCase().endsWith("@resyncstudios.com"));
}

export default function FAQ() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FaqEntry | null>(null);
  const [formData, setFormData] = useState({ question: "", answer: "", category: "General", sortOrder: 0 });

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
    onError: () => toast({ title: "Failed to create FAQ entry", variant: "destructive" }),
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
    onError: () => toast({ title: "Failed to update FAQ entry", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/faq/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faq"] });
      toast({ title: "FAQ entry deleted" });
    },
    onError: () => toast({ title: "Failed to delete FAQ entry", variant: "destructive" }),
  });

  const resetForm = () => setFormData({ question: "", answer: "", category: "General", sortOrder: 0 });

  const startEdit = (entry: FaqEntry) => {
    setEditingEntry(entry);
    setFormData({ question: entry.question, answer: entry.answer, category: entry.category, sortOrder: entry.sortOrder || 0 });
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

  const categories = [...new Set(entries.map((e) => e.category))];

  const filtered = entries.filter((e) => {
    const matchesSearch = !search || e.question.toLowerCase().includes(search.toLowerCase()) || e.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const grouped = filtered.reduce<Record<string, FaqEntry[]>>((acc, entry) => {
    if (!acc[entry.category]) acc[entry.category] = [];
    acc[entry.category].push(entry);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-faq-title">
            <HelpCircle className="w-6 h-6" />
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground mt-1">Find answers to common questions about RIVET Studios</p>
        </div>
        {isAdmin(user) && (
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingEntry(null); resetForm(); } }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-faq">
                <Plus className="w-4 h-4 mr-2" />
                Add FAQ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingEntry ? "Edit FAQ Entry" : "Add FAQ Entry"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Question</Label>
                  <Input value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} placeholder="Enter question" data-testid="input-faq-question" />
                </div>
                <div>
                  <Label>Answer</Label>
                  <Textarea value={formData.answer} onChange={(e) => setFormData({ ...formData, answer: e.target.value })} placeholder="Enter answer" rows={4} data-testid="input-faq-answer" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. General, Account, Store" data-testid="input-faq-category" />
                </div>
                <div>
                  <Label>Sort Order</Label>
                  <Input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} data-testid="input-faq-sort" />
                </div>
                <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} className="w-full" data-testid="button-faq-submit">
                  {editingEntry ? "Update" : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-10" placeholder="Search FAQ..." value={search} onChange={(e) => setSearch(e.target.value)} data-testid="input-faq-search" />
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Badge variant={selectedCategory === null ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedCategory(null)} data-testid="button-faq-category-all">
            All
          </Badge>
          {categories.map((cat) => (
            <Badge key={cat} variant={selectedCategory === cat ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedCategory(cat)} data-testid={`button-faq-category-${cat.toLowerCase()}`}>
              {cat}
            </Badge>
          ))}
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {search ? "No FAQ entries match your search." : "No FAQ entries yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
              <CardDescription>{items.length} question{items.length !== 1 ? "s" : ""}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple">
                {items.map((entry) => (
                  <AccordionItem key={entry.id} value={entry.id}>
                    <AccordionTrigger className="text-left" data-testid={`faq-question-${entry.id}`}>
                      <div className="flex items-center gap-2 flex-1 pr-4">
                        <span>{entry.question}</span>
                        {isAdmin(user) && (
                          <div className="flex items-center gap-1 ml-auto shrink-0" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(entry)} data-testid={`button-edit-faq-${entry.id}`}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(entry.id)} data-testid={`button-delete-faq-${entry.id}`}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent data-testid={`faq-answer-${entry.id}`}>
                      <MarkdownContent content={entry.answer} className="pt-1" />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
