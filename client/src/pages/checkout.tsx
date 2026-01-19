import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CreditCard, Lock, ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const tiers = {
  bronze: {
    name: "Bronze VIP®",
    price: "13.99",
    color: "bg-orange-500/10 text-orange-600 border-orange-200"
  },
  diamond: {
    name: "Diamond VIP®",
    price: "34.99",
    color: "bg-blue-500/10 text-blue-600 border-blue-200"
  },
  founders: {
    name: "Founder's Edition VIP®",
    price: "64.99",
    color: "bg-primary/10 text-primary border-primary/20"
  }
};

export default function Checkout() {
  const { tierId } = useParams<{ tierId: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const tier = tiers[tierId as keyof typeof tiers];

  if (!tier) {
    return <div className="p-8 text-center">Invalid tier selected</div>;
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      alert("Payment successful! Your VIP status will be updated shortly.");
      setLocation("/dashboard");
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 animate-in fade-in duration-500">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setLocation("/store/subscriptions")}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Subscriptions
      </Button>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Checkout Form */}
        <div className="md:col-span-7 space-y-6">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Checkout</h2>
            <p className="text-sm text-muted-foreground">Complete your purchase to unlock exclusive benefits.</p>
          </section>

          <Card className="border-border/40 shadow-sm rounded-xl overflow-hidden bg-card/30 backdrop-blur-sm">
            <CardHeader className="border-b border-border/40 bg-muted/20">
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-name">Name on Card</Label>
                  <Input id="card-name" placeholder="John Doe" required className="bg-background/50" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <div className="relative">
                    <Input id="card-number" placeholder="0000 0000 0000 0000" required className="bg-background/50 pl-10" />
                    <CreditCard className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM / YY" required className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" required className="bg-background/50" />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-bold" 
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : `Pay $${tier.price}`}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-6 text-muted-foreground">
             <div className="flex items-center gap-1.5 text-xs font-medium">
                <Lock className="w-3.5 h-3.5" />
                <span>Secure SSL Encryption</span>
             </div>
             <div className="flex items-center gap-1.5 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Purchase</span>
             </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-5">
          <Card className="border-border/40 shadow-sm rounded-xl overflow-hidden bg-muted/30 sticky top-24">
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground">{tier.name}</h4>
                  <p className="text-xs text-muted-foreground">Monthly Subscription</p>
                </div>
                <Badge variant="outline" className={`rounded-full ${tier.color}`}>
                  Selected
                </Badge>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/40">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">${tier.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium text-foreground">$0.00</span>
                </div>
                <div className="flex justify-between text-lg pt-4 border-t border-border/40">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-black text-primary">${tier.price}</span>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  By completing your purchase, you agree to our <a href="/terms" className="text-primary hover:underline font-bold">Terms of Service</a> and <a href="/privacy" className="text-primary hover:underline font-bold">Privacy Policy</a>. Subscriptions renew automatically until cancelled.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
