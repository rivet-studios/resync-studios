import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Rocket,
  Bug,
  Sparkles,
  Wrench,
  Plus,
  Trash2,
  Calendar,
  Tag,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ChangelogEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  version: string | null;
  authorId: string | null;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
}

const CATEGORY_CONFIG: Record<string, { icon: typeof Rocket; color: string; label: string }> = {
  "Feature": { icon: Sparkles, color: "text-purple-500 bg-purple-500/10 border-purple-500/30", label: "New Feature" },
  "Improvement": { icon: Rocket, color: "text-blue-500 bg-blue-500/10 border-blue-500/30", label: "Improvement" },
  "Bugfix": { icon: Bug, color: "text-red-500 bg-red-500/10 border-red-500/30", label: "Bug Fix" },
  "Platform": { icon: Wrench, color: "text-green-500 bg-green-500/10 border-green-500/30", label: "Platform Update" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Changelog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    category: "Platform",
    version: "",
  });

  const isAdmin = user?.isAdmin || user?.email?.toLowerCase().endsWith("@resyncstudios.com");

  const { data: entries = [], isLoading, isError } = useQuery<ChangelogEntry[]>({
    queryKey: ["/api/changelog"],
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof newEntry) =>
      apiRequest("POST", "/api/admin/changelog", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/changelog"] });
      setDialogOpen(false);
      setNewEntry({ title: "", content: "", category: "Platform", version: "" });
      toast({ title: "Changelog entry published" });
    },
    onError: () => {
      toast({ title: "Failed to create entry", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/changelog/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/changelog"] });
      toast({ title: "Entry deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete entry", variant: "destructive" });
    },
  });

  const groupedByMonth: Record<string, ChangelogEntry[]> = {};
  entries.forEach((entry) => {
    const month = new Date(entry.publishedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
    if (!groupedByMonth[month]) groupedByMonth[month] = [];
    groupedByMonth[month].push(entry);
  });

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-changelog-title">Changelog</h1>
          <p className="text-muted-foreground mt-1">
            Latest updates and improvements to RIVET Studios
          </p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-changelog">
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>New Changelog Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <Input
                  placeholder="Title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  data-testid="input-changelog-title"
                />
                <div className="flex gap-3">
                  <Select
                    value={newEntry.category}
                    onValueChange={(v) => setNewEntry({ ...newEntry, category: v })}
                  >
                    <SelectTrigger data-testid="select-changelog-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Feature">Feature</SelectItem>
                      <SelectItem value="Improvement">Improvement</SelectItem>
                      <SelectItem value="Bugfix">Bug Fix</SelectItem>
                      <SelectItem value="Platform">Platform Update</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Version (e.g. v2.1.0)"
                    value={newEntry.version}
                    onChange={(e) => setNewEntry({ ...newEntry, version: e.target.value })}
                    className="w-40"
                    data-testid="input-changelog-version"
                  />
                </div>
                <Textarea
                  placeholder="What changed? (supports multiple lines)"
                  rows={6}
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  data-testid="textarea-changelog-content"
                />
                <Button
                  className="w-full"
                  disabled={!newEntry.title || !newEntry.content || createMutation.isPending}
                  onClick={() => createMutation.mutate(newEntry)}
                  data-testid="button-publish-changelog"
                >
                  {createMutation.isPending ? "Publishing..." : "Publish Entry"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isError ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Bug className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-1">Failed to Load</h3>
            <p className="text-muted-foreground">
              Could not fetch changelog entries. Please try again later.
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Rocket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-1">No Updates Yet</h3>
            <p className="text-muted-foreground">
              Check back soon for platform updates and new features.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByMonth).map(([month, monthEntries]) => (
            <div key={month}>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {month}
                </h2>
              </div>
              <div className="space-y-4">
                {monthEntries.map((entry) => {
                  const config = CATEGORY_CONFIG[entry.category] || CATEGORY_CONFIG.Platform;
                  const Icon = config.icon;
                  return (
                    <Card key={entry.id} data-testid={`card-changelog-${entry.id}`}>
                      <CardContent className="py-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <Badge variant="outline" className={config.color}>
                                <Icon className="h-3 w-3 mr-1" />
                                {config.label}
                              </Badge>
                              {entry.version && (
                                <Badge variant="outline" className="text-muted-foreground">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {entry.version}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatDate(entry.publishedAt)}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{entry.title}</h3>
                            <div className="text-sm text-muted-foreground whitespace-pre-line">
                              {entry.content}
                            </div>
                          </div>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-red-500 shrink-0"
                              onClick={() => deleteMutation.mutate(entry.id)}
                              data-testid={`button-delete-changelog-${entry.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
