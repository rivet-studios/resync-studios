import { Shield, Zap, Crown, Users, Heart, Star } from "lucide-react";

export const rankConfig = {
  moderator: {
    label: "MODERATOR",
    color: "#3B82F6", // Blue
    icon: Shield,
    formatted: true,
  },
  administrator: {
    label: "ADMINISTRATOR",
    color: "#EF4444", // Red
    icon: Crown,
    formatted: true,
  },
  team_member: {
    label: "TEAM MEMBER",
    color: "#06B6D4", // Cyan
    icon: Users,
    formatted: true,
  },
  supporter: {
    label: "SUPPORTER",
    color: "#EC4899", // Pink
    icon: Heart,
    formatted: true,
  },
  contributor: {
    label: "CONTRIBUTOR",
    color: "#F59E0B", // Amber
    icon: Star,
    formatted: true,
  },
  member: {
    label: "MEMBER",
    color: "#6B7280", // Gray
    icon: Zap,
    formatted: false,
  },
};

interface UserRankBadgeProps {
  rank?: string;
  username?: string;
  className?: string;
}

export function UserRankBadge({ rank = 'member', username, className }: UserRankBadgeProps) {
  if (!rank || rank === 'member') return null;
  
  const config = rankConfig[rank as keyof typeof rankConfig];
  if (!config) return null;

  const IconComponent = config.icon;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <IconComponent className="w-4 h-4" style={{ color: config.color }} />
      <span 
        className="font-bold text-sm uppercase tracking-wide"
        style={{ color: config.color }}
      >
        {config.label}
      </span>
    </div>
  );
}

export function FormattedUsername({ 
  rank = 'member', 
  username = 'User',
  className = ''
}: UserRankBadgeProps) {
  const config = rankConfig[rank as keyof typeof rankConfig];
  
  if (!config?.formatted || !username) {
    return <span className={className}>{username}</span>;
  }

  const IconComponent = config.icon;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <IconComponent className="w-4 h-4" style={{ color: config.color }} />
      <span 
        className="font-bold uppercase tracking-wide"
        style={{ color: config.color }}
      >
        {username}
      </span>
    </div>
  );
}
