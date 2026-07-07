import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-4 py-4 sm:px-6">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <div className="grid flex-1 grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
