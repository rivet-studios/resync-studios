import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AuthBackground } from "@/components/auth-background";
import logoSvg from "@assets/logo-rs.png";

export default function MagicLink() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const token = params.get("token");

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [verifying, setVerifying] = useState(!!token);

  const requestMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await apiRequest("POST", "/api/auth/magic-link/request", data);
      return response.json();
    },
    onSuccess: () => setSent(true),
    onError: (err: any) => setError(err.message || "Something went wrong. Please try again."),
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: { token: string }) => {
      const response = await apiRequest("POST", "/api/auth/magic-link/verify", data);
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      navigate("/dashboard");
    },
    onError: (err: any) => {
      setVerifying(false);
      setError(err.message || "This login link is invalid or has expired.");
    },
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate({ token });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    requestMutation.mutate({ email });
  };

  if (verifying) {
    return (
      <AuthBackground>
        <div className="space-y-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <img src={logoSvg} alt="RIVET Studios" className="h-10 w-auto" data-testid="img-logo" />
            <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
            <div className="space-y-1.5">
              <h1 className="text-2xl font-semibold tracking-tight text-white">Signing you in</h1>
              <p className="text-sm text-white/60">Verifying your login link...</p>
            </div>
          </div>
        </div>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
      <div className="space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <img src={logoSvg} alt="RIVET Studios" className="h-10 w-auto" data-testid="img-logo" />
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-white" data-testid="heading-magic-link">
              {sent ? "Check your email" : "Email login link"}
            </h1>
            <p className="text-sm text-white/60">
              {sent
                ? "We've sent a login link to your email"
                : "Enter your email to receive a login link"}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400" data-testid="text-error">{error}</p>
          </div>
        )}

        {sent ? (
          <div className="space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-emerald-300 font-medium" data-testid="text-success">
                  Login link sent
                </p>
                <p className="text-xs text-emerald-400/80 mt-1">
                  If an account exists for <strong>{email}</strong>, you'll receive an email with a one-time login link. The link expires in 24 hours.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full gap-2 rounded-lg border-white/10 bg-white/5 text-white font-medium text-sm hover:bg-white/10"
                onClick={() => { setSent(false); setEmail(""); }}
                data-testid="button-try-different-email"
              >
                <Mail className="w-4 h-4" />
                Try a different email
              </Button>

              <a href="/login" className="flex items-center justify-center gap-2 text-sm text-white/50 hover:text-white transition-colors" data-testid="link-back-login">
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Email address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={requestMutation.isPending}
                data-testid="input-email"
                className="rounded-lg border-white/10 bg-white/5 text-white placeholder:text-white/30 h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-white/90 rounded-lg font-medium text-sm shadow-sm h-11"
              disabled={requestMutation.isPending}
              data-testid="button-send-link"
            >
              {requestMutation.isPending ? "Sending..." : "Send login link"}
            </Button>

            <a href="/login" className="flex items-center justify-center gap-2 text-sm text-white/50 hover:text-white transition-colors" data-testid="link-back-login">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </a>
          </form>
        )}
      </div>
    </AuthBackground>
  );
}
