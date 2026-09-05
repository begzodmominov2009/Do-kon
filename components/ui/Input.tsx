import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`h-11 w-full rounded-input border border-border bg-surface px-3 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent ${className}`}
      {...props}
    />
  );
}
