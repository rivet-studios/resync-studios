import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Bold, Italic, Quote, Code } from "lucide-react";

interface ForumPostFormProps {
  onSubmit: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ForumPostForm({ onSubmit, isLoading = false, placeholder = "Write your message..." }: ForumPostFormProps) {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const textareaRef: any = React.useRef(null);

  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || "text";
    const newContent = content.substring(0, start) + before + selectedText + after + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + selectedText.length;
    }, 0);
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please write a message before posting.",
        variant: "destructive",
      });
      return;
    }
    onSubmit(content);
    setContent("");
  };

  return (
    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-muted-foreground">Formatting</span>
        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => insertMarkdown("**", "**")}
            className="p-1.5 hover:bg-muted rounded text-xs"
            title="Bold"
            type="button"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertMarkdown("_", "_")}
            className="p-1.5 hover:bg-muted rounded text-xs"
            title="Italic"
            type="button"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertMarkdown("> ", "")}
            className="p-1.5 hover:bg-muted rounded text-xs"
            title="Quote"
            type="button"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertMarkdown("`", "`")}
            className="p-1.5 hover:bg-muted rounded text-xs"
            title="Code"
            type="button"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Textarea
        ref={textareaRef}
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-24 resize-none"
      />

      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={() => setContent("")}
          disabled={!content || isLoading}
          type="button"
        >
          Clear
        </Button>
        <Button onClick={handleSubmit} disabled={!content || isLoading}>
          {isLoading ? "Posting..." : "Post"}
        </Button>
      </div>
    </div>
  );
}

import React from 'react';
