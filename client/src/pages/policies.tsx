import { Link } from "wouter";
import { Folder, FileText, ChevronRight } from "lucide-react";

const RECENT_POLICIES = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Subscription Services Agreement", href: "/subscription-agreement" },
];

export default function Policies() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="space-y-1 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Policies</h1>
        <p className="text-muted-foreground">Browse our policies, terms of service, and legal documents</p>
      </div>

      <div className="max-w-lg">
        <div className="rounded-xl border border-border bg-card p-5">
          <Link href="/policies/legal" className="flex items-center gap-4 mb-5 group" data-testid="link-legal-policies">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <Folder className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground group-hover:underline">Legal &amp; Policies</p>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                <FileText className="w-3.5 h-3.5" />
                <span>5 policies</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </Link>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground mb-3">Recent Policies</p>
            <ul className="space-y-2">
              {RECENT_POLICIES.map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-policy-${p.href.replace("/", "")}`}
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
