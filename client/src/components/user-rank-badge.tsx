export const rankConfig = {
  // Leadership ranks (Verified badge - capitalized blue, formatted username)
  company_director: {
    label: "COMPANY DIRECTOR",
    color: "#4B7DF7", // Capitalized blue
    badgeUrl: "https://i.imgur.com/Rqbqq9B.png",
    formatted: true,
  },
  leadership_council: {
    label: "LEADERSHIP COUNCIL",
    color: "#4B7DF7",
    badgeUrl: "https://i.imgur.com/Rqbqq9B.png",
    formatted: true,
  },
  operations_manager: {
    label: "OPERATIONS MANAGER",
    color: "#4B7DF7",
    badgeUrl: "https://i.imgur.com/Rqbqq9B.png",
    formatted: true,
  },
  rs_trust_safety_director: {
    label: "RS TRUST & SAFETY DIRECTOR™",
    color: "#4B7DF7",
    badgeUrl: "https://i.imgur.com/Rqbqq9B.png",
    formatted: true,
  },
  // Team rank (Team badge - capitalized blue, formatted username)
  team_member: {
    label: "TEAM MEMBER",
    color: "#4B7DF7",
    badgeUrl: "https://i.imgur.com/rTNSCQt.png",
    formatted: true,
  },
  // Staff ranks (no badge)
  administrator: {
    label: "Administrator",
    color: "#6B7280",
    badgeUrl: null,
    formatted: true,
  },
  senior_administrator: {
    label: "Senior Administrator",
    color: "#6B7280",
    badgeUrl: null,
    formatted: true,
  },
  moderator: {
    label: "Moderator",
    color: "#6B7280",
    badgeUrl: null,
    formatted: true,
  },
  community_moderator: {
    label: "Community Moderator",
    color: "#6B7280",
    badgeUrl: null,
    formatted: true,
  },
  community_senior_moderator: {
    label: "Community Senior Moderator",
    color: "#6B7280",
    badgeUrl: null,
    formatted: true,
  },
  community_developer: {
    label: "Community Developer",
    color: "#6B7280",
    badgeUrl: null,
    formatted: true,
  },
  // VIP ranks (no badge)
  bronze_vip: {
    label: "Bronze VIP",
    color: "#6B7280",
    badgeUrl: null,
    formatted: true,
  },
  sapphire_vip: {
    label: "Sapphire VIP",
    color: "#6B7280",
    badgeUrl: null,
    formatted: true,
  },
  diamond_vip: {
    label: "Diamond VIP",
    color: "#6B7280",
    badgeUrl: null,
    formatted: true,
  },
  founders_edition_vip: {
    label: "Founders Edition VIP",
    color: "#6B7280",
    badgeUrl: null,
    formatted: true,
  },
  // Sub-groups
  customer_relations: {
    label: "Customer Relations",
    color: "#6B7280",
    badgeUrl: null,
    formatted: false,
  },
  rs_volunteer_staff: {
    label: "RS™ Volunteer Staff",
    color: "#6B7280",
    badgeUrl: null,
    formatted: true,
  },
  member: {
    label: "Member",
    color: "#6B7280",
    badgeUrl: null,
    formatted: false,
  },
};

interface UserRankBadgeProps {
  rank?: string;
  username?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function UserRankBadge({
  rank = "member",
  username,
  className = "",
  size = "md",
}: UserRankBadgeProps) {
  if (!rank || rank === "member") return null;

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
      <span className="font-bold" style={{ color: config.color }}>
        {config.label}
      </span>
    </strong>
  );
}

export function FormattedUsername({
  rank = "member",
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
      <span className="font-bold uppercase" style={{ color: config.color }}>
        {username}
      </span>
    </div>
  );
}
