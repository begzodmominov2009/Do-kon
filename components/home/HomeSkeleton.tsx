import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductRail } from "@/components/shared/ProductRail";

export function HomeSkeleton() {
  return (
    <Container className="flex flex-col gap-7 py-4">
      <Skeleton className="h-[140px] w-full rounded-card" />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex w-16 shrink-0 flex-col items-center gap-1.5">
              <Skeleton className="h-14 w-14 rounded-full" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-5 w-40" />
        </div>
        <ProductRail products={[]} loading />
      </div>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-[60px] w-full rounded-card" />
        <ProductRail products={[]} loading />
      </div>
    </Container>
  );
}
