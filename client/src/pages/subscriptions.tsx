import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";

const tiers = [
  {
    id: "bronze",
    name: "Bronze VIP®",
    rating: "4.5",
    price: "13.99",
    description: "The Bronze VIP® package is designed for supporters who want to help REACT Studios grow while enhancing their REACT Studios account experience exclusively.",
    features: [
      "[RS Discord Server] Exclusive Role, Less Chat Restrictions, Post Images / Videos / Files, Higher Priority Suggestions and Bugs",
      "[RS Discord Server] Post your own Community Group for Project Ventura, Ability to Advertise",
      "[RS HelpDesk] Priority Ticket Support",
      "[RS Moderation] Priority Appeals and Player Reports",
      "[RS Moderation] Priority Staff Applications"
    ]
  },
  {
    id: "diamond",
    name: "Diamond VIP®",
    rating: "4.8",
    price: "34.99",
    description: "The Diamond VIP® package is built for supporters who want the highest level of benefits within REACT Studios exclusively.",
    features: [
      "[RS Discord Server] Exclusive Role, Less Chat Restrictions, Post Images / Videos / Files, Higher Priority Suggestions and Bugs",
      "[RS Discord Server] Post your own Community Group for Project Ventura, Ability to Advertise",
      "[RS HelpDesk] High Priority Ticket Support",
      "[RS Moderation] High Priority Appeals and Player Reports",
      "[RS Moderation] High Priority Staff Applications"
    ]
  },
  {
    id: "founders",
    name: "Founder's Edition VIP®",
    rating: "4.8",
    price: "64.99",
    featured: true,
    description: "The Founder's Edition VIP® package is our most exclusive tier, created for supporters who want the highest level of access within REACT Studios exclusively.",
    features: [
      "[RS Discord Server] Exclusive Role, Less Chat Restrictions, Post Images / Videos / Files, Higher Priority Suggestions and Bugs",
      "[RS Discord Server] Post your own Community Group for Project Ventura, Ability to Advertise",
      "[RS HelpDesk] Urgent Priority Ticket Support",
      "[RS Moderation] Urgent Priority Appeals and Player Reports",
      "[RS Moderation] Urgent Priority Staff Applications"
    ]
  }
];

export default function Subscriptions() {
  const [billingCycle, setBillingCycle] = useState<"month" | "year">("month");

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Choose your plan</h1>
        <p className="text-sm text-muted-foreground">
          Select the perfect subscription plan for your needs. Upgrade or downgrade anytime.
        </p>
        
        <div className="flex items-center justify-center pt-4">
          <div className="bg-muted p-1 rounded-lg flex gap-1">
            <Button 
              variant={billingCycle === "month" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setBillingCycle("month")}
              className="text-xs h-8 px-4"
            >
              Month
            </Button>
            <Button 
              variant={billingCycle === "year" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setBillingCycle("year")}
              className="text-xs h-8 px-4"
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
                <CardTitle className="text-lg font-bold tracking-tight">{tier.name}</CardTitle>
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-yellow-500">
                  <span>{tier.rating}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 fill-current ${i < 5 ? "" : "text-muted"}`} />
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
                  <span className="text-3xl font-black">${tier.price}</span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </div>
              </div>

              <div className="pt-2">
                <Button asChild className="w-full font-bold h-11" variant={tier.featured ? "default" : "outline"}>
                  <Link href={`/checkout/${tier.id}`}>
                    Get Started
                  </Link>
                </Button>
              </div>

              <div className="space-y-4 flex-1">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Features Included</h4>
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
