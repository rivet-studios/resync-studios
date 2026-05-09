import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, Shield, Headphones, Cpu, Trophy } from "lucide-react";

// Note for human devs: do not use a hyphen, instead use an en dash (–) for a more professional look.

interface TeamMember {
  name: string;
  role: string;
  contact?: string;
  joinDate: string;
  endDate?: string;
}

interface Department {
  name: string;
  contact?: string;
  icon: any;
  color: string;
  members: TeamMember[];
}

const departments: Department[] = [
  {
    name: "Executive Leadership",
    icon: Crown,
    color: "text-yellow-500",
    members: [
      {
        name: "Isaac D.",
        role: "Chief Executive Officer (CEO) & Founder",
        contact: "Contact: isaac@rivetstudiosus.com",
        joinDate: "2018–Present",
      },
      {
        name: "Quinn (silentdirective)",
        role: "Operations Manager & Co Founder",
        contact: "Contact: quinn@rivetstudiosus.com",
        joinDate: "2024–Present",
      },
    ],
  },
  {
    name: "Management",
    icon: Shield,
    color: "text-blue-500",
    members: [
      {
        name: "Chase K. (eranovuh)",
        role: "Staff Director",
        contact: "Contact: chase@rivetstudiosus.com",
        joinDate: "2026–Present",
      },
      {
        name: "Aidan (jst_basix)",
        role: "Operations Manager",
        contact: "Contact: aidan@rivetstudiosus.com",
        joinDate: "2026–Present",
      },
    ],
  },
  {
    name: "Customer Relations",
    contact: "Contact: support@rivetstudiosus.com",
    icon: Headphones,
    color: "text-green-500",
    members: [
      {
        name: "Quinn (silentdirective)",
        role: "Customer Relations & Partnership Support",
        joinDate: "2024–Present",
      },
      {
        name: "Isaac D.",
        role: "Customer Relations Lead",
        joinDate: "2018–Present",
      },

      {
        name: "Chase K. (eranovuh)",
        role: "Customer Relations",
        joinDate: "2026–Present",
      },
    ],
  },
  {
    name: "Engineering & Design",
    icon: Cpu,
    color: "text-purple-500",
    members: [
      {
        name: "Isaac D.",
        role: "Engineering Lead",
        joinDate: "2018–Present",
      },
      {
        name: "Quinn (silentdirective)",
        role: "Creative Designer",
        joinDate: "2024–Present",
      },
    ],
  },
  {
    name: "Alumni",
    icon: Trophy,
    color: "text-gray-500",
    members: [
      {
        name: "Alexx",
        role: "Trust & Safety Director",
        joinDate: "2023",
        endDate: "2025",
      },
      {
        name: "Iceberg1038",
        role: "Staff Department Director",
        joinDate: "2024",
        endDate: "2026",
      },
      {
        name: "Bobby283543",
        role: "Team Member",
        joinDate: "2025",
        endDate: "2026",
      },
      {
        name: "Reni",
        role: "Gameplay Engineer",
        joinDate: "2019",
        endDate: "2026",
      },
      {
        name: "WolfGaming_2025",
        role: "Operations Manager",
        joinDate: "2020",
        endDate: "2024",
      },
      {
        name: "tinyauthoritarian",
        role: "Team Member",
        joinDate: "2024",
        endDate: "2025",
      },
      {
        name: "Vision",
        role: "Staff Director",
        joinDate: "2024",
        endDate: "2026",
      },
    ],
  },
];

export default function StaffDirectory() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8 px-4">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mx-auto gap-2">
          <Users className="w-3.5 h-3.5" />
          Meet the Team
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Corporate Directory
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
            <CardDescription className="text-xs"></CardDescription> To become a community volunteer, you can apply for the Community Staff program {" "}
            <a
              href="https://rivetstudios.fillout.com/apply"
              className="text-primary hover:underline"
            >
              here¸
            </a>

              <CardDescription className="text-xs"></CardDescription>
                 If you are interested in joining Corporate, check out our {" "}
              <a
    href="https://x.com/rivetstudiosau/jobs"
                className="text-primary hover:underline"
                >
                Twitter page
              </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
