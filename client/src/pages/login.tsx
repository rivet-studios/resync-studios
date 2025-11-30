import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Gamepad2, Mail, AlertCircle } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const emailLoginMutation = useMutation({
    mutationFn: async (emailAddr: string) => {
      const response = await apiRequest("POST", "/api/auth/email-login", { email: emailAddr });
      return response.json();
    },
    onSuccess: () => {
      setSuccessMessage("Check your email for a login link!");
      setError("");
      setEmail("");
    },
    onError: (err: any) => {
      setError(err.message || "Failed to send email. Please try again.");
    },
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email");
      return;
    }
    emailLoginMutation.mutate(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">RESYNC Studios</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 pt-20">
        <Card className="w-full max-w-md border border-border/50 shadow-xl">
          <CardHeader className="space-y-2 text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Log in to your account</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Choose your login method
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 flex gap-2">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3 flex gap-2">
                <Mail className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-500">{successMessage}</p>
              </div>
            )}

            {/* Discord Sign In */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">Discord</p>
              <Button 
                asChild
                size="lg"
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
                data-testid="button-login-discord"
              >
                <a href="/api/login" className="flex items-center justify-center gap-2">
                  <SiDiscord className="w-5 h-5" />
                  Login with Discord
                </a>
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-card text-muted-foreground">Or email</span>
              </div>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={emailLoginMutation.isPending}
                  data-testid="input-email"
                  className="bg-background border-border/50"
                />
              </div>
              <Button 
                type="submit"
                size="lg"
                variant="outline"
                className="w-full"
                disabled={emailLoginMutation.isPending}
                data-testid="button-email-link"
              >
                <Mail className="w-4 h-4 mr-2" />
                {emailLoginMutation.isPending ? "Sending..." : "Email me a login link"}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button 
                  onClick={() => navigate("/signup")}
                  className="text-primary hover:underline font-medium"
                  data-testid="link-signup"
                >
                  Sign up
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <div>© 2025 Resync Studios. All rights reserved.</div>
            <div className="flex gap-4">
              <a href="/terms" className="hover:text-foreground transition-colors" data-testid="link-terms">Terms</a>
              <a href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-privacy">Privacy</a>
              <a href="/community-rules" className="hover:text-foreground transition-colors" data-testid="link-rules">Rules</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
