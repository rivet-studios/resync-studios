import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, Users, Zap, AlertCircle } from "lucide-react";

export default function Serrano() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mx-auto gap-2">
          <MapPin className="w-3.5 h-3.5" />
          New Title
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Project Serrano
        </h1>
        <p className="text-lg text-muted-foreground">
          New County RP Project - Original title, inspired Project Ventura
        </p>
      </div>

      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            Many have questions about Project Serrano and hopefully this
            should show where development stands and what the community is
            wanting to see. We will discuss features that Project Serrano will
            have, along with planned features. We will also discuss what perks
            donators will have.
          </p>
        </CardContent>
      </Card>

      {/* Corporation Projects */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          Upcoming Titles
        </h2>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Project Rosewood</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <Badge className="mb-2">In Development</Badge>
              <p>
                New County RP Project in the works with comprehensive department
                structure, realistic roleplay systems, and community-focused
                gameplay.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Law Enforcement Departments */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-primary" />
          <h2 className="font-display text-2xl font-bold">
            Law Enforcement Departments
          </h2>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Rosewood Highway Patrol
                </CardTitle>
                <Badge variant="secondary">WHITELISTED (XP requirement)</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                RHP will have one station. You will spawn at the main station, but can refill
                fuel, ammo, and other items at any department.
              </p>
              <p className="text-xs text-muted-foreground">
                The main RHP station does not have a jail. To book an inmate, transport them to the Serrano County Jail. </p>
              <p className="text-sm text-orange-500">
                The minimum XP required to access this team is 250
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                 Serrano County Sheriff's Department
                </CardTitle>
                <Badge variant="outline">OPEN</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Two main stations. Serves county law enforcement needs.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Florence City Police Department
                </CardTitle>
                <Badge variant="secondary">WHITELISTED (Playtime  requirement)</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              One main station. Primary city law enforcement authority.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Port Authority Police Department
                </CardTitle>
                <Badge variant="secondary">PREMIUM</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              One main station. Handles all incidents involving locomotives,
              railcars, tracks, and the entirety of Port of Florence.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fire Department */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">Fire & Medical</h2>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Rosewood State University, Department of Health (RSU)
                </CardTitle>
                <Badge variant="outline">OPEN</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
             Two hospitals (Florence Memorial Community Hospital & Westbrook Regional Medical Center) covering county medical services and emergency response.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Florence City Fire Department & Serrano County Fire Agency (FCFD & SCFA)
                </CardTitle>
                <Badge variant="secondary">OPEN</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Station 128 (FCFD) and station 135 (SCFA) . City & county level fire services and rescue operations.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* State Departments */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">State Departments</h2>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Rosewood Department of Corrections
                </CardTitle>
                <Badge variant="secondary">MERGED W/ SCSD</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Tasked with picking up and transporting incarcerated inmates from
              select detention centers to the primary jail facility.
            </CardContent>
          </Card>

      <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Rosewood Bureau of Investigation  (SBI)</CardTitle>
                <Badge variant="outline">WHITELISTED (XP requirements)</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              (SBI) will be a state-wide investigation agency. They will be tasked with investigating capital & felony crimes. They have no authority over civilians unless involved with a capital or felony crime. They have authority over all law enforcement agencies, fire agencies, and EMS agencies, and may cite or arrest LEO, FD, EMS regardless of crime committed and level of offense.
            </CardContent>
          </Card>
        

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Public Transport Serrano (PT-S)</CardTitle>
                <Badge variant="secondary">PREMIUM</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Tasked with maintaining roads and infrastructure:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Fixing potholes on freeways and roadways</li>
                <li>Changing traffic patterns and signals</li>
                <li>Changing road signs</li>
                <li>Providing public transport</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Private Companies */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">Private Companies</h2>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Serrano Asset Protection (SAP)</CardTitle>
                <Badge variant="outline">OPEN</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Private security services for businesses and clients throughout Serrano County, Rosewood.
            "The locals warned you.. Don't try it at the Target on 5th, 'The Saps' are heavy on the cameras today.
              But you didn't listen.. and regretted it.."
            </CardContent>
          </Card>


          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Silent Precision Firearms</CardTitle>
                <Badge variant="secondary">OPEN</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p className="text-sm text-muted-foreground">
                  Sell guns, melee, handle firearm licensing, and more </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <Card className="bg-gradient-to-r from-primary/10 to-chart-3/10 border-primary/20">
        <CardContent className="p-6 text-center space-y-3">
          <p className="text-lg font-semibold">Project Rosewood Development</p>
          <p className="text-muted-foreground text-sm">
            More updates and features coming soon. Stay tuned for announcements
            about department roles, gameplay mechanics, and premium perks.
          </p>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
