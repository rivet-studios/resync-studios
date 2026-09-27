import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PolicyWrapper } from "@/components/policy-wrapper";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  Gavel,
  HeartPulse,
  Shield,
  Skull,
  Users,
  Zap,
} from "lucide-react";

type Rule = {
  title: string;
  description: string;
  severity?: "standard" | "serious" | "critical";
};

type RuleSection = {
  number: string;
  title: string;
  description: string;
  icon: typeof Gavel;
  rules: Rule[];
};

const ruleSections: RuleSection[] = [
  {
    number: "I",
    title: "General Roleplay Rules & Player Guidelines",
    description:
      "Core standards governing player conduct, immersion, and roleplay quality.",
    icon: Gavel,
    rules: [
      {
        title: "Serious Roleplay Standard",
        description:
          "All actions must be grounded in realism. Low-quality RP (killing without reason, VDM, cop baiting, trolling, non-serious dialogue, meme behavior) is prohibited. Violations result in warnings, kicks, or bans depending on severity.",
        severity: "serious",
      },
      {
        title: "Staying In Character (IC)",
        description:
          "You must remain in-character at all times. Finish the RP scene even if a rule is broken and report it afterward through proper channels. Breaking character prematurely results in warnings, kicks, or temporary bans.",
      },
      {
        title: "Metagaming (MG)",
        description:
          "Using OOC (Out-of-Character) information such as streams, Discord, or other external sources to influence your IC decisions is strictly forbidden. This can result in severe punishments including permanent bans.",
        severity: "critical",
      },
      {
        title: "Powergaming (PG)",
        description:
          "Forcing actions on others without giving them a chance to respond or performing unrealistic/impossible actions is not allowed. All roleplay must allow for player interaction and realistic outcomes.",
        severity: "serious",
      },
      {
        title: "Combat Logging",
        description:
          "Leaving the game or disconnecting to avoid RP, arrest, injury, or consequences is strictly prohibited. Violations result in temporary bans of up to 10 days.",
        severity: "serious",
      },
      {
        title: "Fail RP (FRP)",
        description:
          "Actions that break immersion or make no sense are considered Fail RP (e.g., ignoring major injuries, unrealistic escapes). Violations result in warnings, kicks, or temporary bans.",
      },
      {
        title: "Exploiting & Glitch Abuse",
        description:
          "Using bugs, exploits, or third-party mods for an advantage is not allowed and must be reported immediately. Exploitation results in permanent bans.",
        severity: "critical",
      },
      {
        title: "Fear RP (FRP)",
        description:
          "You must realistically fear for your life in threatening situations. For example, you must comply when at gunpoint unless you have a reasonable IC justification to do otherwise. Violation results in warnings or kicks.",
      },
      {
        title: "Random/Unrealistic Acts",
        description:
          'Committing serious crimes without motive or build-up ("chaos RP") is prohibited. All actions need a logical IC reason and progression. Mass casualty acts result in permanent bans.',
        severity: "critical",
      },
      {
        title: "Stream Sniping",
        description:
          "Using a live stream to gain an advantage over another player is strictly prohibited and results in immediate permanent bans.",
        severity: "critical",
      },
      {
        title: "OOC Drama & Harassment",
        description:
          "OOC drama, harassment, toxicity, and personal conflicts are prohibited on all platforms. Violations result in temporary or permanent bans depending on severity.",
        severity: "serious",
      },
    ],
  },
  {
    number: "II",
    title: "Character Requirements",
    description:
      "Requirements for creating and maintaining believable, consistent characters.",
    icon: Users,
    rules: [
      {
        title: "Age Requirement",
        description:
          "All players must be 13+ years old with prior serious RP experience. Lying about your age results in permanent bans from all RIVET Studios games.",
        severity: "critical",
      },
      {
        title: "Realistic Names",
        description:
          'Characters must have a realistic "First Last" name. Meme names, pop culture references, or offensive names are prohibited.',
      },
      {
        title: "Character Backgrounds",
        description:
          "Characters must have a plausible and consistent backstory. Overpowered or unrealistic backgrounds are not allowed without explicit staff approval.",
      },
      {
        title: "Multiple Characters",
        description:
          "Each character must be unique. You cannot transfer items, knowledge, or use alternate characters to avoid consequences. Violations result in permanent bans on all accounts.",
        severity: "critical",
      },
      {
        title: "Perma-Death Rule",
        description:
          "If a character dies in a confirmed perma-death scenario, they cannot return. Bypassing this rule results in temporary or permanent bans depending on severity.",
        severity: "serious",
      },
    ],
  },
  {
    number: "III",
    title: "Law Enforcement Rules & Standards",
    description:
      "Standards governing LEO conduct, authority, use of force, and departmental responsibilities.",
    icon: Shield,
    rules: [
      {
        title: "Professionalism & Abuse of Power",
        description:
          "LEOs must maintain the highest level of professionalism. Using your LEO position for harassment, personal gain, or unfair advantage results in temporary bans + LEO blacklist or permanent bans + permanent LEO blacklist.",
        severity: "critical",
      },
      {
        title: "Probable Cause Requirement",
        description:
          "All arrests must be based on valid, verifiable IC probable cause. Arresting without cause is abuse of authority and results in temporary bans + LEO blacklist.",
        severity: "serious",
      },
      {
        title: "Proportional Use of Force",
        description:
          "Force must be proportional to the threat. Lethal force is only justified when there is a direct and immediate threat to human life. Excessive force results in retraining, 7-30 day LEO blacklist, or permanent LEO blacklist.",
        severity: "critical",
      },
      {
        title: "Dead Checking & Execution-Style Acts Prohibited",
        description:
          "Firing on or striking a downed, incapacitated, or restrained suspect is forbidden. Harming a compliant or restrained suspect results in permanent removal from LEO roles and community bans.",
        severity: "critical",
      },
      {
        title: "Corruption RP Approval Required",
        description:
          "All corruption RP (bribes, planting evidence) must be pre-approved by a Corporate Member. Unauthorized corruption results in permanent bans + permanent LEO blacklist.",
        severity: "critical",
      },
      {
        title: "Duty to Intervene",
        description:
          "Officers must stop and report clear excessive force used by another officer. Failure to do so is considered misconduct.",
        severity: "serious",
      },
    ],
  },
  {
    number: "IV",
    title: "Emergency Services Rules & Standards",
    description:
      "Operational standards for EMS and Fire personnel during emergency scenes.",
    icon: HeartPulse,
    rules: [
      {
        title: "Role Responsibilities",
        description:
          "EMS handles medical; Fire handles fires/rescues. Neither role may act as law enforcement (no arrests, searches, etc.). Violations result in warnings, temporary bans, and role blacklists.",
      },
      {
        title: "Scene Safety",
        description:
          'EMS/Fire must wait for law enforcement to declare a scene "safe" before entering active crime scenes.',
        severity: "serious",
      },
      {
        title: "Neutrality in Criminal Situations",
        description:
          "EMS and Fire must remain neutral parties in criminal situations, providing aid to anyone regardless of their role or criminal status.",
      },
      {
        title: "Realistic Medical Treatment",
        description:
          'All medical care must be fully and realistically roleplayed. "One-line revives" or unrealistic treatment is prohibited.',
      },
    ],
  },
  {
    number: "V",
    title: "Criminal Roleplay Rules & Standards",
    description:
      "Rules governing criminal activity, escalation, hostages, and high-risk scenarios.",
    icon: Skull,
    rules: [
      {
        title: "Realistic Crime RP",
        description:
          'All criminal acts must be plausible, well-planned, and have a clear IC motive. "Chaos for chaos\'s sake" is not allowed. Violations result in warnings or temporary bans.',
      },
      {
        title: "New Life Rule (NLR) & Revenge",
        description:
          "After death, you cannot return to the same scene or retaliate against your killer. This prevents revenge cycles and ensures roleplay progression. Violations result in warnings, kicks, or temporary bans.",
        severity: "serious",
      },
      {
        title: "Hostage & Robbery Rules",
        description:
          "Hostages must be treated realistically. Demands must be reasonable. Killing hostages without a strong IC reason is prohibited.",
        severity: "serious",
      },
      {
        title: "Explosives & Heavy Weapons Prohibited",
        description:
          "Use of explosives or heavy weapons is strictly forbidden unless part of a staff-approved event. Unauthorized use results in permanent bans.",
        severity: "critical",
      },
    ],
  },
];

function SeverityBadge({
  severity = "standard",
}: {
  severity?: Rule["severity"];
}) {
  if (severity === "critical") {
    return (
      <Badge
        variant="outline"
        className="border-destructive/30 bg-destructive/10 text-destructive text-[10px] uppercase tracking-wider"
      >
        Critical
      </Badge>
    );
  }

  if (severity === "serious") {
    return (
      <Badge
        variant="outline"
        className="border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] uppercase tracking-wider"
      >
        Serious
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="text-[10px] uppercase tracking-wider text-muted-foreground"
    >
      Standard
    </Badge>
  );
}

function RuleCard({
  rule,
  index,
}: {
  rule: Rule;
  index: number;
}) {
  return (
    <Card className="group relative overflow-hidden border-border/60 bg-card/70 transition-all duration-200 hover:border-primary/30 hover:bg-card hover:shadow-sm">
      <div className="absolute left-0 top-0 h-full w-0.5 bg-border transition-colors group-hover:bg-primary/60" />

      <CardHeader className="pb-3 pl-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 font-mono text-[11px] font-semibold text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="min-w-0">
              <CardTitle className="text-base leading-6">
                {rule.title}
              </CardTitle>
            </div>
          </div>

          <SeverityBadge severity={rule.severity} />
        </div>
      </CardHeader>

      <CardContent className="pl-6 pt-0">
        <p className="text-sm leading-6 text-muted-foreground">
          {rule.description}
        </p>
      </CardContent>
    </Card>
  );
}

export default function ProjectSerranorules() {
  return (
    <PolicyWrapper slug="project-serrano-rules">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
          {/* Header */}
          <header className="relative mb-10 overflow-hidden rounded-2xl border border-border/60 bg-card">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-transparent" />

            <div className="relative p-6 sm:p-8 lg:p-10">
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="gap-1.5 border-primary/20 bg-primary/5 text-primary"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Project Serrano
                </Badge>

                <Badge
                  variant="outline"
                  className="gap-1.5 text-muted-foreground"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Official Rules
                </Badge>
              </div>

              <div className="max-w-3xl space-y-4">
                <div>
                  <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    RIVET STUDIOS / PROJECT SERRANO
                  </p>

                  <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                    Project Serrano Rules
                  </h1>
                </div>

                <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Official roleplay standards and expectations governing
                  players, characters, departments, and criminal activity
                  within Project Serrano.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 border-t border-border/60 pt-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Guide-first enforcement</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Serious roleplay environment</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Gavel className="h-4 w-4 text-primary" />
                  <span>Staff discretion applies</span>
                </div>
              </div>
            </div>
          </header>

          {/* Quick Navigation */}
          <Card className="mb-10 border-border/60 bg-card/60">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/40">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>

                <div>
                  <CardTitle className="text-sm">Rules Directory</CardTitle>
                  <CardDescription className="text-xs">
                    Navigate directly to a policy section.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {ruleSections.map((section) => {
                const Icon = section.icon;

                return (
                  <a
                    key={section.number}
                    href={`#section-${section.number}`}
                    className="group flex items-center gap-3 rounded-lg border border-border/50 bg-background/50 p-3 transition-colors hover:border-primary/30 hover:bg-primary/[0.04]"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/30">
                      <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">
                        {section.number}. {section.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {section.rules.length} rules
                      </p>
                    </div>

                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </a>
                );
              })}

              <a
                href="#punishment-scale"
                className="group flex items-center gap-3 rounded-lg border border-border/50 bg-background/50 p-3 transition-colors hover:border-primary/30 hover:bg-primary/[0.04]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/30">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">
                    Punishment Scale
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Classes A–C
                  </p>
                </div>

                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </a>
            </CardContent>
          </Card>

          {/* Serious RP Notice */}
          <Card className="mb-10 overflow-hidden border-destructive/25 bg-destructive/[0.04]">
            <CardContent className="p-0">
              <div className="flex items-start gap-4 p-5 sm:p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-destructive/20 bg-destructive/10">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-destructive">
                      Serious Roleplay Environment
                    </h2>

                    <Badge
                      variant="outline"
                      className="border-destructive/20 bg-destructive/5 text-[10px] uppercase tracking-wider text-destructive"
                    >
                      Important
                    </Badge>
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">
                    Project Serrano is a serious roleplay environment with a
                    strong focus on realism, immersive storytelling, and
                    consistent character portrayal. All rules are enforced
                    using a common-sense approach—if an action is clearly
                    disruptive, unrealistic, or breaks immersion, it will be
                    treated as a violation even if not explicitly listed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rules */}
          <div className="space-y-12">
            {ruleSections.map((section) => {
              const Icon = section.icon;

              return (
                <section
                  key={section.number}
                  id={`section-${section.number}`}
                  className="scroll-mt-8"
                >
                  <div className="mb-5 flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.07]">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>

                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                          Section {section.number}
                        </span>

                        <span className="h-1 w-1 rounded-full bg-border" />

                        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                          {section.rules.length} rules
                        </span>
                      </div>

                      <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                        {section.title}
                      </h2>

                      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {section.rules.map((rule, index) => (
                      <RuleCard
                        key={rule.title}
                        rule={rule}
                        index={index}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Punishment Scale */}
          <section
            id="punishment-scale"
            className="mt-14 scroll-mt-8 space-y-5"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.07]">
                <AlertTriangle className="h-5 w-5 text-primary" />
              </div>

              <div>
                <div className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Enforcement
                </div>

                <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                  Punishment Scale
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  General enforcement classes for rule violations.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <Card className="border-border/60">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="outline">CLASS A</Badge>
                    <span className="font-mono text-xs text-muted-foreground">
                      MINOR
                    </span>
                  </div>

                  <CardTitle className="text-base">
                    Minor Offenses
                  </CardTitle>
                </CardHeader>

                <CardContent className="text-sm leading-6 text-muted-foreground">
                  Warning, Kick, or Timeout. Reaching the maximum count leads
                  to a Class B punishment.
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="outline">CLASS B</Badge>
                    <span className="font-mono text-xs text-muted-foreground">
                      MODERATE
                    </span>
                  </div>

                  <CardTitle className="text-base">
                    Moderate Offenses
                  </CardTitle>
                </CardHeader>

                <CardContent className="text-sm leading-6 text-muted-foreground">
                  Temporary Ban. Duration depends on severity and history. Can
                  range from 24 hours to 30+ days.
                </CardContent>
              </Card>

              <Card className="border-destructive/25 bg-destructive/[0.025]">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="border-destructive/30 bg-destructive/10 text-destructive"
                    >
                      CLASS C
                    </Badge>

                    <span className="font-mono text-xs text-destructive/70">
                      SEVERE
                    </span>
                  </div>

                  <CardTitle className="text-base">
                    Severe Offenses
                  </CardTitle>
                </CardHeader>

                <CardContent className="text-sm leading-6 text-muted-foreground">
                  Permanent Ban. Reserved for serious violations such as
                  exploitation, permanent bans from roles, or repeated severe
                  offenses.
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Guide First Footer */}
          <Card className="mt-10 overflow-hidden border-primary/20 bg-primary/[0.035]">
            <CardContent className="p-0">
              <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:p-7">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>

                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">Guide First Approach</h2>
                    <Badge
                      variant="outline"
                      className="border-primary/20 bg-primary/5 text-[10px] uppercase tracking-wider text-primary"
                    >
                      Enforcement Philosophy
                    </Badge>
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">
                    All rules are enforced using a guide first approach. First
                    offenses are enforced with a verbal warn guided to our
                    guidelines. If an action is severe, it will be treated as
                    a violation. Staff discretion applies to ensure a quality
                    roleplay experience for all players.
                  </p>
                </div>

                <ArrowRight className="hidden h-5 w-5 shrink-0 text-primary/50 sm:block" />
              </div>
            </CardContent>
          </Card>

          {/* Footer Metadata */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border/50 pt-6 text-center sm:flex-row sm:text-left">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                RIVET STUDIOS™
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Project Serrano • Official Roleplay Standards
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              <span>Rules are subject to staff enforcement</span>
            </div>
          </div>
        </div>
      </div>
    </PolicyWrapper>
  );
}