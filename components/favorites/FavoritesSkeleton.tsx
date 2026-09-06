import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductCardSkeleton } from "@/components/shared/ProductCardSkeleton";

export function FavoritesSkeleton() {
  return (
    <Container className="py-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-5 w-20" />
      </div>

      <div className="mt-4 flex gap-2">
        <Skeleton className="h-9 w-28 rounded-chip" />
        <Skeleton className="h-9 w-20 rounded-chip" />
        <Skeleton className="h-9 w-20 rounded-chip" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </Container>
  );
}
