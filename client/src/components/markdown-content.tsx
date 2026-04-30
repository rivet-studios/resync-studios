import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

interface MarkdownContentProps {
  content: string;
  className?: string;
  prose?: boolean;
}

export function MarkdownContent({ content, className = "", prose = true }: MarkdownContentProps) {
  const proseClasses = prose
    ? `prose prose-sm dark:prose-invert max-w-none
       prose-headings:text-foreground prose-headings:font-semibold prose-headings:tracking-tight
       prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
       prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
       prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:my-2
       prose-li:text-muted-foreground prose-li:leading-relaxed
       prose-strong:text-foreground prose-strong:font-semibold
       prose-em:text-muted-foreground
       prose-a:text-foreground prose-a:underline prose-a:underline-offset-2 prose-a:decoration-border
       hover:prose-a:opacity-80
       prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
       prose-blockquote:border-l-2 prose-blockquote:border-border prose-blockquote:text-muted-foreground
       prose-hr:border-border
       prose-table:text-sm
       prose-th:text-foreground prose-th:font-semibold
       prose-td:text-muted-foreground
       [&_ol]:space-y-1 [&_ul]:space-y-1
       [&_ol>li]:marker:text-muted-foreground
       [&_ul>li]:marker:text-muted-foreground`
    : "";

  return (
    <div className={`${proseClasses} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export function InlineMarkdown({ content, className = "" }: { content: string; className?: string }) {
  return (
    <MarkdownContent
      content={content}
      className={className}
      prose={false}
    />
  );
}
