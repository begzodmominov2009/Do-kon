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
      className="group relative flex h-11 w-14 shrink-0 items-center justify-center"
    >
      <span
        className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
          checked ? "bg-accent" : "border border-border bg-surface-2"
        }`}
      >
        <span
          className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] group-active:scale-x-[1.18] ${
            checked ? "translate-x-[23px]" : "translate-x-[3px] dark:bg-text-muted"
          }`}
        />
      </span>
    </button>
  );
}
