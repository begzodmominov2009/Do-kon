import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductCardSkeleton } from "@/components/shared/ProductCardSkeleton";

export function FavoritesSkeleton() {
  return (
    <Container className="flex flex-col gap-5 py-4">
      <div className="flex items-baseline justify-between gap-3">
        <Skeleton className="h-7 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-16 rounded-[10px]" />
        </div>
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-9 w-28 rounded-chip" />
        <Skeleton className="h-9 w-16 rounded-chip" />
        <Skeleton className="h-9 w-20 rounded-chip" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </Container>
  );
}
