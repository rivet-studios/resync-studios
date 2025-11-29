import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Shield, Radio, Target } from "lucide-react";

export default function LEOGuidelines() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mx-auto gap-2">
          <Shield className="w-3.5 h-3.5" />
          Emergency Services
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">Emergency & LEO Guidelines</h1>
        <p className="text-lg text-muted-foreground">
          Official guidelines for Law Enforcement and Emergency Services personnel
        </p>
      </div>

      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
            <div>
              <p className="font-semibold mb-2 text-blue-600">Department Customization</p>
              <p className="text-muted-foreground text-sm">
                These rules will guide you to the proper use of your position. Department guidelines can vary as each team is vastly 
                different with both of our games, LA and Perris. Departments are allowed to modify these rules in an exceptional manner. 
                However, these rules should stay within the guidelines in other department server guidelines.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* [1] Code of Conduct */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">Code of Conduct</h2>
        
        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Professionalism</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Emergency Services personnel must maintain professionalism at all times, both on-duty and off-duty. This includes 
              how you speak to players, respond to situations, and represent your department.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Abuse of Power</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Using your position to gain unfair advantages, harass players, or interfere with unrelated RP is strictly prohibited.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Chain of Command</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Follow all lawful orders from higher-ranking personnel. Disputes should be taken to internal command channels or 
              reported to staff if necessary.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Corruption RP</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You may only engage in corrupt behavior if it has been pre-approved by an Official Team Member or Developer.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Community Interaction</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Treat all civilians fairly. Use escalation only when necessary. Avoid being overly aggressive or controlling without 
              justification.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* [2] Radio & Communication */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Radio className="w-6 h-6 text-primary" />
          <h2 className="font-display text-2xl font-bold">Radio & Communication Protocols</h2>
        </div>
        
        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Radio Clarity</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Keep radio communications clear and concise. Avoid cluttering the channel with unnecessary chatter during active situations.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Call Sign Usage</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Use your proper in-game unit call sign (e.g., 2A-24, Medic-2) when communicating on radio. This helps with organization 
              and chain-of-command clarity.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Priority Traffic</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              During critical incidents, request "priority radio" if needed. All non-essential radio traffic must cease until the 
              scene is cleared or command ends the priority.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status Updates & Scene Transfers</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Regularly update dispatch on your status. If handing off responsibility to another unit, clearly state that over 
              the radio so both sides acknowledge.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* [3] Patrol & Scene Behavior */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">Patrol & Scene Behavior</h2>
        
        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Purposeful Patrol</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Emergency Services personnel must have a valid in-character reason for their patrol. Do not drive aimlessly or insert 
              yourself into RP scenes without justification.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Non-Escalation & Scene Assessment</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Upon arriving to a scene, assess the situation before acting. Do not immediately jump into action or assume control 
              unless your role requires it. Do not escalate unless there is clear and direct threat.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Role Respect & Scene Command</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Respect the role of other departments. Police handle law enforcement; EMS handles treatment. In large incidents, follow 
              the direction of the commanding officer on scene, even if from another department.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">RP Engagement</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You are expected to engage in meaningful, realistic roleplay. Don't stand around silently or act robotic during scenes.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* [4] Use of Force & Weapons */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-primary" />
          <h2 className="font-display text-2xl font-bold">Use of Force & Weapon Authorization</h2>
        </div>
        
        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Use of Force Continuum</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Force must always match the threat. Start with verbal commands, escalate to non-lethal force (e.g., taser), and only 
              use lethal force if your life or others' lives are in immediate danger.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Drawing & Firing Weapons</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Do not draw your firearm unless you suspect a threat. You may only fire when someone poses a direct and immediate threat. 
              Verbal de-escalation must be attempted first unless unsafe.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Taser Usage</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Tasers may only be used when the suspect is actively resisting or fleeing. You may not tase someone who is facing you 
              with a weapon unless it is holstered or they are running at you with a knife.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Prohibited Force Tactics</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>Warning shots are NOT allowed.</strong> You must make a clear decision to engage or not.</p>
              <p><strong>Do not use vehicles as weapons.</strong> Ramming, blocking, or PIT maneuvers should only be used in high-risk 
              situations where it's safe to do so.</p>
              <p><strong>Crossfire awareness:</strong> Never shoot into crowds, through teammates, or without a clear shot.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* [5] Jurisdiction & Boundaries */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">Jurisdiction & Boundaries</h2>
        
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground space-y-3">
            <p><strong>Stay Within Role:</strong> Stick to your department's jurisdiction. Do not interfere with tasks outside your role.</p>
            <p><strong>Department Zones:</strong> Each department operates in clearly defined zones. Do not act outside your assigned 
            zone unless mutual aid is requested.</p>
            <p><strong>Mutual Aid:</strong> You may assist other departments only if requested or if the situation presents immediate 
            danger to life.</p>
            <p><strong>Scene Ownership:</strong> The first unit on scene may take initial control, but must hand over to a higher-ranking 
            or more relevant department once they arrive.</p>
            <p><strong>Instanced Areas:</strong> Do not enter interiors unless there is a valid RP reason and your department is allowed.</p>
          </CardContent>
        </Card>
      </div>

      {/* [6] Arrests & Detainments */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">Arrests & Detainments</h2>
        
        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Probable Cause Requirement</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You must have valid in-character probable cause (witnessed crime, 911 report, etc.) before detaining or arresting any individual.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Use of Restraints</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Only use handcuffs, zipties, or restraints if the individual is non-compliant or poses a threat. Do not cuff players for 
              minor offenses without cause.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Rights & Processing</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Inform the player of why they are being detained or arrested. Process suspects in a realistic and timely manner. Avoid 
              dragging situations or stalling. Do not keep individuals restrained without moving RP forward.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Confiscation & Escalation</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Only confiscate items relevant to the crime. Do not take items out of revenge. Arrests should not escalate into shootings 
              unless the suspect pulls a weapon or attempts serious harm.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* [7] Medical & Fire Response */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">Medical & Fire Response Guidelines</h2>
        
        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">EMS Priority & Entry Timing</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              EMS must focus solely on providing medical assistance. You are not law enforcement. Do not enter active crime or 
              combat scenes until confirmed safe by Law Enforcement.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Firefighter Role</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Firefighters may only extinguish fires and secure hazard zones. You may not act as law enforcement or detain players.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Combat Treatment & Patient Refusal</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              EMS may not treat individuals actively in combat. Wait until the scene is cleared. Players may refuse treatment unless 
              unconscious or incapacitated. Respect their choice unless doing so would break RP realism.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Mass Casualty Incidents</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              In large events, prioritize treatment by severity. Request additional EMS units if needed. Clearly communicate status 
              and location over radio during transport and handoffs.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* [9] Equipment & Vehicles */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">Equipment Usage & Vehicle Conduct</h2>
        
        <div className="grid gap-4">
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground space-y-2">
              <p><strong>Use Issued Equipment Only:</strong> Use only equipment issued to your department. Do not spawn or use 
              weapons/items not meant for your role.</p>
              <p><strong>Responsible Driving:</strong> All emergency vehicles must be driven responsibly, even with lights/sirens active.</p>
              <p><strong>Emergency Lighting:</strong> Only activate lights/sirens when responding to active emergencies or transporting.</p>
              <p><strong>Vehicle Blocking:</strong> Roadblocks must serve a valid RP purpose. Don't use them to trap or troll players.</p>
              <p><strong>Unauthorized Use:</strong> Do not use other department vehicles. Stay within your assigned assets.</p>
              <p><strong>Aerial Units:</strong> Helicopters or drones may only be used by authorized personnel under strict RP needs.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* [8] Instanced Properties */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">Instanced Properties & Entering Buildings</h2>
        
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground space-y-2">
            <p><strong>Entry Without Cause:</strong> You may not enter interiors without valid in-character reason. Curiosity alone is not enough.</p>
            <p><strong>Law Enforcement Entry:</strong> Police and SWAT may only enter with a search warrant, direct pursuit, or if an emergency 
            (e.g., shots fired inside) justifies forced entry.</p>
            <p><strong>EMS/Fire Entry:</strong> EMS and Firefighters may only enter if dispatched to a medical/fire emergency inside.</p>
            <p><strong>Scene Preservation:</strong> Do not tamper with property unless it's part of the RP.</p>
            <p><strong>Stacking Entry:</strong> Do not enter a property in large numbers unless justified by the scene.</p>
            <p><strong>Re-entry Rules:</strong> If you die inside during a raid, you may not return unless revived or instructed by command/staff.</p>
          </CardContent>
        </Card>
      </div>

      {/* Department-Specific */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">Department-Specific Notes</h2>
        
        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Police Department</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Patrol city zones, respond to 911 calls, conduct traffic stops, investigate suspicious activity. Tickets must match the offense. 
              Vehicle pursuits must be based on RP cause. Highest-ranking officer on scene takes control.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">SWAT</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Specialized unit for high-risk operations. Only deployed for critical situations. Strict chain of command and 
              coordination required.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Fire Department</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Handle fire suppression, rescue operations, and hazard mitigation. Do not interfere with law enforcement. Coordinate 
              with other agencies on scene.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">EMS / Paramedics</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Focus on medical assistance and patient care. Maintain neutrality. Request scene clearance before entering active 
              incidents.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Department of Corrections</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Manage facilities and prisoner custody. Follow institutional protocols. Maintain security and order in assigned zones.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="p-6 text-center space-y-3">
          <p className="text-lg font-semibold">Emergency Services Excellence</p>
          <p className="text-muted-foreground text-sm">
            These guidelines ensure professional, realistic roleplay for all emergency services. Adherence to these standards 
            maintains community trust and creates an immersive experience for all players.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
