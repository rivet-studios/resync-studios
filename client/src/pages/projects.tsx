import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Gamepad2, Shield } from "lucide-react";

const RS_PROJECTS = [
  {
    name: "Los Angeles, California: Reimagined",
    projectManager: "Project Manager: cxiqlne",
    game: "ROBLOX",
    status: "discontinued",
    location: "Los Angeles, CA",
    notes:
      "Los Angeles, California: Reimagined™ was discontinued for the release of Rosewood.",
  },
  {
    name: "Project Rosewood",
    projectManager: "Project Manager: cxiqlne, silentdirective.",
    game: "ROBLOX",
    status: "development",
    location: "Rosewod County, California",
    notes:
      "Project Rosewood is our main flagship roleplay game based on the real-world location Rosewood County, California. Rosewood is expected to release within the next few months.",
  },
  {
    name: "Fort Loredo: Reimagined",
    projectManager: "Project Manager: cxiqlne",
    game: "ROBLOX",
    status: "discontinued",
    location: "Loredo, TX",
    notes:
      "Reason for Discontinuation: The project does not match RS themes and was inconsistent for theme adjustment. The project was originally accquired from Mountain Interactive",
  },
  {
    name: "Project Sydney",
    projectManager: "Project Manager: cxiqlne, Reni, silentdirective.",
    notes: "Notes: None were provided",
    game: "ROBLOX",
    status: "discontinued",
    location: "Victoria, AU",
  },
];

export default function Projects() {
  const activeProjects = RS_PROJECTS.filter((p) => p.status === "active");
  const devProjects = RS_PROJECTS.filter((p) => p.status === "development");
  const discontinuedProjects = RS_PROJECTS.filter(
    (p) => p.status === "discontinued",
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-8">
      <div className="text-center space-y-4">
        <Badge variant="outline" className="mx-auto gap-2 px-3 py-1">
          <Gamepad2 className="w-3.5 h-3.5" />
          Our Portfolio
        </Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
          RIVET Studios Projects
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore our diverse range of roleplay environments, specialized
          systems, and experimental platforms.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Active Projects (Non-Banner) */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Active Projects</h2>
          <div className="grid gap-4">
            {activeProjects.map((project) => (
              <Card key={project.name} className="hover-elevate rounded-2xl">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription>{project.location}</CardDescription>
                    </div>
                    <Badge>{project.game}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground font-medium mb-3">
                    {project.projectManager}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium mb-3">
                    {project.notes}
                  </p>
                  <Badge variant="default">Active</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Development Projects (Non-Banner) */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Coming Soon</h2>
          <div className="grid gap-4">
            {devProjects.map((project) => (
              <Card
                key={project.name}
                className="hover-elevate opacity-90 rounded-2xl"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription>{project.location}</CardDescription>
                    </div>
                    <Badge variant="secondary">{project.game}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground font-medium mb-3">
                    {project.projectManager}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium mb-3">
                    {project.notes}
                  </p>

                  <Badge variant="outline">Coming Soon</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Discontinued Projects */}
      {discontinuedProjects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Project Archive (Discontinued)</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {discontinuedProjects.map((project) => (
              <Card
                key={project.name}
                className="opacity-60 grayscale hover:grayscale-0 transition-all rounded-xl border-dashed"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                      {project.game}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                    {project.notes}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card className="bg-primary/5 border-primary/20 rounded-xl overflow-hidden">
        <CardContent className="p-10 text-center space-y-4">
          <h3 className="text-2xl font-bold">Innovation is in our DNA</h3>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            RIVET Studios is constantly innovating and creating immersive
            roleplaying experiences. From detailed city simulations to
            experimental game mechanics, we push the boundaries of what's
            possible in digital storytelling.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
