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
  staff_department_director: {
    label: "STAFF DEPARTMENT DIRECTOR™",
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
  community_administrator: {
    label: "Administrator",
    color: "#FD1D1D",
    badgeUrl: null,
    formatted: true,
  },
  community_senior_administrator: {
    label: "Senior Administrator",
    color: "#FD1D1D",
    badgeUrl: null,
    formatted: true,
  },
  community_moderator: {
    label: "Community Moderator",
    color: "#B0C4DE",
    badgeUrl: null,
    formatted: true,
  },
  community_senior_moderator: {
    label: "Community Senior Moderator",
    color: "#B0C4DE",
    badgeUrl: null,
    formatted: true,
  },
  community_developer: {
    label: "Community Developer",
    color: "#FD1D1D",
    badgeUrl: null,
    formatted: true,
  },
  // VIP ranks (corresponding VIP badge)
  bronze_vip: {
    label: "Bronze VIP®",
    color: "(90deg, fcff9e 50%, c67700 100%)",
    badgeUrl: "https://i.imgur.com/tyuR9Az.png",
    formatted: true,
  },
  diamond_vip: {
    label: "Diamond VIP®",
    color: "(90deg, #EEAECA 0%, #94BBE9 100%)",
    badgeUrl: "https://i.imgur.com/bfmw4KN_d.png",
    formatted: true,
  },
  founders_edition_vip: {
    label: "Founders Edition VIP®",
    color: "(90deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)",
    badgeUrl: "https://i.imgur.com/eeGvuLF.png",
    formatted: true,
  },
  founders_edition_lifetime: {
    label: "Founders Edition Lifetime®",
    color: "(90deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)",
    badgeUrl: "https://i.imgur.com/eeGvuLF.png",
    formatted: true,
  },
  // Sub-groups
  customer_relations: {
    label: "Customer Relations",
    color: "#EE204D",
    badgeUrl: null,
    formatted: true,
  },
  rs_volunteer_staff: {
    label: "RS™ Volunteer Staff",
    color: "#A3C1AD",
    badgeUrl: null,
    formatted: true,
  },
  rs_trust_safety_team: {
    label: "RS Trust & Safety Team",
    color: "#FFFF0000",
    badgeUrl: null,
    formatted: true,
  },
  staff_internal_affairs: {
    label: "Staff Internal Affairs",
    color: "#833AB4",
    badgeUrl: null,
    formatted: true,
  },
  appeals_moderator: {
    label: "Appeals Moderator",
    color: "#FCB045",
    badgeUrl: null,
    formatted: true,
  },
  community_partner: {
    label: "Community Partner",
    color: "#B0C4DE",
    badgeUrl: null,
    formatted: true,
  },
  trusted_member: {
    label: "Trusted Member",
    color: "FCB045",
    badgeUrl: null,
    formatted: true,
  },
  active_member: {
    label: "Active Member",
    color: "#B0C4DE",
    badgeUrl: null,
    formatted: true,
  },
  member: {
    label: "Member",
    color: "#B0C4DE",
    badgeUrl: null,
    formatted: true,
  },
  banned: {
    label: "Banned",
    color: "#B0C4DE",
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
