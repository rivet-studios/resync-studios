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
  BookOpen,
  Users,
  Heart,
  Shield,
  Scale,
  MessageSquare,
  Lock,
  Gavel,
  Flag,
  UserCheck,
  Swords,
  Gamepad2,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { PolicyWrapper } from "@/components/policy-wrapper";

interface Rule {
  number: number;
  title: string;
  description: string;
  icon: typeof Shield;
  highlighted?: boolean;
}

const coreRules: Rule[] = [
  {
    number: 1,
    title: "Respectful Content Only",
    description:
      "No excessive profanity, sexual/illicit content, threats, hate speech, or copyright infringement.",
    icon: Shield,
  },
  {
    number: 2,
    title: "No Discrimination",
    description:
      "Discrimination based on race, gender, religion, disability, or orientation is never allowed.",
    icon: Users,
  },
  {
    number: 3,
    title: "Be Respectful",
    description:
      "No personal attacks or passive-aggressive behavior. If needed, ignore and report users.",
    icon: Heart,
  },
  {
    number: 4,
    title: "Constructive Posts",
    description:
      'Keep posts on-topic. If you disagree, explain why. Don\'t just say "search it up."',
    icon: MessageSquare,
  },
  {
    number: 5,
    title: "Don't Retaliate",
    description:
      "Report harassment to staff. Don't reply publicly or engage back and forth.",
    icon: Flag,
  },
  {
    number: 6,
    title: "English Only",
    description:
      "All posts must be in English unless otherwise permitted with translation.",
    icon: BookOpen,
  },
  {
    number: 7,
    title: "Don't Bump Threads",
    description:
      "Only bump if adding meaningful input. Avoid posting in old threads without good reason.",
    icon: MessageSquare,
  },
  {
    number: 8,
    title: "No Advertising or Trading",
    description:
      "Selling, advertising, or promoting products/services is not allowed.",
    icon: Scale,
  },
  {
    number: 9,
    title: "Privacy First",
    description:
      "Don't post personal info or private discussions without consent.",
    icon: Lock,
  },
  {
    number: 10,
    title: "Follow Staff Instructions",
    description:
      "If a staff member tells you to stop, do so immediately or delete the message.",
    icon: UserCheck,
  },
  {
    number: 11,
    title: "Staff Disputes",
    description:
      "Contact staff privately or through Internal Affairs. Public staff complaints will be removed. Use the designated staff report form to report our moderators.",
    icon: Gavel,
  },
  {
    number: 12,
    title: "One Account Policy",
    description:
      "Only one account per person. Alts will be banned.",
    icon: UserCheck,
  },
  {
    number: 13,
    title: "No Drama or Flame Wars",
    description:
      "Take complaints to staff privately or report users in the designated report forum. Don't stir up public conflicts.",
    icon: MessageSquare,
  },
  {
    number: 14,
    title: "Political Discussion",
    description:
      "Allowed if respectful, relevant, and not dominant. Keep it civil.",
    icon: Scale,
  },
  {
    number: 15,
    title: "Thread Participation",
    description:
      "Only post in threads you started, were tagged in, or have evidence for. You may reply to posts, topics, or threads posted in the community section.",
    icon: MessageSquare,
  },
  {
    number: 16,
    title: "No Spoilers Without Tags",
    description:
      "No major spoilers for 14 days after release unless clearly tagged.",
    icon: Flag,
  },
  {
    number: 17,
    title: "Account Responsibility",
    description:
      'You are responsible for all activity on your account. Keep it secure. "My cousin was using my account" is not acceptable.',
    icon: Lock,
  },
  {
    number: 18,
    title: "No Impersonation",
    description:
      "Don't pretend to be staff or misrepresent your role. Accounts caught impersonating will be promptly removed from the community. You can verify a staff member by checking their profile or Discord roles.",
    icon: Shield,
  },
];

const conductRules: Rule[] = [
  {
    number: 19,
    title: "Abuse of Position / Influence",
    description:
      "Those in staff or leadership roles may not use their rank to manipulate, intimidate, or retaliate against community members. This includes using your role to silence others, threatening to remove roles/perks, or coordinating group exclusion.",
    icon: Gavel,
    highlighted: true,
  },
  {
    number: 20,
    title: "Passive-Aggressive Behavior",
    description:
      "Messages meant to mock, embarrass, or provoke others are punishable. Intent matters more than specific words. If your actions consistently stir tension, staff may step in.",
    icon: MessageSquare,
  },
  {
    number: 21,
    title: "No Grouping to Isolate Others (Cliquing)",
    description:
      "Creating cliques that exclude or target others is not allowed. We want an open, welcoming community, not one ruled by favoritism or division.",
    icon: Users,
  },
  {
    number: 22,
    title: "Public Role/Rank Complaints Prohibited",
    description:
      "Questions or complaints about staff roles must go through proper channels. Use Internal Affairs or Staff Feedback form. Keep drama out of public areas.",
    icon: Gavel,
  },
  {
    number: 23,
    title: "Staff Conduct Applies 24/7",
    description:
      'Staff are expected to uphold community standards at all times—even when "off duty." No trash-talking or stirring drama. Your actions reflect the community.',
    icon: Shield,
  },
  {
    number: 24,
    title: "Indirect Harassment / Dogpiling",
    description:
      "Encouraging others to isolate, mock, or target a member is considered harassment. You are accountable for the impact of your words, even if you don't say it outright.",
    icon: Users,
  },
  {
    number: 25,
    title: "Undermining Staff Decisions",
    description:
      "Questioning or criticizing moderation outcomes in public chat is not allowed. Appeals must go through our appeal system or staff reports.",
    icon: Scale,
  },
  {
    number: 26,
    title: "Reputation Farming & Popularity Abuse",
    description:
      "Do not exploit your status to manipulate decisions or staff outcomes. Your position does not place you above the rules. This applies to staff, contributors, and large creators.",
    icon: Shield,
  },
  {
    number: 27,
    title: "Excessive Public Roleplay of Real Conflict",
    description:
      "Turning real staff conflict into roleplay jokes is not allowed. Using RP as a loophole to mock staff decisions is prohibited. Keep real issues out of roleplay.",
    icon: Gamepad2,
  },
  {
    number: 28,
    title: "Staff Cliques May Be Investigated",
    description:
      "If staff behavior shows consistent favoritism, groupthink, or retaliation, we may open an internal review. We are committed to fairness, not just rule compliance.",
    icon: Users,
  },
  {
    number: 29,
    title: "Off-Duty Doesn't Mean Off-Limits",
    description:
      'Staff are expected to maintain professionalism in all community spaces. You may not stir drama while claiming to be "off shift" or use alternate accounts to avoid accountability.',
    icon: Shield,
  },
  {
    number: 30,
    title: "Weaponizing Mental Health or Personal Issues",
    description:
      "You may not use sensitive topics to manipulate decisions or gain special treatment. We support mental health—but not when it's used as a shield to avoid accountability.",
    icon: Heart,
  },
];

const additionalRules: Rule[] = [
  {
    number: 31,
    title: "Community Stirring via Third-Party Servers",
    description:
      "Creating or using third-party Discords to discuss drama or organize harassment is not allowed. We'll moderate third-party drama if it affects our platform.",
    icon: Users,
  },
  {
    number: 32,
    title: "Staff Interpersonal Drama Must Be Reported",
    description:
      "If you're a staff member having tension with another staffer, take it to management or Internal Affairs—not to chat. You are held to a higher standard when handling conflict.",
    icon: Gavel,
  },
  {
    number: 33,
    title: "No Chain Retaliation or Loyalty Voting",
    description:
      "Once disciplinary action is taken, you may not retaliate by quitting in mass or refusing to cooperate. Each situation is handled individually. Chain loyalty pressure is unacceptable.",
    icon: Users,
  },
  {
    number: 34,
    title: "Roleplay Rank Does Not Equal Real Authority",
    description:
      "Holding a high in-game rank does not grant real-world authority. All players must treat each other with respect, regardless of in-game hierarchy. Misusing in-game rank to intimidate is prohibited.",
    icon: Gamepad2,
  },
  {
    number: 35,
    title: "No Gatekeeping or Elitism",
    description:
      'Disparaging players for their experience level or playstyle is not allowed. Comments like "You\'re not a real role-player" are considered gatekeeping and will be moderated.',
    icon: Users,
  },
  {
    number: 36,
    title: "Respect for OOC Boundaries",
    description:
      "All players must respect others' out-of-character boundaries. Forcing players into uncomfortable scenarios or ignoring safe words is strictly prohibited. Consent is paramount.",
    icon: Shield,
  },
  {
    number: 37,
    title: "No Off-Platform Harassment",
    description:
      "Harassing, stalking, or bullying players outside the platform is strictly forbidden. This includes creating or sharing content that targets or mocks other community members. Penalties for off-platform harassment may involve account termination and reporting to relevant authorities where appropriate.",
    icon: Flag,
    highlighted: true,
  },
  {
    number: 38,
    title: "Accountability for All Members",
    description:
      "All community members are held to the same standards. Favoritism, nepotism, or shielding individuals due to their position is not tolerated.",
    icon: Scale,
  },
  {
    number: 39,
    title: "Clear Separation Between IC and OOC",
    description:
      "Players must distinguish between IC and OOC actions. Using IC scenarios to justify OOC hostility is unacceptable. Maintain professionalism in all interactions.",
    icon: Gamepad2,
  },
  {
    number: 40,
    title: "Mandatory Training for Leadership Roles",
    description:
      "Individuals seeking leadership positions must undergo training on community guidelines, conflict resolution, and proper conduct to handle responsibilities ethically.",
    icon: GraduationCap,
  },
];

function RuleCard({ rule }: { rule: Rule }) {
  const Icon = rule.icon;

  return (
    <Card
      className={
        rule.highlighted
          ? "border-orange-500/30 bg-orange-500/5"
          : "transition-colors hover:border-foreground/20"
      }
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              rule.highlighted
                ? "border-orange-500/30 bg-orange-500/10 text-orange-500"
                : "bg-muted/30 text-muted-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-muted-foreground">
                    {String(rule.number).padStart(2, "0")}
                  </span>

                  <h3 className="font-semibold">
                    {rule.title}
                  </h3>
                </div>

                <p className="text-sm leading-6 text-muted-foreground">
                  {rule.description}
                </p>
              </div>

              <ChevronRight className="mt-1 hidden h-4 w-4 shrink-0 text-muted-foreground/40 sm:block" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RuleSection({
  numberRange,
  title,
  description,
  icon: Icon,
  rules,
}: {
  numberRange: string;
  title: string;
  description: string;
  icon: typeof Shield;
  rules: Rule[];
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-muted/30">
          <Icon className="h-4 w-4" />
        </div>

        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl font-bold">
              {title}
            </h2>

            <Badge variant="secondary" className="font-mono text-[10px]">
              {numberRange}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {rules.map((rule) => (
          <RuleCard key={rule.number} rule={rule} />
        ))}
      </div>
    </section>
  );
}

export default function CommunityRules() {
  return (
    <PolicyWrapper slug="community-rules">
      <div className="container mx-auto max-w-5xl space-y-10 px-4 py-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border bg-muted/20 p-6 sm:p-8">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative">
            <Badge
              variant="outline"
              className="mb-4 gap-2"
            >
              <Heart className="h-3.5 w-3.5" />
              Community Standards
            </Badge>

            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Community Rules
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              The official rules and guidelines for participating
              in the RIVET Studios community.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <BookOpen className="h-3 w-3" />
                40 Rules
              </Badge>

              <Badge variant="secondary" className="gap-1.5">
                <Users className="h-3 w-3" />
                Community-Wide
              </Badge>

              <Badge variant="secondary" className="gap-1.5">
                <Shield className="h-3 w-3" />
                Staff Enforced
              </Badge>
            </div>
          </div>
        </div>

        {/* Notice */}
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                <AlertCircle className="h-5 w-5 text-blue-500" />
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-blue-500">
                  Community Standards
                </p>

                <p className="text-sm leading-6 text-muted-foreground">
                  Rules and guidelines help keep RIVET Studios
                  respectful, welcoming, and enjoyable for everyone.
                  By participating in the community, you agree to
                  follow these rules and our Terms of Use. Access
                  may be restricted or removed when these standards
                  are violated.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick navigation */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              Rules at a Glance
            </CardTitle>

            <CardDescription>
              Browse the standards by section.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <a
                href="#core-rules"
                className="group rounded-xl border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />

                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Core Rules
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Rules 01–18
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
              </a>

              <a
                href="#conduct-rules"
                className="group rounded-xl border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Scale className="h-4 w-4 text-muted-foreground" />

                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Conduct & Fairness
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Rules 19–30
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
              </a>

              <a
                href="#additional-rules"
                className="group rounded-xl border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />

                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Additional Standards
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Rules 31–40
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Core Rules */}
        <div id="core-rules" className="scroll-mt-24">
          <RuleSection
            numberRange="01–18"
            title="Core Community Rules"
            description="The fundamental standards expected from every RIVET Studios community member."
            icon={Shield}
            rules={coreRules}
          />
        </div>

        {/* Conduct Rules */}
        <div id="conduct-rules" className="scroll-mt-24">
          <RuleSection
            numberRange="19–30"
            title="Enhanced Conduct & Fairness"
            description="Additional standards covering leadership, moderation, harassment, and community conduct."
            icon={Scale}
            rules={conductRules}
          />
        </div>

        {/* Additional Rules */}
        <div id="additional-rules" className="scroll-mt-24">
          <RuleSection
            numberRange="31–40"
            title="Additional Community Standards"
            description="Standards covering roleplay, off-platform conduct, accountability, and leadership."
            icon={Users}
            rules={additionalRules}
          />
        </div>

        {/* Footer */}
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/10 via-background to-primary/5">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-background">
                <Heart className="h-5 w-5" />
              </div>

              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  Community First
                </p>

                <p className="mx-auto max-w-2xl text-sm leading-6 text-muted-foreground">
                  These rules exist to create a respectful,
                  welcoming space for all community members.
                  Everyone is expected to uphold the same
                  standards, and concerns should be raised through
                  the appropriate channels.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary">
                  Respect
                </Badge>

                <Badge variant="secondary">
                  Accountability
                </Badge>

                <Badge variant="secondary">
                  Community
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PolicyWrapper>
  );
}