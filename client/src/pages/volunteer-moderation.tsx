import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Shield, Heart, ChevronDown } from "lucide-react";

export default function VolunteerModeration() {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
      {/* Header */}
      <div className="space-y-4">
        <Badge variant="outline" className="gap-2 w-fit">
          <Shield className="w-3.5 h-3.5" />
          Help Build Our Community
        </Badge>
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            RESYNC Volunteer Moderation Program
          </h1>
          <p className="text-lg text-muted-foreground">
            Join our moderation team and help maintain a safe, positive environment for all members.
          </p>
        </div>
      </div>

      {/* Why Join */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover-elevate">
          <CardHeader>
            <Users className="w-8 h-8 text-primary mb-2" />
            <CardTitle className="text-lg">Lead the Community</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Make a meaningful impact by helping guide discussions and enforce community standards.
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader>
            <Heart className="w-8 h-8 text-primary mb-2" />
            <CardTitle className="text-lg">Grow Your Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Develop leadership and moderation expertise while working with an experienced team.
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader>
            <Shield className="w-8 h-8 text-primary mb-2" />
            <CardTitle className="text-lg">Exclusive Perks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Receive special recognition, exclusive badges, and community privileges as a volunteer.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Requirements */}
      <Card className="bg-muted/30 border-muted">
        <CardHeader>
          <CardTitle>Moderator Requirements</CardTitle>
          <CardDescription>What we're looking for in candidates</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Active community member with a positive reputation</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Clear understanding of community guidelines and values</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Excellent communication and conflict resolution skills</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Ability to remain impartial and objective</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Commitment to maintaining a safe, inclusive environment</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Terms & Conditions Section */}
      <Card className="border-0">
        <CardHeader className="pb-3">
          <button
            onClick={() => setShowTerms(!showTerms)}
            className="flex items-center justify-between w-full hover-elevate p-2 rounded transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle>Volunteer Staff Terms & Conditions</CardTitle>
            </div>
            <ChevronDown 
              className="w-5 h-5 transition-transform" 
              style={{ transform: showTerms ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
        </CardHeader>

        {showTerms && (
          <CardContent className="space-y-6 border-t pt-6">
            {/* Important Notice */}
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-destructive mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold mb-2 text-destructive">Important Notice</p>
                    <p className="text-muted-foreground text-sm">
                      Please read this agreement carefully. It contains important information regarding your role, responsibilities, and the nature of your relationship with RESYNC Studios. By accepting an invitation to become a Volunteer Staff member, you acknowledge that you have read, understood, and unconditionally agree to be bound by all terms and conditions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nature of Relationship */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">1. Nature of the Relationship</h3>
              <div className="grid gap-3">
                <Card className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Strictly Voluntary Position</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Your role as Volunteer Staff is a strictly voluntary, unpaid, at-will position. You are not an employee, independent contractor, partner, or agent. You perform your duties for personal civic, charitable, or humanitarian reasons, without compensation.
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">No Compensation or Benefits</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    You agree to perform all duties without any form of compensation, salary, or wages. Any in-game titles, access, or virtual items are discretionary privileges, not compensation.
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">At-Will Termination</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Either party may terminate this volunteer relationship at any time, for any reason or for no reason, with or without advance notice.
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Eligibility */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">2. Eligibility and Requirements</h3>
              <Card className="bg-muted/30">
                <CardContent className="p-6 text-sm text-muted-foreground space-y-3">
                  <p className="font-semibold text-foreground">To become and remain a Volunteer Staff member, you must:</p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li><strong>Age:</strong> Be at least 14 years old (13 with explicit authorization)</li>
                    <li><strong>Communication Equipment:</strong> Have and maintain a functional microphone</li>
                    <li><strong>Account in Good Standing:</strong> Have an active account with no history of significant violations</li>
                    <li><strong>Agree to Policies:</strong> Abide by this Agreement and all official policies</li>
                    <li><strong>Demonstrated Maturity:</strong> Consistently demonstrate maturity, sound judgment, and professionalism</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Code of Conduct */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">3. Code of Conduct and Responsibilities</h3>
              <Card className="bg-muted/30">
                <CardContent className="p-6 text-sm text-muted-foreground space-y-2">
                  <p className="font-semibold text-foreground">As a Volunteer Staff member, you are a community role model.</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Actively and impartially enforce policies</li>
                    <li>Promote a welcoming and constructive atmosphere</li>
                    <li>Behave in a respectful and unbiased manner at all times</li>
                    <li>Apply rules consistently without favoritism</li>
                    <li>Promptly report serious issues to designated staff</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Confidentiality */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">4. Confidentiality</h3>
              <Card className="border-orange-500/30 bg-orange-500/5">
                <CardContent className="p-6 text-sm text-muted-foreground space-y-3">
                  <p className="font-semibold text-orange-600">You must not disclose non-public information including:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Internal staff discussions</li>
                    <li>Unreleased game features</li>
                    <li>User data</li>
                    <li>Security protocols</li>
                  </ul>
                  <p className="mt-3 font-semibold text-orange-600">Breach results in immediate removal and may lead to further action.</p>
                </CardContent>
              </Card>
            </div>

            {/* Disqualification */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">5. Disqualification and Removal</h3>
              <div className="grid gap-3">
                <Card className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Grounds for Removal</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>Actions that result in immediate disqualification:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Breaching confidentiality</li>
                      <li>Abusing staff tools</li>
                      <li>Unprofessional conduct</li>
                      <li>Failure to enforce rules</li>
                      <li>Violating Terms and Conditions</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-destructive/30 bg-destructive/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-destructive">Consequences of Violation</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Violation results in immediate termination of your Volunteer Staff privileges and may result in permanent termination of your account, without right of appeal.
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Acknowledgment */}
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardContent className="p-6 text-center space-y-3">
                <p className="text-lg font-semibold">Acknowledgment of Agreement</p>
                <p className="text-muted-foreground text-sm">
                  By accepting the role of Volunteer Staff, you signify your complete and unconditional agreement to all terms. This is not a contract of employment and does not create any legally enforceable rights to a position or compensation.
                </p>
              </CardContent>
            </Card>

            <div className="pt-2">
              <Button variant="outline" onClick={() => setShowTerms(false)} className="w-full">
                Collapse Terms
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Embed Form */}
      <div className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold mb-2">Apply Now</h2>
          <p className="text-muted-foreground">
            Fill out the form below to apply for our volunteer moderation program. We review all applications and will be in touch soon!
          </p>
        </div>

        <Card className="overflow-hidden border-0">
          <iframe
            src="https://resyncstudios.fillout.com/apply"
            style={{
              width: "100%",
              height: "800px",
              border: "none",
              borderRadius: "var(--radius)",
            }}
            title="RESYNC Volunteer Moderation Application"
          />
        </Card>
      </div>
    </div>
  );
}
