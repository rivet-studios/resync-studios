import { VerifiedBadge } from "./verified-badge";

const rankEntries: Record<
  string,
  {
    label: string;
    color: string;
    badgeUrl: string | null;
    formatted: boolean;
    isGradient?: boolean;
    gradient?: string;
  }
> = {
  Lifetime: {
    label: "Lifetime",
    color: "#181860",
    badgeUrl: null,
    formatted: true,
    isGradient: true,
    gradient: "linear-gradient(135deg, #FDD819 10%, #E80505 100%)",
  },
  "Company Director": {
    label: "Company Director",
    color: "#4B7DF7", 
    badgeUrl: null,
    formatted: true,
  },
  "Operations Manager": {
    label: "Operations Manager",
    color: "#901818",
    badgeUrl: null,
    formatted: true,
  },
  "Team Member": {
    label: "Team Member",
    color: "#778899",
    badgeUrl: null,
    formatted: true,
  },
  "Staff Department Director": {
    label: "Staff Department Director",
    color: "#DC143C",
    badgeUrl: null,
    formatted: true,
  },
  "Appeals Moderator": {
    label: "Appeals Moderator",
    color: "#a2b9f1",
    badgeUrl: null,
    formatted: true,
  },
  "Community Senior Administrator": {
    label: "Community Senior Administrator",
    color: "#CD5C5C",
    badgeUrl: null,
    formatted: true,
  },
  "Community Administrator": {
    label: "Community Administrator",
    color: "#781818",
    badgeUrl: null,
    formatted: true,
  },
  "Community Moderator": {
    label: "Community Moderator",
    color: "#AFFFCF", // 304848 , 304860
    badgeUrl: null,
    formatted: true,
  },
  "Gameplay Engineer": {
    label: "Gameplay Engineer",
    color: "#2bff00",
    badgeUrl: null,
    formatted: true,
  },
  "Community Developer": {
    label: "Community Developer",
    color: "#FF4500",
    badgeUrl: null,
    formatted: true,
  },
  "Customer Relations": {
    label: "Customer Relations",
    color: "#604830",
    badgeUrl: null,
    formatted: true,
  },
  "Bronze VIP": {
    label: "Bronze VIP",
    color: "#CD7F32",
    badgeUrl: null,
    formatted: true,
    isGradient: true,
    gradient: "linear-gradient(to right, #CD7F32, #A0522D)",
  },
  "Diamond VIP": {
    label: "Diamond VIP",
    color: "#B9F2FF",
    badgeUrl: null,
    formatted: true,
    isGradient: true,
    gradient: "linear-gradient(to right, #B9F2FF, #00BFFF)",
  },
  "Founders Edition VIP": {
    label: "Founders Edition VIP",
    color: "#C04860",
    badgeUrl: null,
    formatted: true,
    isGradient: true,
    gradient: "linear-gradient(to right, #FFBF00, #FFD700, #00BFFF)",
  },
  "Trusted Member": {
    label: "Trusted Member",
    color: "#FF69B4",
    badgeUrl: null,
    formatted: true,
  },
  "Active Member": {
    label: "Active Member",
    color: "#778899",
    badgeUrl: null,
    formatted: true,
  },
  Members: {
    label: "Members",
    color: "#778899",
    badgeUrl: null,
    formatted: true,
  },
  "Community Partner": {
    label: "Community Partner",
    color: "#8B5CF6",
    badgeUrl: null,
    formatted: true,
  },
  "Vehicle Tester": {
    label: "Vehicle Tester",
    color: "#F97316",
    badgeUrl: null,
    formatted: true,
  },
  Banned: {
    label: "Banned",
    color: "#2F4F4F",
    badgeUrl: null,
    formatted: true,
  },
};

function buildRankConfig(entries: typeof rankEntries) {
  const config: typeof rankEntries = { ...entries };
  for (const [key, value] of Object.entries(entries)) {
    const underscoreKey = key.replace(/\s+/g, "_");
    if (underscoreKey !== key) config[underscoreKey] = value;
  }
  return config;
}

export const rankConfig = buildRankConfig(rankEntries);

interface UserRankBadgeProps {
  rank?: string;
  username?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function UserRankBadge({
  rank = "Members",
  username,
  className = "",
  size = "md",
}: UserRankBadgeProps) {
  if (!rank || rank === "Members") return null;

  const config = rankConfig[rank as keyof typeof rankConfig];
  if (!config) return null;

  const sizeClass =
    size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";

  return (
    <strong
      className={`group-prefix inline-flex items-center gap-1.5 ${sizeClass} ${className}`}
    >
      {config.badgeUrl && (
        <img
          src={config.badgeUrl}
          alt={config.label}
          width="16"
          height="16"
          loading="lazy"
          decoding="async"
          className="w-4 h-4"
        />
      )}
      <span
        className="font-bold"
        style={{
          color: config.isGradient ? "transparent" : config.color,
          backgroundImage: config.isGradient ? config.gradient : "none",
          WebkitBackgroundClip: config.isGradient ? "text" : "border-box",
          backgroundClip: config.isGradient ? "text" : "border-box",
        }}
      >
        {config.label}
      </span>
    </strong>
  );
}

export function getVipGradientClass(vipTier?: string | null): string | null {
  if (vipTier === "Lifetime") return "lifetime-gradient";
  if (vipTier === "Founders Edition VIP") return "holographic-gradient";
  if (vipTier === "Diamond VIP") return "diamond-gradient";
  if (vipTier === "Bronze VIP") return "bronze-gradient";
  return null;
}

export function getUsernameColor(
  vipTier?: string | null,
  primaryRank?: string | null,
  additionalRanks?: string[] | null,
): { className?: string; color?: string; gradient?: string } {
  // 1. Lifetime always wins, regardless of where it lives.
  const hasLifetime =
    vipTier === "Lifetime" ||
    primaryRank === "Lifetime" ||
    (additionalRanks || []).includes("Lifetime");
  if (hasLifetime) {
    const lifetimeGradient = rankConfig["Lifetime"]?.gradient;
    if (lifetimeGradient) return { gradient: lifetimeGradient };
    return { className: "lifetime-gradient" };
  }

  // 2. Other VIP tiers override the main rank.
  const gradientClass = getVipGradientClass(vipTier);
  if (gradientClass) return { className: gradientClass };

  // 3. Otherwise the main rank determines the color.
  const primaryConfig = primaryRank
    ? rankConfig[primaryRank as keyof typeof rankConfig]
    : null;
  if (primaryConfig && primaryRank !== "Members") {
    if (primaryConfig.isGradient && primaryConfig.gradient) {
      return { gradient: primaryConfig.gradient };
    }
    if (primaryConfig.color) return { color: primaryConfig.color };
  }

  // 4. Fall back to the first colored additional rank.
  if (additionalRanks) {
    for (const rank of additionalRanks) {
      const config = rankConfig[rank as keyof typeof rankConfig];
      if (config?.isGradient && config.gradient) {
        return { gradient: config.gradient };
      }
      if (config?.color) return { color: config.color };
    }
  }

  return {};
}

export function FormattedUsername({
  rank = "Members",
  username = "User",
  className = "",
  vipTier,
  additionalRanks,
  isVerified,
}: UserRankBadgeProps & {
  vipTier?: string | null;
  additionalRanks?: string[] | null;
  isVerified?: boolean;
}) {
  const styling = getUsernameColor(vipTier, rank, additionalRanks);

  if (!username) {
    return <span className={className}>{username}</span>;
  }

  const config = rankConfig[rank as keyof typeof rankConfig];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {config?.badgeUrl && (
        <img
          src={config.badgeUrl}
          alt={config.label}
          width="16"
          height="16"
          loading="lazy"
          decoding="async"
          className="w-4 h-4"
        />
      )}
      <span
        className={`font-bold uppercase ${styling.className || ""}`}
        style={
          styling.gradient
            ? {
                color: "transparent",
                backgroundImage: styling.gradient,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
              }
            : styling.color
              ? { color: styling.color }
              : undefined
        }
      >
        {username}
      </span>
      {isVerified && <VerifiedBadge isVerified size="md" />}
    </div>
  );
}

