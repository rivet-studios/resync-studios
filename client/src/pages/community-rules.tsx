import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, BookOpen, Users, Heart } from "lucide-react";

export default function CommunityRules() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mx-auto gap-2">
          <Heart className="w-3.5 h-3.5" />
          Community Standards
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Community Rules
        </h1>
        <p className="text-lg text-muted-foreground">
          Official rules and guidelines for Rivet Studios community members
        </p>
      </div>

      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
            <div>
              <p className="font-semibold mb-2 text-blue-600">
                Community Standards
              </p>
              <p className="text-muted-foreground text-sm">
                Just like any good community, rules and guidelines help keep
                things running well. Rivet Studios, we want a respectful, kind,
                and friendly space for everyone. Please follow our Rules and
                Terms of Use whenever you're part of the community. We may stop
                or remove your access at any time if you break these rules.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Community Rules */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          Core Community Rules
        </h2>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                1. Respectful Content Only
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              No excessive profanity, sexual/illicit content, threats, hate
              speech, or copyright infringement.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">2. No Discrimination</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Discrimination based on race, gender, religion, disability, or
              orientation is never allowed.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">3. Be Respectful</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              No personal attacks or passive-aggressive behavior. If needed,
              ignore and report users.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">4. Constructive Posts</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Keep posts on-topic. If you disagree, explain why. Don't just say
              "search it up."
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">5. Don't Retaliate</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Report harassment to staff. Don't reply publicly or engage back
              and forth.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">6. English Only</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              All posts must be in English unless otherwise permitted with
              translation.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">7. Don't Bump Threads</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Only bump if adding meaningful input. Avoid posting in old threads
              without good reason.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                8. No Advertising or Trading
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Selling, advertising, or promoting products/services is not
              allowed.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">9. Privacy First</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Don't post personal info or private discussions without consent.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                10. Follow Staff Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              If a staff member tells you to stop, do so immediately or delete
              the message.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">11. Staff Disputes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Contact staff privately or through Internal Affairs. Public staff
              complaints will be removed. Use the designated staff report forums
              to report our moderators.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                12. One Account Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Only one account per person. Alts will be banned.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                13. No Drama or Flame Wars
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Take complaints to staff privately or report users in the
              designated report forum. Don't stir up public conflicts.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                14. Political Discussion
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Allowed if respectful, relevant, and not dominant. Keep it civil.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                15. Thread Participation
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Only post in threads you started, were tagged in, or have evidence
              for. You may reply to posts, topics, or threads posted in the
              community section.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                16. No Spoilers Without Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              No major spoilers for 14 days after release unless clearly tagged.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                17. Account Responsibility
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You are responsible for all activity on your account. Keep it
              secure. "My cousin was using my account" is not acceptable.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">18. No Impersonation</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Don't pretend to be staff or misrepresent your role. Accounts
              caught impersonating will be promptly removed from the community.
              You can verify a staff member by checking their profile or discord
              roles.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Conduct & Fairness Rules */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          Enhanced Conduct & Fairness Rules (19-30)
        </h2>

        <div className="grid gap-4">
          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                19. Abuse of Position / Influence
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Those in staff or leadership roles may not use their rank to
              manipulate, intimidate, or retaliate against community members.
              This includes using your role to silence others, threatening to
              remove roles/perks, or coordinating group exclusion.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                20. Passive-Aggressive Behavior
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Messages meant to mock, embarrass, or provoke others are
              punishable. Intent matters more than specific words. If your
              actions consistently stir tension, staff may step in.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                21. No Grouping to Isolate Others (Cliquing)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Creating cliques that exclude or target others is not allowed. We
              want an open, welcoming community, not one ruled by favoritism or
              division.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                22. Public Role/Rank Complaints Prohibited
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Questions or complaints about staff roles must go through proper
              channels. Use Internal Affairs or Staff Feedback form. Keep drama
              out of public areas.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                23. Staff Conduct Applies 24/7
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Staff are expected to uphold community standards at all times—even
              when "off duty." No trash-talking or stirring drama. Your actions
              reflect the community.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                24. Indirect Harassment / Dogpiling
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Encouraging others to isolate, mock, or target a member is
              considered harassment. You are accountable for the impact of your
              words, even if you don't say it outright.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                25. Undermining Staff Decisions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Questioning or criticizing moderation outcomes in public chat is
              not allowed. Appeals must go through formal tickets or staff
              reports.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                26. Reputation Farming & Popularity Abuse
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Do not exploit your status to manipulate decisions or staff
              outcomes. Your position does not place you above the rules. This
              applies to staff, contributors, and large creators.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                27. Excessive Public Roleplay of Real Conflict
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Turning real staff conflict into roleplay jokes is not allowed.
              Using RP as a loophole to mock staff decisions is prohibited. Keep
              real issues out of roleplay.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                28. Staff Cliques May Be Investigated
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              If staff behavior shows consistent favoritism, groupthink, or
              retaliation, we may open an internal review. We are committed to
              fairness, not just rule compliance.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                29. Off-Duty Doesn't Mean Off-Limits
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Staff are expected to maintain professionalism in all community
              spaces. You may not stir drama while claiming to be "off shift" or
              use alternate accounts to avoid accountability.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                30. Weaponizing Mental Health or Personal Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You may not use sensitive topics to manipulate decisions or gain
              special treatment. We support mental health—but not when it's used
              as a shield to avoid accountability.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Community Standards */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          Additional Community Standards (31-40)
        </h2>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                31. Community Stirring via Third-Party Servers
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Creating or using third-party discords to discuss drama or
              organize harassment is not allowed. We'll moderate third-party
              drama if it affects our platform.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                32. Staff Interpersonal Drama Must Be Reported
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              If you're a staff member having tension with another staffer, take
              it to management or Internal Affairs—not to chat. You are held to
              a higher standard when handling conflict.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                33. No Chain Retaliation or Loyalty Voting
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Once disciplinary action is taken, you may not retaliate by
              quitting in mass or refusing to cooperate. Each situation is
              handled individually. Chain loyalty pressure is unacceptable.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                34. Roleplay Rank Does Not Equal Real Authority
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Holding a high in-game rank does not grant real-world authority.
              All players must treat each other with respect, regardless of
              in-game hierarchy. Misusing in-game rank to intimidate is
              prohibited.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                35. No Gatekeeping or Elitism
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Disparaging players for their experience level or playstyle is not
              allowed. Comments like "You're not a real role-player" are
              considered gatekeeping and will be moderated.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                36. Respect for OOC Boundaries
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              All players must respect others' out-of-character boundaries.
              Forcing players into uncomfortable scenarios or ignoring safe
              words is strictly prohibited. Consent is paramount.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                37. No Off-Platform Harassment
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Harassing, stalking, or bullying players outside the platform is
              strictly forbidden. This includes creating or sharing content that
              targets or mocks other community members. Penalties for
              off-platform harassment involves an account termination & report
              to the eSafety Commissioner.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                38. Accountability for All Members
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              All community members are held to the same standards. Favoritism,
              nepotism, or shielding individuals due to their position is not
              tolerated.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                39. Clear Separation Between IC and OOC
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Players must distinguish between IC and OOC actions. Using IC
              scenarios to justify OOC hostility is unacceptable. Maintain
              professionalism in all interactions.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                40. Mandatory Training for Leadership Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Individuals seeking leadership positions must undergo training on
              community guidelines, conflict resolution, and proper conduct to
              handle responsibilities ethically.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <Card className="bg-gradient-to-r from-primary/10 to-chart-3/10 border-primary/20">
        <CardContent className="p-6 text-center space-y-3">
          <p className="text-lg font-semibold">Community First</p>
          <p className="text-muted-foreground text-sm">
            These rules exist to create a respectful, welcoming space for all
            community members. Everyone is held to the same standard, and we're
            committed to fair enforcement. If you have questions about any
            rules, please contact staff through proper channels.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
