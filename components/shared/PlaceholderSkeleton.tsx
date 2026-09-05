import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/Skeleton";
import { SkeletonGrid } from "./SkeletonGrid";

export function PlaceholderSkeleton() {
  return (
    <Container className="py-6">
      <Skeleton className="h-8 w-40" />
      <SkeletonGrid />
    </Container>
  );
}
