import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Copy,
  CheckCircle2,
  Gift,
  Link2,
  Loader2,
  ArrowRight,
  Share2,
  Sparkles,
  CircleCheck,
} from "lucide-react";

export default function Referrals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: referralData, isLoading } = useQuery<{
    code: string;
    referralCount: number;
  }>({
    queryKey: ["/api/referral/code"],
    enabled: !!user,
  });

  const referralCount = referralData?.referralCount || 0;
  const pointsEarned = referralCount * 10;

  const referralLink = referralData
    ? `${window.location.origin}/signup?ref=${referralData.code}`
    : "";

  const copyLink = () => {
    if (!referralData) return;

    navigator.clipboard.writeText(referralLink);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);

    toast({
      title: "Referral link copied",
      description: "Your referral link is ready to share.",
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
        <Card className="overflow-hidden border-border/60">
          <CardContent className="flex flex-col items-center px-6 py-12 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/[0.07]">
              <Gift className="h-6 w-6 text-primary" />
            </div>

            <Badge
              variant="outline"
              className="mb-4 border-primary/20 bg-primary/5 text-primary"
            >
              RIVET Referrals
            </Badge>

            <h2 className="text-xl font-semibold tracking-tight">
              Sign in to get your referral link
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Invite friends to RIVET and earn reputation points when they
              successfully create an account using your referral link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Header */}
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-border/60 bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-transparent" />

        <div className="relative p-6 sm:p-8">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 border-primary/20 bg-primary/5 text-primary"
            >
              <Gift className="h-3.5 w-3.5" />
              Community Rewards
            </Badge>

            <Badge
              variant="outline"
              className="gap-1.5 text-muted-foreground"
            >
              <Sparkles className="h-3.5 w-3.5" />
              10 points / referral
            </Badge>
          </div>

          <div className="max-w-3xl">
            <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              RIVET STUDIOS / COMMUNITY
            </p>

            <h1
              className="text-3xl font-bold tracking-tight sm:text-4xl"
              data-testid="text-referrals-title"
            >
              Referral Program
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Invite friends to RIVET and earn reputation points for every
              successful signup made through your referral link.
            </p>
          </div>

          {/* Development Notice */}
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10">
              <CircleCheck className="h-3.5 w-3.5 text-red-400" />
            </div>

            <div>
              <p className="text-xs font-semibold text-red-400">
                Development Notice
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                The referral program is currently in development and may not
                work as expected or at all.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card
          className="border-border/60 bg-card/70"
          data-testid="card-referral-count"
        >
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Successful Referrals
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {isLoading ? (
                    <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                  ) : (
                    referralCount
                  )}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Friends connected to your account
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.07]">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-border/60 bg-card/70"
          data-testid="card-referral-earnings"
        >
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Reputation Earned
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {isLoading ? (
                    <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                  ) : (
                    pointsEarned
                  )}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  10 reputation points per successful signup
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/[0.07]">
                <Gift className="h-5 w-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        {/* Referral Link */}
        <Card className="border-border/60">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/[0.07]">
                <Link2 className="h-4 w-4 text-primary" />
              </div>

              <div>
                <CardTitle className="text-base">
                  Your Referral Link
                </CardTitle>
                <CardDescription className="mt-1 text-xs leading-5">
                  Share this link with friends to earn 10 reputation points per
                  successful signup.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 p-5 sm:p-6">
            {isLoading ? (
              <div className="flex min-h-[90px] items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating your referral link...
                </div>
              </div>
            ) : referralData ? (
              <>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Referral URL
                  </p>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      readOnly
                      value={referralLink}
                      className="h-10 min-w-0 bg-muted/30 font-mono text-xs"
                      data-testid="input-referral-link"
                    />

                    <Button
                      onClick={copyLink}
                      className="h-10 gap-2 sm:px-4"
                      data-testid="button-copy-referral"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium">Your referral code</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Share the link above rather than manually entering this
                      code.
                    </p>
                  </div>

                  <code className="w-fit rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs font-semibold">
                    {referralData.code}
                  </code>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Your referral information could not be loaded.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reward Summary */}
        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle className="text-base">Reward Summary</CardTitle>
            <CardDescription className="text-xs">
              Your current referral progress
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-xl border border-primary/15 bg-primary/[0.04] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                  <Gift className="h-4 w-4 text-primary" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    {pointsEarned} reputation points
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Earned from {referralCount} referral
                    {referralCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Points per referral
                </span>
                <span className="font-semibold">10</span>
              </div>

              <div className="h-px bg-border/60" />

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Successful referrals
                </span>
                <span className="font-semibold">{referralCount}</span>
              </div>

              <div className="h-px bg-border/60" />

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Total points earned
                </span>
                <span className="font-semibold text-primary">
                  {pointsEarned}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="mt-6 border-border/60">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/40">
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </div>

            <div>
              <CardTitle className="text-base">How it works</CardTitle>
              <CardDescription className="text-xs">
                Three simple steps to earn referral rewards.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="group relative rounded-xl border border-border/60 bg-muted/[0.12] p-5 transition-colors hover:border-primary/25 hover:bg-primary/[0.025]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-mono text-xs font-bold text-primary">
                  01
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground/50 md:block" />
              </div>

              <h3 className="text-sm font-semibold">Share your link</h3>

              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Copy your referral link and share it with friends or members
                of your community.
              </p>
            </div>

            <div className="group relative rounded-xl border border-border/60 bg-muted/[0.12] p-5 transition-colors hover:border-primary/25 hover:bg-primary/[0.025]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-mono text-xs font-bold text-primary">
                  02
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground/50 md:block" />
              </div>

              <h3 className="text-sm font-semibold">They sign up</h3>

              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                When they create an account using your link, their signup is
                connected to your referral.
              </p>
            </div>

            <div className="group rounded-xl border border-border/60 bg-muted/[0.12] p-5 transition-colors hover:border-primary/25 hover:bg-primary/[0.025]">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-mono text-xs font-bold text-primary">
                03
              </div>

              <h3 className="text-sm font-semibold">Earn rewards</h3>

              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                You earn 10 reputation points for each successful referral.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Note */}
      <div className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        <span>
          Referrals help grow the RIVET community while rewarding participation.
        </span>
      </div>
    </div>
  );
}