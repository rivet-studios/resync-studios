import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
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
  Loader2,
  FileText,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useState } from "react";

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

const CATEGORY_CONFIG: Record<
  string,
  {
    icon: typeof Rocket;
    color: string;
    label: string;
  }
> = {
  Feature: {
    icon: Sparkles,
    color:
      "text-purple-500 bg-purple-500/10 border-purple-500/30",
    label: "New Feature",
  },
  Improvement: {
    icon: Rocket,
    color:
      "text-blue-500 bg-blue-500/10 border-blue-500/30",
    label: "Improvement",
  },
  Bugfix: {
    icon: Bug,
    color:
      "text-red-500 bg-red-500/10 border-red-500/30",
    label: "Bug Fix",
  },
  Platform: {
    icon: Wrench,
    color:
      "text-green-500 bg-green-500/10 border-green-500/30",
    label: "Platform Update",
  },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatMonth(dateStr: string) {
  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
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

  const isAdmin =
    user?.isAdmin ||
    user?.email
      ?.toLowerCase()
      .endsWith("@resyncstudios.com");

  const {
    data: entries = [],
    isLoading,
    isError,
  } = useQuery<ChangelogEntry[]>({
    queryKey: ["/api/changelog"],
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof newEntry) =>
      apiRequest("POST", "/api/admin/changelog", data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/changelog"],
      });

      setDialogOpen(false);

      setNewEntry({
        title: "",
        content: "",
        category: "Platform",
        version: "",
      });

      toast({
        title: "Changelog entry published",
        description: "The update is now visible on the changelog.",
      });
    },

    onError: () => {
      toast({
        title: "Failed to create entry",
        description: "The changelog entry could not be published.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/admin/changelog/${id}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/changelog"],
      });

      toast({
        title: "Entry deleted",
        description: "The changelog entry has been removed.",
      });
    },

    onError: () => {
      toast({
        title: "Failed to delete entry",
        description: "The changelog entry could not be deleted.",
        variant: "destructive",
      });
    },
  });

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, ChangelogEntry[]> = {};

    [...entries]
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime(),
      )
      .forEach((entry) => {
        const month = formatMonth(entry.publishedAt);

        if (!groups[month]) {
          groups[month] = [];
        }

        groups[month].push(entry);
      });

    return groups;
  }, [entries]);

  const resetDialog = () => {
    setNewEntry({
      title: "",
      content: "",
      category: "Platform",
      version: "",
    });
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted/30">
              <Rocket className="h-4 w-4" />
            </div>

            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              RIVET Studios
            </span>
          </div>

          <h1
            className="text-3xl font-bold tracking-tight"
            data-testid="text-changelog-title"
          >
            Changelog
          </h1>

          <p className="mt-2 max-w-xl text-muted-foreground">
            A record of the latest updates, improvements, fixes,
            and platform changes across RIVET Studios.
          </p>
        </div>

        {isAdmin && (
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);

              if (!open) {
                resetDialog();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                className="shrink-0"
                data-testid="button-add-changelog"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Entry
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>New Changelog Entry</DialogTitle>

                <DialogDescription>
                  Publish an update to the RIVET Studios changelog.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Title
                  </label>

                  <Input
                    placeholder="e.g. Redesigned Projects Page"
                    value={newEntry.title}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        title: e.target.value,
                      })
                    }
                    data-testid="input-changelog-title"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px]">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Category
                    </label>

                    <Select
                      value={newEntry.category}
                      onValueChange={(value) =>
                        setNewEntry({
                          ...newEntry,
                          category: value,
                        })
                      }
                    >
                      <SelectTrigger data-testid="select-changelog-category">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="Feature">
                          Feature
                        </SelectItem>

                        <SelectItem value="Improvement">
                          Improvement
                        </SelectItem>

                        <SelectItem value="Bugfix">
                          Bug Fix
                        </SelectItem>

                        <SelectItem value="Platform">
                          Platform Update
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Version
                    </label>

                    <Input
                      placeholder="v2.1.0"
                      value={newEntry.version}
                      onChange={(e) =>
                        setNewEntry({
                          ...newEntry,
                          version: e.target.value,
                        })
                      }
                      data-testid="input-changelog-version"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Changes
                  </label>

                  <Textarea
                    placeholder="Describe what changed..."
                    rows={7}
                    value={newEntry.content}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        content: e.target.value,
                      })
                    }
                    data-testid="textarea-changelog-content"
                  />
                </div>

                <Button
                  className="w-full"
                  disabled={
                    !newEntry.title.trim() ||
                    !newEntry.content.trim() ||
                    createMutation.isPending
                  }
                  onClick={() =>
                    createMutation.mutate(newEntry)
                  }
                  data-testid="button-publish-changelog"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Publish Entry
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Error */}
      {isError ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border bg-muted/30">
              <Bug className="h-5 w-5 text-muted-foreground" />
            </div>

            <h3 className="text-lg font-semibold">
              Failed to Load
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Could not fetch changelog entries. Please try
              again later.
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        /* Loading */
        <div className="space-y-10">
          {[1, 2, 3].map((group) => (
            <div key={group} className="space-y-4">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />

              <Card>
                <CardContent className="space-y-4 p-6">
                  <div className="flex gap-3">
                    <div className="h-6 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-6 w-16 animate-pulse rounded bg-muted" />
                  </div>

                  <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />

                  <div className="space-y-2">
                    <div className="h-3 w-full animate-pulse rounded bg-muted" />
                    <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        /* Empty */
        <Card>
          <CardContent className="py-20 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border bg-muted/30">
              <Rocket className="h-6 w-6 text-muted-foreground" />
            </div>

            <h3 className="text-lg font-semibold">
              No Updates Yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Check back soon for platform updates, new
              features, and improvements.
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Changelog */
        <div className="space-y-10">
          {Object.entries(groupedByMonth).map(
            ([month, monthEntries]) => (
              <section key={month}>
                {/* Month heading */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-muted/30">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold">
                      {month}
                    </h2>

                    <p className="text-xs text-muted-foreground">
                      {monthEntries.length}{" "}
                      {monthEntries.length === 1
                        ? "update"
                        : "updates"}
                    </p>
                  </div>
                </div>

                {/* Entries */}
                <div className="relative space-y-4">
                  <div className="absolute bottom-6 left-[15px] top-6 hidden w-px bg-border sm:block" />

                  {monthEntries.map((entry) => {
                    const config =
                      CATEGORY_CONFIG[entry.category] ||
                      CATEGORY_CONFIG.Platform;

                    const Icon = config.icon;

                    return (
                      <Card
                        key={entry.id}
                        className="relative overflow-hidden transition-colors hover:border-foreground/20"
                        data-testid={`card-changelog-${entry.id}`}
                      >
                        <CardContent className="p-5 sm:p-6">
                          <div className="flex gap-4">
                            {/* Timeline marker */}
                            <div className="relative z-10 hidden shrink-0 sm:block">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background">
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                            </div>

                            <div className="min-w-0 flex-1">
                              {/* Metadata */}
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={config.color}
                                >
                                  <Icon className="mr-1.5 h-3 w-3" />
                                  {config.label}
                                </Badge>

                                {entry.version && (
                                  <Badge
                                    variant="outline"
                                    className="text-muted-foreground"
                                  >
                                    <Tag className="mr-1.5 h-3 w-3" />
                                    {entry.version}
                                  </Badge>
                                )}

                                <span className="text-xs text-muted-foreground">
                                  {formatDate(
                                    entry.publishedAt,
                                  )}
                                </span>

                                {isAdmin && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="ml-auto h-8 w-8 text-muted-foreground hover:text-red-500"
                                    disabled={
                                      deleteMutation.isPending
                                    }
                                    onClick={() =>
                                      deleteMutation.mutate(
                                        entry.id,
                                      )
                                    }
                                    data-testid={`button-delete-changelog-${entry.id}`}
                                  >
                                    {deleteMutation.isPending &&
                                    deleteMutation.variables ===
                                      entry.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}

                                    <span className="sr-only">
                                      Delete entry
                                    </span>
                                  </Button>
                                )}
                              </div>

                              {/* Title */}
                              <h3 className="mt-3 text-lg font-semibold tracking-tight">
                                {entry.title}
                              </h3>

                              {/* Content */}
                              <div className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                                {entry.content}
                              </div>

                              {/* Footer */}
                              <div className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <FileText className="h-3.5 w-3.5" />
                                RIVET Studios Changelog

                                <ChevronRight className="h-3 w-3" />

                                <span>
                                  {formatDate(
                                    entry.publishedAt,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ),
          )}
        </div>
      )}
    </div>
  );
}