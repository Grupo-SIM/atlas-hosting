import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BillingListSkeleton() {
  return (
    <div className="space-y-4 mt-8 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="border-none shadow-sm bg-card/50">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-7 w-24 ml-auto" />
                <Skeleton className="h-3 w-16 ml-auto" />
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
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-6xl space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <Skeleton className="h-10 w-[400px] rounded-lg" />
            <Skeleton className="h-10 w-[300px] rounded-lg" />
          </div>
        </div>

        <BillingListSkeleton />
      </div>
    </div>
  );
}
