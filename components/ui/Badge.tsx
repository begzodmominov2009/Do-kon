import type { ReactNode } from "react";

type BadgeVariant = "danger" | "success" | "accent" | "neutral";

type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
};

const variantClasses: Record<BadgeVariant, string> = {
  danger: "bg-danger text-white",
  success: "bg-success text-white",
  accent: "bg-accent-soft text-accent",
  neutral: "bg-surface-2 text-text-muted",
};

export function Badge({
  variant = "neutral",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-chip px-2 py-0.5 text-xs font-semibold ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
