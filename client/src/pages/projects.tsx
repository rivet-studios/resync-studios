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
    projectManager: "cxiqlne",
    game: "ROBLOX",
    status: "active",
    location: "Los Angeles, CA",
  },
  {
    name: "Perris, California: Reimagined",
    projectManager: "cxiqlne, silentdirective.",
    game: "ROBLOX",
    status: "discontinued",
    location: "Perris, CA",
    reasonfordiscontinuation:
      "The project was discontinued after multiple development complications and unsupported systems.",
  },
  {
    name: "Fort Loredo: Reimagined",
    projectManager: "cxiqlne",
    game: "ROBLOX",
    status: "development",
    location: "Loredo, TX",
  },
  {
    name: "Project Foxtrot",
    projectManager: "cxiqlne, silentdirective.",
    game: "ROBLOX",
    status: "development",
    location: "Rosewood County, State of Foxtrot",
  },
  {
    name: "The Highville Project",
    projectOverseer: "cxiqlne",
    projectManager: "Reni",
    game: "ROBLOX",
    status: "active",
    location: "Highfield",
    reasonfordiscontinuation:
      "The project is no longer supported under Resync Studios ― formal ownership taken over by Reni",
  },
  {
    name: "Australian Defence Force Academy",
    projectManager: "cxiqlne, Reni",
    game: "ROBLOX",
    status: "discontinued",
    location: "Australia",
    reasonfordiscontinuation:
      "While ADFA was intended to be successful, it proved unreliable overtime due to many factors.",
  },
  {
    name: "State of Bartow",
    projectManager: "cxiqlne, LA5TIC",
    game: "ROBLOX",
    status: "discontinued",
    location: "Bartow, FL",
    reasonfordiscontinuation:
      "State of Bartow was discontinued after former leadership was found in violation of local law and the project was proving to be a liability to Resync Studios.",
  },
  {
    name: "State of Florida, Miami Dade County",
    projectManager: "cxiqlne, LA5TIC",
    game: "ROBLOX",
    status: "discontinued",
    location: "Miami, FL",
    reasonfordiscontinuation:
      "The project was taken down permanently due to leadership complications.",
  },
  {
    name: "San Ramon, California",
    projectManager: "cxiqlne",
    game: "ROBLOX",
    status: "development",
    location: "San Ramon, CA",
  },
  {
    name: "DarkModRP Systems",
    projectManager: "cxiqlne",
    game: "FiveM",
    status: "development",
    location: "Experimental",
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
          RESYNC Studios Projects
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
                      </div>
                      <Badge variant="outline">{project.game}</Badge>
                      <Badge variant="outline">
                        {project.reasonfordiscontinuation}
                      </Badge>
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
            RESYNC Studios is constantly innovating and creating immersive
            roleplaying experiences. From detailed city simulations to
            experimental game mechanics, we push the boundaries of what's
            possible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
