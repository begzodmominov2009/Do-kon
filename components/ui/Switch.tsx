"use client";

type SwitchProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
};

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`group box-border inline-flex h-7 w-12 shrink-0 items-center rounded-full p-[3px] transition-colors duration-200 ${
        checked ? "bg-accent" : "border border-border bg-surface-2"
      }`}
    >
      <span
        className={`h-[22px] w-[22px] rounded-full bg-white transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] group-active:scale-[1.182] ${
          checked ? "translate-x-[20px]" : "translate-x-0 dark:bg-[#C4C9D4]"
        }`}
      />
    </button>
  );
}
