import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BillingListSkeleton() {
  return (
    <div className="mt-8 animate-pulse space-y-4">
      {[1, 2, 3, 4, 5].map(i => (
        <Card className="border-none bg-card/50 shadow-sm" key={i}>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden gap-2 sm:flex">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-2 text-right">
                <Skeleton className="ml-auto h-7 w-24" />
                <Skeleton className="ml-auto h-3 w-16" />
              </div>
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function BillingLoading() {
  return (
    <div className="container mx-auto max-w-6xl animate-pulse space-y-8 px-4 py-8 md:px-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="space-y-2 p-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-4">
            <Skeleton className="h-10 w-[400px] rounded-lg" />
            <Skeleton className="h-10 w-[300px] rounded-lg" />
          </div>
        </div>

        <BillingListSkeleton />
      </div>
    </div>
  );
}
