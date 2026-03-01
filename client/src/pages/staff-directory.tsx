import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, Shield, Headphones, Cpu, Trophy } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  additionalInfo?: string;
  joinDate: string;
  endDate?: string;
}

interface Department {
  name: string;
  icon: any;
  color: string;
  members: TeamMember[];
}

const departments: Department[] = [
  {
    name: "RS Leaders",
    icon: Crown,
    color: "text-yellow-500",
    members: [
      {
        name: "cxiqlne",
        role: "Chief Executive Officer (CEO) & Founder",
        joinDate: "2018-Present",
      },
      {
        name: "silentdirective.",
        role: "Chief Operations Officer (COO) & Co Founder",
        joinDate: "2024-Present",
      },
    ],
  },
  {
    name: "RS Management",
    icon: Shield,
    color: "text-blue-500",
    members: [
      {
        name: "ArielOperations",
        role: "Company Representative, Team Member",
        joinDate: "2024-Present",
      },
      {
        name: "Kryos",
        role: "Operations Manager",
        joinDate: "2024-Present",
      },
    ],
  },
  {
    name: "RS Staff Department Administration",
    icon: Shield,
    color: "text-red-500",
    members: [
      {
        name: "Vision",
        role: "Staff Department Director",
        joinDate: "2025-Present",
      },
    ],
  },
  {
    name: "RS Customer Relations",
    icon: Headphones,
    color: "text-green-500",
    members: [
      {
        name: "bobby283543",
        role: "Customer Relations Director",
        joinDate: "2025-Present",
      },
      {
        name: "silentdirective.",
        role: "Partnership Relations",
        joinDate: "2024-Present",
      },
      {
        name: "ArielOperations",
        role: "DMCA Relations",
        joinDate: "2026-Present",
      },
    ],
  },
  {
    name: "RS Game Designers & Programmers",
    icon: Cpu,
    color: "text-purple-500",
    members: [
      {
        name: "ArielOperations",
        role: "Chief Development Officer, Lead Developer",
        joinDate: "2024-Present",
      },
      {
        name: "cxiqlne",
        role: "Gameplay Systems Developer",
        joinDate: "2018-Present",
      },
      {
        name: "Reni",
        role: "Gameplay Systems Developer",
        joinDate: "2019-Present",
      },
      {
        name: "silentdirective.",
        role: "Gameplay Systems Developer, Vehicle Artist",
        joinDate: "2024-Present",
      },
      {
        name: "cxiqlne",
        role: "Programmer",
        joinDate: "2018-Present",
      },
      {
        name: "cxiqlne",
        role: "Vehicle Engineer",
        joinDate: "2018-Present",
      },
    ],
  },
  {
    name: "RS Retired Team Members",
    icon: Trophy,
    color: "text-gray-500",
    members: [
      {
        name: "Alexx",
        role: "Trust & Safety Director",
        additionalInfo: "Reinstated as Senior Administrator late 2025",
        joinDate: "2023",
        endDate: "2025",
      },
      {
        name: "Iceberg1038",
        role: "Staff Department Director",
        joinDate: "2024",
        endDate: "2026",
      },
    ],
  },
];

export default function StaffDirectory() {
  return (
    <div className="space-y-8 max-w-6xl">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mx-auto gap-2">
          <Users className="w-3.5 h-3.5" />
          Meet the Team
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Staff Directory
        </h1>
        <p className="text-lg text-muted-foreground">
          Meet the passionate team behind RIVET Studios™
        </p>
      </div>

      <div className="space-y-8">
        {departments.map((dept, idx) => {
          const DeptIcon = dept.icon;
          const isRetired = dept.name.includes("Retired");

          return (
            <div key={idx} className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-border">
                <DeptIcon className={`w-6 h-6 ${dept.color}`} />
                <h2 className="font-display text-2xl font-bold">{dept.name}</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dept.members.map((member, memberIdx) => (
                  <Card
                    key={memberIdx}
                    className={isRetired ? "opacity-75 border-border/50" : ""}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base line-clamp-2">
                        {member.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {member.role}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                          {member.endDate
                            ? `${member.joinDate} - ${member.endDate}`
                            : member.joinDate}
                        </span>
                      </div>
                      {isRetired && (
                        <Badge variant="outline" className="mt-3 text-xs">
                          Retired
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-chart-3/10 border-primary/20">
        <CardContent className="p-6 text-center">
          <p className="text-lg font-semibold mb-2">Join Our Team</p>
          <p className="text-muted-foreground">
            Interested in joining RIVET Studios? Check out our career
            opportunities. We're always looking for talented individuals to help
            grow our community.
            <CardDescription className="text-xs"></CardDescription> To become a
            team member at RS, please contact us at or apply for a volunteer
            staff position at https://resyncstudios.com/volunteer.
            <a
              href="mailto:support@resyncstudios.com"
              className="text-primary hover:underline"
            >
              support@resyncstudios.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
