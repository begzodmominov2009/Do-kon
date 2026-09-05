import { Skeleton } from "@/components/ui/Skeleton";

export function ColorPickerSkeleton() {
  return (
    <div>
      <Skeleton className="mb-2 h-4 w-16" />
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-11 w-11 rounded-full" />
        ))}
      </div>
    </div>
  );
}
