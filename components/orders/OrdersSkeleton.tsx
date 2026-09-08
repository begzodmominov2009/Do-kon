import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export function OrdersSkeleton() {
  return (
    <div>
      <div className="sticky top-0 z-20 border-b border-border bg-bg">
        <Container className="flex items-center gap-3 py-3.5">
          <Skeleton className="h-11 w-11 rounded-full" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-4 w-6" />
        </Container>
      </div>

      <Container className="flex flex-col gap-4 py-4">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-chip" />
          <Skeleton className="h-9 w-16 rounded-chip" />
          <Skeleton className="h-9 w-28 rounded-chip" />
          <Skeleton className="h-9 w-32 rounded-chip" />
        </div>

        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
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
              <div className="mt-3 flex items-center justify-between">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-9 w-24 rounded-[12px]" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
