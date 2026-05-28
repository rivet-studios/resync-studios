import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Mail } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import logoSvg from "@assets/logo.svg";

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) {
      setError(err);
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const emailLoginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/email-login", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      navigate("/dashboard");
    },
    onError: (err: any) => {
      setError(
        err.message ||
          "Incorrect email or password. Please try again. If the issue persists, contact support.",
      );
    },
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }
    emailLoginMutation.mutate({ email, password });
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
            <h1 className="text-xl font-semibold text-[#09090B] dark:text-white" data-testid="heading-login">
              Log in to your account
            </h1>
            <p className="text-sm text-[#71717A] dark:text-white/50">
              Enter your email and password below to log in
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-3 flex gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#09090B] dark:text-white">Email address</label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={emailLoginMutation.isPending}
              data-testid="input-email"
              className="rounded-lg border-[#E4E4E7] dark:border-white/10 bg-white dark:bg-white/5 text-[#09090B] dark:text-white placeholder:text-[#A1A1AA]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#09090B] dark:text-white">Password</label>
              <a href="/forgot-password" className="text-xs text-[#71717A] hover:text-[#09090B] dark:hover:text-white transition-colors" data-testid="link-forgot-password">
                Forgot password?
              </a>
            </div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={emailLoginMutation.isPending}
              data-testid="input-password"
              className="rounded-lg border-[#E4E4E7] dark:border-white/10 bg-white dark:bg-white/5 text-[#09090B] dark:text-white placeholder:text-[#A1A1AA]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 rounded border-[#E4E4E7] dark:border-white/20 accent-[#18181B]"
              data-testid="checkbox-remember"
            />
            <label
              htmlFor="remember"
              className="text-sm text-[#71717A] dark:text-white/50 cursor-pointer"
            >
              Remember me
            </label>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#18181B] text-white rounded-lg font-medium text-sm shadow-sm"
            disabled={emailLoginMutation.isPending}
            data-testid="button-login-email"
          >
            {emailLoginMutation.isPending ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E4E4E7] dark:border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white dark:bg-[#050505] text-[#A1A1AA] dark:text-white/40">
              Or login with
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            asChild
            variant="outline"
            className="w-full gap-2 rounded-lg border-[#E4E4E7] dark:border-white/10 bg-white dark:bg-white/5 text-[#09090B] dark:text-white font-medium text-sm shadow-sm"
            data-testid="button-login-discord"
          >
            <a href="/api/auth/discord">
              <SiDiscord className="w-4 h-4" />
              Login with Discord
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full gap-2 rounded-lg border-[#E4E4E7] dark:border-white/10 bg-white dark:bg-white/5 text-[#09090B] dark:text-white font-medium text-sm shadow-sm"
            data-testid="button-login-magic-link"
          >
            <a href="/magic-link">
              <Mail className="w-4 h-4" />
              Email me a login link
            </a>
          </Button>
        </div>

        <p className="text-center text-sm text-[#71717A] dark:text-white/50">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-[#09090B] dark:text-white hover:underline font-medium"
            data-testid="link-signup"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
