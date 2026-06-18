import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { insertForumThreadSchema, type ForumCategory } from "@shared/schema";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Plus, X } from "lucide-react";

export default function CreateThread() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [includePoll, setIncludePoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollAllowMultiple, setPollAllowMultiple] = useState(false);

  const { data: categories, isLoading: isLoadingCategories } = useQuery<ForumCategory[]>({
    queryKey: ["/api/forums/categories"],
  });

  const formSchema = insertForumThreadSchema
    .omit({ authorId: true, isPinned: true, isLocked: true, viewCount: true, replyCount: true, upvotes: true, lastReplyAt: true })
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
        const validOptions = pollOptions.filter(o => o.trim());
        if (!pollQuestion.trim() || validOptions.length < 2) {
          throw new Error("Poll requires a question and at least 2 options.");
        }
      }

      const res = await apiRequest("POST", "/api/forums/threads", values);
      const thread = await res.json();

      if (includePoll) {
        try {
          await apiRequest("POST", "/api/forums/polls", {
            threadId: thread.id,
            question: pollQuestion.trim(),
            options: pollOptions.filter(o => o.trim()),
            allowMultiple: pollAllowMultiple,
          });
        } catch {
          toast({
            title: "Thread created, but poll failed",
            description: "Your discussion was posted but the poll could not be added.",
            variant: "destructive",
          });
          setLocation(`/forums/thread/${thread.id}`);
          return thread;
        }
      }

      return thread;
    },
    onSuccess: (_data, _vars, context) => {
      queryClient.invalidateQueries({ queryKey: ["/api/forums/threads"] });
      toast({
        title: "Success",
        description: "Your discussion has been posted successfully!",
      });
      setLocation("/forums");
    },
    onError: (error: any) => {
      toast({
        title: "Error Posting Discussion",
        variant: "destructive",
        description: `Failed to post: ${error.message || "Unknown error"}. Please try again later.`,
      });
    },
  });

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <div className="max-w-3xl mx-auto p-6">
        <Card className="border border-white/5 shadow-xl bg-card">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white">Start a New Discussion</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={isLoadingCategories}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 border-white/10 bg-white/5 text-white" data-testid="select-category">
                            <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select a category"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[100] bg-card border-white/10 text-white">
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                          {!isLoadingCategories && (!categories || categories.length === 0) && (
                            <div className="p-2 text-sm text-white/40 text-center">
                              No categories found
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="What's on your mind?" 
                          {...field} 
                          className="h-12 border-white/10 bg-white/5 text-white text-lg placeholder:text-white/30"
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Share your thoughts..." 
                          className="min-h-[200px] border-white/10 bg-white/5 text-white resize-none text-base placeholder:text-white/30"
                          {...field} 
                          data-testid="textarea-content"
                          />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4 border border-white/10 rounded-lg p-4 bg-white/[0.02]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      <Label className="text-white/70 font-medium">Add a Poll</Label>
                    </div>
                    <Switch
                      checked={includePoll}
                      onCheckedChange={setIncludePoll}
                      data-testid="switch-include-poll"
                    />
                  </div>

                  {includePoll && (
                    <div className="space-y-3 pt-2">
                      <Input
                        placeholder="Poll question"
                        value={pollQuestion}
                        onChange={(e) => setPollQuestion(e.target.value)}
                        className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
                        data-testid="input-poll-question"
                      />
                      <div className="space-y-2">
                        {pollOptions.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input
                              placeholder={`Option ${idx + 1}`}
                              value={opt}
                              onChange={(e) => {
                                const next = [...pollOptions];
                                next[idx] = e.target.value;
                                setPollOptions(next);
                              }}
                              className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
                              data-testid={`input-poll-option-${idx}`}
                            />
                            {pollOptions.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                                className="text-white/40 shrink-0"
                                data-testid={`button-remove-poll-option-${idx}`}
                              >
                                <X className="w-4 h-4" />
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
                          onClick={() => setPollOptions([...pollOptions, ""])}
                          className="text-white/50 gap-1.5"
                          data-testid="button-add-poll-option"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Option
                        </Button>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        <Switch
                          id="allow-multiple"
                          checked={pollAllowMultiple}
                          onCheckedChange={setPollAllowMultiple}
                          data-testid="switch-allow-multiple"
                        />
                        <Label htmlFor="allow-multiple" className="text-white/50 text-sm">Allow multiple votes</Label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setLocation("/forums")}
                    disabled={mutation.isPending}
                    className="text-white/50 hover:text-white"
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-white text-black hover:bg-white/90 px-8"
                    disabled={mutation.isPending}
                    data-testid="button-submit"
                  >
                    {mutation.isPending ? "Posting..." : "Post Discussion"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
