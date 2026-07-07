import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4 sm:p-6 lg:grid lg:grid-cols-[1fr_280px]">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 rounded-lg" />
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
