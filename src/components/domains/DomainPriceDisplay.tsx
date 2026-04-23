"use client";

import { Skeleton } from "../ui/skeleton";
import { toBrl } from "@/lib/utils";
import { Separator } from "../ui/separator";

interface DomainPriceDisplayProps {
  price: number;
  renewBRL: number;
  selectedYears: number;
  isPending: boolean;
}

export function DomainPriceDisplay({
  price,
  renewBRL,
  selectedYears,
  isPending,
}: DomainPriceDisplayProps) {
  return (
    <div className="grid grid-flow-col grid-cols-[auto_auto_auto] grid-rows-[auto_1fr] gap-x-3 gap-y-1">
      <div className="text-xs text-muted-foreground">
        {isPending ? (
          <Skeleton className="h-3 w-16" />
        ) : (
          selectedYears === 1 ? "Primeiro ano" : `${selectedYears} anos`
        )}
      </div>
      <h2 className="m-0 text-2xl font-semibold">
        {isPending ? <Skeleton className="h-8 w-32" /> : toBrl(price)}
      </h2>
      <Separator orientation="vertical" className="row-span-2 my-auto h-3/4" />
      <div className="text-right text-xs text-muted-foreground">Renovação</div>
      <span className="flex items-center text-muted-foreground">
        {isPending ? <Skeleton className="h-4 w-24" /> : toBrl(renewBRL)}
      </span>
    </div>
  );
}
