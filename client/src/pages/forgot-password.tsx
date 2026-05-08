import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import logoSvg from "@assets/logo-rs.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const forgotMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await apiRequest("POST", "/api/auth/forgot-password", data);
      return response.json();
    },
    onSuccess: () => {
      setSent(true);
    },
    onError: (err: any) => {
      setError(err.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    forgotMutation.mutate({ email });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(135deg, rgba(219,234,254,0.4) 0%, rgba(243,232,255,0.3) 25%, rgba(255,255,255,0.9) 50%, rgba(220,252,231,0.3) 75%, rgba(252,231,243,0.4) 100%)",
        }}
      />
      <div className="absolute inset-0 z-0 bg-white/60 dark:bg-[#050505]/90" />

      <div className="relative z-10 w-full max-w-[420px] space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <img src={logoSvg} alt="RS" className="w-12 h-12 invert dark:invert-0" data-testid="img-logo" />
          <div className="text-center space-y-1">
            <h1 className="text-xl font-semibold text-[#09090B] dark:text-white" data-testid="heading-forgot-password">
              {sent ? "Check your email" : "Reset your password"}
            </h1>
            <p className="text-sm text-[#71717A] dark:text-white/50">
              {sent
                ? "We've sent a password reset link to your email"
                : "Enter your email address and we'll send you a reset link"}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-3 flex gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400" data-testid="text-error">{error}</p>
          </div>
        )}

        {sent ? (
          <div className="space-y-6">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg p-4 flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium" data-testid="text-success">
                  Reset link sent
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400/70 mt-1">
                  If an account exists for <strong>{email}</strong>, you'll receive an email with instructions to reset your password. The link expires in 1 hour.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full gap-2 rounded-lg border-[#E4E4E7] dark:border-white/10 bg-white dark:bg-white/5 text-[#09090B] dark:text-white font-medium text-sm"
                onClick={() => { setSent(false); setEmail(""); }}
                data-testid="button-try-different-email"
              >
                <Mail className="w-4 h-4" />
                Try a different email
              </Button>

              <a href="/login" className="flex items-center justify-center gap-2 text-sm text-[#71717A] dark:text-white/50 hover:text-[#09090B] dark:hover:text-white transition-colors" data-testid="link-back-login">
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#09090B] dark:text-white">Email address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={forgotMutation.isPending}
                data-testid="input-email"
                className="rounded-lg border-[#E4E4E7] dark:border-white/10 bg-white dark:bg-white/5 text-[#09090B] dark:text-white placeholder:text-[#A1A1AA]"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#18181B] text-white rounded-lg font-medium text-sm shadow-sm"
              disabled={forgotMutation.isPending}
              data-testid="button-send-reset"
            >
              {forgotMutation.isPending ? "Sending..." : "Send reset link"}
            </Button>

            <a href="/login" className="flex items-center justify-center gap-2 text-sm text-[#71717A] dark:text-white/50 hover:text-[#09090B] dark:hover:text-white transition-colors" data-testid="link-back-login">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </a>
          </form>
        )}
      </div>
    </div>
  );
}
