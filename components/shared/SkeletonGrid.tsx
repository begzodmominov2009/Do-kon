import { Skeleton } from "@/components/ui/Skeleton";

export function SkeletonGrid() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-32 w-full" />
      ))}
    </div>
  );
}
