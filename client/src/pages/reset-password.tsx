import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import logoSvg from "@assets/logo.svg";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const resetMutation = useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/reset-password", data);
      return response.json();
    },
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to reset password. The link may have expired.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    resetMutation.mutate({ token, password });
  };

  if (!token) {
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
              <h1 className="text-xl font-semibold text-[#09090B] dark:text-white" data-testid="heading-invalid-link">
                Invalid reset link
              </h1>
              <p className="text-sm text-[#71717A] dark:text-white/50">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              className="w-full bg-[#18181B] text-white rounded-lg font-medium text-sm shadow-sm"
              onClick={() => navigate("/forgot-password")}
              data-testid="button-request-new"
            >
              Request a new link
            </Button>
            <a href="/login" className="flex items-center justify-center gap-2 text-sm text-[#71717A] dark:text-white/50 hover:text-[#09090B] dark:hover:text-white transition-colors" data-testid="link-back-login">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </a>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-xl font-semibold text-[#09090B] dark:text-white" data-testid="heading-reset-password">
              {success ? "Password reset" : "Set a new password"}
            </h1>
            <p className="text-sm text-[#71717A] dark:text-white/50">
              {success
                ? "Your password has been successfully updated"
                : "Enter your new password below"}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-3 flex gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400" data-testid="text-error">{error}</p>
          </div>
        )}

        {success ? (
          <div className="space-y-6">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg p-4 flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium" data-testid="text-success">
                  Password updated successfully
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400/70 mt-1">
                  You can now log in with your new password.
                </p>
              </div>
            </div>

            <Button
              className="w-full bg-[#18181B] text-white rounded-lg font-medium text-sm shadow-sm"
              onClick={() => navigate("/login")}
              data-testid="button-go-to-login"
            >
              Go to login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#09090B] dark:text-white">New password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={resetMutation.isPending}
                  data-testid="input-password"
                  className="rounded-lg border-[#E4E4E7] dark:border-white/10 bg-white dark:bg-white/5 text-[#09090B] dark:text-white placeholder:text-[#A1A1AA] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-white transition-colors"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#09090B] dark:text-white">Confirm password</label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={resetMutation.isPending}
                data-testid="input-confirm-password"
                className="rounded-lg border-[#E4E4E7] dark:border-white/10 bg-white dark:bg-white/5 text-[#09090B] dark:text-white placeholder:text-[#A1A1AA]"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#18181B] text-white rounded-lg font-medium text-sm shadow-sm"
              disabled={resetMutation.isPending}
              data-testid="button-reset-password"
            >
              {resetMutation.isPending ? "Resetting..." : "Reset password"}
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
