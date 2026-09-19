import type { ReactNode } from "react";

type BadgeVariant =
  | "danger"
  | "success"
  | "accent"
  | "neutral"
  | "danger-soft"
  | "success-soft"
  | "warning-soft";

type BadgeSize = "md" | "tag" | "discount";

type BadgeProps = {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

const variantClasses: Record<BadgeVariant, string> = {
  danger: "bg-danger text-white",
  success: "bg-success text-white",
  accent: "bg-accent-soft text-accent",
  neutral: "bg-surface-2 text-text-muted",
  "danger-soft": "bg-danger/12 text-danger",
  "success-soft": "bg-success/12 text-success",
  "warning-soft": "bg-warning/14 text-warning",
};

// "md" is the original, unchanged look every existing call site keeps using.
// "tag" / "discount" are additive sizes for the product page's tag row and
// price-block discount indicator — they don't affect any other Badge usage.
const sizeClasses: Record<BadgeSize, string> = {
  md: "rounded-chip px-2 py-0.5 text-xs font-semibold",
  tag: "h-7 gap-[5px] rounded-[9px] px-[11px] text-[12.5px] font-medium",
  discount: "rounded-[8px] px-[9px] py-1 text-[13px] font-semibold",
};

export function Badge({
  variant = "neutral",
  size = "md",
  icon,
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
