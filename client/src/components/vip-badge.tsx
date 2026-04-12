import { cn } from "@/lib/utils";

const VIP_BADGE_IMAGE_URL = "https://replit.com/cdn-cgi/image/quality=80,metadata=copyright,format=auto/https://d3mh6akavj90a9.cloudfront.net/groups/01KBHCHB6WEB3HC7Z0Z66NWPHA.png";

type VipTier = "none" | "bronze" | "sapphire" | "diamond" | "founders";
// sapphire is deprecated

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
      src={VIP_BADGE_IMAGE_URL}
      alt="VIP"
      className={cn(sizeConfig[size], "w-auto inline-block")}
      loading="lazy"
      decoding="async"
      data-testid={`badge-vip-${tier}`}
    />
  );
}
