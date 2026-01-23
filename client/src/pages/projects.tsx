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
    status: "active",
    location: "Los Angeles, CA",
    notes:
      "Los Angeles, California: Reimagined™ is a temporary placeholder for Catalina™ until we're ready for release.",
  },
  {
    name: "Project Sundown",
    projectManager: "Project Manager: silentdirective.",
    game: "ROBLOX",
    status: "active",
    location: "External",
    notes:
      "Project Sundown is no longer owned under the company. A Team Member has taken ownership but RS still holds the license.",
    banner:
      "https://media.discordapp.net/attachments/1428251062078410845/1463818518255374398/RS-DOJ.png?ex=6974883b&is=697336bb&hm=80122861df33fa806aa288f57b59b5092fb2a75803a7c51b1b911efdfd626a80&=&format=webp&quality=lossless&width=1692&height=348",
  },
  {
    name: "Project Catalina",
    projectManager: "Project Manager: cxiqlne, silentdirective.",
    game: "ROBLOX",
    status: "development",
    location: "Catalina Islands, California",
    notes: "Project Catalina is the core focus for RIVET Studios.",
    banner:
      "https://media.discordapp.net/attachments/1428251062078410845/1463818773894266969/RS-CATALINA_1.png?ex=69748878&is=697336f8&hm=96470f949e15690ede51d09741675c03bd0cbf4589a428d719369b36e5e3f08e&=&format=webp&quality=lossless&width=1692&height=348",
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
    name: "State of Florida, Miami Dade County",
    projectManager: "Project Manager: cxiqlne, LA5TIC",
    game: "ROBLOX",
    status: "discontinued",
    location: "Miami, FL",
    notes: "Reason for Discontinuation: Project was scrapped",
  },
  {
    name: "San Ramon, California",
    projectManager: "Project Manager: cxiqlne",
    game: "ROBLOX",
    status: "discontinued",
    location: "San Ramon, CA",
    notes:
      "Reason for Discontinuation: Outdated systems provided complications",
  },
  {
    name: "Project Sydney",
    projectManager: "Project Manager: cxiqlne, Reni, silentdirective.",
    game: "ROBLOX",
    status: "development",
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

      {/* Featured Projects with Banners */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Featured Projects
        </h2>
        <div className="grid gap-6">
          {RS_PROJECTS.filter((p) => p.banner).map((project) => (
            <Card
              key={project.name}
              className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 group rounded-2xl"
            >
              <div className="aspect-[1692/348] w-full relative overflow-hidden bg-slate-100">
                <img
                  src={project.banner}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-6">
                  <div className="text-white space-y-1">
                    <Badge
                      variant="secondary"
                      className="bg-primary text-white border-none mb-2"
                    >
                      {project.status === "active" ? "PLAY NOW" : "COMING SOON"}
                    </Badge>
                    <h3 className="text-2xl font-bold">{project.name}</h3>
                    <p className="text-white/80 text-sm font-medium">
                      {project.location} • {project.game}
                    </p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 bg-card">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">
                      {project.projectManager}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium mb-3">
                      {project.notes}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {project.game} Engine
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Active Projects (Non-Banner) */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Active Projects</h2>
          <div className="grid gap-4">
            {activeProjects
              .filter((p) => !p.banner)
              .map((project) => (
                <Card key={project.name} className="hover-elevate rounded-2xl">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <CardTitle className="text-lg">
                          {project.name}
                        </CardTitle>
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
            {activeProjects.filter((p) => !p.banner).length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                All active projects featured above.
              </p>
            )}
          </div>
        </div>

        {/* Development Projects (Non-Banner) */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Coming Soon</h2>
          <div className="grid gap-4">
            {devProjects
              .filter((p) => !p.banner)
              .map((project) => (
                <Card
                  key={project.name}
                  className="hover-elevate opacity-90 rounded-2xl"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <CardTitle className="text-lg">
                          {project.name}
                        </CardTitle>
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

      <Card className="bg-primary/5 border-primary/20 rounded-3xl overflow-hidden">
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
