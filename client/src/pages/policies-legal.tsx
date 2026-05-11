import { Link } from "wouter";
import { FileText, Calendar } from "lucide-react";

const POLICIES = [
  {
    title: "Terms & Conditions",
    href: "/policies/legal/terms",
    description:
      "These Terms & Conditions govern your access to and use of all RIVET Studios™ websites, games, applications, digital content, community platforms, memberships, subscriptions, and related services. By accessing or using any part of the website or services, you agree to be bound by these Terms, including our rules, policies, and payment conditions.",
    effective: "4/11/2026",
    version: 3,
  },
  {
    title: "Privacy Policy",
    href: "/policies/legal/privacy",
    description:
      "This Privacy Policy outlines the data collection, processing, and retention practices of RIVET Studios™. It is designed to ensure compliance with global data protection regulations, including the CCPA/CPRA and GDPR. This document serves as a binding disclosure regarding how user information is utilized to provide, secure, and optimize our digital services.",
    effective: "4/11/2026",
    version: 2,
  },
  {
    title: "Subscription Services Agreement",
    href: "/policies/legal/subscription",
    description:
      "This Agreement governs your recurring billing cycle and outlines your responsibilities for account management. By subscribing, you acknowledge that payments are processed automatically via Stripe and that all sales are final under our strict No-Refund* Policy. It is the user's responsibility to manage or cancel subscriptions via the RIVET Studios dashboard prior to renewal dates.",
    effective: "4/11/2026",
    version: 2,
  },
  {
    title: "Acceptable Use Policy (AUP) & Community Guidelines",
    href: "/policies/legal/guidelines",
    description:
      "By playing Project Serrano, you agree to the RIVET Studios Acceptable Use Policy (AUP). We maintain a zero-tolerance policy toward exploiting, toxicity, and raiding to ensure a fair experience for everyone. Please be aware that violations of these guidelines will result in a permanent ban from our games and Discord, with no eligibility for refunds on game passes or subscriptions.",
    effective: "4/11/2026",
    version: 2,
  },
  {
    title: "EU/UK Consumer Withdrawal Rights Waiver Policy",
    href: "/policies/legal/eu-uk-withdrawal",
    description:
      "This policy explains how EU/UK consumers waive their statutory right of withdrawal for immediate-delivery digital content and services, in compliance with EU Consumer Rights Directive (2011/83/EU) and applicable national laws.",
    effective: "4/11/2026",
    version: 2,
  },
  {
    title: "Digital Millennium Copyright Act",
    href: "/policies/legal/dmca",
    description:
      "This Digital Millennium Copyright Act Policy explains how RIVET Studios™ handles claims of copyright infringement and responds to takedown notices in connection with our websites, platforms, games, and related services. We respect intellectual property rights and expect all users of the Service to do the same.",
    effective: "4/11/2026",
    version: 2,
  },
    {
    title: "Community Staff Agreement",
    href: "/policies/legal/staff-terms",
    description:
      "This Agreement outlines everything you need to know before applying to become a Volunteer Staff Member at RIVET Studios™.",
    effective: "4/11/2026",
    version: 3,
  },
];

export default function LegalPolicies() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="space-y-1 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Legal & Policies</h1>
        <p className="text-muted-foreground">Browse legal & policies and related documents</p>
      </div>

      <div className="space-y-3">
        {POLICIES.map((policy) => (
          <Link
            key={policy.href}
            href={policy.href}
            className="block rounded-xl border border-border bg-card p-5 hover:border-border/80 hover:bg-card/80 transition-colors group"
            data-testid={`link-policy-${policy.href.replace("/", "")}`}
          >
            <div className="flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground mb-1.5 group-hover:underline">{policy.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{policy.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Effective {policy.effective}
                  </span>
                  <span>Version {policy.version}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
