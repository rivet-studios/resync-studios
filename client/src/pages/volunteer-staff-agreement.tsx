import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Handshake, Shield, AlertTriangle } from "lucide-react";

export default function VolunteerStaffAgreement() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mx-auto gap-2">
          <Handshake className="w-3.5 h-3.5" />
          Volunteer Agreement
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Volunteer Staff Agreement
        </h1>
        <p className="text-lg text-muted-foreground">
          Terms and conditions for volunteer moderators and staff members
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          Last Updated: January 6, 2026
        </p>
      </div>

      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-destructive mt-1 shrink-0" />
            <div>
              <p className="font-semibold mb-2 text-destructive">
                Important Notice
              </p>
              <p className="text-muted-foreground text-sm">
                Please read this agreement carefully. It contains important
                information regarding your role, responsibilities, and the
                nature of your relationship with Rivet Studios. By accepting an
                invitation to become a Volunteer Staff member, you acknowledge
                that you have read, understood, and unconditionally agree to be
                bound by all terms and conditions contained herein.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Nature of Relationship */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          1. Nature of the Relationship
        </h2>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Strictly Voluntary Position
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Your role as Volunteer Staff is a strictly voluntary, unpaid,
              at-will position. You are not an employee, independent contractor,
              partner, or agent of Rivet Studios. You perform your duties for
              personal civic, charitable, or humanitarian reasons, without
              promise, expectation, or receipt of any compensation.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                No Compensation or Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You agree to perform all duties without any form of compensation,
              salary, or wages. You are not entitled to any employee benefits.
              Any in-game titles, access, or virtual items provided to you are a
              discretionary, non-guaranteed privilege granted as a courtesy for
              your service and are not to be considered compensation.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">At-Will Termination</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              The relationship between you and Rivet Studios is entirely
              "at-will." Either party may terminate this volunteer relationship
              at any time, for any reason or for no reason, with or without
              advance notice or explanation.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 2: Eligibility */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          2. Eligibility and Requirements
        </h2>

        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground space-y-3">
            <p className="font-semibold text-foreground">
              To become and remain a Volunteer Staff member, you must:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Age:</strong> Be at least 14 years old (exception: 13
                years old with explicit written authorization)
              </li>
              <li>
                <strong>Communication Equipment:</strong> Have and maintain a
                functional microphone in good working order
              </li>
              <li>
                <strong>Account in Good Standing:</strong> Have an active Resync
                Studios user account with no history of significant violations
              </li>
              <li>
                <strong>Agree to Policies:</strong> Agree to and abide by this
                Agreement and all official policies
              </li>
              <li>
                <strong>Demonstrated Maturity:</strong> Consistently demonstrate
                maturity, sound judgment, and professionalism
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Section 3: Code of Conduct */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          3. Code of Conduct and Responsibilities
        </h2>

        <div className="grid gap-4">
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">
                As a Volunteer Staff member, you are a community role model.
              </p>
              <p>Your responsibilities include:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>
                  Actively and impartially enforcing Rivet Studios policies
                </li>
                <li>Promoting a welcoming and constructive atmosphere</li>
                <li>
                  Behaving in a respectful and unbiased manner at all times
                </li>
                <li>
                  Applying rules consistently to all users without favoritism or
                  prejudice
                </li>
                <li>
                  Represent the RS Trust & Safety Team with professionalism and
                  dignity at all times - This includes maintaining a
                  professional appearance, using appropriate language, and
                  avoiding any behavior that could be perceived as
                  unprofessional or inappropriate - This also includes
                  maintaining a professional demeanor in all communications,
                  both in-game and out-of-game
                </li>
                <li>Promptly reporting serious issues to designated staff</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 4: Confidentiality */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">4. Confidentiality</h2>

        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="p-6 text-sm text-muted-foreground space-y-3">
            <p className="font-semibold text-orange-600">
              You must not disclose non-public information.
            </p>
            <p>This includes:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Internal staff discussions</li>
              <li>Unreleased game features</li>
              <li>User data</li>
              <li>Security protocols</li>
            </ul>
            <p className="mt-3 font-semibold text-orange-600">
              Breach of confidentiality results in immediate removal and may
              lead to further action.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section 5: Staff Tools */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          5. Use of Staff Tools and Privileges
        </h2>

        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground space-y-3">
            <p>
              All staff tools are the sole property of Rivet Studios, granted
              exclusively for performing your duties.
            </p>
            <p className="font-semibold text-foreground">
              You are strictly prohibited from:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Using your status or tools for personal gain</li>
              <li>Using tools to intimidate or harass others</li>
              <li>Using tools to settle personal disputes</li>
            </ul>
            <p className="mt-3 text-destructive font-semibold">
              Any abuse of power is grounds for immediate removal.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section 6: Disqualification */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          6. Disqualification and Removal
        </h2>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Grounds for Removal</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Actions that will typically result in immediate disqualification
                include:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Breaching confidentiality</li>
                <li>Abusing staff tools</li>
                <li>Unprofessional conduct</li>
                <li>Failure to enforce rules</li>
                <li>Violating Discord and/or ROBLOX Terms of Use</li>
                <li>Unauthorised Use of Staff Tools</li>
                <li>Violating Rivet Studios Terms and Conditions</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-destructive">
                Consequences of Violation
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              A violation of this Agreement will result in the immediate
              termination of your Volunteer Staff privileges and may result in
              permanent termination of your underlying Rivet Studios user
              account, without right of appeal.
              <p className="mt-3 text-destructive font-semibold">
                Any abuse of power is grounds for immediate removal.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 8: Post-Service */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          7. Post-Service Obligations and Conduct
        </h2>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Use of Trademarks and Brand Representation
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Your right to associate yourself with our brand is limited and
                ceases upon the end of your service.
              </p>
              <div className="space-y-2 mt-3">
                <p className="font-semibold text-destructive">❌ Prohibited:</p>
                <p className="pl-4">"Former Metro Interactive Administrator"</p>
                <p className="pl-4">"Former Rivet Studios Administrator"</p>
                <p className="pl-4">"Ex-Staff at Metro Interactive"</p>
                <p className="pl-4">"Ex-Staff at Rivet Studios"</p>
              </div>
              <div className="space-y-2 mt-3">
                <p className="font-semibold text-green-600">✓ Permitted:</p>
                <p className="pl-4">"Former MI Volunteer Moderator"</p>
                <p className="pl-4">"Former RS Volunteer Moderator"</p>
                <p className="pl-4">"Former Project Foxtrot Volunteer"</p>
              </div>
              <p className="mt-3">
                This policy protects our trademark and prevents public confusion
                regarding who is an official, current representative.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Prohibited Post-Service Conduct
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Upon conclusion of your role, you agree not to engage in conduct
                intended to disrupt or harm, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  Making public claims for wages that you explicitly waived
                </li>
                <li>Spreading misinformation or defamatory statements</li>
                <li>Inciting drama or unrest related to your departure</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-destructive">
                Consequences of Breach
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Engaging in prohibited post-service conduct is a material breach
              resulting in immediate and permanent termination of your Resync
              Studios user account and a permanent ban from all Services,
              without appeal.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 7: Liability */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          8. Limitation of Liability
        </h2>

        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            <p>
              You perform your volunteer duties at your own risk. To the fullest
              extent permitted by law, Rivet Studios shall not be liable for
              any claims, damages, or liabilities arising from your actions or
              service as a Volunteer Staff member.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Acknowledgment */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="p-6 text-center space-y-3">
          <p className="text-lg font-semibold">Acknowledgment of Agreement</p>
          <p className="text-muted-foreground text-sm">
            By accepting the role of Volunteer Staff, you signify your complete
            and unconditional agreement to be bound by all terms and conditions
            set forth herein. You understand this is not a contract of
            employment and does not create any legally enforceable rights to a
            position or to compensation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
