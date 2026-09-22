import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Archive,
  ArrowRight,
  CalendarDays,
  Gamepad2,
  MapPin,
  Users,
} from "lucide-react";

const RS_PROJECTS = [
  {
    name: "Project Sundown",
    projectManager: "Isaac C., Quinn M.",
    game: "ROBLOX",
    status: "active",
    location: "Los Angeles County, CA",
    notes:
      "Sundown is currently going through active quality-of-life improvements and bug fixes. Expected to be published NLT January 2027.",
  },
  {
    name: "Project Serrano",
    projectManager: "Isaac C.",
    game: "ROBLOX",
    status: "development",
    location: "Serrano County, Rosewood",
    notes:
      "Our flagship roleplay experience, inspired by Project Ventura and Once Upon a Time in Rosewood.",
  },
  {
    name: "Fort Loredo: Reimagined",
    projectManager: "Isaac C.",
    game: "ROBLOX",
    status: "discontinued",
    location: "Loredo, TX",
    notes:
      "The project was discontinued after it was determined that the game did not meet studio standards and was not suitable for further adjustment. The game was originally acquired from Mountain Interactive.",
  },
  {
    name: "Los Angeles, California: Reimagined",
    projectManager: "Isaac C.",
    game: "ROBLOX",
    status: "discontinued",
    location: "Los Angeles, CA",
    notes:
      "The project was deprecated after becoming inconsistent for our development team and increasingly unstable.",
  },
];

const featuredProject = RS_PROJECTS.find(
  (project) => project.name === "Project Serrano",
);

const activeProjects = RS_PROJECTS.filter(
  (project) => project.status === "active",
);

const discontinuedProjects = RS_PROJECTS.filter(
  (project) => project.status === "discontinued",
);

export default function Projects() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-14">
      {/* Header */}
      <section className="max-w-3xl mx-auto text-center space-y-5">
        <Badge variant="outline" className="gap-2 px-3 py-1">
          <Gamepad2 className="w-3.5 h-3.5" />
          RIVET Studios™
        </Badge>

        <div className="space-y-3">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Our Projects
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Games, experiences, and projects currently being developed,
            maintained, and archived by RIVET Studios.
          </p>
        </div>
      </section>

      {/* Featured Project */}
      {featuredProject && (
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Featured Project
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-1">
                Project Serrano
              </h2>
            </div>

            <Badge variant="secondary" className="hidden sm:flex">
              In Development
            </Badge>
          </div>

          <Card className="relative overflow-hidden rounded-3xl border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background shadow-sm">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.12),transparent_40%)]" />

            <CardContent className="relative p-6 sm:p-8 lg:p-10">
              <div className="grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 items-end">
                <div className="space-y-7">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge>ROBLOX</Badge>
                      <Badge variant="outline">In Development</Badge>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                        {featuredProject.name}
                      </h3>

                      <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                        {featuredProject.notes}
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border bg-background/60 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Gamepad2 className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">
                          Platform
                        </span>
                      </div>
                      <p className="font-semibold">{featuredProject.game}</p>
                    </div>

                    <div className="rounded-xl border bg-background/60 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">
                          Location
                        </span>
                      </div>
                      <p className="font-semibold">
                        {featuredProject.location}
                      </p>
                    </div>

                    <div className="rounded-xl border bg-background/60 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">
                          Project Manager
                        </span>
                      </div>
                      <p className="font-semibold">
                        {featuredProject.projectManager}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex lg:justify-end">
                  <div className="rounded-2xl border bg-background/70 px-5 py-4 min-w-[190px]">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Development Status
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                      <span className="font-semibold">In Development</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Active Projects */}
      <section className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Current Projects
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-1">
            Active Development
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {activeProjects.map((project) => (
            <Card
              key={project.name}
              className="group rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {project.location}
                    </CardDescription>
                  </div>

                  <Badge>{project.game}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {project.notes}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{project.projectManager}</span>
                  </div>

                  <Badge variant="outline" className="gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Archive */}
      {discontinuedProjects.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-lg border p-2">
              <Archive className="w-4 h-4 text-muted-foreground" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Studio Archive
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-1">
                Discontinued Projects
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Projects that are no longer actively developed or maintained
                by RIVET Studios.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {discontinuedProjects.map((project) => (
              <Card
                key={project.name}
                className="rounded-2xl border-dashed opacity-75 transition-all duration-200 hover:opacity-100"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {project.location}
                      </CardDescription>
                    </div>

                    <Badge variant="outline" className="shrink-0">
                      {project.game}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="rounded-xl bg-muted/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                      Discontinuation Reason
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {project.notes}
                    </p>
                  </div>

                  <Badge variant="secondary" className="gap-1.5">
                    <Archive className="w-3.5 h-3.5" />
                    Discontinued
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="pt-2">
        <Card className="rounded-2xl overflow-hidden border-primary/15 bg-primary/[0.03]">
          <CardContent className="p-7 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <CalendarDays className="w-4 h-4" />
                  RIVET Studios
                </div>

                <h3 className="text-xl sm:text-2xl font-bold">
                  More projects are on the way.
                </h3>

                <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                  Our portfolio continues to evolve as we develop new
                  experiences, improve existing projects, and explore new
                  ideas.
                </p>
              </div>

              <ArrowRight className="hidden sm:block w-6 h-6 text-muted-foreground shrink-0" />
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}