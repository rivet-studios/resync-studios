import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Star,
  Loader2,
  Crown,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CreditCard,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const tiers = [
  {
    id: "bronze",
    name: "Bronze VIP®",
    rating: "4.5",
    priceMonth: "9.99",
    priceYear: "99.99",
    description: "Your journey. Your control.",
    icon: ShieldCheck,
    accent: "bronze",
    features: [
      "Exclusive Discord Role & Media Posting Permissions",
      "Priority Staff Applications",
      "Priority Ticket Support",
      "Priority Appeals and Player Reports",
      "XP Boost (22%) & Paychecks Boost (22%)",
      "All Playtime Requirements Waived",
      "Save (22%) on Vehicles at Velocity Autos",
      "Save (22%) on Vehicle Insurance",
      "ATM Fees Waived",
    ],
  },
  {
    id: "diamond",
    name: "Diamond VIP®",
    rating: "4.8",
    priceMonth: "14.99",
    priceYear: "149.99",
    description: "Earn more. Play elite.",
    icon: Sparkles,
    accent: "diamond",
    features: [
      "Exclusive Discord Role & Media Posting Permissions",
      "High Priority Staff Applications",
      "High Priority Ticket Support",
      "High Priority Appeals and Player Reports",
      "⭐ Monthly Exclusive Vehicles",
      "⭐ XP Boost (47%) & Paychecks Boost (45%)",
      "Medical Bills (50%) off after death",
      "Perma-Knife on Civilian Team",
      "Save (42%) at Velocity Autos & ElevenDrive Vehicle Dealership",
      "All Playtime Requirements Waived",
      "Save (42%) on Vehicle Insurance",
      "ATM Fees Waived",
    ],
  },
  {
    id: "founders",
    name: "Founders Edition®",
    rating: "4.8",
    priceMonth: "19.99",
    priceYear: "199.99",
    featured: true,
    description: "Enforce. Resist. Rule.",
    icon: Crown,
    accent: "founders",
    features: [
      "Exclusive Discord Role & Media Posting Permissions",
      "Urgent Priority Staff Applications",
      "Urgent Priority Appeals and Player Reports",
      "Urgent Priority Ticket Support",
      "⭐ All-Rank & Team Bypass",
      "⭐ Internal Affairs Authority",
      "⭐ Monthly Exclusive Vehicles",
      "⭐ Permanent Firearm on Civilian Team",
      "[IN-DEV] ⭐ National Guard & Federal Teams",
      "Bypass XP Restriction on all Law Enforcement Vehicles",
      "All Playtime Requirements Waived",
      "Bypass all XP restrictions globally",
      "Paychecks Boost (78%) across all teams",
      "Save (60%) at Velocity Autos & ElevenDrive Vehicle Dealership",
      "Medical Bills (66%) off after death",
      "Save (89%) on Vehicle Insurance",
      "ATM Fees Waived",
    ],
  },
];

function TierIcon({
  tier,
}: {
  tier: (typeof tiers)[number];
}) {
  const Icon = tier.icon;

  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
        tier.featured
          ? "border-primary/20 bg-primary/10 text-primary"
          : "border-border/60 bg-muted/30 text-muted-foreground"
      }`}
    >
      <Icon className="h-5 w-5" />
    </div>
  );
}

function Rating({ rating }: { rating: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-medium">
      <div className="flex items-center gap-0.5 text-yellow-500">
        <Star className="h-3 w-3 fill-current" />
        <span>{rating}</span>
      </div>

      <span className="text-muted-foreground">member rating</span>
    </div>
  );
}

export default function Subscriptions() {
  const [billingCycle, setBillingCycle] = useState<"month" | "year">("month");
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubscribe = async (tier: (typeof tiers)[0]) => {
    if (!user) {
      setLocation("/login");
      return;
    }

    setLoadingTier(tier.id);

    try {
      const response = await apiRequest("POST", "/api/stripe/checkout", {
        tierId: tier.id,
        interval: billingCycle,
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Checkout unavailable",
          description:
            "Failed to create checkout session. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Checkout Error",
        description:
          error?.message || "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        {/* Header */}
        <section className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <Crown className="h-3.5 w-3.5" />
            RIVET Studios Membership
          </div>

          <h1
            className="text-3xl font-bold tracking-tight md:text-4xl"
            data-testid="text-subscriptions-title"
          >
            Choose your plan
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Upgrade your RIVET experience with exclusive benefits, priority
            support, progression boosts, and member-only perks.
          </p>

          {/* Billing Toggle */}
          <div className="mt-7 inline-flex items-center rounded-xl border border-border/60 bg-muted/30 p-1">
            <Button
              variant={billingCycle === "month" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setBillingCycle("month")}
              className="h-8 px-5 text-xs"
              data-testid="button-billing-month"
            >
              Monthly
            </Button>

            <Button
              variant={billingCycle === "year" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setBillingCycle("year")}
              className="h-8 gap-1.5 px-5 text-xs"
              data-testid="button-billing-year"
            >
              Yearly
              <Badge className="ml-0.5 border-0 bg-green-500/10 px-1.5 py-0 text-[9px] font-semibold text-green-500">
                SAVE
              </Badge>
            </Button>
          </div>
        </section>

        {/* Tier Cards */}
        <section className="grid items-stretch gap-5 lg:grid-cols-3">
          {tiers.map((tier) => {
            const isLoading = loadingTier === tier.id;
            const Icon = tier.icon;

            return (
              <Card
                key={tier.id}
                className={`group relative flex h-full flex-col overflow-visible border-border/60 bg-card/70 transition-all duration-300 ${
                  tier.featured
                    ? "border-primary/30 shadow-lg shadow-primary/[0.04] lg:-translate-y-2"
                    : "hover:-translate-y-0.5 hover:border-border hover:shadow-md"
                }`}
                data-testid={`card-tier-${tier.id}`}
              >
                {/* Featured label */}
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                    <Badge className="border border-primary/20 bg-primary px-4 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground shadow-md">
                      Featured
                    </Badge>
                  </div>
                )}

                {/* Accent */}
                <div
                  className={`absolute inset-x-0 top-0 h-px ${
                    tier.featured ? "bg-primary" : "bg-border/60"
                  }`}
                />

                <CardHeader className="p-6 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <TierIcon tier={tier} />

                    {tier.featured && (
                      <div className="flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-primary">
                        <Zap className="h-3 w-3" />
                        Premium
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <CardTitle className="text-lg font-bold tracking-tight">
                      {tier.name}
                    </CardTitle>

                    <div className="mt-2">
                      <Rating rating={tier.rating} />
                    </div>
                  </div>

                  <p className="pt-1 text-sm leading-5 text-muted-foreground">
                    {tier.description}
                  </p>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col px-6 pb-6">
                  {/* Price */}
                  <div className="rounded-xl border border-border/50 bg-muted/[0.15] p-4">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          {billingCycle === "month"
                            ? "Monthly billing"
                            : "Annual billing"}
                        </p>

                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-3xl font-bold tracking-tight">
                            $
                            {billingCycle === "month"
                              ? tier.priceMonth
                              : tier.priceYear}
                          </span>

                          <span className="text-xs text-muted-foreground">
                            / {billingCycle === "month" ? "month" : "year"}
                          </span>
                        </div>
                      </div>

                      <CreditCard className="mb-1 h-4 w-4 text-muted-foreground/50" />
                    </div>

                    {billingCycle === "year" && (
                      <Badge
                        variant="outline"
                        className="mt-3 border-green-500/20 bg-green-500/5 text-[10px] font-semibold text-green-500"
                      >
                        Save ~20% with yearly billing
                      </Badge>
                    )}
                  </div>

                  {/* Checkout */}
                  <Button
                    className={`mt-4 h-11 w-full font-semibold ${
                      tier.featured
                        ? "shadow-sm shadow-primary/10"
                        : ""
                    }`}
                    variant={tier.featured ? "default" : "outline"}
                    onClick={() => handleSubscribe(tier)}
                    disabled={isLoading}
                    data-testid={`button-subscribe-${tier.id}`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redirecting to checkout...
                      </>
                    ) : (
                      <>
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {/* Features */}
                  <div className="mt-7 flex-1">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Features Included
                      </h4>

                      <span className="text-[10px] text-muted-foreground/60">
                        {tier.features.length} benefits
                      </span>
                    </div>

                    <ul className="space-y-3">
                      {tier.features.map((feature, index) => {
                        const highlighted =
                          feature.startsWith("⭐") ||
                          feature.startsWith("[IN-DEV]");

                        return (
                          <li
                            key={index}
                            className="flex gap-3 text-xs leading-5"
                          >
                            <span
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                                highlighted
                                  ? "bg-primary/10 text-primary"
                                  : "bg-green-500/10 text-green-500"
                              }`}
                            >
                              <Check className="h-2.5 w-2.5" />
                            </span>

                            <span
                              className={
                                highlighted
                                  ? "font-medium text-foreground"
                                  : "text-muted-foreground"
                              }
                            >
                              {feature}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Bottom information */}
        <section className="mx-auto mt-12 max-w-4xl">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/60 bg-card/50">
              <CardContent className="flex gap-3 p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/20">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </div>

                <div>
                  <p className="text-sm font-medium">Secure Checkout</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Payments are securely processed through Stripe.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50">
              <CardContent className="flex gap-3 p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/20">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </div>

                <div>
                  <p className="text-sm font-medium">Instant Benefits</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Membership benefits are applied after successful checkout.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50">
              <CardContent className="flex gap-3 p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/20">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </div>

                <div>
                  <p className="text-sm font-medium">RIVET Membership</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Manage your subscription through your RIVET account.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground/60">
            Subscription pricing is shown in USD. Billing is handled securely
            through the RIVET Studios checkout system.
          </p>
        </section>
      </div>
    </div>
  );
}