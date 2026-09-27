import { Badge } from "@/components/ui/badge";
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
    image: "/images/projects/sundown.jpg",
  },
  {
    name: "Project Serrano",
    projectManager: "Isaac C.",
    game: "ROBLOX",
    status: "development",
    location: "Serrano County, Rosewood",
    notes:
      "Our flagship roleplay experience, inspired by Project Ventura and Once Upon a Time in Rosewood.",
    image: "/images/projects/serrano.jpg",
  },
  {
    name: "Fort Loredo: Reimagined",
    projectManager: "Isaac C.",
    game: "ROBLOX",
    status: "discontinued",
    location: "Loredo, TX",
    notes:
      "The project was discontinued after it was determined that the game did not meet studio standards and was not suitable for further adjustment. The game was originally acquired from Mountain Interactive.",
    image: "/images/projects/loredo.jpg",
  },
  {
    name: "Los Angeles, California: Reimagined",
    projectManager: "Isaac C.",
    game: "ROBLOX",
    status: "discontinued",
    location: "Los Angeles, CA",
    notes:
      "The project was deprecated after becoming inconsistent for our development team and increasingly unstable.",
    image: "/images/projects/los-angeles.jpg",
  },
];

const featuredProject = RS_PROJECTS.find(
  (project) => project.name === "Project Serrano",
);

const activeProjects = RS_PROJECTS.filter(
  (project) =>
    project.status === "active" && project.name !== featuredProject?.name,
);

const discontinuedProjects = RS_PROJECTS.filter(
  (project) => project.status === "discontinued",
);

export default function Projects() {
  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Header */}
        <section className="mb-10 sm:mb-14">
          <div className="space-y-3">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight leading-[0.9]">
              OUR GAMES
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
              Games, experiences, and projects developed, maintained, and
              archived by RIVET Studios™.
            </p>
          </div>
        </section>

        {/* Featured Project */}
        {featuredProject && (
          <section className="mb-12 sm:mb-16">
            <article className="group relative overflow-hidden rounded-2xl border bg-background min-h-[480px] sm:min-h-[560px] lg:min-h-[620px]">
              {/* Background image */}
              <img
                src={featuredProject.image}
                alt={featuredProject.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
              />

              {/* Image treatment */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/5" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />

              {/* Content */}
              <div className="relative z-10 flex min-h-[480px] sm:min-h-[560px] lg:min-h-[620px] flex-col justify-end p-6 sm:p-8 lg:p-10">
                <div className="max-w-4xl">
                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge className="bg-white text-black hover:bg-white">
                      {featuredProject.game}
                    </Badge>

                    <Badge
                      variant="secondary"
                      className="bg-white/10 text-white border-white/10 backdrop-blur-sm"
                    >
                      IN DEVELOPMENT
                    </Badge>

                    <span className="text-xs sm:text-sm text-white/60 uppercase tracking-wide">
                      2026
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold uppercase tracking-tight text-white leading-[0.9]">
                    {featuredProject.name}
                  </h2>

                  {/* Description */}
                  <p className="mt-5 text-sm sm:text-base lg:text-lg text-white/75 max-w-2xl leading-relaxed">
                    {featuredProject.notes}
                  </p>

                  {/* Project information */}
                  <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs sm:text-sm text-white/60">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{featuredProject.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{featuredProject.projectManager}</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </section>
        )}

        {/* Current Projects */}
        <section className="mb-16 sm:mb-20">
          <div className="mb-6 sm:mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              STUDIO PORTFOLIO
            </p>

            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight mt-2">
              Current Titles
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
            {activeProjects.map((project) => (
              <article
                key={project.name}
                className="group overflow-hidden rounded-xl border bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                  <div className="absolute left-4 bottom-4 flex flex-wrap gap-2">
                    <Badge className="bg-white text-black hover:bg-white">
                      {project.game}
                    </Badge>

                    <Badge
                      variant="secondary"
                      className="bg-black/50 text-white border-white/10 backdrop-blur-sm"
                    >
                      ACTIVE
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6">
                  <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight">
                    {project.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{project.location}</span>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                    {project.notes}
                  </p>

                  <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      <span>{project.projectManager}</span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* If there are no secondary active projects */}
          {activeProjects.length === 0 && (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <Gamepad2 className="w-6 h-6 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No additional active titles are currently listed.
              </p>
            </div>
          )}
        </section>

        {/* Archive */}
        {discontinuedProjects.length > 0 && (
          <section className="mb-12 sm:mb-16">
            <div className="mb-6 sm:mb-8 flex items-start gap-3">
              <Archive className="w-5 h-5 mt-1 text-muted-foreground" />

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  STUDIO ARCHIVE
                </p>

                <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight mt-2">
                  Discontinued Titles
                </h2>

                <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                  Titles that are no longer actively developed or maintained
                  by RIVET Studios™.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {discontinuedProjects.map((project) => (
                <article
                  key={project.name}
                  className="group overflow-hidden rounded-xl border bg-muted/10 opacity-80 hover:opacity-100 transition-opacity duration-300"
                >
                  <div className="relative aspect-[16/8] overflow-hidden bg-muted">
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                    />

                    <div className="absolute inset-0 bg-black/45" />

                    <div className="absolute left-4 bottom-4 flex gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-black/60 text-white border-white/10 backdrop-blur-sm"
                      >
                        {project.game}
                      </Badge>

                      <Badge
                        variant="secondary"
                        className="bg-black/60 text-white border-white/10 backdrop-blur-sm"
                      >
                        DISCONTINUED
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight">
                      {project.name}
                    </h3>

                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{project.location}</span>
                    </div>

                    <div className="mt-4 rounded-lg bg-muted/50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                        Discontinuation Reason
                      </p>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {project.notes}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Bottom statement */}
        <section className="border-t pt-8 sm:pt-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <CalendarDays className="w-4 h-4" />
                RIVET Studios™
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight mt-3">
                More games are on the way.
              </h3>

              <p className="text-sm text-muted-foreground max-w-xl mt-2 leading-relaxed">
                Our portfolio continues to evolve as we develop new
                experiences, improve existing projects, and explore new ideas.
              </p>
            </div>

            <ArrowRight className="hidden sm:block w-6 h-6 text-muted-foreground" />
          </div>
        </section>
      </div>
    </main>
  );
}