import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useSearch, Redirect } from "wouter";
import { Check, Link2, Loader2, RefreshCw, AlertCircle, CheckCircle, ChevronRight } from "lucide-react";
import { SiDiscord, SiRoblox } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import logoSvg from "@assets/logo.svg";

// ─── Step config ─────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Account",       sub: "Create your account" },
  { id: 2, label: "Email",         sub: "Verify your email" },
  { id: 3, label: "Integrations",  sub: "Link your accounts" },
  { id: 4, label: "Profile",       sub: "Complete your profile" },
  { id: 5, label: "Subscriptions", sub: "Start a subscription" },
];

const POLICIES = [
  { key: "terms",    label: "Terms & Conditions",                          href: "/terms" },
  { key: "privacy",  label: "Privacy Policy",                              href: "/privacy" },
  { key: "subagr",   label: "Subscription Services Agreement",             href: "/subscription-agreement" },
  { key: "aup",      label: "Acceptable Use Policy (AUP) & Community Guidelines", href: "/guidelines" },
];

const VIP_TIERS = [
  {
    id: "bronze",
    name: "Bronze Donator",
    price: "$9.99/mo",
    color: "#cd7f32",
    features: ["Exclusive Discord Role", "Priority Support", "22% XP & Paycheck Boost"],
  },
  {
    id: "diamond",
    name: "Diamond Donator",
    price: "$14.99/mo",
    color: "#b9f2ff",
    features: ["Exclusive Discord Role", "Monthly Exclusive Vehicles", "47% XP Boost"],
  },
  {
    id: "founders",
    name: "Founders Edition",
    price: "$19.99/mo",
    color: "#a855f7",
    featured: true,
    features: ["All-Rank & Team Bypass", "Internal Affairs Authority", "78% Paycheck Boost"],
  },
];

// ─── Background ───────────────────────────────────────────────────────────────

const HEX_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='58' height='100' viewBox='0 0 58 100'%3E%3Cpolygon points='29,2 56,17 56,48 29,63 2,48 2,17' fill='none' stroke='%23191919' stroke-width='1'/%3E%3Cpolygon points='29,52 56,67 56,98 29,113 2,98 2,67' fill='none' stroke='%23191919' stroke-width='1'/%3E%3C/svg%3E")`;

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="relative flex justify-between items-start w-full max-w-sm mx-auto px-2">
      <div
        className="absolute top-4 left-6 right-6 h-px"
        style={{ background: "rgba(255,255,255,0.08)" }}
      />
      {STEPS.map((s) => (
        <div key={s.id} className="flex flex-col items-center gap-1.5 relative z-10">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
            style={
              step > s.id
                ? { background: "#fff", color: "#000" }
                : step === s.id
                ? { background: "transparent", border: "2px solid #fff", color: "#fff" }
                : { background: "#18181b", border: "2px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" }
            }
            data-testid={`step-indicator-${s.id}`}
          >
            {step > s.id ? <Check className="w-4 h-4" /> : s.id}
          </div>
          <span
            className="text-[10px] font-medium"
            style={{ color: step >= s.id ? "#fff" : "rgba(255,255,255,0.3)" }}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Onboarding() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);

  // Derive initial step from URL params
  const urlStep  = parseInt(params.get("step") || "1", 10);
  const urlVerified = params.get("verified") === "true";

  const [step, setStep] = useState(1);

  // Step 1 state
  const [s1Username, setS1Username]   = useState("");
  const [s1Email,    setS1Email]      = useState("");
  const [s1Password, setS1Password]   = useState("");
  const [s1Confirm,  setS1Confirm]    = useState("");
  const [s1Policies, setS1Policies]   = useState<Record<string, boolean>>({});
  const [s1Error,    setS1Error]      = useState("");
  const [s1Loading,  setS1Loading]    = useState(false);

  // Step 2 state
  const [emailVerified, setEmailVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Step 4 state
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dobLoading,  setDobLoading]  = useState(false);

  // ── Effect: redirect authenticated users to the right step ──────────────────
  useEffect(() => {
    if (authLoading) return;
    if (user) {
      // Sync local emailVerified state from the server user object
      if ((user as any).emailVerified) setEmailVerified(true);

      // Email just verified via link — advance past step 2
      if (urlVerified) {
        setEmailVerified(true);
        setStep(3);
        return;
      }
      // Resume from URL step, skipping step 2 if email already verified
      const minStep = (user as any).emailVerified ? 3 : 2;
      const target = Math.max(urlStep, minStep);
      setStep(target);
      if (user.dateOfBirth) setDateOfBirth(user.dateOfBirth);
    }
  }, [authLoading, user]);

  // ── Effect: poll email verification on step 2 ───────────────────────────────
  useEffect(() => {
    if (step !== 2 || emailVerified) return;

    const poll = async () => {
      try {
        const res = await fetch("/api/auth/email-verified");
        if (res.ok) {
          const data = await res.json();
          if (data.verified) {
            setEmailVerified(true);
            if (pollRef.current) clearInterval(pollRef.current);
          }
        }
      } catch (_) {}
    };

    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [step, emailVerified]);

  // ── Resend cooldown ticker ──────────────────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ─── Step 1: Create account ──────────────────────────────────────────────────
  const handleCreateAccount = async () => {
    setS1Error("");
    if (!s1Username || !s1Email || !s1Password || !s1Confirm) {
      setS1Error("Please fill in all fields.");
      return;
    }
    if (s1Password.length < 8) {
      setS1Error("Password must be at least 8 characters.");
      return;
    }
    if (s1Password !== s1Confirm) {
      setS1Error("Passwords do not match.");
      return;
    }
    if (!POLICIES.every((p) => s1Policies[p.key])) {
      setS1Error("Please agree to all policies to continue.");
      return;
    }
    try {
      setS1Loading(true);
      await apiRequest("POST", "/api/auth/signup", {
        username: s1Username,
        email: s1Email,
        password: s1Password,
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setStep(2);
    } catch (err: any) {
      setS1Error(err.message || "Signup failed. Please try again.");
    } finally {
      setS1Loading(false);
    }
  };

  // ─── Step 2: Resend email ────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      setResendLoading(true);
      await apiRequest("POST", "/api/auth/send-verification", {});
      setResendCooldown(60);
      toast({ title: "Verification email sent", description: "Check your inbox." });
    } catch (_) {
      toast({ title: "Failed to resend", variant: "destructive" });
    } finally {
      setResendLoading(false);
    }
  };

  // ─── Step 4: Save profile ────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!dateOfBirth) {
      toast({ title: "Please enter your date of birth.", variant: "destructive" });
      return;
    }
    try {
      setDobLoading(true);
      await apiRequest("PATCH", "/api/users/profile", {
        username: user?.username,
        dateOfBirth,
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setStep(5);
    } catch (_) {
      toast({ title: "Failed to save profile", variant: "destructive" });
    } finally {
      setDobLoading(false);
    }
  };

  // ─── Loading state ───────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#050505" }}>
        <Loader2 className="w-8 h-8 animate-spin text-white/30" />
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-start overflow-x-hidden"
      style={{ background: "#050505" }}
    >
      {/* Hex pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: HEX_SVG, backgroundSize: "58px 100px", opacity: 0.7 }}
      />
      {/* Purple/crimson glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 90% 0%, rgba(110,20,60,0.55) 0%, rgba(70,10,50,0.3) 35%, transparent 65%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-5 py-10 flex flex-col gap-8">
        {/* Logo + heading */}
        <div className="flex flex-col items-center gap-3">
          <img
            src={logoSvg}
            alt="RIVET Studios"
            className="w-10 h-10"
            data-testid="img-logo"
          />
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-white" data-testid="text-welcome">
              Welcome
            </h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
              Let's get your account set up in just a few steps.
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <StepIndicator step={step} total={STEPS.length} />

        {/* ── Step 1: Account ────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5" data-testid="step-account">
            <div>
              <h2 className="text-xl font-semibold text-white">Create your account</h2>
              <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                Enter your details to get started.
              </p>
            </div>

            {s1Error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-400">{s1Error}</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/80">Username</label>
                <Input
                  placeholder="John Doe"
                  value={s1Username}
                  onChange={(e) => setS1Username(e.target.value)}
                  disabled={s1Loading}
                  data-testid="input-username"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-white/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/80">Email address</label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={s1Email}
                  onChange={(e) => setS1Email(e.target.value)}
                  disabled={s1Loading}
                  data-testid="input-email"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-white/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/80">Password</label>
                <Input
                  type="password"
                  placeholder="········"
                  value={s1Password}
                  onChange={(e) => setS1Password(e.target.value)}
                  disabled={s1Loading}
                  data-testid="input-password"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-white/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/80">Confirm password</label>
                <Input
                  type="password"
                  placeholder="········"
                  value={s1Confirm}
                  onChange={(e) => setS1Confirm(e.target.value)}
                  disabled={s1Loading}
                  data-testid="input-confirm-password"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-white/30"
                />
              </div>
            </div>

            {/* Policy checkboxes */}
            <div className="space-y-2">
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                By creating an account, you agree to the following policies:
              </p>
              {POLICIES.map((p) => (
                <div key={p.key} className="flex items-start gap-3">
                  <Checkbox
                    id={`policy-${p.key}`}
                    checked={!!s1Policies[p.key]}
                    onCheckedChange={(v) =>
                      setS1Policies((prev) => ({ ...prev, [p.key]: !!v }))
                    }
                    data-testid={`checkbox-policy-${p.key}`}
                    className="mt-0.5 border-white/20 data-[state=checked]:bg-white data-[state=checked]:border-white"
                  />
                  <label
                    htmlFor={`policy-${p.key}`}
                    className="text-sm cursor-pointer"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    I agree to the{" "}
                    <Link
                      href={p.href}
                      className="underline hover:text-white transition-colors"
                      style={{ color: "rgba(255,255,255,0.9)" }}
                    >
                      {p.label}
                    </Link>
                  </label>
                </div>
              ))}
            </div>

            <Button
              className="w-full font-medium"
              style={{ background: "#fff", color: "#000" }}
              onClick={handleCreateAccount}
              disabled={s1Loading}
              data-testid="button-continue-step1"
            >
              {s1Loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"}
            </Button>

            <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Already have an account?{" "}
              <Link href="/login" className="text-white hover:underline font-medium">
                Log in
              </Link>
            </p>
          </div>
        )}

        {/* ── Step 2: Email verification ─────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5" data-testid="step-email">
            <div>
              <h2 className="text-xl font-semibold text-white">Verify your email</h2>
              <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                Check your inbox for our verification email.
              </p>
            </div>

            {emailVerified ? (
              <div
                className="rounded-xl border p-4 space-y-1"
                style={{ borderColor: "rgba(34,197,94,0.4)", background: "rgba(34,197,94,0.07)" }}
                data-testid="email-verified-success"
              >
                <p className="text-sm font-semibold text-green-400">Email verified</p>
                <p className="text-sm" style={{ color: "rgba(34,197,94,0.8)" }}>
                  Your email has been successfully verified.
                </p>
              </div>
            ) : (
              <div
                className="rounded-xl border p-4 space-y-3"
                style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
                data-testid="email-pending"
              >
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white/40" />
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                    Waiting for verification…
                  </p>
                </div>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                  We sent a link to <strong className="text-white/60">{user?.email}</strong>. Click it to verify.
                </p>
                <button
                  onClick={handleResend}
                  disabled={resendLoading || resendCooldown > 0}
                  className="flex items-center gap-1.5 text-xs font-medium transition-opacity disabled:opacity-40"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                  data-testid="button-resend-verification"
                >
                  <RefreshCw className="w-3 h-3" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend email"}
                </button>
              </div>
            )}

            <Button
              className="w-full font-medium"
              style={{ background: "#fff", color: "#000" }}
              onClick={() => setStep(3)}
              disabled={!emailVerified}
              data-testid="button-continue-step2"
            >
              Continue
            </Button>
          </div>
        )}

        {/* ── Step 3: Integrations ────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5" data-testid="step-integrations">
            <div>
              <h2 className="text-xl font-semibold text-white">Setup integrations</h2>
              <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                Link your social accounts for a better experience.
              </p>
            </div>

            {/* Info banner */}
            <div
              className="rounded-xl border p-4"
              style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
            >
              <p className="text-sm font-medium text-white/80">More account providers coming soon</p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                Connect your accounts to enhance your experience. You can skip this step and connect them later from your settings.
              </p>
            </div>

            {/* Discord card */}
            <div
              className="rounded-xl border p-4 space-y-3"
              style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#5865F2" }}>
                  <SiDiscord className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Discord</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Connect your Discord account</p>
                </div>
                {user?.discordId && <Check className="ml-auto w-5 h-5 text-green-400" />}
              </div>
              {user?.discordId ? (
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Connected as {user.discordUsername || "Discord user"}
                </div>
              ) : (
                <a
                  href="/api/auth/discord"
                  className="flex items-center justify-center gap-2 w-full rounded-lg border py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
                  style={{ borderColor: "rgba(255,255,255,0.15)" }}
                  data-testid="button-connect-discord"
                >
                  <Link2 className="w-4 h-4" />
                  Connect Discord
                </a>
              )}
            </div>

            {/* Roblox card */}
            <div
              className="rounded-xl border p-4 space-y-3"
              style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.15)" }}>
                  <SiRoblox className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Roblox</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Link your Roblox profile</p>
                </div>
                {user?.robloxId && <Check className="ml-auto w-5 h-5 text-green-400" />}
              </div>
              {user?.robloxId ? (
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Linked as {user.robloxUsername || "Roblox user"}
                </div>
              ) : (
                <a
                  href="/api/auth/roblox?returnTo=/onboarding?step=3"
                  className="flex items-center justify-center gap-2 w-full rounded-lg border py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
                  style={{ borderColor: "rgba(255,255,255,0.15)" }}
                  data-testid="button-connect-roblox"
                >
                  <Link2 className="w-4 h-4" />
                  Connect Roblox
                </a>
              )}
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white font-medium"
                onClick={() => setStep(2)}
                data-testid="button-back-step3"
              >
                Back
              </Button>
              <Button
                className="w-full font-medium"
                style={{ background: "#fff", color: "#000" }}
                onClick={() => setStep(4)}
                data-testid="button-continue-step3"
              >
                {user?.discordId || user?.robloxId ? "Continue" : "Skip for now"}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 4: Profile ─────────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-5" data-testid="step-profile">
            <div>
              <h2 className="text-xl font-semibold text-white">Complete your profile</h2>
              <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                Tell us a bit more about yourself.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/80">
                Date of Birth <span className="text-red-400">*</span>
              </label>
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                data-testid="input-dob"
                className="bg-white/5 border-white/10 text-white focus:border-white/30"
                style={{ colorScheme: "dark" }}
              />
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white font-medium"
                onClick={() => setStep(3)}
                data-testid="button-back-step4"
              >
                Back
              </Button>
              <Button
                className="w-full font-medium"
                style={{ background: "#fff", color: "#000" }}
                onClick={handleSaveProfile}
                disabled={dobLoading}
                data-testid="button-continue-step4"
              >
                {dobLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 5: Subscriptions ───────────────────────────────────────────── */}
        {step === 5 && (
          <div className="space-y-5" data-testid="step-subscriptions">
            <div>
              <h2 className="text-xl font-semibold text-white">Choose a subscription</h2>
              <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                Unlock exclusive perks with a VIP plan. You can always upgrade later.
              </p>
            </div>

            <div className="space-y-3">
              {VIP_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className="rounded-xl border p-4 space-y-3 transition-colors"
                  style={{
                    borderColor: tier.featured ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.08)",
                    background: tier.featured ? "rgba(168,85,247,0.06)" : "rgba(255,255,255,0.03)",
                  }}
                  data-testid={`card-vip-${tier.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{tier.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: tier.color }}>
                        {tier.price}
                      </p>
                    </div>
                    {tier.featured && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(168,85,247,0.2)", color: "#a855f7" }}
                      >
                        POPULAR
                      </span>
                    )}
                  </div>
                  <ul className="space-y-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                        <Check className="w-3 h-3 flex-shrink-0 text-green-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/store/subscriptions">
                    <Button
                      size="sm"
                      className="w-full text-xs font-medium"
                      style={
                        tier.featured
                          ? { background: "#a855f7", color: "#fff" }
                          : { background: "rgba(255,255,255,0.1)", color: "#fff" }
                      }
                      data-testid={`button-select-${tier.id}`}
                    >
                      Select Plan
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white font-medium"
                onClick={() => setStep(4)}
                data-testid="button-back-step5"
              >
                Back
              </Button>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="w-full text-white/50 hover:text-white/70"
                  data-testid="button-skip-subscriptions"
                >
                  Skip for now — Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
