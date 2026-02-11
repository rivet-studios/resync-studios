import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-3xl font-bold">RS</CardTitle>
          <p className="text-sm text-muted-foreground">
            Log in to your account
          </p>
          <p className="text-xs text-muted-foreground">
            Enter your email and password below to log in
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 flex gap-2">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Email & Password Login Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email address</label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={emailLoginMutation.isPending}
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Password</label>
                <a href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={emailLoginMutation.isPending}
                data-testid="input-password"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-border"
                data-testid="checkbox-remember"
              />
              <label
                htmlFor="remember"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={emailLoginMutation.isPending}
              data-testid="button-login-email"
            >
              {emailLoginMutation.isPending ? "Logging in..." : "Log in"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-card text-muted-foreground">
                Or login with
              </span>
            </div>
          </div>

          {/* Discord Sign In */}
          <Button
            asChild
            variant="outline"
            className="w-full gap-2"
            data-testid="button-login-discord"
          >
            <a href="/api/login">
              <SiDiscord className="w-5 h-5" />
              Login with Discord
            </a>
          </Button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
