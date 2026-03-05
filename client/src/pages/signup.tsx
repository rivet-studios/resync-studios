import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import logoSvg from "@assets/logo.svg";

export default function Signup() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const signupMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      username: string;
      password: string;
    }) => {
      const response = await apiRequest("POST", "/api/auth/signup", data);
      return response.json();
    },
    onSuccess: () => {
      setSuccess(true);
      setError("");
      setTimeout(() => navigate("/login"), 2000);
    },
    onError: (err: any) => {
      setError(err.message || "Signup failed. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !username || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    signupMutation.mutate({ email, username, password });
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
            <h1 className="text-xl font-semibold text-[#09090B] dark:text-white" data-testid="heading-signup">
              Create your account
            </h1>
            <p className="text-sm text-[#71717A] dark:text-white/50">
              Join the RIVET Studios community
            </p>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg p-3 flex gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-600 dark:text-green-400">Account created! Redirecting to login...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-3 flex gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#09090B] dark:text-white">Username</label>
            <Input
              type="text"
              placeholder="Choose your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={signupMutation.isPending}
              data-testid="input-username"
              className="rounded-lg border-[#E4E4E7] dark:border-white/10 bg-white dark:bg-white/5 text-[#09090B] dark:text-white placeholder:text-[#A1A1AA]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#09090B] dark:text-white">Email address</label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={signupMutation.isPending}
              data-testid="input-email"
              className="rounded-lg border-[#E4E4E7] dark:border-white/10 bg-white dark:bg-white/5 text-[#09090B] dark:text-white placeholder:text-[#A1A1AA]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#09090B] dark:text-white">Password</label>
            <Input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={signupMutation.isPending}
              data-testid="input-password"
              className="rounded-lg border-[#E4E4E7] dark:border-white/10 bg-white dark:bg-white/5 text-[#09090B] dark:text-white placeholder:text-[#A1A1AA]"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#18181B] text-white rounded-lg font-medium text-sm shadow-sm"
            disabled={signupMutation.isPending}
            data-testid="button-signup"
          >
            {signupMutation.isPending ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E4E4E7] dark:border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white dark:bg-[#050505] text-[#A1A1AA] dark:text-white/40">
              Or sign up with
            </span>
          </div>
        </div>

        <Button
          asChild
          variant="outline"
          className="w-full gap-2 rounded-lg border-[#E4E4E7] dark:border-white/10 bg-white dark:bg-white/5 text-[#09090B] dark:text-white font-medium text-sm shadow-sm"
          data-testid="button-signup-discord"
        >
          <a href="/api/login">
            <SiDiscord className="w-4 h-4" />
            Sign up with Discord
          </a>
        </Button>

        <p className="text-center text-sm text-[#71717A] dark:text-white/50">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-[#09090B] dark:text-white hover:underline font-medium"
            data-testid="link-login"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
