import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const steps = [
  { id: 1, label: "Account", sub: "Verify your status" },
  { id: 2, label: "Profile", sub: "Complete your profile" },
  { id: 3, label: "Integrations", sub: "Link your accounts" },
  { id: 4, label: "Subscriptions", sub: "Start a subscription" },
];

export default function Onboarding() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [bio, setBio] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user?.bio) setBio(user.bio);
  }, [user]);

  const handleCompleteProfile = async () => {
    try {
      setIsUpdating(true);
      await apiRequest("PATCH", "/api/users/profile", {
        username: user?.username,
        bio,
      });
      toast({ title: "Profile updated!" });
      setStep(3);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Link href="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Dark Brand Area */}
      <div className="hidden lg:flex w-[35%] bg-[#0A0A0A] p-12 flex-col justify-between text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white flex items-center justify-center rounded">
            <span className="text-black font-black text-xl italic">RS</span>
          </div>
          <span className="font-bold text-xl tracking-tight">
            RIVET Studios™
          </span>
        </div>
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            © 2026 RIVET Studios™
          </p>
        </div>
      </div>

      {/* Right side - Onboarding Content */}
      <div className="flex-1 p-8 lg:p-24 flex flex-col items-center overflow-y-auto">
        <div className="w-full max-w-2xl space-y-12">
          {/* Welcome Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-[#0A0A0A]">Welcome, {user.username}</h1>
            <p className="text-muted-foreground">
              Let's get your account set up in just a few steps.
            </p>
          </div>

          {/* Stepper */}
          <div className="flex justify-between items-start relative px-4">
            {steps.map((s, i) => (
              <div
                key={s.id}
                className="flex flex-col items-center gap-2 relative z-10"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    step >= s.id
                      ? "bg-white border-black text-black"
                      : "bg-white border-gray-200 text-gray-400"
                  }`}
                >
                  {step > s.id ? <Check className="w-5 h-5" /> : s.id}
                </div>
                <div className="text-center">
                  <p
                    className={`text-xs font-bold ${step >= s.id ? "text-black" : "text-gray-400"}`}
                  >
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
            {/* Connector Lines */}
            <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-100 -z-0" />
          </div>

          <div className="space-y-8">
            {step === 1 && (
              <div className="space-y-6 text-center">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-[#0A0A0A]">
                    Account Verified
                  </h2>
                  <p className="text-muted-foreground">
                    You're logged in as <span className="font-bold text-black">{user.username}</span>.
                  </p>
                </div>
                <Button
                  className="w-full h-14 bg-[#0A0A0A] hover:bg-black text-white text-lg font-bold rounded-xl"
                  onClick={() => setStep(2)}
                >
                  Continue
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold text-[#0A0A0A]">
                    Complete your profile
                  </h2>
                  <p className="text-muted-foreground">
                    Tell the community a bit about yourself.
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="w-full min-h-[120px] p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
                    />
                  </div>
                  <Button
                    className="w-full h-14 bg-[#0A0A0A] hover:bg-black text-white text-lg font-bold rounded-xl"
                    onClick={handleCompleteProfile}
                    disabled={isUpdating}
                  >
                    {isUpdating ? <Loader2 className="animate-spin" /> : "Save & Continue"}
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold text-[#0A0A0A]">
                    Link your accounts
                  </h2>
                  <p className="text-muted-foreground">
                    Connect your Discord and Roblox accounts for full access.
                  </p>
                </div>
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full h-14 justify-between px-6"
                    asChild
                  >
                    <a href="/api/auth/discord">
                      <span className="font-bold">Connect Discord</span>
                      {user.discordId ? <Check className="text-green-500" /> : <ChevronRight className="w-5 h-5" />}
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-14 justify-between px-6"
                    onClick={() => toast({ title: "Coming soon!" })}
                  >
                    <span className="font-bold">Connect Roblox</span>
                    {user.robloxId ? <Check className="text-green-500" /> : <ChevronRight className="w-5 h-5" />}
                  </Button>
                  <Button
                    className="w-full h-14 bg-[#0A0A0A] hover:bg-black text-white text-lg font-bold rounded-xl"
                    onClick={() => setStep(4)}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 text-center">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-[#0A0A0A]">
                    You're all set!
                  </h2>
                  <p className="text-muted-foreground">
                    Your account is configured and ready to go.
                  </p>
                </div>
                <div className="grid gap-4">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-14 text-lg font-bold rounded-xl"
                  >
                    <Link href="/store/subscriptions">View VIP Tiers</Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full h-14 bg-[#0A0A0A] hover:bg-black text-white text-lg font-bold rounded-xl"
                  >
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
