import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/animated-counter";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  MessageSquare,
  BarChart3,
  Gamepad2,
  Shield,
  Globe,
  ArrowRight,
  ShoppingCart,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();

  const { data: publicStats } = useQuery<{ totalMembers: number; totalDiscussions: number }>({
    queryKey: ["/api/public/stats"],
    staleTime: 60000,
  });

  const stats = [
    { value: publicStats?.totalMembers || 0, label: "Connected Members", suffix: "+" },
    { value: publicStats?.totalDiscussions || 0, label: "Active Discussions", suffix: "+" },
    { value: 99.9, label: "Uptime", suffix: "%" },
    { value: 24, label: "Support", suffix: "/7" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_60%)]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center space-y-10">
          <div className="space-y-6 max-w-3xl mx-auto">
            <Badge variant="outline" className="bg-white/[0.04] border-white/[0.08] backdrop-blur-sm px-4 py-2 text-xs font-medium text-muted-foreground tracking-wide uppercase gap-2" data-testid="badge-hero-tagline">
              <Sparkles className="w-3.5 h-3.5" />
              Building the Future of Digital Experiences
            </Badge>
            <h1 className="text-6xl sm:text-8xl font-semibold tracking-tight text-foreground leading-[0.95]" data-testid="text-hero-title">
              RIVET Studios<span className="text-muted-foreground">™</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto font-normal leading-relaxed" data-testid="text-hero-description">
              We build worlds that breathe, stories that live, and brands that
              command attention. Every project is treated like a city — layered,
              alive, and engineered to last.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              size="lg"
              className="bg-white text-black gap-2"
              asChild
              data-testid="button-cta-primary"
            >
              <Link href={user ? "/dashboard" : "/onboarding"}>
                <Users className="w-4 h-4" />
                {user ? "My Dashboard" : "Join The Community"}
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/10 bg-white/[0.03] text-muted-foreground gap-2"
              asChild
              data-testid="button-cta-store"
            >
              <Link href="/store">
                <ShoppingCart className="w-4 h-4" />
                Browse Store
              </Link>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </section>

      <section className="py-20 bg-background" data-testid="section-stats">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center space-y-2" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <section className="py-28 bg-background" data-testid="section-features">
        <div className="container mx-auto px-4 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Everything you need
            </h2>
            <p className="text-base text-muted-foreground font-normal leading-relaxed">
              Our platform provides all the essential tools to build and manage thriving communities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="group border-white/[0.04] bg-card hover:bg-accent hover:border-white/[0.08] transition-all duration-300 rounded-xl overflow-hidden"
                  data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <CardContent className="p-8 space-y-5">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-all duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <section className="py-28 bg-background" data-testid="section-cta">
        <div className="container mx-auto px-4">
          <Card className="border-white/[0.04] bg-card rounded-xl overflow-hidden">
            <CardContent className="relative p-12 sm:p-16 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.02)_0%,transparent_60%)]" />
              <div className="relative z-10 space-y-6 max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <Zap className="w-5 h-5 text-muted-foreground" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                  Ready to get started?
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Join a growing community of creators, developers, and enthusiasts building the future together.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button
                    size="lg"
                    className="bg-white text-black gap-2"
                    asChild
                    data-testid="button-cta-bottom-join"
                  >
                    <Link href={user ? "/dashboard" : "/onboarding"}>
                      <ArrowRight className="w-4 h-4" />
                      {user ? "Go to Dashboard" : "Create Account"}
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/10 bg-white/[0.03] text-muted-foreground gap-2"
                    asChild
                    data-testid="button-cta-bottom-forums"
                  >
                    <Link href="/forums">
                      <MessageSquare className="w-4 h-4" />
                      Browse Forums
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
