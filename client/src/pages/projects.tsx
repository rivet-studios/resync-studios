import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Gamepad2 } from "lucide-react";

const RS_PROJECTS = [
  {
    name: "Los Angeles, California: Reimagined",
    projectManager: "Project Manager: cxiqlne",
    game: "ROBLOX",
    status: "active",
    location: "Los Angeles, CA",
  },
  {
    name: "Sandy Shores / Project Sandy",
    projectManager: "Project Manager: cxiqlne, silentdirective.",
    game: "ROBLOX",
    status: "active",
    location: "San Andreas",
  },
  {
    name: "Perris, California: Reimagined",
    projectManager: "Project Manager: cxiqlne, silentdirective.",
    game: "ROBLOX",
    status: "discontinued",
    location: "Perris, CA",
    reasonfordiscontinuation:
      "Reason for Discontinuation: The project was discontinued after multiple development complications and unsupported systems.",
  },
  {
    name: "Fort Loredo: Reimagined",
    projectManager: "Project Manager: cxiqlne",
    game: "ROBLOX",
    status: "development",
    location: "Loredo, TX",
  },
  {
    name: "Project Catalina",
    projectManager: "Project Manager: cxiqlne, silentdirective.",
    game: "ROBLOX",
    status: "development",
    location: "Catalina Islands, California",
  },
  {
    name: "The Highville Project",
    projectManager: "Project Manager: cxiqlne",
    game: "ROBLOX",
    status: "discontinued",
    location: "Highfield",
    reasonfordiscontinuation:
      "Reason for Discontinuation: The project did not receive enough player interest and was ultimately replaced with a new project.",
  },
  {
    name: "Australian Defence Force Academy",
    projectManager: "Project Manager: cxiqlne, Reni",
    game: "ROBLOX",
    status: "discontinued",
    location: "Australia",
    reasonfordiscontinuation:
      "Reason for Discontinuation: While ADFA was intended to be successful, it proved unreliable overtime due to many factors.",
  },
  {
    name: "State of Bartow",
    projectManager: "Project Manager: cxiqlne, LA5TIC",
    game: "ROBLOX",
    status: "discontinued",
    location: "Bartow, FL",
    reasonfordiscontinuation:
      "Reason for Discontinuation: State of Bartow was discontinued after former leadership was found in violation of local law and the project was proving to be a liability to Rivet Studios.",
  },
  {
    name: "State of Florida, Miami Dade County",
    projectManager: "Project Manager: cxiqlne, LA5TIC",
    game: "ROBLOX",
    status: "discontinued",
    location: "Miami, FL",
    reasonfordiscontinuation:
      "Reason for Discontinuation: The project was taken down permanently due to leadership complications.",
  },
  {
    name: "San Ramon, California",
    projectManager: "Project Manager: cxiqlne",
    game: "ROBLOX",
    status: "development",
    location: "San Ramon, CA",
  },
  {
    name: "DarkModRP Systems",
    projectManager: "Project Manager: cxiqlne",
    game: "FiveM",
    status: "development",
    location: "Experimental",
  },
  {
    name: "gMod / Garry's Mod",
    projectManager: "Project Manager: cxiqlne",
    game: "FiveM",
    status: "development",
    location: "Experimental",
  },
  {
    name: "RMB Integration",
    projectManager: "Project Manager: cxiqlne",
    game: "ROBLOX",
    status: "development",
    location: "Experimental, Raw Media Bodycams",
  },
  {
    name: "Victoria State Roleplay, Australia",
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
    <div className="space-y-8 max-w-5xl">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mx-auto gap-2">
          <Gamepad2 className="w-3.5 h-3.5" />
          Our Work
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          RIVET Studios Projects
        </h1>
        <p className="text-lg text-muted-foreground">
          Explore all of our active projects, experimental systems, and creative
          endeavors across multiple platforms.
        </p>
      </div>

      {/* Active Projects */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold mb-4">Active Projects</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activeProjects.map((project) => (
              <Card key={project.name} className="hover-elevate">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardTitle className="text-lg">
                        {project.projectOverseer}
                      </CardTitle>
                      <CardTitle className="text-lg">
                        {project.projectManager}
                      </CardTitle>
                      <CardDescription>{project.location}</CardDescription>
                    </div>
                    <Badge>{project.game}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="default">Active</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Development Projects */}
      {devProjects.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-4">In Development</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {devProjects.map((project) => (
                <Card key={project.name} className="hover-elevate opacity-75">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <CardTitle className="text-lg">
                          {project.name}
                        </CardTitle>
                        <CardTitle className="text-lg">
                          {project.projectOverseer}
                        </CardTitle>
                        <CardTitle className="text-lg">
                          {project.projectManager}
                        </CardTitle>
                        <CardDescription>{project.location}</CardDescription>
                      </div>
                      <Badge variant="secondary">{project.game}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline">Development</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Discontinued Projects */}
      {discontinuedProjects.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-4">Discontinued</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {discontinuedProjects.map((project) => (
                <Card key={project.name} className="opacity-50">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <CardTitle className="text-lg">
                          {project.name}
                        </CardTitle>
                        <CardTitle className="text-lg">
                          {project.projectOverseer}
                        </CardTitle>
                        <CardTitle className="text-lg">
                          {project.projectManager}
                        </CardTitle>
                        <CardDescription>{project.location}</CardDescription>
                        <CardDescription>
                          {project.reasonfordiscontinuation}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{project.game}</Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      <Card className="bg-gradient-to-r from-primary/10 to-chart-3/10 border-primary/20">
        <CardContent className="p-6">
          <p className="text-center">
            RIVET Studios is constantly innovating and creating immersive
            roleplaying experiences. From detailed city simulations to
            experimental game mechanics, we push the boundaries of what's
            possible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
