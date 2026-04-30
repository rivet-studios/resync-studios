import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

interface Breadcrumb {
  label: string;
  href: string;
}

interface PolicyDocumentProps {
  title: string;
  effectiveDate: string;
  version: string | number;
  breadcrumbs?: Breadcrumb[];
  children: React.ReactNode;
}

export function PolicyDocument({
  title,
  effectiveDate,
  version,
  breadcrumbs = [
    { label: "Policies", href: "/policies" },
    { label: "Legal & Policies", href: "/policies/legal" },
  ],
  children,
}: PolicyDocumentProps) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <nav className="flex items-center flex-wrap gap-1 text-sm text-muted-foreground mb-10">
        {breadcrumbs.map((crumb) => (
          <span key={crumb.href} className="flex items-center gap-1">
            <Link href={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
          </span>
        ))}
        <span className="text-foreground">{title}</span>
      </nav>

      <div className="mb-10 pb-8 border-b border-border">
        <h1 className="text-3xl font-bold text-foreground mb-4">{title}</h1>
        <div className="space-y-0.5 text-sm text-muted-foreground">
          <p>Legal &amp; Policies</p>
          <p>Effective {effectiveDate}</p>
          <p>Version {version}</p>
        </div>
      </div>

      <div
        className="
          prose prose-sm dark:prose-invert max-w-none
          prose-headings:text-foreground prose-headings:font-semibold prose-headings:tracking-tight
          prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3
          prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
          prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:my-3
          prose-li:text-muted-foreground prose-li:leading-relaxed
          prose-strong:text-foreground prose-strong:font-semibold
          prose-a:text-foreground prose-a:underline prose-a:underline-offset-2
          [&_ol]:space-y-1 [&_ul]:space-y-1
          [&_ol>li]:marker:text-muted-foreground
          [&_ul>li]:marker:text-muted-foreground
        "
      >
        {children}
      </div>
    </div>
  );
}
