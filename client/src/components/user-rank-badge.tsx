export const rankConfig: Record<
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
  // Lifetime rank
  Lifetime: {
    label: "Lifetime",
    color: "#F59E0B",
    badgeUrl: null,
    formatted: true,
    isGradient: true,
    gradient: "linear-gradient(to right, #FFBF00, #00BFFF)",
  },
  // Leadership ranks
  Company_Director: {
    label: "Company Director",
    color: "#4B7DF7",
    badgeUrl: null,
    formatted: true,
  },
  Operations_Manager: {
    label: "Operations Manager",
    color: "#EF4444",
    badgeUrl: null,
    formatted: true,
  },
  // Team ranks
  Team_Member: {
    label: "Team Member",
    color: "#4B7DF7",
    badgeUrl: null,
    formatted: true,
  },
  // Staff ranks
  Staff_Internal_Affairs: {
    label: "Staff Internal Affairs",
    color: "#6B7280",
    badgeUrl: null,
    formatted: true,
  },
  Staff_Department_Director: {
    label: "Staff Department Director",
    color: "#A855F7",
    badgeUrl: null,
    formatted: true,
  },
  Appeals_Moderator: {
    label: "Appeals Moderator",
    color: "#06B6D4",
    badgeUrl: null,
    formatted: true,
  },
  Senior_Administrator: {
    label: "Senior Administrator",
    color: "#EF4444",
    badgeUrl: null,
    formatted: true,
  },
  Administrator: {
    label: "Administrator",
    color: "#EF4444",
    badgeUrl: null,
    formatted: true,
  },
  trial_moderator: {
    label: "Trial Moderator",
    color: "#0D9488",
    badgeUrl: null,
    formatted: true,
  },
  Moderator: {
    label: "Moderator",
    color: "#0D9488",
    badgeUrl: null,
    formatted: true,
  },
  Developer: {
    label: "Developer",
    color: "#6B7280",
    badgeUrl: null,
    formatted: true,
  },

  // VIP ranks
  Bronze_VIP: {
    label: "Bronze VIP",
    color: "#CD7F32",
    badgeUrl: null,
    formatted: true,
    isGradient: true,
    gradient: "linear-gradient(to right, #CD7F32, #A0522D)",
  },
  Diamond_VIP: {
    label: "Diamond VIP",
    color: "#B9F2FF",
    badgeUrl: null,
    formatted: true,
    isGradient: true,
    gradient: "linear-gradient(to right, #B9F2FF, #00BFFF)",
  },
  Founders_Edition_VIP: {
    label: "Founders Edition VIP",
    color: "#FFBF00",
    badgeUrl: null,
    formatted: true,
    isGradient: true,
    gradient: "linear-gradient(to right, #FFBF00, #FFD700, #00BFFF)",
  },
  // Member types & statuses
  Trusted_Member: {
    label: "Trusted Member",
    color: "#10B981",
    badgeUrl: null,
    formatted: true,
  },
  Active_Members: {
    label: "Active Members",
    color: "#3B82F6",
    badgeUrl: null,
    formatted: true,
  },
  Community_Partner: {
    label: "Community Partner",
    color: "#8B5CF6",
    badgeUrl: null,
    formatted: true,
  },
  Banned: {
    label: "Banned",
    color: "#EF4444",
    badgeUrl: null,
    formatted: true,
  },
  // Sub-groups
  Customer_Relations: {
    label: "Customer Relations",
    color: "#6B7280",
    badgeUrl: null,
    formatted: true,
  },
};

interface UserRankBadgeProps {
  rank?: string;
  username?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function UserRankBadge({
  rank = "Active Members",
  username,
  className = "",
  size = "md",
}: UserRankBadgeProps) {
  if (!rank || rank === "Active Members") return null;

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

export function FormattedUsername({
  rank = "Active Members",
  username = "User",
  className = "",
}: UserRankBadgeProps) {
  const config = rankConfig[rank as keyof typeof rankConfig];

  // If rank is not formatted or no username, return plain
  if (!config?.formatted || !username) {
    return <span className={className}>{username}</span>;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
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
        className="font-bold uppercase"
        style={{
          color: config.isGradient ? "transparent" : config.color,
          backgroundImage: config.isGradient ? config.gradient : "none",
          WebkitBackgroundClip: config.isGradient ? "text" : "border-box",
          backgroundClip: config.isGradient ? "text" : "border-box",
        }}
      >
        {username}
      </span>
    </div>
  );
}
