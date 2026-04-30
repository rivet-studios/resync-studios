import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { PolicyDocument } from "@/components/policy-document";

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
          <div
            dangerouslySetInnerHTML={{ __html: policy.content }}
            data-testid="policy-content"
          />
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
        <div
          className="prose prose-sm dark:prose-invert max-w-none [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:text-muted-foreground [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_li]:text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_strong]:text-foreground"
          dangerouslySetInnerHTML={{ __html: policy.content }}
          data-testid="policy-content"
        />
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
