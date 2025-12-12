import { Badge } from "@/components/ui/badge";
import { Crown, Gem, Diamond, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type VipTier = "none" | "bronze" | "sapphire" | "diamond" | "founders";

interface VipBadgeProps {
  tier: VipTier;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const tierConfig = {
  none: { label: "Free", icon: null, className: "" },
  bronze: {
    label: "Bronze VIP",
    icon: Crown,
    className: "vip-bronze border-0",
  },
  sapphire: {
    label: "Sapphire VIP",
    icon: Gem,
    className: "vip-sapphire border-0",
  },
  diamond: {
    label: "Diamond VIP",
    icon: Diamond,
    className: "vip-diamond border-0",
  },
  founders: {
    label: "Founders",
    icon: Star,
    className: "vip-founders border-0",
  },
};

const sizeConfig = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-0.5",
  lg: "text-base px-3 py-1",
};

const iconSizeConfig = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

export function VipBadge({
  tier,
  size = "md",
  showLabel = true,
}: VipBadgeProps) {
  if (tier === "none") return null;

  const config = tierConfig[tier];
  const Icon = config.icon;

  return (
    <Badge
      className={cn(
        sizeConfig[size],
        config.className,
        "font-semibold gap-1 inline-flex items-center",
      )}
      data-testid={`badge-vip-${tier}`}
    >
      {Icon && <Icon className={iconSizeConfig[size]} />}
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );
}
