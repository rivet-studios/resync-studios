import {
  ArrowRight,
  Building2,
  Gamepad2,
  Globe2,
  Heart,
  Layers3,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { Link } from "wouter";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const principles = [
  {
    icon: Gamepad2,
    title: "Original experiences",
    description:
      "We build and support interactive experiences designed around immersion, creativity, and long-term community engagement.",
  },
  {
    icon: Users,
    title: "Community first",
    description:
      "RIVET is built around the people who use it. Community feedback, participation, and collaboration shape what we build.",
  },
  {
    icon: Wrench,
    title: "Built with purpose",
    description:
      "Our systems are designed to solve real problems, improve the user experience, and provide a reliable foundation for our projects.",
  },
  {
    icon: ShieldCheck,
    title: "Safety & trust",
    description:
      "Moderation, support, privacy, and responsible platform management are fundamental parts of the RIVET experience.",
  },
  {
    icon: Layers3,
    title: "One connected platform",
    description:
      "Games, community spaces, services, digital products, and member tools are brought together under one ecosystem.",
  },
  {
    icon: Heart,
    title: "Made to evolve",
    description:
      "RIVET is continuously changing. We use what we learn from our community to improve our products and the platform around them.",
  },
];

const areas = [
  {
    label: "Studio",
    title: "We create experiences.",
    description:
      "RIVET Studios™ develops original projects and interactive experiences across our ecosystem, from early concepts through ongoing development.",
    href: "/titles",
    action: "Explore our titles",
  },
  {
    label: "Community",
    title: "We build places to belong.",
    description:
      "Our community systems give members a place to communicate, collaborate, share work, participate in discussions, and follow the projects they care about.",
    href: "/forums",
    action: "Visit the community",
  },
  {
    label: "Platform",
    title: "We build the infrastructure behind it.",
    description:
      "Accounts, profiles, forums, support, digital products, subscriptions, moderation tools, and other services form the foundation of the RIVET platform.",
    href: "/dashboard",
    action: "Open your dashboard",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-48 left-1/3 w-[40rem] h-[30rem] rounded-full bg-primary/10 blur-[140px]" />
          <div className="absolute top-1/2 -right-48 w-[32rem] h-[32rem] rounded-full bg-primary/5 blur-[130px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.12))]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-4xl">
            <Badge
              variant="outline"
              className="gap-2 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] border-primary/20 bg-primary/5 text-primary"
            >
              <Sparkles className="w-3.5 h-3.5" />
              About RIVET Studios™
            </Badge>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.04em] leading-[0.95] text-foreground mt-7">
              Building experiences.
              <br />
              <span className="text-muted-foreground">
                Building community.
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mt-7">
              RIVET Studios™ is a community-focused digital studio building
              interactive experiences, technology, and services designed to
              bring people together.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Button asChild>
                <Link href="/titles">
                  Explore our titles
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>

              <Button asChild variant="outline">
                <Link href="/forums">Join the community</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-10 lg:gap-20">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
              Who we are
            </p>

            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mt-3">
              More than a game studio.
            </h2>
          </div>

          <div className="space-y-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
            <p>
              RIVET Studios™ exists at the intersection of game development,
              technology, and community. We create original experiences while
              developing the systems and services that allow our community to
              participate alongside them.
            </p>

            <p>
              Our approach is deliberately community-first. Projects are not
              developed in isolation; the people who play, participate, create,
              and contribute are an important part of the ecosystem around
              them.
            </p>

            <p>
              From our games and digital projects to our forums, support
              systems, marketplace, and member services, RIVET is being built
              as a connected platform rather than a collection of unrelated
              products.
            </p>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-y border-border/40 bg-muted/[0.025]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
              What drives us
            </p>

            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mt-3">
              Built around a few simple principles.
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground mt-4 leading-relaxed">
              These principles guide how we approach our projects, our
              technology, and the community that surrounds them.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/40 mt-10 border border-border/40 overflow-hidden rounded-xl">
            {principles.map((principle) => {
              const Icon = principle.icon;

              return (
                <div
                  key={principle.title}
                  className="bg-background p-6 sm:p-7"
                >
                  <div className="w-10 h-10 rounded-lg border border-primary/15 bg-primary/5 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>

                  <h3 className="text-base font-semibold text-foreground mt-5">
                    {principle.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                    {principle.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
              What we do
            </p>

            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mt-3">
              Three parts of the same ecosystem.
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-10">
          {areas.map((area) => (
            <Card
              key={area.title}
              className="group border-border/50 bg-card/40 hover:bg-card/70 transition-all duration-300"
            >
              <CardContent className="p-7 sm:p-8 flex flex-col h-full">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                  {area.label}
                </p>

                <h3 className="text-2xl font-semibold tracking-tight text-foreground mt-4">
                  {area.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed mt-3 flex-1">
                  {area.description}
                </p>

                <Button
                  asChild
                  variant="ghost"
                  className="justify-start px-0 mt-7 w-fit group/button"
                >
                  <Link href={area.href}>
                    {area.action}
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/button:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Studio */}
      <section className="border-y border-border/40 bg-muted/[0.025]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                The studio
              </p>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground mt-3">
                Independent in spirit.
                <br />
                Community-driven by design.
              </h2>
            </div>

            <div className="space-y-5 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p>
                RIVET Studios™ is independently operated with a focus on
                creating its own identity, projects, technology, and community
                systems.
              </p>

              <p>
                Our work spans development, design, community operations,
                platform engineering, and creative production. That lets us
                approach the experience from both sides: the technology behind
                it and the people using it.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                <div className="rounded-lg border border-border/50 bg-background/50 p-4">
                  <Building2 className="w-4 h-4 text-primary mb-3" />
                  <p className="text-sm font-semibold text-foreground">
                    RIVET Studios™
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Independent digital studio
                  </p>
                </div>

                <div className="rounded-lg border border-border/50 bg-background/50 p-4">
                  <Globe2 className="w-4 h-4 text-primary mb-3" />
                  <p className="text-sm font-semibold text-foreground">
                    Community platform
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Built around connected experiences
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Future */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-primary/[0.035]">
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

          <div className="relative p-8 sm:p-12 lg:p-16">
            <div className="max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                What's next
              </p>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground mt-3">
                This is only the beginning.
              </h2>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mt-5">
                RIVET is still evolving. New experiences, platform features,
                community systems, and creative projects will continue to
                expand the ecosystem over time.
              </p>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mt-4">
                We are building with the long term in mind: creating a platform
                that can grow alongside the people who make RIVET what it is.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <Button asChild>
                  <Link href="/titles">
                    See what we're building
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>

                <Button asChild variant="outline">
                  <Link href="/support">Contact RIVET</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer statement */}
      <section className="border-t border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <p className="text-sm font-semibold text-foreground">
                RIVET Studios™
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Building what's next.
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Established 2017 · Publicly introduced 2022
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}