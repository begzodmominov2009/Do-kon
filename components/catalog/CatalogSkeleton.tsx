import { Skeleton } from "@/components/ui/Skeleton";
import { Container } from "@/components/layout/Container";
import { ProductCardSkeleton } from "@/components/shared/ProductCardSkeleton";

export function CatalogSkeleton() {
  return (
    <div className="pb-6">
      <div className="sticky top-0 z-10 border-b border-border bg-bg/92 backdrop-blur-md">
        <Container className="flex flex-col gap-3 py-3">
          <Skeleton className="h-11 w-full rounded-input" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-chip" />
            <Skeleton className="h-9 w-24 rounded-chip" />
            <Skeleton className="h-9 w-20 rounded-chip" />
          </div>
        </Container>
      </div>
      <Container className="pt-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-2 h-4 w-24" />
        <div className="mt-4 grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </Container>
    </div>
  );
}
