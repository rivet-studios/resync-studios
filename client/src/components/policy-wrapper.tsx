import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { PolicyDocument } from "@/components/policy-document";
import { MarkdownContent } from "@/components/markdown-content";

interface PolicyWrapperProps {
  slug: string;
  title?: string;
  effectiveDate?: string;
  version?: string | number;
  children: ReactNode;
}

export function PolicyWrapper({ slug, title, effectiveDate, version, children }: PolicyWrapperProps) {
  const { data: policy } = useQuery<{ slug: string; title: string; content: string; updatedAt: string } | null>({
    queryKey: [`/api/policies/${slug}`],
    queryFn: async () => {
      const res = await fetch(`/api/policies/${slug}`);
      if (res.status === 404) return null;
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
  });

  if (policy) {
    const dbEffective = new Date(policy.updatedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });

    if (title) {
      return (
        <PolicyDocument title={policy.title} effectiveDate={dbEffective} version="—">
          <MarkdownContent content={policy.content} data-testid="policy-content" />
        </PolicyDocument>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl sm:text-4xl font-bold">{policy.title}</h1>
          <p className="text-sm text-muted-foreground mt-4">
            Last Updated: {new Date(policy.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <MarkdownContent content={policy.content} data-testid="policy-content" />
      </div>
    );
  }

  if (title && effectiveDate && version !== undefined) {
    return (
      <PolicyDocument title={title} effectiveDate={effectiveDate} version={version}>
        {children}
      </PolicyDocument>
    );
  }

  return <>{children}</>;
}
