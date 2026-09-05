import { Skeleton } from "@/components/ui/Skeleton";
import { Container } from "@/components/layout/Container";

export function ProductDetailSkeleton() {
  return (
    <div>
      <Skeleton className="h-[62vh] w-full rounded-none" />
      <div className="relative z-10 -mt-7 rounded-t-[28px] bg-bg pb-28">
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border" />
        <Container className="flex flex-col gap-4 pt-3">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-chip" />
            <Skeleton className="h-6 w-28 rounded-chip" />
          </div>
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-16 w-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Container>
      </div>
    </div>
  );
}
