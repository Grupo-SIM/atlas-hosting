"use client";

import { toBrl } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

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
      <div className="text-muted-foreground text-xs">
        {isPending ? (
          <Skeleton className="h-3 w-16" />
        ) : selectedYears === 1 ? (
          "Primeiro ano"
        ) : (
          `${selectedYears} anos`
        )}
      </div>
      <h2 className="m-0 font-semibold text-2xl">
        {isPending ? <Skeleton className="h-8 w-32" /> : toBrl(price)}
      </h2>
      <Separator className="row-span-2 my-auto h-3/4" orientation="vertical" />
      <div className="text-right text-muted-foreground text-xs">Renovação</div>
      <span className="flex items-center text-muted-foreground">
        {isPending ? <Skeleton className="h-4 w-24" /> : toBrl(renewBRL)}
      </span>
    </div>
  );
}
