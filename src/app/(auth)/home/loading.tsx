import { Skeleton } from "@/components/ui/skeleton";
import { range } from "lodash";

export default function HomeLoading() {
  return (
    <div className="space-y-8 p-6 pb-16">
      <QuickActionsSkeleton />
    </div>
  );
}

export function QuickActionsSkeleton() {
  return (
    <>
      <Skeleton className="h-10 w-84" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-30" />
        <Skeleton className="h-10 w-50" />
      </div>
      <Skeleton className="h-[1em] w-20" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {range(6).map((i) => (
          <Skeleton key={i} className="h-44 w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-[1em] w-20" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {range(3).map((i) => (
          <Skeleton key={i} className="h-44 w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-[1em] w-20" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {range(2).map((i) => (
          <Skeleton key={i} className="h-44 w-full rounded-lg" />
        ))}
      </div>
    </>
  );
}
