import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { WifiOff } from "lucide-react";

const ADMIN_RANKS = [
  "Company Director",
  "Operations Manager",
  "Staff Department Director",
  "Developer",
  "Staff Internal Affairs",
  "Team Member",
];

function canBypassOffline(user: any): boolean {
  if (!user) return false;
  if (user.isAdmin) return true;
  if (user.email?.toLowerCase().endsWith("@resyncstudios.com")) return true;
  if (ADMIN_RANKS.includes(user.userRank || "")) return true;
  if ((user.additionalRanks || []).some((r: string) => ADMIN_RANKS.includes(r))) return true;
  return false;
}

export function OfflineGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const { data: siteStatus } = useQuery<{ isOffline: boolean; offlineMessage: string | null }>({
    queryKey: ["/api/site-status"],
    refetchInterval: 30000,
  });

  if (siteStatus?.isOffline && !canBypassOffline(user)) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6" data-testid="offline-page">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto">
            <WifiOff className="w-10 h-10 text-white/20" />
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Site Maintenance
          </h1>
          <p className="text-white/50 text-base leading-relaxed">
            {siteStatus.offlineMessage || "RIVET Studios is currently undergoing maintenance. We'll be back shortly."}
          </p>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs text-white/20">
              RIVET Studios™ — We'll be back soon
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
