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
            <Skeleton className="h-7 w-24 rounded-[9px]" />
            <Skeleton className="h-7 w-28 rounded-[9px]" />
          </div>
          <Skeleton className="h-7 w-3/4" />
          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-56 rounded-[10px]" />
          </div>
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
