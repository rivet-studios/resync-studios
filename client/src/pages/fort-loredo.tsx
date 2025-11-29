import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, Users, Zap, AlertCircle } from "lucide-react";

export default function FortLoredo() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mx-auto gap-2">
          <MapPin className="w-3.5 h-3.5" />
          New Project
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">Fort Loredo</h1>
        <p className="text-lg text-muted-foreground">
          New County RP Project - Corporate Rebrand Information & Features
        </p>
      </div>

      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            Many have questions about the Corporate Rebrand and hopefully this should show where development stands and what 
            the community is wanting to see. We will discuss features that Fort Loredo will have, along with planned features. 
            We will also discuss what perks donators will have.
          </p>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">Basic Information</h2>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Team Roster System</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              To change teams you will have to drive to a department station or job and fill out your name on a roster. 
              If the team is full then your name will be added to a Queue system.
            </p>
            <p>
              When someone leaves or ends their shift the next person queued will be allowed on the team. You will have 
              <span className="font-semibold"> 5 minutes</span> to drive to the station to claim your roster spot, or it will go to the next player in line.
            </p>
            <p className="font-semibold text-primary">
              Premium members will be able to bypass the team limit with some restrictions.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Corporate Rebrand */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">Corporate Rebrand</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Website Rebrand</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>Theme Changes:</strong> Modernised the look & feel of our brand & website</p>
              <p><strong>Corporate Rebrand:</strong> We have rebranded to "REALM Studios"</p>
              <p><strong>RS Logo:</strong> New logo rebrand</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Company Rebrands</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p className="text-destructive font-semibold">Discontinuation Notice:</p>
              <p>Owls & K-V Studios have been discontinued until further notice.</p>
              <p className="text-xs">More updates coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Corporation Projects */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">Corporation Projects</h2>
        
        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">The Highville Project</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <Badge className="mb-2">UPDATE: Back in Development</Badge>
              <p>
                The Highville Project has officially made a return to active development.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Fort Loredo - New County RP</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <Badge className="mb-2">In Development</Badge>
              <p>
                New County RP Project in the works with comprehensive department structure, realistic roleplay systems, 
                and community-focused gameplay.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Law Enforcement Departments */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-primary" />
          <h2 className="font-display text-2xl font-bold">Law Enforcement Departments</h2>
        </div>
        
        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">California Highway Patrol</CardTitle>
                <Badge variant="secondary">PREMIUM</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                CHP will have two stations: one main station and one smaller sub-station. You will spawn at the main station, 
                but can refill fuel, ammo, and other items at the sub-station.
              </p>
              <p className="text-xs text-muted-foreground">
                The sub-station will not include a jail. The main CHP station will only have a small holding cell. 
                To book an inmate, transport them to SBCSD.
              </p>
              <p className="text-xs font-semibold">Status: IN DEVELOPMENT</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Clairemont County Sheriff's Department</CardTitle>
                <Badge variant="outline">OPEN</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              One main station. Serves county law enforcement needs.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Clairemont Police Department</CardTitle>
                <Badge variant="secondary">WHITELISTED</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              One main station. Primary city law enforcement authority.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">MountRail Railroad Police</CardTitle>
                <Badge variant="secondary">WHITELISTED</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              One main station. Handles all incidents involving locomotives, railcars, and tracks.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fire Department */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">Fire Department</h2>
        
        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Clairemont County Fire Department / CalFire</CardTitle>
                <Badge variant="outline">OPEN</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Two stations covering county fire services and emergency response.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Clairemont Fire Department</CardTitle>
                <Badge variant="secondary">WHITELISTED - PREMIUM</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              One main station. City-level fire services and rescue operations.
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
                <CardTitle className="text-base">California Department of Corrections & Rehabilitation</CardTitle>
                <Badge variant="secondary">PREMIUM - LATER UPDATE</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Tasked with picking up and transporting incarcerated inmates from SBCSD to the primary jail facility.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">CalTrans</CardTitle>
                <Badge variant="secondary">PREMIUM</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Tasked with maintaining roads and infrastructure:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Fixing potholes on freeways and roadways</li>
                <li>Changing traffic patterns and signals</li>
                <li>Changing road signs</li>
                <li>Closing roadways at CHP direction for major incidents</li>
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
                <CardTitle className="text-base">Security (NAME TBD)</CardTitle>
                <Badge variant="outline">OPEN - PREMIUM</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Private security services for businesses and clients throughout Fort Loredo.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Waste Management</CardTitle>
                <Badge variant="outline">OPEN</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Pick up trash and maintain public cleanliness. (Try not to get negative health side effects & diseases!)
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">MountRail Railroad</CardTitle>
                <Badge variant="secondary">WHITELISTED</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Dual purpose operations:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Transport goods via freight rail to different yards and businesses</li>
                <li>Responsible for transporting majority of Fort Loredo's population via passenger car</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <Card className="bg-gradient-to-r from-primary/10 to-chart-3/10 border-primary/20">
        <CardContent className="p-6 text-center space-y-3">
          <p className="text-lg font-semibold">Fort Loredo Development</p>
          <p className="text-muted-foreground text-sm">
            More updates and features coming soon. Stay tuned for announcements about department roles, 
            gameplay mechanics, and premium perks.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
