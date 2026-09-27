import { useState } from "react";
import * as reactQuery from "@tanstack/react-query";
import * as queryClient from "@/lib/queryClient";
import {
  MessageSquare,
  MessagesSquare,
  Hash,
  ChevronRight,
  Loader2,
  Users,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Thread {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  author: {
    username?: string | null;
    profileImageUrl?: string | null;
  } | null;
}

interface Category {
  id: string;
  name: string;
}

// Fetch categories
const useCategories = () => {
  return reactQuery.useQuery<Category[]>({
    queryKey: ["/api/forums/categories"],
    queryFn: async () => {
      const res = await queryClient.apiRequest(
        "GET",
        "/api/forums/categories",
      );
      return res.json();
    },
  });
};

// Fetch threads
const useThreads = (selectedCategory?: string) => {
  return reactQuery.useQuery<Thread[]>({
    queryKey: ["/api/forums/threads", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory
        ? `/api/forums/threads?category=${selectedCategory}`
        : "/api/forums/threads";

      const res = await queryClient.apiRequest("GET", url);
      return res.json();
    },
  });
};

export default function Forums() {
  const [selectedCategory, setSelectedCategory] = useState<string | "">("");

  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useCategories();

  const {
    data: threads = [],
    isLoading: threadsLoading,
  } = useThreads(selectedCategory);

  const filteredThreads = selectedCategory
    ? threads.filter((thread) => thread.categoryId === selectedCategory)
    : threads;

  const getCategoryName = (categoryId: string) => {
    return (
      categories.find((category) => category.id === categoryId)?.name ||
      "General"
    );
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                <MessagesSquare className="h-3.5 w-3.5" />
                RIVET Community
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Community Forums
              </h1>

              <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
                Join the discussion, share ideas, ask questions, and connect
                with other members of the RIVET community.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-xl border bg-background/70 px-4 py-3 backdrop-blur">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  {threads.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {threads.length === 1 ? "Discussion" : "Discussions"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Browse discussions</h2>
            <p className="text-xs text-muted-foreground">
              Explore conversations by category.
            </p>
          </div>

          {selectedCategory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory("")}
              className="text-xs"
            >
              View all
            </Button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button
            variant={selectedCategory === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("")}
            className="shrink-0 gap-2"
          >
            <MessagesSquare className="h-4 w-4" />
            All Discussions
          </Button>

          {categoriesLoading ? (
            <div className="flex items-center px-3 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading categories...
            </div>
          ) : (
            categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="shrink-0 gap-2"
              >
                <Hash className="h-4 w-4" />
                {category.name}
              </Button>
            ))
          )}
        </div>
      </div>

      {/* Thread List */}
      <div className="space-y-3">
        {threadsLoading ? (
          <>
            {[1, 2, 3].map((item) => (
              <Card key={item} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="animate-pulse p-5">
                    <div className="h-4 w-2/5 rounded bg-muted" />
                    <div className="mt-3 h-3 w-4/5 rounded bg-muted" />
                    <div className="mt-2 h-3 w-3/5 rounded bg-muted" />

                    <div className="mt-5 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted" />
                      <div className="h-3 w-24 rounded bg-muted" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : filteredThreads.length > 0 ? (
          filteredThreads.map((thread) => {
            const username = thread.author?.username || "Unknown User";
            const initial = username[0]?.toUpperCase() || "U";

            return (
              <Card
                key={thread.id}
                className="group overflow-hidden transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
              >
                <CardContent className="p-0">
                  <div className="flex items-start gap-4 p-5">
                    {/* Thread Icon */}
                    <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:flex">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Thread Header */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="gap-1 text-[11px]"
                        >
                          <Hash className="h-3 w-3" />
                          {getCategoryName(thread.categoryId)}
                        </Badge>
                      </div>

                      <h3 className="mt-2 text-base font-semibold tracking-tight transition-colors group-hover:text-primary sm:text-lg">
                        {thread.title}
                      </h3>

                      <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-muted-foreground">
                        {thread.content}
                      </p>

                      {/* Author */}
                      <div className="mt-4 flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 border">
                          <AvatarImage
                            src={
                              thread.author?.profileImageUrl || undefined
                            }
                            alt={username}
                          />
                          <AvatarFallback className="text-[11px] font-semibold">
                            {initial}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium">
                            {username}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Community member
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden shrink-0 items-center self-center sm:flex">
                      <ChevronRight className="h-5 w-5 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <MessagesSquare className="h-7 w-7 text-muted-foreground" />
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                No discussions yet
              </h3>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                There aren't any discussions in this category yet. Start a
                conversation and be the first to contribute.
              </p>

              {selectedCategory && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCategory("")}
                  className="mt-5"
                >
                  Browse all discussions
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer Hint */}
      {!threadsLoading && filteredThreads.length > 0 && (
        <div className="flex items-center justify-center pt-2">
          <p className="text-xs text-muted-foreground">
            Showing {filteredThreads.length}{" "}
            {filteredThreads.length === 1 ? "discussion" : "discussions"}
            {selectedCategory
              ? ` in ${getCategoryName(selectedCategory)}`
              : ""}
          </p>
        </div>
      )}
    </div>
  );
}