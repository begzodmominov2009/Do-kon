import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({
  className = "",
  invalid = false,
  ...props
}: InputProps) {
  return (
    <input
      aria-invalid={invalid}
      className={`h-11 w-full appearance-none rounded-input border-0 bg-transparent px-3 text-sm text-text outline-none transition-colors duration-150 placeholder:text-text-muted ${
        invalid ? "bg-danger/8" : "focus:bg-surface-2"
      } ${className}`}
      {...props}
    />
  );
}
