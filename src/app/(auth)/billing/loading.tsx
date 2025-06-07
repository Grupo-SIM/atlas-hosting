import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import clsx from "clsx";
import { range } from "lodash";

export default async function BillingPage() {
  return (
    <div className="flex h-full w-full flex-col">
      <main className="flex-grow container mx-auto py-8 px-4 md:px-6 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Minhas Faturas</h1>
        </div>
        <div className="space-y-6">
          {range(4).map((i) => (
            <Card key={i} className="overflow-hidden shadow-md">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 !py-4 !px-6 bg-muted/50 sm:items-center">
                <div>
                  <CardTitle className="text-2xl font-semibold">
                    <Skeleton className="w-48 h-[1em]" />
                  </CardTitle>
                </div>
                <Skeleton className="w-24 h-[1em]" />
              </CardHeader>
              <CardContent className="pt-4">
                <div
                  className={clsx([
                    "grid gap-3 sm:grid-cols-2 text-sm items-center md:grid-cols-4",
                  ])}
                >
                  <div>
                    <Skeleton className="w-14 h-[1em]" />
                  </div>
                  <div>
                    <Skeleton className="w-14 h-[1em]" />
                  </div>
                  <div>
                    <Skeleton className="w-14 h-[1em]" />
                  </div>
                  <div>
                    <Skeleton className="w-18 h-[1em]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
