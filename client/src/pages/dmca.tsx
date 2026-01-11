import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Shield, Mail, FileText } from "lucide-react";

export default function DMCAPolicy() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mx-auto gap-2">
          <Shield className="w-3.5 h-3.5" />
          Intellectual Property
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          DMCA Policy
        </h1>
        <p className="text-lg text-muted-foreground">
          Understanding DMCA claims and content takedowns
        </p>
      </div>

      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-destructive mt-1 shrink-0" />
            <div>
              <p className="font-semibold mb-2 text-destructive">
                What This Policy Covers
              </p>
              <p className="text-muted-foreground text-sm">
                If your game was taken down due to a DMCA claim by Resync
                Studios, it means we identified content that potentially
                infringes on intellectual property owned by us or one of our
                affiliated clients.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Common Reasons for Takedowns */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          Common Reasons for DMCA Takedowns
        </h2>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Use of Rivet Studios Assets
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                One of the most common reasons for takedown is the use of assets
                that belong to Rivet Studios. This includes:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>3D models and textures</li>
                <li>UI elements and graphics</li>
                <li>Scripts and code</li>
                <li>Sound effects and music</li>
                <li>Any content originally created for our projects</li>
              </ul>
              <p className="mt-2">
                If any of these assets were used without permission, the game
                may have been flagged for removal by Rivet Studios' Copyright
                Team.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Use of Affiliated Client Content
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                Rivet Studios works with other game developers to protect their
                intellectual property. If your game includes assets, scripts, or
                concepts from one of our affiliate clients without
                authorization, it may be subject to takedown.
              </p>
              <p className="mt-3">
                We actively protect the intellectual property rights of our
                affiliated partners and clients.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Similarity to Existing Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                In some cases, a game may be taken down due to its similarity to
                one of our projects. Even if no direct assets are used, if the
                gameplay mechanics, branding, or overall experience are
                substantially similar to protected content, the game may be
                flagged.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Appeal Process */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          If You Believe a Takedown Was Incorrect
        </h2>

        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Filing a Counter-Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              If you believe your game was taken down by mistake, you have
              options:
            </p>
            <div className="space-y-3 mt-4">
              <div>
                <p className="font-semibold text-foreground mb-1">
                  Through Roblox DMCA Process
                </p>
                <p>
                  You can submit a counter-notification through Roblox's
                  official DMCA process.
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">
                  Direct Contact with Rivet Studios
                </p>
                <p>
                  Contact our Copyright Team at{" "}
                  <span className="font-mono text-primary">
                    dmca@resyncstudios.com
                  </span>{" "}
                  or by opening a DMCA support ticket with details about:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                  <li>Your game details</li>
                  <li>Why you believe the takedown was incorrect</li>
                  <li>
                    Proof that you own the disputed assets or have permission to
                    use them
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-orange-600">
              Important Legal Warning
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Filing a false counter-notification can have serious legal
              consequences. Only proceed if you are certain that:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-3">
              <li>The takedown was made in error</li>
              <li>You own all disputed assets, OR</li>
              <li>
                You have documented permission from the copyright holder to use
                the content
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* What We Protect */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          What Rivet Studios Protects
        </h2>

        <Card>
          <CardContent className="p-6 space-y-3 text-sm text-muted-foreground">
            <p>
              Rivet Studios actively protects intellectual property in the
              following categories:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Original game code and systems</li>
              <li>3D models, textures, and visual assets</li>
              <li>Audio files, music, and sound effects</li>
              <li>UI design and user interface elements</li>
              <li>Game mechanics and systems design</li>
              <li>Brand identity and trademarks</li>
              <li>Content created for affiliated partners</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* How to Avoid Takedowns */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          How to Avoid DMCA Issues
        </h2>

        <div className="grid gap-4">
          <Card>
            <CardContent className="p-6 space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">
                ✓ Create Original Content
              </p>
              <p>
                Develop your own unique assets, code, and game mechanics rather
                than reusing existing content without permission.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">
                ✓ Obtain Proper Licensing
              </p>
              <p>
                If you want to use existing content, ensure you have explicit
                written permission from the copyright holder.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">
                ✓ Use Licensed Resources
              </p>
              <p>
                Utilize assets from legitimate sources with proper licensing
                agreements (royalty-free, creative commons, etc.).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">
                ✓ Properly Attribute Content
              </p>
              <p>
                When required, always properly credit and attribute the creators
                of any content you use with permission.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">
                ✓ Document Your Ownership
              </p>
              <p>
                Keep records of all your original work, source files, and any
                licenses or permissions you have for external content.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Info */}
      <Card className="bg-gradient-to-r from-primary/10 to-chart-3/10 border-primary/20">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div>
              <p className="font-semibold mb-2">Get in Touch</p>
              <p className="text-muted-foreground text-sm mb-3">
                If you have questions about our DMCA policy or need assistance:
              </p>
              <p className="text-sm">
                <span className="font-semibold">Email:</span>{" "}
                <span className="font-mono">dmca@resyncstudios.com</span>
              </p>
              <p className="text-sm mt-2">
                <span className="font-semibold">Ticket Contact:</span> Visit the
                support portal and open a ticket with your inquiry
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="border-border/50">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-2">
            Protecting Our Community
          </p>
          <p>
            Rivet Studios is committed to protecting intellectual property
            rights and maintaining a fair environment for all creators. For more
            details on our intellectual property policies, please review our
            comprehensive legal documentation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
