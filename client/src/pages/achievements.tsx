import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  MessageSquare,
  Heart,
  Star,
  Clock,
  Crown,
  ShieldCheck,
  UserCheck,
  ShoppingBag,
  Store,
  Bug,
  Award,
  Lock,
  Check,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "wouter";

const iconMap: Record<string, any> = {
  trophy: Trophy,
  "message-square": MessageSquare,
  "messages-square": MessageSquare,
  heart: Heart,
  star: Star,
  clock: Clock,
  crown: Crown,
  "shield-check": ShieldCheck,
  "user-check": UserCheck,
  "shopping-bag": ShoppingBag,
  store: Store,
  bug: Bug,
  award: Award,
};

const categoryLabels: Record<string, string> = {
  forum: "Forum",
  community: "Community",
  special: "Special",
  account: "Account",
  store: "Store",
  general: "General",
};

const categoryIcons: Record<string, any> = {
  forum: MessageSquare,
  community: Heart,
  special: Crown,
  account: UserCheck,
  store: ShoppingBag,
  general: Trophy,
};

export default function Achievements() {
  const { user } = useAuth();

  const {
    data: allAchievements = [],
    isLoading,
  } = useQuery<any[]>({
    queryKey: ["/api/achievements"],
  });

  const { data: userAchievements = [] } = useQuery<any[]>({
    queryKey: ["/api/achievements/user", user?.id],
    enabled: !!user,
  });

  const earnedIds = new Set(
    userAchievements.map(
      (ua: any) => ua.achievement_id || ua.achievementId,
    ),
  );

  const grouped = allAchievements.reduce(
    (acc: Record<string, any[]>, achievement: any) => {
      const category = achievement.category || "general";

      if (!acc[category]) {
        acc[category] = [];
      }

      acc[category].push(achievement);

      return acc;
    },
    {},
  );

  const earnedCount = userAchievements.length;
  const totalCount = allAchievements.length;
  const completion =
    totalCount > 0
      ? Math.round((earnedCount / totalCount) * 100)
      : 0;

  const reputationPoints = (user as any)?.reputationPoints || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 right-1/4 w-[30rem] h-[24rem] rounded-full bg-primary/10 blur-[130px]" />
          <div className="absolute -bottom-48 -left-32 w-[28rem] h-[28rem] rounded-full bg-primary/5 blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                RIVET Profile
              </p>

              <h1
                className="text-3xl sm:text-5xl font-semibold tracking-tight text-foreground mt-3"
                data-testid="text-achievements-title"
              >
                Achievements
              </h1>

              <p className="text-base text-muted-foreground mt-3 max-w-2xl leading-relaxed">
                Earn achievements, build reputation, and keep track of your
                progress throughout the RIVET community.
              </p>
            </div>

            {user && (
              <div className="flex items-center gap-2">
                <Link href="/profile">
                  <Badge
                    variant="outline"
                    className="cursor-pointer gap-1.5 px-3 py-1.5 hover:bg-muted/50 transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    View profile
                    <ArrowUpRight className="w-3 h-3" />
                  </Badge>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-12">
        {/* Progress */}
        {user && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-border/50 bg-card/40">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">
                        Reputation
                      </p>

                      <p
                        className="text-3xl font-semibold tracking-tight text-foreground mt-2"
                        data-testid="badge-rep-points"
                      >
                        {reputationPoints.toLocaleString()}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        reputation points
                      </p>
                    </div>

                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/40">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">
                        Achievements
                      </p>

                      <p
                        className="text-3xl font-semibold tracking-tight text-foreground mt-2"
                        data-testid="badge-earned-count"
                      >
                        {earnedCount}
                        <span className="text-base text-muted-foreground font-normal">
                          {" "}
                          / {totalCount}
                        </span>
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        achievements earned
                      </p>
                    </div>

                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/40">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">
                        Completion
                      </p>

                      <p className="text-3xl font-semibold tracking-tight text-foreground mt-2">
                        {completion}%
                      </p>

                      <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-3 max-w-[180px]">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Achievement list */}
        {isLoading ? (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="w-20 h-5" />
              <Skeleton className="w-32 h-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="border-border/50">
                  <CardContent className="p-5 flex items-center gap-4">
                    <Skeleton className="w-14 h-14 rounded-xl shrink-0" />

                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : allAchievements.length === 0 ? (
          <Card className="border-dashed border-border/60 bg-card/20">
            <CardContent className="min-h-[300px] flex flex-col items-center justify-center text-center p-8">
              <Trophy className="w-10 h-10 text-muted-foreground/20 mb-4" />

              <h2 className="text-base font-semibold text-foreground">
                No achievements available
              </h2>

              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                There are currently no achievements configured for the RIVET
                community.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {Object.entries(grouped).map(([category, achievements]) => {
              const CategoryIcon =
                categoryIcons[category] || Trophy;

              const categoryEarned = (
                achievements as any[]
              ).filter((achievement) =>
                earnedIds.has(achievement.id),
              ).length;

              return (
                <section key={category}>
                  <div className="flex items-end justify-between gap-5 mb-5">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <CategoryIcon className="w-4 h-4 text-primary" />

                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                          {categoryLabels[category] || category}
                        </p>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mt-2">
                        {categoryLabels[category] || category} achievements
                      </h2>
                    </div>

                    <p className="text-xs text-muted-foreground shrink-0">
                      {categoryEarned} / {(achievements as any[]).length} earned
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(achievements as any[]).map(
                      (achievement: any) => {
                        const earned = earnedIds.has(
                          achievement.id,
                        );

                        const IconComp =
                          iconMap[achievement.icon] || Trophy;

                        return (
                          <Card
                            key={achievement.id}
                            className={`group overflow-hidden transition-all duration-300 ${
                              earned
                                ? "border-primary/20 bg-card/50 hover:border-primary/35 hover:bg-card/70"
                                : "border-border/40 bg-card/20 opacity-65 hover:opacity-85"
                            }`}
                            data-testid={`card-achievement-${achievement.id}`}
                          >
                            <CardContent className="p-5">
                              <div className="flex items-start gap-4">
                                <div
                                  className={`relative w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border ${
                                    earned
                                      ? "bg-primary/10 border-primary/20"
                                      : "bg-muted/30 border-border/40"
                                  }`}
                                >
                                  <IconComp
                                    className={`w-6 h-6 ${
                                      earned
                                        ? "text-primary"
                                        : "text-muted-foreground/60"
                                    }`}
                                  />

                                  {!earned && (
                                    <div className="absolute -right-1.5 -bottom-1.5 w-5 h-5 rounded-full border border-background bg-muted flex items-center justify-center">
                                      <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                                    </div>
                                  )}

                                  {earned && (
                                    <div className="absolute -right-1.5 -bottom-1.5 w-5 h-5 rounded-full border border-background bg-primary flex items-center justify-center">
                                      <Check className="w-3 h-3 text-primary-foreground" />
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <h3 className="text-sm font-semibold text-foreground truncate">
                                        {achievement.name}
                                      </h3>

                                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                        {achievement.description}
                                      </p>
                                    </div>

                                    {earned && (
                                      <Badge
                                        variant="secondary"
                                        className="shrink-0 text-[9px] uppercase tracking-[0.1em] bg-primary/10 text-primary border border-primary/15"
                                      >
                                        Earned
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between gap-3 mt-4">
                                    <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                                      Achievement
                                    </span>

                                    <span
                                      className={`text-xs font-semibold ${
                                        earned
                                          ? "text-primary"
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      +{achievement.points || 0} reputation
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      },
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}