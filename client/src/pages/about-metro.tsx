import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Users, Target, Rocket } from "lucide-react";

export default function AboutMetro() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="text-center space-y-4">
        <Badge variant="outline" className="mx-auto gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          Our Story
        </Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-bold">
          Metro Interactive: A New Era Begins™
        </h1>
        <p className="text-xl text-muted-foreground italic">
          "The city never sleeps… and neither does your story."
        </p>
      </div>

      <Card className="border-chart-2/50 bg-gradient-to-r from-chart-2/10 to-primary/10">
        <CardContent className="p-6 space-y-4">
          <p className="text-lg font-semibold">
            We are proud to officially announce our rebrand to RESYNC Studios™
            — the next evolution of our community and our vision for immersive,
            advanced roleplay.
          </p>
          <p className="text-muted-foreground">
            This is more than a name change; it is the foundation for the future
            of cinematic, character-driven storytelling within a realistic urban
            environment.
          </p>
        </CardContent>
      </Card>

      {/* Our Vision */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Target className="w-8 h-8 text-primary" />
          <h2 className="font-display text-3xl font-bold">Our Vision</h2>
        </div>

        <p className="text-lg text-muted-foreground">
          RESYNC Studios™ represents a commitment to redefining roleplay
          standards. Our focus is on crafting experiences that are:
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cinematic Realism</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Every interaction, scene, and moment is built to feel authentic
              and meaningful, like a story unfolding on screen.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Urban Depth</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Inspired by Los Angeles' energy, tension, and culture, our RP
              environment reflects both the city's vibrancy and its darker,
              grittier undertones.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Community Integrity</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Fostering collaboration, creativity, and respect, ensuring that
              every member feels valued and empowered to contribute.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* The Future */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Rocket className="w-8 h-8 text-primary" />
          <h2 className="font-display text-3xl font-bold">
            The Future of RESYNC Studios™
          </h2>
        </div>

        <p className="text-lg text-muted-foreground">
          Our rebrand is just the beginning. Over the next several months, we
          will be rolling out:
        </p>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Expanded Storytelling Tools & Systems
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              New mechanics and frameworks to support deeper, more complex RP
              scenarios that push creative boundaries.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Enhanced Community Platforms
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Upgrades to our Discord, forums, and in-game infrastructure for
              smoother, more professional interaction and community engagement.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Ongoing Content Development
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Bespoke storylines, dynamic events, and city-building
              opportunities that immerse members in a living, evolving
              environment.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Education & Mentorship
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Programs designed to help new and experienced roleplayers refine
              their skills, grow their characters, and engage meaningfully with
              the community.
            </CardContent>
          </Card>
        </div>

        <Card className="border-blue-500/30 bg-blue-500/5 mt-4">
          <CardContent className="p-6">
            <p className="text-center text-lg font-semibold text-blue-600">
              Our goal is to create a space where roleplay isn't just an
              activity, but an experience — where narratives can evolve
              organically, and where every choice has weight and consequence.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* What's Changing */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-primary" />
          <h2 className="font-display text-3xl font-bold">What's Changing</h2>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">New Brand Identity</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Professional, modern, and reflective of our cinematic, urban RP
              focus. A fresh visual language for a new era.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Updated Visuals & Assets
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Logos, artwork, and in-game materials that align with our vision
              of immersive realism and cinematic storytelling.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Commitment to Excellence
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Continued dedication to quality, transparency, and fairness in
              community management and moderation. Your voice matters in RESYNC
              Studios™.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Looking Ahead */}
      <Card className="bg-gradient-to-r from-primary/10 via-chart-3/10 to-primary/10 border-primary/20">
        <CardContent className="p-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <h2 className="font-display text-2xl font-bold">Looking Ahead</h2>
          </div>
          <p className="text-lg font-semibold">
            RESYNC Studios™ is not just a company; it is a platform for
            storytelling, innovation, and collaboration.
          </p>
          <p className="text-muted-foreground">
            The city is alive, and our commitment is to keep pushing boundaries
            — developing new systems, telling richer stories, and building an RP
            environment that feels both authentic and limitless.
          </p>
          <div className="pt-4 border-t border-border/30">
            <p className="text-xl font-display italic text-primary">
              "The city's alive — your story starts now."
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="border-chart-2/30 bg-chart-2/5">
        <CardContent className="p-6 text-center">
          <p className="text-lg font-semibold mb-2">
            Welcome to RESYNC Studios and Metro Interactive™
          </p>
          <p className="text-muted-foreground">
            Join thousands of members crafting immersive stories in the most
            dynamic roleplay community. Your narrative begins here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
