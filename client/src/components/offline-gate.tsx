import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { HardHat } from "lucide-react";
import ReactMarkdown from 'react-markdown';


// Ranks that are allowed to bypass offline mode and access the site even
// when the studio is closed to the public. Keep this list in sync with the
// staff ranks that should always be able to log in.
const STAFF_BYPASS_RANKS = [
  "Company Director",
  "Operations Manager",
  "Staff Department Director",
  "Gameplay Engineer",
  "Creative Designer",
  "Staff Internal Affairs",
  "Team Member",
];

// Routes that should always render — even when offline mode is on and even
// when the user is not logged in. This lets staff log in (or reset their
// password) and then have their rank checked by canBypassOffline below.
const ALWAYS_PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/magic-link",
];

function canBypassOffline(user: any): boolean {
  if (!user) return false;
  if (user.isAdmin) return true;
  if (user.email?.toLowerCase().endsWith("@resyncstudios.com")) return true;
  if (user.email?.toLowerCase().endsWith("@rivetstudiosus.com")) return true;
  if (STAFF_BYPASS_RANKS.includes(user.userRank || "")) return true;
  if ((user.additionalRanks || []).some((r: string) => STAFF_BYPASS_RANKS.includes(r))) return true;
  return false;
}

export function OfflineGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [location] = useLocation();

  const { data: siteStatus } = useQuery<{ isOffline: boolean; offlineMessage: string | null; offlineTitle: string | null }>({
    queryKey: ["/api/site-status"],
    refetchInterval: 30000,
  });

  const isAlwaysPublic = ALWAYS_PUBLIC_PATHS.some(
    (p) => location === p || location.startsWith(p + "/") || location.startsWith(p + "?"),
  );

  if (siteStatus?.isOffline && !canBypassOffline(user) && !isAlwaysPublic) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6" data-testid="offline-page">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto">
            <HardHat className="w-10 h-10 text-yellow/20" />
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            {siteStatus?.offlineTitle || "We’re making things more awesome!"}
          </h1>
            <div className="text-white/50 text-base leading-relaxed prose prose-invert mx-auto">
              <ReactMarkdown>
                {siteStatus.offlineMessage || "RIVET Studios is currently offline for some quick upgrades. We’re polishing the gears and tightening the bolts to make sure everything runs perfectly."}
              </ReactMarkdown>
              <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-white/20">
                RIVET Studios™ — We'll be back soon
                </p>
              </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
