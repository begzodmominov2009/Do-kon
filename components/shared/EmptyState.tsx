import type { ReactNode } from "react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

export function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  ctaHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-text">{title}</p>
        <p className="mt-1 text-sm text-text-muted">{description}</p>
      </div>
      <Link href={ctaHref} className={buttonClasses()}>
        {ctaLabel}
      </Link>
    </div>
  );
}
