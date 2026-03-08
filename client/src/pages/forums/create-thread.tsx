import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { useToast } from "@/hooks/use-toast";

export default function CreateThread() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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
      const res = await apiRequest("POST", "/api/forums/threads", values);
      return res.json();
    },
    onSuccess: () => {
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
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-3xl mx-auto p-6">
        <Card className="border border-white/5 shadow-xl bg-[#0a0a0a]">
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
                        <SelectContent className="z-[100] bg-[#121212] border-white/10 text-white">
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
