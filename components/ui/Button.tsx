import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:brightness-[1.06] dark:hover:brightness-[1.08]",
  secondary:
    "bg-surface-2 text-text hover:brightness-[1.06] dark:hover:brightness-[1.08]",
  ghost: "bg-transparent text-text-muted hover:bg-surface-2",
  danger: "bg-danger text-white hover:brightness-[1.06] dark:hover:brightness-[1.08]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 rounded-[10px] px-3 text-[13px]",
  md: "h-11 rounded-[12px] px-4 text-[15px]",
  lg: "h-[52px] rounded-[14px] px-5 text-base",
};

type ButtonClassOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
}: ButtonClassOptions = {}) {
  return `inline-flex items-center justify-center gap-2 font-medium transition-[transform_120ms,background-color_150ms,filter_150ms] active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:brightness-100 disabled:active:scale-100 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading}
      className={`relative ${buttonClasses({ variant, size, fullWidth, className })}`}
      {...props}
    >
      <span className={loading ? "opacity-0" : "opacity-100"}>{children}</span>
      {loading ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
        </span>
      ) : null}
    </button>
  );
}
