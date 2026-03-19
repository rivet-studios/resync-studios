import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Calendar, ArrowRight } from "lucide-react";
import type { Ban } from "@shared/schema";

interface BanWallProps {
  children: React.ReactNode;
}

export function BanWall({ children }: BanWallProps) {
  const { user } = useAuth();
  const [pathname] = useLocation();

  const { data: bans = [] } = useQuery<Ban[]>({
    queryKey: ["/api/bans/my"],
    enabled: !!user,
    staleTime: 30000,
  });

  const activeBan = bans.find((b) => b.isActive);

  if (!user || !activeBan) {
    return <>{children}</>;
  }

  if (pathname === "/appeals" || pathname.startsWith("/appeals")) {
    return <>{children}</>;
  }

  return (
    <div
      className="min-h-screen bg-[#050505] flex items-center justify-center p-6"
      data-testid="ban-wall"
    >
      <div className="max-w-lg w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <div className="space-y-3">
          <h1
            className="text-3xl font-semibold text-white"
            data-testid="text-ban-title"
          >
            Account Suspended
          </h1>
          <p className="text-white/40 text-sm">
            Your account has been suspended from the Services.
          </p>
        </div>

        <div className="bg-card border border-white/5 rounded-xl p-6 space-y-4 text-left">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-white/30 uppercase tracking-wider font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              Ban Details
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-white/30">Reason</span>
                <p
                  className="text-sm text-white font-medium"
                  data-testid="text-ban-reason"
                >
                  {activeBan.reason}
                </p>
              </div>
              <div className="flex gap-6">
                <div>
                  <span className="text-xs text-white/30">Issued</span>
                  <p
                    className="text-sm text-white/60"
                    data-testid="text-ban-date"
                  >
                    {activeBan.createdAt
                      ? new Date(activeBan.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          },
                        )
                      : "Unknown"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-white/30">Duration</span>
                  <p
                    className="text-sm text-white/60"
                    data-testid="text-ban-duration"
                  >
                    {activeBan.isPermanent
                      ? "Permanent"
                      : activeBan.expiresAt
                        ? `Expires ${new Date(activeBan.expiresAt).toLocaleDateString()}`
                        : "Temporary"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link href="/appeals">
            <Button
              className="w-full bg-white text-black hover:bg-white/90"
              size="lg"
              data-testid="button-go-to-appeals"
            >
              Submit an Appeal <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <p className="text-xs text-white/20">
            If you believe this ban was issued in error, you may submit an
            appeal for review.
          </p>
        </div>
      </div>
    </div>
  );
}
