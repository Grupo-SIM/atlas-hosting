"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={`skeleton-row-${i}`} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

export function TableLoadingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-80" />
        <div className="flex space-x-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      
      {/* Table skeleton */}
      <div className="rounded-md border">
        <div className="border-b">
          <div className="flex items-center space-x-4 p-4">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={`header-${i}`} className="h-6 w-24" />
            ))}
          </div>
        </div>
        
        {Array.from({ length: 10 }, (_, i) => (
          <div key={`row-${i}`} className="border-b last:border-b-0">
            <div className="flex items-center space-x-4 p-4">
              {Array.from({ length: 5 }, (_, j) => (
                <Skeleton key={`cell-${i}-${j}`} className="h-5 w-20" />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <div className="flex space-x-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={`pagination-${i}`} className="h-8 w-8" />
          ))}
        </div>
      </div>
    </div>
  );
}
