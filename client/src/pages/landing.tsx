import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/animated-counter";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowRight,
  Gamepad2,
  Globe,
  MessageSquare,
  Rocket,
  Shield,
  ShoppingCart,
  Sparkles,
  Users,
  UserPlus,
  Zap,
} from "lucide-react";
import { SiDiscord, SiRoblox } from "react-icons/si";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

function formatCount(num: number): string {
  if (num >= 1000000) {
    return (
      (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
    );
  }

  if (num >= 1000) {
    return (
      (num / 1000).toFixed(1).replace(/\.0$/, "") + "K"
    );
  }

  return num.toString();
}

const studioFeatures = [
  {
    icon: Gamepad2,
    title: "Original Experiences",
    description:
      "RIVET develops original interactive experiences with a focus on immersion, quality, and long-term community support.",
  },
  {
    icon: Users,
    title: "A Real Community",
    description:
      "Our community sits at the centre of everything we build, giving players a place to connect, participate, and contribute.",
  },
  {
    icon: Sparkles,
    title: "Built With Purpose",
    description:
      "Every RIVET project is designed with a clear identity, direction, and purpose rather than simply filling a catalogue.",
  },
  {
    icon: Shield,
    title: "Safety & Support",
    description:
      "Community safety, moderation, and support are built into the experience from the beginning.",
  },
  {
    icon: Globe,
    title: "Connected Platform",
    description:
      "Our website, community services, games, and digital experiences are designed to work together as one ecosystem.",
  },
  {
    icon: Zap,
    title: "Always Evolving",
    description:
      "RIVET continues to iterate across its projects, platform, and community as new ideas and opportunities emerge.",
  },
];

const stats = [
  {
    value: "members",
    label: "Connected Members",
  },
  {
    value: "discord",
    label: "Discord Members",
  },
  {
    value: "roblox",
    label: "Roblox Members",
  },
  {
    value: "discussions",
    label: "Active Discussions",
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

  const statValues: Record<
    string,
    number
  > = {
    members: publicStats?.totalMembers || 24,
    discord: publicStats?.discordMembers || 35,
    roblox: publicStats?.robloxMembers || 11,
    discussions: publicStats?.totalDiscussions || 5,
  };

  return (
    <div className="min-h-screen bg-[#050505] text-foreground overflow-x-hidden">

      {/* ========================================================= */}
      {/* HERO                                                      */}
      {/* ========================================================= */}

      <section
        className="relative min-h-[calc(100vh-3rem)] flex items-end overflow-hidden"
        data-testid="section-hero"
      >
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.09),transparent_34%),radial-gradient(circle_at_10%_90%,rgba(70,100,180,0.08),transparent_32%)]" />

          <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(115deg,transparent_0%,transparent_49%,rgba(255,255,255,0.8)_50%,transparent_51%)] bg-[length:90px_90px]" />

          <div className="absolute -top-32 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-white/[0.025] blur-3xl animate-pulse" />

          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-[#050505]" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 w-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24 lg:pb-28">

            <div className="max-w-6xl">

              <div className="flex items-center gap-3 mb-7">
                <span className="h-px w-10 bg-white/40" />

                <span className="text-xs sm:text-sm tracking-[0.25em] uppercase text-white/55 font-medium">
                  RIVET STUDIOS™
                </span>
              </div>

              <h1
                className="text-[clamp(3.5rem,11vw,9rem)] leading-[0.82] tracking-[-0.065em] font-black text-white uppercase max-w-6xl"
                data-testid="text-hero-title"
              >
                Building
                <br />
                what's next.
              </h1>

              <div className="mt-9 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

                <p
                  className="max-w-xl text-sm sm:text-base lg:text-lg leading-relaxed text-white/55"
                  data-testid="text-hero-description"
                >
                  RIVET Studios™ is a community-driven digital studio
                  creating interactive experiences, connected communities,
                  and original projects built to last.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0">

                  <Button
                    size="lg"
                    className="h-12 rounded-none bg-white text-black px-6 font-semibold hover:bg-white/85 transition-all"
                    asChild
                    data-testid="button-hero-primary"
                  >
                    <Link href="/titles">
                      Explore Projects
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-none border-white/20 bg-black/30 px-6 text-white backdrop-blur-md hover:bg-white/10 hover:text-white"
                    asChild
                    data-testid="button-hero-secondary"
                  >
                    <Link href={user ? "/dashboard" : "/onboarding"}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      {user ? "My Dashboard" : "Join Community"}
                    </Link>
                  </Button>

                </div>
              </div>

            </div>

            <div className="mt-16 flex items-center gap-3 text-white/35">
              <ArrowDown className="h-4 w-4 animate-bounce" />

              <span className="text-[10px] tracking-[0.25em] uppercase">
                Scroll to explore
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FEATURED TITLE                                             */}
      {/* ========================================================= */}

      <section
        className="relative py-24 sm:py-32"
        data-testid="section-featured-project"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">

            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-white/40 mb-4">
                Our projects
              </p>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em]">
                Titles worth exploring.
              </h2>
            </div>

            <Link
              href="/titles"
              className="group inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              See all titles

              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

          </div>

          <Link
            href="/titles/project-serrano"
            className="group block relative min-h-[520px] sm:min-h-[600px] overflow-hidden border border-white/10 bg-[#0b0b0b]"
            data-testid="card-project-serrano"
          >

            {/* Project image hook */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_35%,rgba(80,110,160,0.22),transparent_38%)]" />

              <div className="absolute inset-0 bg-[linear-gradient(120deg,#111_0%,#080808_48%,#10151d_100%)] transition-transform duration-700 ease-out group-hover:scale-[1.025]" />

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,rgba(255,255,255,0.07),transparent_22%)]" />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/5" />
            </div>

            <div className="relative z-10 flex min-h-[520px] sm:min-h-[600px] flex-col justify-end p-7 sm:p-10 lg:p-14">

              <div className="mb-5 flex flex-wrap items-center gap-3">

                <span className="inline-flex items-center border border-white/15 bg-black/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white/65 backdrop-blur-md">
                  In Development
                </span>

                <span className="inline-flex items-center gap-2 border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white/50 backdrop-blur-md">
                  <SiRoblox className="h-3 w-3" />
                  Roblox
                </span>

              </div>

              <h3 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-[-0.06em] uppercase leading-[0.85]">
                Project
                <br />
                Serrano
              </h3>

              <div className="mt-7 flex flex-col sm:flex-row sm:items-end justify-between gap-6">

                <p className="max-w-xl text-sm sm:text-base leading-relaxed text-white/55">
                  RIVET's flagship roleplay experience, inspired by
                  Project Ventura and Once Upon a Time in Rosewood.
                </p>

                <span className="inline-flex items-center gap-2 text-sm font-medium text-white shrink-0">
                  View title

                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>

              </div>

            </div>
          </Link>

        </div>
      </section>

      {/* ========================================================= */}
      {/* SECONDARY TITLE                                            */}
      {/* ========================================================= */}

      <section
        className="pb-24 sm:pb-32"
        data-testid="section-other-projects"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid md:grid-cols-2 gap-4">

            <Link
              href="/titles/project-sundown"
              className="group relative min-h-[380px] overflow-hidden border border-white/10 bg-[#0a0a0a]"
              data-testid="card-project-sundown"
            >

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(190,120,55,0.12),transparent_40%)]" />

              <div className="absolute inset-0 bg-gradient-to-br from-[#15110d] via-[#0a0a0a] to-[#050505] transition-transform duration-700 group-hover:scale-[1.025]" />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              <div className="relative z-10 min-h-[380px] p-7 sm:p-9 flex flex-col justify-end">

                <span className="text-[10px] uppercase tracking-[0.22em] text-white/40 mb-4">
                  Active Project
                </span>

                <h3 className="text-4xl sm:text-5xl font-bold tracking-[-0.045em]">
                  Project Sundown
                </h3>

                <div className="mt-5 flex items-center justify-between gap-4">

                  <p className="text-sm text-white/45 max-w-sm">
                    An interim playable experience currently receiving
                    quality-of-life improvements and bug fixes.
                  </p>

                  <ArrowRight className="h-5 w-5 shrink-0 text-white/50 transition-transform group-hover:translate-x-1 group-hover:text-white" />

                </div>

              </div>

            </Link>

            <Link
              href="/titles"
              className="group relative min-h-[380px] overflow-hidden border border-white/10 bg-[#0a0a0a]"
              data-testid="card-all-titles"
            >

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.07),transparent_35%)]" />

              <div className="absolute inset-0 bg-[linear-gradient(135deg,#111_0%,#080808_55%,#0e0e0e_100%)]" />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

              <div className="relative z-10 min-h-[380px] p-7 sm:p-9 flex flex-col justify-between">

                <div className="flex justify-end">
                  <ArrowRight className="h-5 w-5 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                </div>

                <div>

                  <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                    Portfolio
                  </span>

                  <h3 className="mt-3 text-4xl sm:text-5xl font-bold tracking-[-0.045em]">
                    Explore all titles.
                  </h3>

                  <p className="mt-5 text-sm text-white/45 max-w-sm">
                    Explore current development, active experiences,
                    and projects from the RIVET archive.
                  </p>

                </div>

              </div>

            </Link>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* LIVE COMMUNITY STATS                                       */}
      {/* ========================================================= */}

      <section
        className="border-y border-white/[0.07] bg-[#080808]"
        data-testid="section-stats"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-2 lg:grid-cols-4">

            {stats.map((stat, index) => {

              const value = statValues[stat.value];

              return (
                <div
                  key={stat.value}
                  className={`py-12 sm:py-16 px-5 sm:px-8 ${
                    index !== stats.length - 1
                      ? "border-r border-white/[0.07]"
                      : ""
                  } ${
                    index >= 2
                      ? "border-t lg:border-t-0 border-white/[0.07]"
                      : ""
                  }`}
                >

                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.04em]">
                    <AnimatedCounter
                      end={value}
                    />
                  </div>

                  <p className="mt-2 text-xs sm:text-sm text-white/40">
                    {stat.label}
                  </p>

                </div>
              );
            })}

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* ABOUT RIVET                                                */}
      {/* ========================================================= */}

      <section
        className="py-24 sm:py-32"
        data-testid="section-about"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-14 lg:gap-24">

            <div>

              <p className="text-xs tracking-[0.25em] uppercase text-white/40 mb-5">
                About RIVET
              </p>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.05em] leading-[0.95]">
                More than
                <br />
                a game studio.
              </h2>

              <p className="mt-7 text-sm sm:text-base leading-relaxed text-white/50 max-w-md">
                RIVET Studios™ brings together original projects,
                technology, community, and digital experiences under
                one connected platform.
              </p>

              <Button
                variant="outline"
                className="mt-8 rounded-none border-white/15 bg-transparent text-white hover:bg-white hover:text-black"
                asChild
              >
                <Link href="/about">
                  Learn about RIVET
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

            </div>

            <div className="grid sm:grid-cols-2 gap-px bg-white/[0.08] border border-white/[0.08]">

              {studioFeatures.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="bg-[#080808] p-7 sm:p-8 hover:bg-[#0d0d0d] transition-colors"
                  >

                    <Icon className="h-5 w-5 text-white/55 mb-6" />

                    <h3 className="text-base font-semibold">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-white/40">
                      {feature.description}
                    </p>

                  </div>
                );
              })}

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* COMMUNITY                                                  */}
      {/* ========================================================= */}

      <section
        className="relative py-24 sm:py-32 overflow-hidden"
        data-testid="section-community"
      >

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-white/[0.025] blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">

          <div className="border border-white/[0.08] bg-[#090909] p-8 sm:p-12 lg:p-16">

            <div className="grid lg:grid-cols-[1fr_auto] lg:items-end gap-10">

              <div>

                <div className="flex items-center gap-3 mb-5">

                  <SiDiscord className="h-5 w-5 text-[#5865F2]" />

                  <span className="text-xs uppercase tracking-[0.2em] text-white/40">
                    The community
                  </span>

                </div>

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.05em] leading-[0.95] max-w-3xl">
                  Build with us.
                  <br />
                  Be part of what's next.
                </h2>

                <p className="mt-6 max-w-xl text-sm sm:text-base leading-relaxed text-white/45">
                  Follow development, meet other members, participate
                  in the community, and stay connected with everything
                  happening across RIVET Studios™.
                </p>

              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">

                <Button
                  size="lg"
                  className="rounded-none bg-white text-black hover:bg-white/85"
                  asChild
                >
                  <Link href={user ? "/dashboard" : "/onboarding"}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {user ? "Open Dashboard" : "Join Community"}
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-none border-white/15 bg-transparent text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/forums">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Visit Forums
                  </Link>
                </Button>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* STORE / FINAL CTA                                          */}
      {/* ========================================================= */}

      <section
        className="py-20 sm:py-28 border-t border-white/[0.06]"
        data-testid="section-final-cta"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

            <div>

              <p className="text-xs tracking-[0.25em] uppercase text-white/35 mb-4">
                RIVET Studios™
              </p>

              <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.04em]">
                There's more to discover.
              </h2>

              <p className="mt-3 text-sm text-white/40 max-w-lg">
                Explore the studio, browse the community, or take a
                look through the RIVET store.
              </p>

            </div>

            <div className="flex flex-col sm:flex-row gap-3">

              <Button
                size="lg"
                variant="outline"
                className="rounded-none border-white/15 bg-transparent text-white hover:bg-white/10"
                asChild
              >
                <Link href="/store">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Browse Store
                </Link>
              </Button>

              <Button
                size="lg"
                className="rounded-none bg-white text-black hover:bg-white/85"
                asChild
              >
                <Link href="/about">
                  About RIVET
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

            </div>

          </div>

        </div>
      </section>

    </div>
  );
}