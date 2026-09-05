import { Skeleton } from "@/components/ui/Skeleton";

type ProductCardSkeletonProps = {
  variant?: "grid" | "rail";
};

export function ProductCardSkeleton({
  variant = "grid",
}: ProductCardSkeletonProps) {
  return (
    <div className={variant === "rail" ? "w-40 shrink-0" : "w-full"}>
      <Skeleton className="aspect-square w-full rounded-card" />
      <div className="mt-2 flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
