import type { InputHTMLAttributes } from "react";
import { Search } from "lucide-react";

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function SearchInput({ className = "", ...props }: SearchInputProps) {
  return (
    <div
      className={`flex h-11 items-center gap-2.5 rounded-input bg-surface-2 px-3 ${className}`}
    >
      <Search
        width={20}
        height={20}
        aria-hidden="true"
        className="block h-5 w-5 shrink-0 text-text-muted"
      />
      <input
        type="search"
        className="h-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-sm leading-none text-text outline-none placeholder:text-text-muted"
        {...props}
      />
    </div>
  );
}
