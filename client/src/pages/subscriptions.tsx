import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const tiers = [
  {
    id: "bronze",
    name: "Bronze VIP",
    rating: "4.5",
    price: "9.99",
    description:
      "The Bronze Supporter package is for supporters who want to contribute to RIVET Studios while receiving light account enhancements within the RIVET Studios ecosystem only. This tier includes select boosts, limited priority access, and basic recognition perks designed to modestly improve your website and Roblox experience. Your support helps fund development, servers, and updates for our PC titles. Perks remain active while your subscription is active.",
    features: [
      "Exclusive Discord Role & Media Posting Permissions",
      "Priority Staff Applications",
      "Priority Ticket Support",
      "Priority Appeals and Player Reports",
      "XP Boost (20%) & Paychecks Boost (20%)",
      "All Playtime Requirements Waived",
      "Save (20%) on Vehicles at Quinn's Autos",
      "Save (20%) on Vehicle Insurance",
      "More Placeable Chem-Tables & 20% Higher Sell Rates",
      "ATM Fees Waived",
    ],
  },
  {
    id: "diamond",
    name: "Diamond VIP",
    rating: "4.8",
    price: "14.99",
    description:
      "The Diamond Supporter package is built for supporters who want a powerful upgrade to their RIVET Studios experience. This tier unlocks expanded premium boosts, enhanced priority access, and high-value recognition across the RIVET Studios ecosystem only. Your support directly fuels development, infrastructure, and future expansion for our Roblox titles, while you receive a strong collection of impactful quality of life benefits. Perks remain active during your subscription.",
    features: [
      "Exclusive Discord Role & Media Posting Permissions",
      "High Priority Staff Applications",
      "High Priority Ticket Support",
      "High Priority Appeals and Player Reports",
      "⭐ [IN-DEV] Monthly Exclusive Vehicles",
      "⭐ XP Boost (45%) & Paychecks Boost (40%)",
      "Medical Bills (50%) off after death",
      "Perma-Knife on Civilian Team",
      "Save (35%) at Quinn's Autos & Isaac's Vehicle Dealership",
      "All Playtime Requirements Waived",
      "Save (35%) on Vehicle Insurance",
      "More Placeable Chem-Tables & 40% Higher Sell Rates",
      "ATM Fees Waived",
    ],
  },
  {
    id: "founders",
    name: "Founders Edition VIP",
    rating: "4.8",
    price: "19.99",
    featured: true,
    description:
      "The Founder’s Edition Supporter package is our most exclusive tier, created for supporters who want elite status within RIVET Studios. This membership delivers top-level boosts, elite recognition, and priority privileges across the RIVET Studios ecosystem. Your contribution supports long-term growth and expansion for our Roblox games while granting access to premier quality of life upgrades. Benefits remain active during your subscription.",
    features: [
      "Exclusive Discord Role & Media Posting Permissions",
      "Urgent Priority Staff Applications",
      "Urgent Priority Appeals and Player Reports",
      "Urgent Priority Ticket Support",
      "⭐ All-Rank & Team Bypass: Instant Access to Every Slot & Rank. (No XP grinding—join any team and any rank immediately, even if the team is full!)",
      "⭐ Internal Affairs Authority: Instant VBI Access on all Law Enforcement teams. (Bypass the VBI application/grind to get Arrest & Cite authority over other officers—perfect for stopping abusers from Day 1.)",
      "⭐ [IN-DEV] Monthly Exclusive Vehicles",
      "⭐ Permanent Firearm on Civilian Team: Spawn ready for action—no dealer required.",
      "[IN-DEV] ⭐ National Guard & Federal Teams",
      "Bypass XP Restriction on all Law Enforcement Vehicles",
      "All Playtime Requirements Waived",
      "XP Boost (55%) & Paychecks Boost (55%) across all teams",
      "Save (50%) at Quinn's Autos & Isaac's Vehicle Dealership",
      "Medical Bills (55%) off after death",
      "Save (50%) on Vehicle Insurance",
      "More Placeable Chem-Tables & 50% Higher Sell Rates",
      "ATM Fees Waived",
    ],
  },
];

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
      });
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "Failed to create checkout session. Please try again.",
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
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h1
          className="text-2xl font-bold tracking-tight"
          data-testid="text-subscriptions-title"
        >
          Choose your plan
        </h1>
        <p className="text-sm text-muted-foreground">
          Select the perfect subscription plan for your needs. Upgrade or
          downgrade anytime.
        </p>

        <div className="flex items-center justify-center pt-4">
          <div className="bg-muted p-1 rounded-lg flex gap-1">
            <Button
              variant={billingCycle === "month" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setBillingCycle("month")}
              className="text-xs h-8 px-4"
              data-testid="button-billing-month"
            >
              Month
            </Button>
            <Button
              variant={billingCycle === "year" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setBillingCycle("year")}
              className="text-xs h-8 px-4"
              data-testid="button-billing-year"
            >
              Year
            </Button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {tiers.map((tier) => (
          <Card
            key={tier.id}
            className={`relative border-border/40 shadow-none rounded-xl overflow-visible flex flex-col ${
              tier.featured ? "ring-2 ring-primary border-primary/20" : ""
            }`}
            data-testid={`card-tier-${tier.id}`}
          >
            {tier.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground text-[10px] px-4 py-0.5 uppercase tracking-wider font-bold">
                  Featured
                </Badge>
              </div>
            )}

            <CardHeader className="text-center space-y-4 pt-10">
              <div className="w-12 h-12 bg-muted rounded-full mx-auto flex items-center justify-center">
                <Star className="w-6 h-6 text-foreground/60" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold tracking-tight">
                  {tier.name}
                </CardTitle>
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-yellow-500">
                  <span>{tier.rating}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 fill-current ${i < 5 ? "" : "text-muted"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-8 flex flex-col">
              <p className="text-[13px] text-muted-foreground leading-relaxed text-center px-4">
                {tier.description}
              </p>

              <div className="text-center space-y-1">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-semibold">${tier.price}</span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  className="w-full font-bold h-11"
                  variant={tier.featured ? "default" : "outline"}
                  onClick={() => handleSubscribe(tier)}
                  disabled={loadingTier === tier.id}
                  data-testid={`button-subscribe-${tier.id}`}
                >
                  {loadingTier === tier.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redirecting to checkout...
                    </>
                  ) : (
                    "Get Started"
                  )}
                </Button>
              </div>

              <div className="space-y-4 flex-1">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Features Included
                </h4>
                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex gap-3 text-[12px] leading-snug">
                      <Check className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
