import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  insertForumThreadSchema,
  type ForumCategory,
} from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { useToast } from "@/hooks/use-toast";

import {
  ArrowLeft,
  BarChart3,
  Check,
  ChevronDown,
  MessageSquarePlus,
  Plus,
  Sparkles,
  X,
} from "lucide-react";

export default function CreateThread() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [includePoll, setIncludePoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollAllowMultiple, setPollAllowMultiple] = useState(false);

  const {
    data: categories,
    isLoading: isLoadingCategories,
  } = useQuery<ForumCategory[]>({
    queryKey: ["/api/forums/categories"],
  });

  const formSchema = insertForumThreadSchema
    .omit({
      authorId: true,
      isPinned: true,
      isLocked: true,
      viewCount: true,
      replyCount: true,
      upvotes: true,
      lastReplyAt: true,
    })
    .extend({
      categoryId: z.string().min(1, "Please select a category"),
      title: z.string().min(3, "Title must be at least 3 characters"),
      content: z.string().min(10, "Content must be at least 10 characters"),
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      if (includePoll) {
        const validOptions = pollOptions.filter((option) => option.trim());

        if (!pollQuestion.trim() || validOptions.length < 2) {
          throw new Error(
            "Poll requires a question and at least 2 options.",
          );
        }
      }

      const res = await apiRequest(
        "POST",
        "/api/forums/threads",
        values,
      );

      const thread = await res.json();

      if (includePoll) {
        try {
          await apiRequest("POST", "/api/forums/polls", {
            threadId: thread.id,
            question: pollQuestion.trim(),
            options: pollOptions.filter((option) => option.trim()),
            allowMultiple: pollAllowMultiple,
          });
        } catch {
          toast({
            title: "Thread created, but poll failed",
            description:
              "Your discussion was posted but the poll could not be added.",
            variant: "destructive",
          });

          setLocation(`/forums/thread/${thread.id}`);
          return thread;
        }
      }

      return thread;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/forums/threads"],
      });

      toast({
        title: "Discussion posted",
        description:
          "Your discussion has been posted successfully!",
      });

      setLocation("/forums");
    },

    onError: (error: any) => {
      toast({
        title: "Unable to post discussion",
        description:
          error.message ||
          "Something went wrong while posting your discussion.",
        variant: "destructive",
      });
    },
  });

  const addPollOption = () => {
    if (pollOptions.length < 10) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length <= 2) return;

    setPollOptions(
      pollOptions.filter((_, optionIndex) => optionIndex !== index),
    );
  };

  const updatePollOption = (index: number, value: string) => {
    const next = [...pollOptions];
    next[index] = value;
    setPollOptions(next);
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-8">
        {/* Back Navigation */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/forums")}
          disabled={mutation.isPending}
          className="gap-2 px-2 text-white/40 hover:bg-white/[0.04] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Forums
        </Button>

        {/* Page Header */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-card">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-transparent" />

          <div className="relative p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <MessageSquarePlus className="h-6 w-6 text-white/70" />
              </div>

              <div>
                <div className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                  <Sparkles className="h-3 w-3" />
                  Community Forums
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Start a New Discussion
                </h1>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-white/40">
                  Share an idea, ask a question, or start a conversation
                  with the RIVET community.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Composer */}
        <Card className="overflow-hidden border-white/5 bg-card">
          <CardContent className="p-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) =>
                  mutation.mutate(data),
                )}
              >
                {/* Discussion Details */}
                <div className="space-y-6 p-5 sm:p-7">
                  <div>
                    <h2 className="text-sm font-semibold text-white/80">
                      Discussion Details
                    </h2>
                    <p className="mt-1 text-xs text-white/30">
                      Give your discussion a clear topic and choose the
                      category that best fits it.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Category */}
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-white/60">
                            Category
                          </FormLabel>

                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isLoadingCategories}
                          >
                            <FormControl>
                              <SelectTrigger
                                className="h-11 border-white/10 bg-white/[0.035] text-white shadow-none transition-colors hover:bg-white/[0.05]"
                                data-testid="select-category"
                              >
                                <SelectValue
                                  placeholder={
                                    isLoadingCategories
                                      ? "Loading categories..."
                                      : "Select a category"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>

                            <SelectContent className="z-[100] border-white/10 bg-card text-white">
                              {categories?.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}

                              {!isLoadingCategories &&
                                (!categories ||
                                  categories.length === 0) && (
                                  <div className="p-3 text-center text-sm text-white/40">
                                    No categories found
                                  </div>
                                )}
                            </SelectContent>
                          </Select>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-white/60">
                            Title
                          </FormLabel>

                          <FormControl>
                            <Input
                              placeholder="What would you like to discuss?"
                              {...field}
                              className="h-12 border-white/10 bg-white/[0.035] text-base text-white shadow-none placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-white/20"
                              data-testid="input-title"
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Content */}
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-white/60">
                            Content
                          </FormLabel>

                          <FormControl>
                            <Textarea
                              placeholder="Write your discussion here..."
                              className="min-h-[240px] resize-y border-white/10 bg-white/[0.035] text-sm leading-6 text-white shadow-none placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-white/20"
                              {...field}
                              data-testid="textarea-content"
                            />
                          </FormControl>

                          <div className="flex items-center justify-between">
                            <FormMessage />

                            <span className="ml-auto text-[11px] text-white/20">
                              Minimum 10 characters
                            </span>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Poll */}
                <div className="border-t border-white/5">
                  <div className="p-5 sm:p-7">
                    <div className="rounded-xl border border-white/10 bg-white/[0.02]">
                      <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <BarChart3 className="h-4 w-4 text-primary" />
                          </div>

                          <div>
                            <Label className="font-medium text-white/75">
                              Add a Poll
                            </Label>

                            <p className="mt-0.5 text-xs text-white/30">
                              Let the community vote on a question.
                            </p>
                          </div>
                        </div>

                        <Switch
                          checked={includePoll}
                          onCheckedChange={setIncludePoll}
                          data-testid="switch-include-poll"
                        />
                      </div>

                      {includePoll && (
                        <div className="space-y-5 border-t border-white/5 p-4 sm:p-5">
                          {/* Poll Question */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-white/50">
                              Poll Question
                            </Label>

                            <Input
                              placeholder="What should the community decide?"
                              value={pollQuestion}
                              onChange={(event) =>
                                setPollQuestion(event.target.value)
                              }
                              className="h-11 border-white/10 bg-white/[0.035] text-white placeholder:text-white/20"
                              data-testid="input-poll-question"
                            />
                          </div>

                          {/* Options */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-medium text-white/50">
                                Options
                              </Label>

                              <span className="text-[10px] text-white/20">
                                {pollOptions.length}/10
                              </span>
                            </div>

                            <div className="space-y-2">
                              {pollOptions.map((option, index) => (
                                <div
                                  key={index}
                                  className="group flex items-center gap-2"
                                >
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/[0.025] text-xs font-medium text-white/25">
                                    {index + 1}
                                  </div>

                                  <Input
                                    placeholder={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(event) =>
                                      updatePollOption(
                                        index,
                                        event.target.value,
                                      )
                                    }
                                    className="h-10 border-white/10 bg-white/[0.035] text-sm text-white placeholder:text-white/20"
                                    data-testid={`input-poll-option-${index}`}
                                  />

                                  {pollOptions.length > 2 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        removePollOption(index)
                                      }
                                      className="h-9 w-9 shrink-0 text-white/20 hover:bg-red-500/10 hover:text-red-400"
                                      data-testid={`button-remove-poll-option-${index}`}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>

                            {pollOptions.length < 10 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={addPollOption}
                                className="mt-1 gap-1.5 px-2 text-xs text-white/35 hover:text-white"
                                data-testid="button-add-poll-option"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Add Option
                              </Button>
                            )}
                          </div>

                          {/* Multiple Votes */}
                          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3.5 py-3">
                            <div>
                              <Label
                                htmlFor="allow-multiple"
                                className="text-sm text-white/60"
                              >
                                Allow multiple votes
                              </Label>

                              <p className="mt-0.5 text-[11px] text-white/25">
                                Members can select more than one option.
                              </p>
                            </div>

                            <Switch
                              id="allow-multiple"
                              checked={pollAllowMultiple}
                              onCheckedChange={setPollAllowMultiple}
                              data-testid="switch-allow-multiple"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 border-t border-white/5 bg-white/[0.01] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setLocation("/forums")}
                    disabled={mutation.isPending}
                    className="gap-2 text-white/35 hover:bg-white/[0.04] hover:text-white"
                    data-testid="button-cancel"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="gap-2 bg-white px-7 text-black hover:bg-white/90"
                    data-testid="button-submit"
                  >
                    {mutation.isPending ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Post Discussion
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Posting Guidelines */}
        <div className="flex items-start gap-3 px-1 text-xs text-white/25">
          <ChevronDown className="mt-0.5 h-3.5 w-3.5 shrink-0" />

          <p className="leading-5">
            Keep discussions constructive and relevant to their selected
            category. Please review the community rules before posting.
          </p>
        </div>
      </div>
    </div>
  );
}