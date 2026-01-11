import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Shield,
  FileText,
  AlertCircle,
  Eye,
  Scale,
  Users,
  ExternalLink,
} from "lucide-react";

const policyLinks = [
  {
    title: "Privacy Policy",
    lastUpdated: "Last Updated: January 8th, 2026",
    description: "Learn how we collect and protect your personal information",
    icon: Eye,
    href: "/privacy",
  },
  {
    title: "Terms of Service",
    lastUpdated: "Last Updated: January 8th, 2026",
    description: "Our terms and conditions for using RIVET Studios",
    icon: Scale,
    href: "/terms",
  },
  {
    title: "Community Rules",
    lastUpdated: "Last Updated: January 8th, 2026",
    description: "Community guidelines and code of conduct",
    icon: Users,
    href: "/community-rules",
  },
  {
    title: "Guidelines",
    lastUpdated: "Last Updated: January 8th, 2026",
    description: "General platform guidelines and best practices",
    icon: FileText,
    href: "/guidelines",
  },
  {
    title: "DMCA Policy",
    lastUpdated: "Last Updated: January 8th, 2026",
    description: "Digital Millennium Copyright Act policy",
    icon: Shield,
    href: "/dmca",
  },
  {
    title: "Project Foxtrot Rules",
    lastUpdated: "Last Updated: January 8th, 2026",
    description: "Specific rules for Project Foxtrot",
    icon: AlertCircle,
    href: "/project-foxtrot-rules",
  },
];

export default function Policies() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Policies & Guidelines</h1>
        <p className="text-lg text-muted-foreground">
          Important information about RIVET Studios™ policies, guidelines, and
          legal documents
        </p>
      </div>

      {/* Policies Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {policyLinks.map((policy) => {
          const Icon = policy.icon;
          return (
            <Card
              key={policy.href}
              className="flex flex-col hover:border-primary/50 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-8 w-8"
                    data-testid={`link-${policy.href}`}
                  >
                    <Link href={policy.href}>
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
                <CardTitle className="text-lg mt-2">{policy.title}</CardTitle>
                <CardDescription className="text-xs">
                  {policy.lastUpdated}
                </CardDescription>
                <CardDescription>{policy.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button className="w-full" asChild>
                  <Link href={policy.href}>Read Full Policy</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Information */}
      <Card className="bg-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Questions?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you have any questions about our policies or guidelines, please
            don't hesitate to contact our support team.
          </p>
          <Button asChild>
            <Link href="/support">Contact Support</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
