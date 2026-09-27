import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Crown,
  Shield,
  Headphones,
  Cpu,
  Trophy,
  Mail,
  CalendarDays,
  ArrowUpRight,
  BriefcaseBusiness,
} from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  contact?: string;
  joinDate: string;
  endDate?: string;
}

interface Department {
  name: string;
  contact?: string;
  icon: any;
  color: string;
  members: TeamMember[];
}

const departments: Department[] = [
  {
    name: "Executive Leadership",
    icon: Crown,
    color: "text-yellow-500",
    members: [
      {
        name: "Isaac C.",
        role: "Chief Executive Officer (CEO) & Founder",
        contact: "Contact: isaac@rivetstudiosus.com",
        joinDate: "2018–Present",
      },
      {
        name: "Quinn M. (silentdirective)",
        role: "Operations Manager & Co Founder",
        contact: "Contact: quinn@rivetstudiosus.com",
        joinDate: "2024–Present",
      },
    ],
  },
  {
    name: "Management",
    icon: Shield,
    color: "text-blue-500",
    members: [
      {
        name: "Chase K. (eranovuh)",
        role: "Operations Manager",
        contact: "Contact: chase@rivetstudiosus.com",
        joinDate: "2026–Present",
      },
      {
        name: "Timothy J. (XUSeriouslyYT)",
        role: "Staff Director",
        contact: "Contact: tim@rivetstudiosus.com",
        joinDate: "2026–Present",
      },
      {
        name: "Aidan (jst_basix)",
        role: "Operations Manager",
        contact: "Contact: aidan@rivetstudiosus.com",
        joinDate: "2026–Present",
      },
    ],
  },
  {
    name: "Customer Relations",
    contact: "Contact: support@rivetstudiosus.com",
    icon: Headphones,
    color: "text-green-500",
    members: [
      {
        name: "Quinn M. (silentdirective)",
        role: "Customer Relations & Partnership Support",
        joinDate: "2024–Present",
      },
      {
        name: "Isaac D.",
        role: "Customer Relations Lead",
        joinDate: "2018–Present",
      },
      {
        name: "Chase K. (eranovuh)",
        role: "Customer Relations",
        joinDate: "2026–Present",
      },
    ],
  },
  {
    name: "Engineering & Design",
    icon: Cpu,
    color: "text-purple-500",
    members: [
      {
        name: "Isaac D.",
        role: "Engineering Lead",
        joinDate: "2018–Present",
      },
      {
        name: "Quinn M. (silentdirective)",
        role: "Creative Designer",
        joinDate: "2024–Present",
      },
    ],
  },
  {
    name: "Alumni",
    icon: Trophy,
    color: "text-gray-500",
    members: [
      {
        name: "Alexx",
        role: "Trust & Safety Director",
        joinDate: "2023",
        endDate: "2025",
      },
      {
        name: "Iceberg1038",
        role: "Staff Department Director",
        joinDate: "2024",
        endDate: "2026",
      },
      {
        name: "Bobby283543",
        role: "Team Member",
        joinDate: "2025",
        endDate: "2026",
      },
      {
        name: "Reni",
        role: "Gameplay Engineer",
        joinDate: "2019",
        endDate: "2026",
      },
      {
        name: "WolfGaming_2025",
        role: "Operations Manager",
        joinDate: "2020",
        endDate: "2024",
      },
      {
        name: "tinyauthoritarian",
        role: "Team Member",
        joinDate: "2024",
        endDate: "2025",
      },
      {
        name: "Vision",
        role: "Staff Director",
        joinDate: "2024",
        endDate: "2026",
      },
    ],
  },
];

function getDepartmentLabel(department: Department) {
  if (department.name === "Alumni") return "Former team members";
  return `${department.members.length} ${
    department.members.length === 1 ? "member" : "members"
  }`;
}

function getTenureLabel(member: TeamMember) {
  return member.endDate
    ? `${member.joinDate} – ${member.endDate}`
    : member.joinDate;
}

export default function StaffDirectory() {
  const activeDepartments = departments.filter(
    (department) => department.name !== "Alumni",
  );
  const alumniDepartment = departments.find(
    (department) => department.name === "Alumni",
  );

  const activeMemberCount = activeDepartments.reduce(
    (total, department) => total + department.members.length,
    0,
  );

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="max-w-3xl space-y-5">
                <Badge
                  variant="outline"
                  className="gap-2 px-3 py-1 text-xs uppercase tracking-wider"
                >
                  <Users className="w-3.5 h-3.5" />
                  Corporate Directory
                </Badge>

                <div className="space-y-3">
                  <h1
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
                    data-testid="text-team-directory-title"
                  >
                    Meet the team behind RIVET.
                  </h1>

                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                    The people responsible for building, operating, and
                    supporting the RIVET Studios community and its projects.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 min-w-[260px]">
                <div className="rounded-xl border border-border/60 bg-background/50 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">
                      Team
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{activeMemberCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active directory entries
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-background/50 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <BriefcaseBusiness className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">
                      Departments
                    </span>
                  </div>
                  <p className="text-2xl font-bold">
                    {activeDepartments.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active departments
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Active Departments */}
        <div className="space-y-10">
          {activeDepartments.map((department) => {
            const DepartmentIcon = department.icon;

            return (
              <section key={department.name} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl border border-border/60 bg-card">
                      <DepartmentIcon
                        className={`w-5 h-5 ${department.color}`}
                      />
                    </div>

                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                        {department.name}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getDepartmentLabel(department)}
                      </p>
                    </div>
                  </div>

                  {department.contact && (
                    <a
                      href={`mailto:${department.contact.replace(
                        "Contact: ",
                        "",
                      )}`}
                      className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {department.contact}
                    </a>
                  )}
                </div>

                <div className="h-px bg-border/60" />

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {department.members.map((member, memberIndex) => (
                    <Card
                      key={`${department.name}-${member.name}-${memberIndex}`}
                      className="group relative overflow-hidden border-border/60 bg-card/70 transition-all duration-200 hover:border-border hover:bg-card"
                      data-testid={`card-team-member-${department.name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")}-${memberIndex}`}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/0 group-hover:bg-primary/60 transition-colors" />

                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <CardTitle className="text-base font-semibold leading-tight">
                              {member.name}
                            </CardTitle>
                            <CardDescription className="text-xs leading-relaxed mt-1.5">
                              {member.role}
                            </CardDescription>
                          </div>

                          <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-muted/70">
                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {member.contact && (
                          <a
                            href={`mailto:${member.contact.replace(
                              "Contact: ",
                              "",
                            )}`}
                            className="flex items-start gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span className="break-all">
                              {member.contact.replace("Contact: ", "")}
                            </span>
                          </a>
                        )}

                        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                          <CalendarDays className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground">
                            {getTenureLabel(member)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Alumni */}
        {alumniDepartment && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl border border-border/60 bg-card">
                  <Trophy className="w-5 h-5 text-muted-foreground" />
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {alumniDepartment.name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {getDepartmentLabel(alumniDepartment)}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px bg-border/60" />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {alumniDepartment.members.map((member, memberIndex) => (
                <Card
                  key={`alumni-${member.name}-${memberIndex}`}
                  className="border-border/50 bg-card/40 opacity-80 hover:opacity-100 transition-opacity"
                  data-testid={`card-alumni-${memberIndex}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="text-base font-semibold">
                          {member.name}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1.5">
                          {member.role}
                        </CardDescription>
                      </div>

                      <Badge
                        variant="outline"
                        className="text-[10px] shrink-0"
                      >
                        Alumni
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                      <span>{getTenureLabel(member)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Careers CTA */}
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />

          <CardContent className="relative p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <Badge variant="outline" className="gap-2">
                  <BriefcaseBusiness className="w-3.5 h-3.5" />
                  Careers
                </Badge>

                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Build with RIVET.
                </h2>

                <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  Interested in joining our team? Explore current
                  opportunities and learn more about working with RIVET
                  Studios.
                </p>
              </div>

              <a
                href="https://x.com/rivetstudiosau/jobs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
              >
                View careers
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          <span>RIVET Studios corporate directory</span>
        </div>
      </div>
    </div>
  );
}