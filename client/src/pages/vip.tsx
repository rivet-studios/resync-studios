import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { VipBadge } from "@/components/vip-badge";
import { PaymentForm } from "@/components/payment-form";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Crown,
  Gem,
  Diamond,
  Star,
  Check,
  Zap,
  Users,
  MessageSquare,
  Shield,
  Sparkles,
  ArrowRight,
  Lock,
} from "lucide-react";
import { SiDiscord, SiRoblox } from "react-icons/si";

const tiers = [
  {
    id: "bronze",
    name: "Bronze VIP",
    price: 12.99,
    icon: Crown,
    className: "vip-bronze",
    features: [
      "Exclusive Discord Role & Privileges",
      "Post Community Groups & Advertise",
      "Priority HelpDesk Support",
      "Priority Moderation Appeals",
      "Priority Staff Applications",
      "All Playtime Requirements Waived",
      "XP Boost (20%) across all teams",
      "Unlock CHP",
      "Paychecks Boost (20%)",
      "Save 20% on Vehicle Insurance",
      "Save 20% on Vehicles",
      "Higher Chem & Plant Sell Rates (20%)",
      "ATM Fees Waived",
    ],
    popular: true,
  },
  {
    id: "sapphire",
    name: "Sapphire VIP",
    price: 29.99,
    icon: Gem,
    className: "vip-sapphire",
    features: [
      "Exclusive Discord Role & Privileges",
      "Post Community Groups & Advertise",
      "High Priority HelpDesk Support",
      "High Priority Moderation Appeals",
      "High Priority Staff Applications",
      "All Playtime Requirements Waived",
      "XP Boost (35%)",
      "Paychecks Boost (30%)",
      "Unlock LAPD",
      "Save 25% on Vehicle Insurance",
      "Save 25% on Vehicles",
      "Higher Chem & Plant Sell Rates (30%)",
      "ATM Fees Waived",
      "Exclusive Vehicles",
    ],
    popular: true,
  },
  {
    id: "diamond",
    name: "Diamond VIP",
    price: 44.99,
    icon: Diamond,
    className: "vip-diamond",
    features: [
      "Exclusive Discord Role & Privileges",
      "Post Community Groups & Advertise",
      "High Priority HelpDesk Support",
      "High Priority Moderation Appeals",
      "High Priority Staff Applications",
      "Audi RS3 Given each Subscription Cycle",
      "All Playtime Requirements Waived",
      "Unlock USMS",
      "XP Boost (45%)",
      "Medical Bills 50% Off",
      "No Wallet Limit",
      "Paychecks Boost (40%)",
      "Save 35% on Vehicle Insurance",
      "Save 35% on Vehicles",
      "Higher Chem & Plant Sell Rates (40%)",
      "Perma-Knife on Civilian Team",
      "ATM Fees Waived",
    ],
    popular: false,
  },
  {
    id: "founders",
    name: "Founders Edition",
    price: 120.0,
    icon: Star,
    className: "vip-founders",
    features: [
      "Exclusive Founders Discord Role",
      "Post Community Groups & Advertise",
      "Urgent Priority HelpDesk Support",
      "Urgent Priority Moderation Appeals",
      "Urgent Priority Staff Applications",
      "Instant FBI Access & Arrest Authority",
      "All Team-Queue & Team Count Bypass",
      "All Playtime Requirements Waived",
      "Hellcat Given each Subscription Cycle",
      "XP Boost (55%)",
      "Medical Bills 55% Off",
      "No Wallet Limit",
      "Paychecks Boost (55%)",
      "Save 50% on Vehicle Insurance",
      "Save 50% on Vehicles",
      "Higher Chem & Plant Sell Rates (50%)",
      "Perma-Glock on Civilian Team",
      "ATM Fees Waived",
    ],
    popular: false,
    limited: true,
  },
];

export default function VIP() {
  const { user } = useAuth();

  const currentTierIndex = tiers.findIndex((t) => t.id === user?.vipTier);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <Badge variant="outline" className="mb-4 gap-2">
          <Crown className="w-3.5 h-3.5" />
          VIP Membership
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4">
          Unlock Premium Features
        </h1>
        <p className="text-lg text-muted-foreground">
          Upgrade your gaming experience with exclusive features, badges, and
          perks. VIP members get automatic Discord role assignments!
        </p>
      </div>

      {/* Current Status */}
      {user?.vipTier && user.vipTier !== "none" && (
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-chart-3/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Your Current Plan</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <VipBadge tier={user.vipTier as any} />
                    {user.discordId && (
                      <Badge variant="outline" className="gap-1">
                        <SiDiscord className="w-3 h-3" />
                        Role Synced
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link href="/settings?tab=subscription">
                  Manage Subscription
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discord Link Prompt */}
      {!user?.discordId && (
        <Card className="max-w-2xl mx-auto border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                <SiDiscord className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Link Your Discord Account</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Link your Discord account before purchasing VIP to receive
                  automatic role assignment in our Discord server.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/settings?tab=connections">
                  Link Discord
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        {tiers.map((tier, index) => {
          const isCurrentTier = user?.vipTier === tier.id;
          const isUpgrade = currentTierIndex < index;
          const Icon = tier.icon;

          return (
            <Card
              key={tier.id}
              className={`relative ${tier.popular ? "border-primary ring-1 ring-primary" : ""}`}
              data-testid={`card-vip-${tier.id}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              {tier.limited && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-yellow-500 text-yellow-950">
                    Limited Edition
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div
                  className={`w-16 h-16 mx-auto rounded-xl ${tier.className} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-8 h-8" />
                </div>
                <CardTitle>{tier.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {isCurrentTier ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        data-testid={`button-subscribe-${tier.id}`}
                      >
                        Subscribe Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Get {tier.name}</DialogTitle>
                      </DialogHeader>
                      <div className="bg-primary/5 rounded p-3 mb-4">
                        <p className="text-sm font-medium">
                          ${tier.price}/month
                        </p>
                      </div>
                      <PaymentForm
                        tier={tier}
                        onSuccess={() => window.location.reload()}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Features Comparison */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Why Go VIP?</CardTitle>
          <CardDescription>
            Exclusive benefits for our most dedicated members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center shrink-0">
                <SiDiscord className="w-5 h-5 text-chart-1" />
              </div>
              <div>
                <h4 className="font-semibold">Auto Discord Roles</h4>
                <p className="text-sm text-muted-foreground">
                  Get your VIP role automatically assigned in our Discord
                  server.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center shrink-0">
                <SiRoblox className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <h4 className="font-semibold">In-Game Perks</h4>
                <p className="text-sm text-muted-foreground">
                  Exclusive perks in all Resync Studios games when linked.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <h4 className="font-semibold">Priority Matching</h4>
                <p className="text-sm text-muted-foreground">
                  Get matched faster in LFG with priority queue access.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <h4 className="font-semibold">Create Clans</h4>
                <p className="text-sm text-muted-foreground">
                  Diamond+ members can create and manage their own clans.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-chart-5/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-chart-5" />
              </div>
              <div>
                <h4 className="font-semibold">Exclusive Content</h4>
                <p className="text-sm text-muted-foreground">
                  Access VIP-only builds, guides, and forum sections.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Priority Support</h4>
                <p className="text-sm text-muted-foreground">
                  Get faster responses from our support team.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold">How do I get my Discord role?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Link your Discord account in Settings before or after purchasing
              VIP. Your role will be automatically assigned within minutes.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">
              Can I upgrade or downgrade my plan?
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              Yes! You can change your plan at any time. Upgrades take effect
              immediately, and downgrades take effect at the end of your billing
              period.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">
              When will VIP subscriptions be available?
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              VIP subscriptions are currently in development. Check back soon
              for payment options!
            </p>
          </div>
          <div>
            <h4 className="font-semibold">
              Is the Founders Edition really limited?
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              Yes! Founders Edition is limited to early supporters. Once sold
              out, it will never be available again.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
