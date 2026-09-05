import { Skeleton } from "@/components/ui/Skeleton";

type DeliveryMethodSkeletonProps = {
  showPrice?: boolean;
};

export function DeliveryMethodSkeleton({
  showPrice = true,
}: DeliveryMethodSkeletonProps) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-4">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
      </div>
      {showPrice ? (
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-4 w-14" />
        </div>
      ) : null}
      <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
    </div>
  );
}
