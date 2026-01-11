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
  CheckCircle,
  Shield,
  Heart,
  Flag,
  Users,
} from "lucide-react";

export default function CommunityGuidelines() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mx-auto gap-2">
          <Heart className="w-3.5 h-3.5" />
          Community Standards
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Community Guidelines
        </h1>
        <p className="text-lg text-muted-foreground">
          Building a welcoming, safe, and positive community for all members
        </p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Heart className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div>
              <p className="font-semibold mb-2">Our Foundation</p>
              <p className="text-muted-foreground">
                Rivet Studios creates an open gaming environment accessible to
                everyone. Our community is built on two core pillars: being a
                vibrant gaming hub and a Christian fellowship. We are committed
                to maintaining a safe, welcoming, and constructive place for all
                members.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Be Respectful */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <h2 className="font-display text-2xl font-bold">
            1. Our Foundation: Be Respectful
          </h2>
        </div>
        <p className="text-muted-foreground">
          Our community is built on mutual respect and fellowship. We expect
          every member to treat others with kindness and courtesy, even when
          disagreements occur.
        </p>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                No Harassment or Hate Speech
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Harassment, bullying, personal attacks, threats, hate speech,
              bigotry, and any form of discrimination against individuals or
              groups will not be tolerated. This is a zero-tolerance policy.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4 text-chart-2" />
                Keep it Family-Friendly
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Do not post content that is obscene, vulgar, graphic, or sexually
              explicit (NSFW). As a 13+ community with Christian fellowship
              values, we require a positive and appropriate atmosphere for all
              ages.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Flag className="w-4 h-4 text-chart-3" />
                No Public Accusations
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Do not use the forums to publicly accuse other players of
              misconduct. Use the official reporting tools or private report
              forms on our website instead.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 2: Safe & Positive Environment */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <h2 className="font-display text-2xl font-bold">
            2. Safe and Positive Environment
          </h2>
        </div>
        <p className="text-muted-foreground">
          Help us keep the community a productive and enjoyable place to be.
          Under 13s will be promptly removed from the community if we find out
          that explicit parental consent was not given. U13 accounts may only be
          permitted if the parent/guardian has given explicit consent.
        </p>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Protect Privacy</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Do not share your own or anyone else's private information (real
              names, addresses, phone numbers, etc.). Doxxing is strictly
              forbidden and will result in a permanent ban.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Stay On Topic</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Post your threads in the correct forum category. Do not derail
              threads with off-topic discussions, flame wars, or trolling.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">No Spamming</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Do not spam the forums. This includes repeatedly posting the same
              message, excessively bumping old threads, or creating posts for
              commercial advertising without permission.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                No Illegal or Harmful Content
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Do not post content that is illegal, promotes illegal activity, or
              discusses cheats, game exploits, or malicious software.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 3: User Content & Responsibility */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          3. User Content and Responsibility
        </h2>
        <p className="text-muted-foreground">
          You are responsible for the content you create and post on our
          platform.
        </p>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Respect Copyright</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Do not post content that you do not own the rights to, such as
              pirated materials or copyrighted images and text.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Appropriate Profiles</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Your username, avatar, signature, and profile content must adhere
              to these guidelines. Inappropriate profiles will be reset by
              staff.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">No Impersonation</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Do not impersonate any member of the Rivet Studios staff, another
              community member, or any real-world person.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 4: Enforcement & Reporting */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          4. Enforcement and Reporting
        </h2>
        <p className="text-muted-foreground">
          Our volunteer and administrative staff work to ensure these guidelines
          are followed.
        </p>

        <div className="grid gap-4">
          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Use the Report Button
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              If you see a post or a user violating these rules, please use the
              "Report" button to notify our moderation team privately. This is
              the fastest and most effective way to address issues.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Consequences</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Breaking these rules can lead to content removal, a formal
              warning, temporary suspension from the forums, or a permanent ban
              from all Rivet Studios services, as determined by our moderation
              staff.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Final Say</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              The decisions of the moderation staff are final. Arguing with or
              publicly disrespecting staff members regarding a moderation action
              is not permitted. If you have an issue, please use the appropriate
              appeal process.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Closing */}
      <Card className="bg-gradient-to-r from-primary/10 to-chart-3/10 border-primary/20">
        <CardContent className="p-6 text-center">
          <p className="text-lg">
            Thank you for being part of the Rivet Studios community and for
            helping us make this a great place for everyone. We're glad you're
            here!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
