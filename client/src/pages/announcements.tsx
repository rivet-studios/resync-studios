import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { type Announcement } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Rocket } from "lucide-react";

const ICON_MAP: Record<string, any> = {
  launch: Rocket,
  roadmap: Rocket,
  feature: Rocket,
  update: Megaphone,
  maintenance: Megaphone,
  event: Megaphone,
  news: Megaphone,
  important: Megaphone,
  // Add more mappings as needed
};

export default function Announcements() {
  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground">
        Loading announcements...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mx-auto gap-2">
          <Megaphone className="w-3.5 h-3.5" />
          Latest Updates
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Announcements
        </h1>
        <p className="text-lg text-muted-foreground">
          Stay updated with the latest news and roadmap for RESYNC Studios™
        </p>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>No announcements yet. Check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {announcements.map((announcement) => {
            const Icon = ICON_MAP[announcement.type] || Megaphone;
            const details = announcement.details
              ? JSON.parse(announcement.details)
              : [];

            return (
              <Card
                key={announcement.id}
                className="hover:border-primary/30 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-primary" />
                        <CardTitle className="text-xl">
                          {announcement.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Badge variant="default" className="text-xs">
                          ✓ LIVE
                        </Badge>
                        <CardDescription className="text-sm">
                          {announcement.createdAt &&
                            new Date(announcement.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {announcement.content}
                  </p>

                  {details && details.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">
                        Key Features:
                      </p>
                      <ul className="space-y-2">
                        {details.map((detail: string, idx: number) => (
                          <li
                            key={idx}
                            className="flex gap-2 text-sm text-muted-foreground"
                          >
                            <span className="text-primary font-bold">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="bg-gradient-to-r from-primary/10 to-chart-3/10 border-primary/20">
        <CardContent className="p-6 text-center">
          <p className="text-lg font-semibold mb-2">Building Together</p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            RESYNC Studios is constantly evolving. This site is just the
            beginning of what we want to achieve. With a solid foundation in
            place, we can focus on bigger features that will shape the future of
            our community. Thank you for your support throughout this journey.
            We are just getting started, and the best parts are still ahead.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
