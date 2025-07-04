import { range } from "lodash";
import AuthLayout from "./(auth)/layout";
import "./loading.css";

export default function Loading() {
  return (
    <div className="h-screen w-screen relative bg-background">
      {/* Skeleton Background */}
      <div className="w-full h-full">
        {/* Header/Navigation Skeleton */}
        <div className="w-full h-16 bg-background border-b animate-pulse">
          <div className="flex items-center justify-between px-6 h-full">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-muted-foreground rounded" />
              <div className="w-32 h-6 bg-muted-foreground rounded" />
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-24 h-8 bg-muted-foreground rounded" />
              <div className="w-8 h-8 bg-muted-foreground rounded-full" />
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Sidebar Skeleton */}
          <div className="w-18 bg-background border-r p-4 animate-pulse">
            <div className="space-y-3">
              {range(8).map((i) => (
                <div
                  key={i}
                  className="w-full h-10 bg-muted-foreground rounded"
                />
              ))}
            </div>
          </div>

          {/* Main Content Area Skeleton */}
          <div className="flex-1 p-6 animate-pulse max-w-[1200px] mx-auto">
            {/* Page Title */}
            <div className="w-48 h-8 bg-muted-foreground rounded mb-6" />

            {/* Content Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-background border rounded-lg p-4 space-y-3">
                <div className="w-3/4 h-5 bg-muted-foreground rounded" />
                <div className="w-full h-4 bg-muted-foreground rounded" />
                <div className="w-2/3 h-4 bg-muted-foreground rounded" />
              </div>
              <div className="bg-background border rounded-lg p-4 space-y-3">
                <div className="w-5/6 h-5 bg-muted-foreground rounded" />
                <div className="w-full h-4 bg-muted-foreground rounded" />
                <div className="w-3/4 h-4 bg-muted-foreground rounded" />
              </div>
              <div className="bg-background border rounded-lg p-4 space-y-3">
                <div className="w-2/3 h-5 bg-muted-foreground rounded" />
                <div className="w-full h-4 bg-muted-foreground rounded" />
                <div className="w-4/5 h-4 bg-muted-foreground rounded" />
              </div>
            </div>

            {/* Table/List Skeleton */}
            <div className="bg-background border rounded-lg overflow-hidden">
              <div className="border-b p-4">
                <div className="w-32 h-6 bg-muted-foreground rounded" />
              </div>
              <div className="divide-y">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 flex items-center space-x-4">
                    <div className="w-10 h-10 bg-muted-foreground rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="w-3/4 h-4 bg-muted-foreground rounded" />
                      <div className="w-1/2 h-3 bg-muted-foreground rounded" />
                    </div>
                    <div className="w-20 h-8 bg-muted-foreground rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loader overlay - absolute on top */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
        <span className="block w-4 h-4 shadow-[0_30px,0_-30px] rounded bg-current text-foreground relative translate-y-[30px] box-border my-[-50px] mx-auto before:content-[''] before:box-border before:w-4 before:h-4 before:shadow-[0_30px,0_-30px] before:rounded before:bg-current before:text-foreground before:absolute before:left-[30px] before:top-0 after:content-[''] after:box-border after:w-4 after:h-4 after:shadow-[0_30px,0_-30px] after:rounded after:bg-current after:text-foreground after:absolute after:left-[60px] after:top-0 animate-[animloader_2s_easeInOutCubic_infinite] after:delay-[400ms] before:animate-[animloader_2s_0.2s_easeInOutCubic_infinite] after:animate-[animloader_2s_0.2s_easeInOutCubic_infinite]" />
      </div>
    </div>
  );
}
