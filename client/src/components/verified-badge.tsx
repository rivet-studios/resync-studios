import verifiedCheckmark from "@assets/IMG_0376_1775969589018.png";

interface VerifiedBadgeProps {
  isVerified?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export function VerifiedBadge({ isVerified, size = "md", className = "" }: VerifiedBadgeProps) {
  if (!isVerified) return null;

  return (
    <img
      src={verifiedCheckmark}
      alt="Verified"
      title="Verified"
      className={`inline-block shrink-0 ${sizeMap[size]} ${className}`}
      data-testid="badge-verified"
    />
  );
}
