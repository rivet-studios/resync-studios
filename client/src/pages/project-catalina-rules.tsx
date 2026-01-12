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
  Gavel,
  Users,
  Shield,
  AlertTriangle,
} from "lucide-react";

export default function ProjectCatalinarules() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mx-auto gap-2">
          <BookOpen className="w-3.5 h-3.5" />
          Server Rules
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Project Catalina Rules
        </h1>
        <p className="text-lg text-muted-foreground">
          Official roleplay standards and expectations for all players
        </p>
      </div>

      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-destructive mt-1 shrink-0" />
            <div>
              <p className="font-semibold mb-2 text-destructive">
                Serious Roleplay Environment
              </p>
              <p className="text-muted-foreground text-sm">
                Project Catalina is a serious roleplay environment with a strong
                focus on realism, immersive storytelling, and consistent
                character portrayal. All rules are enforced using a common-sense
                approach—if an action is clearly disruptive, unrealistic, or
                breaks immersion, it will be treated as a violation even if not
                explicitly listed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section I: General Roleplay Rules */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Gavel className="w-6 h-6 text-primary" />
          <h2 className="font-display text-2xl font-bold">
            I. General Roleplay Rules & Player Guidelines
          </h2>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Serious Roleplay Standard
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              All actions must be grounded in realism. Low-quality RP (killing
              without reason, VDM, cop baiting, trolling, non-serious dialogue,
              meme behavior) is prohibited. Violations result in warnings,
              kicks, or bans depending on severity.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Staying In Character (IC)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You must remain in-character at all times. Finish the RP scene
              even if a rule is broken and report it afterward through proper
              channels. Breaking character prematurely results in warnings,
              kicks, or temporary bans.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Metagaming (MG)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Using OOC (Out-of-Character) information such as streams, Discord,
              or other external sources to influence your IC decisions is
              strictly forbidden. This can result in severe punishments
              including permanent bans.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Powergaming (PG)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Forcing actions on others without giving them a chance to respond
              or performing unrealistic/impossible actions is not allowed. All
              roleplay must allow for player interaction and realistic outcomes.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Combat Logging</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Leaving the game or disconnecting to avoid RP, arrest, injury, or
              consequences is strictly prohibited. Violations result in
              temporary bans of up to 10 days.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Fail RP (FRP)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Actions that break immersion or make no sense are considered Fail
              RP (e.g., ignoring major injuries, unrealistic escapes).
              Violations result in warnings, kicks, or temporary bans.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Exploiting & Glitch Abuse
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Using bugs, exploits, or third-party mods for an advantage is not
              allowed and must be reported immediately. Exploitation results in
              permanent bans.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Fear RP (FRP)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You must realistically fear for your life in threatening
              situations. For example, you must comply when at gunpoint unless
              you have a reasonable IC justification to do otherwise. Violation
              results in warnings or kicks.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Random/Unrealistic Acts
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Committing serious crimes without motive or build-up ("chaos RP")
              is prohibited. All actions need a logical IC reason and
              progression. Mass casualty acts result in permanent bans.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Stream Sniping</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Using a live stream to gain an advantage over another player is
              strictly prohibited and results in immediate permanent bans.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                OOC Drama & Harassment
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              OOC drama, harassment, toxicity, and personal conflicts are
              prohibited on all platforms. Violations result in temporary or
              permanent bans depending on severity.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section II: Character Requirements */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <h2 className="font-display text-2xl font-bold">
            II. Character Requirements
          </h2>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Age Requirement</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              All players must be 13+ years old with prior serious RP
              experience. Lying about age results in permanent bans from all
              Rivet Studios games.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Realistic Names</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Characters must have a realistic "First Last" name. Meme names,
              pop culture references, or offensive names are prohibited.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Character Backgrounds</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Characters must have a plausible and consistent backstory.
              Overpowered or unrealistic backgrounds are not allowed without
              explicit staff approval.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Multiple Characters</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Each character must be unique. You cannot transfer items,
              knowledge, or use alternate characters to avoid consequences.
              Violations result in permanent bans on all accounts.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Perma-Death Rule</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              If a character dies in a confirmed perma-death scenario, they
              cannot return. Bypassing this rule results in temporary or
              permanent bans depending on severity.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section III: Law Enforcement Rules */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <h2 className="font-display text-2xl font-bold">
            III. Law Enforcement Rules & Standards
          </h2>
        </div>

        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="p-6 text-sm text-muted-foreground">
            <p className="font-semibold text-orange-600 mb-2">
              Important Note:
            </p>
            <p>
              Violations of LEO rules often result in removal from the
              department and an LEO blacklist in addition to standard server
              punishments.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Professionalism & Abuse of Power
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              LEOs must maintain the highest level of professionalism. Using
              your LEO position for harassment, personal gain, or unfair
              advantage results in temporary bans + LEO blacklist or permanent
              bans + permanent LEO blacklist.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Probable Cause Requirement
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              All arrests must be based on valid, verifiable IC probable cause.
              Arresting without cause is abuse of authority and results in
              temporary bans + LEO blacklist.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Proportional Use of Force
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Force must be proportional to the threat. Lethal force is only
              justified when there is a direct and immediate threat to human
              life. Excessive force results in retraining, 7-30 day LEO
              blacklist, or permanent LEO blacklist.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Dead Checking & Execution-Style Acts Prohibited
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Firing on or striking a downed, incapacitated, or restrained
              suspect is forbidden. Harming a compliant or restrained suspect
              results in permanent removal from LEO roles and community bans.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Corruption RP Approval Required
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              All corruption RP (bribes, planting evidence) must be pre-approved
              by a Corporate Member. Unauthorized corruption results in
              permanent bans + permanent LEO blacklist.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Duty to Intervene</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Officers must stop and report clear excessive force used by
              another officer. Failure to do so is considered misconduct.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section IV: Emergency Services Rules */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          IV. Emergency Services Rules & Standards
        </h2>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Role Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              EMS handles medical; Fire handles fires/rescues. Neither role may
              act as law enforcement (no arrests, searches, etc.). Violations
              result in warnings, temporary bans, and role blacklists.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Scene Safety</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              EMS/Fire must wait for law enforcement to declare a scene "safe"
              before entering active crime scenes.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Neutrality in Criminal Situations
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              EMS and Fire must remain neutral parties in criminal situations,
              providing aid to anyone regardless of their role or criminal
              status.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Realistic Medical Treatment
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              All medical care must be fully and realistically roleplayed.
              "One-line revives" or unrealistic treatment is prohibited.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section V: Criminal Roleplay Rules */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          V. Criminal Roleplay Rules & Standards
        </h2>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Realistic Crime RP</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              All criminal acts must be plausible, well-planned, and have a
              clear IC motive. "Chaos for chaos's sake" is not allowed.
              Violations result in warnings or temporary bans.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                New Life Rule (NLR) & Revenge
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              After death, you cannot return to the same scene or retaliate
              against your killer. This prevents revenge cycles and ensures
              roleplay progression. Violations result in warnings, kicks, or
              temporary bans.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Hostage & Robbery Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Hostages must be treated realistically. Demands must be
              reasonable. Killing hostages without a strong IC reason is
              prohibited.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Explosives & Heavy Weapons Prohibited
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Use of explosives or heavy weapons is strictly forbidden unless
              part of a staff-approved event. Unauthorized use results in
              permanent bans.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Punishment Scale */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-primary" />
          <h2 className="font-display text-2xl font-bold">Punishment Scale</h2>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Class A (Minor Offenses)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Warning, Kick, or Timeout. Reaching the maximum count leads to a
              Class B punishment.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Class B (Moderate Offenses)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Temporary Ban. Duration depends on severity and history. Can range
              from 24 hours to 30+ days.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Class C (Severe Offenses)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Permanent Ban. Reserved for serious violations such as
              exploitation, permanent bans from roles, or repeated severe
              offenses.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="p-6 text-center space-y-3">
          <p className="text-lg font-semibold">Common Sense Approach</p>
          <p className="text-muted-foreground text-sm">
            All rules are enforced using a common-sense approach. Ignorance of
            the rules is never an excuse. If an action is clearly disruptive,
            unrealistic, or breaks immersion, it will be treated as a violation.
            Staff discretion applies to ensure a quality roleplay experience for
            all players.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
