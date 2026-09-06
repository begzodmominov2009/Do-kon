import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export function ProfileSkeleton() {
  return (
    <Container className="flex flex-col gap-7 py-4 pb-8">
      <Skeleton className="h-7 w-24" />

      <div className="flex items-center gap-4 rounded-[18px] bg-surface p-[18px]">
        <Skeleton className="h-[58px] w-[58px] shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-2 rounded-card bg-surface px-2 py-4"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>

      <div>
        <Skeleton className="mb-2 h-3 w-24" />
        <div className="divide-y divide-border rounded-card border border-border bg-surface">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Skeleton className="mb-2 h-3 w-32" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="rounded-card border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-20 rounded-chip" />
              </div>
              <Skeleton className="mt-3 h-3 w-24" />
              <div className="mt-3 flex gap-2">
                <Skeleton className="h-10 w-10 rounded-input" />
                <Skeleton className="h-10 w-10 rounded-input" />
              </div>
              <Skeleton className="mt-3 h-5 w-28" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <Skeleton className="mb-2 h-3 w-20" />
        <div className="divide-y divide-border rounded-card border border-border bg-surface">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
