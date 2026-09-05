import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
      {children}
    </p>
  );
}
