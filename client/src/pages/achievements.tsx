import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy, MessageSquare, Heart, Star, Clock, Crown,
  ShieldCheck, UserCheck, ShoppingBag, Store, Bug, Award,
} from "lucide-react";

const iconMap: Record<string, any> = {
  "trophy": Trophy, "message-square": MessageSquare, "messages-square": MessageSquare,
  "heart": Heart, "star": Star, "clock": Clock, "crown": Crown,
  "shield-check": ShieldCheck, "user-check": UserCheck, "shopping-bag": ShoppingBag,
  "store": Store, "bug": Bug, "award": Award,
};

const categoryColors: Record<string, string> = {
  forum: "bg-blue-500/20 text-blue-400",
  community: "bg-green-500/20 text-green-400",
  special: "bg-purple-500/20 text-purple-400",
  account: "bg-cyan-500/20 text-cyan-400",
  store: "bg-orange-500/20 text-orange-400",
};

export default function Achievements() {
  const { user } = useAuth();

  const { data: allAchievements = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/achievements"],
  });

  const { data: userAchievements = [] } = useQuery<any[]>({
    queryKey: ["/api/achievements/user", user?.id],
    enabled: !!user,
  });

  const earnedIds = new Set(userAchievements.map((ua: any) => ua.achievement_id || ua.achievementId));

  const grouped = allAchievements.reduce((acc: Record<string, any[]>, a: any) => {
    const cat = a.category || "general";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" data-testid="text-achievements-title">Achievements</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Earn badges and reputation points by participating in the community
        </p>
        {user && (
          <div className="flex items-center gap-4 mt-3">
            <Badge variant="secondary" className="text-sm" data-testid="badge-rep-points">
              <Star className="w-3.5 h-3.5 mr-1" />
              {(user as any).reputationPoints || 0} reputation
            </Badge>
            <Badge variant="secondary" className="text-sm" data-testid="badge-earned-count">
              <Trophy className="w-3.5 h-3.5 mr-1" />
              {userAchievements.length} / {allAchievements.length} earned
            </Badge>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, achievements]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold capitalize mb-3 flex items-center gap-2">
                <Badge className={categoryColors[category] || "bg-muted text-muted-foreground"}>
                  {category}
                </Badge>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(achievements as any[]).map((achievement: any) => {
                  const earned = earnedIds.has(achievement.id);
                  const IconComp = iconMap[achievement.icon] || Trophy;
                  return (
                    <Card
                      key={achievement.id}
                      className={`transition-all ${earned ? "border-primary/30" : "opacity-60"}`}
                      data-testid={`card-achievement-${achievement.id}`}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          earned ? "bg-primary/20" : "bg-muted"
                        }`}>
                          <IconComp className={`w-6 h-6 ${earned ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{achievement.name}</p>
                            {earned && <Badge variant="default" className="text-[10px] h-4 px-1">Earned</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{achievement.description}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">+{achievement.points} reputation</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
