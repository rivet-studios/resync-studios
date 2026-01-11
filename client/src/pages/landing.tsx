import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/animated-counter";
import {
  Users,
  MessageSquare,
  BarChart3,
  Gamepad2,
  Shield,
  Globe,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";

const stats = [
  { value: 15, label: "Connected Members", suffix: "K+" },
  { value: 20, label: "Discord Members", suffix: "K+" },
  { value: 25, label: "Roblox Members", suffix: "K+" },
  { value: 36.6, label: "Active Discussions", suffix: "K+" },
  { value: 99.9, label: "Uptime", suffix: "%" },
  { value: 24, label: "Support", suffix: "/7" },
];

const features = [
  {
    icon: Users,
    title: "Member Management",
    description:
      "Comprehensive member management with detailed profiles, statistics tracking, and powerful community moderation tools.",
  },
  {
    icon: MessageSquare,
    title: "Community Forums",
    description:
      "Built-in forum system with real-time discussions, announcements, and engaging spaces for our community.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Advanced analytics providing deep insights into member engagement and community growth metrics.",
  },
  {
    icon: Gamepad2,
    title: "Game Integration",
    description:
      "Advanced game development integration supporting high-fidelity experiences across platforms.",
  },
  {
    icon: Shield,
    title: "Security & Moderation",
    description:
      "Advanced security systems ensuring fair play and safe gaming environments with robust monitoring.",
  },
  {
    icon: Globe,
    title: "Global Infrastructure",
    description:
      "Worldwide server network delivering high-fidelity gaming experiences with low latency globally.",
  },
];

export default function Landing() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="space-y-8 text-center max-w-3xl mx-auto">
        <div className="space-y-4">
          <Badge variant="outline" className="gap-2 mx-auto">
            Now powering 15K+ members
          </Badge>
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
            The number one online gaming community platform
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            RIVET Studios™ creates an open gaming environment accessible to
            everyone, delivering high-fidelity games through our exceptional
            game development expertise and building online roleplay games.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild data-testid="button-join-community">
            <Link href="/signup">
              <span>Join The Community</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            data-testid="button-browse-store"
          >
            <Link href="/store">Browse Store</Link>
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-6 gap-8 py-12 border-y border-border/50">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl sm:text-4xl font-bold mb-2">
              <AnimatedCounter
                end={stat.value}
                suffix={stat.suffix}
                duration={2000}
              />
            </div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold">
            Everything you need for thriving communities
          </h2>
          <p className="text-lg text-muted-foreground">
            Our gaming platform provides all the essential tools needed to build
            thriving communities and deliver exceptional gaming experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-card border border-border/50 rounded-lg p-8 sm:p-12 text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Ready to join our community?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of community members at RIVET Studios™ to
            experience roleplay & realism like never before!
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild data-testid="button-get-started">
            <Link href="/signup">
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="https://support.resyncstudios.com" target="_blank" rel="noopener noreferrer">Contact Support</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
