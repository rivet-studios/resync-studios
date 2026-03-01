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

  const form = useForm({
    resolver: zodResolver(insertForumThreadSchema.extend({
      categoryId: z.string().min(1, "Please select a category"),
    })),
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
    <div className="max-w-3xl mx-auto p-6">
      <Card className="border-none shadow-xl bg-white/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-slate-900">Start a New Discussion</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={isLoadingCategories}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 border-slate-200 bg-white">
                          <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select a category"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[100] bg-white">
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                        {!isLoadingCategories && (!categories || categories.length === 0) && (
                          <div className="p-2 text-sm text-slate-500 text-center">
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
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="What's on your mind?" 
                        {...field} 
                        className="h-12 border-slate-200 text-lg"
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
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Share your thoughts..." 
                        className="min-h-[200px] border-slate-200 resize-none text-base"
                        {...field} 
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
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-slate-900 text-white hover:bg-slate-800 px-8 h-12"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Posting..." : "Post Discussion"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
