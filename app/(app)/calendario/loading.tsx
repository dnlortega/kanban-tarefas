import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-3 overflow-hidden p-4 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-6 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-44 rounded-lg" />
          <Skeleton className="size-7 rounded-lg" />
          <Skeleton className="h-7 w-14 rounded-lg" />
          <Skeleton className="size-7 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border">
        {Array.from({ length: 42 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-none" />
        ))}
      </div>
    </div>
  );
}
