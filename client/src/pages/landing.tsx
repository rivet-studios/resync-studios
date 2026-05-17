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
  Zap,
  Rocket,
  UserPlus,
} from "lucide-react";
import { SiDiscord, SiRoblox } from "react-icons/si";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

function formatCount(num: number): string {
  if (num >= 1000000)
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

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
      "Built-in forum system with real-time chat, announcements, and engaging spaces for our community.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Advanced analytics providing deep insights into member engagement and community growth metrics to enhance innovative solutions and our community-first scope.",
  },
  {
    icon: Gamepad2,
    title: "Game Integration",
    description:
      "Advanced game development integration supporting high-fidelity experiences across platforms with custom software capabilities.",
  },
  {
    icon: Shield,
    title: "Security & Moderation",
    description:
      "Advanced security systems ensuring fair play and safe gaming environments with robust anti-cheat and monitoring capabilities.",
  },
  {
    icon: Globe,
    title: "Global Infrastructure",
    description:
      "Worldwide server network delivering high-fidelity gaming experiences with low latency and global availability.",
  },
];

export default function Landing() {
  const { user } = useAuth();

  const { data: publicStats } = useQuery<{
    totalMembers: number;
    totalDiscussions: number;
    discordMembers: number;
    robloxMembers: number;
  }>({
    queryKey: ["/api/public/stats"],
    staleTime: 60000,
    refetchInterval: 60000,
  });

  const stats = [
    { value: publicStats?.totalMembers || 24, label: "Connected Members" },
    { value: 35, label: "Discord Members" },
    { value: 11, label: "Roblox Members" },
    { value: 5, label: "Active Discussions" },
    { value: 99.9, label: "Uptime", suffix: "%" },
    { value: 24, label: "Support", suffix: "/7" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_60%)] bg-[#ff000000]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center space-y-10">
          <div className="space-y-6 max-w-3xl mx-auto">
            <div
              className="flex flex-wrap items-center justify-center gap-3"
              data-testid="section-hero-stats"
            >
              <div
                className="inline-flex items-center gap-2.5 bg-black/90 border border-white/[0.03] backdrop-blur-sm rounded-full px-3 py-1.4"
                data-testid="stat-platform-members"
              >
                <Rocket className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground/90 text-[14px]">
                  Now powering {formatCount(publicStats?.totalMembers || 24)}+
                  members
                </span>
              </div>
              <div
                className="inline-flex items-center gap-2 bg-black/90 border border-white/[0.03] backdrop-blur-sm rounded-full px-3 py-1.4"
                data-testid="stat-discord-members"
              >
                <div className="relative flex items-center justify-center">
                <SiDiscord className="w-5 h-4 text-[#5865F2]" />
                  <span className="absolute -top-0.5 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-[#121212] rounded-full"></span>
                </div>
                <span className="text-m text-muted-foreground/90">
                  {formatCount(publicStats?.discordMembers || 35)}
                </span>
              </div>
              <div
                className="inline-flex items-center gap-2 bg-black/90 border border-white/[0.03] backdrop-blur-sm rounded-full px-3 py-1.4"
                data-testid="stat-roblox-members"
              >
                <SiRoblox className="w-4 h-4 text-white" />
                <span className="text-m text-muted-foreground/90">
                  {formatCount(publicStats?.robloxMembers || 11)}
                </span>
              </div>
            </div>

            <p
              className="sm:text-3xl md:text-5xl font-semibold tracking-tight text-foreground text-[46px]"
              data-testid="text-hero-title"
            >
             The number one online gaming community platform
            </p>
            <p
              className="sm:text-1xl text-muted-foreground max-w-xl mx-auto font-normal text-[19px]"
              data-testid="text-hero-description"
            >
              RIVET Studios™ creates an open gaming environment available to everyone, delivering worlds that breathe, stories that live, and cities that command attention through our exceptional game development expertise. Every project is treated like a city — layered, alive, and engineered to last.
            </p>
          </div>

          <div className="flex flex-col gap-3 items-center justify-center pt-4">
            <Button
              size="lg"
              className="bg-white text-black h-11 px-6 rounded-half font-medium hover:bg-gray-200 transition-colors gap-2"
              asChild
              data-testid="button-cta-primary"
            >
              <Link href={user ? "/dashboard" : "/onboarding"}>
                <UserPlus className="w-4 h-4" />
                {user ? "My Dashboard" : "Join The Community"}
              </Link>
            </Button>
            {/* This button will only render if 'user' is truthy */}
            {user && (
              <Button
                size="lg"
                variant="outline"
                asChild
                className="bg-black/40 border border-white/20 text-white h-11 px-6 rounded-half font-medium backdrop-blur-md transition-all"
              >
                <Link href="/store">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Browse Store
                </Link>
              </Button>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </section>
      <section className="py-20 bg-background" data-testid="section-stats">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-y-12 gap-x-8 max-w-2xl mx-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center space-y-2"
                data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-muted-foreground">
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
              Our platform provides all the essential tools to build and manage
              thriving communities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="group border-white/[0.04] bg-card hover:bg-accent hover:border-white/[0.08] transition-all duration-300 rounded-xl overflow-hidden"
                  data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
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
                  Join a growing community of creators, developers, and
                  enthusiasts building the future together.
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
