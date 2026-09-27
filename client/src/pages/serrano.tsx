import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Car,
  CheckCircle2,
  Clock3,
  Flame,
  Gavel,
  HeartPulse,
  Landmark,
  MapPin,
  Radio,
  Shield,
  TrainFront,
  Users,
  Zap,
} from "lucide-react";

type Department = {
  name: string;
  status: string;
  statusVariant?: "default" | "secondary" | "outline" | "destructive";
  description: string;
  icon?: typeof Shield;
  details?: string[];
  highlight?: string;
};

function DepartmentCard({
  department,
}: {
  department: Department;
}) {
  const Icon = department.icon || Building2;

  return (
    <Card className="group overflow-hidden border-border/60 bg-card/70 transition-all duration-200 hover:border-primary/30 hover:bg-card hover:shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/30 transition-colors group-hover:border-primary/20 group-hover:bg-primary/[0.06]">
              <Icon className="h-4.5 w-4.5 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>

            <div className="min-w-0">
              <CardTitle className="text-base leading-6">
                {department.name}
              </CardTitle>

              {department.highlight && (
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {department.highlight}
                </p>
              )}
            </div>
          </div>

          <Badge
            variant={department.statusVariant || "outline"}
            className="shrink-0 text-[10px] uppercase tracking-wider"
          >
            {department.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm leading-6 text-muted-foreground">
          {department.description}
        </p>

        {department.details && department.details.length > 0 && (
          <div className="space-y-2 rounded-lg border border-border/50 bg-muted/[0.12] p-3">
            {department.details.map((detail) => (
              <div
                key={detail}
                className="flex items-start gap-2 text-xs text-muted-foreground"
              >
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
                <span>{detail}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: typeof Shield;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.07]">
        <Icon className="h-5 w-5 text-primary" />
      </div>

      <div>
        <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>

        <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
          {title}
        </h2>

        {description && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Serrano() {
  const lawEnforcement: Department[] = [
    {
      name: "Rosewood Highway Patrol",
      status: "Whitelisted",
      statusVariant: "secondary",
      icon: Shield,
      highlight: "250 XP requirement",
      description:
        "RHP will have one station. You will spawn at the main station, but can refill fuel, ammo, and other items at any department.",
      details: [
        "Main RHP station does not have a jail.",
        "Inmates must be transported to the Serrano County Jail for booking.",
        "Minimum XP required to access this team: 250.",
      ],
    },
    {
      name: "Serrano County Sheriff's Department",
      status: "Open",
      statusVariant: "outline",
      icon: Gavel,
      description:
        "Two main stations serving county law enforcement needs throughout Serrano County.",
    },
    {
      name: "Florence City Police Department",
      status: "Whitelisted",
      statusVariant: "secondary",
      icon: Radio,
      highlight: "Playtime requirement",
      description:
        "One main station serving as the primary city law enforcement authority within Florence.",
    },
    {
      name: "Port Authority Police Department",
      status: "Premium",
      statusVariant: "secondary",
      icon: TrainFront,
      description:
        "One main station handling incidents involving locomotives, railcars, tracks, and the entirety of Port of Florence.",
    },
  ];

  const emergencyServices: Department[] = [
    {
      name: "Rosewood State University, Department of Health (RSU)",
      status: "Open",
      statusVariant: "outline",
      icon: HeartPulse,
      description:
        "Two hospitals covering county medical services and emergency response.",
      details: [
        "Florence Memorial Community Hospital",
        "Westbrook Regional Medical Center",
      ],
    },
    {
      name: "Florence City Fire Department & Serrano County Fire Agency",
      status: "Open",
      statusVariant: "secondary",
      icon: Flame,
      highlight: "FCFD & SCFA",
      description:
        "City and county-level fire services and rescue operations.",
      details: [
        "Station 128 — Florence City Fire Department",
        "Station 135 — Serrano County Fire Agency",
      ],
    },
  ];

  const stateDepartments: Department[] = [
    {
      name: "Rosewood Department of Corrections",
      status: "Merged w/ SCSD",
      statusVariant: "secondary",
      icon: Landmark,
      description:
        "Tasked with picking up and transporting incarcerated inmates from select detention centers to the primary jail facility.",
    },
    {
      name: "Rosewood Bureau of Investigation (SBI)",
      status: "Whitelisted",
      statusVariant: "outline",
      icon: Gavel,
      highlight: "XP requirements",
      description:
        "A statewide investigation agency tasked with investigating capital and felony crimes.",
      details: [
        "No authority over civilians unless involved with a capital or felony crime.",
        "Authority over law enforcement, fire, and EMS agencies.",
        "May cite or arrest LEO, FD, and EMS regardless of crime committed or offense level.",
      ],
    },
    {
      name: "Public Transport Serrano (PT-S)",
      status: "Premium",
      statusVariant: "secondary",
      icon: TrainFront,
      description:
        "Tasked with maintaining roads, infrastructure, and public transportation throughout Serrano.",
      details: [
        "Fixing potholes on freeways and roadways",
        "Changing traffic patterns and signals",
        "Changing road signs",
        "Providing public transport",
      ],
    },
  ];

  const privateCompanies: Department[] = [
    {
      name: "Serrano Asset Protection (SAP)",
      status: "Open",
      statusVariant: "outline",
      icon: Shield,
      description:
        "Private security services for businesses and clients throughout Serrano County, Rosewood.",
      highlight: "Private Security",
    },
    {
      name: "Silent Precision Firearms",
      status: "Open",
      statusVariant: "secondary",
      icon: Zap,
      description:
        "A private firearms business responsible for selling firearms and melee weapons, handling firearm licensing, and related services.",
      highlight: "Firearms & Licensing",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Hero */}
        <header className="relative mb-8 overflow-hidden rounded-2xl border border-border/60 bg-card">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.1] via-transparent to-transparent" />

          <div className="absolute right-0 top-0 hidden h-full w-1/3 opacity-[0.035] lg:block">
            <MapPin className="absolute -right-12 -top-16 h-96 w-96" />
          </div>

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="gap-1.5 border-primary/20 bg-primary/5 text-primary"
              >
                <MapPin className="h-3.5 w-3.5" />
                New Title
              </Badge>

              <Badge
                variant="outline"
                className="gap-1.5 text-muted-foreground"
              >
                <Clock3 className="h-3.5 w-3.5" />
                In Development
              </Badge>
            </div>

            <div className="max-w-3xl">
              <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                RIVET STUDIOS™ / PROJECT
              </p>

              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Project Serrano
              </h1>

              <p className="mt-3 text-base font-medium text-muted-foreground sm:text-lg">
                New County RP Project
              </p>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                An original RIVET Studios title inspired by the Project Ventura
                concept, built around serious roleplay, structured departments,
                and a community-focused experience.
              </p>
            </div>

            <div className="mt-8 grid gap-3 border-t border-border/50 pt-6 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/30">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Departments</p>
                  <p className="text-[11px] text-muted-foreground">
                    Multiple career paths
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/30">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Community RP</p>
                  <p className="text-[11px] text-muted-foreground">
                    Built around player interaction
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/30">
                  <Car className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold">County Setting</p>
                  <p className="text-[11px] text-muted-foreground">
                    City, county & state services
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Overview */}
        <Card className="mb-12 overflow-hidden border-primary/20 bg-primary/[0.025]">
          <CardContent className="p-0">
            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:p-7">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="mb-2 font-semibold">About Project Serrano</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Many have questions about Project Serrano and hopefully this
                  should show where development stands and what the community
                  is wanting to see. We will discuss features that Project
                  Serrano will have, along with planned features. We will also
                  discuss what perks donators will have.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Titles */}
        <section className="mb-12">
          <SectionHeader
            icon={Landmark}
            eyebrow="Development"
            title="Upcoming Titles"
            description="Current RIVET Studios projects and development status."
          />

          <Card className="group overflow-hidden border-border/60 transition-all hover:border-primary/30">
            <CardContent className="p-0">
              <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.07]">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">Project Rosewood</h3>
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase tracking-wider"
                    >
                      In Development
                    </Badge>
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">
                    New County RP Project in the works with comprehensive
                    department structure, realistic roleplay systems, and
                    community-focused gameplay.
                  </p>
                </div>

                <ArrowRight className="hidden h-5 w-5 text-muted-foreground/50 transition-transform group-hover:translate-x-1 sm:block" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Law Enforcement */}
        <section className="mb-12">
          <SectionHeader
            icon={Shield}
            eyebrow="Public Safety"
            title="Law Enforcement Departments"
            description="City, county, highway, and port authority law enforcement services."
          />

          <div className="grid gap-4 md:grid-cols-2">
            {lawEnforcement.map((department) => (
              <DepartmentCard
                key={department.name}
                department={department}
              />
            ))}
          </div>
        </section>

        {/* Fire & Medical */}
        <section className="mb-12">
          <SectionHeader
            icon={HeartPulse}
            eyebrow="Emergency Services"
            title="Fire & Medical"
            description="Medical response, fire suppression, rescue, and emergency services."
          />

          <div className="grid gap-4 md:grid-cols-2">
            {emergencyServices.map((department) => (
              <DepartmentCard
                key={department.name}
                department={department}
              />
            ))}
          </div>
        </section>

        {/* State Departments */}
        <section className="mb-12">
          <SectionHeader
            icon={Landmark}
            eyebrow="State Services"
            title="State Departments"
            description="State-level agencies responsible for investigations, corrections, infrastructure, and transportation."
          />

          <div className="grid gap-4 md:grid-cols-2">
            {stateDepartments.map((department) => (
              <DepartmentCard
                key={department.name}
                department={department}
              />
            ))}
          </div>
        </section>

        {/* Private Companies */}
        <section className="mb-12">
          <SectionHeader
            icon={Building2}
            eyebrow="Private Sector"
            title="Private Companies"
            description="Player-facing businesses and private organizations operating within Serrano."
          />

          <div className="grid gap-4 md:grid-cols-2">
            {privateCompanies.map((department) => (
              <DepartmentCard
                key={department.name}
                department={department}
              />
            ))}
          </div>
        </section>

        {/* SAP Flavor Text */}
        <Card className="mb-12 overflow-hidden border-border/60 bg-muted/[0.08]">
          <CardContent className="p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                <Shield className="h-4 w-4 text-muted-foreground" />
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Serrano Asset Protection
                </p>

                <p className="text-sm italic leading-6 text-muted-foreground">
                  "The locals warned you.. Don't try it at the Target on 5th,
                  'The Saps' are heavy on the cameras today. But you didn't
                  listen.. and regretted it.."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Development Footer */}
        <Card className="overflow-hidden border-primary/20 bg-primary/[0.035]">
          <CardContent className="p-0">
            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-7">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>

              <div className="flex-1">
                <p className="font-semibold">Project Rosewood Development</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  More updates and features coming soon. Stay tuned for
                  announcements about department roles, gameplay mechanics,
                  and premium perks.
                </p>
              </div>

              <Badge
                variant="outline"
                className="w-fit border-primary/20 bg-primary/5 text-primary"
              >
                Development
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Footer Metadata */}
        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-border/50 pt-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              RIVET STUDIOS™
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Project Serrano • Official Project Information
            </p>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Information is subject to change during development.
          </p>
        </div>
      </div>
    </div>
  );
}