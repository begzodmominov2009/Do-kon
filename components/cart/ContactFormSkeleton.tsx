import { Skeleton } from "@/components/ui/Skeleton";

export function ContactFormSkeleton() {
  return (
    <div className="divide-y divide-border rounded-card border border-border bg-surface">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      ))}
    </div>
  );
}
