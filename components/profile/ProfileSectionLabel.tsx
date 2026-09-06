import type { ReactNode } from "react";

export function ProfileSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
      {children}
    </p>
  );
}
