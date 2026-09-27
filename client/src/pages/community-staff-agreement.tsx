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
  Handshake,
  Shield,
  AlertTriangle,
  Users,
  Briefcase,
  Scale,
  Lock,
  Gavel,
  Ban,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { PolicyWrapper } from "@/components/policy-wrapper";

interface AgreementSection {
  number: string;
  title: string;
  description: string;
  icon: typeof Shield;
}

const sections: AgreementSection[] = [
  {
    number: "01",
    title: "Nature of the Relationship",
    description:
      "The nature, status, and limits of a Community Staff position.",
    icon: Briefcase,
  },
  {
    number: "02",
    title: "Eligibility and Requirements",
    description:
      "Requirements that must be met to become and remain Community Staff.",
    icon: CheckCircle,
  },
  {
    number: "03",
    title: "Code of Conduct and Responsibilities",
    description:
      "The standards and responsibilities expected from Community Staff.",
    icon: Shield,
  },
  {
    number: "04",
    title: "Confidentiality",
    description:
      "Requirements surrounding private and non-public information.",
    icon: Lock,
  },
  {
    number: "05",
    title: "Use of Staff Tools and Privileges",
    description:
      "Rules governing access to moderation tools and staff privileges.",
    icon: Gavel,
  },
  {
    number: "06",
    title: "Disqualification and Removal",
    description:
      "Conduct that may result in removal from the Community Staff team.",
    icon: Ban,
  },
  {
    number: "07",
    title: "Post-Service Obligations and Conduct",
    description:
      "Restrictions and expectations that apply after leaving Community Staff.",
    icon: FileText,
  },
  {
    number: "08",
    title: "Limitation of Liability",
    description:
      "The limitations surrounding service performed as Community Staff.",
    icon: Scale,
  },
];

function SectionHeading({
  number,
  title,
  description,
  icon: Icon,
}: AgreementSection) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-muted/30">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h2 className="font-display text-2xl font-bold">
            {title}
          </h2>

          <Badge variant="secondary" className="font-mono text-[10px]">
            {number}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function CommunityStaffAgreement() {
  return (
    <PolicyWrapper slug="community-staff-agreement">
      <div className="container mx-auto max-w-5xl space-y-10 px-4 py-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border bg-muted/20 p-6 sm:p-8">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative">
            <Badge variant="outline" className="mb-4 gap-2">
              <Handshake className="h-3.5 w-3.5" />
              Staff Agreement
            </Badge>

            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Community Staff Agreement
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Terms and conditions governing Community Staff roles,
              responsibilities, privileges, and conduct within the RIVET Studios
              community.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <FileText className="h-3 w-3" />
                Staff Policy
              </Badge>

              <Badge variant="secondary" className="gap-1.5">
                <Shield className="h-3 w-3" />
                Community Staff
              </Badge>

              <Badge variant="secondary" className="gap-1.5">
                <Clock className="h-3 w-3" />
                Updated May 9, 2026
              </Badge>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-destructive">
                  Important Notice
                </p>

                <p className="text-sm leading-6 text-muted-foreground">
                  Please read this agreement carefully. It contains important
                  information regarding your role, responsibilities, and the
                  nature of your relationship with RIVET Studios. By accepting
                  an invitation to become a Community Staff member, you
                  acknowledge that you have read, understood, and agree to be
                  bound by the terms and conditions contained herein.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agreement Overview */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              Agreement Overview
            </CardTitle>

            <CardDescription>
              Use the sections below to navigate the agreement.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {sections.map((section) => {
                const Icon = section.icon;

                return (
                  <a
                    key={section.number}
                    href={`#section-${section.number}`}
                    className="group rounded-xl border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {section.number}
                          </span>

                          <p className="truncate text-sm font-medium">
                            {section.title}
                          </p>
                        </div>

                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {section.description}
                        </p>
                      </div>

                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-1" />
                    </div>
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Section 1 */}
        <section id="section-01" className="scroll-mt-24 space-y-4">
          <SectionHeading {...sections[0]} />

          <div className="grid gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Community Position
                </CardTitle>
              </CardHeader>

              <CardContent className="text-sm leading-6 text-muted-foreground">
                Your role as Community Staff is a strictly community, unpaid,
                at-will position. You are not an employee, independent
                contractor, partner, or agent of RIVET Studios. You perform
                your duties for personal civic, charitable, or humanitarian
                reasons, without promise, expectation, or receipt of any
                compensation.

                <p className="mt-3">
                  You are{" "}
                  <strong className="text-foreground">not</strong> working on
                  behalf of RIVET Studios. You are working on behalf of the
                  community, within a community-run system.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  No Compensation or Benefits
                </CardTitle>
              </CardHeader>

              <CardContent className="text-sm leading-6 text-muted-foreground">
                You agree to perform all duties without any form of
                compensation, salary, or wages. You are not entitled to any
                employee benefits.

                <p className="mt-3">
                  Any in-game titles, access, or virtual items provided to you
                  are discretionary, non-guaranteed privileges granted as a
                  courtesy for your service and are not to be considered
                  compensation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  At-Will Termination
                </CardTitle>
              </CardHeader>

              <CardContent className="text-sm leading-6 text-muted-foreground">
                The relationship between you and RIVET Studios is entirely
                "at-will." Either party may terminate this volunteer
                relationship at any time, for any reason or for no reason,
                with or without advance notice or explanation.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 2 */}
        <section id="section-02" className="scroll-mt-24 space-y-4">
          <SectionHeading {...sections[1]} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Eligibility Requirements
              </CardTitle>

              <CardDescription>
                To become and remain a Community Staff member, you must meet
                the following requirements.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3">
                {[
                  {
                    title: "Age",
                    content:
                      "Be at least 14 years old. An exception may be made for individuals aged 13 with explicit written authorization.",
                  },
                  {
                    title: "Communication Equipment",
                    content:
                      "Have and maintain a functional microphone in good working order.",
                  },
                  {
                    title: "Account in Good Standing",
                    content:
                      "Have an active RIVET Studios user account with no history of significant violations, including VTOS, alternate-account, advertising, or other significant violations.",
                  },
                  {
                    title: "Agree to Policies",
                    content:
                      "Agree to and abide by this Agreement and all official policies.",
                  },
                  {
                    title: "Demonstrated Maturity",
                    content:
                      "Consistently demonstrate maturity, sound judgment, and professionalism.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-3 rounded-xl border p-4"
                  >
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />

                    <div>
                      <p className="text-sm font-medium">
                        {item.title}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 3 */}
        <section id="section-03" className="scroll-mt-24 space-y-4">
          <SectionHeading {...sections[2]} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Staff Responsibilities
              </CardTitle>

              <CardDescription>
                Community Staff members serve as role models within the
                community.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Actively and impartially enforce RIVET Studios policies.",
                  "Promote a welcoming and constructive atmosphere.",
                  "Behave in a respectful and unbiased manner at all times.",
                  "Apply rules consistently to all users without favoritism or prejudice.",
                  "Represent the Community Staff team with professionalism and dignity at all times.",
                  "Maintain a professional appearance and use appropriate language.",
                  "Maintain a professional demeanor in both in-game and out-of-game communications.",
                  "Promptly report serious issues to designated staff.",
                ].map((responsibility, index) => (
                  <div
                    key={index}
                    className="flex gap-3 rounded-xl border p-4"
                  >
                    <Shield className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                    <p className="text-sm leading-6 text-muted-foreground">
                      {responsibility}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 4 */}
        <section id="section-04" className="scroll-mt-24 space-y-4">
          <SectionHeading {...sections[3]} />

          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardHeader>
              <CardTitle className="text-base text-orange-600">
                Confidential Information
              </CardTitle>

              <CardDescription>
                Community Staff must not disclose non-public information.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Internal staff discussions",
                  "Unreleased game features",
                  "User data",
                  "Security protocols",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-orange-500/20 bg-background/40 p-3"
                  >
                    <Lock className="h-4 w-4 shrink-0 text-orange-500" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />

                <p className="text-sm leading-6 text-muted-foreground">
                  Breach of confidentiality results in immediate removal and
                  may lead to further action.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 5 */}
        <section id="section-05" className="scroll-mt-24 space-y-4">
          <SectionHeading {...sections[4]} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Staff Tools and Privileges
              </CardTitle>

              <CardDescription>
                Staff tools exist solely for carrying out legitimate staff
                responsibilities.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <p className="text-sm leading-6 text-muted-foreground">
                All staff tools are the sole property of RIVET Studios and are
                granted exclusively for performing your duties.
              </p>

              <div>
                <p className="mb-3 text-sm font-semibold text-foreground">
                  Prohibited Uses
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    "Using your status or tools for personal gain",
                    "Using tools to intimidate or harass others",
                    "Using tools to settle personal disputes",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-destructive/20 bg-destructive/5 p-4"
                    >
                      <XCircle className="mb-3 h-4 w-4 text-destructive" />

                      <p className="text-sm leading-5 text-muted-foreground">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />

                <p className="text-sm font-semibold text-destructive">
                  Any abuse of power is grounds for immediate removal.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 6 */}
        <section id="section-06" className="scroll-mt-24 space-y-4">
          <SectionHeading {...sections[5]} />

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Grounds for Removal
                </CardTitle>

                <CardDescription>
                  Actions that will typically result in immediate
                  disqualification include:
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "Breaching confidentiality",
                    "Abusing staff tools",
                    "Unprofessional conduct",
                    "Failure to enforce rules fairly or at all",
                    "Violating Discord and/or Roblox Terms of Use",
                    "Unauthorized use of staff tools",
                    "Violating RIVET Studios policies, including this Agreement",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-xl border p-3"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />

                      <span className="text-sm leading-5 text-muted-foreground">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-base text-destructive">
                  Consequences of Violation
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm leading-6 text-muted-foreground">
                  A violation of this Agreement will result in the immediate
                  termination of your Community Staff privileges and may result
                  in permanent termination of your underlying RIVET Studios
                  user account for severe violations, with or without a right
                  of appeal.
                </p>

                <p className="text-sm font-semibold text-destructive">
                  Any abuse of power is grounds for immediate removal.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 7 */}
        <section id="section-07" className="scroll-mt-24 space-y-4">
          <SectionHeading {...sections[6]} />

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Use of Trademarks and Brand Representation
                </CardTitle>

                <CardDescription>
                  Your association with RIVET Studios must accurately reflect
                  your current status.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <p className="text-sm leading-6 text-muted-foreground">
                  Your right to associate yourself with our brand is limited
                  and ceases upon the end of your service.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <p className="text-sm font-semibold text-destructive">
                        Prohibited
                      </p>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>"Former Metro Interactive Administrator"</p>
                      <p>"Former RIVET Studios Administrator"</p>
                      <p>"Ex-Staff at Metro Interactive"</p>
                      <p>"Ex-Staff at RIVET Studios"</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <p className="text-sm font-semibold text-green-600">
                        Permitted
                      </p>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>"Former MI Community Moderator"</p>
                      <p>"Former RS Community Moderator"</p>
                      <p>"Former RS Community Staff"</p>
                      <p>"Former MI Community Staff"</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm leading-6 text-muted-foreground">
                  This policy protects our trademark and prevents public
                  confusion regarding who is an official, current
                  representative.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Prohibited Post-Service Conduct
                </CardTitle>

                <CardDescription>
                  Upon conclusion of your role, you agree not to engage in
                  conduct intended to disrupt or harm the community.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid gap-3">
                  {[
                    "Making public claims for wages that you explicitly waived",
                    "Spreading misinformation or defamatory statements, subject to applicable Australian law",
                    "Inciting drama or unrest related to your departure",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-xl border p-4"
                    >
                      <Ban className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                      <p className="text-sm leading-6 text-muted-foreground">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-base text-destructive">
                  Consequences of Breach
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  Engaging in prohibited post-service conduct is a material
                  breach that may result in termination of your RIVET Studios
                  user account and restriction from RIVET Studios Services,
                  subject to applicable policies and law.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 8 */}
        <section id="section-08" className="scroll-mt-24 space-y-4">
          <SectionHeading {...sections[7]} />

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-muted/30">
                  <Scale className="h-4 w-4" />
                </div>

                <p className="text-sm leading-6 text-muted-foreground">
                  You perform your Community Staff duties at your own risk. To
                  the fullest extent permitted by law, RIVET Studios shall not
                  be liable for claims, damages, or liabilities arising from
                  your actions or service as a Community Staff member.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Acknowledgment */}
        <Card className="overflow-hidden border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-background">
                <Handshake className="h-5 w-5 text-blue-500" />
              </div>

              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  Acknowledgment of Agreement
                </p>

                <p className="mx-auto max-w-2xl text-sm leading-6 text-muted-foreground">
                  By accepting the role of Community Staff, you signify your
                  agreement to be bound by the terms and conditions set forth
                  herein. You understand that this is not a contract of
                  employment and does not create a right to a position or
                  compensation.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary">
                  Community Staff
                </Badge>

                <Badge variant="secondary">
                  Accountability
                </Badge>

                <Badge variant="secondary">
                  Professionalism
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Last Updated: May 9, 2026
          </p>
        </div>
      </div>
    </PolicyWrapper>
  );
}