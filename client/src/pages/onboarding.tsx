import { useState, useEffect } from "react";
import { Link, useLocation, Redirect } from "wouter";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import img1svg from "@/img1.svg";

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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex w-[35%] bg-card border-r border-white/[0.04] p-12 flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white flex items-center justify-center rounded">
            <img src={img1svg} alt="RIVET Studios" className="h-10 w-auto" data-testid="img-logo" />
          </div>
          <span className="font-semibold text-xl tracking-tight text-foreground">
            RIVET Studios™
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          © 2026 RIVET Studios™
        </p>
      </div>

      <div className="flex-1 p-8 lg:p-24 flex flex-col items-center overflow-y-auto">
        <div className="w-full max-w-2xl space-y-12">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-semibold text-foreground" data-testid="text-onboarding-welcome">
              Welcome, {user.username}
            </h1>
            <p className="text-muted-foreground">
              Let's get your account set up in just a few steps.
            </p>
          </div>

          <div className="flex justify-between items-start relative px-4">
            {steps.map((s) => (
              <div
                key={s.id}
                className="flex flex-col items-center gap-2 relative z-10"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors text-sm font-medium ${
                    step > s.id
                      ? "bg-white border-white text-black"
                      : step === s.id
                        ? "bg-transparent border-white text-white"
                        : "bg-transparent border-white/10 text-white/30"
                  }`}
                  data-testid={`step-indicator-${s.id}`}
                >
                  {step > s.id ? <Check className="w-5 h-5" /> : s.id}
                </div>
                <p
                  className={`text-xs font-medium ${step >= s.id ? "text-foreground" : "text-muted-foreground/50"}`}
                >
                  {s.label}
                </p>
              </div>
            ))}
            <div className="absolute top-5 left-0 w-full h-[2px] bg-white/[0.06] -z-0" />
          </div>

          <div className="space-y-8">
            {step === 1 && (
              <div className="space-y-6 text-center" data-testid="step-account">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-foreground">
                    Account Verified
                  </h2>
                  <p className="text-muted-foreground">
                    You're logged in as <span className="font-semibold text-foreground">{user.username}</span>.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="w-full bg-white text-black"
                  onClick={() => setStep(2)}
                  data-testid="button-continue-step1"
                >
                  Continue
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6" data-testid="step-profile">
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-semibold text-foreground">
                    Complete your profile
                  </h2>
                  <p className="text-muted-foreground">
                    Tell the community a bit about yourself.
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-foreground">Bio</Label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="w-full min-h-[120px] p-3 rounded-lg border border-white/[0.08] bg-card text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-white/20 outline-none transition-all"
                      data-testid="input-bio"
                    />
                  </div>
                  <Button
                    size="lg"
                    className="w-full bg-white text-black"
                    onClick={handleCompleteProfile}
                    disabled={isUpdating}
                    data-testid="button-save-profile"
                  >
                    {isUpdating ? <Loader2 className="animate-spin" /> : "Save & Continue"}
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6" data-testid="step-integrations">
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-semibold text-foreground">
                    Link your accounts
                  </h2>
                  <p className="text-muted-foreground">
                    Connect your Discord and Roblox accounts for full access.
                  </p>
                </div>
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-between px-6 border-white/[0.08] bg-card"
                    asChild
                    data-testid="button-connect-discord"
                  >
                    <a href="/api/auth/discord">
                      <span className="font-medium">Connect Discord</span>
                      {user.discordId ? <Check className="text-green-500" /> : <ChevronRight className="w-5 h-5" />}
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-between px-6 border-white/[0.08] bg-card"
                    onClick={() => toast({ title: "Link Roblox in Settings after onboarding." })}
                    data-testid="button-connect-roblox"
                  >
                    <span className="font-medium">Connect Roblox</span>
                    {user.robloxId ? <Check className="text-green-500" /> : <ChevronRight className="w-5 h-5" />}
                  </Button>
                  <Button
                    size="lg"
                    className="w-full bg-white text-black"
                    onClick={() => setStep(4)}
                    data-testid="button-continue-step3"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 text-center" data-testid="step-complete">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-foreground">
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
                    size="lg"
                    className="w-full border-white/[0.08]"
                    data-testid="button-view-vip"
                  >
                    <Link href="/store/subscriptions">View VIP Tiers</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    className="w-full bg-white text-black"
                    data-testid="button-go-dashboard"
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
