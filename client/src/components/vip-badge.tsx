import { cn } from "@/lib/utils";


type VipTier = "none" | "bronze" | "sapphire" | "diamond" | "founders";

interface VipBadgeProps {
  tier: VipTier;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const sizeConfig = {
  sm: "h-4",
  md: "h-5",
  lg: "h-6",
};

export function VipBadge({
  tier,
  size = "md",
}: VipBadgeProps) {
  if (tier === "none") return null;

  return (
    <img
      src="/vip.png"
      alt="VIP"
      className={cn(sizeConfig[size], "w-auto inline-block")}
      loading="lazy"
      decoding="async"
      data-testid={`badge-vip-${tier}`}
    />
  );
}
